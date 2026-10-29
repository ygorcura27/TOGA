// ===================== UTIL =====================
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rnd=(a,b)=>a+Math.random()*(b-a);
const rint=(a,b)=>Math.floor(rnd(a,b+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const sig=x=>1/(1+Math.exp(-x));
const pct=v=>Math.round(v*100)+'%';
const brl=v=>{const a=Math.abs(v),s=v<0?'−':'';
  if(a>=1e6) return s+'R$ '+(a/1e6).toLocaleString('pt-BR',{maximumFractionDigits:2})+' mi';
  return s+'R$ '+Math.round(a).toLocaleString('pt-BR');};
const sgn=v=>(v>0?'+':v<0?'−':'±')+Math.abs(Math.round(v*10)/10).toLocaleString('pt-BR');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cls=ch=>ch>=.65?'hi':ch>=.4?'mid':'lo';
let uid=Date.now()%100000;

