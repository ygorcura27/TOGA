// ===================== TRABALHO NOS CASOS: UMA LINHA NA AGENDA, DISTRIBUIÇÃO NA ESTRUTURA =====================
// na agenda você decide quanto trabalha nos casos; os blocos vão para quem mais precisa (manutenção, depois prazo curto,
// depois o que está longe do preparo ideal). Na aba Estrutura e equipe dá para mexer caso a caso.
const falta=c=>{ const m=manut(c), s=c.semana||0, prep=(c.prep||0)+Math.max(0,s-m); return s<m?100+(m-s):Math.max(0,prepIdeal(c)-prep)/Math.max(1,c.prazo); };
const casoQuePrecisa=()=>[...S.casos].sort((a,b)=>falta(b)-falta(a)||a.prazo-b.prazo)[0]||null;
const casoQueSobra=()=>[...S.casos].filter(c=>(c.semana||0)>0).sort((a,b)=>falta(a)-falta(b)||b.prazo-a.prazo)[0]||null;
function painelTrabalhoCasos(){ if(S.carreira!=='adv'||!S.casos.length) return ''; const free=livres();
  return `<section class="panel trab-casos"><div class="panel-head"><h2>Trabalho nos casos</h2><span class="label">${S.casos.reduce((a,c)=>a+(c.semana||0),0)} blocos seus neste mês · ${livres()} livres</span></div>
    <div class="rows">${[...S.casos].sort((a,b)=>a.prazo-b.prazo).map(c=>{ const m=manut(c), s=c.semana||0;
      return `<div class="row"><span class="name" title="${esc(c.titulo)}">${icoArea(c.area)}${esc(c.titulo)} <small style="color:var(--muted)">· ${(c.inst||1)>1?INST[c.inst]:`audiência em ${c.prazo} ${c.prazo>1?'meses':'mês'}`} · manutenção ${m}${s<m?' <b class="lo">em falta</b>':''} · chance ${pct(calcChance(c).ch)}</small></span>${stepper('case',c.id,s,free)}</div>`; }).join('')}</div>
    <p class="label" style="margin:0;text-transform:none;letter-spacing:0;font-weight:400">Os blocos da equipe entram por cima destes${gestorAtual()&&S.u.auto?', distribuídos pelo gestor':''}. Na agenda do escritório você vê só o total.</p></section>`; }
{ const r0=renderEstrutura; renderEstrutura=function(){ r0(); const h=painelGestao()+painelTrabalhoCasos(); if(!h) return;
    const alvo=[...app.children].find(el=>!el.matches('header.top,.ticker,.tut')); if(alvo) alvo.insertAdjacentHTML('beforebegin',h); else app.insertAdjacentHTML('beforeend',h); }; }
// tutorial: o passo de preparar o caso aponta para a linha nova
for(const p of TUT.adv) if(p.alvo==='[data-act=inc][data-k=case]'){ p.alvo='[data-act=inc][data-k=trabalho]'; p.txt='Agora prepare os casos: coloque <b>blocos em Trabalho nos casos</b>. Eles vão primeiro para a manutenção e para os prazos mais curtos; na aba Estrutura e equipe você ajusta caso a caso. Cada bloco aumenta a chance, com retorno decrescente.'; }
