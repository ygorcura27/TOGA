// ===================== JORNAL, RIVAIS, REPERCUSSÃO E METAS =====================
// A Gazeta Forense sai todo mês com o que aconteceu com você, com o país e com seus rivais. Sair na manchete rende prestígio.
const MESES_N=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const mesNome=m=>`${MESES_N[(m-1)%12]} do ano ${Math.floor((m-1)/12)+1}`;
const CAT_BOA=['caso','carreira','perfil','opiniao','academia','meta'];
const ICO={
  balanca:'<path d="M12 3v18M6 21h12M12 5l-7 3m7-3l7 3M5 8l-2.5 6a3 3 0 0 0 5 0L5 8zm14 0l-2.5 6a3 3 0 0 0 5 0L19 8z"/>',
  martelo:'<path d="M14 4l6 6M11 7l6 6M12.5 5.5l-4 4M17.5 10.5l-4 4M10.5 11.5L3 19"/><path d="M3 21h9"/>',
  predio:'<path d="M3 21h18M4 10h16M12 3l9 5H3l9-5zM6 10v8M10 10v8M14 10v8M18 10v8M4 18h16"/>',
  livro:'<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5z"/><path d="M4 19a2 2 0 0 1 2-2h13M9 7h6"/>',
  pena:'<path d="M20 4c-6 0-11 5-12 11l-2 5 5-2c6-1 11-6 11-12V4h-2z"/><path d="M8 15l6-6"/>',
  grafico:'<path d="M4 20V4M4 20h16M7 16l4-5 3 3 5-7"/>',
  alerta:'<path d="M12 3l10 18H2L12 3z"/><path d="M12 10v5M12 18v.5"/>',
  trofeu:'<path d="M7 4h10v5a5 5 0 0 1-10 0V4zM12 14v4M8 21h8M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4"/>',
  duelo:'<path d="M4 20l9-9M20 20l-9-9M14 4l6 6M10 4L4 10M6 16l2 2M18 16l-2 2"/>',
  toga:'<path d="M8 3h8l4 6-3 2v10H7V11L4 9l4-6z"/><path d="M12 3v18"/>',
};
const ICO_CAT={caso:'balanca',carreira:'toga',perfil:'trofeu',brasil:'predio',escandalo:'alerta',opiniao:'pena',academia:'livro',rival:'duelo',meta:'grafico'};
const svgIco=(k,cls='')=>`<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICO[k]||ICO.balanca}</svg>`;
const JN=()=>S.jornal||(S.jornal={n:[],lido:0,coluna:0});
function noticia(cat,titulo,txt,peso=1,ico){ const J=JN();
  J.n.unshift({m:S.semana,cat,titulo,txt,peso,ico:ico||ICO_CAT[cat]}); J.n=J.n.slice(0,150);
  if(peso>=3&&CAT_BOA.includes(cat)) S.prest=clamp(S.prest+1,0,100); } // sair na manchete rende prestígio
// o diário vira pauta do jornal
{ const l0=addLog; addLog=function(t,k){ l0(t,k); if(!S||S._semNoticia) return; let m;
  if((m=t.match(/^Promovid[oa] a (.+?) em (.+?)\.$/))) noticia('carreira',`${S.nome} assume como ${m[1]}`,`Depois de ${tempoNoCargo()}, a nomeação saiu: o novo posto é em ${m[2]}.`,3);
  else if((m=t.match(/^Posse como (.+?) na comarca de (.+?)\./))) noticia('carreira',`${S.nome} toma posse como ${m[1]}`,`A comarca de ${m[2]} recebe ${gen('o novo','a nova')} titular.`,3);
  else if((m=t.match(/^Conquista (épica|lendária): (.+)\.$/))) noticia('perfil',`${m[2]}: a marca de ${S.nome}`,`Uma conquista ${m[1]} entra para a história da carreira.`,2);
  else if((m=t.match(/^Aprovada a (.+?):/))) noticia('brasil',`Congresso aprova a ${m[1]}`,'Advogados correm para se atualizar: parte do que se sabia ficou para trás.',2);
  else if((m=t.match(/^No Congresso: “(.+?)” entrou em pauta/))) noticia('brasil',`${m[1]} entra em pauta`,'A votação deve acontecer em um ano.',1);
  else if(/^Escândalo/.test(t)) noticia('escandalo',`Escândalo envolve ${S.nome}`,t.replace(/^Escândalo: /,''),3);
  else if(/^Erro judiciário/.test(t)) noticia('escandalo','Erro judiciário vem à tona',t,3);
  else if(/^Trânsito em julgado/.test(t)) {} }; }
const tempoNoCargo=()=>{ const X=pubAtual(); return X?tempoTxt(Math.max(1,S.semana-(X.desde||0)))+' no cargo anterior':'anos de trabalho'; };

// ---------- rivais com rosto ----------
const RIVAL_NOMES=[['Dr. Augusto Ventura','Ventura & Associados','o veterano','tese'],['Dra. Lívia Montenegro','Montenegro Advogados','a estrela em ascensão','testemunha'],['Dr. Henrique Salles','Salles Bancário','o tubarão','prova'],['Dra. Clara Bittencourt','Bittencourt Penal','a criminalista','testemunha']];
function rivais(){ if(!S.rivais){ S.rivais=RIVAL_NOMES.slice().sort(()=>Math.random()-.5).slice(0,3).map(([nome,escr,apelido,forte],i)=>({id:i+1,nome,escr,apelido,forte,forca:rint(3,6),v:0,d:0,desde:S.semana})); } return S.rivais; }
const rivalDe=c=>c&&c.rival?rivais().find(r=>r.id===c.rival):null;
{ const g0=gerarOfertas; gerarOfertas=function(){ g0(); if(S.carreira!=='adv') return;
    for(let i=0;i<(S.indicaExtra||0);i++){ const c=casoEsc(S.sede); c.imprensa=true; S.ofertas.push(c); } S.indicaExtra=0;
    for(const c of S.ofertas) if(!c.rival&&Math.random()<.22&&RORD.indexOf(c.rar)>=1){ const r=pick(rivais()); c.rival=r.id; c.d+=r.forca;
      c.perfilAdv={testemunha:-2,prova:-2,tese:-2}; c.perfilAdv[r.forte]=6; } }; }
{ const p0=pasta; pasta=function(c,ativo){ let h=p0(c,ativo); const r=rivalDe(c);
    if(r) h=h.replace('<dl class="meta">',`<dl class="meta"><dt>Adversário</dt><dd><b>${esc(r.nome)}</b> · ${r.apelido} · você ${r.v}×${r.d}</dd>`);
    if(c.imprensa) h=h.replace('<dl class="meta">','<dl class="meta"><dt>Origem</dt><dd class="hi">indicação após notícia no jornal</dd>');
    return h; }; }
function semanaRivais(){ if(S.carreira==='adv'&&S.rivais&&S.semana%12===0) for(const r of S.rivais) r.forca=Math.min(14,r.forca+1);
  const R=S.rivalPub; if(R&&pubAtual()){ R.rep=clamp(R.rep+rnd(-.2,.9),0,100); } }
function rivalPub(){ if(!['juiz','promotor','defensor'].includes(S.carreira)) return null;
  if(!S.rivalPub||S.rivalPub.car!==S.carreira){ const g=Math.random()<.5?'m':'f'; S.rivalPub={car:S.carreira,nome:nomeGenero(g),g,rep:clamp(S.prest+rint(-8,6),0,100),cargo:pubAtual().cargo}; }
  return S.rivalPub; }

// ---------- antes e depois do veredito: rival, repercussão e metas ----------
function depoisDoVeredito(c,ganhou){
  const r=rivalDe(c), vivo=c._vivoFim!==undefined;
  if(r){ if(ganhou){ r.v++; S.rivalVit=(S.rivalVit||0)+1; noticia('rival',`${S.nome} vence ${r.nome} de novo`,`Em “${c.titulo}”, ${r.apelido} saiu derrotado. O placar entre os dois está ${r.v}×${r.d}.`,r.v>=3?3:2); }
    else { r.d++; r.forca=Math.min(14,r.forca+1); noticia('rival',`${r.nome} supera ${S.nome}`,`Em “${c.titulo}”, ${r.apelido} levou a melhor. O placar está ${r.v}×${r.d}.`,1); } }
  if(vivo){ const virada=c._vivoFim-c._vivoIni, grande=RORD.indexOf(c.rar)>=3;
    if(ganhou){ S.vivoVit=(S.vivoVit||0)+1;
      if(virada>=.15||c._vivoIni<.4||grande){ noticia('caso',virada>=.15?`Virada no tribunal: ${c.titulo}`:`${S.nome} vence o caso “${c.titulo}”`,
          `A chance era de ${pct(c._vivoIni)} quando a audiência começou. ${virada>=.15?'Uma atuação de virada':'Uma atuação segura'} que o meio jurídico comenta.`,3);
        if(S.carreira==='adv') S.indicaExtra=(S.indicaExtra||0)+(grande?2:1); else S.pol=clamp((S.pol??10)+3,0,100); } }
    else if(grande) noticia('caso',`Derrota em caso de repercussão: ${c.titulo}`,`Apesar da audiência disputada, o resultado não veio.`,2); }
  delete c._vivoIni; delete c._vivoFim; }
{ const a0=audiencia; audiencia=async function(c){ const v0=S.vitorias; const r=await a0(c); if(S) depoisDoVeredito(c,S.vitorias>v0); return r; }; }
{ const j0=julgamentoMP; julgamentoMP=async function(c){ const v0=S.p.condenacoes; const r=await j0(c); if(S) depoisDoVeredito(c,S.p.condenacoes>v0); return r; }; }
{ const j0=julgamentoDP; julgamentoDP=async function(c){ const v0=S.d.vitorias; const r=await j0(c); if(S) depoisDoVeredito(c,S.d.vitorias>v0); return r; }; }
// juiz: audiência presidida com acerto vira notícia; rival de carreira disputa a vaga da promoção
{ const a0=audienciaJuizSe; audienciaJuizSe=async function(p){ const r=await a0(p);
    if(r&&r.recMais===0){ S.vivoAcertos=(S.vivoAcertos||0)+1; if(RORD.indexOf(p.rar)>=3) noticia('caso',`${S.nome} conduz audiência exemplar`,`No processo “${p.titulo}”, a instrução separou o que convencia do que era verdade.`,3); }
    return r; }; }
for(const nome of ['promocao','promocaoMP','promocaoDP']){
  const f0={promocao,promocaoMP,promocaoDP}[nome];
  const novo=async function(){ const R=rivalPub(), X=pubAtual();
    if(R&&X&&R.cargo===X.cargo&&R.rep>S.prest&&!ocupado&&Math.random()<.4){
      R.cargo++; R.rep=Math.max(0,R.rep-20);
      noticia('rival',`${R.nome} fica com a vaga disputada`,`Com reputação de ${Math.round(R.rep+20)}, ${R.g==='f'?'a colega':'o colega'} passou na frente de ${S.nome} na promoção.`,2);
      addLog(`A vaga da promoção ficou com ${R.nome}, que tinha mais reputação. Tente de novo no próximo mês.`,'r'); salvar(); render(); return; }
    return f0(); };
  if(nome==='promocao') promocao=novo; else if(nome==='promocaoMP') promocaoMP=novo; else promocaoDP=novo; }

// ---------- metas de médio prazo (24 meses) ----------
const METAS_POOL=[
  {id:'vit10',car:'adv',t:'Vencer 10 casos',alvo:10,val:()=>S.vitorias,rec:{prest:2,din:15000}},
  {id:'nivel',car:'adv',t:'Subir um nível de escritório',alvo:1,val:()=>tierEscritorio(),rec:{prest:4,din:30000}},
  {id:'cli',car:'adv',t:'Conquistar 2 clientes fixos',alvo:2,val:()=>(S.clientes||[]).length,rec:{prest:2,din:20000}},
  {id:'vivo3',car:'adv',t:'Vencer 3 audiências ao vivo',alvo:3,val:()=>S.vivoVit||0,rec:{prest:3,din:10000}},
  {id:'rival2',car:'adv',t:'Vencer um rival 2 vezes',alvo:2,val:()=>S.rivalVit||0,rec:{prest:3,din:8000}},
  {id:'mant',car:'juiz',t:'Ter 8 sentenças mantidas no tribunal',alvo:8,val:()=>S.j.mantidas,rec:{prest:3,pol:5}},
  {id:'sent',car:'juiz',t:'Proferir 60 sentenças',alvo:60,val:()=>S.j.sentencas,rec:{prest:2,pol:3}},
  {id:'acerto',car:'juiz',t:'Acertar a verdade em 3 audiências presididas',alvo:3,val:()=>S.vivoAcertos||0,rec:{prest:3,pol:4}},
  {id:'cond',car:'promotor',t:'Obter 15 condenações',alvo:15,val:()=>S.p.condenacoes,rec:{prest:3,pol:4}},
  {id:'anpp',car:'promotor',t:'Fechar 5 acordos de não persecução',alvo:5,val:()=>S.p.acordos,rec:{prest:2,pol:3}},
  {id:'vivoMP',car:'promotor',t:'Vencer 3 audiências ao vivo',alvo:3,val:()=>S.vivoVit||0,rec:{prest:3,pol:4}},
  {id:'atd',car:'defensor',t:'Fazer 40 atendimentos adequados',alvo:40,val:()=>S.d.atendimentos,rec:{prest:3,pol:3}},
  {id:'hc',car:'defensor',t:'Libertar 4 assistidos por habeas corpus',alvo:4,val:()=>S.d.solturas,rec:{prest:3,pol:4}},
  {id:'vivoDP',car:'defensor',t:'Vencer 3 audiências ao vivo',alvo:3,val:()=>S.vivoVit||0,rec:{prest:3,pol:4}},
  {id:'prest',car:'*',t:'Ganhar 12 pontos de prestígio',alvo:12,val:()=>Math.round(S.prest),teto:100,rec:{din:12000}},
  {id:'pat',car:'*',t:'Juntar R$ 150 mil de patrimônio',alvo:150000,val:()=>Math.round(patrimonio()),rec:{prest:2},dinheiro:true},
];
const recTxt=r=>[r.prest?`+${r.prest} prestígio`:'',r.din?`+${brl(r.din)}`:'',r.pol?`+${r.pol} capital político`:''].filter(Boolean).join(' · ');
function metasAtivas(){ if(!S||!['adv','juiz','promotor','defensor'].includes(S.carreira)) return [];
  const M=S.metas||(S.metas={ativas:[],feitas:0,car:S.carreira}); if(M.car!==S.carreira){ M.ativas=[]; M.car=S.carreira; }
  while(M.ativas.length<3){ const usados=M.ativas.map(a=>a.id), pool=METAS_POOL.filter(m=>(m.car===S.carreira||m.car==='*')&&!usados.includes(m.id)&&!(m.teto&&m.val()+m.alvo>m.teto));
    if(!pool.length) break; const m=pick(pool); M.ativas.push({id:m.id,base:m.val(),ate:S.semana+24}); }
  return M.ativas.map(a=>{ const m=METAS_POOL.find(x=>x.id===a.id); return {a,m,feito:Math.max(0,m.val()-a.base)}; }); }
function checarMetas(){ const L=metasAtivas(); if(!L.length) return; const M=S.metas;
  for(const {a,m,feito} of L){
    if(feito>=m.alvo){ const r=m.rec; if(r.prest) S.prest=clamp(S.prest+r.prest,0,100); if(r.din) pagarPessoal(-r.din); if(r.pol) S.pol=clamp((S.pol??10)+r.pol,0,100);
      M.ativas=M.ativas.filter(x=>x!==a); M.feitas++; addLog(`Meta cumprida: ${m.t}. ${recTxt(r)}.`,'g'); noticia('meta',`${S.nome} cumpre a meta: ${m.t.toLowerCase()}`,`Recompensa: ${recTxt(r)}.`,2);
      toastMeta(m); }
    else if(S.semana>a.ate){ M.ativas=M.ativas.filter(x=>x!==a); addLog(`Meta expirada: ${m.t}.`,'r'); } }
  metasAtivas(); }
function toastMeta(m){ let box=document.getElementById('toasts'); if(!box){ box=document.createElement('div'); box.id='toasts'; document.body.appendChild(box); }
  const t=document.createElement('div'); t.className='toast'; t.style.setProperty('--tc','var(--gold)');
  t.innerHTML=`<span class="label">Meta cumprida</span><b>${esc(m.t)}</b><small>${recTxt(m.rec)}</small>`; box.appendChild(t); setTimeout(()=>t.classList.add('sai'),4200); setTimeout(()=>t.remove(),4700); }
function painelMetas(){ const L=metasAtivas(); if(!L.length) return '';
  return `<section class="panel"><div class="panel-head"><h2>Metas</h2><span class="label">${S.metas.feitas} cumpridas</span></div>
    ${L.map(({a,m,feito})=>{ const p=Math.min(1,feito/m.alvo); return `<div class="meta-it"><div class="meta-top"><span>${m.t}</span><span class="num">${m.dinheiro?brl(feito):feito}/${m.dinheiro?brl(m.alvo):m.alvo}</span></div>
      <div class="meter"><i style="width:${p*100}%"></i></div><small>${recTxt(m.rec)} · até o mês ${a.ate}</small></div>`; }).join('')}</section>`; }
{ const d0=painelDiario; painelDiario=function(){ return painelMetas()+d0(); }; }

// ---------- a Gazeta Forense ----------
let edJornal=null;
function edicao(m){ const J=JN(), n=J.n.filter(x=>x.m===m).sort((a,b)=>b.peso-a.peso);
  const ep=(S.epoca&&S.epoca.hist||[]).filter(h=>h.s===m).map(h=>({cat:'brasil',titulo:h.t,txt:'',peso:1,ico:'predio'}));
  const pubs=(S.ac&&S.ac.pubs||[]).filter(p=>p.semana===m).map(p=>({cat:'academia',titulo:`Publicado: “${p.titulo}”`,txt:`${p.tipo==='artigo'?`Artigo${p.qualis?' Qualis '+p.qualis:''}`:p.tipo[0].toUpperCase()+p.tipo.slice(1)} de ${S.nome}.`,peso:p.tipo==='artigo'?1:2,ico:'livro'}));
  return [...n,...pubs,...ep]; }
function renderJornal(){ const J=JN(), ult=Math.max(1,S.semana-1); if(edJornal===null||edJornal>ult) edJornal=ult; const m=edJornal; J.lido=Math.max(J.lido||0,m);
  const L=edicao(m), man=L[0], resto=L.slice(1);
  const col=(t,cats)=>{ const it=resto.filter(x=>cats.includes(x.cat)); return it.length?`<section class="jn-col"><h3>${t}</h3>${it.map(x=>`<article class="jn-nota">${svgIco(x.ico,'jn-ico')}<div><b>${esc(x.titulo)}</b>${x.txt?`<p>${esc(x.txt)}</p>`:''}</div></article>`).join('')}</section>`:''; };
  const R=S.carreira==='adv'&&S.rivais?S.rivais:null, RP=rivalPub();
  const podeColuna=(J.coluna||0)<S.semana;
  app.innerHTML=`${header()}
  <div class="jornal">
    <div class="jn-nav"><button class="btn ghost" data-act="jornalEd" data-v="-1" ${m<=1?'disabled':''}>◀ Edição anterior</button><span class="label">Edição nº ${m} · ${mesNome(m)}</span><button class="btn ghost" data-act="jornalEd" data-v="1" ${m>=ult?'disabled':''}>Próxima ▶</button></div>
    <article class="jn-papel">
      <header class="jn-cab"><span class="jn-meta">Ano ${Math.floor((m-1)/12)+1} · Edição ${m}</span><h1>Gazeta Forense</h1><span class="jn-meta">${mesNome(m)} · R$ 4,50</span></header>
      ${man?`<section class="jn-manchete"><div class="jn-foto">${['caso','carreira','perfil','meta','opiniao','escandalo'].includes(man.cat)?retrato(S.nome,{g:S.genero,size:170,cls:'jn-retrato',toga:S.carreira==='juiz'}):svgIco(man.ico,'jn-ico-g')}</div><div><span class="label">${({caso:'Tribunais',carreira:'Carreiras',perfil:'Perfil',brasil:'Brasil',escandalo:'Escândalo',opiniao:'Opinião',academia:'Academia',rival:'Duelo',meta:'Perfil'})[man.cat]||'Destaque'}</span><h2>${esc(man.titulo)}</h2>${man.txt?`<p>${esc(man.txt)}</p>`:''}</div></section>`
        :`<section class="jn-manchete"><div class="jn-foto">${svgIco('predio','jn-ico-g')}</div><div><span class="label">Movimento forense</span><h2>Mês tranquilo nos fóruns</h2><p>Nenhum caso seu chegou às páginas desta vez. Audiências ao vivo bem conduzidas, metas cumpridas e promoções viram notícia.</p></div></section>`}
      <div class="jn-cols">
        ${col('Tribunais e casos',['caso','rival'])}${col('Carreiras',['carreira','perfil','meta','escandalo'])}${col('Brasil',['brasil'])}${col('Academia e opinião',['academia','opiniao'])}
        ${R?`<section class="jn-col"><h3>Rivais na advocacia</h3><table class="jn-tab"><tr><th>Advogado</th><th>Você</th><th>Força</th></tr>${R.map(r=>`<tr><td>${esc(r.nome)}<small>${r.apelido} · ${esc(r.escr)}</small></td><td class="num">${r.v}×${r.d}</td><td class="num">+${r.forca}</td></tr>`).join('')}</table></section>`:''}
        ${RP?`<section class="jn-col"><h3>Concorrência na carreira</h3><p>${esc(RP.nome)} disputa as mesmas vagas: reputação <b class="num">${Math.round(RP.rep)}</b> contra a sua <b class="num">${Math.round(S.prest)}</b>. Quem tiver mais reputação na hora da promoção leva vantagem.</p></section>`:''}
      </div>
    </article>
    <section class="panel jn-coluna"><div class="panel-head"><h2>Sua coluna de opinião</h2><span class="label">uma por mês</span></div>
      <p style="margin:0;font-size:13px">Escreva um artigo para a próxima edição. Usa a sua Escrita (${Math.round(S.skills.escrita)}) e custa 8 de energia. Bem escrito, rende prestígio${S.carreira!=='adv'?' e capital político':''}; mal escrito, vira polêmica.</p>
      <button class="btn brass" data-act="coluna" ${podeColuna&&S.energia>=8?'':'disabled'}>${podeColuna?'Escrever coluna':'Coluna deste mês enviada'}</button></section>
  </div>`; }
const TEMAS_COL={penal:['O excesso de prisões preventivas','A delação premiada tem limites?'],civel:['O Judiciário e os contratos de adesão','Quem paga a conta da demora processual?'],trabalho:['O trabalho por aplicativo precisa de regras','Horas extras na era do celular'],familia:['Guarda compartilhada na prática','O afeto como vínculo jurídico'],empresarial:['Recuperação judicial não é calote','Startups e insegurança jurídica'],tributario:['Reforma tributária: quem ganha?','O contribuinte e o confisco disfarçado']};
function escreverColuna(){ const J=JN(); if((J.coluna||0)>=S.semana||S.energia<8) return; J.coluna=S.semana; S.energia=clamp(S.energia-8,0,100);
  const area=S.carreira==='juiz'?(S.j.vara||'civel'):S.carreira==='adv'?S.espec:'penal', t=pick(TEMAS_COL[area]||TEMAS_COL.civel);
  const ok=Math.random()<clamp(sig((S.skills.escrita-50)/10)+(vip('pena')?.2:0),.15,.95);
  if(ok){ S.prest=clamp(S.prest+2,0,100); if(S.carreira!=='adv') S.pol=clamp((S.pol??10)+2,0,100); noticia('opiniao',`“${t}”, por ${S.nome}`,'O artigo circula entre colegas e chega a ser citado em sessão.',2); addLog(`Sua coluna “${t}” foi bem recebida: +2 prestígio.`,'g'); }
  else { S.prest=clamp(S.prest-1,0,100); noticia('opiniao',`Coluna de ${S.nome} gera polêmica`,`O texto “${t}” recebeu críticas duras de colegas.`,1); addLog(`Sua coluna “${t}” gerou polêmica: −1 prestígio.`,'r'); }
  salvar(); render(); }
document.addEventListener('click',e=>{ const b=e.target.closest('[data-act=jornalEd],[data-act=coluna]'); if(!b||b.disabled||!S) return;
  if(b.dataset.act==='coluna') return escreverColuna();
  edJornal=(edJornal||1)+(+b.dataset.v); render(); });
// aba Jornal em todas as carreiras, com aviso de edição nova
{ const h0=header; header=function(){ const h=h0(); if(!S) return h; const nova=(JN().lido||0)<S.semana-1&&S.semana>1;
    return h.replace(/(<button class="tab [^"]*" data-act="view" data-v="conquistas">Conquistas<\/button>)/,`$1<button class="tab ${view==='jornal'?'on':''}" data-act="view" data-v="jornal">Jornal${nova?' <span class="jn-nova">nova</span>':''}</button>`); }; }
{ const r0=render; render=function(){ if(S&&!S.fim){ if(S.mesMetas!==S.semana){ S.mesMetas=S.semana; semanaRivais(); } checarMetas(); }
    if(S&&view==='jornal'){ renderJornal(); return; } r0(); }; }
