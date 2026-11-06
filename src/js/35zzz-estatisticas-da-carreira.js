// ===================== ESTATÍSTICAS DA CARREIRA =====================
// Uma foto por mês (prestígio, patrimônio, energia, estresse, média das skills) e vitórias/derrotas por área.
// Painel "Sua trajetória" na aba Vida, com gráficos de linha desenhados em SVG (cores do tema).
const EST_MAX=240; // fotos guardadas; acima disso, guarda uma a cada duas
function estFoto(){ if(!S||!S.skills) return; const E=S.est||(S.est={fotos:[],areas:{}});
  if(E.fotos.length&&E.fotos[E.fotos.length-1].m===S.semana) return;
  const sk=Object.values(S.skills), media=sk.reduce((a,v)=>a+v,0)/Math.max(1,sk.length);
  E.fotos.push({m:S.semana,p:Math.round(S.prest*10)/10,pat:Math.round(patrimonio()),e:Math.round(S.energia),s:Math.round(S.estresse),sk:Math.round(media*10)/10,car:S.carreira});
  if(E.fotos.length>EST_MAX) E.fotos=E.fotos.filter((f,i)=>i%2===0||i===E.fotos.length-1); }
{ const f0=fimSemana; fimSemana=async function(){ const r=await f0(); if(S&&!S.fim) estFoto(); return r; }; }
{ const d0=depoisDoVeredito; depoisDoVeredito=function(c,ganhou){ d0(c,ganhou); if(!S||!c||!c.area) return; const E=S.est||(S.est={fotos:[],areas:{}});
    const A=E.areas[c.area]||(E.areas[c.area]={v:0,d:0}); A[ganhou?'v':'d']++; }; }
// gráfico de linha: pontos em escala única, rótulos de mínimo e máximo, último ponto destacado
function graficoLinha(fotos,campo,{cor='var(--brass)',fmt=v=>Math.round(v),titulo,dominio}={}){ const W=320,H=120,pl=8,pr=8,pt=14,pb=18;
  const pts=fotos.map(f=>[f.m,f[campo]]).filter(([,v])=>v!==undefined&&v!==null);
  if(pts.length<2) return `<div class="est-g"><span class="label">${titulo}</span><p class="gx-nt">Encerre mais meses para ver a curva.</p></div>`;
  const xs=pts.map(p=>p[0]), ys=pts.map(p=>p[1]); let lo=dominio?dominio[0]:Math.min(...ys), hi=dominio?dominio[1]:Math.max(...ys); if(hi===lo){ hi+=1; lo-=1; }
  const x=v=>pl+(v-xs[0])/Math.max(1,xs[xs.length-1]-xs[0])*(W-pl-pr), y=v=>pt+(1-(v-lo)/(hi-lo))*(H-pt-pb);
  const linha=pts.map(([a,b])=>`${x(a).toFixed(1)},${y(b).toFixed(1)}`).join(' '), [ux,uy]=pts[pts.length-1];
  const area=`${x(xs[0]).toFixed(1)},${(H-pb).toFixed(1)} ${linha} ${x(ux).toFixed(1)},${(H-pb).toFixed(1)}`;
  return `<div class="est-g"><div class="est-h"><span class="label">${titulo}</span><b class="num">${fmt(uy)}</b></div>
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${titulo}: de ${fmt(ys[0])} para ${fmt(uy)}">
      <line x1="${pl}" x2="${W-pr}" y1="${y(hi).toFixed(1)}" y2="${y(hi).toFixed(1)}" class="est-grid"/><line x1="${pl}" x2="${W-pr}" y1="${y(lo).toFixed(1)}" y2="${y(lo).toFixed(1)}" class="est-grid"/>
      <polygon points="${area}" fill="${cor}" opacity=".12"/><polyline points="${linha}" fill="none" stroke="${cor}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/>
      <circle cx="${x(ux).toFixed(1)}" cy="${y(uy).toFixed(1)}" r="2.8" fill="${cor}"/>
      <text x="${pl}" y="${(y(hi)-4).toFixed(1)}" class="est-t">${fmt(hi)}</text><text x="${pl}" y="${H-4}" class="est-t">mês ${xs[0]}</text><text x="${W-pr}" y="${H-4}" class="est-t" text-anchor="end">mês ${ux}</text>
    </svg></div>`; }
const brlCurto=v=>Math.abs(v)>=1e6?`R$ ${(v/1e6).toLocaleString('pt-BR',{maximumFractionDigits:1})} mi`:Math.abs(v)>=1e3?`R$ ${Math.round(v/1e3).toLocaleString('pt-BR')} mil`:brl(v);
function painelTrajetoria(){ if(!S) return ''; estFoto(); const E=S.est, F=E.fotos;
  const areas=Object.keys(AREAS).map(k=>[k,E.areas[k]||{v:0,d:0}]).filter(([,a])=>a.v+a.d>0).sort((a,b)=>(b[1].v+b[1].d)-(a[1].v+a[1].d));
  const maxA=Math.max(1,...areas.map(([,a])=>a.v+a.d));
  const barras=areas.length?`<div class="est-bars">${areas.map(([k,a])=>`<div class="est-bar"><span>${AREAS[k].nome}</span><div class="est-trk"><i class="v" style="width:${a.v/maxA*100}%"></i><i class="d" style="width:${a.d/maxA*100}%"></i></div><b class="num">${a.v}V ${a.d}D</b></div>`).join('')}</div>`
    :'<p class="gx-nt">Os resultados por área aparecem a partir do próximo veredito.</p>';
  const ini=F[0], m=F.length?S.semana-ini.m:0;
  return `<section class="panel est"><div class="panel-head"><h2>Sua trajetória</h2><span class="label">${m} ${m===1?'mês':'meses'} registrados</span></div>
    <div class="est-grid2">
      ${graficoLinha(F,'p',{titulo:S.carreira==='adv'?'Prestígio':'Reputação',dominio:[0,100]})}
      ${graficoLinha(F,'pat',{titulo:'Patrimônio',fmt:brlCurto,cor:'var(--win)'})}
      ${graficoLinha(F,'sk',{titulo:'Média das skills',fmt:v=>v.toLocaleString('pt-BR',{maximumFractionDigits:1}),cor:'var(--navy, var(--brass))'})}
      ${graficoLinha(F,'s',{titulo:'Estresse',dominio:[0,100],cor:'var(--loss)'})}
    </div>
    <span class="label">Resultados por área <small class="gx-mut">· vitórias em verde, derrotas em vermelho</small></span>${barras}
    <p class="gx-nt">O registro começa no primeiro mês jogado depois desta versão; o que aconteceu antes não aparece nos gráficos.</p></section>`; }
{ const r0=renderVida; renderVida=function(){ r0(); app.insertAdjacentHTML('beforeend',painelTrajetoria()); }; }
