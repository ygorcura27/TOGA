// ===================== DEFENSORIA PÚBLICA =====================
const CARGOS_DP=[
  {nome:'Defensor Público Substituto',gab:3,salario:26000},
  {nome:'Defensor Público',gab:5,salario:30000,req:{prest:35,atend:60,taxa:.50}},
  {nome:'Defensor de Classe Especial',gab:8,salario:35000,req:{prest:60,atend:200,taxa:.55}},
  {nome:'Defensor Público-Geral',gab:10,salario:39000,req:{prest:85,atend:400,taxa:.60}},
];
const TD=(titulo,area,adv,rars,presoP=0,juri=false,acordo=false)=>({titulo,area,adv,rars,presoP,juri,acordo});
const TEMPLATES_DP=[
  TD('Furto famélico','penal','estado',['comum'],.6,false,true),
  TD('Prisão preventiva prolongada','penal','estado',['comum','incomum'],1),
  TD('Tráfico: usuário ou traficante?','penal','estado',['incomum'],.8),
  TD('Roubo com reconhecimento duvidoso','penal','estado',['incomum','raro'],.7),
  TD('Homicídio: legítima defesa','penal','estado',['raro','epico'],.6,true),
  TD('Pensão alimentícia para os filhos','familia','pf',['comum'],0,false,true),
  TD('Divórcio de casal sem renda','familia','pf',['comum'],0,false,true),
  TD('Medida protetiva contra agressor','familia','pf',['comum','incomum']),
  TD('Guarda dos filhos','familia','pf',['incomum'],0,false,true),
  TD('Reconhecimento de paternidade','familia','pf',['incomum'],0,false,true),
  TD('Vaga em creche negada','civel','estado',['comum']),
  TD('Cobrança abusiva de banco','civel','empresa',['comum'],0,false,true),
  TD('Despejo de família','civel','pf',['comum','incomum'],0,false,true),
  TD('Remédio de alto custo negado','civel','estado',['incomum','raro']),
  TD('Usucapião de casa na comunidade','civel','estado',['incomum','raro']),
  TD('Ação coletiva por moradia','civel','estado',['epico','lendario']),
];
const novosDP=k=>7+CIDADES[k].pop+3*(S&&S.d?S.d.cargo:0);
const taxaDP=()=>{const t=S.d.vitorias+S.d.derrotas; return t?S.d.vitorias/t:0;};
function novoAssistido(){
  const D=S.d, C=CIDADES[D.comarca];
  const rar=sortearRaridade(C,[{comum:30},{comum:20},{raro:10,epico:4},{raro:15,epico:8,lendario:2}][D.cargo]);
  let pool=TEMPLATES_DP.filter(t=>t.rars.includes(rar)); if(!pool.length) pool=TEMPLATES_DP;
  const t=pickW(pool,x=>C.areas[x.area]||1), r=t.rars.includes(rar)?rar:t.rars[0], R=RAR[r];
  return {id:++uid,...t,rar:r,d:rint(R.d[0],R.d[1]),cidade:D.comarca,assistido:pick(NOMES),preso:Math.random()<t.presoP,
    prazo:rint(1,4),prep:0,semana:0,mod:0,inst:1,acordoFalhou:false,hcFalhou:false};
}
function iniciarDP(cid){
  S.carreira='defensor'; posse(); estruturaPub(); S.casos=[]; S.ofertas=[]; S.filiais=[]; S.aReceber=0;
  S.d={cargo:0,desde:S.semana,comarca:cid,casos:[],recursos:[],atendimentos:0,vitorias:0,derrotas:0,acordos:0,solturas:0,cartas:0};
  for(let i=0;i<10;i++) S.d.casos.push(novoAssistido());
}
function calcDefesa(c){
  const items=[]; const add=(l,v)=>{ if(v) items.push([l,v]); };
  const skill=skillCaso(c), n=c.prep+(c.semana||0);
  if(n) add(`Atendimento e preparo (${n} de ~${prepIdeal(c)} blocos ideais)`,Math.round(prepCaso(c,n)*10)/10); else add('Sem atendimento prévio',-8);
  if((c.inst||1)===1&&n&&n<MIN_ATD[c.rar]) add(`Atendimento insuficiente (mínimo ${MIN_ATD[c.rar]} blocos)`,-5*(MIN_ATD[c.rar]-n));
  if(S.d.cargo>=1) add('Experiência na Defensoria',2*S.d.cargo);
  if(S.energia<30) add('Cansaço',-10);
  if(S.estresse>70) add('Estresse alto',-8);
  if(S.traits.includes('orador')&&c.juri) add('Orador nato (júri)',5);
  if(S.traits.includes('ansioso')&&RORD.indexOf(c.rar)>=3) add('Ansiedade',-5);
  if(S.traits.includes('sortudo')) add('Sortudo',3);
  if(c.inst>1){ add(INST[c.inst],-10*(c.inst-1)); add('Decisão contrária',-10); }
  bonusPerks(c,add); add('Audiência',c.mod);
  const bonus=items.reduce((a,x)=>a+x[1],0);
  let ch=sig((skill+bonus-c.d)/12); if(c.juri) ch=.5+(ch-.5)*.8;
  return {skill,items,ch:clamp(ch,.05,.95)};
}
const chanceAcordoDP=()=>clamp(.45+S.skills.negociacao/200+(tem('negociacao',1)?.1:0)+(temSala('reuniao')?.1:0)+(S.traits.includes('carismatico')?.1:0),.05,.95);
const chanceHC=c=>clamp(sig(((S.skills.escrita+S.skills.penal)/2+prepBonus(c.prep+(c.semana||0))-c.d)/10),.05,.95);
function promoReqDP(){ const n=CARGOS_DP[S.d.cargo+1]; if(!n) return null; const r=n.req;
  return [...reqTempo(S.d,'defensor'),{l:`Reputação ${r.prest}`,ok:S.prest>=r.prest,v:Math.round(S.prest)},
          {l:`${r.atend} atendimentos adequados`,ok:S.d.atendimentos>=r.atend,v:S.d.atendimentos+(S.d.precarios?` (+${S.d.precarios} precários)`:'')},
          {l:`Taxa de êxito de ${pct(r.taxa)}`,ok:taxaDP()>=r.taxa,v:pct(taxaDP())}]; }
const promoOkDP=()=>{const r=promoReqDP(); return !!r&&r.every(x=>x.ok)&&!((S.d.dpgEm||0)>S.semana);};
const btnExonerar='<button class="btn ghost" data-act="exonerar">Pedir exoneração e advogar</button>';

function painelCarreiraDP(){ const D=S.d, C=CARGOS_DP[D.cargo], req=promoReqDP();
  return `<section class="panel"><div class="panel-head"><h2>Carreira</h2><span class="label">${fem(C.nome)}</span></div>
    <dl class="meta">
      <dt>Comarca</dt><dd>${CIDADES[D.comarca].nome}</dd>
      <dt>Salário</dt><dd class="num">${brl(C.salario)}/mês</dd>${linhaPol()}
      <dt>Atendimentos concluídos</dt><dd class="num">${D.atendimentos}</dd>
      <dt>Vitórias · derrotas</dt><dd class="num">${D.vitorias} · ${D.derrotas}</dd>
      <dt>Taxa de êxito</dt><dd class="num">${pct(taxaDP())}</dd>
      <dt>Acordos · solturas por HC</dt><dd class="num">${D.acordos} · ${D.solturas}</dd>
      <dt>Cartas de agradecimento</dt><dd class="num">${D.cartas}</dd>
    </dl>
    ${req?`<span class="label">Para ${fem(CARGOS_DP[D.cargo+1].nome)}</span>
      <ul class="break">${req.map(x=>`<li><span>${x.l}</span><span class="num ${x.ok?'hi':'lo'}">${x.ok?'✓ ':''}${x.v}</span></li>`).join('')}</ul>
      ${D.cargo===2?'<p style="margin:0;font-size:12px;color:var(--muted)">O Defensor Público-Geral sai de uma lista tríplice votada pela classe e é escolhido pelo governador.</p>':''}
      <button class="btn brass" data-act="promocao" ${promoOkDP()?'':'disabled'}>${(D.dpgEm||0)>S.semana?`Nova lista tríplice no mês ${D.dpgEm}`:'Pedir promoção a '+fem(CARGOS_DP[D.cargo+1].nome)}</button>`
      :'<p class="hi" style="margin:0">Você chefia a Defensoria Pública do estado.</p>'}
    ${btnExonerar}
  </section>`; }

function dpCard(c){ const R=RAR[c.rar], A=AREAS[c.area], cc=calcDefesa(c), n=c.prep+(c.semana||0);
  const podeHC=c.preso&&!c.hcFalhou, podeAc=c.acordo&&!c.acordoFalhou&&c.inst===1;
  return `<article class="folder" data-area="${A.nome}">
    <span class="stamp" style="color:var(--r-${c.rar})">${R.nome}</span>
    <h3>${esc(c.titulo)}</h3>
    <div class="chips">${c.preso?'<span class="tag" style="background:var(--loss);color:#fff">Assistido preso</span>':''}${c.preso&&!n?'<span class="tag" style="background:var(--warn);color:#fff">Sem atendimento</span>':''}${c.juri?'<span class="tag">Júri</span>':''}${c.inst>1?`<span class="tag">${INST[c.inst]}</span>`:''}</div>
    <dl class="meta">
      <dt>Assistido</dt><dd>${esc(c.assistido)}</dd>
      <dt>Parte contrária</dt><dd>${c.area==='penal'?'Ministério Público':c.adv==='estado'?'Poder público':ADV[c.adv].nome}</dd>
      <dt>Audiência</dt><dd>${c.prazo<=1?'<b class="mid">neste mês</b>':`em ${c.prazo} meses`}</dd>
      <dt>Ganhar · perder</dt><dd><span class="hi">${sgn(R.ganho/2)}</span> · <span class="lo">${sgn(-R.perda/2)}</span> reputação</dd>
    </dl>
    <div class="vs">
      <span>Dificuldade</span><div class="bar"><i style="width:${c.d}%;background:var(--loss)"></i></div><span class="num">${c.d}</span>
      <span>Sua skill</span><div class="bar"><i style="width:${cc.skill}%;background:var(--win)"></i></div><span class="num">${Math.round(cc.skill)}</span>
    </div>
    <div class="chance"><span class="label">Chance de êxito</span><strong class="${cls(cc.ch)}">${pct(cc.ch)}</strong></div>
    <details><summary>Ver detalhes da chance</summary><ul class="break">
      <li><span>Sua skill no caso</span><span class="num">${Math.round(cc.skill)}</span></li>
      ${cc.items.map(([l,v])=>`<li><span>${esc(l)}</span><span class="num ${v>0?'hi':'lo'}">${sgn(v)}</span></li>`).join('')}
      <li><span>Dificuldade</span><span class="num lo">−${c.d}</span></li>
      <li><b>Chance final (entre 5% e 95%)</b><b class="num">${pct(cc.ch)}</b></li></ul></details>
    <div class="ctl">
      <div class="row"><span class="name">Blocos de atendimento</span>${stepper('dp',c.id,c.semana||0,livres())}</div>
      ${podeHC||podeAc||c.preso||c.acordo?`<div class="actions">
        ${c.preso?`<button class="btn ghost" data-act="dpHC" data-id="${c.id}" ${podeHC&&livres()>=1?'':'disabled'} title="Gasta 1 bloco deste mês">${c.hcFalhou?'HC negado':'Habeas corpus · '+pct(chanceHC(c))}</button>`:''}
        ${c.acordo&&c.inst===1?`<button class="btn ghost" data-act="dpAcordo" data-id="${c.id}" ${podeAc?'':'disabled'}>${c.acordoFalhou?'Sem acordo':'Acordo · '+pct(chanceAcordoDP())}</button>`:''}
      </div>`:''}
    </div>
  </article>`; }

function renderDefensoria(){
  const D=S.d, gab=gabinete(), tot=D.casos.reduce((a,c)=>a+(c.semana||0),0), gabUsed=Math.min(gab,tot), pessoal=tot-gabUsed;
  const free=livres(), ordem=[...D.casos].sort((a,b)=>(a.prazo-b.prazo)||(b.preso-a.preso));
  const presosSem=D.casos.filter(c=>c.preso&&!(c.prep+(c.semana||0))).length, estaSemana=D.casos.filter(c=>c.prazo<=1).length;
  const cells=[]; const push=(k,n)=>{for(let i=0;i<n;i++) cells.push(k);};
  push('case',pessoal); push('estudo',S.agenda.estudo+acadBlocos()); push('lazer',S.agenda.lazer); push('familia',S.agenda.familia||0); push('saude',S.agenda.saude||0);
  push('descanso',Math.max(0,S.disp-pessoal-S.agenda.estudo-S.agenda.lazer-vidaBlocos()-acadBlocos())); push('off',BLOCOS-S.disp);
  let grid='';
  for(let r=0;r<3;r++) for(let d=0;d<7;d++) grid+=`<div class="blk ${cells[d*3+r]||'descanso'}"></div>`;
  const gabCells=Array.from({length:gab},(_,i)=>`<div class="blk ${i<gabUsed?'apoio':''}"></div>`).join('');
  app.innerHTML=`${header()}
  <div class="grid">
    <div class="col">
      <section class="panel">
        <div class="panel-head"><h2>Agenda do mês</h2><span class="num">${S.disp+gab-free}/${S.disp+gab} blocos</span></div>
        <div class="blocks">${grid}</div>
        <span class="label">Estagiários e servidores · ${gab} blocos por mês</span>
        <div class="blocks">${gabCells}</div>
        <div class="legend"><span><i style="background:var(--b-case)"></i>Atendimentos (você)</span><span><i style="background:var(--b-apoio)"></i>Atendimentos (equipe)</span><span><i style="background:var(--b-estudo)"></i>Estudo</span><span><i style="background:var(--b-lazer)"></i>Lazer</span><span><i style="background:var(--b-familia)"></i>Família</span><span><i style="background:var(--b-saude)"></i>Saúde</span><span><i style="background:var(--b-descanso)"></i>Descanso</span></div>
        <div class="rows">
          <div class="row"><span class="name">Atendimentos (ajuste em cada pasta)</span><span class="num">${tot}</span></div>
          <div class="row"><span class="name">Estudo</span><select id="estudo-skill" data-act="estudoSkill">${Object.entries(SKILLS).map(([k,v])=>`<option value="${k}" ${S.agenda.estudoSkill===k?'selected':''}>${v}</option>`).join('')}</select>${stepper('estudo',0,S.agenda.estudo,free)}</div>
          <div class="row"><span class="name">Lazer (reduz estresse)</span>${stepper('lazer',0,S.agenda.lazer,free)}</div>
          ${rowsVida(free)}${rowsAcad(free)}
        </div>
        <p class="label" style="margin:0">Todo caso vai à audiência na data marcada, com ou sem preparo. Assistido preso sem atendimento custa reputação extra se perder.</p>
        <button class="btn brass wide" data-act="fimSemana">Encerrar mês ▶</button>
      </section>
      ${painelCarreiraDP()}${painelSkills()}${painelDiario()}
    </div>
    <div class="col">
      <section class="panel" style="background:transparent;border:0;padding:0">
        <div class="panel-head"><h2>Assistidos</h2><span class="num">${D.casos.length} · ${estaSemana} neste mês · <span class="${presosSem?'lo':''}">${presosSem} presos sem atendimento</span></span></div>
        <p class="label" style="margin:0">Chegam ${novosDP(D.comarca)} por mês. Você não dá conta de todos: escolha onde cada bloco faz mais diferença.</p>
        <div class="cases">${ordem.map(dpCard).join('')}</div>
      </section>
      ${D.recursos.length?`<section class="panel"><div class="panel-head"><h2>Recursos no tribunal</h2><span class="num">${D.recursos.length}</span></div>
        <ul class="break">${D.recursos.map(r=>`<li><span>${esc(r.titulo)} · ${r.semanas} meses</span><span class="num ${cls(r.ch)}">${pct(r.ch)} de reverter</span></li>`).join('')}</ul></section>`:''}
    </div>
  </div>`;
}

function resultadoDP(c,ok){
  const D=S.d, R=RAR[c.rar]; let d;
  // só conta para a promoção o atendimento adequado (com o mínimo de blocos para a complexidade); o precário rende metade da reputação
  const adequado=(c.prep||0)>=MIN_ATD[c.rar]; if(adequado) D.atendimentos++; else D.precarios=(D.precarios||0)+1;
  if(ok){ d=(R.ganho+(tem('oratoria',3)&&RORD.indexOf(c.rar)>=2?1:0))*(adequado?.5:.25); D.vitorias++; if(c.preso) D.cartas++; }
  else { d=-R.perda/2-(c.preso&&!c.prep?.5:0); D.derrotas++; }
  S.prest=clamp(S.prest+d,0,100); ganharXp(c,(ok?1:1.5)*.5);
  return d;
}
async function julgamentoDP(c){
  const D=S.d, R=RAR[c.rar];
  await momentoDecisivo(c);
  const ch=calcDefesa(c).ch, r=Math.random(), ok=r<=ch, d=resultadoDP(c,ok);
  await modal(`<span class="label">Audiência · ${esc(c.titulo)}</span><h2>${c.juri?'O júri vai decidir':'O juiz vai decidir'}</h2>
    <p class="num">Chance de êxito: <b class="${cls(ch)}">${pct(ch)}</b></p>
    ${htmlBalanca(ch,0,'êxito','derrota')}
    <div class="verdict ${ok?'hi':'lo'}" hidden>${ok?(c.area==='penal'?'Absolvido':'Procedente'):(c.area==='penal'?'Condenado':'Improcedente')}</div>
    <div class="res" hidden><span class="${d>=0?'hi':'lo'}">${sgn(d)} de reputação</span>${ok&&c.preso?'<br>O assistido vai para casa. Chegou uma carta de agradecimento.':''}</div>`,[{t:'Continuar',v:1,dis:true}],async box=>{
      await balanca(box,ch,r); box.querySelector('.verdict').hidden=false; box.querySelector('.res').hidden=false;
      const b=box.querySelector('[data-mi]'); b.disabled=false; b.focus();});
  addLog(`${ok?'Êxito':'Derrota'} em “${c.titulo}” · chance ${pct(ch)} · ${sgn(d)} reputação.`,ok?'g':'r');
  if(!ok && c.inst<3){
    const prox={...c,inst:c.inst+1,prep:0,semana:0,mod:0}, chP=calcDefesa(prox).ch;
    const v=await modal(`<span class="label">${esc(c.titulo)}</span><h2>Recorrer?</h2><dl class="meta"><dt>Chance de reverter no ${INST[c.inst+1]}</dt><dd class="num ${cls(chP)}">${pct(chP)}</dd>
      <dt>Se reverter</dt><dd class="hi">${sgn(R.ganho)} reputação</dd><dt>Se perder de novo</dt><dd class="lo">${sgn(-R.perda/4)} reputação</dd></dl><p style="font-size:12px;color:var(--muted)">A Defensoria não paga custas.</p>`,
      [{t:'Não recorrer',v:0,cls:'ghost'},{t:'Recorrer',v:1}]);
    if(v){ D.recursos.push({titulo:c.titulo,rar:c.rar,ch:chP,semanas:rint(3,6)}); addLog(`Você recorreu em “${c.titulo}”.`); }
  }
}
async function dpHC(id){
  const D=S.d, c=D.casos.find(x=>x.id===id); if(!c||ocupado||!c.preso||c.hcFalhou||livres()<1) return;
  ocupado=true;
  try{
    c.semana=(c.semana||0)+1; const ch=chanceHC(c);
    const ok=await rolar(`Habeas corpus · ${esc(c.titulo)}`,`Pedido de liberdade para ${esc(c.assistido)}. Usa Escrita e Penal, e gasta 1 bloco deste mês.`,ch,'Liberdade concedida','Pedido negado');
    if(ok){ c.preso=false; D.solturas++; D.cartas++; S.prest=clamp(S.prest+1,0,100); addLog(`Habeas corpus concedido: ${c.assistido} saiu da prisão. +1 reputação.`,'g'); }
    else { c.hcFalhou=true; addLog(`Habeas corpus negado para ${c.assistido}.`,'r'); }
    salvar();
  } finally { ocupado=false; render(); }
}
async function dpAcordo(id){
  const D=S.d, c=D.casos.find(x=>x.id===id); if(!c||ocupado||!c.acordo||c.acordoFalhou) return;
  ocupado=true;
  try{
    const ok=await rolar(`Acordo · ${esc(c.titulo)}`,`Negociação ${Math.round(S.skills.negociacao)}${tem('negociacao',1)?' · bônus de nível':''}.`,chanceAcordoDP(),'Acordo fechado','Sem acordo');
    if(ok){ const g=RAR[c.rar].ganho/2; S.prest=clamp(S.prest+g,0,100); D.acordos++; D.atendimentos++; D.vitorias++; D.casos=D.casos.filter(x=>x.id!==id);
      addLog(`Acordo em “${c.titulo}”. ${sgn(g)} reputação.`,'g'); }
    else { c.acordoFalhou=true; addLog(`Sem acordo em “${c.titulo}”.`,'r'); }
    salvar();
  } finally { ocupado=false; render(); }
}

async function fimSemanaDP(){
  if(ocupado) return; ocupado=true;
  try{
    autoDistribuir();
    const D=S.d, C=CARGOS_DP[D.cargo], gab=gabinete();
    const tot=D.casos.reduce((a,c)=>a+(c.semana||0),0);
    const pessoal=Math.max(0,tot-gab)+S.agenda.estudo+acadBlocos(), desc=Math.max(0,S.disp-pessoal-S.agenda.lazer-vidaBlocos());
    if(S.agenda.estudo){ const k=S.agenda.estudoSkill, mult=(S.traits.includes('rato')?1.5:1)*(tem('pesquisa',3)?1.5:1)*multAtual(k);
      for(let i=0;i<S.agenda.estudo;i++) S.skills[k]=clamp(S.skills[k]+1.1*mult*(1-S.skills[k]/110),0,100);
      S.estudoTotal=(S.estudoTotal||0)+S.agenda.estudo; }
    S.energia=clamp(S.energia-3.2*pessoal*(S.traits.includes('workaholic')?.7:1)+3*desc+1.5*S.agenda.lazer,0,100);
    S.estresse=clamp(S.estresse+2.2*pessoal*(S.traits.includes('ansioso')?1.25:1)-1.2*desc-6*S.agenda.lazer,0,100);
    S.caixa+=C.salario-CUSTO_VIDA_DP;
    for(const c of D.casos){ c.prep+=c.semana||0; c.semana=0; c.prazo--; }
    const hoje=D.casos.filter(c=>c.prazo<=0); D.casos=D.casos.filter(c=>c.prazo>0);
    const lote=[];
    for(const c of hoje){
      if(RORD.indexOf(c.rar)>=2){ await julgamentoDP(c); continue; }
      const ch=calcDefesa(c).ch, ok=Math.random()<ch; lote.push([c,ch,ok,resultadoDP(c,ok)]);
    }
    const notas=[];
    for(const r of D.recursos) r.semanas--;
    for(const r of D.recursos.filter(r=>r.semanas<=0)){
      const ok=Math.random()<r.ch, R=RAR[r.rar], d=ok?R.ganho:-R.perda/4;
      if(ok){ D.vitorias++; D.derrotas--; }
      S.prest=clamp(S.prest+d,0,100);
      notas.push(`${ok?'Tribunal reverteu':'Tribunal manteve'} a decisão em “${esc(r.titulo)}”: ${sgn(d)} reputação.`);
      addLog(`${ok?'Recurso provido':'Recurso negado'} em “${r.titulo}”. ${sgn(d)} reputação.`,ok?'g':'r');
    }
    D.recursos=D.recursos.filter(r=>r.semanas>0);
    const novos=novosDP(D.comarca); for(let i=0;i<novos;i++) D.casos.push(novoAssistido());
    const est=semanaEstruturaPub(novos);
    const vit=lote.filter(x=>x[2]).length;
    if(lote.length) addLog(`${lote.length} audiência(s) no mês: ${vit} êxito(s) e ${lote.length-vit} derrota(s).`,vit>=lote.length/2?'g':'r');
    const soma=lote.reduce((a,x)=>a+x[3],0);
    await modal(`<span class="label">Mês ${S.semana} · ${fem(C.nome)} · ${CIDADES[D.comarca].nome}</span><h2>Balanço da Defensoria</h2>
      <span class="label">Audiências (${lote.length})</span>
      ${lote.length?`<ul class="break">${lote.slice(0,14).map(([c,ch,ok,d])=>`<li><span>${esc(c.titulo)} · ${pct(ch)}${c.preso?' · preso':''}</span><span class="num ${ok?'hi':'lo'}">${ok?'Êxito':'Derrota'} ${sgn(d)}</span></li>`).join('')}${lote.length>14?`<li><span>e mais ${lote.length-14}</span><span></span></li>`:''}</ul>`:'<p style="font-size:12.5px;color:var(--muted)">Nenhuma audiência comum neste mês.</p>'}
      ${notas.length?`<ul class="break">${notas.map(n=>`<li><span>${n}</span></li>`).join('')}</ul>`:''}
      ${`<ul class="break">${est.map(n=>`<li><span>${n}</span></li>`).join('')}</ul>`}
      <dl class="meta"><dt>Saldo de reputação nas audiências</dt><dd class="num ${soma>=0?'hi':'lo'}">${sgn(soma)}</dd>
        <dt>Assistidos novos</dt><dd class="num">${novos}</dd><dt>Salário menos custo de vida</dt><dd class="num hi">${brl(C.salario-CUSTO_VIDA_DP)}</dd></dl>`,[{t:'Continuar',v:1,cls:'brass'}]);
    await semanaAcademia(); if(await semanaVida()) return;
    S.semana++; S.agenda.estudo=0; S.agenda.lazer=0; S.disp=BLOCOS-blocosPerdidos();
    if(S.estresse>=100){ S.disp=10; S.estresse=70; addLog('Burnout: você só terá 10 blocos no próximo mês.','r'); }
    else if(S.energia<=0){ S.disp=14; addLog('Exaustão: você só terá 14 blocos no próximo mês.','r'); }
    if(S.prest<=0 && !probatorio()) S.fim='dp';
    if(!S.fim && promoOkDP() && !D.avisoPromo){ D.avisoPromo=true; addLog(`Você já pode pedir promoção a ${fem(CARGOS_DP[D.cargo+1].nome)}.`,'g'); }
    salvar(); render();
    if(S.fim){
      await modal(`<h2 class="lo">Carreira encerrada</h2><p>Sua reputação chegou a zero e a corregedoria da Defensoria afastou você. Foram ${D.atendimentos} atendimentos em ${S.semana-1} meses.</p>`,[{t:'Nova carreira',v:1,cls:'brass'}]);
      hallRegistrar(S.fim==='falencia'?'falencia':'encerrada'); S=null; apagarSave();
    }
  } finally { ocupado=false; render(); }
}

async function promocaoDP(){
  if(ocupado||!promoOkDP()) return; const D=S.d, prox=D.cargo+1, N=CARGOS_DP[prox];
  const outras=Object.keys(CIDADES).filter(k=>k!==D.comarca).sort(()=>Math.random()-.5);
  const ops=prox===3?[D.comarca]:prox===2?Object.keys(CIDADES):[D.comarca,...outras.slice(0,3)];
  const titulo=prox===3?'Lista tríplice para Defensor Público-Geral':prox===2?'Escolha a Defensoria do estado':'Escolha a comarca';
  const v=await modal(`<h2>${titulo}</h2><p>Como ${fem(N.nome)}: orçamento base de ${brl(ORC_BASE[prox])} por mês para a unidade e salário de ${brl(N.salario)}. A equipe e a estrutura vão com você. Os assistidos atuais ficam com o seu sucessor.</p>
    <div class="opts">${ops.map(k=>`<button class="opt" data-mv="${k}"><span>${CIDADES[k].nome}${k===D.comarca?' (atual)':''}</span><b class="num">${novosDP(k)}/mês</b><small>Tamanho ${'●'.repeat(CIDADES[k].pop)}${'○'.repeat(5-CIDADES[k].pop)} · assistidos novos por mês</small></button>`).join('')}</div>`,
    [{t:'Cancelar',v:'',cls:'ghost'}]);
  if(!v) return;
  if(prox===3){
    const ch=clamp(.35+(S.prest-85)/40+(S.integ-60)/200+(capPol()-40)/120,.1,.9); let ok;
    ocupado=true;
    try{ ok=await rolar('Escolha do governador',`Você entrou na lista tríplice. Reputação ${Math.round(S.prest)}, integridade ${Math.round(S.integ)} e capital político ${Math.round(capPol())} pesam na escolha.`,ch,'Nomeado','Outro escolhido'); }
    finally{ ocupado=false; }
    if(!ok){ D.dpgEm=S.semana+12; addLog(`O governador escolheu outro nome da lista. Nova lista no mês ${D.dpgEm}.`,'r'); salvar(); render(); return; }
  }
  if(v!==D.comarca && !(await mudancaVida(CIDADES[v].nome))) return;
  D.cargo=prox; D.desde=S.semana; D.comarca=v; D.avisoPromo=false; D.casos=[]; for(let i=0;i<8;i++) D.casos.push(novoAssistido());
  addLog(`Promovido a ${fem(N.nome)} em ${CIDADES[v].nome}.`,'g'); salvar(); render();
  if(prox===3) await modal(`<h2 class="hi">Topo da carreira</h2><p>Em ${S.semana-1} meses você virou ${fem('Defensor Público')}-Geral, com ${D.atendimentos} atendimentos e ${D.cartas} cartas de agradecimento.</p>`,[{t:'Continuar jogando',v:1,cls:'brass'}]);
}

