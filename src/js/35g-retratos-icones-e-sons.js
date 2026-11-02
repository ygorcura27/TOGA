// ===================== RETRATOS, ÍCONES POR ÁREA E SONS DA AUDIÊNCIA =====================
// retratos gerados a partir do nome (sem arquivos): sempre o mesmo rosto para a mesma pessoa
function hashNome(s){ let h=2166136261; for(const ch of String(s)){ h^=ch.charCodeAt(0); h=Math.imul(h,16777619); } return h>>>0; }
const FEM_NOMES=new Set([...PRIM_F,'Ana','Carla','Elisa','Gabriela','Isabela','Karen','Marina','Olívia','Rita','Tânia','Yara','Bianca','Luíza','Helena','Camila','Beatriz','Patrícia','Renata','Aline','Marta','Inês','Sônia','Lívia','Clara']);
function generoDe(nome){ const n=String(nome).replace(/^(Dra?\.|Servidora?|Promotora?|Defensora?|Juíza|Juiz|Ministra?|Desembargadora?)\s+/,''), p=n.split(' ')[0];
  if(/^Dra\.|^Juíza|^Ministra|^Desembargadora|^Promotora|^Defensora/.test(nome)) return 'f'; if(/^Dr\.|^Juiz |^Ministro|^Desembargador |^Promotor |^Defensor /.test(nome)) return 'm';
  return FEM_NOMES.has(p)||/a$/.test(p)?'f':'m'; }
const PELE=['#F3D4B6','#E2B48D','#C58C60','#9B6440','#6C4329'], CABELO=['#1D1A17','#3A281D','#6A482C','#A9773E','#CFC6BA'], FUNDO=['#3A6FB8','#7A55BF','#3F9466','#B9597A','#B08A2E','#2A9D8F'];
function retrato(nome,o={}){ const h=hashNome(nome), g=o.g||generoDe(nome), sz=o.size||40, pele=PELE[h%5], cab=CABELO[(h>>3)%5], fundo=FUNDO[(h>>6)%6];
  const estilo=(h>>9)%3, oculos=((h>>12)%4)===0, roupa=o.toga?'#111318':['#23262E','#2E3B55','#4A3A2E','#2F2F35'][(h>>14)%4];
  let cabelo;
  if(g==='f') cabelo=[`<path d="M18 30c0-11 6-17 14-17s14 6 14 17v16h-5V31c-3-4-6-6-9-6s-6 2-9 6v15h-5z" fill="${cab}"/>`,
    `<path d="M18 31c0-11 6-18 14-18s14 7 14 18c0 5-1 9-3 11l-1-12c-3-3-6-5-10-5s-7 2-10 5l-1 12c-2-2-3-6-3-11z" fill="${cab}"/>`,
    `<circle cx="32" cy="12" r="6" fill="${cab}"/><path d="M19 30c0-10 6-16 13-16s13 6 13 16c-3-5-8-8-13-8s-10 3-13 8z" fill="${cab}"/>`][estilo];
  else cabelo=[`<path d="M19 28c0-9 6-14 13-14s13 5 13 14c-3-4-8-6-13-6s-10 2-13 6z" fill="${cab}"/>`,
    `<path d="M19 29c0-10 6-15 13-15 8 0 13 5 13 13-5-1-11-4-14-8-2 5-7 8-12 10z" fill="${cab}"/>`,
    `<path d="M21 36c1 7 5 11 11 11s10-4 11-11c-2 4-6 6-11 6s-9-2-11-6z" fill="${cab}" opacity=".9"/><path d="M21 25c2-6 6-9 11-9s9 3 11 9c-3-2-7-3-11-3s-8 1-11 3z" fill="${cab}" opacity=".85"/>`][estilo];
  const gola=o.toga?'<path d="M28 50l4 6 4-6" fill="#F4F1EA"/>':'<path d="M27 49l5 7 5-7" fill="#F4F1EA"/><path d="M31 52h2l1 8h-4z" fill="'+fundo+'"/>';
  return `<svg class="retrato ${o.cls||''}" width="${sz}" height="${sz}" viewBox="0 0 64 64" role="img" aria-label="${esc(nome)}"><circle cx="32" cy="32" r="32" fill="${fundo}" opacity=".28"/>
    <clipPath id="rc${h}"><circle cx="32" cy="32" r="32"/></clipPath><g clip-path="url(#rc${h})">
    <path d="M10 64c2-10 10-16 22-16s20 6 22 16z" fill="${roupa}"/>${gola}<rect x="28" y="40" width="8" height="9" rx="3" fill="${pele}"/>
    <ellipse cx="32" cy="31" rx="12" ry="14" fill="${pele}"/>${cabelo}
    <circle cx="27.5" cy="31" r="1.3" fill="#1D1A17"/><circle cx="36.5" cy="31" r="1.3" fill="#1D1A17"/><path d="M29 38c2 1.4 4 1.4 6 0" stroke="#6E3B2E" stroke-width="1.3" fill="none" stroke-linecap="round"/>
    ${oculos?'<g fill="none" stroke="#1D1A17" stroke-width="1.2"><circle cx="27.5" cy="31" r="3.4"/><circle cx="36.5" cy="31" r="3.4"/><path d="M30.9 31h2.2"/></g>':''}</g></svg>`; }
// ícone por área do Direito, no título de cada pasta
const ICO_AREA={penal:'<circle cx="8" cy="14" r="4"/><circle cx="16" cy="14" r="4"/><path d="M10 10l1.5-4h1L14 10"/>',
  civel:'<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 11h7M9 15h7M9 18h4"/>',
  trabalho:'<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M9 8V5h6v3M3 13h18"/>',
  familia:'<path d="M4 11l8-7 8 7v9H4z"/><path d="M12 17s-3-2-3-4a1.6 1.6 0 0 1 3-.8 1.6 1.6 0 0 1 3 .8c0 2-3 4-3 4z"/>',
  empresarial:'<path d="M4 21V5l8-2v18M12 9l8 2v10M7 8h2M7 12h2M7 16h2M15 13h2M15 17h2M3 21h18"/>',
  tributario:'<circle cx="12" cy="12" r="8"/><path d="M14.5 9.5c-.5-1-1.5-1.5-2.5-1.5-1.5 0-2.5.8-2.5 2s1 1.6 2.5 2 2.5.8 2.5 2-1 2-2.5 2c-1 0-2-.5-2.5-1.5M12 6.5v1.5M12 16v1.5"/>'};
const icoArea=a=>`<svg class="ico-area" viewBox="0 0 24 24" aria-hidden="true">${ICO_AREA[a]||ICO_AREA.civel}</svg>`;
const fichaPessoa=(nome,papel,o)=>`<span class="ficha">${retrato(nome,{size:30,...o})}<span><b>${esc(nome)}</b><small>${papel}</small></span></span>`;
{ const p0=pasta; pasta=function(c,ativo){ let h=p0(c,ativo).replace('<h3>',`<h3>${icoArea(c.area)}`); const r=typeof rivalDe==='function'?rivalDe(c):null;
    return h.replace('</h3>',`</h3><div class="fichas">${fichaPessoa(c.cliente,'cliente')}${r?fichaPessoa(r.nome,'advogado rival'):''}${fichaPessoa(c.juizNome,'quem julga',{toga:true})}</div>`); }; }
{ const m0=mpCard; mpCard=function(c){ return m0(c).replace('<h3>',`<h3>${icoArea(c.area)}`).replace('</h3>',`</h3><div class="fichas">${fichaPessoa(c.reu,'investigado')}</div>`); }; }
{ const d0=dpCard; dpCard=function(c){ return d0(c).replace('<h3>',`<h3>${icoArea(c.area)}`).replace('</h3>',`</h3><div class="fichas">${fichaPessoa(c.assistido,c.preso?'assistido · preso':'assistido')}</div>`); }; }
{ const c0=procCard; procCard=function(p){ return c0(p).replace('<h3>',`<h3>${icoArea(p.area)}`).replace('</h3>',`</h3><div class="fichas">${fichaPessoa(p.cliente,'autor')}</div>`); }; }
// você no cabeçalho
{ const h0=header; header=function(){ const h=h0(); return S?h.replace('<h1>Toga</h1><span>',`<h1>Toga</h1>${retrato(S.nome,{g:S.genero,size:34,cls:'eu',toga:['juiz'].includes(S.carreira)})}<span>`):h; }; }

// ---------- sons: martelo no veredito, murmúrio nos lances fortes, carimbo na sentença ----------
function ruido(dur,freq,vol,t0=0){ const ctx=audioCtx, n=Math.floor(ctx.sampleRate*dur), b=ctx.createBuffer(1,n,ctx.sampleRate), d=b.getChannelData(0);
  for(let i=0;i<n;i++) d[i]=(Math.random()*2-1)*(1-i/n);
  const src=ctx.createBufferSource(), f=ctx.createBiquadFilter(), g=ctx.createGain(), t=ctx.currentTime+t0;
  src.buffer=b; f.type='lowpass'; f.frequency.value=freq; g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  src.connect(f).connect(g).connect(ctx.destination); src.start(t); }
function batida(freq,t0,vol){ const ctx=audioCtx, o=ctx.createOscillator(), g=ctx.createGain(), t=ctx.currentTime+t0;
  o.type='sine'; o.frequency.setValueAtTime(freq,t); o.frequency.exponentialRampToValueAtTime(freq*.5,t+.15);
  g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(.0001,t+.22); o.connect(g).connect(ctx.destination); o.start(t); o.stop(t+.25); }
{ const t0=tocar; tocar=function(tipo){ if(!['martelo','murmurio','carimbo'].includes(tipo)) return t0(tipo); if(!somLigado()) return;
    try{ audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();
      if(tipo==='martelo'){ for(const t of [0,.32]){ batida(140,t,.35); ruido(.06,2500,.25,t); } }
      if(tipo==='murmurio') ruido(.9,500,.05);
      if(tipo==='carimbo'){ batida(90,0,.3); ruido(.08,1200,.2); } }catch(e){} }; }
// o martelo bate antes do resultado aparecer em qualquer veredito
new MutationObserver(ms=>{ for(const m of ms){ const el=m.target; if(el.classList&&el.classList.contains('verdict')&&!el.hidden) tocar('martelo'); } })
  .observe(document.getElementById('modal-root'),{subtree:true,attributes:true,attributeFilter:['hidden']});
