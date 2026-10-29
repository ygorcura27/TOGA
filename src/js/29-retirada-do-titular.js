// ===================== RETIRADA DO TITULAR =====================
// o titular escolhe o valor e saca na hora, uma vez por mês; os sócios levam o percentual deles sobre o total distribuído
const RET_INTERVALO=1;
const partSocios=()=>S.u.equipe.filter(f=>f.funcao==='socio').reduce((a,f)=>a+f.part,0);
const retLivreEm=()=>(S.u.ultRet||-99)+RET_INTERVALO;
function mediaRetirada(){ const H=(S.u.retHist||[]).filter(h=>S.semana-h.w<12); return H.length?Math.round(H.reduce((a,h)=>a+h.voce,0)/12):0; }
function divisaoRetirada(v){ const p=partSocios(), soc=Math.round(v*p); return {voce:v-soc,soc,p}; }
function painelRetirada(){ const U=S.u, livre=S.semana>=retLivreEm(), cx=Math.max(0,Math.floor(S.caixa/100)*100), p=partSocios(), ult=(U.retHist||[])[0];
  return `<div class="ret"><span class="label">Retirada${p?` · sócios ficam com ${pct(p)}`:''}</span>
    ${livre&&cx>0?`<div class="ret-row"><input id="ret-valor" type="number" min="0" step="1000" max="${cx}" value="${Math.min(cx,Math.round(cx*.3/1000)*1000)}" aria-label="Valor da retirada">
      <button class="btn brass" data-act="ret">Retirar agora</button></div>
      <div class="chips">${[[.25,'25%'],[.5,'50%'],[1,'Tudo']].map(([f,l])=>`<button class="chip" data-act="retPreset" data-v="${cx*f}">${l} · ${brl(cx*f)}</button>`).join('')}</div>
      <p class="num" id="ret-prev" style="margin:0;font-size:12.5px"></p>`
    :`<p style="margin:0;font-size:12.5px;color:var(--muted)">${cx<=0?'O caixa está sem saldo para retirada.':`Próxima retirada no mês ${retLivreEm()}.`}</p>`}
    <p style="margin:0;font-size:12px;color:var(--muted)">Honorários entram no caixa do escritório, que paga as contas. Todo mês você pode sacar o valor que quiser do caixa para o seu dinheiro pessoal${p?'; do total sacado, a parte dos sócios é distribuída a eles na hora':''}. O custo de vida sai do dinheiro pessoal todo mês.${ult?` Última retirada: mês ${ult.w}, ${brl(ult.voce)} para você${ult.soc?` e ${brl(ult.soc)} aos sócios`:''}.`:''}</p></div>`; }
function atualizarRetirada(){ const el=document.getElementById('ret-valor'), out=document.getElementById('ret-prev'); if(!el||!out) return;
  const v=clamp(Math.floor(+el.value||0),0,Math.max(0,S.caixa)), d=divisaoRetirada(v);
  out.innerHTML=`Sai do caixa ${brl(v)} → <b class="hi">${brl(d.voce)}</b> para você${d.soc?` · ${brl(d.soc)} aos sócios`:''} · caixa fica com ${brl(S.caixa-v)}`; }
async function fazerRetirada(){ const U=S.u, el=document.getElementById('ret-valor'); if(!el||ocupado||S.semana<retLivreEm()) return;
  const v=clamp(Math.floor(+el.value||0),0,Math.max(0,S.caixa)); if(v<=0) return; const d=divisaoRetirada(v);
  S.caixa-=v; S.bolso+=d.voce; U.ultRet=S.semana; U.retHist=[{w:S.semana,voce:d.voce,soc:d.soc},...(U.retHist||[])].slice(0,12);
  if(d.soc) for(const f of U.equipe.filter(f=>f.funcao==='socio')) f.moral=clamp(f.moral+4,0,100);
  addLog(`Retirada de ${brl(v)}: ${brl(d.voce)} para você${d.soc?` e ${brl(d.soc)} aos sócios`:''}.`,'g'); salvar(); render(); }
{ const r2=render; render=function(){ r2(); atualizarRetirada(); }; }

