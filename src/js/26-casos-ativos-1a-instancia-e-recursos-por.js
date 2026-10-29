// ===================== CASOS ATIVOS: 1ª INSTÂNCIA E RECURSOS POR TRIBUNAL =====================
function nomeTribunal(c){ const a=c.area;
  if(c.inst===2) return a==='trabalho'?'TRT · Tribunal Regional do Trabalho':a==='tributario'?'TRF · Tribunal Regional Federal':'TJ · Tribunal de Justiça';
  if(c.inst===3) return a==='trabalho'?'TST · Tribunal Superior do Trabalho':'STJ · Superior Tribunal de Justiça';
  return 'STF · Supremo Tribunal Federal'; }
function painelCasosAtivos(){
  const prim=S.casos.filter(c=>(c.inst||1)===1), rec=S.casos.filter(c=>(c.inst||1)>1);
  const grupos={}; for(const c of rec.sort((a,b)=>a.inst-b.inst)) (grupos[nomeTribunal(c)]=grupos[nomeTribunal(c)]||[]).push(c);
  return `<section class="panel" style="background:transparent;border:0;padding:0">
      <div class="panel-head"><h2>Casos ativos</h2><span class="num">${casos1()}/${maxCasos()}</span></div>
      <p class="label" style="margin:0">${TIERS[tierEscritorio()].nome}: casos até ${RAR[RORD[TIERS[tierEscritorio()].rarMax]].nome.toLowerCase()}, causas ×${TIERS[tierEscritorio()].valor.toLocaleString('pt-BR')} (o nível sobe em Estrutura e equipe) · Limite: 3 sozinho + 1 por advogado (${advsEquipe()}) + 1 a cada 2 estagiários (${estagEquipe()})${S.filiais.length?` + ${S.filiais.length} pelas filiais`:''} · manutenção deste mês: ${S.casos.reduce((a,c)=>a+manut(c),0)} blocos</p>
      ${rec.length?`<span class="label">1ª instância · ${prim.length}</span>`:''}
      <div class="cases">${prim.length?prim.map(c=>pasta(c,true)).join(''):`<p class="empty">${rec.length?'Nenhum caso em 1ª instância.':'Nenhum caso ativo. Aceite uma das ofertas abaixo.'}</p>`}</div>
    </section>
    ${rec.length?`<section class="panel recursos" style="background:transparent;border:0;padding:0">
      <div class="panel-head"><h2>Recursos</h2><span class="num">${rec.length}</span></div>
      <p class="label" style="margin:0">Fila dos tribunais: não ocupa vaga de casos ativos e não pode ser antecipada. Tribunal em 2 meses, STJ/TST em 3, STF em 4. Dá para preparar memoriais e sustentação enquanto espera.</p>
      ${Object.entries(grupos).map(([t,L])=>`<div class="trib"><div class="trib-head"><b>${t}</b><span class="label">${(()=>{ const m=L.filter(c=>c.lado==='recorrente').length, o=L.length-m; return [m?`${m} seu${m>1?'s':''} (você recorreu)`:'',o?`${o} da outra parte`:''].filter(Boolean).join(' · '); })()}</span></div>
        <div class="cases">${L.map(c=>pasta(c,true)).join('')}</div></div>`).join('')}
    </section>`:''}`; }

