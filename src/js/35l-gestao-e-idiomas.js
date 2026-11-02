// ===================== GESTÃO E IDIOMAS: SKILLS DO TITULAR PARA CRESCER =====================
// abrir filial exige que você saiba administrar: 2★ em Gestão para outro bairro, 3★ para outra cidade,
// 4★ para outro país (e 3★ em Idiomas, menos em país de língua portuguesa). Estrelas como nas áreas: 40 · 55 · 70 · 82 · 92.
SKILLS.gestao='Gestão'; SKILLS.idiomas='Idiomas';
const SK5=['gestao','idiomas'];
const estrelasSk=k=>NIV_AREA.filter(x=>(S.skills[k]||0)>=x).length;
function reqFilial(C){ if(!C) return null; const pt=C.pais==='Portugal';
  const g=C.nivel==='regional'?2:C.nivel==='global'?4:3, i=C.nivel==='global'&&!pt?3:0;
  return {g,i}; }
function faltaFilial(C){ const r=reqFilial(C); if(!r) return '';
  const fg=estrelasSk('gestao')<r.g, fi=r.i&&estrelasSk('idiomas')<r.i;
  if(fg&&fi) return `Exige ${r.g}★ em Gestão e ${r.i}★ em Idiomas`;
  if(fg) return `Exige ${r.g}★ em Gestão (${C.nivel==='regional'?'outro bairro':C.nivel==='global'?'outro país':'outra cidade'})`;
  if(fi) return `Exige ${r.i}★ em Idiomas`;
  return ''; }
{ const m0=motivoAbrir; motivoAbrir=function(k){ return m0(k)||faltaFilial(LOC[k]); }; }
// Gestão ajuda a organizar a equipe; Idiomas ajudam nos casos no exterior
{ const o0=organizacao; organizacao=function(){ const o=o0(); return S.carreira==='adv'?clamp(Math.round(o+(S.skills.gestao-40)/4),0,100):o; }; }
{ const b0=bonusPerks; bonusPerks=function(c,add){ b0(c,add); const L=LOC[c.cidade];
    if(L&&L.nivel==='global'&&L.pais!=='Portugal'){ const e=estrelasSk('idiomas'); add(e>=3?`Idiomas ${'★'.repeat(e)}`:'Idioma estrangeiro fraco',e>=3?2*(e-2):-4); } }; }
// 5 estrelas na tela de skills, sem cadeado (não dependem de título)
{ const e0=estrelasHtml; estrelasHtml=function(k){ if(!SK5.includes(k)) return e0(k); const e=estrelasSk(k); return `${'★'.repeat(e)}<span style="opacity:.35">${'☆'.repeat(5-e)}</span>`; }; }
// saves antigos e jogos novos começam com as duas skills
{ const r0=render; render=function(){ if(S&&S.skills){ if(S.skills.gestao===undefined) S.skills.gestao=25; if(S.skills.idiomas===undefined) S.skills.idiomas=20; } r0(); }; }
