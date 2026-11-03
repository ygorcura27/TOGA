// ===================== GESTÃO E FILTRO NAS CARREIRAS PÚBLICAS =====================
// Juiz, promotor e defensor seguem o mesmo padrão da advocacia: a pilha de casos tem filtro e ordem,
// e no topo da aba Estrutura e equipe ficam a regra das audiências, os acordos automáticos e a distribuição da equipe.
const chancePub=c=>S.carreira==='juiz'?calcAcerto(c).ch:S.carreira==='promotor'?calcCondenacao(c).ch:calcDefesa(c).ch;
const NOME_PILHA={juiz:['processo','processos'],promotor:['inquérito','inquéritos'],defensor:['assistido','assistidos']};
// ---------- filtro e ordem da pilha ----------
const PUB_ORDEM={padrao:'Mais urgentes',raridade:'Maior raridade',chance:'Maior chance',chanceMenor:'Menor chance',dificil:'Maior dificuldade'};
const pubFiltros=()=>({todos:'Todos',urgentes:S.carreira==='defensor'?'Audiência neste mês ou no próximo':'Atrasados',raro:'Raros ou maiores',
  ...(S.carreira==='defensor'?{presos:'Assistidos presos'}:{}),ch50:'Chance abaixo de 50%',area:'Só da área de especialização'});
const filtroPub=()=>S.filtroPub||(S.filtroPub={ordem:'padrao',filtro:'todos'});
function pilha(L){ const F=filtroPub(), D=S.carreira==='defensor';
  const passa={todos:()=>true,urgentes:c=>D?c.prazo<=2:c.idade>c.meta,raro:c=>RORD.indexOf(c.rar)>=2,presos:c=>!!c.preso,ch50:c=>chancePub(c)<.5,area:c=>c.area===S.espec}[F.filtro]||(()=>true);
  const ord={raridade:(a,b)=>RORD.indexOf(b.rar)-RORD.indexOf(a.rar),chance:(a,b)=>chancePub(b)-chancePub(a),chanceMenor:(a,b)=>chancePub(a)-chancePub(b),dificil:(a,b)=>b.d-a.d}[F.ordem];
  const r=L.filter(passa); return ord?r.sort(ord):r; }
function filtroPubHtml(total,n){ if(!total) return ''; const F=filtroPub(), [um,v]=NOME_PILHA[S.carreira];
  const sel=(id,opts,val)=>`<select id="${id}" data-filtro-pub="${id}">${Object.entries(opts).map(([k,t])=>`<option value="${k}" ${val===k?'selected':''}>${t}</option>`).join('')}</select>`;
  return `<div class="filtro-of"><label class="label" for="pub-ordem">Ordenar</label>${sel('pub-ordem',PUB_ORDEM,F.ordem)}<label class="label" for="pub-filtro">Mostrar</label>${sel('pub-filtro',pubFiltros(),F.filtro)}
    <span class="label">${n===total?`${n} ${n>1?v:um}`:`${n} de ${total} ${v}`}</span></div>`; }
const vazioFiltro=()=>`<p class="empty">Nenhum ${NOME_PILHA[S.carreira][0]} com esse filtro. Troque em “Mostrar”.</p>`;
document.addEventListener('change',e=>{ const id=e.target.dataset&&e.target.dataset.filtroPub; if(!id||!S) return;
  const F=filtroPub(); if(id==='pub-ordem') F.ordem=e.target.value; else F.filtro=e.target.value; salvar(); render(); });
// ---------- acordos automáticos (conciliação no juiz, ANPP no promotor, acordo no defensor) ----------
function candidatosAcordo(){ const G=gestao();
  if(S.carreira==='juiz') return S.j.acervo.filter(p=>concilia(p)&&!p.concFalhou&&chanceConc()>=G.minAc).map(p=>[p,chanceConc()]);
  if(S.carreira==='promotor') return S.p.casos.filter(c=>c.acordo&&!c.acordoFalhou&&chanceAcordoMP()>=G.minAc).map(c=>[c,chanceAcordoMP()]);
  if(S.carreira==='defensor') return S.d.casos.filter(c=>c.acordo&&!c.acordoFalhou&&chanceAcordoDP()>=G.minAc).map(c=>[c,chanceAcordoDP()]);
  return []; }
function acordosAutomaticos(){ if(!pubAtual()||!gestao().acordo) return; let ok=0, nao=0;
  for(const [c,ch] of candidatosAcordo()){ const deu=Math.random()<ch, g=RAR[c.rar].ganho/2;
    if(S.carreira==='juiz'){ if(deu){ S.prest=clamp(S.prest+g,0,100); S.j.sentencas++; S.j.transitadas++; S.j.acervo=S.j.acervo.filter(x=>x!==c); } else c.concFalhou=true; }
    else if(S.carreira==='promotor'){ if(deu){ S.prest=clamp(S.prest+g,0,100); S.p.acordos++; S.p.casos=S.p.casos.filter(x=>x!==c); } else c.acordoFalhou=true; }
    else { if(deu){ S.prest=clamp(S.prest+g,0,100); S.d.acordos++; S.d.atendimentos++; S.d.vitorias++; S.d.casos=S.d.casos.filter(x=>x!==c); } else c.acordoFalhou=true; }
    if(deu){ ok++; addLog(`Acordo automático em “${c.titulo}” (chance ${pct(ch)}). ${sgn(g)} reputação.`,'g'); } else nao++; }
  if(nao) addLog(`${nao} tentativa(s) automática(s) de acordo sem sucesso.`,'r'); }
{ const j0=fimSemanaJuiz; fimSemanaJuiz=async function(){ if(!ocupado) acordosAutomaticos(); return j0(); }; }
{ const m0=fimSemanaMP; fimSemanaMP=async function(){ if(!ocupado) acordosAutomaticos(); return m0(); }; }
{ const d0=fimSemanaDP; fimSemanaDP=async function(){ if(!ocupado) acordosAutomaticos(); return d0(); }; }
// ---------- painel de gestão para as carreiras públicas ----------
const GESTAO_AUD_PUB=()=>S.carreira==='juiz'
  ?{raras:'Presido ao vivo as raras ou maiores',epicas:'Presido ao vivo só as épicas e lendárias',nenhuma:'Tudo pelo gabinete'}
  :{raras:'Eu vou às raras ou maiores',epicas:'Eu vou só às épicas e lendárias',nenhuma:'O assessor vai sempre que puder'};
const NOME_ACORDO={juiz:'Tentar conciliação sozinho nos processos que admitem acordo',promotor:'Propor acordo de não persecução sozinho quando couber',defensor:'Fechar acordo sozinho quando couber'};
function painelGestaoPub(){ if(!pubAtual()) return ''; const G=gestao(), U=S.u, g=gestorAtual(), J=S.carreira==='juiz';
  const opt=(o,v)=>Object.entries(o).map(([k,t])=>`<option value="${k}" ${String(v)===k?'selected':''}>${t}</option>`).join('');
  const nt=t=>`<p class="label" style="margin:0;text-transform:none;letter-spacing:0;font-weight:400">${t}</p>`;
  const cand=candidatosAcordo().length;
  return `<section class="panel gestao" style="margin-bottom:16px"><div class="panel-head"><h2>Gestão ${J?'do gabinete':S.carreira==='promotor'?'da promotoria':'da defensoria'}</h2><span class="label">${G.acordo||(U.auto&&g)||G.aud!=='raras'?'automática':'manual'}</span></div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px 24px;align-items:start">
    <div style="display:grid;gap:8px"><span class="label">Acordos</span>
      <label class="row"><input type="checkbox" data-gestao="acordo" ${G.acordo?'checked':''}> <span>${NOME_ACORDO[S.carreira]}</span></label>
      <div class="row"><span class="name">Chance mínima</span><select data-gestao="minAc" ${G.acordo?'':'disabled'}>${opt({'0.4':'40%','0.5':'50%','0.6':'60%','0.7':'70%'},G.minAc)}</select></div>
      ${nt(`Tenta no fechamento do mês, sem abrir janela. Hoje ${cand} ${cand===1?'caso passa':'casos passam'} na regra. Se não der acordo, o caso segue normal.`)}</div>
    <div style="display:grid;gap:8px"><span class="label">Audiências</span>
      <select data-gestao="aud">${opt(GESTAO_AUD_PUB(),G.aud)}</select>
      ${nt(J?`Ao vivo você preside e investiga quem tem razão (até ${VIVO_MES} por mês). Pelo gabinete, a sentença sai pela chance de acerto.`:`Quem vai no seu lugar é o assessor com a skill dele; sem assessor, a audiência é rápida. Ao vivo cabem ${VIVO_MES} por mês.`)}</div>
    <div style="display:grid;gap:8px"><span class="label">Equipe</span>
      <label class="row"><input type="checkbox" data-gestao="dist" ${U.auto&&g?'checked':''} ${g?'':'disabled'}> <span>${g?`${esc(g.nome)} distribui os blocos da equipe pelos casos mais urgentes`:`Distribuir os blocos da equipe: nomeie um ${nomeGestor().toLowerCase()}`}</span></label></div>
    </div></section>`; }
{ const r0=renderEstrutura; renderEstrutura=function(){ r0(); const h=painelGestaoPub(); if(!h) return;
    const alvo=[...app.children].find(el=>!el.matches('header.top,.ticker,.tut')); if(alvo) alvo.insertAdjacentHTML('beforebegin',h); else app.insertAdjacentHTML('beforeend',h); }; }
document.addEventListener('change',e=>{ const k=e.target.dataset&&e.target.dataset.gestao; if(!S||!pubAtual()) return;
  if(k==='acordo'){ gestao().acordo=e.target.checked; salvar(); render(); }
  if(k==='minAc'){ gestao().minAc=+e.target.value; salvar(); render(); } });
