// ===================== TRILHA SONORA =====================
// Música ambiente sintetizada no navegador (sem arquivos): acordes suaves e um piano esparso.
// O clima muda com a tela: escritório (calmo, menor), vida e jornal (claro, maior), audiência ao vivo (tenso, com pulso).
// Começa desligada; o botão ♪ no cabeçalho liga e desliga, e a escolha fica guardada neste navegador.
const MUS_KEY='toga-musica';
const musicaLigada=()=>{ try{ return localStorage.getItem(MUS_KEY)==='on'; }catch(e){ return false; } };
const MUS_CLIMAS={
  escritorio:{bpm:60,acordes:[[57,60,64,67],[53,57,60,64],[48,52,55,59],[55,59,62,64]],escala:[69,71,72,74,76,79,81],nota:.38,pulso:false,vol:.05},
  leve:{bpm:66,acordes:[[48,52,55,59],[57,60,64,67],[53,57,60,64],[55,59,62,67]],escala:[72,74,76,79,81,84],nota:.42,pulso:false,vol:.05},
  audiencia:{bpm:84,acordes:[[50,53,57,60],[46,50,53,57],[43,46,50,53],[45,49,52,57]],escala:[62,64,65,67,69,70,72],nota:.5,pulso:true,vol:.06},
};
const hz=m=>440*Math.pow(2,(m-69)/12);
let musCtx=null, musMaster=null, musTimer=null, musProx=0, musPasso=0, musClima='escritorio';
function climaAtual(){ if(document.querySelector('.av-ov')) return 'audiencia'; if(!S) return 'leve'; return ['vida','jornal','conquistas','ajuda'].includes(view)?'leve':'escritorio'; }
function musIniciar(){ if(musCtx&&musTimer) return;
  try{ musCtx=musCtx||new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ return; }
  if(musCtx.state==='suspended') musCtx.resume();
  if(!musMaster){ const g=musCtx.createGain(), lp=musCtx.createBiquadFilter(), dl=musCtx.createDelay(1), fb=musCtx.createGain(), wet=musCtx.createGain();
    g.gain.value=0; lp.type='lowpass'; lp.frequency.value=2200; dl.delayTime.value=.42; fb.gain.value=.32; wet.gain.value=.28;
    g.connect(lp); lp.connect(musCtx.destination); lp.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(wet); wet.connect(musCtx.destination); musMaster=g; }
  const v=MUS_CLIMAS[climaAtual()].vol; musMaster.gain.cancelScheduledValues(musCtx.currentTime); musMaster.gain.linearRampToValueAtTime(v,musCtx.currentTime+2.5);
  musProx=musCtx.currentTime+.1; musTimer=setInterval(musAgendar,250); }
function musParar(){ if(!musCtx||!musMaster) return; clearInterval(musTimer); musTimer=null; musMaster.gain.cancelScheduledValues(musCtx.currentTime); musMaster.gain.linearRampToValueAtTime(0,musCtx.currentTime+1.2); }
function musVoz(freq,t,dur,vol,tipo='sine'){ const o=musCtx.createOscillator(), g=musCtx.createGain(); o.type=tipo; o.frequency.value=freq;
  g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+Math.min(.9,dur*.3)); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g).connect(musMaster); o.start(t); o.stop(t+dur+.05); }
function musPiano(freq,t,vol){ const o=musCtx.createOscillator(), o2=musCtx.createOscillator(), g=musCtx.createGain(); o.type='triangle'; o2.type='sine'; o.frequency.value=freq; o2.frequency.value=freq*2;
  g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+.01); g.gain.exponentialRampToValueAtTime(.0001,t+1.6);
  o.connect(g); o2.connect(g); g.connect(musMaster); o.start(t); o2.start(t); o.stop(t+1.7); o2.stop(t+1.7); }
// agenda um compasso de cada vez, com folga de 1 segundo
function musAgendar(){ if(!musCtx||document.hidden) return; const novo=climaAtual();
  if(novo!==musClima){ musClima=novo; musMaster.gain.linearRampToValueAtTime(MUS_CLIMAS[novo].vol,musCtx.currentTime+2); }
  const C=MUS_CLIMAS[musClima], tempo=60/C.bpm;
  while(musProx<musCtx.currentTime+1){ const t=musProx, compasso=Math.floor(musPasso/8), batida=musPasso%8, ac=C.acordes[compasso%C.acordes.length];
    if(batida===0){ const dur=tempo*8+.6; for(const m of ac){ musVoz(hz(m),t,dur,.05,'sine'); musVoz(hz(m)*1.003,t,dur,.03,'triangle'); } musVoz(hz(ac[0]-12),t,dur,.06,'sine'); }
    if(C.pulso&&batida%2===0) musVoz(hz(ac[0]-24),t,tempo*.8,.07,'sine');
    if(Math.random()<C.nota) musPiano(hz(C.escala[Math.floor(Math.random()*C.escala.length)]),t+(Math.random()<.3?tempo/2:0),.05);
    musProx+=tempo; musPasso++; } }
document.addEventListener('visibilitychange',()=>{ if(!musCtx) return; if(document.hidden) musCtx.suspend(); else if(musicaLigada()) musCtx.resume(); });
// navegadores só tocam som depois de um clique: com a música ligada, o primeiro clique da sessão começa a tocar
document.addEventListener('click',()=>{ if(musicaLigada()&&!musTimer) musIniciar(); },{capture:true});
// botão no cabeçalho, ao lado do modo noturno
const musBtn=()=>`<button class="tema musica-btn" data-act="musica" aria-pressed="${musicaLigada()}" title="Ligar ou desligar a música"><span aria-hidden="true">♪</span><span class="tema-t">${musicaLigada()?'Música':'Sem música'}</span></button>`;
{ const r0=render; render=function(){ r0(); const t=app.querySelector('.tema:not(.musica-btn)'); if(t&&!app.querySelector('.musica-btn')) t.insertAdjacentHTML('afterend',musBtn()); }; }
document.addEventListener('click',e=>{ const b=e.target.closest('[data-act=musica]'); if(!b) return;
  try{ localStorage.setItem(MUS_KEY,musicaLigada()?'off':'on'); }catch(e){}
  if(musicaLigada()) musIniciar(); else musParar();
  for(const x of document.querySelectorAll('.musica-btn')){ x.setAttribute('aria-pressed',musicaLigada()); x.querySelector('.tema-t').textContent=musicaLigada()?'Música':'Sem música'; } });
