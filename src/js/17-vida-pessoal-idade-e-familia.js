// ===================== VIDA PESSOAL, IDADE E FAMÍLIA =====================
const ANO=12; // rodadas (meses) por ano de vida
const CARROS=[{nome:'Sem carro (transporte público)',preco:0,fel:0,prest:0},{nome:'Carro popular',preco:60000,fel:.5,prest:0},{nome:'Sedã executivo',preco:150000,fel:1,prest:1},{nome:'SUV de luxo',preco:400000,fel:1.5,prest:2},{nome:'Esportivo importado',preco:1200000,fel:2.5,prest:4}];
const manutCarro=()=>Math.round(CARROS[S.vida.carro||0].preco*.0015/10)*10;
const MORADIAS=[{nome:'Apartamento alugado',preco:0,fel:0},{nome:'Apartamento próprio',preco:250000,fel:1},{nome:'Casa com quintal',preco:900000,fel:2},{nome:'Cobertura',preco:3000000,fel:3}];
const AREAS_PROF=['medicina','engenharia','ensino','arquitetura','jornalismo','negócios próprios','serviço público','advocacia','tecnologia','artes'];
function vidaInicial(idade0=25){ return {idade0,semana0:S?S.semana:1,saude:85,felicidade:60,parceiro:null,filhos:[],moradia:0,carro:0,inv:invInicial(),alugueis:[],gravidez:null,doente:0,falta:0,geracao:1,legado:[],ultimoAniv:idade0}; }
const idade=()=>Math.floor(S.vida.idade0+(S.semana-S.vida.semana0)/ANO);
const idadeFilho=f=>Math.floor((S.semana-f.nasc)/ANO);
const vidaBlocos=()=>(S.agenda.familia||0)+(S.agenda.saude||0);
const sobrenome=()=>S.nome.trim().split(' ').slice(-1)[0];
const dinheiroPessoal=()=>S.carreira==='adv'?S.bolso:S.caixa;
function pagarPessoal(v){ if(S.carreira==='adv') S.bolso-=v; else S.caixa-=v; }
function patrimonio(){ return Math.round((S.carreira==='adv'?S.caixa+S.bolso:S.caixa)+MORADIAS[S.vida.moradia].preco+CARROS[S.vida.carro||0].preco*.7-saldoDivida()+totalInvest()+totalAlugueis()); }
function blocosPerdidos(){ const V=S.vida; if(!V) return 0; const n=(V.doente>0?7:0)+(V.falta||0)-((V.carro||0)>0?1:0); V.falta=0; return n; }
function bonusVida(add){ const V=S.vida; if(!V) return;
  if(V.parceiro&&V.parceiro.pers==='juridico'&&V.parceiro.rel>=50) add('Conselhos de casa (parceiro da área jurídica)',2);
  if(V.felicidade>80) add('Felicidade',3); if(V.felicidade<25) add('Infelicidade',-3); if(V.saude<40) add('Saúde frágil',-4); }
const temFamilia=()=>!!S.vida.parceiro||S.vida.filhos.length>0;
function rowsVida(free){
  return `<div class="row"><span class="name">${temFamilia()?'Família':'Vida social (conhecer pessoas)'}</span>${stepper('familia',0,S.agenda.familia||0,free)}</div>
          <div class="row"><span class="name">Academia e saúde</span>${stepper('saude',0,S.agenda.saude||0,free)}</div>`; }
function descCarreira(){ if(S.carreira==='academico') return nomeAcad(); if(S.carreira==='estudante') return 'Estudante de Direito'; return S.carreira==='juiz'?nomeCargo(S.j.cargo):S.carreira==='promotor'?fem(CARGOS_MP[S.p.cargo].nome):S.carreira==='defensor'?fem(CARGOS_DP[S.d.cargo].nome):(S.ex?'Advocacia (ex-'+S.ex.cargo.toLowerCase()+')':'Advocacia'); }
function resumoCarreira(){ if(S.carreira==='academico'||S.carreira==='estudante') return `${S.ac.pubs.length} publicações, índice ${S.ac.indice}`; return S.carreira==='juiz'?`${S.j.sentencas} sentenças, ${pct(taxaReforma())} reformadas`:S.carreira==='promotor'?`${S.p.condenacoes} condenações`:S.carreira==='defensor'?`${S.d.atendimentos} atendimentos, ${S.d.cartas} cartas de agradecimento`:`${S.vitorias} vitórias e ${S.derrotas} derrotas`; }

async function mudancaVida(cidade){
  const P=S.vida.parceiro; if(!P) return true;
  const ch=clamp(P.rel/100+.15+((PERS_PARC[P.pers]||{}).mudar||0),.05,.95), aceita=Math.random()<ch;
  if(aceita){ P.rel=clamp(P.rel-5,0,100); addLog(`${P.nome} topou a mudança para ${cidade}.`,'g'); return true; }
  const v=await modal(`<h2>${esc(P.nome)} não quer se mudar</h2><p>A promoção exige morar em ${cidade}, mas ${esc(P.nome)} trabalha com ${P.prof} aqui e não quer recomeçar do zero.</p>`,
    [{t:'Recusar a promoção',v:0,cls:'ghost'},{t:'Ir mesmo assim',v:1}]);
  if(!v){ addLog('Você recusou a promoção para não mudar de cidade.'); return false; }
  P.rel=clamp(P.rel-35,0,100); S.vida.felicidade=clamp(S.vida.felicidade-10,0,100); addLog(`Relacionamento à distância com ${P.nome}.`,'r'); return true;
}

async function semanaVida(){
  await semanaEpoca(); aplicarTetos(); semanaPolitica(); await semanaClientes();
  const V=S.vida, A=S.agenda, fam=A.familia||0, sau=A.saude||0, id=idade();
  // saúde e felicidade
  const ds=-Math.max(0,id-40)*.03-Math.max(0,S.estresse-60)/20-(S.energia<20?1:0)+Math.min(sau,4)*1.5+(V.felicidade>70?.5:0)+.3+(S.estresse<30?1:0);
  V.saude=clamp(V.saude+ds,0,100);
  S.estresse=clamp(S.estresse-sau*1.5,0,100);
  const df=(50-V.felicidade)*.08+A.lazer*1+(temFamilia()?fam*1:fam*.4)+(V.parceiro?V.parceiro.rel/100:0)+V.filhos.length*.3
    -(S.estresse>70?2:0)-(!V.parceiro&&id>=35?1:0)+MORADIAS[V.moradia].fel+CARROS[V.carro||0].fel;
  V.felicidade=clamp(V.felicidade+df,0,100);
  if(V.felicidade<25) S.estresse=clamp(S.estresse+3,0,100);
  // custos da família
  const custo=(V.parceiro&&V.parceiro.status==='casado'?300:0)+(V.parceiro&&V.parceiro.pers==='luxo'?600:0)+V.filhos.filter(f=>idadeFilho(f)<22).length*400+manutCarro();
  if(custo) pagarPessoal(custo);
  semanaDividas(); semanaInvest(); await semanaAmigos();
  // aniversário
  if(id>V.ultimoAniv){ V.ultimoAniv=id; addLog(`Você fez ${id} anos.`); }
  // relacionamento
  const P=V.parceiro;
  if(P){
    P.rel=clamp(P.rel+relSemana(P,fam),0,100);
    if(P.rel<12){
      await separar(P,'tempo');
    } else if(P.status==='namoro'&&P.rel>=75&&S.semana-P.desde>=20&&S.semana>=(P.pedidoEm||0)&&Math.random()<.03){
      P.pedidoEm=S.semana+30; // depois de tocar no assunto, só volta a ele bem mais tarde; o pedido fica sempre disponível no menu Vida
      const v=await modal(`<h2>Pedido de casamento?</h2><p>Vocês estão juntos há ${Math.round((S.semana-P.desde)/ANO*12)} meses e a relação está forte (${Math.round(P.rel)}). A festa custa ${brl(30000)}.</p>`,
        [{t:'Ainda não',v:0,cls:'ghost'},{t:'Casar',v:1,cls:'brass',dis:dinheiroPessoal()<30000}]);
      if(v){ pagarPessoal(30000); P.status='casado'; P.rel=clamp(P.rel+10,0,100); V.felicidade=clamp(V.felicidade+20,0,100); addLog(`Você se casou com ${P.nome}.`,'g'); }
      else P.rel=clamp(P.rel-5,0,100);
    } else if(P.status==='casado'&&!V.gravidez&&P.rel>=55&&V.filhos.length<4&&id<48&&Math.random()<.06){
      const v=await modal(`<h2>Aumentar a família?</h2><p>${esc(P.nome)} quer ter ${V.filhos.length?'mais um filho':'um filho'}. Cada filho custa cerca de ${brl(400)} por mês até os 22 anos e pede tempo de família na agenda.</p>`,
        [{t:'Agora não',v:0,cls:'ghost'},{t:'Vamos ter um filho',v:1,cls:'brass'}]);
      if(v){ V.gravidez=S.semana+9; addLog('Vocês vão ter um bebê daqui a 9 meses.','g'); } else P.rel=clamp(P.rel-4,0,100);
    }
  } else if(fam>0&&Math.random()<Math.min(.45,fam*.1)){
    const pg=S.genero==='m'?'f':'m', nome=nomeGenero(pg), prof=pick(AREAS_PROF), pers=pick(Object.keys(PERS_PARC));
    const v=await modal(`<h2>Você conheceu alguém</h2><p>${esc(nome)}, que trabalha com ${prof}, gostou da conversa e quer sair de novo.</p><p style="font-size:12.5px"><b>Personalidade: ${PERS_PARC[pers].nome}.</b> ${PERS_PARC[pers].desc}</p>`,[{t:'Não é o momento',v:0,cls:'ghost'},{t:'Começar a namorar',v:1,cls:'brass'}]);
    if(v){ V.parceiro={nome,prof,pers,genero:pg,rel:45,desde:S.semana,status:'namoro'}; V.felicidade=clamp(V.felicidade+10,0,100); addLog(`Você começou a namorar ${nome}.`,'g'); }
  }
  if(V.parceiro&&Math.random()<.12) await eventoParceiro(V.parceiro);
  // nascimento
  if(V.gravidez&&S.semana>=V.gravidez){
    const gf=Math.random()<.5?'m':'f', f={id:++uid,genero:gf,nome:pick(gf==='m'?PRIM_M:PRIM_F)+' '+sobrenome(),nasc:S.semana,rel:70,direito:false,decidiu:false}; V.filhos.push(f); V.gravidez=null;
    V.felicidade=clamp(V.felicidade+15,0,100);
    await modal(`<h2 class="hi">${esc(f.nome.split(' ')[0])} nasceu</h2><p>${f.genero==='f'?'Bem-vinda':'Bem-vindo'} à família. O bebê muda a rotina: tempo de família na agenda mantém a relação forte.</p>`,[{t:'Continuar',v:1,cls:'brass'}]);
    addLog(`Nasceu ${f.nome}.`,'g');
  }
  // filhos
  for(const f of V.filhos){ f.rel=clamp(f.rel+fam*2-1.5,0,100);
    if(idadeFilho(f)>=18&&!f.decidiu){ f.decidiu=true; f.direito=Math.random()<.25+f.rel/200;
      addLog(f.direito?`${f.nome} entrou na faculdade de Direito.`:`${f.nome} escolheu outra profissão.`, f.direito?'g':''); } }
  const escolares=V.filhos.filter(f=>{const a=idadeFilho(f); return a>=5&&a<=17;});
  if(escolares.length&&Math.random()<.08){ const f=pick(escolares), pn=f.nome.split(' ')[0];
    const v=await modal(`<h2>Dilema de família</h2><p>A apresentação de ${esc(pn)} na escola cai na mesma tarde de um compromisso importante de trabalho.</p>
      <div class="opts"><button class="opt" data-mv="ir"><span>Ir à apresentação</span><b class="num">−2 blocos</b><small>Relação com ${esc(pn)} +15 e felicidade +5. Você perde 2 blocos no próximo mês.</small></button>
      <button class="opt" data-mv="trab"><span>Ficar no trabalho</span><b class="num">±0</b><small>Relação com ${esc(pn)} −15 e felicidade −5.</small></button></div>`,[]);
    if(v==='ir'){ f.rel=clamp(f.rel+15,0,100); V.felicidade=clamp(V.felicidade+5,0,100); V.falta=(V.falta||0)+2; addLog(`Você foi à apresentação de ${pn}.`,'g'); }
    else { f.rel=clamp(f.rel-15,0,100); V.felicidade=clamp(V.felicidade-5,0,100); addLog(`Você faltou à apresentação de ${pn}.`,'r'); } }
  // saúde: doença e morte
  if(V.doente>0) V.doente--;
  else if(V.saude<25&&Math.random()<.3){ V.doente=2; pagarPessoal(5000);
    await modal(`<h2 class="lo">Você adoeceu</h2><p>Anos de estresse cobraram a conta. Tratamento de ${brl(5000)} e dois meses com 7 blocos a menos.</p>`,[{t:'Continuar',v:1}]); addLog('Você adoeceu: 2 meses de tratamento.','r'); }
  if(id>=70&&Math.random()<.002*(1+(id-70)/3)*(1.5-V.saude/100)*ANO/10*5){ await fimVida('morte'); return true; }
  if(V.saude<=0&&Math.random()<.2){ await fimVida('morte'); return true; }
  if(['juiz','promotor','defensor'].includes(S.carreira)&&id>=75){ await fimVida('compulsoria'); return true; }
  return false;
}

async function fimVida(motivo){
  hallRegistrar(motivo);
  const V=S.vida, pat=patrimonio(), id=idade();
  const herd=V.filhos.filter(f=>idadeFilho(f)>=22&&f.rel>=40);
  const txt={morte:`${S.nome} morreu aos ${id} anos.`,compulsoria:`Aos ${id} anos, ${S.nome} chegou à aposentadoria compulsória.`,aposentadoria:`${S.nome} se aposentou aos ${id} anos.`}[motivo];
  const reg={nome:S.nome,geracao:V.geracao,carreira:descCarreira(),resumo:resumoCarreira(),idade:id,patrimonio:pat};
  const legado=[...V.legado,reg];
  const v=await modal(`<span class="label">Legado · ${V.geracao}ª geração</span><h2>${esc(txt)}</h2>
    <dl class="meta"><dt>Carreira</dt><dd>${reg.carreira}</dd><dt>Resultado</dt><dd>${reg.resumo}</dd><dt>Prestígio final</dt><dd class="num">${Math.round(S.prest)}</dd>
      <dt>Patrimônio</dt><dd class="num">${brl(pat)}</dd><dt>Família</dt><dd>${V.parceiro?(V.parceiro.status==='casado'?'casamento com ':'namoro com ')+esc(V.parceiro.nome):'sem parceiro'} · ${V.filhos.length} filho(s)</dd></dl>
    ${herd.length?`<p>Quem continua a história da família? O herdeiro recebe metade do patrimônio, o sobrenome famoso e parte das skills.</p>
      <div class="opts">${herd.map(f=>`<button class="opt" data-mv="${f.id}"><span>${esc(f.nome)}</span><b class="num">${idadeFilho(f)} anos</b><small>Relação ${Math.round(f.rel)}${f.direito?' · estudou Direito: começa com skills melhores':''}</small></button>`).join('')}</div>`
      :'<p style="color:var(--muted)">Nenhum filho adulto com boa relação para continuar a dinastia.</p>'}`,[{t:'Encerrar a dinastia',v:'fim',cls:'ghost'}]);
  if(!herd.length||v==='fim'||!v){ S=null; apagarSave(); return; }
  const f=herd.find(x=>String(x.id)===v);
  const car=await modal(`<h2>Que carreira ${esc(f.nome.split(' ')[0])} vai seguir?</h2>`,
    [{t:'Advocacia',v:'adv'},{t:'Juiz',v:'juiz'},{t:'Promotor',v:'promotor'},{t:'Defensor',v:'defensor'}]);
  herdeiro(f,car||'adv',pat,legado);
}
function herdeiro(f,car,pat,legado){
  const old=S, cid=['juiz','promotor','defensor'].includes(old.carreira)?comarcaAtual():old.sede, traits=[old.traits[0],pick(Object.keys(TRAITS).filter(t=>t!==old.traits[0]))];
  novoJogo(f.nome,old.espec,traits,cid); S.genero=f.genero||pick(['m','f']); S.cq=old.cq||cqInicial(); S.tut={off:true,t:{}};
  const V=S.vida; V.idade0=idadeFilho(f)+0; V.ultimoAniv=V.idade0; V.geracao=old.vida.geracao+1; V.legado=legado; V.moradia=old.vida.moradia;
  const herança=Math.max(0,Math.round((pat-MORADIAS[old.vida.moradia].preco)*.5));
  for(const k in S.skills) S.skills[k]=clamp(S.skills[k]+Math.max(0,old.skills[k]-25)*(f.direito?.3:.15),0,100);
  S.prest=30; S.caixa+=Math.round(herança*.5); S.bolso+=Math.round(herança*.5);
  if(car==='juiz'){ iniciarMagistratura(cid,old.espec); } else if(car==='promotor') iniciarMP(cid); else if(car==='defensor') iniciarDP(cid);
  if(car!=='adv'){ S.caixa+=S.bolso; S.bolso=0; }
  S.log=[]; addLog(`${f.nome}, ${V.idade0} anos, ${V.geracao}ª geração da família, começa a carreira com o sobrenome de ${old.nome} e herança de ${brl(Math.max(0,herança))}.`,'g');
  view='escritorio'; salvar();
}

// financiamento de casa e carro: entrada, prazo, juros (tabela Price) e aprovação pela renda
const FIN={
  moradia:{entrada:.2,prazos:[10,20,30],juros:.10,lista:()=>MORADIAS,venda:.8,campo:'moradia'},
  carro:{entrada:.3,prazos:[2,4,5],juros:.20,lista:()=>CARROS,venda:.7,campo:'carro'},
};
const saldoDivida=t=>(S.vida.dividas||[]).filter(d=>!t||d.tipo===t).reduce((a,d)=>a+d.saldo,0);
const comprometido=()=>(S.vida.dividas||[]).reduce((a,d)=>a+d.parcela,0);
function rendaSemanal(){
  if(['juiz','promotor','defensor'].includes(S.carreira)) return salarioAtual()+rendaPassiva();
  const rp=rendaPassiva();
  if(S.carreira==='adv') return mediaRetirada()+rp;
  if(S.carreira==='estudante') return MESADA+(S.fac&&S.fac.estagio?S.fac.estagio.bolsa*(S.agenda.estagio||0):0);
  const A=S.ac; return (A.curso&&A.curso.bolsa?A.curso.bolsa:0)+(A.doc?remuneracaoAula()*(S.agenda.docencia||0):0)+(A.roySemana||0); }
function parcelaDe(P,anos,j){ const r=Math.pow(1+j,1/ANO)-1, n=anos*ANO; return {r,n,parcela:Math.round(P*r/(1-Math.pow(1+r,-n)))}; }
const creditoTroca=tipo=>{ const F=FIN[tipo], at=S.vida[F.campo]||0; return F.lista()[at].preco*F.venda-saldoDivida(tipo); };
async function comprarBem(tipo,i){ const F=FIN[tipo], L=F.lista(), V=S.vida, at=V[F.campo]||0; if(i===at||!L[i]||ocupado) return;
  const credito=creditoTroca(tipo), custo=Math.round(L[i].preco-credito), din=dinheiroPessoal();
  if(custo<=0){ trocarBem(tipo,i,custo,null); return; }
  const entrada=Math.round(custo*F.entrada), fin=custo-entrada, renda=rendaSemanal(), lim=renda*.35-comprometido();
  const ops=F.prazos.map(a=>{ const x=parcelaDe(fin,a,F.juros); return {a,...x,total:x.parcela*x.n,ok:x.parcela<=lim&&din>=entrada}; });
  const v=await modal(`<h2>Comprar: ${L[i].nome}</h2>
    <p>Valor de ${brl(L[i].preco)}. ${credito>0?`O bem atual entra por ${brl(credito)}${saldoDivida(tipo)?', já descontada a dívida dele':''}.`:credito<0?`O bem atual ainda deve ${brl(-credito)} além do que vale.`:''} Falta pagar <b>${brl(custo)}</b>.</p>
    <div class="opts"><button class="opt" data-mv="vista" ${din<custo?'disabled':''}><span>À vista</span><b class="num">${brl(custo)}</b><small>${din<custo?'Dinheiro pessoal insuficiente':'Sem juros'}</small></button>
    ${ops.map(o=>`<button class="opt" data-mv="${o.a}" ${o.ok?'':'disabled'}><span>Financiar em ${o.a} anos</span><b class="num">${brl(o.parcela)}/mês</b><small>Entrada de ${brl(entrada)} (${pct(F.entrada)}) · juros de ${pct(F.juros)} ao ano · total pago ${brl(o.total+entrada)}${o.ok?'':din<entrada?' · falta dinheiro para a entrada':' · parcela acima de 35% da sua renda'}</small></button>`).join('')}</div>
    <p style="font-size:12px;color:var(--muted);margin:0">Renda considerada: ${brl(renda)} por mês. Parcelas que você já paga: ${brl(comprometido())} por mês. O banco aprova parcelas de até 35% da renda. Com 3 meses seguidos de dinheiro pessoal negativo, o banco retoma o bem.</p>`,
    [{t:'Cancelar',v:'',cls:'ghost'}]);
  if(!v) return;
  if(v==='vista') trocarBem(tipo,i,custo,null);
  else { const o=ops.find(x=>String(x.a)===v); trocarBem(tipo,i,entrada,{saldo:fin,parcela:o.parcela,restantes:o.n,r:o.r,anos:o.a}); } }
function trocarBem(tipo,i,pagar,div){ const F=FIN[tipo], L=F.lista(), V=S.vida, at=V[F.campo]||0;
  V.dividas=(V.dividas||[]).filter(d=>d.tipo!==tipo); // a dívida do bem antigo é quitada na troca
  pagarPessoal(pagar);
  if(div) V.dividas.push({id:++uid,tipo,nome:L[i].nome,...div});
  if(tipo==='carro'&&L[i].prest>L[at].prest) S.prest=clamp(S.prest+L[i].prest-L[at].prest,0,100);
  V.felicidade=clamp(V.felicidade+(i>at?(tipo==='moradia'?8:5):-5),0,100); V[F.campo]=i;
  addLog(i?`${div?'Financiou':'Comprou'}: ${L[i].nome}${div?` em ${div.anos} anos, ${brl(div.parcela)} por mês`:''}${pagar<0?`, e sobraram ${brl(-pagar)}`:''}.`:`Você vendeu ${tipo==='moradia'?'o imóvel':'o carro'}${pagar<0?' e recebeu '+brl(-pagar):''}.`,'g');
  salvar(); render(); }
function semanaDividas(){ const V=S.vida; if(!V.dividas||!V.dividas.length){ V.atraso=0; return; }
  for(const d of V.dividas){ pagarPessoal(d.parcela); d.saldo=Math.max(0,d.saldo*(1+d.r)-d.parcela); d.restantes--; }
  for(const d of V.dividas) if(d.restantes<=0||d.saldo<1) addLog(`Financiamento quitado: ${d.nome}.`,'g');
  V.dividas=V.dividas.filter(d=>d.restantes>0&&d.saldo>=1);
  if(dinheiroPessoal()<0&&V.dividas.length){ V.atraso=(V.atraso||0)+1; addLog(`Parcelas atrasadas: ${V.atraso} de 3 meses antes da retomada.`,'r');
    if(V.atraso>=3){ const d=V.dividas[0]; V[FIN[d.tipo].campo]=0; V.dividas=V.dividas.filter(x=>x!==d); V.atraso=0;
      S.prest=clamp(S.prest-3,0,100); V.felicidade=clamp(V.felicidade-15,0,100); addLog(`O banco retomou: ${d.nome}. −3 de prestígio.`,'r'); } }
  else V.atraso=0; }
function quitarDivida(id){ const V=S.vida, d=(V.dividas||[]).find(x=>x.id===id); if(!d||dinheiroPessoal()<d.saldo) return;
  pagarPessoal(Math.round(d.saldo)); V.dividas=V.dividas.filter(x=>x!==d); addLog(`Você quitou antecipado: ${d.nome}.`,'g'); salvar(); render(); }
function painelDividas(){ const V=S.vida, D=V.dividas||[]; if(!D.length) return '';
  return `<section class="panel"><div class="panel-head"><h2>Financiamentos</h2><span class="num">${brl(comprometido())}/mês</span></div>
    ${D.map(d=>`<div class="row" style="flex-wrap:wrap"><span class="name">${d.nome} · ${Math.ceil(d.restantes/ANO)} ano(s) restantes</span><span class="num">saldo ${brl(d.saldo)}</span>
      <button class="chip" data-act="quitar" data-id="${d.id}" ${dinheiroPessoal()<d.saldo?'disabled':''}>Quitar</button></div>`).join('')}
    ${V.atraso?`<p class="lo" style="margin:0;font-size:12.5px">Parcelas atrasadas há ${V.atraso} semana(s). Na terceira, o banco retoma o bem.</p>`:''}
    <p style="margin:0;font-size:12px;color:var(--muted)">As parcelas saem do dinheiro pessoal todo mês. Quitar antes evita os juros restantes.</p></section>`; }
function painelBens(){ const V=S.vida;
  const item=(tipo,i)=>{ const F=FIN[tipo], L=F.lista(), it=L[i], at=V[F.campo]||0, meu=i===at, c=Math.round(it.preco-creditoTroca(tipo));
    const extra=tipo==='moradia'?`${it.preco?'Valor '+brl(it.preco)+' · ':''}felicidade +${it.fel} por mês${it.preco?' · financiável em até 30 anos':''}`
      :it.preco?`Valor ${brl(it.preco)} · +1 bloco por mês (menos tempo no trânsito) · felicidade +${it.fel}/mês · manutenção ${brl(Math.round(it.preco*.0015/10)*10)}/mês${it.prest?` · +${it.prest} de prestígio`:''}`:'Sem custo, mas o trânsito come tempo da agenda';
    return `<button class="opt" data-act="${tipo}" data-v="${i}" ${meu?'disabled':''}><span>${it.nome}${meu?' · atual':''}</span><b class="num">${meu?'—':c>=0?brl(c):'+'+brl(-c)}</b><small>${extra}</small></button>`; };
  return `<section class="panel"><div class="panel-head"><h2>Casa e carro</h2><span class="label">à vista ou financiado</span></div>
    <span class="label">Moradia · o imóvel atual entra por 80% do valor, menos o que ainda deve</span>
    <div class="opts">${MORADIAS.map((x,i)=>[x.preco,i]).sort((a,b)=>a[0]-b[0]).map(([,i])=>item('moradia',i)).join('')}</div>
    <span class="label">Carro · o atual entra por 70% do valor, menos o que ainda deve</span>
    <div class="opts">${CARROS.map((x,i)=>[x.preco,i]).sort((a,b)=>a[0]-b[0]).map(([,i])=>item('carro',i)).join('')}</div>
  </section>`; }

async function aposentar(){ if(idade()<60||ocupado) return;
  const v=await modal(`<h2>Aposentar-se?</h2><p>Você encerra a carreira aos ${idade()} anos. Se houver filhos adultos, a história continua com um deles.</p>`,[{t:'Continuar trabalhando',v:0,cls:'ghost'},{t:'Aposentar',v:1}]);
  if(!v) return; ocupado=true; try{ await fimVida('aposentadoria'); } finally { ocupado=false; render(); } }

function renderVida(){ const V=S.vida, id=idade(), P=V.parceiro;
  const barra=(l,v,c)=>`<span>${l}</span><div class="bar"><i style="width:${v}%;background:${c}"></i></div><span class="num">${Math.round(v)}</span>`;
  app.innerHTML=`${header()}
  <div class="grid">
    <div class="col">
      <section class="panel"><div class="panel-head"><h2>${esc(S.nome)}</h2><span class="label">${id} anos · ${V.geracao}ª geração</span></div>
        <div class="vs">${barra('Saúde',V.saude,'var(--win)')}${barra('Felicidade',V.felicidade,'var(--brass)')}${barra('Energia',S.energia,'var(--b-case)')}${barra('Estresse',S.estresse,'var(--loss)')}</div>
        <dl class="meta"><dt>Moradia</dt><dd>${MORADIAS[V.moradia].nome}</dd><dt>Carro</dt><dd>${CARROS[V.carro||0].nome}</dd><dt>Dinheiro pessoal</dt><dd class="num">${brl(dinheiroPessoal())}</dd><dt>Patrimônio</dt><dd class="num">${brl(patrimonio())}</dd>
          ${V.doente>0?`<dt>Saúde</dt><dd class="lo">em tratamento (${V.doente} meses)</dd>`:''}
          <dt>Aposentadoria</dt><dd>${['juiz','promotor','defensor'].includes(S.carreira)?`compulsória aos 75 · faltam ${Math.max(0,75-id)} anos`:'quando quiser, a partir dos 60'}</dd></dl>
        <button class="btn ghost" data-act="aposentar" ${id<60?'disabled':''}>${id<60?`Aposentadoria a partir dos 60 (faltam ${60-id} anos)`:'Aposentar-se'}</button>
        <p style="margin:0;font-size:12px;color:var(--muted)">A vida corre mais rápido que a agenda: cada ${ANO} meses jogados são 1 ano de idade. Saúde cai com a idade e o estresse; academia recupera. Felicidade acima de 80 dá +3 nos casos; saúde abaixo de 40 tira 4.</p>
      </section>
      ${painelBens()}${painelEstilo()}${painelDividas()}
      <section class="panel"><div class="panel-head"><h2>Rotina</h2></div>
        <ul class="break">
          <li><span>${temFamilia()?'Família':'Vida social'}</span><span class="num">${S.agenda.familia||0} bloco(s)/mês</span></li>
          <li><span>Academia e saúde</span><span class="num">${S.agenda.saude||0} bloco(s)/mês</span></li>
          <li><span>Lazer</span><span class="num">${S.agenda.lazer} bloco(s) neste mês</span></li></ul>
        <p style="margin:0;font-size:12px;color:var(--muted)">Família e academia ficam na agenda todo mês até você mudar. Ajuste na tela principal da carreira.</p>
      </section>
    </div>
    <div class="col">
      <section class="panel"><div class="panel-head"><h2>Relacionamento</h2></div>
        ${P?`<dl class="meta"><dt>${P.status==='casado'?'Casamento com':'Namoro com'}</dt><dd>${esc(P.nome)}</dd><dt>Trabalha com</dt><dd>${P.prof}</dd><dt>Personalidade</dt><dd>${(PERS_PARC[P.pers]||{nome:'—'}).nome}</dd><dt>Juntos há</dt><dd>${Math.max(0,Math.round((S.semana-P.desde)/ANO*12))} meses</dd></dl>
          <div class="vs">${barra('Relação',P.rel,P.rel<30?'var(--loss)':'var(--brass)')}</div>
          <p style="margin:0;font-size:12.5px">${(PERS_PARC[P.pers]||{desc:''}).desc}</p>${acoesParceiroHtml()}
          <p style="margin:0;font-size:12px;color:var(--muted)">A relação cai 3,5 pontos por mês e sobe 2,5 por bloco de família. Abaixo de 12, termina. Promoções que mudam de cidade testam a relação.</p>`
          :`<p style="margin:0;font-size:12.5px">Sem relacionamento. Coloque blocos de <b>Vida social</b> na agenda para conhecer alguém.</p>`}
        ${V.gravidez?`<p class="hi" style="margin:0">Bebê a caminho: nasce em ${V.gravidez-S.semana} meses.</p>`:''}
      </section>
      <section class="panel"><div class="panel-head"><h2>Filhos</h2><span class="num">${V.filhos.length}</span></div>
        ${V.filhos.length?`<div class="cases">${V.filhos.map(f=>{const a=idadeFilho(f); return `<div class="panel" style="gap:6px"><b>${esc(f.nome)}</b><span class="label" style="text-transform:none;letter-spacing:0">${a} anos${a>=18?(f.direito?' · Direito':' · outra profissão'):a>=5?' · na escola':''}${a>=22&&f.rel>=40?' · pode herdar':''}</span><div class="vs">${barra('Relação',f.rel,f.rel<40?'var(--loss)':'var(--win)')}</div></div>`;}).join('')}</div>`
          :'<p style="margin:0;font-size:12.5px;color:var(--muted)">Ainda sem filhos. Casais com boa relação podem decidir aumentar a família.</p>'}
        <p style="margin:0;font-size:12px;color:var(--muted)">Filhos adultos (22+) com relação de pelo menos 40 podem continuar a sua história quando você se aposentar ou morrer.</p>
      </section>
      ${painelAmigos()}${painelInvest()}
      ${V.legado.length?`<section class="panel"><div class="panel-head"><h2>Árvore da família</h2></div><ul class="break">${V.legado.map(l=>`<li><span>${l.geracao}ª · ${esc(l.nome)} · ${l.carreira}</span><span class="num">${l.idade} anos</span></li>`).join('')}<li><span>${V.geracao}ª · ${esc(S.nome)} · ${descCarreira()}</span><span class="num">hoje</span></li></ul></section>`:''}
    </div>
  </div>`;
}

