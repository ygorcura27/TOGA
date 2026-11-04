// ===================== FILIAIS COM IMÓVEL E EQUIPE PRÓPRIOS =====================
// cada filial tem o seu imóvel e a sua equipe. A equipe da filial trabalha nos casos daquela cidade ou país, pode ir às
// audiências de lá (com a mesma hierarquia) e soma no limite de casos ativos. Salários e aluguel saem do caixa do escritório.
const IMOVEL_FIL=[{nome:'Sala comercial',mesas:3,aluguel:0,custo:0},{nome:'Conjunto comercial',mesas:8,aluguel:2000,custo:15000},{nome:'Andar corporativo',mesas:15,aluguel:5000,custo:50000}];
const FUNC_FIL=['estagiario','junior','pleno','senior'];
function filU(k){ const F=S.filU||(S.filU={}); if(!F[k]) F[k]={imovel:0,equipe:[],desde:S.semana}; return F[k]; }
const unidades=()=>S.carreira==='adv'?S.filiais.map(k=>[k,filU(k)]):[];
const blocosFil=U=>Math.floor(U.equipe.filter(f=>f.ferias!==S.semana).reduce((a,f)=>a+FUNCOES.adv[f.funcao].bl*(.6+f.moral/250),0)); // de férias não trabalha
const advsFilAdv=()=>unidades().reduce((a,[,U])=>a+U.equipe.filter(f=>FUNCOES.adv[f.funcao].bl>=4).length,0);
const advsFil=()=>unidades().reduce((a,[,U])=>a+U.equipe.filter(f=>FUNCOES.adv[f.funcao].bl>=4).length+Math.floor(U.equipe.filter(f=>f.funcao==='estagiario').length/2),0);
const despFil=()=>unidades().reduce((a,[,U])=>a+IMOVEL_FIL[U.imovel].aluguel+U.equipe.reduce((x,f)=>x+f.sal,0),0);
const estrangeiro=k=>LOC[k]&&LOC[k].nivel==='global'&&LOC[k].pais!=='Portugal';
// limite de casos e despesas
{ const d0=despesasEscritorio; despesasEscritorio=function(){ const d=d0(), f=despFil(); return {...d,filEq:f,total:d.total+f}; }; }
// a equipe de cada filial põe os blocos nos casos da cidade dela, primeiro onde falta manutenção
function blocosFiliais(){ for(const [k,U] of unidades()){ let b=blocosFil(U); const L=S.casos.filter(c=>c.cidade===k);
    while(b>0&&L.length){ const c=L.reduce((a,x)=>falta(x)>falta(a)?x:a); c.semana=(c.semana||0)+1; b--; } } }
// a filial no exterior abre com um sócio local que fala o idioma do país
{ const ev0=e=>{}; document.addEventListener('click',e=>{ const b=e.target.closest('[data-act=abrirFilial]'); if(!b||!S) return; const k=b.dataset.v;
    setTimeout(()=>{ if(S&&S.filiais.includes(k)&&!(S.filU&&S.filU[k])){ const U=filU(k);
        if(LOC[k].nivel==='global'){ const c=gerarCandidato('senior',S.espec); c.funcao='socio'; c.sal=0; c.salBase=0; c.part=.05; c.local=true; c.moral=75; U.equipe.push(c); addLog(`${c.nome} é o sócio local da filial em ${nomeLocal(k)}.`,'g'); } salvar(); render(); } },60); },true); }
// moral e skill da equipe das filiais evoluem como a da sede
{ const s0=semanaEstruturaAdv; semanaEstruturaAdv=function(){ s0(); for(const [k,U] of unidades()) for(const f of [...U.equipe]){ f.semanas=(f.semanas||0)+1;
      f.moral=clamp(f.moral+(60-f.moral)*.1+rnd(-2,2),0,100); f.q=clamp(f.q+.15,0,95); if(f.ae!==undefined&&f.ae<95) f.ae=clamp(f.ae+.2,0,95);
      if(f.moral<25&&f.funcao!=='socio'&&Math.random()<.35){ U.equipe=U.equipe.filter(x=>x!==f); addLog(`${f.nome} pediu demissão da filial em ${nomeLocal(k)}.`,'r'); } } }; }
async function contratarFil(k,funcao){ if(ocupado) return; const U=filU(k), F=FUNCOES.adv[funcao];
  if(U.equipe.length>=IMOVEL_FIL[U.imovel].mesas) return modal(`<h2>Sem mesa livre</h2><p>A ${IMOVEL_FIL[U.imovel].nome.toLowerCase()} de ${esc(nomeLocal(k))} tem ${IMOVEL_FIL[U.imovel].mesas} mesas. Mude para um imóvel maior.</p>`,[{t:'Ok',v:1}]);
  const areas=Object.entries(LOC[k].areas||{}).sort((a,b)=>b[1]-a[1]).map(x=>x[0]).filter(a=>AREAS[a]);
  const cands=[0,1,2].map(i=>{ const c=gerarCandidato(funcao,AE_FAIXA[funcao]?(areas[i%Math.max(1,areas.length)]||S.espec):undefined); if(estrangeiro(k)) c.local=true; return c; });
  const v=await modal(`<h2>Contratar em ${esc(nomeLocal(k))}: ${F.nome}</h2><p>Rende cerca de ${F.bl} blocos por mês nos casos daqui. Salário pago pelo caixa do escritório.${estrangeiro(k)?' Contratação local: fala o idioma do país.':''}</p>
    <div class="opts">${cands.map((c,i)=>`<button class="opt" data-mv="${i}"><span>${esc(c.nome)}</span><b class="num">${brl(c.sal)}/mês</b><small>Qualidade ${c.q} · moral ${c.moral}${c.area?` · ${AREAS[c.area].nome} ${Math.round(c.ae)}`:''}</small></button>`).join('')}</div>`,[{t:'Cancelar',v:'',cls:'ghost'}]);
  if(v===''||v===undefined) return; const c=cands[+v]; U.equipe.push(c); addLog(`${c.nome} entrou na filial de ${nomeLocal(k)} como ${F.nome.toLowerCase()}.`,'g'); salvar(); render(); }
function painelFiliais(){ const L=unidades(); if(!L.length) return '';
  return `<section class="panel filiais-eq"><div class="panel-head"><h2>Filiais</h2><span class="label">${L.length} unidade${L.length>1?'s':''} · ${brl(despFil())}/mês de equipe e imóvel</span></div>
    <div class="fil-grid">${L.map(([k,U])=>{ const I=IMOVEL_FIL[U.imovel], prox=IMOVEL_FIL[U.imovel+1], casos=S.casos.filter(c=>c.cidade===k);
      return `<div class="fil-card"><div class="panel-head"><h3>${esc(nomeLocal(k))}</h3><span class="label">${LOC[k].nivel==='global'?LOC[k].pais:LOC[k].nivel==='regional'?'bairro':'cidade'}</span></div>
        <small>${I.nome} · ${U.equipe.length}/${I.mesas} mesas · ${blocosFil(U)} blocos por mês · ${casos.length} caso${casos.length===1?'':'s'} ativo${casos.length===1?'':'s'} aqui</small>
        ${U.equipe.length?`<ul class="fil-eq">${U.equipe.map(f=>`<li>${retrato(f.nome,{size:30})}<span><b>${esc(f.nome)}</b><small>${nomeFuncao(f)}${f.area?` · ${AREAS[f.area].nome} ${Math.round(f.ae)}`:''} · moral ${Math.round(f.moral)}${f.local?' · local':''}</small></span>${f.funcao==='socio'?'':`<button class="lnk" data-act="feriasF" data-id="${f.id}" ${f.feriasEm&&S.semana-f.feriasEm<6?'disabled':''}>${f.ferias===S.semana+1?'Férias no próximo mês':f.ferias===S.semana?'De férias':'Férias'}</button> <button class="lnk" data-fildem="${k}" data-id="${f.id}">Demitir</button>`}</li>`).join('')}</ul>`
          :'<p class="label" style="margin:0;text-transform:none;letter-spacing:0;font-weight:400">Sem equipe: os casos daqui dependem dos seus blocos e da equipe da sede.</p>'}
        <div class="chips">${FUNC_FIL.map(fn=>`<button class="chip" data-filcon="${k}" data-v="${fn}">+ ${FUNCOES.adv[fn].nome}</button>`).join('')}</div>
        ${prox?`<button class="btn ghost" data-filimo="${k}" ${S.caixa<prox.custo?'disabled':''}>Mudar para ${prox.nome.toLowerCase()} · ${brl(prox.custo)} (+${brl(prox.aluguel-I.aluguel)}/mês)</button>`:''}</div>`; }).join('')}</div>
    <p class="label" style="margin:0;text-transform:none;letter-spacing:0;font-weight:400">A equipe de cada filial trabalha nos casos da cidade dela, pode ir às audiências de lá (com a mesma hierarquia) e cada advogado dela soma 1 vaga de caso ativo.</p></section>`; }
{ const r0=renderEstrutura; renderEstrutura=function(){ r0(); const h=painelFiliais(); if(h) app.insertAdjacentHTML('beforeend',h); }; }
document.addEventListener('click',e=>{ const b=e.target.closest('[data-filcon],[data-fildem],[data-filimo]'); if(!b||b.disabled||!S) return;
  if(b.dataset.filcon) return contratarFil(b.dataset.filcon,b.dataset.v);
  if(b.dataset.fildem){ const U=filU(b.dataset.fildem), f=U.equipe.find(x=>x.id===+b.dataset.id); if(!f) return; const multa=f.sal*2;
    modal(`<h2>Demitir ${esc(f.nome)}?</h2><p>Custa ${brl(multa)} de rescisão.</p>`,[{t:'Cancelar',v:0,cls:'ghost'},{t:'Demitir',v:1}]).then(v=>{ if(!v) return; U.equipe=U.equipe.filter(x=>x!==f); S.caixa-=multa; addLog(`${f.nome} saiu da filial.`,'r'); salvar(); render(); }); return; }
  if(b.dataset.filimo){ const U=filU(b.dataset.filimo), prox=IMOVEL_FIL[U.imovel+1]; if(!prox||S.caixa<prox.custo) return; S.caixa-=prox.custo; U.imovel++; addLog(`A filial de ${nomeLocal(b.dataset.filimo)} mudou para ${prox.nome.toLowerCase()}.`,'g'); salvar(); render(); } });
// no cartão do caso: a equipe da filial que cuida dele
{ const p0=pasta; pasta=function(c,ativo){ const h=p0(c,ativo); const U=S.filU&&S.filU[c.cidade]; if(!ativo||!U||!U.equipe.length) return h;
    return h.replace('<dl class="meta">',`<dl class="meta"><dt>Filial</dt><dd>equipe de ${esc(nomeLocal(c.cidade))} · +${blocosFil(U)} blocos/mês</dd>`); }; }
