// ===================== AUDIÊNCIA =====================
const REVIRAVOLTAS=[
  c=>({t:'A testemunha-chave mudou a versão',p:'Na véspera da audiência, a principal testemunha contou uma história diferente.',
    o:[{t:'Investigar o motivo',d:'60% de anular a penalidade · −10 de energia',ch:.6,ok:0,fail:-10,en:-10},{t:'Seguir em frente',d:'Aceitar a perda',fixo:-10}]}),
  c=>({t:'Documento novo da parte contrária',p:'O adversário juntou um documento que você não conhecia.',
    o:[{t:'Contestar na hora',d:'Teste de Análise',ch:clamp(sig((S.skills.analise-c.d)/10),.05,.95),ok:8,fail:-8},{t:'Aceitar o documento',d:'Perda pequena e segura',fixo:-4}]}),
  c=>({t:'Testemunha surpresa',p:'Uma pessoa procurou o escritório dizendo que viu tudo e quer depor a seu favor.',
    o:[{t:'Arrolar a testemunha',d:'Ela pode se contradizer',ch:.7,ok:10,fail:-6},{t:'Dispensar',d:'Sem risco',fixo:0}]}),
  c=>({t:'A imprensa descobriu o caso',p:'Repórteres estão na porta do fórum pedindo uma declaração.',
    o:[{t:'Dar entrevista',d:'Teste de Oratória · sucesso também dá +1 de prestígio',ch:clamp(sig((S.skills.oratoria-c.d+5)/10),.05,.95),ok:6,fail:-6,prest:1},{t:'Ficar em silêncio',d:'Sem risco',fixo:0}]}),
];
async function reviravolta(c){
  const ev=pick(REVIRAVOLTAS)(c);
  const v=await modal(`<span class="label">Reviravolta · ${esc(c.titulo)}</span><h2>${ev.t}</h2><p>${ev.p}</p>
    <div class="opts">${ev.o.map((o,i)=>`<button class="opt" data-mv="${i}"><span>${o.t}</span><b class="num">${o.ch!==undefined?pct(o.ch):sgn(o.fixo)}</b><small>${o.d}${o.ch!==undefined?` · sucesso ${sgn(o.ok)} · falha ${sgn(o.fail)}`:''}</small></button>`).join('')}</div>`,[]);
  const o=ev.o[+v];
  const meia=v=>v<0&&tem('analise',1)?v/2:v;
  if(o.ch===undefined){ c.mod+=meia(o.fixo); return; }
  if(o.en) S.energia=clamp(S.energia+o.en,0,100);
  const ok=await rolar(o.t,ev.p,o.ch,'Deu certo','Não funcionou');
  c.mod+= ok?o.ok:meia(o.fail); if(ok&&o.prest) S.prest=clamp(S.prest+o.prest,0,100);
}
async function momentoDecisivo(c){
  const dm=c.d+10*(c.inst-1);
  const orat=S.skills.oratoria+(S.traits.includes('orador')?8:0)+(tem('oratoria',2)?10:0);
  const doc=Math.max(S.skills.pesquisa,S.skills.analise);
  const o=[
    {t:'Pressionar a contradição',sk:`Oratória ${Math.round(orat)} vs ${dm}`,ch:clamp(sig((orat-dm)/10),.05,.95),ok:12,fail:-8},
    {t:'Pedir a juntada de um registro',sk:`Pesquisa/Análise ${Math.round(doc)} vs ${dm-12}`,ch:clamp(sig((doc-dm+12)/10),.05,.95),ok:6,fail:-2},
    {t:'Não arriscar',sk:'Sem teste',fixo:0},
  ];
  const v=await modal(`<span class="label">Momento decisivo · ${esc(c.titulo)}</span><h2>A testemunha hesita</h2>
    <p>A testemunha da outra parte hesita ao responder sobre um detalhe importante. O que você faz?</p>
    <p class="num" style="font-size:12px;color:var(--muted)">${c.fase?'Chance de condenação':c.assistido?'Chance de êxito':'Chance de vitória'} agora: ${pct((c.fase?calcCondenacao(c):c.assistido?calcDefesa(c):calcChance(c)).ch)}</p>
    <div class="opts">${o.map((x,i)=>`<button class="opt" data-mv="${i}"><span>${x.t}</span><b class="num">${x.fixo!==undefined?'±0':pct(x.ch)}</b><small>${x.sk}${x.fixo===undefined?` · sucesso ${sgn(x.ok)} · falha ${sgn(x.fail)}`:''}</small></button>`).join('')}</div>`,[]);
  const x=o[+v]; if(x.fixo!==undefined) return;
  const ok=await rolar(x.t,'A sala inteira espera a resposta.',x.ch,'Ponto para você','Saiu pela culatra');
  c.mod+= ok?x.ok:x.fail;
}
function ganharXp(c,mult){
  const w=AREAS[c.area].skills;
  for(const k in w){ S.skills[k]=clamp(S.skills[k]+w[k]*4*RAR[c.rar].xp*mult*(1-S.skills[k]/110),0,100); }
}
async function audiencia(c){
  if(Math.random()<.3) await reviravolta(c);
  await momentoDecisivo(c);
  const cc=calcChance(c), ch=cc.ch, r=Math.random();
  const res = r<=ch*.15?'historica': r<=ch?'vitoria': (r>.95&&ch<.5)?'feia':'derrota';
  const win = res==='historica'||res==='vitoria';
  const E=ESTR[c.estrategia], R=RAR[c.rar];
  const nomes={historica:'Vitória histórica',vitoria:'Procedente',derrota:'Improcedente',feia:'Derrota feia'};
  // efeitos
  let dPrest=0, linhas=[];
  if(win){
    if(c.lado==='recorrido') dPrest=res==='historica'?2:1;
    else if(c.lado==='recorrente') dPrest=R.ganho+c.perdaOrig/2;
    else dPrest=R.ganho*(E.win||1)*(res==='historica'?2:1);
    S.vitorias++; S.estresse=clamp(S.estresse-5,0,100); ganharXp(c,1); cqVitoria(c,res); clienteVitoria(c);
  } else {
    if(c.lado==='recorrido') dPrest=-R.perda;
    else if(c.lado==='recorrente') dPrest=-R.perda/2;
    else dPrest=-R.perda*E.loss*(res==='feia'?1.5:1);
    S.derrotas++; S.estresse=clamp(S.estresse+8,0,100); ganharXp(c,1.5); clienteDerrota(c);
  }
  if(win&&tem('oratoria',3)&&RORD.indexOf(c.rar)>=2) dPrest+=1;
  S.prest=clamp(S.prest+dPrest,0,100);
  linhas.push(`<span class="${dPrest>=0?'hi':'lo'}">${sgn(dPrest)} de prestígio</span>`);
  let novaTese=null;
  if(win && RORD.indexOf(c.rar)>=2){ const pool=TESES[c.area].filter(([n])=>!S.teses.some(t=>t.nome===n));
    if(pool.length){ const [n,b]=pick(pool); novaTese={nome:n,bonus:b,area:c.area}; S.teses.push(novaTese);
      linhas.push(`Nova tese colecionável: <b>${n}</b> (+${b} em ${AREAS[c.area].nome})`);} }
  linhas.push(win?'Skills do caso evoluíram.':'Skills do caso evoluíram 50% mais (derrota ensina).');
  await modal(`<span class="label">Veredito · ${INST[c.inst]} · ${esc(c.titulo)}</span>
    <h2>${c.juizNome} vai decidir</h2>
    <p class="num">Chance final: <b class="${cls(ch)}">${pct(ch)}</b>${c.juri?' · júri':''}</p>
    ${htmlBalanca(ch,ch*.15)}
    <div class="verdict ${win?'hi':'lo'}" hidden>${nomes[res]}</div>
    <div class="res" hidden>${linhas.join('<br>')}</div>`,[{t:'Continuar',v:1,dis:true}],async box=>{
      await balanca(box,ch,r); box.querySelector('.verdict').hidden=false; box.querySelector('.res').hidden=false;
      const b=box.querySelector('[data-mi]'); b.disabled=false; b.focus();});
  addLog(`${win?'Vitória':'Derrota'} em “${c.titulo}” · ${INST[c.inst]} · chance ${pct(ch)} · ${sgn(dPrest)} prestígio.`, win?'g':'r');
  // escândalo por atalho
  if(c.apoios.atalho && Math.random()<.25+(80-S.integ)/200){
    S.prest=clamp(S.prest-12,0,100);
    await modal(`<h2 class="lo">Escândalo</h2><p>A imprensa descobriu o atalho antiético que você usou em “${esc(c.titulo)}”. Seu prestígio caiu 12 pontos.</p>`,[{t:'Continuar',v:1}]);
    addLog(`Escândalo: o atalho em “${c.titulo}” veio à tona. −12 prestígio.`,'r');
  }
  // recursos
  if(win){
    const podeApelar=c.inst<maxInst(c);
    const ca=podeApelar?chanceApeloAdv(c,res==='historica'):0;
    let apelou=false;
    if(podeApelar){
      apelou=await rolar('A outra parte vai recorrer?',`${ADV[c.adv].nome}. Base ${RAR[c.rar].nome} ${pct(RAR[c.rar].apelo)} ${ADV[c.adv].apelo>=0?'+':'−'} ${pct(Math.abs(ADV[c.adv].apelo))}${res==='historica'?' − 25% (vitória histórica)':''}.`,ca,'Recorreu','Não recorreu');
    }
    if(apelou){
      if(!c.retido){ S.aReceber+=c.hon; }
      criarRecurso(c,'recorrido',true);
      addLog(`A parte contrária recorreu de “${c.titulo}”. ${brl(c.hon)} retidos até o ${INST[c.inst+1]}.`);
    } else {
      if(c.retido) S.aReceber-=c.hon;
      S.caixa+=c.hon; S.u.honSemana+=c.hon; addLog(`Trânsito em julgado: ${brl(c.hon)} de honorários recebidos.`,'g'); pagarAssociados(c.hon);
    }
  } else {
    if(c.retido){ S.aReceber-=c.hon; addLog(`Decisão reformada: ${brl(c.hon)} retidos foram perdidos.`,'r'); }
    if(c.inst<maxInst(c)){
      const prox={...c,inst:c.inst+1,lado:'recorrente',prep:0,semana:0,apoios:{},mod:0,estrategia:'equilibrada'};
      const chP=calcChance(prox).ch, custas=Math.round(c.valor*(tem('negociacao',2)?.005:.01));
      const perdaOrig = c.lado==='recorrente'?c.perdaOrig:Math.abs(dPrest);
      const v=await modal(`<span class="label">${esc(c.titulo)}</span><h2>Recorrer ao ${INST[c.inst+1]}?</h2>
        <dl class="meta">
          <dt>Chance de reverter (sem preparação)</dt><dd class="num ${cls(chP)}">${pct(chP)}</dd>
          <dt>Custas do recurso (1% da causa)</dt><dd class="num">${brl(custas)}</dd>
          <dt>Duração</dt><dd>4 a 8 meses</dd>
          <dt>Se reverter</dt><dd class="hi">${brl(c.hon)} · ${sgn(RAR[c.rar].ganho+perdaOrig/2)} prestígio</dd>
          <dt>Se perder de novo</dt><dd class="lo">${sgn(-RAR[c.rar].perda/2)} prestígio</dd>
        </dl><p style="font-size:12px;color:var(--muted)">Você poderá preparar o recurso com blocos e apoios, como um caso novo.</p>`,
        [{t:'Aceitar a derrota',v:'nao',cls:'ghost'},{t:S.caixa<custas?'Caixa insuficiente':'Recorrer',v:'sim',dis:S.caixa<custas}]);
      if(v==='sim'){ S.caixa-=custas; criarRecurso(c,'recorrente',false,perdaOrig); addLog(`Você recorreu de “${c.titulo}” (custas ${brl(custas)}).`); }
    }
  }
}
async function antecipar(id){
  if(ocupado) return; const c=S.casos.find(x=>x.id===id); if(!c) return;
  const cc=calcChance(c);
  const v=await modal(`<span class="label">${esc(c.titulo)}</span><h2>Antecipar a audiência?</h2>
    <p>O julgamento acontece agora, com a chance atual. Você abre mão de ${c.prazo} ${c.prazo>1?'meses':'mês'} de preparação. Os blocos deste mês já colocados no caso contam e saem da sua agenda.</p>
    <p class="num">Chance atual: <b class="${cls(cc.ch)}">${pct(cc.ch)}</b></p>`,[{t:'Cancelar',v:0,cls:'ghost'},{t:'Ir para a audiência',v:1,cls:'brass'}]);
  if(!v) return;
  ocupado=true;
  try{
    let trab=c.semana||0; c.prep+=trab; c.semana=0;
    for(const k in c.apoios) if(c.apoios[k]===1){ trab+=APOIOS[k].blocos; c.apoios[k]=2; }
    S.disp-=trab;
    S.energia=clamp(S.energia-3.2*trab*(S.traits.includes('workaholic')?.7:1),0,100);
    S.estresse=clamp(S.estresse+2.2*trab*(S.traits.includes('ansioso')?1.25:1),0,100);
    S.casos=S.casos.filter(x=>x.id!==c.id);
    addLog(`Audiência antecipada em “${c.titulo}”.`);
    await audiencia(c);
    salvar();
  } finally { ocupado=false; render(); }
}
function criarRecurso(c,lado,retido,perdaOrig=0){
  S.casos.push({...c,id:++uid,inst:c.inst+1,lado,retido,perdaOrig:perdaOrig||c.perdaOrig,prep:0,semana:0,atraso:0,apoios:{},mod:0,estrategia:'equilibrada',prazo:rint(4,8),acordoFalhou:true});
}

