// ===================== MINISTÉRIO PÚBLICO =====================
const CARGOS_MP=[
  {nome:'Promotor Substituto',gab:2,salario:32000},
  {nome:'Promotor de Justiça',gab:4,salario:35000,req:{prest:35,cond:15,taxa:.55}},
  {nome:'Procurador de Justiça',gab:7,salario:41800,req:{prest:60,cond:50,taxa:.60}},
  {nome:'Procurador-Geral de Justiça',gab:10,salario:44000,req:{prest:85,cond:100,taxa:.65}},
];
const INVEST={pf:'Pessoa física',empresa:'Empresa',estado:'Agente público'};
const TM=(titulo,area,adv,rars,juri=false,acordo=false)=>({titulo,area,adv,rars,juri,acordo});
const TEMPLATES_MP=[
  TM('Furto em loja de departamentos','penal','pf',['comum'],false,true),
  TM('Estelionato pela internet','penal','pf',['comum','incomum'],false,true),
  TM('Receptação de celulares','penal','pf',['comum'],false,true),
  TM('Lesão corporal em briga de trânsito','penal','pf',['comum','incomum'],false,true),
  TM('Produto vencido em supermercados','civel','empresa',['comum','incomum'],false,true),
  TM('Maus-tratos a idoso','familia','pf',['comum','incomum']),
  TM('Tráfico de drogas no bairro','penal','pf',['incomum','raro']),
  TM('Poluição de rio por indústria','civel','empresa',['incomum','raro']),
  TM('Roubo a agência bancária','penal','pf',['raro']),
  TM('Homicídio em bar','penal','pf',['raro','epico'],true),
  TM('Feminicídio','penal','pf',['raro','epico'],true),
  TM('Fraude na merenda escolar','penal','estado',['raro','epico']),
  TM('Cartel de combustíveis','empresarial','empresa',['raro','epico']),
  TM('Desvio de verba da saúde','penal','estado',['epico']),
  TM('Corrupção na prefeitura','penal','estado',['epico','lendario']),
  TM('Organização criminosa','penal','pf',['epico','lendario']),
];
const novosInq=k=>2+CIDADES[k].pop+2*(S&&S.p?S.p.cargo:0);
const MIN_ATD={comum:1,incomum:2,raro:3,epico:4,lendario:5};
const dilig=c=>(c.prep||0)+(c.semana||0); // diligência acumulada no inquérito, contando os blocos deste mês // blocos mínimos de diligência/atendimento antes de ir a juízo
// expediente da promotoria: vistas, ofícios, notificações e atendimento ao público. A equipe absorve primeiro; o que sobrar sai da sua agenda
const expedienteMP=()=>S&&S.carreira==='promotor'&&S.p?3+CIDADES[S.p.comarca].pop+2*S.p.cargo:0;
const expEquipe=()=>Math.min(gabinete(),expedienteMP()), expPessoal=()=>Math.max(0,expedienteMP()-gabinete());
const gabCasos=()=>Math.max(0,gabinete()-expedienteMP());
const assessoresMP=()=>S.u?S.u.equipe.filter(f=>f.funcao==='assessor'):[];
const taxaCond=()=>{const t=S.p.condenacoes+S.p.absolvicoes; return t?S.p.condenacoes/t:0;};
const comarcaAtual=()=>S.carreira==='juiz'?S.j.comarca:S.carreira==='defensor'?S.d.comarca:S.p.comarca;
function novoInquerito(){
  const P=S.p, C=CIDADES[P.comarca];
  const rar=sortearRaridade(C,[{},{},{raro:12,epico:5},{raro:20,epico:12,lendario:3}][P.cargo]);
  let pool=TEMPLATES_MP.filter(t=>t.rars.includes(rar)); if(!pool.length) pool=TEMPLATES_MP;
  const t=pickW(pool,x=>C.areas[x.area]||1), R=RAR[rar];
  const reu=t.adv==='empresa'?pick(EMPRESAS):t.adv==='estado'?'Servidor '+pick(NOMES):pick(NOMES);
  return {id:++uid,...t,rar,d:rint(R.d[0],R.d[1]),cidade:P.comarca,reu,idade:0,meta:META[rar],prep:0,semana:0,mod:0,
    fase:'inq',inocente:Math.random()<(rar==='comum'?.2:.12),revelado:false,prazo:0,inst:1,lado:null,acordoFalhou:false};
}
function iniciarMP(cid){
  S.carreira='promotor'; posse(); estruturaPub(); S.casos=[]; S.ofertas=[]; S.filiais=[]; S.aReceber=0;
  S.p={cargo:0,desde:S.semana,comarca:cid,casos:[],recursos:[],erros:[],denuncias:0,condenacoes:0,absolvicoes:0,acordos:0,arquivados:0};
  for(let i=0;i<8;i++){ const c=novoInquerito(); c.idade=rint(0,c.meta); S.p.casos.push(c); }
}
function calcCondenacao(c){
  const items=[]; const add=(l,v)=>{ if(v) items.push([l,v]); };
  const skill=.5*S.skills[c.area]+.3*S.skills.analise+.2*S.skills.oratoria;
  const cg=c.fase==='juizo'?cargaCaso(c,false):{prep:c.prep+(c.semana||0),atraso:0}, n=cg.prep;
  add(`Diligências e preparo (${n} de ~${prepIdeal(c)} blocos ideais)`,Math.round(prepCaso(c,n)*10)/10);
  if(cg.atraso) add(`Audiências e alegações atrasadas (${cg.atraso} bloco${cg.atraso>1?'s':''})`,penAtraso(cg.atraso));
  if((c.inst||1)===1&&n<MIN_ATD[c.rar]) add(`Investigação insuficiente (mínimo ${MIN_ATD[c.rar]} blocos)`,-5*(MIN_ATD[c.rar]-n));
  if(c.revelado) add('Indícios de inocência',-25);
  if(S.p.cargo>=2) add('Experiência no tribunal',3);
  if(RORD.indexOf(c.rar)>=3){ const as=assessoresMP(); // investigação complexa (GAECO) depende de assessoria técnica
    if(!as.length) add('Sem assessor para investigação complexa',-10);
    else add(`Assessoria técnica na investigação (${as.length})`,Math.min(6,3*as.length)); }
  if(S.energia<30) add('Cansaço',-10);
  if(S.estresse>70) add('Estresse alto',-8);
  if(S.traits.includes('orador') && c.juri) add('Orador nato (júri)',5);
  if(S.traits.includes('ansioso') && RORD.indexOf(c.rar)>=3) add('Ansiedade',-5);
  if(S.traits.includes('sortudo')) add('Sortudo',3);
  if(c.inst>1){ add(INST[c.inst],-10*(c.inst-1)); add(c.lado==='recorrido'?'Condenação já obtida':'Absolvição anterior',c.lado==='recorrido'?10:-10); }
  bonusPerks(c,add); add('Audiência',c.mod);
  const bonus=items.reduce((a,x)=>a+x[1],0);
  let ch=sig((skill+bonus-c.d)/12); if(c.juri) ch=.5+(ch-.5)*.8;
  return {skill,items,ch:clamp(ch,.05,.95)};
}
const chanceAcordoMP=()=>clamp(.5+S.skills.negociacao/200+(tem('negociacao',1)?.1:0)+(temSala('reuniao')?.1:0)+(S.traits.includes('carismatico')?.1:0),.05,.95);
function efeitoArquivar(c){ const R=RAR[c.rar];
  if(c.revelado) return {v:R.ganho,t:'Arquivamento justo: havia indícios de inocência'};
  if(calcCondenacao(c).ch>=.6) return {v:-R.perda/2,t:'A imprensa critica o arquivamento de um caso forte'};
  return {v:0,t:'Provas fracas: arquivamento sem repercussão'}; }
function promoReqMP(){ const n=CARGOS_MP[S.p.cargo+1]; if(!n) return null; const r=n.req;
  return [...reqTempo(S.p,'promotor'),{l:`Reputação ${r.prest}`,ok:S.prest>=r.prest,v:Math.round(S.prest)},
          {l:`${r.cond} condenações`,ok:S.p.condenacoes>=r.cond,v:S.p.condenacoes},
          {l:`Taxa de condenação de ${pct(r.taxa)}`,ok:taxaCond()>=r.taxa,v:pct(taxaCond())}]; }
const promoOkMP=()=>{const r=promoReqMP(); return !!r&&r.every(x=>x.ok)&&!((S.p.pgjEm||0)>S.semana);};
function xpMP(c,mult){ for(const [k,w] of [[c.area,.5],['analise',.3],['oratoria',.2]]) S.skills[k]=clamp(S.skills[k]+w*3*RAR[c.rar].xp*mult*(1-S.skills[k]/110),0,100); }

function painelCarreiraMP(){ const P=S.p, C=CARGOS_MP[P.cargo], req=promoReqMP();
  return `<section class="panel"><div class="panel-head"><h2>Carreira</h2><span class="label">${fem(C.nome)}</span></div>
    <dl class="meta">
      <dt>Comarca</dt><dd>${CIDADES[P.comarca].nome}</dd>
      <dt>Salário</dt><dd class="num">${brl(C.salario)}/mês</dd>${linhaPol()}
      <dt>Denúncias</dt><dd class="num">${P.denuncias}</dd>
      <dt>Condenações · absolvições</dt><dd class="num">${P.condenacoes} · ${P.absolvicoes}</dd>
      <dt>Taxa de condenação</dt><dd class="num">${pct(taxaCond())}</dd>
      <dt>Acordos · arquivamentos</dt><dd class="num">${P.acordos} · ${P.arquivados}</dd>
    </dl>
    ${req?`<span class="label">Para ${fem(CARGOS_MP[P.cargo+1].nome)}</span>
      <ul class="break">${req.map(x=>`<li><span>${x.l}</span><span class="num ${x.ok?'hi':'lo'}">${x.ok?'✓ ':''}${x.v}</span></li>`).join('')}</ul>
      ${P.cargo===2?'<p style="margin:0;font-size:12px;color:var(--muted)">O Procurador-Geral sai de uma lista tríplice votada pela classe e é escolhido pelo governador.</p>':''}
      <button class="btn brass" data-act="promocao" ${promoOkMP()?'':'disabled'}>${(P.pgjEm||0)>S.semana?`Nova lista tríplice no mês ${P.pgjEm}`:'Pedir promoção a '+fem(CARGOS_MP[P.cargo+1].nome)}</button>`
      :'<p class="hi" style="margin:0">Você chefia o Ministério Público do estado.</p>'}
    ${btnExonerar}
  </section>`; }

function mpCard(c){ const R=RAR[c.rar], A=AREAS[c.area], cc=calcCondenacao(c), inq=c.fase==='inq';
  const presc=c.meta+6-c.idade, atras=inq&&c.idade>c.meta;
  const arq=inq?efeitoArquivar(c):null, podeAcordo=inq&&c.acordo&&!c.acordoFalhou;
  return `<article class="folder" data-area="${inq?'Inquérito':'Ação penal'} · ${A.nome}">
    <span class="stamp" style="color:var(--r-${c.rar})">${R.nome}</span>
    <h3>${esc(c.titulo)}</h3>
    <div class="chips">${atras?`<span class="tag" style="background:var(--loss);color:#fff">Prescreve em ${presc} meses</span>`:''}${c.revelado?'<span class="tag" style="background:var(--warn);color:#fff">Indícios de inocência</span>':''}${c.inst>1?`<span class="tag">${INST[c.inst]}</span>`:''}</div>
    <dl class="meta">
      <dt>Investigado</dt><dd>${esc(c.reu)} · ${INVEST[c.adv]}</dd>
      ${inq?`<dt>Na promotoria há</dt><dd class="num ${atras?'lo':''}">${c.idade} meses · meta ${c.meta}</dd>`:`<dt>Audiência</dt><dd>${c.prazo<=1?'<b class="mid">no próximo mês</b>':`em ${c.prazo} meses`}</dd>`}
      <dt>Se condenar</dt><dd class="hi">${sgn(R.ganho)} reputação</dd>
      <dt>Se absolver</dt><dd class="lo">${sgn(-R.perda)} reputação</dd>
      ${inq?`<dt>Se arquivar</dt><dd class="${arq.v>0?'hi':arq.v<0?'lo':''}">${sgn(arq.v)} reputação</dd>`:''}
      ${c.juri?'<dt>Rito</dt><dd><b>Tribunal do júri</b></dd>':''}
    </dl>
    <div class="vs">
      <span>Dificuldade</span><div class="bar"><i style="width:${c.d}%;background:var(--loss)"></i></div><span class="num">${c.d}</span>
      <span>Sua skill</span><div class="bar"><i style="width:${cc.skill}%;background:var(--win)"></i></div><span class="num">${Math.round(cc.skill)}</span>
    </div>
    <span class="label" style="text-transform:none;letter-spacing:0;font-weight:400">${A.nome} 50% · Análise 30% · Oratória 20%</span>
    <div class="chance"><span class="label">Chance de condenação</span><strong class="${cls(cc.ch)}">${pct(cc.ch)}</strong></div>
    <details><summary>Ver detalhes da chance</summary><ul class="break">
      <li><span>Sua skill no caso</span><span class="num">${Math.round(cc.skill)}</span></li>
      ${cc.items.map(([l,v])=>`<li><span>${esc(l)}</span><span class="num ${v>0?'hi':'lo'}">${sgn(v)}</span></li>`).join('')}
      <li><span>Dificuldade</span><span class="num lo">−${c.d}</span></li>
      ${c.juri?'<li><span>Júri: resultado menos previsível</span><span class="num">×0,8</span></li>':''}
      <li><b>Chance final (entre 5% e 95%)</b><b class="num">${pct(cc.ch)}</b></li></ul></details>
    <div class="ctl">
      <div class="row"><span class="name">${inq?'Blocos de diligência':'Blocos de preparo'}</span>${stepper('inq',c.id,c.semana||0,livres())}</div>
      ${inq?`<p style="margin:0;font-size:11.5px;color:var(--muted)">Diligências aumentam a chance e podem revelar que o investigado é inocente. Denunciar exige ${MIN_ATD[c.rar]} bloco${MIN_ATD[c.rar]>1?'s':''} de diligência; arquivar, 1. Em juízo, a ação penal consome ${manut(c)} bloco${manut(c)>1?'s':''} por mês.</p>
      <div class="actions">
        <button class="btn ghost" data-act="mpArquivar" data-id="${c.id}" ${dilig(c)>=1?'':'disabled title="O arquivamento precisa de pelo menos 1 bloco de análise do inquérito"'}>${dilig(c)>=1?'Arquivar':'Arquivar · 1 bloco'}</button>
        ${c.acordo?`<button class="btn ghost" data-act="mpAcordo" data-id="${c.id}" ${podeAcordo?'':'disabled'} title="Acordo de não persecução penal">${c.acordoFalhou?'Acordo recusado':`Acordo · ${pct(chanceAcordoMP())}`}</button>`:''}
        <button class="btn" data-act="mpDenunciar" data-id="${c.id}" ${dilig(c)>=MIN_ATD[c.rar]?'':'disabled'}>${dilig(c)>=MIN_ATD[c.rar]?'Denunciar':`Denunciar · faltam ${MIN_ATD[c.rar]-dilig(c)} bloco${MIN_ATD[c.rar]-dilig(c)>1?'s':''} de diligência`}</button>
      </div>`:''}
    </div>
  </article>`; }

function renderPromotoria(){
  const P=S.p, gab=gabinete(), exp=expedienteMP(), expE=expEquipe(), expP=expPessoal(), gc=gabCasos(), tot=P.casos.reduce((a,c)=>a+(c.semana||0),0), gabUsed=Math.min(gc,tot), pessoal=tot-gabUsed;
  const free=livres(), inqs=P.casos.filter(c=>c.fase==='inq').sort((a,b)=>(b.idade-b.meta)-(a.idade-a.meta)), juizo=P.casos.filter(c=>c.fase==='juizo').sort((a,b)=>a.prazo-b.prazo);
  const atras=inqs.filter(c=>c.idade>c.meta).length;
  const cells=[]; const push=(k,n)=>{for(let i=0;i<n;i++) cells.push(k);};
  push('exp',expP); push('case',pessoal); push('estudo',S.agenda.estudo+acadBlocos()); push('lazer',S.agenda.lazer); push('familia',S.agenda.familia||0); push('saude',S.agenda.saude||0);
  push('descanso',Math.max(0,S.disp-expP-pessoal-S.agenda.estudo-S.agenda.lazer-vidaBlocos()-acadBlocos())); push('off',BLOCOS-S.disp);
  let grid='';
  for(let r=0;r<3;r++) for(let d=0;d<7;d++) grid+=`<div class="blk ${cells[d*3+r]||'descanso'}"></div>`;
  const gabCells=Array.from({length:gab},(_,i)=>`<div class="blk ${i<expE?'exp':i<expE+gabUsed?'apoio':''}"></div>`).join('');
  app.innerHTML=`${header()}
  <div class="grid">
    <div class="col">
      <section class="panel">
        <div class="panel-head"><h2>Agenda do mês</h2><span class="num">${S.disp+gab-free}/${S.disp+gab} blocos</span></div>
        <div class="blocks">${grid}</div>
        <span class="label">Equipe da promotoria · ${gab} blocos de servidores por mês · ${expE} no expediente</span>
        <div class="blocks">${gabCells}</div>
        <div class="legend"><span><i class="exp"></i>Expediente</span><span><i style="background:var(--b-case)"></i>Casos (você)</span><span><i style="background:var(--b-apoio)"></i>Casos (equipe)</span><span><i style="background:var(--b-estudo)"></i>Estudo</span><span><i style="background:var(--b-lazer)"></i>Lazer</span><span><i style="background:var(--b-familia)"></i>Família</span><span><i style="background:var(--b-saude)"></i>Saúde</span><span><i style="background:var(--b-descanso)"></i>Descanso</span></div>
        <div class="rows">
          <div class="row"><span class="name" title="Vistas de processos, ofícios, notificações e atendimento ao público. Cresce com a comarca e o cargo.">Expediente da promotoria</span><span class="num ${expP?'lo':''}">${exp} · equipe ${expE}${expP?` · você ${expP}`:''}</span></div>
          <div class="row"><span class="name">Casos (ajuste em cada pasta)</span><span class="num">${tot}</span></div>
          <div class="row"><span class="name">Estudo</span><select id="estudo-skill" data-act="estudoSkill">${Object.entries(SKILLS).map(([k,v])=>`<option value="${k}" ${S.agenda.estudoSkill===k?'selected':''}>${v}</option>`).join('')}</select>${stepper('estudo',0,S.agenda.estudo,free)}</div>
          <div class="row"><span class="name">Lazer (reduz estresse)</span>${stepper('lazer',0,S.agenda.lazer,free)}</div>
          ${rowsVida(free)}${rowsAcad(free)}
        </div>
        <p class="label" style="margin:0">A equipe cuida primeiro do expediente e depois dos casos, sem gastar sua energia. O expediente que ela não cobre sai da sua agenda.</p>
        <button class="btn brass wide" data-act="fimSemana">Encerrar mês ▶</button>
      </section>
      ${painelCarreiraMP()}${painelSkills()}${painelDiario()}
    </div>
    <div class="col">
      <section class="panel" style="background:transparent;border:0;padding:0">
        <div class="panel-head"><h2>Ações penais em andamento</h2><span class="num">${juizo.length}</span></div>
        <div class="cases">${juizo.length?juizo.map(mpCard).join(''):'<p class="empty">Nenhuma denúncia em julgamento. Denuncie um inquérito para levá-lo ao juiz.</p>'}</div>
      </section>
      <section class="panel" style="background:transparent;border:0;padding:0">
        <div class="panel-head"><h2>Inquéritos</h2><span class="num">${inqs.length} · <span class="${atras?'lo':''}">${atras} atrasados</span></span></div>
        <p class="label" style="margin:0">Chegam ${novosInq(P.comarca)} por mês. Atrasado custa 0,3 de reputação por mês (no máximo 4) e prescreve 6 meses depois da meta.</p>
        <div class="cases">${inqs.length?inqs.map(mpCard).join(''):'<p class="empty">Nenhum inquérito na mesa.</p>'}</div>
      </section>
      ${P.recursos.length?`<section class="panel"><div class="panel-head"><h2>Recursos no tribunal</h2><span class="num">${P.recursos.length}</span></div>
        <ul class="break">${P.recursos.map(r=>`<li><span>${esc(r.titulo)} · ${r.tipo==='defesa'?'defesa recorreu':'você recorreu'} · ${r.semanas} meses</span><span class="num ${cls(r.ch)}">${pct(r.ch)} a seu favor</span></li>`).join('')}</ul></section>`:''}
    </div>
  </div>`;
}

async function mpDenunciar(id){
  const P=S.p, c=P.casos.find(x=>x.id===id); if(!c||ocupado||dilig(c)<MIN_ATD[c.rar]) return;
  if(c.revelado){
    const v=await modal(`<h2>Denunciar mesmo assim?</h2><p>As diligências encontraram indícios de que ${esc(c.reu)} é inocente. Denunciar assim custa 20 de integridade.</p>`,[{t:'Cancelar',v:0,cls:'ghost'},{t:'Denunciar',v:1}]);
    if(!v) return; S.integ=clamp(S.integ-20,0,100);
  }
  c.fase='juizo'; c.prazo=rint(2,4); P.denuncias++;
  addLog(`Denúncia oferecida em “${c.titulo}”. Audiência em ${c.prazo} meses.`); salvar(); render();
}
async function mpAcordo(id){
  const P=S.p, c=P.casos.find(x=>x.id===id); if(!c||ocupado||!c.acordo||c.acordoFalhou) return;
  ocupado=true;
  try{
    const ok=await rolar(`Acordo de não persecução · ${esc(c.titulo)}`,`O investigado confessa, repara o dano e cumpre condições, sem processo. Negociação ${Math.round(S.skills.negociacao)}.`,chanceAcordoMP(),'Acordo aceito','Acordo recusado');
    if(ok){ const g=RAR[c.rar].ganho/2; S.prest=clamp(S.prest+g,0,100); P.acordos++; P.casos=P.casos.filter(x=>x.id!==id);
      addLog(`Acordo fechado em “${c.titulo}”. ${sgn(g)} reputação.`,'g'); }
    else { c.acordoFalhou=true; addLog(`O investigado recusou o acordo em “${c.titulo}”.`,'r'); }
    salvar();
  } finally { ocupado=false; render(); }
}
async function mpArquivar(id){
  const P=S.p, c=P.casos.find(x=>x.id===id); if(!c||ocupado||dilig(c)<1) return; const e=efeitoArquivar(c);
  const v=await modal(`<h2>Arquivar o inquérito?</h2><p>${e.t}.</p><p class="num ${e.v>0?'hi':e.v<0?'lo':''}">${sgn(e.v)} reputação</p>`,[{t:'Cancelar',v:0,cls:'ghost'},{t:'Arquivar',v:1}]);
  if(!v) return;
  S.prest=clamp(S.prest+e.v,0,100); P.arquivados++; P.casos=P.casos.filter(x=>x.id!==id);
  addLog(`Inquérito “${c.titulo}” arquivado. ${sgn(e.v)} reputação.`,e.v>0?'g':e.v<0?'r':''); salvar(); render();
}

async function julgamentoMP(c){
  const P=S.p, R=RAR[c.rar];
  await momentoDecisivo(c);
  const ch=calcCondenacao(c).ch, r=Math.random(), cond=r<=ch;
  let dP, linhas=[];
  if(cond){ dP=R.ganho+(tem('oratoria',3)&&RORD.indexOf(c.rar)>=2?1:0); P.condenacoes++; xpMP(c,1); if(c.inocente) P.erros.push({titulo:c.titulo,rar:c.rar}); }
  else if(c.inocente){ dP=0; P.absolvicoes++; xpMP(c,1.5); linhas.push('O réu era inocente: a absolvição foi justa e não custa reputação.'); }
  else { dP=-R.perda; P.absolvicoes++; xpMP(c,1.5); S.estresse=clamp(S.estresse+6,0,100); }
  S.prest=clamp(S.prest+dP,0,100);
  linhas.unshift(`<span class="${dP>=0?'hi':'lo'}">${sgn(dP)} de reputação</span>`);
  await modal(`<span class="label">Julgamento · ${esc(c.titulo)}</span><h2>${c.juri?'O júri vai decidir':'O juiz vai decidir'}</h2>
    <p class="num">Chance de condenação: <b class="${cls(ch)}">${pct(ch)}</b></p>
    ${htmlBalanca(ch,0,'condenação','absolvição')}
    <div class="verdict ${cond?'hi':'lo'}" hidden>${cond?'Condenado':'Absolvido'}</div>
    <div class="res" hidden>${linhas.join('<br>')}</div>`,[{t:'Continuar',v:1,dis:true}],async box=>{
      await balanca(box,ch,r); box.querySelector('.verdict').hidden=false; box.querySelector('.res').hidden=false;
      const b=box.querySelector('[data-mi]'); b.disabled=false; b.focus();});
  addLog(`${cond?'Condenação':'Absolvição'} em “${c.titulo}” · chance ${pct(ch)} · ${sgn(dP)} reputação.`,cond?'g':'r');
  if(c.inst>=3) return;
  if(cond){
    const ca=clamp(.35+R.apelo,.05,.95);
    const ap=await rolar('A defesa vai recorrer?',`Defesas recorrem da maioria das condenações. Base ${pct(ca)}.`,ca,'Recorreu','Não recorreu');
    if(ap){ const prox={...c,inst:c.inst+1,lado:'recorrido',prep:0,semana:0,mod:0};
      P.recursos.push({titulo:c.titulo,rar:c.rar,tipo:'defesa',ch:calcCondenacao(prox).ch,semanas:rint(3,6)}); }
  } else if(!c.inocente){
    const prox={...c,inst:c.inst+1,lado:'recorrente',prep:0,semana:0,mod:0}, chP=calcCondenacao(prox).ch;
    const v=await modal(`<span class="label">${esc(c.titulo)}</span><h2>Recorrer da absolvição?</h2>
      <dl class="meta"><dt>Chance de reverter no ${INST[c.inst+1]}</dt><dd class="num ${cls(chP)}">${pct(chP)}</dd>
      <dt>Se reverter</dt><dd class="hi">${sgn(R.ganho)} reputação</dd><dt>Se perder de novo</dt><dd class="lo">${sgn(-R.perda/2)} reputação</dd></dl>`,
      [{t:'Aceitar a absolvição',v:0,cls:'ghost'},{t:'Recorrer',v:1}]);
    if(v){ P.recursos.push({titulo:c.titulo,rar:c.rar,tipo:'mp',ch:chP,semanas:rint(3,6)}); addLog(`Você recorreu da absolvição em “${c.titulo}”.`); }
  }
}

async function fimSemanaMP(){
  if(ocupado) return; ocupado=true;
  try{
    autoDistribuir();
    const P=S.p, C=CARGOS_MP[P.cargo];
    const tot=P.casos.reduce((a,c)=>a+(c.semana||0),0);
    const pessoal=Math.max(0,tot-gabCasos())+expPessoal()+S.agenda.estudo+acadBlocos(), desc=Math.max(0,S.disp-pessoal-S.agenda.lazer-vidaBlocos());
    if(S.agenda.estudo){ const k=S.agenda.estudoSkill, mult=(S.traits.includes('rato')?1.5:1)*(tem('pesquisa',3)?1.5:1)*multAtual(k);
      for(let i=0;i<S.agenda.estudo;i++) S.skills[k]=clamp(S.skills[k]+1.1*mult*(1-S.skills[k]/110),0,100);
      S.estudoTotal=(S.estudoTotal||0)+S.agenda.estudo; }
    S.energia=clamp(S.energia-3.2*pessoal*(S.traits.includes('workaholic')?.7:1)+3*desc+1.5*S.agenda.lazer,0,100);
    S.estresse=clamp(S.estresse+2.2*pessoal*(S.traits.includes('ansioso')?1.25:1)-1.2*desc-6*S.agenda.lazer,0,100);
    S.caixa+=C.salario-CUSTO_VIDA_MP;
    const notas=[];
    // diligências e preparo
    for(const c of P.casos){ const n=c.semana||0;
      if(n && c.fase==='inq' && c.inocente && !c.revelado){ for(let i=0;i<n;i++) if(Math.random()<(tem('analise',2)?.35:.2)){ c.revelado=true; break; }
        if(c.revelado){ notas.push(`Diligência encontrou indícios de inocência em “${c.titulo}”.`); addLog(`Indícios de inocência em “${c.titulo}”.`,'g'); } }
      if(c.fase==='juizo') cargaCaso(c,true); else { c.prep+=n; c.semana=0; } }
    // audiências
    for(const c of P.casos) if(c.fase==='juizo') c.prazo--;
    const hoje=P.casos.filter(c=>c.fase==='juizo'&&c.prazo<=0);
    P.casos=P.casos.filter(c=>!(c.fase==='juizo'&&c.prazo<=0));
    for(const c of hoje) await julgamentoMP(c);
    // recursos
    for(const r of P.recursos) r.semanas--;
    for(const r of P.recursos.filter(r=>r.semanas<=0)){
      const ok=Math.random()<r.ch, R=RAR[r.rar]; let d;
      if(r.tipo==='defesa'){ d=ok?R.ganho/2:-R.perda/2; if(!ok){ P.condenacoes--; P.absolvicoes++; } }
      else { d=ok?R.ganho:-R.perda/2; if(ok){ P.condenacoes++; P.absolvicoes--; } }
      S.prest=clamp(S.prest+d,0,100);
      const txt=r.tipo==='defesa'?(ok?'Tribunal manteve a condenação':'Tribunal absolveu o réu'):(ok?'Tribunal condenou o réu':'Tribunal manteve a absolvição');
      notas.push(`${txt} em “${r.titulo}”: ${sgn(d)} reputação.`); addLog(`${txt} em “${r.titulo}”. ${sgn(d)} reputação.`,d>=0?'g':'r');
    }
    P.recursos=P.recursos.filter(r=>r.semanas>0);
    // erro judiciário vem à tona
    for(const e of [...P.erros]) if(Math.random()<.12){
      P.erros=P.erros.filter(x=>x!==e); const d=-RAR[e.rar].perda;
      S.prest=clamp(S.prest+d,0,100); S.integ=clamp(S.integ-15,0,100);
      notas.push(`<b class="lo">Erro judiciário:</b> provas novas mostram que o condenado em “${esc(e.titulo)}” era inocente. ${sgn(d)} reputação e −15 de integridade.`);
      addLog(`Erro judiciário em “${e.titulo}”. ${sgn(d)} reputação.`,'r');
    }
    // inquéritos envelhecem e prescrevem
    let atras=0;
    for(const c of P.casos) if(c.fase==='inq'){ c.idade++; if(c.idade>c.meta) atras++; }
    for(const c of P.casos.filter(c=>c.fase==='inq'&&c.idade>c.meta+6)){
      const d=-RAR[c.rar].perda/2; S.prest=clamp(S.prest+d,0,100);
      notas.push(`O crime prescreveu em “${esc(c.titulo)}”: ${sgn(d)} reputação.`); addLog(`Prescrição em “${c.titulo}”. ${sgn(d)} reputação.`,'r'); }
    P.casos=P.casos.filter(c=>!(c.fase==='inq'&&c.idade>c.meta+6));
    if(atras){ S.prest=clamp(S.prest-penAtrasoPub(atras),0,100); S.estresse=clamp(S.estresse+Math.min(10,.5*atras),0,100); }
    const novos=novosInq(P.comarca); for(let i=0;i<novos;i++) P.casos.push(novoInquerito());
    const est=semanaEstruturaPub(novos);
    await modal(`<span class="label">Mês ${S.semana} · ${fem(C.nome)} · ${CIDADES[P.comarca].nome}</span><h2>Balanço da promotoria</h2>
      ${notas.length?`<ul class="break">${notas.map(n=>`<li><span>${n}</span></li>`).join('')}</ul>`:'<p style="font-size:12.5px;color:var(--muted)">Mês sem novidades nos processos.</p>'}
      ${`<ul class="break">${est.map(n=>`<li><span>${n}</span></li>`).join('')}</ul>`}
      <dl class="meta"><dt>Inquéritos atrasados</dt><dd class="num ${atras?'lo':''}">${atras}${atras?` · ${sgn(-penAtrasoPub(atras))} reputação`:''}</dd>
        <dt>Inquéritos novos</dt><dd class="num">${novos}</dd><dt>Salário menos custo de vida</dt><dd class="num hi">${brl(C.salario-CUSTO_VIDA_MP)}</dd></dl>`,[{t:'Continuar',v:1,cls:'brass'}]);
    await semanaAcademia(); if(await semanaVida()) return;
    S.semana++; S.agenda.estudo=0; S.agenda.lazer=0; S.disp=BLOCOS-blocosPerdidos();
    if(S.estresse>=100){ S.disp=10; S.estresse=70; addLog('Burnout: você só terá 10 blocos no próximo mês.','r'); }
    else if(S.energia<=0){ S.disp=14; addLog('Exaustão: você só terá 14 blocos no próximo mês.','r'); }
    if(S.prest<=0 && !probatorio()) S.fim='cnmp';
    if(!S.fim && promoOkMP() && !P.avisoPromo){ P.avisoPromo=true; addLog(`Você já pode pedir promoção a ${fem(CARGOS_MP[P.cargo+1].nome)}.`,'g'); }
    salvar(); render();
    if(S.fim){
      await modal(`<h2 class="lo">Carreira encerrada</h2><p>Sua reputação chegou a zero e o Conselho Nacional do Ministério Público afastou você. Foram ${P.condenacoes} condenações em ${S.semana-1} meses.</p>`,[{t:'Nova carreira',v:1,cls:'brass'}]);
      hallRegistrar(S.fim==='falencia'?'falencia':'encerrada'); S=null; apagarSave();
    }
  } finally { ocupado=false; render(); }
}

async function promocaoMP(){
  if(ocupado||!promoOkMP()) return; const P=S.p, prox=P.cargo+1, N=CARGOS_MP[prox];
  const outras=Object.keys(CIDADES).filter(k=>k!==P.comarca).sort(()=>Math.random()-.5);
  const ops=prox===3?[P.comarca]:prox===2?Object.keys(CIDADES):[P.comarca,...outras.slice(0,3)];
  const titulo=prox===3?'Lista tríplice para Procurador-Geral':prox===2?'Escolha o Ministério Público do estado':'Escolha a comarca';
  const v=await modal(`<h2>${titulo}</h2><p>Como ${fem(N.nome)}: orçamento base de ${brl(ORC_BASE[prox])} por mês para a unidade e salário de ${brl(N.salario)}. A equipe e a estrutura vão com você. Os inquéritos atuais ficam com o seu sucessor.</p>
    <div class="opts">${ops.map(k=>`<button class="opt" data-mv="${k}"><span>${CIDADES[k].nome}${k===P.comarca?' (atual)':''}</span><b class="num">${novosInq(k)}/mês</b><small>Tamanho ${'●'.repeat(CIDADES[k].pop)}${'○'.repeat(5-CIDADES[k].pop)} · inquéritos novos por mês</small></button>`).join('')}</div>`,
    [{t:'Cancelar',v:'',cls:'ghost'}]);
  if(!v) return;
  if(prox===3){
    const ch=clamp(.35+(S.prest-85)/40+(S.integ-60)/200+(capPol()-40)/120,.1,.9);
    ocupado=true; let ok;
    try{ ok=await rolar('Escolha do governador',`Você entrou na lista tríplice. Reputação ${Math.round(S.prest)}, integridade ${Math.round(S.integ)} e capital político ${Math.round(capPol())} pesam na escolha.`,ch,'Nomeado','Outro escolhido'); }
    finally{ ocupado=false; }
    if(!ok){ P.pgjEm=S.semana+12; addLog(`O governador escolheu outro nome da lista tríplice. Nova lista no mês ${P.pgjEm}.`,'r'); salvar(); render(); return; }
  }
  if(v!==P.comarca && !(await mudancaVida(CIDADES[v].nome))) return;
  P.cargo=prox; P.desde=S.semana; P.comarca=v; P.avisoPromo=false; P.casos=[]; for(let i=0;i<6;i++) P.casos.push(novoInquerito());
  addLog(`Promovido a ${fem(N.nome)} em ${CIDADES[v].nome}.`,'g'); salvar(); render();
  if(prox===3) await modal(`<h2 class="hi">Topo da carreira</h2><p>Em ${S.semana-1} meses você virou ${fem('Procurador')}-Geral de Justiça, com ${P.condenacoes} condenações e taxa de ${pct(taxaCond())}.</p>`,[{t:'Continuar jogando',v:1,cls:'brass'}]);
}


{ const l0=livres; livres=function(){ return l0()-expedienteMP(); }; }
