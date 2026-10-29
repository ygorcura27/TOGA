// ===================== MAGISTRATURA =====================
const CARGOS=[
  {nome:'Juiz Substituto',gab:3,salario:7500},
  {nome:'Juiz Titular',gab:6,salario:8500,req:{prest:35,sent:40,reforma:.35}},
  {nome:'Desembargador',gab:10,salario:10000,req:{prest:60,sent:120,reforma:.25}},
  {nome:'Ministro do STJ',gab:14,salario:11500,req:{prest:85,sent:250,reforma:.20}},
  {nome:'Ministro do STF',gab:18,salario:13000,req:{prest:95,sent:400,reforma:.15}},
];
const CUSTO_VIDA_JUIZ=2500;
const VARAS={penal:'Vara Criminal',civel:'Vara Cível',familia:'Vara de Família',empresarial:'Vara Empresarial',trabalho:'Vara do Trabalho',tributario:'Vara Federal Tributária'};
const NOMES_CARGO={
  trabalho:['Juiz do Trabalho Substituto','Juiz Titular de Vara do Trabalho','Desembargador do TRT','Ministro do TST','Ministro do STF'],
  tributario:['Juiz Federal Substituto','Juiz Federal','Desembargador do TRF','Ministro do STJ','Ministro do STF'],
  outros:['Juiz Substituto','Juiz de Direito Titular','Desembargador do TJ','Ministro do STJ','Ministro do STF'],
};
const vara=()=>S.j.vara||'civel';
const nomeCargo=i=>fem((NOMES_CARGO[vara()]||NOMES_CARGO.outros)[i]);
const supNome=()=>vara()==='trabalho'?'TST':'STJ';
async function escolherVara(){
  const v=await modal(`<h2>Escolha a sua vara</h2><p>O juiz só recebe processos da área da sua vara. A carreira trabalhista termina no TST, a federal tributária e as estaduais no STJ, e todas podem chegar ao STF.</p>
    <div class="opts">${Object.entries(VARAS).map(([k,n])=>`<button class="opt" data-mv="${k}"><span>${n}</span><b class="num">${Math.floor(S.skills[k])}</b><small>Sua skill de ${AREAS[k].nome}</small></button>`).join('')}</div>`,[]);
  return v; }
const META={comum:6,incomum:8,raro:10,epico:12,lendario:14};
const gabinete=()=>!S||!S.u?0:staffBlocos()+(S.carreira!=='adv'&&tem('escrita',2)?1:0);
const taxaReforma=()=>{const t=S.j.mantidas+S.j.reformas; return t?S.j.reformas/t:0;};
const novosPorSemana=k=>2+CIDADES[k].pop+3*(S&&S.j?S.j.cargo:0);
// estágio probatório: nos primeiros 20 meses do cargo a reputação zerada não encerra a carreira; a aprovação no concurso dá ao menos 30 de reputação
const PROBATORIO=24;
const penAtrasoPub=n=>Math.min(4,.3*n*fatorAtraso()); // atraso pesa, mas com teto mensal para não virar espiral sem volta
function posse(){ S.posseEm=S.semana; S.prest=Math.max(S.prest,30); addLog(`Estágio probatório de ${PROBATORIO} meses: até o mês ${S.semana+PROBATORIO}, reputação zerada não tira você do cargo.`); }
const probatorio=()=>S.semana-(S.posseEm||-99)<PROBATORIO;
const MIN_SENT={comum:2,incomum:3,raro:4,epico:6,lendario:9}; // blocos de estudo acumulados para poder sentenciar
const minSent=p=>MIN_SENT[p.rar];
function novoProcesso(){
  const extra=[{},{},{raro:15,epico:6},{raro:25,epico:15,lendario:3},{raro:25,epico:25,lendario:8}][S.j.cargo];
  const c=novoCaso(S.j.comarca,extra,S.j.cargo===4?null:vara()); // o STF julga todas as áreas
  return {...c,idade:0,meta:META[c.rar],semana:0,mod:0};
}
function iniciarMagistratura(cid,vr=S.espec){
  S.carreira='juiz'; posse(); estruturaPub(); S.casos=[]; S.ofertas=[]; S.filiais=[]; S.aReceber=0;
  S.j={cargo:0,desde:S.semana,vara:vr,comarca:cid,acervo:[],recursos:[],sentencas:0,mantidas:0,reformas:0,transitadas:0,propina:0};
  for(let i=0;i<8;i++){ const p=novoProcesso(); p.idade=rint(0,p.meta); S.j.acervo.push(p); }
}
function calcAcerto(p){
  const items=[]; const add=(l,v)=>{ if(v) items.push([l,v]); };
  const skill=.5*S.skills[p.area]+.3*S.skills.escrita+.2*S.skills.analise;
  const n=(p.estudo||0)+(p.semana||0); add(`Estudo do processo (${n} de ~${prepIdeal(p)} blocos ideais)`,Math.round(prepCaso(p,n)*10)/10);
  if(S.j.cargo>=2) add('Decisão colegiada',5);
  if(S.energia<30) add('Cansaço',-10);
  if(S.estresse>70) add('Estresse alto',-8);
  if(S.traits.includes('ansioso') && RORD.indexOf(p.rar)>=3) add('Ansiedade',-5);
  if(S.traits.includes('sortudo')) add('Sortudo',3);
  if(S.traits.includes('rato')) add('Rato de biblioteca',2);
  bonusPerks(p,add); add('Eventos do processo',p.mod);
  const bonus=items.reduce((a,x)=>a+x[1],0);
  let ch=sig((skill+bonus-p.d)/12); if(p.juri) ch=.5+(ch-.5)*.8;
  return {skill,items,ch:clamp(ch,.05,.95)};
}
function chanceRecursoJ(p){ const c=S.j.cargo; if(c===4) return 0; if(c===3) return RORD.indexOf(p.rar)>=3?chanceApeloAdv(p,false)*.6:0; if(c===2 && RORD.indexOf(p.rar)<2) return 0; return chanceApeloAdv(p,false); }
// tempo mínimo no cargo atual antes da promoção, em meses (índice = cargo de destino)
const TEMPO_CARGO={juiz:[0,24,96,180,240],promotor:[0,24,96,144],defensor:[0,24,96,144]};
const tempoTxt=m=>m>=12?`${Math.floor(m/12)} ano${m>=24?'s':''}${m%12?` e ${m%12} ${m%12>1?'meses':'mês'}`:''}`:`${m} ${m===1?'mês':'meses'}`;
function reqTempo(X,car){ const T=TEMPO_CARGO[car][X.cargo+1]; if(!T) return []; const m=S.semana-(X.desde||0);
  return [{l:`${tempoTxt(T)} no cargo`,ok:m>=T,v:tempoTxt(Math.max(0,m))}]; }
function promoReq(){ const n=CARGOS[S.j.cargo+1]; if(!n) return null; const r=n.req;
  return [...reqTempo(S.j,'juiz'),{l:`Reputação ${r.prest}`,ok:S.prest>=r.prest,v:Math.round(S.prest)},
          {l:`${r.sent} sentenças`,ok:S.j.sentencas>=r.sent,v:S.j.sentencas},
          {l:`Taxa de reforma até ${pct(r.reforma)}`,ok:taxaReforma()<=r.reforma,v:pct(taxaReforma())}]; }
const concilia=p=>['civel','familia','trabalho','empresarial'].includes(p.area)&&S.j.cargo<2;
const chanceConc=()=>clamp(.35+S.skills.negociacao/200+(tem('negociacao',1)?.1:0)+(temSala('reuniao')?.1:0)+(S.traits.includes('carismatico')?.1:0),.05,.95);
async function jConciliar(id){ const J=S.j, p=J.acervo.find(x=>x.id===id); if(!p||ocupado||p.concFalhou) return; ocupado=true;
  try{ const ok=await rolar(`Audiência de conciliação · ${esc(p.titulo)}`,`As partes tentam um acordo mediado por você. Negociação ${Math.round(S.skills.negociacao)}.`,chanceConc(),'Acordo homologado','Sem acordo');
    if(ok){ const g=RAR[p.rar].ganho/2; S.prest=clamp(S.prest+g,0,100); J.sentencas++; J.transitadas++; J.acervo=J.acervo.filter(x=>x.id!==id); addLog(`Acordo homologado em “${p.titulo}”. ${sgn(g)} reputação.`,'g'); }
    else { p.concFalhou=true; addLog(`Conciliação sem acordo em “${p.titulo}”.`,'r'); }
    salvar(); } finally { ocupado=false; render(); } }
const promoOk=()=>{const r=promoReq(); return !!r&&r.every(x=>x.ok)&&!((S.j.stfEm||0)>S.semana);};
function xpJuiz(p,mult){ for(const [k,w] of [[p.area,.5],['escrita',.3],['analise',.2]]) S.skills[k]=clamp(S.skills[k]+w*3*RAR[p.rar].xp*mult*(1-S.skills[k]/110),0,100); }

function painelCarreiraAdv(){
  const cedo=S.semana-(S.semanaFormatura||0)<24, espera=(S.concursoEm||0)>S.semana, semDin=dinheiroPessoal()<3000, dis=cedo||espera||semDin;
  const txt=t=>cedo?`${t} · disponível no mês ${(S.semanaFormatura||0)+24}`:espera?`${t} · nova tentativa no mês ${S.concursoEm}`:semDin?`${t} · inscrição de ${brl(3000)}: falta dinheiro pessoal (faça uma retirada)`:t;
  return `<section class="panel"><div class="panel-head"><h2>Carreira</h2><span class="label">Advocacia</span></div>
    <p style="margin:0;font-size:12.5px">Quer mudar de lado? Os concursos da magistratura, do Ministério Público e da Defensoria têm três fases eliminatórias: objetiva, discursiva e oral. Exigem prática jurídica (no protótipo, 20 meses) e inscrição de ${brl(3000)}. Blocos de estudo acumulados dão bônus nas provas.</p>
    <button class="btn ghost" data-act="concurso" data-v="juiz" ${dis?'disabled':''}>${txt('Concurso para juiz')}</button>
    <button class="btn ghost" data-act="concurso" data-v="promotor" ${dis?'disabled':''}>${txt('Concurso para promotor')}</button>
    <button class="btn ghost" data-act="concurso" data-v="defensor" ${dis?'disabled':''}>${txt('Concurso para defensor')}</button>
    <button class="btn ghost" data-act="virarAcademico">Largar a advocacia pela carreira acadêmica</button>
  </section>`;
}
function painelCarreiraJuiz(){ const J=S.j, C=CARGOS[J.cargo], req=promoReq();
  return `<section class="panel"><div class="panel-head"><h2>Carreira</h2><span class="label">${nomeCargo(J.cargo)}</span></div>
    <dl class="meta">
      <dt>Vara</dt><dd>${VARAS[vara()]}</dd>
      <dt>Comarca</dt><dd>${CIDADES[J.comarca].nome}</dd>
      <dt>Salário</dt><dd class="num">${brl(C.salario)}/mês</dd>${linhaPol()}
      <dt>Sentenças</dt><dd class="num">${J.sentencas}</dd>
      <dt>Mantidas · reformadas</dt><dd class="num">${J.mantidas} · ${J.reformas}</dd>
      <dt>Taxa de reforma</dt><dd class="num">${pct(taxaReforma())}</dd>
      <dt>Transitadas sem recurso</dt><dd class="num">${J.transitadas}</dd>
    </dl>
    ${req?`<span class="label">Para ${nomeCargo(J.cargo+1)}</span>
      <ul class="break">${req.map(x=>`<li><span>${x.l}</span><span class="num ${x.ok?'hi':'lo'}">${x.ok?'✓ ':''}${x.v}</span></li>`).join('')}</ul>
      <button class="btn brass" data-act="promocao" ${promoOk()?'':'disabled'}>Pedir promoção a ${nomeCargo(J.cargo+1)}</button>`
      :'<p class="hi" style="margin:0">Você chegou ao topo da carreira.</p>'}
    ${btnExonerar}
  </section>`; }
function painelComarca(k){ const C=CIDADES[k], atual=k===comarcaAtual(), MP=S.carreira==='promotor', DP=S.carreira==='defensor';
  return `<section class="panel"><div class="panel-head"><h2>${C.nome}</h2><span class="label">${C.uf}</span></div>
    <div><span class="tag">${atual?'Sua comarca':'Outra comarca'}</span></div>
    ${k==='df'?'<p style="margin:0;font-size:12.5px">Sede do Superior Tribunal de Justiça, o topo da carreira.</p>':''}
    <dl class="meta"><dt>Tamanho</dt><dd>${'●'.repeat(C.pop)}${'○'.repeat(5-C.pop)}</dd><dt>${MP?'Inquéritos':DP?'Assistidos':'Processos'} novos por mês</dt><dd class="num">${MP?novosInq(k):DP?novosDP(k):novosPorSemana(k)}</dd></dl>
    <span class="label">Demanda por área</span>
    <div class="dem">${Object.entries(C.areas).sort((a,b)=>b[1]-a[1]).map(([a,w])=>`<span>${AREAS[a].nome}</span><div class="bar"><i style="width:${w/3*100}%;background:var(--b-case)"></i></div>`).join('')}</div>
    <p style="margin:0;font-size:12px;color:var(--muted)">${MP?'Promotores':DP?'Defensores':'Juízes'} só mudam de comarca nas promoções. Comarcas maiores trazem mais ${MP?'inquéritos':DP?'assistidos':'processos'} e casos mais difíceis.</p>
    <button class="btn brass wide" data-act="fimSemana">Encerrar mês ▶</button>
  </section>`; }

function procCard(p){ const R=RAR[p.rar], A=AREAS[p.area], cc=calcAcerto(p), apr=chanceRecursoJ(p), atras=p.idade>p.meta;
  return `<article class="folder" data-area="${A.nome}">
    <span class="stamp" style="color:var(--r-${p.rar})">${R.nome}</span>
    <h3>${esc(p.titulo)}</h3>
    ${atras?'<div><span class="tag" style="background:var(--loss);color:#fff">Atrasado</span></div>':''}
    <dl class="meta">
      <dt>Partes</dt><dd>${esc(p.cliente)} × ${ADV[p.adv].nome}</dd>
      <dt>Valor da causa</dt><dd class="num">${brl(p.valor)}</dd>
      <dt>No acervo há</dt><dd class="num ${atras?'lo':''}">${p.idade} meses · meta ${p.meta}</dd>
      <dt>Sem recurso</dt><dd class="hi">${sgn(R.ganho/3)} reputação</dd>
      <dt>Mantida no recurso</dt><dd class="hi">${sgn(R.ganho)} reputação</dd>
      <dt>Reformada</dt><dd class="lo">${sgn(-R.perda)} reputação</dd>
      <dt>Chance de recurso</dt><dd class="num">${apr?pct(apr):'sem recurso'}</dd>
      ${p.juri?'<dt>Rito</dt><dd><b>Tribunal do júri</b></dd>':''}
    </dl>
    <div class="vs">
      <span>Dificuldade</span><div class="bar"><i style="width:${p.d}%;background:var(--loss)"></i></div><span class="num">${p.d}</span>
      <span>Sua skill</span><div class="bar"><i style="width:${cc.skill}%;background:var(--win)"></i></div><span class="num">${Math.round(cc.skill)}</span>
    </div>
    <span class="label" style="text-transform:none;letter-spacing:0;font-weight:400">${A.nome} 50% · Escrita 30% · Análise 20%</span>
    <div class="chance"><span class="label">Chance de acerto</span><strong class="${cls(cc.ch)}">${pct(cc.ch)}</strong></div>
    <details><summary>Ver detalhes da chance</summary><ul class="break">
      <li><span>Sua skill no processo</span><span class="num">${Math.round(cc.skill)}</span></li>
      ${cc.items.map(([l,v])=>`<li><span>${esc(l)}</span><span class="num ${v>0?'hi':'lo'}">${sgn(v)}</span></li>`).join('')}
      <li><span>Dificuldade</span><span class="num lo">−${p.d}</span></li>
      ${p.juri?'<li><span>Júri: resultado menos previsível</span><span class="num">×0,8</span></li>':''}
      <li><b>Chance final (entre 5% e 95%)</b><b class="num">${pct(cc.ch)}</b></li></ul></details>
    <div class="ctl"><div class="row"><span class="name" title="O processo vai a sentença no fim do mês quando o estudo acumulado chega ao mínimo">Estudo · ${(p.estudo||0)+(p.semana||0)}/${minSent(p)} para sentenciar</span>${stepper('proc',p.id,p.semana||0,livres())}</div>
      ${concilia(p)?`<button class="btn ghost" data-act="jConciliar" data-id="${p.id}" ${p.concFalhou?'disabled':''}>${p.concFalhou?'Conciliação sem acordo':'Tentar conciliação · '+pct(chanceConc())}</button>`:''}</div>
  </article>`; }

function renderGabinete(){
  const J=S.j, gab=gabinete(), tot=J.acervo.reduce((a,p)=>a+(p.semana||0),0), gabUsed=Math.min(gab,tot), pessoal=tot-gabUsed;
  const free=livres(), atrasados=J.acervo.filter(p=>p.idade>p.meta).length;
  const cells=[]; const push=(k,n)=>{for(let i=0;i<n;i++) cells.push(k);};
  push('case',pessoal); push('estudo',S.agenda.estudo+acadBlocos()); push('lazer',S.agenda.lazer); push('familia',S.agenda.familia||0); push('saude',S.agenda.saude||0);
  push('descanso',Math.max(0,S.disp-pessoal-S.agenda.estudo-S.agenda.lazer-vidaBlocos()-acadBlocos())); push('off',BLOCOS-S.disp);
  let grid='';
  for(let r=0;r<3;r++) for(let d=0;d<7;d++) grid+=`<div class="blk ${cells[d*3+r]||'descanso'}"></div>`;
  const gabCells=Array.from({length:gab},(_,i)=>`<div class="blk ${i<gabUsed?'apoio':''}"></div>`).join('');
  const ordem=[...J.acervo].sort((a,b)=>(b.idade-b.meta)-(a.idade-a.meta));
  app.innerHTML=`${header()}
  <div class="grid">
    <div class="col">
      <section class="panel">
        <div class="panel-head"><h2>Agenda do mês</h2><span class="num">${S.disp+gab-free}/${S.disp+gab} blocos</span></div>
        <div class="blocks">${grid}</div>
        <span class="label">Gabinete · ${gab} blocos de assessores por mês</span>
        <div class="blocks">${gabCells}</div>
        <div class="legend"><span><i style="background:var(--b-case)"></i>Processos (você)</span><span><i style="background:var(--b-apoio)"></i>Processos (gabinete)</span><span><i style="background:var(--b-estudo)"></i>Estudo</span><span><i style="background:var(--b-lazer)"></i>Lazer</span><span><i style="background:var(--b-familia)"></i>Família</span><span><i style="background:var(--b-saude)"></i>Saúde</span><span><i style="background:var(--b-descanso)"></i>Descanso</span></div>
        <div class="rows">
          <div class="row"><span class="name">Processos (ajuste em cada pasta)</span><span class="num">${tot}</span></div>
          <div class="row"><span class="name">Estudo</span><select id="estudo-skill" data-act="estudoSkill">${Object.entries(SKILLS).map(([k,v])=>`<option value="${k}" ${S.agenda.estudoSkill===k?'selected':''}>${v}</option>`).join('')}</select>${stepper('estudo',0,S.agenda.estudo,free)}</div>
          <div class="row"><span class="name">Lazer (reduz estresse)</span>${stepper('lazer',0,S.agenda.lazer,free)}</div>
          ${rowsVida(free)}${rowsAcad(free)}
        </div>
        <p class="label" style="margin:0">Todo processo com pelo menos 1 bloco é sentenciado no fim do mês. Os blocos do gabinete são usados primeiro e não gastam sua energia.</p>
        <button class="btn brass wide" data-act="fimSemana">Encerrar mês ▶</button>
      </section>
      ${painelCarreiraJuiz()}${painelSkills()}${painelDiario()}
    </div>
    <div class="col">
      <section class="panel" style="background:transparent;border:0;padding:0">
        <div class="panel-head"><h2>Acervo da vara</h2><span class="num">${J.acervo.length} processos · <span class="${atrasados?'lo':''}">${atrasados} atrasados</span></span></div>
        <p class="label" style="margin:0">Chegam ${novosPorSemana(J.comarca)} processos por mês. Cada processo atrasado custa 0,3 de reputação por mês (no máximo 4 por mês).</p>
        <div class="cases">${ordem.length?ordem.map(procCard).join(''):'<p class="empty">Acervo zerado. Novos processos chegam no próximo mês.</p>'}</div>
      </section>
      ${J.recursos.length?`<section class="panel"><div class="panel-head"><h2>Suas sentenças em recurso</h2><span class="num">${J.recursos.length}</span></div>
        ${[...new Set(J.recursos.map(r=>r.inst))].map(t=>`<span class="label">${t} · ${J.recursos.filter(r=>r.inst===t).length}</span><ul class="break">${J.recursos.filter(r=>r.inst===t).map(r=>`<li><span>${esc(r.titulo)} · em ${r.semanas} meses</span><span class="num ${cls(r.ch)}">${pct(r.ch)} de manter</span></li>`).join('')}</ul>`).join('')}</section>`:''}
    </div>
  </div>`;
}

const EVENTOS_JUIZ=[
  p=>({t:'Pressão da imprensa',d:'O processo virou manchete, e a opinião pública exige um resultado específico.',
    o:[{t:'Decidir conforme a lei',s:'Sem efeito',f:()=>{}},
       {t:'Atender à opinião pública',s:'+2 de reputação agora, −15 na chance de acerto',f:()=>{S.prest=clamp(S.prest+2,0,100); p.mod-=15;}}]}),
  p=>({t:'Perícia incompleta',d:'O laudo pericial deixou pontos importantes sem resposta.',
    o:[{t:'Determinar nova perícia',s:'+10 na chance de acerto; o processo volta ao acervo',f:()=>{p.mod+=10; p.adiado=true;}},
       {t:'Julgar com as provas atuais',s:'Sem efeito',f:()=>{}}]}),
  p=>({t:'Oferta de propina',d:'Um intermediário de uma das partes oferece dinheiro por uma decisão favorável.',
    o:[{t:'Recusar e comunicar à corregedoria',s:'+3 de reputação e +5 de integridade',f:()=>{S.prest=clamp(S.prest+3,0,100); S.integ=clamp(S.integ+5,0,100);}},
       {t:'Aceitar',s:`+${brl(Math.round(p.valor*.03))} em caixa, −30 de integridade e risco de perder o cargo`,f:()=>{S.caixa+=Math.round(p.valor*.03); S.integ=clamp(S.integ-30,0,100); S.j.propina++;}}]}),
];
async function eventoJuiz(p){
  const ev=pick(EVENTOS_JUIZ)(p);
  const v=await modal(`<span class="label">${esc(p.titulo)}</span><h2>${ev.t}</h2><p>${ev.d}</p>
    <div class="opts">${ev.o.map((o,i)=>`<button class="opt" data-mv="${i}"><span>${o.t}</span><b></b><small>${o.s}</small></button>`).join('')}</div>`,[]);
  ev.o[+v].f();
}

async function fimSemanaJuiz(){
  if(ocupado) return; ocupado=true;
  try{
    autoDistribuir();
    const J=S.j, C=CARGOS[J.cargo], gab=gabinete();
    const tot=J.acervo.reduce((a,p)=>a+(p.semana||0),0);
    const pessoal=Math.max(0,tot-gab)+S.agenda.estudo+acadBlocos(), desc=Math.max(0,S.disp-pessoal-S.agenda.lazer-vidaBlocos());
    if(S.agenda.estudo){ const k=S.agenda.estudoSkill, mult=(S.traits.includes('rato')?1.5:1)*(tem('pesquisa',3)?1.5:1)*multAtual(k);
      for(let i=0;i<S.agenda.estudo;i++) S.skills[k]=clamp(S.skills[k]+1.1*mult*(1-S.skills[k]/110),0,100);
      S.estudoTotal=(S.estudoTotal||0)+S.agenda.estudo; }
    S.energia=clamp(S.energia-3.2*pessoal*(S.traits.includes('workaholic')?.7:1)+3*desc+1.5*S.agenda.lazer,0,100);
    S.estresse=clamp(S.estresse+2.2*pessoal*(S.traits.includes('ansioso')?1.25:1)-1.2*desc-6*S.agenda.lazer,0,100);
    S.caixa+=C.salario-CUSTO_VIDA_JUIZ;
    // sentenças
    const sent=[], dec=[];
    // processo só vai a sentença quando o estudo acumulado chega ao mínimo da complexidade dele
    for(const p of J.acervo) if((p.semana||0)>0&&(p.estudo||0)+p.semana<minSent(p)){ p.estudo=(p.estudo||0)+p.semana; p.semana=0; }
    const pauta=J.acervo.filter(p=>(p.semana||0)>0);
    J.acervo=J.acervo.filter(p=>!((p.semana||0)>0));
    for(const p of pauta){
      if(RORD.indexOf(p.rar)>=2 && Math.random()<.35) await eventoJuiz(p);
      if(p.adiado){ p.adiado=false; p.semana=0; J.acervo.push(p); sent.push([p,null,'Nova perícia: volta ao acervo']); continue; }
      const ch=calcAcerto(p).ch, ap=chanceRecursoJ(p), rec=Math.random()<ap;
      J.sentencas++; xpJuiz(p,1);
      if(rec){ J.recursos.push({titulo:p.titulo,rar:p.rar,ch,semanas:rint(3,6),inst:J.cargo>=3?'STF':J.cargo>=2?supNome():'Tribunal'}); sent.push([p,ch,'Recorrida: vai ao tribunal']); }
      else { const g=RAR[p.rar].ganho/3; S.prest=clamp(S.prest+g,0,100); J.transitadas++; sent.push([p,ch,`Transitou em julgado · ${sgn(g)}`]); }
    }
    if(sent.length) addLog(`${sent.length} sentença(s) proferida(s).`);
    // tribunal julga os recursos
    for(const r of J.recursos) r.semanas--;
    for(const r of J.recursos.filter(r=>r.semanas<=0)){
      const ok=Math.random()<r.ch, R=RAR[r.rar];
      if(ok){ J.mantidas++; S.prest=clamp(S.prest+R.ganho,0,100); xpJuiz({area:'escrita',rar:r.rar},0); }
      else { J.reformas++; S.prest=clamp(S.prest-R.perda,0,100); S.estresse=clamp(S.estresse+4,0,100); }
      dec.push([r,ok]); addLog(`${r.inst} ${ok?'manteve':'reformou'} sua sentença em “${r.titulo}”. ${sgn(ok?R.ganho:-R.perda)} reputação.`,ok?'g':'r');
    }
    J.recursos=J.recursos.filter(r=>r.semanas>0);
    // acervo envelhece e chegam processos novos
    let atras=0; for(const p of J.acervo){ p.idade++; p.semana=0; if(p.idade>p.meta) atras++; }
    if(atras){ S.prest=clamp(S.prest-penAtrasoPub(atras),0,100); S.estresse=clamp(S.estresse+Math.min(10,.5*atras),0,100); }
    const novos=novosPorSemana(J.comarca); for(let i=0;i<novos;i++) J.acervo.push(novoProcesso());
    const est=semanaEstruturaPub(novos);
    // resumo
    await modal(`<span class="label">Mês ${S.semana} · ${nomeCargo(J.cargo)} · ${CIDADES[J.comarca].nome}</span><h2>Balanço do gabinete</h2>
      <span class="label">Sentenças (${sent.length})</span>
      ${sent.length?`<ul class="break">${sent.map(([p,ch,t])=>`<li><span>${esc(p.titulo)}${ch!==null?` · ${pct(ch)} de acerto`:''}</span><span class="num">${t}</span></li>`).join('')}</ul>`:'<p style="font-size:12.5px;color:var(--muted)">Nenhuma sentença neste mês.</p>'}
      ${dec.length?`<span class="label">Decisões do tribunal</span><ul class="break">${dec.map(([r,ok])=>`<li><span>${esc(r.titulo)}</span><span class="num ${ok?'hi':'lo'}">${ok?'Mantida '+sgn(RAR[r.rar].ganho):'Reformada '+sgn(-RAR[r.rar].perda)}</span></li>`).join('')}</ul>`:''}
      ${`<ul class="break">${est.map(n=>`<li><span>${n}</span></li>`).join('')}</ul>`}
      <dl class="meta"><dt>Processos atrasados</dt><dd class="num ${atras?'lo':''}">${atras}${atras?` · ${sgn(-penAtrasoPub(atras))} reputação`:''}</dd>
        <dt>Processos novos</dt><dd class="num">${novos}</dd><dt>Salário menos custo de vida</dt><dd class="num hi">${brl(C.salario-CUSTO_VIDA_JUIZ)}</dd></dl>`,[{t:'Continuar',v:1,cls:'brass'}]);
    // corregedoria
    if(J.propina && Math.random()<.2*J.propina){ S.fim='cassado'; }
    await semanaAcademia(); if(await semanaVida()) return;
    S.semana++; S.agenda.estudo=0; S.agenda.lazer=0; S.disp=BLOCOS-blocosPerdidos();
    if(S.estresse>=100){ S.disp=10; S.estresse=70; addLog('Burnout: você só terá 10 blocos no próximo mês.','r'); }
    else if(S.energia<=0){ S.disp=14; addLog('Exaustão: você só terá 14 blocos no próximo mês.','r'); }
    if(!S.fim && S.prest<=0 && !probatorio()) S.fim='cnj';
    if(!S.fim && promoOk() && !J.avisoPromo){ J.avisoPromo=true; addLog(`Você já pode pedir promoção a ${nomeCargo(J.cargo+1)}.`,'g'); }
    salvar(); render();
    if(S.fim){
      const txt=S.fim==='cassado'?'A corregedoria descobriu a propina. Você perdeu o cargo e responde a processo criminal.':'Sua reputação chegou a zero e o Conselho Nacional de Justiça afastou você do cargo.';
      await modal(`<h2 class="lo">Carreira encerrada</h2><p>${txt} Foram ${J.sentencas} sentenças em ${S.semana-1} meses.</p>`,[{t:'Nova carreira',v:1,cls:'brass'}]);
      hallRegistrar(S.fim==='falencia'?'falencia':'encerrada'); S=null; apagarSave();
    }
  } finally { ocupado=false; render(); }
}

async function promocao(){
  if(ocupado||!promoOk()) return; const J=S.j, prox=J.cargo+1, N=CARGOS[prox];
  const outras=Object.keys(CIDADES).filter(k=>k!==J.comarca).sort(()=>Math.random()-.5);
  const ops=prox>=3?['df']:prox===2?Object.keys(CIDADES):[J.comarca,...outras.slice(0,3)];
  const titulo=prox===4?'Indicação ao Supremo Tribunal Federal':prox===3?`Posse no ${supNome()==='TST'?'Tribunal Superior do Trabalho':'Superior Tribunal de Justiça'}`:prox===2?(vara()==='trabalho'?'Escolha o Tribunal Regional do Trabalho':vara()==='tributario'?'Escolha o Tribunal Regional Federal':'Escolha o Tribunal de Justiça'):'Escolha a comarca';
  const v=await modal(`<h2>${titulo}</h2><p>Como ${nomeCargo(prox)}: orçamento base de ${brl(ORC_BASE[prox])} por mês para a unidade e salário de ${brl(N.salario)}. A equipe e a estrutura vão com você. O acervo atual fica com o seu sucessor.</p>
    <div class="opts">${ops.map(k=>`<button class="opt" data-mv="${k}"><span>${prox>=3?'Brasília · '+(prox===4?'STF':supNome()):CIDADES[k].nome}${k===J.comarca?' (atual)':''}</span><b class="num">${novosPorSemana(k)}/mês</b><small>Tamanho ${'●'.repeat(CIDADES[k].pop)}${'○'.repeat(5-CIDADES[k].pop)} · processos novos por mês</small></button>`).join('')}</div>`,
    [{t:'Cancelar',v:'',cls:'ghost'}]);
  if(!v) return;
  if(prox===2||prox===3){ const ch=prox===2?clamp(.35+(S.prest-60)/50+(capPol()-30)/100,.1,.92):clamp(.3+(S.prest-85)/30+(capPol()-40)/80,.1,.9); let ok;
    ocupado=true;
    try{ ok=await rolar(prox===2?'Lista de merecimento':'Indicação do Presidente da República',prox===2?`O tribunal vota a promoção por merecimento. Reputação ${Math.round(S.prest)} e capital político ${Math.round(capPol())} pesam.`:`O tribunal superior envia uma lista e o Presidente escolhe. Reputação ${Math.round(S.prest)} e capital político ${Math.round(capPol())} pesam.`,ch,prox===2?'Promovido':'Indicado','Outro nome escolhido'); }
    finally{ ocupado=false; }
    if(!ok){ J.stfEm=S.semana+6; addLog(`${prox===2?'O tribunal promoveu outro juiz por merecimento':'O Presidente escolheu outro nome'}. Nova chance no mês ${J.stfEm}.`,'r'); salvar(); render(); return; } }
  if(prox===4){
    const ch=clamp(.4+(S.integ-60)/100+(S.prest-95)/20+(capPol()-50)/150,.1,.9); let ok;
    ocupado=true;
    try{ ok=await rolar('Sabatina no Senado',`O Presidente indicou você ao STF. Agora o Senado precisa aprovar. Integridade ${Math.round(S.integ)} pesa na votação.`,ch,'Aprovado','Rejeitado'); }
    finally{ ocupado=false; }
    if(!ok){ J.stfEm=S.semana+12; addLog(`O Senado rejeitou sua indicação ao STF. Nova chance no mês ${J.stfEm}.`,'r'); salvar(); render(); return; }
  }
  if(v!==J.comarca && !(await mudancaVida(CIDADES[v].nome))) return;
  J.cargo=prox; J.desde=S.semana; J.comarca=v; J.avisoPromo=false; J.acervo=[]; for(let i=0;i<6;i++) J.acervo.push(novoProcesso());
  addLog(`Promovido a ${nomeCargo(prox)} em ${CIDADES[v].nome}.`,'g'); salvar(); render();
  if(prox===4) await modal(`<h2 class="hi">Topo da carreira</h2><p>Em ${S.semana-1} meses você chegou a ${fem('Ministro')} do Supremo Tribunal Federal, com ${J.sentencas} sentenças e taxa de reforma de ${pct(taxaReforma())}.</p>`,[{t:'Continuar jogando',v:1,cls:'brass'}]);
}

function fasesConcurso(tipo){ const b=Math.min(15,(S.estudoTotal||0)*.5)+bonusTitulos()+Math.min(5,((S.formacao&&S.formacao.contatos[tipo])||0)/10);
  const areas=Object.keys(AREAS).reduce((a,k)=>a+S.skills[k],0)/Object.keys(AREAS).length;
  const f=(n,sk,d)=>({n,sk:Math.round(sk),d,ch:clamp(sig((sk+b-d)/8),.05,.95)});
  return {b,fs:[f('Prova objetiva',areas,32),f('Prova discursiva',S.skills.escrita,38),f('Prova oral',(S.skills.oratoria+S.skills.analise)/2,38)]}; }
async function concurso(tipo='juiz'){
  if(ocupado) return; const MP=tipo==='promotor', {b,fs}=fasesConcurso(tipo);
  const NOME_CONC={juiz:'Concurso da magistratura',promotor:'Concurso do Ministério Público',defensor:'Concurso da Defensoria Pública'}, POSSE={juiz:'Juiz Substituto',promotor:'Promotor Substituto',defensor:'Defensor Público Substituto'};
  const v=await modal(`<h2>${NOME_CONC[tipo]}</h2><p>Três fases eliminatórias. Cada bloco de estudo acumulado vale +0,5 nas provas (máximo +15). Seu bônus atual: <b class="num">+${b.toLocaleString('pt-BR')}</b>.</p>
    <dl class="meta">${fs.map(x=>`<dt>${x.n} · skill ${x.sk} vs ${x.d}</dt><dd class="num ${cls(x.ch)}">${pct(x.ch)}</dd>`).join('')}
      <dt>Aprovação nas três</dt><dd class="num">${pct(fs.reduce((a,x)=>a*x.ch,1))}</dd><dt>Inscrição</dt><dd class="num">${brl(3000)}</dd></dl>`,
    [{t:'Agora não',v:0,cls:'ghost'},{t:'Fazer as provas',v:1,cls:'brass'}]);
  if(!v||dinheiroPessoal()<3000) return; ocupado=true;
  try{
    pagarPessoal(3000);
    for(const x of fs){
      const ok=await rolar(x.n,`Skill ${x.sk} + estudo ${b.toLocaleString('pt-BR')} contra dificuldade ${x.d}.`,x.ch,'Aprovado','Reprovado');
      if(!ok){ S.concursoEm=S.semana+8; S.estresse=clamp(S.estresse+10,0,100);
        addLog(`Reprovado na ${x.n.toLowerCase()} do concurso. Nova tentativa no mês ${S.concursoEm}.`,'r'); salvar(); return; }
    }
    const r=await modal(`<h2 class="hi">Aprovado no concurso</h2><p>Você pode tomar posse como <b>${fem(POSSE[tipo])}</b> em ${CIDADES[S.sede].nome}. Para isso, renuncia aos casos e fecha os escritórios. O dinheiro em caixa continua seu, e os honorários a receber são perdidos.</p>`,
      [{t:'Continuar advogando',v:0,cls:'ghost'},{t:'Tomar posse',v:1,cls:'brass'}]);
    if(r){ S.caixa+=S.bolso||0; S.bolso=0; tipo==='promotor'?iniciarMP(S.sede):tipo==='defensor'?iniciarDP(S.sede):iniciarMagistratura(S.sede,await escolherVara()); S.prest=Math.max(20,Math.round(S.prest*.6)); view='escritorio';
      addLog(`Posse como ${fem(POSSE[tipo])} na comarca de ${CIDADES[S.sede].nome}. Você herdou ${tipo==='promotor'?'8 inquéritos':tipo==='defensor'?'uma fila de assistidos':'um acervo de 8 processos'}.`,'g'); }
    else addLog('Aprovado no concurso, mas preferiu continuar na advocacia.');
    salvar();
  } finally { ocupado=false; render(); }
}

