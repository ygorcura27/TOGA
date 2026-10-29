// ===================== AGENDA =====================
function blocosUsados(){let n=S.agenda.estudo+S.agenda.lazer+vidaBlocos()+acadBlocos()+estudBlocos();
  if(S.carreira==='juiz') for(const p of S.j.acervo) n+=p.semana||0;
  if(S.carreira==='promotor') for(const c of S.p.casos) n+=c.semana||0;
  if(S.carreira==='defensor') for(const c of S.d.casos) n+=c.semana||0;
  for(const c of S.casos){ n+=c.semana||0; for(const k in c.apoios) if(c.apoios[k]===1) n+=APOIOS[k].blocos; } return n;}
function trabalhoSemana(){return blocosUsados()-S.agenda.lazer-vidaBlocos();}
function livres(){return S.disp+gabinete()+(S.carreira==='adv'?blocoEscrita():0)-blocosUsados();}

