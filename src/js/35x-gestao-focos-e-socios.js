// ===================== GESTÃO: FOCOS, SÓCIOS E O GESTOR (advocacia) =====================
// Começo sofrido: no escritório iniciante e sem gestor, tudo é manual e chegam menos casos.
// O gestor (gerente administrativo) libera a partir do Escritório local: escolhe o foco do mês e cuida de férias,
// carga de trabalho, aumentos e recursos dos casos delegados (cada item pode ficar com você: "Eu decido").
// Cada sócio lidera um foco, ativo todo mês. Força do foco: 1º sócio 100%, cada sócio a mais +40%;
// o foco do mês do gestor soma 100% (foco sem sócio) ou +50% de reforço (foco com sócio).
const FOCOS={
  comercial:{nome:'Comercial',lema:'Trazer mais e melhores casos',ef:f=>[`+${Math.round(2*f)} casos novos por mês`,`causas valem ${Math.round(10*f)}% mais`,`+${Math.round(4*f)} no sorteio de casos raros ou maiores`],custo:'equipe rende 5% menos'},
  juridico:{nome:'Jurídico',lema:'Mais capacidade e menos erro',ef:f=>[`+${Math.round(2*f)} vagas de caso ativo`,`revisão: +${Math.round(3*f)} de chance em todos os casos`,`prazos atrasados pesam ${Math.round(Math.min(1,f)*50)}% menos`],custo:'1 caso novo a menos por mês'},
  administrativo:{nome:'Administrativo',lema:'A equipe rende e o escritório anda sozinho',ef:f=>[`equipe +${Math.round(20*f)}% de blocos`,'libera a postura automática nas audiências','aumentos custam 10% menos'],custo:'sem casos novos extras'},
};
const SOC_EXTRA=.4, REFORCO=.5, TIER_GESTOR=1; // TIERS[1] = Escritório local
const gestorLiberado=()=>S.carreira==='adv'&&tierEscritorio()>=TIER_GESTOR;
const gestorAtivo=()=>gestorLiberado()&&!!S.u&&!!gestorAtual();
const sociosLideres=()=>S.u?S.u.equipe.filter(f=>f.funcao==='socio'&&!f.local):[];
const G2=()=>{ const G=gestao(); if(!G.deleg) G.deleg={ferias:'auto',carga:'auto',aumentos:'manual',recursos:'auto'}; if(G.recMin===undefined) G.recMin=.45; if(G.aumMax===undefined) G.aumMax=.1; if(!G.focoMes) G.focoMes='comercial'; return G; };
function forcasFocos(){ const A={}, n={}; if(S.carreira!=='adv'||!S.u) return A;
  for(const s of sociosLideres()) if(s.lidera&&FOCOS[s.lidera]) n[s.lidera]=(n[s.lidera]||0)+1;
  for(const k in n) A[k]=1+SOC_EXTRA*(n[k]-1);
  if(gestorAtivo()){ const f=G2().focoMes; if(FOCOS[f]) A[f]=(A[f]||0)+(n[f]?REFORCO:1); }
  return A; }
const forca=k=>forcasFocos()[k]||0;
const delegado=k=>gestorAtivo()&&G2().deleg[k]==='auto';
const automacaoLivre=()=>gestorAtivo()&&forca('administrativo')>0; // postura por raridade e instância
// usados em outros módulos (04 e 09)
function vagasFoco(){ return S&&S.carreira==='adv'?Math.round(2*forca('juridico')):0; }
function fatorPrazoFoco(){ return S&&S.carreira==='adv'?1-.5*Math.min(1,forca('juridico')):1; }
function recursoAutomatico(){ return delegado('recursos'); }
function recMinimo(){ return G2().recMin; }
// ---------- efeitos dos focos ----------
{ const b0=bonusPerks; bonusPerks=function(c,add){ b0(c,add); if(S.carreira!=='adv') return; const j=forca('juridico'); if(j) add('Foco jurídico: revisão',Math.round(3*j)); }; }
{ const p0=pesosRaridade; pesosRaridade=function(C){ const w=p0(C); if(S&&S.carreira==='adv'){ const f=forca('comercial'); if(f) w.raro+=4*f; } return w; }; }
{ const n0=novoCaso; novoCaso=function(...a){ const c=n0(...a); if(S.carreira==='adv'&&c.valor){ const f=forca('comercial'); if(f){ c.valor=Math.round(c.valor*(1+.1*f)/100)*100; c.hon=Math.round(c.valor*.2); } } return c; }; }
{ const s0=staffBlocos; staffBlocos=function(){ let b=s0(); if(S.carreira!=='adv') return b;
    const fer=S.u.equipe.filter(f=>f.ferias===S.semana).reduce((a,f)=>a+FX()[f.funcao].bl*(.6+f.moral/250),0);
    b=Math.max(0,b-Math.floor(fer));
    return Math.floor(b*(1+.2*forca('administrativo'))*(forca('comercial')?.95:1)); }; }
// casos novos: começo com 2 (sem gestor e sem sócio), comercial +2, jurídico −1
{ const g0=gerarOfertas; gerarOfertas=function(){ g0(); if(S.carreira!=='adv') return;
    const sede=()=>S.ofertas.findIndex(c=>c.cidade===S.sede&&!c.clienteFixo&&!c.vocDe&&!c.indicacao);
    let menos=(!gestorAtivo()&&!sociosLideres().length?1:0)+(forca('juridico')?1:0);
    while(menos-->0){ const i=sede(); if(i>=0) S.ofertas.splice(i,1); }
    const extra=Math.round(2*forca('comercial')); for(let i=0;i<extra;i++){ const c=casoEsc(S.sede); c.comercial=true; S.ofertas.push(c); }
    if(extra&&gestorAtivo()&&typeof aceitarAutomatico==='function') aceitarAutomatico(); }; }
// gestão automática de casos novos e postura só com gestor (e Administrativo para a postura)
{ const a0=aceitarAutomatico; aceitarAutomatico=function(){ if(S.carreira==='adv'&&!gestorAtivo()) return 0; return a0(); }; }
{ const m0=modoPadrao; modoPadrao=function(c){ if(papelAud()==='adv'&&!automacaoLivre()){ if(RORD.indexOf(c.rar)>=2&&vivoPermitido(c)) return 'vivo'; return melhorSub(c)?'enviar':'rapida'; } return m0(c); }; }
// aumentos 10% mais baratos com Administrativo
aumento=function(id){ const f=S.u.equipe.find(x=>x.id===id); if(!f||!f.sal) return; const x=forca('administrativo')?1.135:1.15;
  f.sal=Math.round(f.sal*x/50)*50; f.moral=clamp(f.moral+15,0,100); addLog(`${f.nome} recebeu aumento para ${brl(f.sal)}.`,'g'); salvar(); render(); };
// ---------- o gestor no fim do mês ----------
function semanaGestor2(){ const U=S.u, G=G2(), rel=[];
  U.auto=gestorAtivo()&&G.deleg.carga==='auto'; // distribuição dos blocos da equipe
  if(!gestorAtivo()){ S.relGestor={mes:S.semana,l:[]}; return; }
  const F=forcasFocos(); rel.push(['b',`Focos: ${Object.keys(F).length?Object.entries(F).map(([k,v])=>`${FOCOS[k].nome} ${Math.round(v*100)}%`).join(' · '):'nenhum'}.`]);
  if(G.deleg.ferias==='auto'){ const L=U.equipe.filter(f=>f.funcao!=='socio'&&f.moral<45&&(!f.feriasEm||S.semana-f.feriasEm>=6)).slice(0,2);
    for(const f of L){ f.ferias=S.semana+1; f.feriasEm=S.semana; const a=Math.round(f.moral); f.moral=clamp(f.moral+18,0,100); rel.push(['g',`${f.nome} sai de férias no próximo mês (moral ${a} → ${Math.round(f.moral)}).`]); } }
  if(G.deleg.aumentos==='auto'){ const folha=U.equipe.reduce((a,f)=>a+(f.sal||0),0); let teto=Math.round(folha*G.aumMax);
    for(const f of U.equipe.filter(f=>f.sal&&f.moral<35).sort((a,b)=>b.q-a.q)){ const x=forca('administrativo')?.135:.15, d=Math.round(f.sal*x/50)*50; if(d>teto) break;
      teto-=d; f.sal+=d; f.moral=clamp(f.moral+15,0,100); rel.push(['g',`${f.nome} recebeu aumento para ${brl(f.sal)} e desistiu de sair.`]); } }
  if(G.deleg.carga==='auto') rel.push(['','Blocos da equipe distribuídos pelos casos mais urgentes.']);
  const manuais=Object.entries(G.deleg).filter(([,v])=>v==='manual').map(([k])=>({ferias:'férias',carga:'carga de trabalho',aumentos:'aumentos',recursos:'recursos'}[k]));
  if(manuais.length) rel.push(['',`Com você: ${manuais.join(', ')}.`]);
  S.relGestor={mes:S.semana,l:rel}; }
{ const s0=semanaEstruturaAdv; semanaEstruturaAdv=function(){ s0(); semanaGestor2(); }; }
// recursos dos casos delegados: o gestor decide (registro) ou você decide (janela)
{ const l0=addLog; addLog=function(t,c){ l0(t,c); if(S&&S.relGestor&&S.relGestor.mes===S.semana&&/recorreu de|não recorreu de/.test(t)&&/chance de reverter|custas/.test(t)) S.relGestor.l.push([c==='r'?'r':'b',t]); }; }
// férias na mão: botão no cartão (manual ou quando quiser)
function darFerias(id){ const f=S.u.equipe.find(x=>x.id===id); if(!f||(f.feriasEm&&S.semana-f.feriasEm<6)) return;
  f.ferias=S.semana+1; f.feriasEm=S.semana; f.moral=clamp(f.moral+18,0,100); addLog(`${f.nome} vai tirar férias no próximo mês.`,'g'); salvar(); render(); }
{ const c0=cardFunc; cardFunc=function(f){ let h=c0(f); if(S.carreira!=='adv'||f.funcao==='socio') return h;
    const pode=!f.feriasEm||S.semana-f.feriasEm>=6, em=f.ferias===S.semana;
    const bt=`<button class="chip" data-act="feriasF" data-id="${f.id}" ${pode?'':'disabled'} title="${pode?'+18 de moral; não trabalha no próximo mês':'Uma vez a cada 6 meses'}">${em?'De férias este mês':f.ferias===S.semana+1?'Férias no próximo mês':'Dar férias'}</button>`;
    return h.replace('<div class="chips">',`<div class="chips">${bt}`); }; }
document.addEventListener('click',e=>{ const b=e.target.closest('[data-act=feriasF]'); if(!b||b.disabled||!S) return; darFerias(+b.dataset.id); });
// ---------- painel de gestão ----------
function painelGestao(){ if(S.carreira!=='adv') return ''; const G=G2(), g=gestorAtual(), ativo=gestorAtivo(), F=forcasFocos(), soc=sociosLideres();
  const opt=(o,v)=>Object.entries(o).map(([k,t])=>`<option value="${k}" ${String(v)===k?'selected':''}>${t}</option>`).join('');
  const nt=t=>`<p class="gx-nt">${t}</p>`;
  const lock=!ativo?`<div class="gx-lock"><b>${gestorLiberado()?'Sem gestor, as decisões da equipe são suas':`Gestor libera no ${TIERS[TIER_GESTOR].nome} (nível ${TIER_GESTOR+1} de 5)`}</b>
    ${nt(gestorLiberado()?'Contrate um gestor administrativo na equipe abaixo para escolher o foco do mês e delegar férias, carga de trabalho, aumentos e recursos.':'No começo você faz tudo: chegam menos casos novos, sem foco do mês, sem aceitar casos sozinho e sem postura automática nas audiências. Férias, aumentos e recursos são decididos um a um.')}
    ${soc.some(s=>s.lidera)?nt('Os focos liderados pelos seus sócios continuam valendo.'):''}</div>`:'';
  const cards=Object.entries(FOCOS).map(([k,f])=>{ const v=F[k]||0, lid=soc.filter(s=>s.lidera===k).map(s=>s.nome.split(' ')[0]), mes=ativo&&G.focoMes===k;
    const quem=[lid.length?`sócio${lid.length>1?'s':''}: ${lid.join(' e ')}`:'',mes?(lid.length?'reforço do gestor':'foco do mês do gestor'):''].filter(Boolean).join(' · ');
    return `<button class="gx-foco ${v?'on':''}" data-gfoco="${k}" ${ativo?'':'aria-disabled="true"'} aria-pressed="${mes}"><span class="gx-ft"><b>${f.nome}</b><span class="num">${v?Math.round(v*100)+'%':''}</span></span>
      <small class="gx-mut">${f.lema}</small><ul>${f.ef(v||1).map(x=>`<li>${x}</li>`).join('')}</ul><small class="gx-mut">Em troca: ${f.custo}</small>${quem?`<small><b>${quem}</b></small>`:''}</button>`; }).join('');
  const lim=TIERS[tierEscritorio()].socios;
  const socios=soc.length?`<span class="label">Sócios · ${soc.length} de ${lim}</span><div class="gx-rows">${soc.map(s=>`<div class="gx-row"><span><b>${esc(s.nome)}</b> <small class="gx-mut">sócio</small></span>
      <select data-glidera="${s.id}" aria-label="Foco de ${esc(s.nome)}"><option value="">Sem foco</option>${Object.entries(FOCOS).map(([k,f])=>`<option value="${k}" ${s.lidera===k?'selected':''}>Lidera ${f.nome}</option>`).join('')}</select></div>`).join('')}</div>
      ${nt('Cada sócio lidera um foco, ativo todo mês. Um segundo sócio no mesmo foco soma +40%.')}`:'';
  const DL=[['ferias','Férias da equipe','marca férias para quem está com moral baixa (até 2 por mês, uma vez a cada 6 meses)'],['carga','Carga de trabalho','distribui os blocos da equipe pelos casos mais urgentes'],['aumentos','Aumentos','dá aumento a quem está prestes a sair, dentro do teto da folha'],['recursos','Recursos','nos casos delegados, recorre quando a chance de reverter passa do mínimo']];
  const deleg=`<span class="label">O que o gestor cuida</span><div class="gx-rows">${DL.map(([k,t,d])=>{ const m=ativo?G.deleg[k]:'manual';
      const extra=k==='recursos'&&m==='auto'?`<label class="gx-rng"><span>Recorrer a partir de</span><input type="range" min="30" max="70" step="5" value="${Math.round(G.recMin*100)}" data-grec><b class="num">${Math.round(G.recMin*100)}%</b></label>`
        :k==='aumentos'&&m==='auto'?`<label class="gx-rng"><span>Teto por mês</span><input type="range" min="5" max="20" step="5" value="${Math.round(G.aumMax*100)}" data-gaum><b class="num">${Math.round(G.aumMax*100)}%</b><span class="gx-mut">da folha</span></label>`:'';
      return `<div class="gx-row"><span><b>${t}</b><br><small class="gx-mut">${m==='auto'?d:k==='recursos'?'você decide numa janela a cada derrota de caso delegado':k==='ferias'?'botão "Dar férias" no cartão de cada pessoa':k==='aumentos'?'botão de aumento no cartão de cada pessoa':'você distribui na aba Estrutura, caso a caso'}</small></span>
        <span class="gx-seg"><button data-gdeleg="${k}" data-v="auto" class="${m==='auto'?'on':''}" ${ativo?'':'disabled'}>Gestor</button><button data-gdeleg="${k}" data-v="manual" class="${m==='manual'?'on':''}" ${ativo?'':'disabled'}>Eu decido</button></span>${extra}</div>`; }).join('')}</div>`;
  const casos=`<span class="label">Casos novos</span><label class="row"><input type="checkbox" data-gestao="aceitar" ${G.aceitar?'checked':''} ${ativo?'':'disabled'}> <span>Aceitar casos sozinho, do maior para o menor chance</span></label>
    <div class="row"><span class="name">Chance mínima</span><select data-gestao="minCh" ${G.aceitar&&ativo?'':'disabled'}>${opt({'0.4':'40%','0.5':'50%','0.6':'60%','0.7':'70%'},G.minCh)}</select></div>`;
  const postura=`<span class="label">Audiências · sua postura padrão</span>${automacaoLivre()?tabelaModos():nt('Libera com o foco Administrativo ativo (do gestor ou de um sócio). Até lá: você vai às raras ou maiores e manda a equipe nas outras quando houver alguém que possa ir.')}`;
  const R=S.relGestor&&S.relGestor.l&&S.relGestor.l.length?`<span class="label">Relatório do gestor · mês ${S.relGestor.mes}</span><ul class="gx-rel">${S.relGestor.l.map(([c,t])=>`<li><i class="${c}"></i><span>${t}</span></li>`).join('')}</ul>`:'';
  return `<section class="panel gestao gx" style="margin-bottom:16px"><div class="panel-head"><h2>Gestão do escritório</h2><span class="label">${ativo?`gestão ativa · ${esc(g.nome)}`:'manual'}</span></div>
    ${lock}
    <span class="label">Focos · ${ativo?'clique para escolher o foco do mês':'os sócios lideram; o gestor escolhe mais um por mês'}</span>
    <div class="gx-focos">${cards}</div>
    ${socios}
    <div class="gx-cols"><div class="gx-col">${deleg}</div><div class="gx-col">${casos}${R}</div></div>
    ${postura}
  </section>`; }
document.addEventListener('click',e=>{ if(!S||S.carreira!=='adv') return; const b=e.target.closest('[data-gfoco],[data-gdeleg]'); if(!b||b.disabled||b.getAttribute('aria-disabled')==='true') return;
  const G=G2(); if(b.dataset.gfoco){ G.focoMes=b.dataset.gfoco; addLog(`Foco do mês: ${FOCOS[G.focoMes].nome}.`); } else G.deleg[b.dataset.gdeleg]=b.dataset.v;
  salvar(); render(); });
document.addEventListener('change',e=>{ if(!S||S.carreira!=='adv') return; const t=e.target;
  if(t.dataset.glidera!==undefined){ const s=S.u.equipe.find(f=>f.id===+t.dataset.glidera); if(s){ s.lidera=t.value; if(t.value) addLog(`${s.nome} passa a liderar o foco ${FOCOS[t.value].nome}.`); } salvar(); render(); }
  if(t.dataset.grec!==undefined){ G2().recMin=+t.value/100; salvar(); render(); }
  if(t.dataset.gaum!==undefined){ G2().aumMax=+t.value/100; salvar(); render(); } });
// contratar gestor só a partir do Escritório local
{ const c0=contratar; contratar=async function(funcao){ if(S.carreira==='adv'&&funcao==='gestor'&&!gestorLiberado()&&!ocupado)
      return modal(`<h2>Ainda não dá</h2><p>O gestor administrativo libera no ${TIERS[TIER_GESTOR].nome}. Por enquanto, você administra tudo sozinho.</p>`,[{t:'Ok',v:1}]);
    return c0(funcao); }; }
