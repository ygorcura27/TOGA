// ===================== BOOT =====================
function start(data){ S=(data&&data.S)||carregar(); if(S&&S.fim) S=null;
  if(S){ S.carreira=S.carreira||'adv'; S.genero=S.genero||'f'; if(S.vida&&S.vida.carro===undefined) S.vida.carro=0;
    if(!S.mesV&&S.vida){ const f=12/10, ajusta=x=>Math.round(S.semana-(S.semana-x)*f); S.vida.semana0=ajusta(S.vida.semana0); for(const fi of S.vida.filhos||[]) fi.nasc=ajusta(fi.nasc); if(S.vida.parceiro) S.vida.parceiro.desde=ajusta(S.vida.parceiro.desde); } S.mesV=1;
    if(!S.tut) S.tut={off:S.semana>3,t:{}}; migrarEquipeAdv(); if(!S.cq) S.cq=cqInicial(); if(S.ac&&!S.ac.titulos.areas){ const T=S.ac.titulos; T.areas={}; if(T.esp) T.areas[S.espec]=1; if(T.mestrado||T.doutorado) T.areas[S.espec]=2; } if(!S.ac) S.ac=acadInicial(); if(S.skills.didatica===undefined) S.skills.didatica=20; if(!S.npcs) criarColegas(); if(S.vida&&!S.vida.inv){ S.vida.inv=invInicial(); S.vida.alugueis=[]; }
    if(!S.vida){ S.vida=vidaInicial(25+Math.floor((S.semana-1)/ANO)); S.vida.semana0=S.semana; } if(S.agenda.familia===undefined){ S.agenda.familia=0; S.agenda.saude=0; }
    if(!S.u){ if(S.carreira==='adv') S.u=estruturaInicial(false); else estruturaPub(); } if(S.bolso===undefined) S.bolso=3000; if(S.skills.tributario===undefined) S.skills.tributario=20; if(S.j&&!S.j.vara) S.j.vara=S.espec; S.sede=S.sede||'sp'; S.filiais=S.filiais||[]; for(const c of [...S.casos,...S.ofertas]) c.cidade=c.cidade||S.sede; }
  render(); }
window.claude?.hot?.snapshot?.(()=>({S}));
window.claude?.hot?.ready ? window.claude.hot.ready(start) : start(window.claude?.hot?.data ?? {});
// gancho para os testes automáticos (tests/): só existe quando a página abre com ?teste na URL
if(/[?&]teste/.test(location.search)) window.__toga={ get S(){ return S; }, set S(v){ S=v; },
  calcChance, prepCaso, prepIdeal, manut, maxCasos, cargaCaso, estrelas, tetoArea, novoCaso, partidoDe, divisaoRetirada, ANO, MIN_SENT, MIN_ATD, render, salvar };
