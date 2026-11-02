// ===================== SESSÃO DE JULGAMENTO (DESEMBARGADOR, STJ E STF) =====================
// Do cargo de desembargador em diante, a audiência ao vivo vira sessão do colegiado: você vota numa mesa (câmara de 3,
// turma de 5, plenário de 11) e tenta formar maioria. Os colegas são fixos, têm uma linha e lembram da afinidade com você.
const SJ_PERFIS={garantista:{t:'garantista',lado:-12,res:8},punitivista:{t:'punitivista',lado:10,res:10},legalista:{t:'legalista',lado:0,res:6,tese:true},pragmatico:{t:'pragmático',lado:4,res:3},consequencialista:{t:'consequencialista',lado:-4,res:5,publico:true}};
const SJ_ORGAO=c=>c===2?{n:3,nome:'Câmara do Tribunal'}:c===3?{n:5,nome:`Turma do ${supNome()}`}:{n:11,nome:'Plenário do STF',stf:true};
function colegas(){ const J=S.j, O=SJ_ORGAO(J.cargo);
  if(!J.colegas||J.colegas.cargo!==J.cargo){ const nomes=[...JNOMES.map(n=>n.replace(/^Dra?\. /,'')),...NOMES].sort(()=>Math.random()-.5);
    J.colegas={cargo:J.cargo,L:Array.from({length:O.n-1},(_,i)=>({id:i,nome:nomes[i],perfil:pick(Object.keys(SJ_PERFIS)),afin:rint(30,70)}))}; }
  return J.colegas.L; }
function sessaoJulgamento(p){ return new Promise(fim=>{
  const J=S.j, O=SJ_ORGAO(J.cargo), relator=Math.random()<1/3;
  if(!p.partes) p.partes={a:rint(45,78),b:rint(45,78),verdade:Math.random()<.5?'a':'b'};
  const verdade=p.partes.verdade==='a'?'s':'n';
  const mesa=colegas().map(c=>({...c,conv:clamp(50+SJ_PERFIS[c.perfil].lado+rint(-14,14),8,92),irrit:0,voto:null}));
  const div=mesa.reduce((a,b)=>Math.abs(b.conv-50)>Math.abs(a.conv-50)?b:a); div.divergente=true;
  const nomeRel=relator?S.nome:mesa[0].nome;
  const s={fase:'sustentacao',rodada:0,acoes:2,mesa,seu:null,suavizou:false,vista:null,mudou:0,acao:null,publico:O.stf?rint(30,70):50,feed:[],votos:[],fim:false,res:null};
  const lado=v=>v==='s'?'prover':'negar', lim=(v,a,b)=>Math.max(a,Math.min(b,v));
  const ev=(t,c='')=>{ s.feed.unshift({t,c}); s.feed=s.feed.slice(0,12); };
  const empurra=(m,d)=>{ m.conv=lim(m.conv+d,3,97); };
  const rumo=()=>s.seu==='s'?1:-1;
  const chanceConv=m=>{ const P=SJ_PERFIS[m.perfil], contra=(rumo()>0&&P.lado<0)||(rumo()<0&&P.lado>0);
    return lim(sig((S.skills.oratoria-60+(m.afin-50)*.6-(contra?P.res*2:0)-m.irrit)/12),.1,.9); };
  ev(`Aberta a sessão da ${O.nome}. ${relator?'Você é o relator.':`Você é vogal; o relator é ${nomeRel}.`}`,'g');
  // relações: quem articulou com você cobra o favor; aliados acompanham; desafetos trabalham contra
  const base=id=>colegas().find(x=>x.id===id);
  const cob=mesa.find(m=>m.favor&&!m.divergente);
  if(cob){ s.cobra={id:cob.id,lado:cob.conv>=50?'s':'n'}; ev(`${cob.nome} cobra o favor da última sessão: espera que você vote por ${lado(s.cobra.lado)}.`,'g'); }
  function aliancas(){ for(const m of s.mesa) if(m.afin>=75&&!m.divergente){ empurra(m,rumo()*6); ev(`${m.nome} (aliança de mesa) sinaliza que acompanha o seu voto.`,s.seu); } }
  const box=document.createElement('div'); box.className='av-ov'; box.setAttribute('role','dialog'); box.setAttribute('aria-modal','true'); box.setAttribute('aria-label','Sessão de julgamento');
  document.body.appendChild(box);
  function passo(){
    if(s.fase==='sustentacao'){ for(const l of ['s','n']){ const forte=Math.random()<(l===verdade?.65:.45), d=forte?7:3;
        for(const m of s.mesa) empurra(m,(l==='s'?1:-1)*d*(.6+Math.random()*.8)); ev(`Sustentação oral do advogado que pede para ${lado(l)}: ${forte?'convincente':'protocolar'}.`,l); }
      s.fase='escolha'; ev(relator?'Como relator, defina a direção do voto que vai ler.':`${nomeRel} lê o voto de relator: ${lado(s.mesa[0].conv>=50?'s':'n')}. Qual é o seu voto?`,'g'); return; }
    if(s.fase==='relatorio'){ const f=(S.skills.escrita-50)/3+6; for(const m of s.mesa) empurra(m,rumo()*f*(SJ_PERFIS[m.perfil].tese?1.3:1)*(.6+Math.random()*.6));
      ev(`Você lê o voto de relator por ${lado(s.seu)} (Escrita ${Math.round(S.skills.escrita)}). A mesa se move.`,s.seu); s.fase='debate'; s.rodada=1; s.acoes=2; aliancas(); return; }
    if(s.fase==='debate'){ const d0=s.mesa.find(m=>m.divergente), alvos=s.mesa.filter(m=>!m.divergente&&Math.abs(m.conv-50)<25), alvo=alvos.length?pick(alvos):null;
      if(alvo){ const d=-rumo()*rint(5,11); empurra(alvo,d); ev(`${d0.nome} (divergente) conversa com ${alvo.nome} e puxa para ${lado(d>0?'s':'n')}.`,d>0?'s':'n'); }
      for(const inim of s.mesa.filter(m=>m.afin<=20&&!m.divergente)){ const al=alvos.filter(m=>m!==inim); if(!al.length) continue; const x=pick(al), d=-rumo()*rint(3,7); empurra(x,d); empurra(inim,-rumo()*4);
        ev(`${inim.nome}, que não esquece as divergências com você, trabalha ${x.nome} contra o seu voto.`,d>0?'s':'n'); }
      if(O.stf){ const pub=s.publico>=50?'s':'n'; for(const m of s.mesa) if(SJ_PERFIS[m.perfil].publico) empurra(m,(pub==='s'?1:-1)*3); ev(`A TV Justiça mostra a opinião pública inclinada a ${lado(pub)}.`,'g'); }
      if(s.rodada>=3){ s.fase='votacao'; ev('Encerrado o debate. Os votos saem um a um.','g'); return votar(); }
      s.rodada++; s.acoes=2; } }
  function votar(){ let i=0; const um=()=>{ if(i<s.mesa.length){ const m=s.mesa[i++]; m.voto=Math.random()*100<m.conv?'s':'n'; s.votos.push(m.voto); ev(`${m.nome} vota por ${lado(m.voto)}.`,m.voto); tocar('carimbo'); desenhar(); setTimeout(um,500); }
      else { s.votos.push(s.seu); ev(`Você vota por ${lado(s.seu)}.`,s.seu); fechar(); tocar('martelo'); desenhar(); } }; um(); }
  function fechar(){ const nS=s.votos.filter(v=>v==='s').length, nN=s.votos.length-nS, venc=nS>nN?'s':'n', comigo=venc===s.seu, acerto=venc===verdade, certo=s.seu===verdade;
    let rep=comigo?(relator?(s.suavizou?2:4):1):-1;
    if(O.stf){ const pub=s.publico>=50?'s':'n'; if(s.seu!==pub) rep-=1; if(comigo) rep*=2; }
    S.prest=clamp(S.prest+rep,0,100);
    for(const c of colegas()){ const m=s.mesa.find(x=>x.id===c.id); c.afin=clamp(m.afin+(m.voto===s.seu?2:-1),0,100); if(m.favor) c.favor=true; }
    if(s.cobra){ const b=base(s.cobra.id), m=s.mesa.find(x=>x.id===s.cobra.id); b.favor=false;
      if(s.seu===s.cobra.lado){ b.afin=clamp(b.afin+6,0,100); ev(`Favor pago: a relação com ${m.nome} melhora.`,'g'); }
      else { b.afin=clamp(b.afin-20,0,100); ev(`Você não pagou o favor: ${m.nome} vira desafeto na mesa.`,'n'); } }
    if(comigo&&relator){ J.lideranca=(J.lideranca||0)+1; noticia('caso',`Voto de ${S.nome} vira tese no ${O.stf?'Supremo':'tribunal'}`,`Por ${Math.max(nS,nN)} a ${Math.min(nS,nN)}, a ${O.nome.toLowerCase()} acompanhou o relator em “${p.titulo}”.`,3); }
    // o mérito volta depois: maioria errada pode cair em rescisória; voto vencido certo pode virar maioria anos depois
    const F=J.futuros||(J.futuros=[]);
    if(!acerto&&comigo) F.push({mes:S.semana+rint(6,18),tipo:'rescisoria',titulo:p.titulo});
    if(certo&&!comigo) F.push({mes:S.semana+rint(18,36),tipo:'virada',titulo:p.titulo});
    s.fim=true; s.res={nS,nN,venc,comigo,acerto,certo,rep};
    addLog(`Sessão de julgamento em “${p.titulo}”: ${nS} a ${nN} por ${lado(venc)} · ${comigo?'você ficou com a maioria':'você ficou vencido'} · ${sgn(rep)} reputação.`,comigo?'g':'r'); }
  function agir(id){ const m=s.mesa.find(x=>x.id===+id); if(!m||!s.acao||s.acoes<=0||s.fase!=='debate') return;
    if(s.acao==='conv'){ const ch=chanceConv(m);
      if(Math.random()<ch){ empurra(m,rumo()*rint(9,16)); m.afin=clamp(m.afin+3,0,100); ev(`Você convence ${m.nome} (${pct(ch)}): o voto se aproxima do seu.`,s.seu); }
      else { m.irrit+=4; empurra(m,-rumo()*3); ev(`${m.nome} não se convence (${pct(ch)}) e endurece a posição.`,s.seu==='s'?'n':'s'); } }
    if(s.acao==='art'){ if((S.pol??10)<12) return; S.pol=(S.pol??10)-12; empurra(m,rumo()*15); m.favor=true; ev(`Nos bastidores, você articula com ${m.nome}. Funciona, mas o favor vai ser cobrado numa próxima sessão.`,'g'); }
    s.acoes--; s.acao=null; }
  function acao(a,v){
    if(a==='avancar'&&!s.fim&&s.fase!=='escolha'&&s.fase!=='votacao'){ passo(); s.acao=null; }
    else if(a==='voto'){ s.seu=v; ev(`Você vota por ${lado(v)}.`,v); if(relator) s.fase='relatorio'; else { s.fase='debate'; s.rodada=1; s.acoes=2; aliancas(); } }
    else if(a==='acao') s.acao=s.acao===v?null:v;
    else if(a==='alvo') agir(v);
    else if(a==='suavizar'&&relator&&!s.suavizou&&s.acoes>0&&s.fase==='debate'){ s.suavizou=true; s.acoes--; for(const m of s.mesa) empurra(m,rumo()*6); ev('Você suaviza a tese. Mais colegas conseguem acompanhar.','g'); }
    else if(a==='vista'&&!s.vista&&s.acoes>0&&s.fase==='debate'){ s.acoes--; for(const m of s.mesa) m.afin=clamp(m.afin-4,0,100);
      const acc=clamp(sig((S.skills.analise-45)/10)+(vip('faro')?.1:0),.5,.95), certo=Math.random()<acc, ap=certo?verdade:verdade==='s'?'n':'s'; s.vista={ap,certo,acc};
      ev(`Na vista, a prova parece pender para ${lado(ap)}. Sua leitura acerta ${pct(acc)} das vezes.`,'g'); }
    else if(a==='mudar'&&s.seu&&s.acoes>0&&s.mudou<2&&s.fase==='debate'){ s.seu=s.seu==='s'?'n':'s'; s.mudou++; s.acoes--;
      for(const m of s.mesa){ if(relator) empurra(m,rumo()*4); m.afin=clamp(m.afin-(relator?8:4),0,100); } ev(`Você reajusta o voto para ${lado(s.seu)}.`,'g'); }
    else if(a==='sair'){ box.remove(); const r=s.res; fim(r.comigo?{ch:r.acerto?.92:.25,recMais:r.acerto?0:.25}:{vencido:true}); return; }
    desenhar(); }
  box.addEventListener('click',e=>{ const b=e.target.closest('[data-sj]'); if(!b||b.disabled) return; acao(b.dataset.sj,b.dataset.v); });
  function desenhar(){ const nS=s.votos.filter(v=>v==='s').length, deb=s.fase==='debate'&&s.acoes>0, pode=deb&&!!s.acao;
    const btn=(a,t,sm,dis,on,v='')=>`<button class="btn ghost sj-acao ${on?'on':''}" data-sj="${a}" data-v="${v}" ${dis?'disabled':''}><b>${t}</b><small>${sm}</small></button>`;
    let res='';
    if(s.fase==='escolha') res=`<div class="av-ctl"><button class="btn" data-sj="voto" data-v="s">Votar por prover</button><button class="btn" data-sj="voto" data-v="n">Votar por negar</button></div>`;
    if(s.res){ const r=s.res; res=`<div class="verdict ${r.comigo?'hi':'lo'}">${r.nS} × ${r.nN} · ${lado(r.venc)}</div>
      <dl class="meta"><dt>Você</dt><dd>${r.comigo?(relator?'conduziu a maioria':'ficou com a maioria'):'ficou vencido'}</dd><dt>Reputação</dt><dd class="${r.rep>=0?'hi':'lo'}">${sgn(r.rep)}</dd>
      <dt>A prova mostrava</dt><dd>${lado(verdade)}</dd><dt>Seu voto</dt><dd class="${r.certo?'hi':'lo'}">${r.certo?'de acordo com a prova':'contra a prova'}</dd>
      <dt>A maioria</dt><dd>${r.acerto?'acertou':'errou: o caso pode voltar em rescisória'}</dd>${s.vista?`<dt>Sua vista</dt><dd>${s.vista.certo?'apontou certo':'enganou você'}</dd>`:''}</dl>
      <button class="btn brass" data-sj="sair">Voltar ao gabinete</button>`; }
    box.innerHTML=`<div class="av">
      <header class="av-placar"><div class="av-lado">${retrato(S.nome,{g:S.genero,size:52,toga:true})}<span class="label">${relator?'Relator · você':'Vogal · você'}</span><b>${esc(S.nome)}</b><small>Oratória ${Math.round(S.skills.oratoria)} · Escrita ${Math.round(S.skills.escrita)} · capital político ${Math.round(S.pol??10)}</small></div>
        <div class="av-centro"><span class="label av-fase">${O.nome} · ${esc(p.titulo)}</span><div class="av-relogio num"><span style="color:var(--b-case)">${nS}</span> × <span style="color:var(--b-familia)">${s.votos.length-nS}</span></div><small>prover × negar · ${({sustentacao:'sustentação oral',escolha:'seu voto',relatorio:'voto do relator',debate:`debate · rodada ${s.rodada} de 3`,votacao:'votação'})[s.fase]||''}</small></div>
        <div class="av-lado dir"><span class="label">Seu voto</span><b>${s.seu?lado(s.seu):'a definir'}</b><small>${O.stf?`TV Justiça: ${s.publico>=50?`${s.publico}% quer prover`:`${100-s.publico}% quer negar`}`:'colegiado'}</small></div></header>
      <section class="panel"><div class="panel-head"><h2>A mesa</h2><span class="label">${s.acao?'escolha o colega':'convicção de cada um · afinidade com você'}</span></div>
        <div class="sj-mesa">${s.mesa.map(m=>{ const c=Math.round(m.conv); return `<div class="sj-cad">${m.voto?`<span class="sj-voto ${m.voto}">${lado(m.voto)}</span>`:''}${retrato(m.nome,{size:40,toga:true})}
          <b>${esc(m.nome)}</b><small>${SJ_PERFIS[m.perfil].t}${m.divergente?' · divergente':''}${m.afin>=75?' · <span class="hi">aliança</span>':m.afin<=20?' · <span class="lo">desafeto</span>':''}${m.favor?' · você deve um favor':''}</small><div class="sj-conv" role="img" aria-label="${c}% para prover"><i style="width:${c}%"></i></div><small>${c>=50?`${c}% prover`:`${100-c}% negar`} · afinidade ${m.afin}</small>
          ${s.fase==='debate'&&!m.divergente?`<button class="tab" data-sj="alvo" data-v="${m.id}" ${pode?'':'disabled'}>${s.acao==='conv'?`Convencer · ${pct(chanceConv(m))}`:s.acao==='art'?'Articular':'—'}</button>`:''}</div>`; }).join('')}</div></section>
      <div class="av-corpo sj-corpo"><section class="panel av-feed"><div class="panel-head"><h2>Sessão</h2></div>${res}${s.feed.map(x=>`<div class="av-ev ${x.c==='s'?'pa':x.c==='n'?'pb':''}"><span></span><span>${x.t}</span></div>`).join('')}</section>
        <section class="panel av-instr"><h2>Suas ações · ${s.fase==='debate'?s.acoes:'–'}</h2>
          ${btn('acao','Convencer um colega','Oratória e afinidade contra a linha dele',!deb,s.acao==='conv','conv')}
          ${btn('acao','Articular nos bastidores','−12 de capital político · move muito e certo',!deb||(S.pol??10)<12,s.acao==='art','art')}
          ${relator?btn('suavizar',s.suavizou?'Tese suavizada':'Suavizar a tese','a mesa se aproxima · a tese vale menos',!deb||s.suavizou):''}
          ${btn('vista',s.vista?'Vista pedida':'Pedir vista','pista sobre o mérito · a mesa se irrita',!deb||!!s.vista)}
          ${btn('mudar',`Reajustar o voto para ${s.seu==='s'?'negar':'prover'}`,'até 2 vezes · custa afinidade',!deb||!s.seu||s.mudou>=2)}
          <button class="btn brass" data-sj="avancar" ${s.fim||s.fase==='escolha'||s.fase==='votacao'?'disabled':''}>${s.fase==='debate'?(s.rodada>=3?'Encerrar debate e votar':'Próxima rodada'):s.fim?'Sessão encerrada':'Continuar'}</button></section></div></div>`; }
  desenhar(); }); }
// as sessões entram no lugar da audiência presidida quando o juiz chega aos tribunais
{ const a0=audienciaJuiz; audienciaJuiz=function(p){ return S.j.cargo>=2?sessaoJulgamento(p):a0(p); }; }
{ const c0=procCard; procCard=function(p){ const h=c0(p); return S.j.cargo>=2?h.replace('Presidir ao vivo','Sessão ao vivo').replace('Você preside a audiência e investiga quem tem razão.','Você vota no colegiado e tenta formar maioria.'):h; }; }
// consequências que voltam meses depois
function mesFuturos(){ const J=S.j; if(!J||!J.futuros) return;
  for(const f of J.futuros.filter(x=>x.mes<=S.semana)){
    if(f.tipo==='rescisoria'){ S.prest=clamp(S.prest-3,0,100); addLog(`Ação rescisória derruba o acórdão de “${f.titulo}”, que você acompanhou: −3 de reputação.`,'r'); noticia('escandalo',`Rescisória derruba acórdão de “${f.titulo}”`,'A prova apontava para o outro lado; a maioria que decidiu o caso é criticada.',2); }
    else { S.prest=clamp(S.prest+4,0,100); addLog(`Seu voto vencido em “${f.titulo}” virou a posição majoritária: +4 de reputação.`,'g'); noticia('perfil',`Voto vencido de ${S.nome} vira maioria`,`Anos depois, o tribunal adota a posição que ${S.nome} defendeu em “${f.titulo}”.`,3); } }
  J.futuros=J.futuros.filter(x=>x.mes>S.semana); }
{ const r0=render; render=function(){ if(S&&!S.fim&&S.carreira==='juiz'&&S.mesFut!==S.semana){ S.mesFut=S.semana; mesFuturos(); } r0(); }; }
