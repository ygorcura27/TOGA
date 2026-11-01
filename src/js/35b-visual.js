// ===================== VISUAL: TEMA NOTURNO/CLARO, MARCA, MEDIDOR DE CHANCE E CURVA DE PRESTÍGIO =====================
const TEMA_K='toga-tema';
const temaAtual=()=>document.documentElement.dataset.theme||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
const aplicarTema=t=>{ if(t==='dark'||t==='light') document.documentElement.dataset.theme=t; };
try{ aplicarTema(localStorage.getItem(TEMA_K)); }catch(e){}
const temaBtn=()=>{ const n=temaAtual()==='dark';
  return `<button class="tema" data-act="tema" aria-pressed="${n}" title="Ligar ou desligar o modo noturno"><span class="sw" aria-hidden="true"><i></i></span><span class="tema-t">${n?'Noturno':'Claro'}</span></button>`; };
document.addEventListener('click',e=>{ const b=e.target.closest('[data-act=tema]'); if(!b) return;
  const t=temaAtual()==='dark'?'light':'dark'; aplicarTema(t); try{ localStorage.setItem(TEMA_K,t); }catch(_){}
  document.querySelectorAll('.tema').forEach(x=>{ x.setAttribute('aria-pressed',t==='dark'); x.querySelector('.tema-t').textContent=t==='dark'?'Noturno':'Claro'; }); });
// marca: balança estilizada ao lado do nome
const LOGO='<svg class="logo" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v18M6 21h12M12 5l-7 3m7-3l7 3M5 8l-2.5 6a3 3 0 0 0 5 0L5 8zm14 0l-2.5 6a3 3 0 0 0 5 0L19 8z"/></svg>';
// chance como medidor em arco: a cor segue a faixa (alta, média, baixa)
const medidor=ch=>`<span class="gauge ${cls(ch)}"><svg viewBox="0 0 110 62" aria-hidden="true"><path class="tr" d="M8 56 A47 47 0 0 1 102 56" pathLength="100"/><path class="vl" d="M8 56 A47 47 0 0 1 102 56" pathLength="100" style="stroke-dasharray:${Math.max(1,Math.round(ch*100))} 100"/></svg><strong>${pct(ch)}</strong></span>`;
// curva do prestígio nos últimos 24 meses, ao lado do número no cabeçalho
function curvaPrest(){ const h=(S&&S.hp)||[]; if(h.length<2) return '';
  const W=64,H=18, ps=h.map(x=>x.p), mn=Math.min(...ps), mx=Math.max(...ps), d=Math.max(1,mx-mn);
  const pts=h.map((x,i)=>`${(i/(h.length-1)*W).toFixed(1)},${(H-1-(x.p-mn)/d*(H-2)).toFixed(1)}`).join(' ');
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" role="img" aria-label="Prestígio nos últimos ${h.length} meses: de ${ps[0]} para ${ps[ps.length-1]}"><polyline points="${pts}"/></svg>`; }
{ const h0=header; header=function(){
    if(S){ const h=S.hp||(S.hp=[]), p=Math.round(S.prest), u=h[h.length-1];
      if(!u||u.s!==S.semana) h.push({s:S.semana,p}); else u.p=p; if(h.length>24) h.shift(); }
    return h0().replace(/(<div class="brand">[\s\S]*?<\/span><\/div>)/,`$1${temaBtn()}`)
      .replace(/(<span class="label">(?:Prestígio|Reputação)<\/span><b>[^<]*<\/b>)/,`$1${curvaPrest()}`); }; }
