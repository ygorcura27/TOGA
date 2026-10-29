// ===================== CAPITAL POLÍTICO (carreiras públicas) =====================
// listas de merecimento, indicação presidencial e listas tríplices pesam reputação, integridade e articulação política
const capPol=()=>{ const amigos=(S.npcs||[]).filter(n=>n.rel>=50&&n.nivel>=2).length; return clamp((S.pol??10)+Math.min(20,amigos*5),0,100); };
function articular(){ if(ocupado||S.polEm===S.semana||dinheiroPessoal()<2000) return;
  pagarPessoal(2000); S.vida.falta=(S.vida.falta||0)+2; S.polEm=S.semana;
  const g=Math.round((5+S.skills.negociacao/25+S.skills.oratoria/40)*10)/10; S.pol=clamp((S.pol??10)+g,0,100);
  addLog(`Você circulou em eventos, associações e gabinetes: capital político +${g.toLocaleString('pt-BR')}.`,'g'); salvar(); render(); }
const linhaPol=()=>`<dt>Capital político</dt><dd class="num">${Math.round(capPol())} <button class="chip" data-act="articular" ${S.polEm===S.semana||dinheiroPessoal()<2000?'disabled':''} title="Eventos, associações de classe e conversas em gabinetes. Custa 2 blocos no próximo mês e ${brl(2000)}.">${S.polEm===S.semana?'articulado neste mês':'Articular apoio · '+brl(2000)}</button></dd>`;
function semanaPolitica(){ if(['juiz','promotor','defensor'].includes(S.carreira)) S.pol=clamp((S.pol??10)-.4,0,100); }

