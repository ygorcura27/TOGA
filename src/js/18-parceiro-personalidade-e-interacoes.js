// ===================== PARCEIRO: PERSONALIDADE E INTERAÇÕES =====================
const PERS_PARC={
  ciume:{nome:'Ciúme',desc:'Reclama dos meses com muito trabalho (15 blocos ou mais), mas valoriza cada bloco de família.',mudar:0},
  ambicao:{nome:'Ambição',desc:'Fica feliz com o seu prestígio e se irrita quando falta dinheiro. Aceita mudar de cidade por uma promoção.',mudar:.2},
  lar:{nome:'Vida caseira',desc:'Precisa de mais tempo de família e resiste a mudanças de cidade.',mudar:-.3},
  aventura:{nome:'Espírito aventureiro',desc:'Lazer também conta como tempo juntos, viagens valem o dobro e mudar de cidade é fácil.',mudar:.3},
  independencia:{nome:'Independência',desc:'Sente menos a sua ausência, mas também se apega menos e pensa duas vezes antes de ter filhos.',mudar:.1},
  luxo:{nome:'Gosto por luxo',desc:'Custa R$ 600 a mais por mês, valoriza presentes caros e uma casa à altura.',mudar:0},
  juridico:{nome:'Mesma área (jurídica)',desc:'Dá conselhos em casa: +2 de chance nos casos enquanto a relação estiver boa.',mudar:0},
};
const workBlocos=()=>blocosUsados()-S.agenda.lazer-vidaBlocos();
function relSemana(P,fam){
  if(!P.pers) P.pers=pick(Object.keys(PERS_PARC));
  const p=P.pers, trab=workBlocos(); let d=fam*2.5-3.5+(S.vida.felicidade>70?1:0);
  if(p==='ciume'){ d+=fam*.5; if(trab>=15) d-=4; }
  if(p==='ambicao') d+=(S.prest-50)/25+(dinheiroPessoal()<10000?-2:0);
  if(p==='lar') d+=fam-1;
  if(p==='aventura') d+=S.agenda.lazer*2;
  if(p==='independencia') d=fam*1.5-1.5+(S.vida.felicidade>70?1:0);
  if(p==='luxo') d+=S.vida.moradia*1.5-2;
  if(P.distancia&&S.semana<P.distancia) d-=1;
  return d;
}
const chanceConversa=()=>clamp(sig(((S.skills.oratoria+S.skills.negociacao)/2-40)/10),.05,.95);
async function separar(P,motivo){ const V=S.vida;
  let txt={tempo:`${esc(P.nome)} decidiu terminar. Faltou tempo juntos: a agenda não teve espaço para a família.`,vaga:`${esc(P.nome)} aceitou a vaga em outra cidade e vocês terminaram.`,voce:`Você terminou com ${esc(P.nome)}.`}[motivo];
  if(P.status==='casado'){ const partilha=Math.max(0,Math.round(dinheiroPessoal()*.3)); pagarPessoal(partilha); txt+=` A partilha de bens do divórcio custou ${brl(partilha)}.`; }
  await modal(`<h2 class="lo">${P.status==='casado'?'Divórcio':'Fim do namoro'}</h2><p>${txt}</p>`,[{t:'Continuar',v:1}]);
  V.parceiro=null; V.felicidade=clamp(V.felicidade-(motivo==='voce'?10:20),0,100); S.estresse=clamp(S.estresse+10,0,100);
  for(const f of V.filhos) if(idadeFilho(f)<18) f.rel=clamp(f.rel-10,0,100);
  addLog(P.status==='casado'?`Divórcio de ${P.nome}.`:`Fim do namoro com ${P.nome}.`,'r');
}
async function eventoParceiro(P){ const V=S.vida, trab=workBlocos(), pn=esc(P.nome.split(' ')[0]); const evs=['aniversario','sogros'];
  if(trab>=14) evs.push('briga','briga'); if(P.pers==='aventura'||P.pers==='luxo') evs.push('viagem'); if(S.semana-P.desde>20) evs.push('emprego');
  const e=pick(evs);
  if(e==='briga'){ const ch=chanceConversa();
    const v=await modal(`<h2>Briga em casa</h2><p>${pn} diz que você só pensa em trabalho${P.pers==='ciume'?' e desconfia das noites no escritório':''}.</p><div class="opts">
      <button class="opt" data-mv="noite"><span>Pedir desculpas e reservar uma noite</span><b class="num">−1 bloco</b><small>Relação +6. Você perde 1 bloco no próximo mês.</small></button>
      <button class="opt" data-mv="fase"><span>Explicar que é uma fase</span><b class="num">${pct(ch)}</b><small>Usa Oratória e Negociação. Se der certo, fica tudo bem; se não, relação −10.</small></button></div>`,[]);
    if(v==='noite'){ P.rel=clamp(P.rel+6,0,100); V.falta=(V.falta||0)+1; addLog(`Você reservou uma noite para ${P.nome}.`,'g'); }
    else if(Math.random()<ch) addLog(`${P.nome} entendeu que é uma fase.`,'g'); else { P.rel=clamp(P.rel-10,0,100); addLog(`A briga com ${P.nome} piorou.`,'r'); } }
  if(e==='aniversario'){ const lx=P.pers==='luxo';
    const v=await modal(`<h2>${P.status==='casado'?'Aniversário de casamento':'Aniversário de namoro'}</h2><p>Hoje é uma data importante para vocês. O que você faz?</p><div class="opts">
      <button class="opt" data-mv="simples"><span>Jantar simples em casa</span><b class="num">${brl(300)}</b><small>Relação +${lx?1:4}</small></button>
      <button class="opt" data-mv="caro"><span>Presente e restaurante caro</span><b class="num">${brl(3000)}</b><small>Relação +${lx?16:10}</small></button>
      <button class="opt" data-mv="esqueci"><span>Esquecer a data</span><b class="num">±0</b><small>Relação −12</small></button></div>`,[]);
    if(v==='simples'){ pagarPessoal(300); P.rel+=lx?1:4; } else if(v==='caro'){ pagarPessoal(3000); P.rel+=lx?16:10; } else { P.rel-=12; addLog(`Você esqueceu a data com ${P.nome}.`,'r'); }
    P.rel=clamp(P.rel,0,100); }
  if(e==='sogros'){ const v=await modal(`<h2>Visita da família de ${pn}</h2><p>A família de ${pn} vem passar o fim de semana.</p>`,[{t:'Trabalhar no fim de semana',v:0,cls:'ghost'},{t:'Receber a família (−1 bloco)',v:1,cls:'brass'}]);
    if(v){ P.rel=clamp(P.rel+5,0,100); V.falta=(V.falta||0)+1; } else P.rel=clamp(P.rel-(P.pers==='lar'?10:6),0,100); }
  if(e==='viagem'){ const v=await modal(`<h2>${pn} quer viajar</h2><p>Um mês de férias juntos, longe do trabalho.</p>`,[{t:'Agora não dá',v:0,cls:'ghost'},{t:`Viajar · ${brl(6000)} e −4 blocos`,v:1,cls:'brass',dis:dinheiroPessoal()<6000}]);
    if(v){ pagarPessoal(6000); V.falta=(V.falta||0)+4; P.rel=clamp(P.rel+(P.pers==='aventura'?25:15),0,100); V.felicidade=clamp(V.felicidade+15,0,100); S.estresse=clamp(S.estresse-25,0,100); addLog(`Viagem de férias com ${P.nome}.`,'g'); }
    else P.rel=clamp(P.rel-(P.pers==='aventura'?8:4),0,100); }
  if(e==='emprego'){ const cid=pick(Object.values(CIDADES)).nome, ch=clamp(P.rel/100+(P.pers==='ambicao'?-.2:0),.05,.95);
    const v=await modal(`<h2>${pn} recebeu uma proposta de emprego</h2><p>Uma ótima vaga em ${cid}, na área de ${P.prof}.</p><div class="opts">
      <button class="opt" data-mv="apoiar"><span>Apoiar a decisão e namorar à distância</span><b class="num">+8</b><small>${pn} aceita a vaga. Felicidade −5 e, por 20 meses, a relação cai 1 ponto a mais por mês.</small></button>
      <button class="opt" data-mv="pedir"><span>Pedir para ficar</span><b class="num">${pct(ch)}</b><small>Se ${pn} recusar a vaga, relação −5. Se aceitar, vocês terminam.</small></button></div>`,[]);
    if(v==='apoiar'){ P.rel=clamp(P.rel+8,0,100); P.distancia=S.semana+20; V.felicidade=clamp(V.felicidade-5,0,100); addLog(`${P.nome} aceitou uma vaga em ${cid}. Relação à distância.`); }
    else if(Math.random()<ch){ P.rel=clamp(P.rel-5,0,100); addLog(`${P.nome} recusou a vaga para ficar.`); }
    else await separar(P,'vaga'); }
}
async function acaoParceiro(tipo){ const V=S.vida, P=V.parceiro; if(!P||ocupado) return; V.acoes=V.acoes||{}; if(V.acoes[tipo]===S.semana) return;
  ocupado=true;
  try{ V.acoes[tipo]=S.semana;
    if(tipo==='jantar'){ pagarPessoal(400); P.rel+=P.pers==='luxo'?9:6; addLog(`Jantar a dois com ${P.nome}.`,'g'); }
    if(tipo==='viagem'){ pagarPessoal(4000); V.falta=(V.falta||0)+2; P.rel+=P.pers==='aventura'?28:15; V.felicidade=clamp(V.felicidade+12,0,100); S.estresse=clamp(S.estresse-15,0,100); addLog(`Fim de semana de viagem com ${P.nome}.`,'g'); }
    if(tipo==='conversa'){ const ok=await rolar('Conversa sobre a relação','Oratória e Negociação contam. Vocês sentam para falar com calma.',chanceConversa(),'Vocês se entenderam','Piorou');
      P.rel+=ok?15:-5; }
    if(tipo==='casar'){ const ch=chanceCasar();
      const ok=await rolar('Pedido de casamento',`A festa custa ${brl(30000)}.`,ch,'Sim!','Ainda não');
      if(ok){ pagarPessoal(30000); P.status='casado'; P.rel+=10; V.felicidade=clamp(V.felicidade+20,0,100); addLog(`Você se casou com ${P.nome}.`,'g'); } else P.rel-=10; }
    if(tipo==='filho'){ const ch=clamp(P.rel/100-(P.pers==='independencia'?.25:0)+(P.pers==='lar'?.1:0),.05,.95);
      const ok=await rolar('Conversa sobre ter um filho','Cada filho custa cerca de R$ 400 por mês até os 22 anos.',ch,'Vamos ter um filho','Agora não');
      if(ok){ V.gravidez=S.semana+9; addLog('Vocês vão ter um bebê daqui a 9 meses.','g'); } else P.rel-=3; }
    if(tipo==='terminar'){ const v=await modal(`<h2>Terminar com ${esc(P.nome)}?</h2><p>${P.status==='casado'?'O divórcio leva 30% do seu dinheiro pessoal na partilha.':'O namoro acaba.'} Filhos pequenos sentem a separação.</p>`,[{t:'Cancelar',v:0,cls:'ghost'},{t:'Terminar',v:1}]);
      if(v) await separar(P,'voce'); }
    if(V.parceiro) V.parceiro.rel=clamp(V.parceiro.rel,0,100);
    salvar();
  } finally { ocupado=false; render(); }
}
const chanceCasar=()=>{ const P=S.vida.parceiro; return clamp(P.rel/100+(P.pers==='ambicao'&&S.prest>50?.1:0)-(P.pers==='independencia'?.1:0),.05,.95); };
function acoesParceiroHtml(){ const V=S.vida, P=V.parceiro, A=V.acoes||{}, f=t=>A[t]===S.semana, din=dinheiroPessoal();
  const b=(t,l,dis)=>`<button class="chip" data-act="pAcao" data-v="${t}" ${dis||f(t)?'disabled':''}>${l}</button>`;
  return `<span class="label">Ações neste mês</span><div class="chips">
    ${b('jantar','Jantar a dois · '+brl(400),din<400)}
    ${b('viagem','Fim de semana fora · '+brl(4000)+' · −2 blocos',din<4000)}
    ${P.rel<60?b('conversa','Conversar sobre a relação · '+pct(chanceConversa())):''}
    ${P.status==='namoro'?b('casar','Pedir em casamento · '+brl(30000)+' · '+pct(chanceCasar()),din<30000):''}
    ${P.status==='casado'&&!V.gravidez&&V.filhos.length<4&&idade()<48?b('filho','Propor ter um filho'):''}
    <button class="chip bad" data-act="pAcao" data-v="terminar">Terminar</button></div>`; }

