// ===================== PREVISÃO DE ENERGIA NAS CARREIRAS PÚBLICAS =====================
// mesma conta do fechamento do mês (fimSemanaJuiz / MP / DP), mais o custo máximo das audiências e julgamentos rápidos
const RAPIDO_CUSTO_MAX=3;
function listaPub(){ return S.carreira==='juiz'?S.j.acervo:S.carreira==='promotor'?S.p.casos:S.carreira==='defensor'?S.d.casos:[]; }
function previsaoEnergiaPub(){ const L=listaPub(), tot=L.reduce((a,c)=>a+(c.semana||0),0), wk=S.traits.includes('workaholic')?.7:1;
  const pessoal=Math.max(0,tot-gabCasos())+expPessoal()+S.agenda.estudo+acadBlocos(), lazer=S.agenda.lazer, desc=Math.max(0,S.disp-pessoal-lazer-vidaBlocos());
  const fim=clamp(Math.round(S.energia-3.2*pessoal*wk+3*desc+1.5*lazer),0,traco('insone')?85:100);
  let custo=0; const partes=[];
  if(S.carreira==='juiz'){ const pauta=L.filter(p=>(p.semana||0)>0&&(p.estudo||0)+p.semana>=minSent(p));
    const nc=Math.min(Math.max(0,VIVO_MES-vivoUsadas()),pauta.filter(p=>modoJuiz(p)==='vivo').length), nr=Math.min(Math.max(0,limRapidos()-rapidosUsados()),pauta.filter(p=>modoJuiz(p)==='rapido').length);
    if(nc){ custo+=nc*AV_CUSTO_MAX_J; partes.push(`${nc} audiência${nc>1?'s':''} completa${nc>1?'s':''} (até −${AV_CUSTO_MAX_J} cada)`); }
    if(nr){ custo+=nr*RAPIDO_CUSTO_MAX; partes.push(`${nr} julgamento${nr>1?'s':''} rápido${nr>1?'s':''} (até −${RAPIDO_CUSTO_MAX} cada)`); } }
  else { const n=Math.min(Math.max(0,VIVO_MES-vivoUsadas()),L.filter(c=>c.prazo<=1&&(c.fase===undefined||c.fase==='juizo')&&modoDe(c)==='vivo'&&vivoPermitido(c)).length);
    if(n){ custo+=n*AV_CUSTO_MAX; partes.push(`${n} audiência${n>1?'s':''} ao vivo (até −${AV_CUSTO_MAX} cada)`); } }
  const pior=clamp(fim-custo,0,100), d=fim-Math.round(S.energia);
  return `<p class="num txt-s">Energia: ${Math.round(S.energia)} hoje → <b class="${fim<30?'lo':''}">${fim}</b> no fim do mês (${pessoal} blocos seus de trabalho, ${desc} de descanso, ${lazer} de lazer${d?`, ${d>0?'+':''}${d}`:''})${partes.length?` <span class="${pior<30?'lo':''}">· ${partes.join(' e ')}: no pior caso ${pior}</span>`:''}${fim<30||pior<30?' · abaixo de 30 você perde 10 de chance':''}</p>`; }
{ const r0=render; render=function(){ r0(); if(!S||!['juiz','promotor','defensor'].includes(S.carreira)||view!=='escritorio') return;
    const b=app.querySelector('[data-act=fimSemana]'); if(b&&!app.querySelector('.prev-pub')) b.insertAdjacentHTML('beforebegin',`<div class="prev-pub">${previsaoEnergiaPub()}</div>`); }; }
