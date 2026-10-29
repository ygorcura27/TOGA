// ===================== MODAL =====================
const mroot=document.getElementById('modal-root');
function modal(html,botoes,onMount){
  return new Promise(res=>{
    mroot.innerHTML=`<div class="ov"><div class="modal" role="dialog" aria-modal="true">${html}
      ${botoes&&botoes.length?`<div class="actions">${botoes.map((b,i)=>`<button class="btn ${b.cls||''}" data-mi="${i}" ${b.dis?'disabled':''}>${b.t}</button>`).join('')}</div>`:''}</div></div>`;
    const box=mroot.querySelector('.modal');
    box.addEventListener('click',e=>{const b=e.target.closest('[data-mi],[data-mv]'); if(!b||b.disabled) return;
      const v=b.dataset.mv!==undefined?b.dataset.mv:botoes[+b.dataset.mi].v; mroot.innerHTML=''; res(v);});
    if(onMount) onMount(box);
    const f=box.querySelector('button:not(:disabled)'); if(f) f.focus();
  });
}
const reduz=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function balanca(box,ch,r,hist=0){
  return new Promise(done=>{
    const ptr=box.querySelector('.ptr'); const dur=reduz?0:2300; const t0=performance.now();
    const step=now=>{const t=Math.min(1,(now-t0)/(dur||1)); const k=t*2.3;
      const pos=dur? clamp(r+.55*Math.exp(-2.6*k)*Math.sin(11*k)*(1-t),0,1):r;
      ptr.style.left=(pos*100)+'%'; if(t<1) requestAnimationFrame(step); else done();};
    requestAnimationFrame(step);
  });
}
function htmlBalanca(ch,hist,l='vitória',r='derrota'){return `<div class="scale"><div class="zone" style="width:${ch*100}%"></div>${hist?`<div class="hist" style="width:${hist*100}%"></div>`:''}<div class="ptr" style="left:50%"></div></div>
  <div class="scale-lbl"><span>◀ ${l}${hist?' (dourado: histórica)':''}</span><span>${r} ▶</span></div>`;}

// rolagem simples com balança, para eventos com chance
async function rolar(titulo,texto,ch,okTxt,failTxt){
  const r=Math.random(); const ok=r<=ch;
  await modal(`<h2>${titulo}</h2><p>${texto}</p><p class="num">Chance: <b>${pct(ch)}</b></p>${htmlBalanca(ch,0,okTxt.toLowerCase(),failTxt.toLowerCase())}
    <div class="verdict ${ok?'hi':'lo'}" hidden>${ok?okTxt:failTxt}</div>`,[{t:'Continuar',v:1,dis:true}],async box=>{
      await balanca(box,ch,r); box.querySelector('.verdict').hidden=false; const b=box.querySelector('[data-mi]'); b.disabled=false; b.focus();});
  return ok;
}

