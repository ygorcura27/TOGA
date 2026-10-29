// ===================== RESUMO DO MÊS =====================
// ao encerrar o mês, uma tela única com o que mudou (dinheiro, reputação, saúde, produção) e os destaques do diário
function fotoMes(){ const V=S.vida||{};
  return {semana:S.semana,caixa:S.caixa,bolso:S.bolso||0,prest:S.prest,saude:V.saude,fel:V.felicidade,energia:S.energia,estresse:S.estresse,
    vit:S.vitorias,der:S.derrotas,sent:S.j?S.j.sentencas:0,cond:S.p?S.p.condenacoes:0,atend:S.d?S.d.atendimentos:0,pubs:S.ac?S.ac.pubs.length:0,
    equipe:S.u?S.u.equipe.length:0,carreira:S.carreira,cargo:cargoAtual()}; }
async function resumoMes(a){ const b=fotoMes(), adv=S.carreira==='adv';
  const linha=(rot,d,fmt=v=>sgn(v),inv=false)=>Math.abs(d)<.05?'':`<dt>${rot}</dt><dd class="num ${(inv?-d:d)>0?'hi':'lo'}">${fmt(d)}</dd>`;
  const din=v=>(v>0?'+':v<0?'−':'')+brl(Math.abs(v)).replace('R$ −','R$ ');
  const prod=[S.vitorias-a.vit?`${S.vitorias-a.vit} vitória${S.vitorias-a.vit>1?'s':''}`:'',S.derrotas-a.der?`${S.derrotas-a.der} derrota${S.derrotas-a.der>1?'s':''}`:'',
    b.sent-a.sent?`${b.sent-a.sent} sentença${b.sent-a.sent>1?'s':''}`:'',b.cond-a.cond?`${b.cond-a.cond} condenaç${b.cond-a.cond>1?'ões':'ão'}`:'',
    b.atend-a.atend?`${b.atend-a.atend} atendimento${b.atend-a.atend>1?'s':''} adequado${b.atend-a.atend>1?'s':''}`:'',b.pubs-a.pubs?`${b.pubs-a.pubs} publicaç${b.pubs-a.pubs>1?'ões':'ão'}`:''].filter(Boolean);
  const dest=S.log.filter(l=>l.w===a.semana&&(l.k==='g'||l.k==='r')).slice(0,8);
  const v=await modal(`<span class="label">Mês ${a.semana} encerrado</span><h2>Resumo do mês</h2>
    ${b.carreira!==a.carreira||b.cargo!==a.cargo?`<p class="hi" style="margin:0"><b>${esc(descCarreira())}</b></p>`:''}
    <dl class="meta">
      ${adv?linha('Caixa do escritório',b.caixa-a.caixa,din)+linha('Dinheiro pessoal',b.bolso-a.bolso,din):linha('Dinheiro',b.caixa-a.caixa,din)}
      ${linha('Prestígio',b.prest-a.prest)}${linha('Saúde',(b.saude||0)-(a.saude||0))}${linha('Felicidade',(b.fel||0)-(a.fel||0))}
      ${linha('Energia',b.energia-a.energia)}${linha('Estresse',b.estresse-a.estresse,v=>sgn(v),true)}${linha('Equipe',b.equipe-a.equipe,v=>sgn(v)+(Math.abs(v)>1?' pessoas':' pessoa'))}
    </dl>
    ${prod.length?`<p style="margin:0;font-size:13px"><b>Produção:</b> ${prod.join(' · ')}</p>`:''}
    ${dest.length?`<span class="label">Destaques</span><ul class="log" style="max-height:220px">${dest.map(l=>`<li><span class="w">${l.k==='g'?'▲':'▼'}</span><span class="${l.k}">${l.t}</span></li>`).join('')}</ul>`:'<p style="margin:0;color:var(--muted)">Um mês tranquilo, sem grandes acontecimentos.</p>'}`,
    [{t:'Não mostrar mais',v:'off',cls:'ghost'},{t:'Próximo mês',v:1,cls:'brass'}]);
  if(v==='off'){ S.semResumo=true; addLog('Resumo do mês desligado. Para religar, use o botão no Diário.'); salvar(); render(); } }
{ const f0=fimSemana; fimSemana=async function(){ if(!S||ocupado) return f0(); const a=fotoMes(); await f0(); if(S&&S.semana>a.semana&&!S.semResumo&&!document.querySelector('.ov')) await resumoMes(a); }; }

