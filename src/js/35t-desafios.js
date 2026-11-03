// ===================== DESAFIOS =====================
// Diferente das metas (curtas e sorteadas), os desafios são escolhidos por você: objetivos grandes, com prazo, no máximo 2 ativos.
// Cumprir dá recompensa maior e uma insígnia na aba Conquistas. Desistir não custa nada; deixar o prazo vencer conta como falha.
const DSF_MAX=2;
const DSF=()=>S.dsf||(S.dsf={ativos:[],feitos:[],falhas:0,seq:0,viradas:0,mes:0});
const cargoPub=()=>S.carreira==='juiz'?S.j.cargo:S.carreira==='promotor'?S.p.cargo:S.carreira==='defensor'?S.d.cargo:0;
// tipos: 'delta' (conta o que você fez desde que aceitou), 'nivel' (chegar a um valor), 'seq' (meses seguidos cumprindo uma condição)
const DESAFIOS=[
  {id:'regional',car:'adv',t:'Escritório Regional em 4 anos',desc:'Chegue ao nível Regional antes de completar 4 anos de escritório.',tipo:'nivel',alvo:2,val:()=>tierEscritorio(),
    pode:()=>tierEscritorio()<2&&anosEscritorio()<3,prazo:()=>Math.max(6,((S.u.fundado||S.semana)+48)-S.semana),rec:{prest:5,din:60000}},
  {id:'nacional',car:'adv',t:'Escritório Nacional em 7 anos',desc:'Chegue ao nível Nacional antes de completar 7 anos de escritório.',tipo:'nivel',alvo:3,val:()=>tierEscritorio(),
    pode:()=>tierEscritorio()===2&&anosEscritorio()<6,prazo:()=>Math.max(6,((S.u.fundado||S.semana)+84)-S.semana),rec:{prest:8,din:200000}},
  {id:'epicos',car:'adv',t:'Três épicos seguidos',desc:'Vença 3 casos épicos ou lendários seguidos. Perder um deles zera a sequência.',tipo:'nivel',alvo:3,val:()=>DSF().seq,ini:()=>{ DSF().seq=0; },prazo:()=>36,rec:{prest:7,din:80000}},
  {id:'invicto',car:'adv',t:'Um ano invicto',desc:'Passe 12 meses sem perder nenhum caso, com pelo menos 6 vitórias no período.',tipo:'invicto',alvo:6,prazo:()=>12,rec:{prest:6,din:50000}},
  {id:'clientes',car:'adv',t:'Carteira de clientes',desc:'Tenha 6 clientes fixos ao mesmo tempo.',tipo:'nivel',alvo:6,val:()=>(S.clientes||[]).length,pode:()=>(S.clientes||[]).length<4,prazo:()=>36,rec:{prest:5,din:40000}},
  {id:'viradas',car:'adv',t:'Mestre da virada',desc:'Vença 3 audiências ao vivo que começaram com chance abaixo de 50%.',tipo:'nivel',alvo:3,val:()=>DSF().viradas,ini:()=>{ DSF().viradas=0; },prazo:()=>24,rec:{prest:6}},
  {id:'filiais',car:'adv',t:'Bandeira em três cidades',desc:'Tenha filiais em 3 lugares diferentes.',tipo:'nivel',alvo:3,val:()=>S.filiais.length,pode:()=>S.filiais.length<2,prazo:()=>48,rec:{prest:6,din:100000}},
  {id:'zero',car:'juiz',t:'Vara em dia',desc:'Fique 6 meses seguidos sem nenhum processo atrasado.',tipo:'seq',alvo:6,cond:()=>atrasadosPub()===0,prazo:()=>24,rec:{prest:6,pol:6}},
  {id:'mantidas',car:'juiz',t:'Sentenças que resistem',desc:'Tenha 10 sentenças mantidas pelo tribunal.',tipo:'delta',alvo:10,val:()=>S.j.mantidas||0,prazo:()=>30,rec:{prest:6,pol:5}},
  {id:'sentencas',car:'juiz',t:'Mutirão de sentenças',desc:'Profira 40 sentenças.',tipo:'delta',alvo:40,val:()=>S.j.sentencas||0,prazo:()=>12,rec:{prest:4,pol:4}},
  {id:'cond',car:'promotor',t:'Acusação implacável',desc:'Obtenha 15 condenações.',tipo:'delta',alvo:15,val:()=>S.p.condenacoes||0,prazo:()=>24,rec:{prest:6,pol:5}},
  {id:'anpp',car:'promotor',t:'Justiça negociada',desc:'Feche 8 acordos de não persecução penal.',tipo:'delta',alvo:8,val:()=>S.p.acordos||0,prazo:()=>18,rec:{prest:4,pol:5}},
  {id:'zeroMP',car:'promotor',t:'Mesa limpa',desc:'Fique 6 meses seguidos sem inquérito atrasado.',tipo:'seq',alvo:6,cond:()=>atrasadosPub()===0,prazo:()=>24,rec:{prest:6,pol:6}},
  {id:'soltos',car:'defensor',t:'Portas abertas',desc:'Liberte 6 assistidos presos por habeas corpus.',tipo:'delta',alvo:6,val:()=>S.d.solturas||0,prazo:()=>24,rec:{prest:6,pol:6}},
  {id:'vitDP',car:'defensor',t:'Defesa que vence',desc:'Consiga 20 vitórias para os seus assistidos.',tipo:'delta',alvo:20,val:()=>S.d.vitorias||0,prazo:()=>24,rec:{prest:5,pol:5}},
  {id:'promo',car:'pub',t:'Ascensão rápida',desc:'Seja promovido ao próximo cargo em até 4 anos.',tipo:'nivel',alvo:1,val:()=>cargoPub()-((DSF().promoBase??cargoPub())),ini:()=>{ DSF().promoBase=cargoPub(); },prazo:()=>48,rec:{prest:5,pol:8}},
  {id:'calma',car:'*',t:'Cabeça fria',desc:'Termine 12 meses seguidos com estresse abaixo de 50.',tipo:'seq',alvo:12,cond:()=>S.estresse<50,prazo:()=>24,rec:{prest:3,din:20000}},
  {id:'milhao',car:'*',t:'Primeiro milhão',desc:'Junte R$ 1 milhão de patrimônio.',tipo:'nivel',alvo:1000000,val:()=>Math.round(patrimonio()),dinheiro:true,pode:()=>patrimonio()<500000,prazo:()=>96,rec:{prest:4}},
  {id:'autoridade',car:'*',t:'Autoridade no assunto',desc:'Chegue a 5 estrelas numa área do direito (exige mestrado ou doutorado na área).',tipo:'nivel',alvo:5,val:()=>Math.max(...Object.keys(AREAS).map(k=>estrelas(k))),pode:()=>Object.keys(AREAS).every(k=>estrelas(k)<5),prazo:()=>72,rec:{prest:6,din:50000}},
];
const dsfDe=id=>DESAFIOS.find(d=>d.id===id);
const dsfCarreira=d=>d.car==='*'||d.car===S.carreira||(d.car==='pub'&&['juiz','promotor','defensor'].includes(S.carreira));
const dsfNoJogo=()=>['adv','juiz','promotor','defensor'].includes(S.carreira);
function dsfDisponiveis(){ const D=DSF(); return DESAFIOS.filter(d=>dsfCarreira(d)&&!D.feitos.includes(d.id)&&!D.ativos.some(a=>a.id===d.id)&&(!d.pode||d.pode())); }
function dsfProg(a){ const d=dsfDe(a.id); if(!d) return 0;
  if(d.tipo==='delta') return Math.max(0,d.val()-a.base);
  if(d.tipo==='seq') return a.seq||0;
  if(d.tipo==='invicto') return Math.max(0,S.vitorias-a.base);
  return Math.max(0,d.val()); }
function aceitarDesafio(id){ const D=DSF(), d=dsfDe(id); if(!d||D.ativos.length>=DSF_MAX||D.ativos.some(a=>a.id===id)) return;
  if(d.ini) d.ini();
  const a={id,ini:S.semana,ate:S.semana+d.prazo(),car:S.carreira};
  if(d.tipo==='delta') a.base=d.val(); if(d.tipo==='invicto'){ a.base=S.vitorias; a.der=S.derrotas; } if(d.tipo==='seq') a.seq=0;
  D.ativos.push(a); addLog(`Desafio aceito: ${d.t}. Prazo até o mês ${a.ate}.`); salvar(); render(); }
function desistirDesafio(id){ const D=DSF(), d=dsfDe(id); D.ativos=D.ativos.filter(a=>a.id!==id); if(d) addLog(`Você desistiu do desafio “${d.t}”.`); salvar(); render(); }
function cumprirDesafio(a,d){ const D=DSF(), r=d.rec; D.ativos=D.ativos.filter(x=>x!==a); D.feitos.push(d.id);
  if(r.prest) S.prest=clamp(S.prest+r.prest,0,100); if(r.din) pagarPessoal(-r.din); if(r.pol) S.pol=clamp((S.pol??10)+r.pol,0,100);
  addLog(`Desafio cumprido: ${d.t}! ${recTxt(r)}.`,'g'); noticia('meta',`${S.nome} cumpre o desafio “${d.t}”`,`${d.desc} Recompensa: ${recTxt(r)}.`,3);
  if(typeof toastMeta==='function') toastMeta({t:`Desafio: ${d.t}`,rec:r}); }
// uma vez por mês: sequências, invicto, prazo
function checarDesafios(){ if(!S||!dsfNoJogo()) return; const D=DSF(); const novoMes=D.mes!==S.semana; D.mes=S.semana;
  for(const a of [...D.ativos]){ const d=dsfDe(a.id); if(!d||a.car!==S.carreira){ D.ativos=D.ativos.filter(x=>x!==a); continue; }
    if(novoMes&&d.tipo==='seq') a.seq=d.cond()?(a.seq||0)+1:0;
    if(d.tipo==='invicto'&&S.derrotas>a.der){ D.ativos=D.ativos.filter(x=>x!==a); D.falhas++; addLog(`Desafio perdido: ${d.t} (houve uma derrota).`,'r'); continue; }
    const ok=d.tipo==='invicto'?(S.semana>=a.ate&&dsfProg(a)>=d.alvo):dsfProg(a)>=d.alvo;
    if(ok){ cumprirDesafio(a,d); continue; }
    if(S.semana>a.ate){ D.ativos=D.ativos.filter(x=>x!==a); D.falhas++; addLog(`Prazo do desafio “${d.t}” venceu.`,'r'); } } }
{ const f0=fimSemana; fimSemana=async function(){ const r=await f0(); if(S&&!S.fim){ checarDesafios(); salvar(); render(); } return r; }; }
// sequência de épicos e viradas ao vivo
{ const d0=depoisDoVeredito; depoisDoVeredito=function(c,ganhou){ const ini=c._vivoIni, D=S&&DSF();
    if(D&&RORD.indexOf(c.rar)>=3) D.seq=ganhou?(D.seq||0)+1:0;
    if(D&&ganhou&&ini!==undefined&&ini<.5) D.viradas=(D.viradas||0)+1;
    d0(c,ganhou); }; }
// ---------- telas ----------
const fmtDsf=(d,v)=>d.dinheiro?brl(v):Math.floor(v);
function cartaoDesafio(a){ const d=dsfDe(a.id), p=dsfProg(a), alvo=d.tipo==='invicto'?d.alvo:d.alvo, f=Math.min(1,p/alvo), falta=a.ate-S.semana;
  const extra=d.tipo==='invicto'?` · ${falta>0?`${falta} meses sem perder`:'último mês'}`:d.tipo==='seq'?' meses seguidos':'';
  return `<div class="meta-it dsf-it"><div class="meta-top"><span><b>${esc(d.t)}</b></span><span class="num">${fmtDsf(d,p)}/${fmtDsf(d,alvo)}${extra}</span></div>
    <div class="meter"><i style="width:${f*100}%"></i></div><small>${esc(d.desc)} · ${recTxt(d.rec)} · ${falta>=0?`até o mês ${a.ate} (${falta} ${falta===1?'mês':'meses'})`:'vencido'}</small></div>`; }
function painelDesafios(completo){ if(!S||!dsfNoJogo()) return ''; const D=DSF(), A=D.ativos.filter(a=>dsfDe(a.id)), L=dsfDisponiveis();
  if(!completo) return A.length?`<section class="panel"><div class="panel-head"><h2>Desafios</h2><span class="label">${A.length}/${DSF_MAX} ativos</span></div>${A.map(cartaoDesafio).join('')}</section>`:'';
  const ins=D.feitos.map(dsfDe).filter(Boolean);
  return `<section class="panel dsf"><div class="panel-head"><h2>Desafios</h2><span class="label">${D.feitos.length} cumpridos · ${D.falhas} falhas</span></div>
    <p style="margin:0;font-size:13px;color:var(--muted)">Escolha até ${DSF_MAX} objetivos grandes, com prazo. Cumpridos, dão recompensa e uma insígnia. Desistir não custa nada; deixar o prazo vencer conta como falha.</p>
    ${A.length?`<span class="label">Em andamento</span>${A.map(a=>cartaoDesafio(a).replace('</small></div>',`</small><button class="chip" data-act="dsfDesistir" data-v="${a.id}" style="align-self:flex-start">Desistir</button></div>`)).join('')}`:''}
    <span class="label">Disponíveis</span>
    ${L.length?`<div class="opts">${L.map(d=>`<button class="opt" data-act="dsfAceitar" data-v="${d.id}" ${A.length>=DSF_MAX?'disabled':''}><span>${esc(d.t)}</span><b class="num">${d.prazo()} meses</b><small>${esc(d.desc)} · ${recTxt(d.rec)}</small></button>`).join('')}</div>`:'<p class="empty">Nenhum desafio disponível agora. Novos aparecem conforme a carreira avança.</p>'}
    ${A.length>=DSF_MAX?`<small class="lo">Você já tem ${DSF_MAX} desafios em andamento. Cumpra ou desista de um para aceitar outro.</small>`:''}
    ${ins.length?`<span class="label">Insígnias</span><div class="chips">${ins.map(d=>`<span class="tag dsf-ins" title="${esc(d.desc)}">🏅 ${esc(d.t)}</span>`).join('')}</div>`:''}
  </section>`; }
{ const r0=renderConquistas; renderConquistas=function(){ r0(); const h=painelDesafios(true); if(!h) return;
    const alvo=[...app.children].find(el=>!el.matches('header.top,.ticker,.tut')); if(alvo) alvo.insertAdjacentHTML('beforebegin',h); else app.insertAdjacentHTML('beforeend',h); }; }
{ const d0=painelDiario; painelDiario=function(){ return painelDesafios(false)+d0(); }; }
document.addEventListener('click',e=>{ const b=e.target.closest('[data-act=dsfAceitar],[data-act=dsfDesistir]'); if(!b||b.disabled||!S) return;
  if(b.dataset.act==='dsfAceitar') aceitarDesafio(b.dataset.v); else desistirDesafio(b.dataset.v); });
