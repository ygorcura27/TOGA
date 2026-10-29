// ===================== ESPECIALIDADES DO ESCRITÓRIO =====================
// o escritório nasce com a área do titular e só recebe casos das áreas que atende;
// cada área nova exige um advogado pleno (ou sênior/sócio) da área com pelo menos 3 estrelas nela
const ADV_FUNCS=['associado','junior','pleno','senior','socio'], RESP_FUNCS=['pleno','senior','socio'];
const CUSTO_AREA=10000, CUSTO_FULL=50000;
const AE_FAIXA={associado:[42,62],junior:[40,62],pleno:[55,80],senior:[68,90],socio:[75,92]};
const estrelasF=f=>f.ae?NIV_AREA.filter(x=>f.ae>=x).length:0;
const areasEsc=()=>{ const U=S.u; if(!U.areas) U.areas=[S.espec]; return U.full?Object.keys(AREAS):U.areas; };
function responsavel(a){ if(a===(S.u.fundadora||S.espec)) return {titular:true,nome:S.nome};
  return S.u.equipe.filter(f=>RESP_FUNCS.includes(f.funcao)&&f.area===a&&estrelasF(f)>=3).sort((x,y)=>y.ae-x.ae)[0]||null; }
const areasAtivas=()=>areasEsc().filter(a=>responsavel(a));
function areaOferta(cid){ if(S.carreira!=='adv') return null; const L=areasAtivas(); if(!L.length) return S.espec; const C=LOC[cid]||LOC[S.sede];
  return pickW(L,a=>((C&&C.areas&&C.areas[a])||1)*demEpoca(a)*pesoArea(a)); }
const casoEsc=cid=>novoCaso(cid,{},areaOferta(cid));
async function addArea(a){ const U=S.u; if(ocupado||areasEsc().includes(a)||!responsavel(a)||S.caixa<CUSTO_AREA) return;
  const r=responsavel(a); const v=await modal(`<h2>Abrir a área de ${AREAS[a].nome}?</h2><p>${esc(r.nome)} (${nomeFuncao(r).toLowerCase()}, ${'★'.repeat(estrelasF(r))}) fica como responsável. Custa ${brl(CUSTO_AREA)} em registro, marketing e material. Casos de ${AREAS[a].nome} passam a chegar todo mês.</p>`,[{t:'Cancelar',v:0,cls:'ghost'},{t:'Abrir a área',v:1,cls:'brass'}]);
  if(!v) return; S.caixa-=CUSTO_AREA; U.areas.push(a); addLog(`O escritório passou a atuar em ${AREAS[a].nome}, sob a responsabilidade de ${r.nome}.`,'g'); salvar(); render(); }
async function virarFull(){ const U=S.u, falta=Object.keys(AREAS).filter(a=>!responsavel(a)); if(ocupado||U.full||falta.length||S.caixa<CUSTO_FULL) return;
  const v=await modal(`<h2>Tornar o escritório full service?</h2><p>O escritório passa a atender todas as áreas do direito, com um responsável em cada uma. Custa ${brl(CUSTO_FULL)} e dá +5 de prestígio.</p>`,[{t:'Cancelar',v:0,cls:'ghost'},{t:'Full service',v:1,cls:'brass'}]);
  if(!v) return; S.caixa-=CUSTO_FULL; U.full=true; U.areas=Object.keys(AREAS); S.prest=clamp(S.prest+5,0,100); addLog('O escritório virou full service: atende todas as áreas.','g'); salvar(); render(); }
function painelAreas(){ const U=S.u, L=areasEsc(), falta=Object.keys(AREAS).filter(a=>!responsavel(a));
  const linha=a=>{ const r=responsavel(a), on=L.includes(a);
    return `<li><span><b>${AREAS[a].nome}</b> · ${r?(r.titular?'você (área fundadora)':`${esc(r.nome)} ${'★'.repeat(estrelasF(r))}`):'<span class="lo">sem advogado pleno 3★ na área</span>'}</span>
      ${on?`<span class="num ${r?'hi':'lo'}">${r?'atende':'suspensa'}</span>`:`<button class="chip" data-act="addArea" data-v="${a}" ${r&&S.caixa>=CUSTO_AREA?'':'disabled'}>Abrir · ${brl(CUSTO_AREA)}</button>`}</li>`; };
  return `<section class="panel"><div class="panel-head"><h2>Áreas de atuação</h2><span class="label">${U.full?'Full service':`${areasAtivas().length} de ${Object.keys(AREAS).length}`}</span></div>
    <ul class="break">${Object.keys(AREAS).map(linha).join('')}</ul>
    ${U.full?'':`<button class="btn ghost" data-act="virarFull" ${!falta.length&&S.caixa>=CUSTO_FULL?'':'disabled'}>Tornar full service · ${brl(CUSTO_FULL)}${falta.length?` (faltam responsáveis em ${falta.length} área${falta.length>1?'s':''})`:''}</button>`}
    <p style="margin:0;font-size:12px;color:var(--muted)">Só chegam casos das áreas que o escritório atende. Para abrir uma área nova, contrate ou forme um advogado pleno, sênior ou sócio daquela área com pelo menos 3★ nela. Se o responsável sair, a área fica suspensa até você repor.</p></section>`; }
function migrarEquipeAdv(){ if(S.carreira!=='adv'||!S.u) return; if(!S.u.areas) S.u.areas=[S.espec];
  for(const f of S.u.equipe) if(ADV_FUNCS.includes(f.funcao)&&!f.area){ f.area=S.espec; const [a,b]=AE_FAIXA[f.funcao]; f.ae=Math.round(a+(b-a)*clamp((f.q-40)/50,0,1)); } }
// advogados da equipe evoluem na própria área com o tempo (e mais rápido se a área é atendida)
function semanaAreasEquipe(){ if(S.carreira!=='adv') return; for(const f of S.u.equipe) if(f.area&&f.ae<95) f.ae=clamp(f.ae+(areasEsc().includes(f.area)?.25:.08),0,95); }

