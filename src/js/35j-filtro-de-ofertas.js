// ===================== FILTRO E ORDEM DOS CASOS NOVOS DO MÊS =====================
// a escolha fica salva na partida: vale para os meses seguintes até você mudar
const OF_ORDEM={padrao:'Ordem de chegada',chance:'Maior chance',honorario:'Maior honorário',facil:'Menor dificuldade',dificil:'Maior dificuldade'};
const OF_FILTRO={todos:'Todos',ch50:'Chance de 50% ou mais',ch70:'Chance de 70% ou mais',valor50:'Causa de R$ 50 mil ou mais',raro:'Raros ou maiores',area:'Só da área de especialização'};
const filtroOf=()=>S.filtroOf||(S.filtroOf={ordem:'padrao',filtro:'todos'});
function ofertasFiltradas(){ const F=filtroOf(), ch=c=>calcChance(c).ch;
  const passa={todos:()=>true,ch50:c=>ch(c)>=.5,ch70:c=>ch(c)>=.7,valor50:c=>c.valor>=50000,raro:c=>RORD.indexOf(c.rar)>=2,area:c=>c.area===S.espec}[F.filtro]||(()=>true);
  const L=S.ofertas.filter(passa);
  const ord={chance:(a,b)=>ch(b)-ch(a),honorario:(a,b)=>b.valor-a.valor,facil:(a,b)=>a.d-b.d,dificil:(a,b)=>b.d-a.d}[F.ordem];
  return ord?[...L].sort(ord):L; }
function filtroOfertasHtml(){ if(!S.ofertas.length) return ''; const F=filtroOf(), n=ofertasFiltradas().length;
  const sel=(id,opts,v)=>`<select id="${id}" data-filtro-of="${id}">${Object.entries(opts).map(([k,t])=>`<option value="${k}" ${v===k?'selected':''}>${t}</option>`).join('')}</select>`;
  return `<div class="filtro-of"><label class="label" for="of-ordem">Ordenar</label>${sel('of-ordem',OF_ORDEM,F.ordem)}<label class="label" for="of-filtro">Mostrar</label>${sel('of-filtro',OF_FILTRO,F.filtro)}
    <span class="label">${n===S.ofertas.length?`${n} caso${n>1?'s':''}`:`${n} de ${S.ofertas.length} casos`}</span></div>`; }
document.addEventListener('change',e=>{ const id=e.target.dataset&&e.target.dataset.filtroOf; if(!id||!S) return;
  const F=filtroOf(); if(id==='of-ordem') F.ordem=e.target.value; else F.filtro=e.target.value; salvar(); render(); });
