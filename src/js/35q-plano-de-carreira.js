// ===================== PLANO DE CARREIRA DA EQUIPE =====================
// Promoção agora pede tempo no cargo e skill. Cada audiência vencida por quem você enviou adianta 1 mês (até metade do prazo).
// Quem está pronto e não é promovido perde moral; depois de alguns meses, um escritório rival pode tentar levar a pessoa.
const REQ_PLANO={junior:{meses:12,sk:30},pleno:{meses:12,sk:55},senior:{meses:18,sk:68}};
const skF=f=>f.ae!==undefined?f.ae:f.q;
const mesesCargo=f=>(f.semanas||0)-(f.cargoDesde||0);
const proxCargo=f=>S.carreira==='adv'?PROMO_ADV[f.funcao]:null;
const mesesExig=f=>{ const r=REQ_PLANO[proxCargo(f)]; return r?Math.max(Math.ceil(r.meses/2),r.meses-((f.aud&&f.aud.v)||0)):0; };
const podePromover=f=>{ const p=proxCargo(f), r=REQ_PLANO[p]; return !!r&&mesesCargo(f)>=mesesExig(f)&&skF(f)>=r.sk; };
function faltaPromo(f){ const r=REQ_PLANO[proxCargo(f)]; if(!r) return ''; const L=[];
  if(mesesCargo(f)<mesesExig(f)) L.push(`${mesesExig(f)-mesesCargo(f)} ${mesesExig(f)-mesesCargo(f)===1?'mês':'meses'} no cargo`);
  if(skF(f)<r.sk) L.push(`skill ${r.sk} (tem ${Math.floor(skF(f))})`);
  return L.join(' e '); }
// todos os advogados e estagiários: sede e filiais
const todosDaEquipe=()=>S.u?[...S.u.equipe.map(f=>[f,null]),...unidades().flatMap(([k,U])=>U.equipe.map(f=>[f,k]))]:[];
const acharMembro=id=>todosDaEquipe().find(([f])=>f.id===id);
// promoção: substitui a regra antiga (só tempo) e funciona também para quem está numa filial
promoverF=function(id){ const a=acharMembro(id); if(!a) return; const [f]=a, prox=proxCargo(f); if(!prox||!podePromover(f)) return;
  const F=FUNCOES.adv[prox]; f.funcao=prox; if(f.ae!==undefined) f.ae=clamp(f.ae+5,0,95); else if(AE_FAIXA[prox]){ f.area=f.area||S.espec; f.ae=clamp(Math.round(f.q),AE_FAIXA[prox][0],95); }
  f.sal=Math.max(f.sal,F.sal); f.salBase=f.sal; f.q=clamp(Math.max(f.q+5,F.q[0]),0,95); f.moral=clamp(f.moral+15,0,100);
  f.cargoDesde=f.semanas||0; f.prontoDesde=null; f.avisado=false;
  addLog(`${f.nome} foi promovido a ${F.nome.toLowerCase()}.`,'g'); salvar(); render(); };
// desempenho: vitórias e derrotas de quem foi enviado à audiência
{ const d0=depoisDoVeredito; depoisDoVeredito=function(c,ganhou){ d0(c,ganhou);
    if(c._modo==='enviar'&&c._sub){ const a=acharMembro(c._sub); if(a){ const f=a[0]; f.aud=f.aud||{v:0,d:0}; f.aud[ganhou?'v':'d']++; } } }; }
// a experiência da audiência também vale para quem é da filial
xpSubstituto=function(c,mult){ const a=acharMembro(c._sub); if(!a) return; const f=a[0];
  const g=XP_SUB[c.rar]*mult; if(f.ae!==undefined&&f.area===c.area) f.ae=clamp(f.ae+g*(1-f.ae/110),0,95); else f.q=clamp(f.q+g*.6*(1-f.q/110),0,95);
  f.moral=clamp(f.moral+(mult<=1?3:-2),0,100); };
// a cada mês: quem está pronto espera; esperar demais custa moral e abre espaço para o rival
{ const s0=semanaEstruturaAdv; semanaEstruturaAdv=function(){ s0(); const U=S.u; if(!U) return;
    for(const [f,k] of todosDaEquipe()){ if(f.funcao==='estagiario') f.q=clamp(f.q+.25,0,95); // estagiário aprende com a rotina do escritório
      if(!proxCargo(f)) continue;
      if(!podePromover(f)){ f.prontoDesde=null; continue; }
      if(!f.prontoDesde){ f.prontoDesde=S.semana; if(!f.avisado){ f.avisado=true; addLog(`${f.nome}${k?` (filial ${LOC[k].nome})`:''} está pronto para ser promovido a ${FUNCOES.adv[proxCargo(f)].nome.toLowerCase()}.`,'g'); } }
      const w=S.semana-f.prontoDesde;
      if(w>=3) f.moral=clamp(f.moral-3,0,100);
      if(w>=6&&!U.propostaRival&&Math.random()<.25) U.propostaRival=f.id; } }; }
async function propostaRival(){ const U=S.u, a=acharMembro(U.propostaRival); U.propostaRival=null; if(!a) return; const [f,k]=a, prox=proxCargo(f); if(!prox) return;
  const R=rivais().slice().sort((x,y)=>y.forca-x.forca)[0], F=FUNCOES.adv[prox], novoSal=Math.round(Math.max(f.sal*1.3,F.sal)/50)*50, aum=Math.round(f.sal*1.2/50)*50;
  const v=await modal(`<h2>${esc(R.escr)} quer levar ${esc(f.nome)}</h2>
    <p>${esc(R.nome)} ofereceu a ${esc(f.nome)}${k?` (filial ${esc(LOC[k].nome)})`:''} uma vaga de <b>${F.nome.toLowerCase()}</b> por ${brl(novoSal)} por mês. Faz ${S.semana-f.prontoDesde} meses que ${esc(f.nome)} está pronto para a promoção e espera uma resposta sua.</p>
    <dl class="meta"><dt>Cargo hoje</dt><dd>${nomeFuncao(f)} · ${brl(f.sal)}/mês</dd><dt>Skill</dt><dd class="num">${Math.floor(skF(f))}</dd><dt>Audiências</dt><dd class="num">${f.aud?`${f.aud.v} vitórias · ${f.aud.d} derrotas`:'nenhuma'}</dd><dt>Moral</dt><dd class="num">${Math.round(f.moral)}</dd></dl>`,
    [{t:'Deixar ir',v:'ir',cls:'ghost'},{t:`Aumento de 20% (${brl(aum)})`,v:'aum'},{t:`Promover a ${F.nome.toLowerCase()}`,v:'prom',cls:'brass'}]);
  if(v==='prom'){ promoverF(f.id); return; }
  if(v==='aum'){ f.sal=aum; f.moral=clamp(f.moral+10,0,100); f.prontoDesde=S.semana; addLog(`${f.nome} aceitou ficar com aumento para ${brl(aum)}, mas ainda espera a promoção.`); salvar(); return; }
  const lista=k?filU(k).equipe:U.equipe, i=lista.indexOf(f); if(i>=0) lista.splice(i,1); if(!k&&U.gestorId===f.id) U.gestorId=null;
  R.forca=Math.min(14,R.forca+1);
  addLog(`${f.nome} saiu para ${R.escr}. O rival ficou mais forte.`,'r');
  if(S.casos.length&&Math.random()<.3){ const c=pick(S.casos.filter(x=>(x.inst||1)===1&&RORD.indexOf(x.rar)<3))||null; if(c){ S.casos=S.casos.filter(x=>x!==c); addLog(`${f.nome} levou o cliente de “${c.titulo}”.`,'r'); } }
  salvar(); }
{ const f0=fimSemana; fimSemana=async function(){ const r=await f0(); if(S&&S.carreira==='adv'&&S.u&&S.u.propostaRival&&!ocupado){ ocupado=true; try{ await propostaRival(); } finally{ ocupado=false; } render(); } return r; }; }
// painel na aba Estrutura e equipe
function painelPlano(){ if(S.carreira!=='adv'||!S.u) return ''; const L=todosDaEquipe().filter(([f])=>proxCargo(f));
  if(!L.length) return '';
  const linha=([f,k])=>{ const p=proxCargo(f), r=REQ_PLANO[p], ok=podePromover(f), w=f.prontoDesde?S.semana-f.prontoDesde:0;
    const st=ok?(w>=3?`<b class="lo">esperando há ${w} meses</b>`:'<b class="hi">pronto</b>'):`falta ${faltaPromo(f)}`;
    return `<div class="plano-l">${retrato(f.nome,{size:30})}<div><b>${esc(f.nome)}</b> <small style="color:var(--muted)">${nomeFuncao(f)}${k?` · filial ${esc(LOC[k].nome)}`:''} → ${FUNCOES.adv[p].nome.toLowerCase()}</small>
      <div class="plano-m"><span>Tempo no cargo <b class="num">${mesesCargo(f)}/${mesesExig(f)}</b></span><span>Skill <b class="num">${Math.floor(skF(f))}/${r.sk}</b></span><span>Audiências <b class="num">${f.aud?`${f.aud.v}V ${f.aud.d}D`:'—'}</b></span><span>Moral <b class="num">${Math.round(f.moral)}</b></span><span>${st}</span></div></div>
      <button class="chip ${ok?'on':''}" data-act="promoverF" data-id="${f.id}" ${ok?'':'disabled'}>Promover</button></div>`; };
  return `<section class="panel"><div class="panel-head"><h2>Plano de carreira</h2><span class="label">${L.filter(([f])=>podePromover(f)).length} pronto(s)</span></div>
    <p class="label" style="margin:0;text-transform:none;letter-spacing:0;font-weight:400">Júnior pede ${REQ_PLANO.junior.meses} meses e skill ${REQ_PLANO.junior.sk}; pleno, ${REQ_PLANO.pleno.meses} meses e ${REQ_PLANO.pleno.sk}; sênior, ${REQ_PLANO.senior.meses} meses e ${REQ_PLANO.senior.sk}. Cada audiência vencida adianta 1 mês. Quem fica pronto e espera mais de 3 meses perde moral, e depois de 6 pode receber proposta de um rival. Sênior com 1 ano de casa e moral alta pede sociedade.</p>
    <div class="plano">${L.sort((a,b)=>podePromover(b[0])-podePromover(a[0])).map(linha).join('')}</div></section>`; }
{ const r0=renderEstrutura; renderEstrutura=function(){ r0(); const h=painelPlano(); if(!h) return;
    const fil=app.querySelector('.panel.filiais-eq'); if(fil) fil.insertAdjacentHTML('beforebegin',h); else app.insertAdjacentHTML('beforeend',h); }; }
