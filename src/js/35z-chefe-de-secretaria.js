// ===================== CHEFE DE SECRETARIA: GESTÃO DO CARTÓRIO (juiz, promotor e defensor) =====================
// O chefe (chefe de gabinete, de secretaria ou coordenador de atendimento) escolhe o foco do mês e cuida de férias,
// carga de trabalho e conflitos da equipe. O titular dá sempre a palavra final: decisões sensíveis vão para uma fila
// "Sua palavra final". O que ficar sem resposta até o fim do mês segue a recomendação do chefe.
const FOCOS_PUB={
  juridico:{nome:'Jurídico',lema:'Decisões mais bem feitas',ef:()=>['revisão: +4 de chance nas decisões e peças','menos reforma no tribunal'],custo:'equipe rende 5% menos'},
  administrativo:{nome:'Administrativo',lema:'Cartório em dia',ef:()=>['equipe +20% de blocos por mês','+1 bloco de folga no expediente'],custo:'sem bônus nas decisões'},
  mutirao:{nome:'Mutirão',lema:'Zerar o acervo',ef:()=>[S.carreira==='juiz'?'+3 julgamentos rápidos no mês':'atendimento em lote: +2 blocos da equipe','atrasos pesam metade na efetividade'],custo:'moral da equipe −3 por mês'},
};
const pubCarreira=()=>!!S&&['juiz','promotor','defensor'].includes(S.carreira);
const chefeAtivo=()=>pubCarreira()&&!!S.u&&!!gestorAtual();
const GP=()=>{ const G=gestao(); if(!G.pub) G.pub={focoMes:'juridico',deleg:{ferias:'auto',carga:'auto',conflitos:'auto'}}; if(!S.pf) S.pf=[]; return G.pub; };
function focoPubAtivo(k){ return chefeAtivo()&&GP().focoMes===k; }
function fatorAtrasoPub(){ return focoPubAtivo('mutirao')?.5:1; }
const delegPub=k=>chefeAtivo()&&GP().deleg[k]==='auto';
// ---------- efeitos ----------
{ const c0=calcAcerto; calcAcerto=function(p){ const r=c0(p); if(focoPubAtivo('juridico')){ r.items=r.items||[]; r.items.push(['Foco jurídico: revisão',4]); r.ch=clamp(r.ch+.04,.05,.95); } return r; }; }
for(const nome of ['calcCondenacao','calcDefesa']){ const f0=nome==='calcCondenacao'?calcCondenacao:calcDefesa;
  const f=function(c){ const r=f0(c); if(focoPubAtivo('juridico')){ r.items=r.items||[]; r.items.push(['Foco jurídico: revisão',4]); r.ch=clamp(r.ch+.04,.05,.95); } return r; };
  if(nome==='calcCondenacao') calcCondenacao=f; else calcDefesa=f; }
{ const s0=staffBlocos; staffBlocos=function(){ let b=s0(); if(!pubCarreira()) return b;
    const fer=S.u.equipe.filter(f=>f.ferias===S.semana).reduce((a,f)=>a+FX()[f.funcao].bl*(.6+f.moral/250),0); b=Math.max(0,b-Math.floor(fer));
    if(focoPubAtivo('administrativo')) b=Math.floor(b*1.2)+1;
    if(focoPubAtivo('juridico')) b=Math.floor(b*.95);
    if(focoPubAtivo('mutirao')&&S.carreira!=='juiz') b+=2;
    return b; }; }
// ---------- palavra final ----------
let pfId=0;
function pedirPalavra(d){ GP(); if(S.pf.some(x=>x.chave&&x.chave===d.chave)) return; S.pf.push({id:++pfId+'-'+S.semana,mes:S.semana,...d}); }
function aplicarPalavra(x,v){ const op=x.ops.find(o=>o.v===v)||x.ops[0]; const L=S.u.equipe, a=L.find(f=>f.id===x.a), b=x.b?L.find(f=>f.id===x.b):null;
  if(x.tipo==='ferias'&&a){ if(v==='sim'){ a.ferias=S.semana+1; a.feriasEm=S.semana; a.moral=clamp(a.moral+18,0,100); } else a.moral=clamp(a.moral-6,0,100); }
  if(x.tipo==='conflito'&&a&&b){ if(v==='advertir'){ a.moral=clamp(a.moral-5,0,100); b.moral=clamp(b.moral+8,0,100); } else if(v==='setor'){ a.moral=clamp(a.moral+5,0,100); b.moral=clamp(b.moral+5,0,100); a.ferias=a.ferias; S.u.perdaSetor=S.semana; } else { a.moral=clamp(a.moral-4,0,100); b.moral=clamp(b.moral-4,0,100); } }
  addLog(`Palavra final: ${op.log}`,op.cls||''); S.pf=S.pf.filter(y=>y!==x); }
document.addEventListener('click',e=>{ const b=e.target.closest('[data-pf]'); if(!b||!S||!S.pf) return; const x=S.pf.find(y=>y.id===b.dataset.pf); if(!x) return; aplicarPalavra(x,b.dataset.v); salvar(); render(); });
// ---------- o chefe no fim do mês ----------
function semanaChefe(){ const U=S.u, G=GP(), rel=[]; U.auto=chefeAtivo()&&G.deleg.carga==='auto';
  // decisões sem resposta seguem a recomendação do chefe (ou a opção mais neutra, sem chefe)
  for(const x of [...S.pf].filter(x=>x.mes<S.semana)){ const v=x.rec||x.ops[0].v; /* sem chefe, o padrão protege a equipe (aprovar férias, mudar de setor) */ aplicarPalavra(x,v); rel.push(['',`Sem resposta: “${x.titulo}” seguiu ${x.rec?'a recomendação do chefe':'o padrão (a primeira opção)'}.`]); }
  if(focoPubAtivo('mutirao')) for(const f of U.equipe) f.moral=clamp(f.moral-3,0,100);
  const chefe=chefeAtivo();
  if(chefe) rel.push(['b',`Foco do mês: ${FOCOS_PUB[G.focoMes].nome}.`]);
  // férias: o chefe marca para quem está com moral baixa; em mês de mutirão ou sem chefe, a decisão é sua
  const cansados=U.equipe.filter(f=>f.id!==U.gestorId&&f.moral<45&&(!f.feriasEm||S.semana-f.feriasEm>=6)).slice(0,2);
  for(const f of cansados){
    if(chefe&&G.deleg.ferias==='auto'&&!focoPubAtivo('mutirao')){ f.ferias=S.semana+1; f.feriasEm=S.semana; const a=Math.round(f.moral); f.moral=clamp(f.moral+18,0,100); rel.push(['g',`${f.nome} sai de férias no próximo mês (moral ${a} → ${Math.round(f.moral)}).`]); }
    else pedirPalavra({tipo:'ferias',chave:'f'+f.id,a:f.id,titulo:`${f.nome} pediu férias`,txt:`${nomeFuncao(f)}, moral ${Math.round(f.moral)}.${focoPubAtivo('mutirao')?' O cartório está em mutirão.':''}`,
      rec:chefe?'sim':null,recTxt:chefe?'O chefe recomenda aprovar: com a moral baixa, a pessoa pode pedir remoção.':'',
      ops:[{v:'sim',t:'Aprovar férias',log:`férias de ${f.nome} aprovadas.`,cls:'g'},{v:'nao',t:'Negar',log:`férias de ${f.nome} negadas.`,cls:'r'}]}); }
  // conflitos: com 4 ou mais pessoas, às vezes duas se desentendem
  const L=U.equipe.filter(f=>f.id!==U.gestorId);
  if(L.length>=3&&Math.random()<.12){ const [a,b]=[...L].sort(()=>Math.random()-.5); a.moral=clamp(a.moral-8,0,100); b.moral=clamp(b.moral-8,0,100);
    const grave=Math.random()<.35;
    if(chefe&&G.deleg.conflitos==='auto'&&!grave){ a.moral=clamp(a.moral+8,0,100); b.moral=clamp(b.moral+8,0,100); rel.push(['g',`Desentendimento entre ${a.nome.split(' ')[0]} e ${b.nome.split(' ')[0]} mediado pelo chefe.`]); }
    else pedirPalavra({tipo:'conflito',chave:'c'+a.id+'-'+b.id,a:a.id,b:b.id,titulo:`Conflito entre ${a.nome.split(' ')[0]} e ${b.nome.split(' ')[0]}`,txt:grave?'A discussão passou do ponto e chegou à corregedoria interna.':'Os dois não estão conseguindo trabalhar juntos.',
      rec:chefe?'setor':null,recTxt:chefe?'O chefe recomenda mudar um deles de setor.':'',
      ops:[{v:'setor',t:'Mudar de setor',log:`${a.nome} mudou de setor; o clima melhorou.`,cls:'g'},{v:'advertir',t:`Advertir ${a.nome.split(' ')[0]}`,log:`${a.nome} foi advertido.`},{v:'nada',t:'Deixar como está',log:'o conflito ficou sem solução.',cls:'r'}]}); }
  if(chefe&&G.deleg.carga==='auto') rel.push(['','Expediente e processos distribuídos entre a equipe.']);
  if(S.pf.length) rel.push(['r',`${S.pf.length} decisão(ões) esperando a sua palavra final.`]);
  S.relChefe={mes:S.semana,l:rel}; }
{ const s0=semanaEstruturaPub; semanaEstruturaPub=function(...a){ const r=s0(...a); if(pubCarreira()) semanaChefe(); return r; }; }
// ---------- painel ----------
function blocoChefe(){ const G=GP(), chefe=chefeAtivo(), nome=nomeGestor();
  const cards=Object.entries(FOCOS_PUB).map(([k,f])=>{ const on=chefe&&G.focoMes===k;
    return `<button class="gx-foco ${on?'on':''}" data-pfoco="${k}" ${chefe?'':'aria-disabled="true"'} aria-pressed="${on}"><span class="gx-ft"><b>${f.nome}</b><span class="num">${on?'este mês':''}</span></span>
      <small class="gx-mut">${f.lema}</small><ul>${f.ef().map(x=>`<li>${x}</li>`).join('')}</ul><small class="gx-mut">Em troca: ${f.custo}</small></button>`; }).join('');
  const DL=[['ferias','Férias da equipe','marca férias para quem está com moral baixa; em mutirão, pede a sua palavra'],['carga','Carga de trabalho','distribui o expediente e os processos entre a equipe'],['conflitos','Conflitos','media os desentendimentos leves; os graves vêm para você']];
  const deleg=DL.map(([k,t,d])=>{ const m=chefe?G.deleg[k]:'manual'; return `<div class="gx-row"><span><b>${t}</b><br><small class="gx-mut">${m==='auto'?d:'tudo vem para a sua palavra final'}</small></span>
    <span class="gx-seg"><button data-pdeleg="${k}" data-v="auto" class="${m==='auto'?'on':''}" ${chefe?'':'disabled'}>Chefe</button><button data-pdeleg="${k}" data-v="manual" class="${m==='manual'?'on':''}" ${chefe?'':'disabled'}>Eu decido</button></span></div>`; }).join('');
  const pf=S.pf.length?`<div class="pf-box"><span class="label">Sua palavra final</span>${S.pf.map(x=>`<div class="pf-it"><b>${esc(x.titulo)}</b><small>${esc(x.txt)}${x.recTxt?` ${esc(x.recTxt)}`:''}</small>
      <div class="chips">${x.ops.map(o=>`<button class="chip ${x.rec===o.v?'on':''}" data-pf="${x.id}" data-v="${o.v}">${esc(o.t)}</button>`).join('')}</div></div>`).join('')}
      <small class="gx-mut">O que ficar sem resposta até o fim do mês segue ${chefe?'a recomendação do chefe':'o padrão'}.</small></div>`:'';
  const R=S.relChefe&&S.relChefe.l.length?`<span class="label">Relatório do chefe · mês ${S.relChefe.mes}</span><ul class="gx-rel">${S.relChefe.l.map(([c,t])=>`<li><i class="${c}"></i><span>${t}</span></li>`).join('')}</ul>`:'';
  return `${chefe?'':`<div class="gx-lock"><b>Sem ${nome.toLowerCase()}, a gestão do cartório é sua</b><p class="gx-nt">Nomeie um ${nome.toLowerCase()} na equipe para escolher o foco do mês e delegar férias, carga e conflitos. Você continua com a palavra final.</p></div>`}
    ${pf}
    <span class="label">Foco do mês · ${chefe?'clique para escolher':'precisa de um '+nome.toLowerCase()}</span><div class="gx-focos">${cards}</div>
    <div class="gx-cols"><div class="gx-col"><span class="label">O que o chefe cuida</span><div class="gx-rows">${deleg}</div></div><div class="gx-col">${R}</div></div>`; }
{ const p0=painelGestaoPub; painelGestaoPub=function(){ let h=p0(); if(!h) return h;
    h=h.replace(/<div class="pilha"><span class="label">Equipe<\/span>[\s\S]*?<\/label><\/div>/,''); // a distribuição agora é a delegação "Carga de trabalho"
    return h.replace(/<\/section>\s*$/,blocoChefe()+'</section>'); }; }
document.addEventListener('click',e=>{ if(!pubCarreira()) return; const b=e.target.closest('[data-pfoco],[data-pdeleg]'); if(!b||b.disabled||b.getAttribute('aria-disabled')==='true') return; const G=GP();
  if(b.dataset.pfoco){ G.focoMes=b.dataset.pfoco; addLog(`Foco do mês do cartório: ${FOCOS_PUB[G.focoMes].nome}.`); } else G.deleg[b.dataset.pdeleg]=b.dataset.v; salvar(); render(); });
// aviso na tela principal quando há decisão esperando
{ const d0=painelDiario; painelDiario=function(){ const h=d0(); if(!pubCarreira()||!S.pf||!S.pf.length) return h;
    return `<section class="panel"><div class="panel-head"><h2>Sua palavra final</h2><span class="label">${S.pf.length} esperando</span></div><p class="gx-nt">${S.pf.map(x=>esc(x.titulo)).join(' · ')}</p><button class="btn ghost" data-act="view" data-v="estrutura">Decidir na aba Estrutura e equipe</button></section>`+h; }; }
