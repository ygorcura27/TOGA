// ===================== ÉPOCA: CRISES, CICLOS E REFORMAS DA LEI =====================
const EPOCAS={
  recessao:{nome:'Recessão econômica',p:.012,dur:[20,40],grupo:'eco',dem:{empresarial:1.6,trabalho:1.5},valor:.85,
    desc:'Empresas em crise e demissões em massa: mais casos empresariais (recuperação judicial) e trabalhistas, mas as causas valem 15% menos. A bolsa caiu 20%.',
    ini:()=>{ const I=S.vida.inv; if(I){ I.acoes.v*=.8; I.fii.v*=.92; } }},
  boom:{nome:'Boom econômico',p:.009,dur:[20,30],grupo:'eco',dem:{empresarial:1.4,tributario:1.25},valor:1.15,
    desc:'Negócios em alta: causas valem 15% mais, com mais fusões e disputas tributárias. A bolsa subiu 12%.',
    ini:()=>{ const I=S.vida.inv; if(I) I.acoes.v*=1.12; }},
  pandemia:{nome:'Pandemia',p:.0025,dur:[15,25],grupo:'saude',dem:{familia:1.6,civel:1.2,trabalho:1.3},valor:1,
    desc:'Audiências virtuais: some a penalidade de distância. Mais divórcios, inventários e disputas de contrato. A saúde cai mais rápido.'},
  operacao:{nome:'Grande operação anticorrupção',p:.007,dur:[20,40],grupo:'pol',dem:{penal:1.7},valor:1.1,
    desc:'Delações, prisões e a imprensa em cima: muito mais casos penais, e mais valiosos.'},
};
const REFORMAS=[
  {id:'cpc',nome:'Novo Código de Processo Civil',area:'civel',ciclo:8,perda:.15},
  {id:'cc',nome:'Reforma do Código Civil',area:'civel',ciclo:8,perda:.12},
  {id:'trib',nome:'Reforma Tributária',area:'tributario',ciclo:8,perda:.20},
  {id:'trab',nome:'Reforma Trabalhista',area:'trabalho',ciclo:8,perda:.18},
  {id:'anticrime',nome:'Pacote Anticrime',area:'penal',ciclo:4,perda:.10},
  {id:'cpp',nome:'Novo Código de Processo Penal',area:'penal',ciclo:8,perda:.15},
  {id:'falencias',nome:'Nova Lei de Falências e Recuperação Judicial',area:'empresarial',ciclo:8,perda:.14},
  {id:'ia',nome:'Marco Legal da Inteligência Artificial',area:'empresarial',ciclo:4,perda:.08},
  {id:'familias',nome:'Estatuto das Famílias',area:'familia',ciclo:8,perda:.12},
];
const TRAMITA=.6, VOTACAO=ANO; // chance de um projeto entrar em pauta na janela e meses até a votação
function epocaInicial(){ const prox={}; for(const r of REFORMAS) prox[r.id]=S.semana+rint(1,r.ciclo*ANO); return {ev:[],proj:[],prox,atual:{},onda:{},hist:[]}; }
const EP=()=>S.epoca||(S.epoca=epocaInicial());
const epocaAtiva=t=>!!S&&!!S.epoca&&S.epoca.ev.some(e=>e.tipo===t&&e.ate>S.semana);
function demEpoca(area){ if(!S||!S.epoca) return 1; let m=1; const E=S.epoca;
  for(const e of E.ev) if(e.ate>S.semana) m*=EPOCAS[e.tipo].dem[area]||1;
  if(E.onda[area]>S.semana) m*=1.6; return m; }
const valorEpoca=()=>{ if(!S||!S.epoca) return 1; let m=1; for(const e of S.epoca.ev) if(e.ate>S.semana) m*=EPOCAS[e.tipo].valor; return m; };
const multAtual=k=>S&&S.epoca&&S.epoca.atual[k]>S.semana?2:1; // curso de atualização: estudo da área rende o dobro

async function semanaEpoca(){ const E=EP();
  // crises e ciclos
  E.ev=E.ev.filter(e=>{ if(e.ate>S.semana) return true; addLog(`Fim da época: ${EPOCAS[e.tipo].nome}.`,''); E.hist.unshift({t:`Fim: ${EPOCAS[e.tipo].nome}`,s:S.semana}); return false; });
  for(const [t,X] of Object.entries(EPOCAS)){
    if(E.ev.some(e=>EPOCAS[e.tipo].grupo===X.grupo)||Math.random()>=X.p) continue;
    const dur=rint(X.dur[0],X.dur[1]); E.ev.push({tipo:t,ate:S.semana+dur,ini:S.semana}); if(X.ini) X.ini();
    E.hist.unshift({t:`Início: ${X.nome}`,s:S.semana}); addLog(`${X.nome}: ${X.desc}`,'r');
    await modal(`<span class="label">Notícia · mês ${S.semana}</span><h2>${X.nome}</h2><p>${X.desc}</p><p class="label" style="margin:0">Dura cerca de ${Math.round(dur/ANO*12)} meses (${dur} meses).</p>`,[{t:'Continuar',v:1}]); }
  if(epocaAtiva('pandemia')) S.vida.saude=clamp(S.vida.saude-.4,0,100);
  // janelas legislativas: a cada 4 ou 8 anos, um projeto pode entrar em pauta (não é certo)
  for(const r of REFORMAS){
    if(S.semana<E.prox[r.id]) continue; E.prox[r.id]=S.semana+r.ciclo*ANO;
    if(E.proj.some(p=>p.id===r.id)||Math.random()>=TRAMITA) continue;
    const p={id:r.id,vota:S.semana+VOTACAO,ch:Math.round(rnd(.4,.8)*100)/100}; E.proj.push(p);
    addLog(`No Congresso: “${r.nome}” entrou em pauta. Votação em ${VOTACAO} meses, aprovação provável em ${pct(p.ch)}.`,'');
    E.hist.unshift({t:`Em pauta: ${r.nome}`,s:S.semana}); }
  // votações
  for(const p of [...E.proj]){ if(S.semana<p.vota) continue; E.proj=E.proj.filter(x=>x!==p); const r=REFORMAS.find(x=>x.id===p.id);
    const ok=await rolar(`Votação no Congresso · ${r.nome}`,`Se aprovada, parte do que você sabe de ${AREAS[r.area].nome} fica desatualizada.`,p.ch,'Aprovada','Rejeitada');
    if(!ok){ addLog(`O Congresso rejeitou “${r.nome}”.`,'g'); E.hist.unshift({t:`Rejeitada: ${r.nome}`,s:S.semana}); continue; }
    const k=r.area, antes=S.skills[k]; S.skills[k]=Math.max(0,antes*(1-r.perda)); E.atual[k]=S.semana+20; E.onda[k]=S.semana+30;
    if(S.cq&&estrelas(k)<NIV_AREA.filter(x=>antes>=x).length) S.cq.cont['ref_'+k]=estrelas(k);
    E.hist.unshift({t:`Aprovada: ${r.nome}`,s:S.semana});
    addLog(`Aprovada a ${r.nome}: ${AREAS[k].nome} caiu de ${Math.floor(antes)} para ${Math.floor(S.skills[k])}.`,'r');
    await modal(`<span class="label">Lei aprovada · mês ${S.semana}</span><h2>${r.nome}</h2>
      <p>O que você sabia de ${AREAS[k].nome} ficou em parte desatualizado: a skill caiu ${pct(r.perda)}, de <b>${Math.floor(antes)}</b> para <b>${Math.floor(S.skills[k])}</b>${estrelas(k)<NIV_AREA.filter(x=>antes>=x).length?`, e você perdeu estrela${NIV_AREA.filter(x=>antes>=x).length-estrelas(k)>1?'s':''}`:''}.</p>
      <dl class="meta"><dt>Curso de atualização</dt><dd>estudar ${AREAS[k].nome} rende o dobro por 20 meses</dd><dt>Onda de processos</dt><dd>+60% de casos da área por 30 meses</dd></dl>`,[{t:'Voltar a estudar',v:1,cls:'brass'}]); }
}

// faixa de notícias abaixo do cabeçalho
function tickerHtml(){ if(!S||!S.epoca) return ''; const E=S.epoca, it=[];
  for(const e of E.ev) if(e.ate>S.semana) it.push(`<span class="tk lo" title="${esc(EPOCAS[e.tipo].desc)}"><b>${EPOCAS[e.tipo].nome}</b> · ${e.ate-S.semana} meses</span>`);
  for(const p of E.proj){ const r=REFORMAS.find(x=>x.id===p.id); it.push(`<span class="tk" title="Se aprovada: −${pct(r.perda)} em ${AREAS[r.area].nome}"><b>${r.nome}</b> em votação · ${pct(p.ch)} · ${Math.max(0,p.vota-S.semana)} meses</span>`); }
  for(const k in E.atual) if(E.atual[k]>S.semana) it.push(`<span class="tk hi"><b>Atualização em ${AREAS[k].nome}</b> · estudo ×2 · ${E.atual[k]-S.semana} meses</span>`);
  return it.length?`<div class="ticker"><span class="label">Brasil agora</span>${it.join('')}</div>`:''; }
{ const h0=header; header=function(){ return h0()+tickerHtml(); }; }

