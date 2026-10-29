// ===================== ESTRELAS DAS ÁREAS =====================
// áreas do direito vão até 5 estrelas; estudando sozinho o teto é 3, especialização na área libera a 4ª e mestrado ou doutorado a 5ª
const NIV_AREA=[40,55,70,82,92];
const TETO_AREA=[81,91,100]; // sem título · especialização · mestrado/doutorado
const PERK_AREA5=['Mais casos da área aparecem','+2 em casos da área','+4 em casos da área (especialista)','+8 em casos da área e ainda mais casos dela (referência)','+12 em casos da área e mais casos épicos e lendários dela (autoridade)'];
const ehArea=k=>k in AREAS;
const titArea=k=>{ const T=S.ac&&S.ac.titulos; return T&&T.areas?T.areas[k]||0:0; };
const tetoArea=k=>TETO_AREA[titArea(k)];
const estrelas=k=>NIV_AREA.filter(x=>S.skills[k]>=x).length;
function aplicarTetos(){ if(!S||!S.skills) return; for(const k in AREAS) if(S.skills[k]>tetoArea(k)) S.skills[k]=tetoArea(k); }
function estrelasHtml(k){ if(!ehArea(k)) return `${'★'.repeat(nivel(k))}`;
  const e=estrelas(k), lib=[3,4,5][titArea(k)];
  return `<span title="${lib===3?'Estudando sozinho: até 3 estrelas. Especialização na área libera a 4ª, mestrado ou doutorado a 5ª.':lib===4?'Especialização: até 4 estrelas. Mestrado ou doutorado na área libera a 5ª.':'Mestrado ou doutorado: até 5 estrelas.'}">${'★'.repeat(e)}${'☆'.repeat(Math.max(0,lib-e))}<span style="opacity:.25">${'☆'.repeat(5-Math.max(lib,e))}</span></span>`; }
function bonusArea(c,add){ const e=estrelas(c.area); if(e<2) return;
  add(`${AREAS[c.area].nome}: ${['','','','especialista','referência','autoridade'][e]||'estudo'} ${'★'.repeat(e)}`,[0,0,2,4,8,12][e]); }
const pesoArea=a=>{ const e=estrelas(a); return (e>=1?1.5:1)*(e>=4?1.5:1)*(e>=5?1.2:1); };

