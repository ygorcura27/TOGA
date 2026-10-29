// ===================== VIDA ACADÊMICA =====================
const CURSOS={
  esp:{nome:'Especialização (pós lato sensu)',meta:40,minSem:12,mensal:600},
  mestrado:{nome:'Mestrado',meta:120,minSem:24,mensal:0,bolsa:750,selecao:true},
  doutorado:{nome:'Doutorado',meta:240,minSem:48,mensal:0,bolsa:1050,selecao:true},
};
const PROJ={artigo:{nome:'Artigo científico',meta:12},livro:{nome:'Livro acadêmico',meta:60},manual:{nome:'Manual para OAB e concursos',meta:45}};
const NIVEIS_DOC=['Professor Adjunto','Professor Associado','Professor Titular'];
const TEMAS={
  penal:['Prova ilícita e o processo penal','Cadeia de custódia no Brasil','Encarceramento em massa e garantias','Colaboração premiada em debate'],
  civel:['Responsabilidade civil na era digital','Contratos inteligentes e boa-fé','A perda de uma chance revisitada','Danos morais coletivos'],
  trabalho:['Trabalho por aplicativo e subordinação','Teletrabalho e direito à desconexão','Assédio moral nas empresas','A reforma trabalhista dez anos depois'],
  familia:['Multiparentalidade e afeto','Guarda compartilhada na prática','Alienação parental em debate','Famílias e herança digital'],
  empresarial:['Recuperação judicial de grupos econômicos','Governança e compliance','Startups e o direito societário','Arbitragem empresarial no Brasil'],
  tributario:['Tributação da economia digital','A reforma tributária e o IVA dual','Planejamento tributário e abuso de forma','Federalismo fiscal em crise'],
};
const tituloPesquisa=a=>pick(TEMAS[a]||TEMAS.civel);
const acadInicial=()=>({curso:null,proj:null,pubs:[],titulos:{esp:0,mestrado:false,doutorado:false,areas:{}},doc:null,indice:0,selEm:0,roySemana:0});
const acadBlocos=()=>{ const A=S.ac, G=S.agenda; if(!A) return 0; return (A.curso?G.curso||0:0)+(A.proj?G.pesquisa||0:0)+(A.doc?G.docencia||0:0); };
const bonusTitulos=()=>{ const T=S.ac&&S.ac.titulos; if(!T) return 0; return Math.min(4,T.esp*2)+(T.mestrado?3:0)+(T.doutorado?5:0); };
function rowsAcad(free){ const A=S.ac; if(!A) return '';
  return (A.curso?`<div class="row"><span class="name">${CURSOS[A.curso.tipo].nome}</span>${stepper('curso',0,S.agenda.curso||0,free)}</div>`:'')
    +(A.proj?`<div class="row"><span class="name" title="${esc(A.proj.titulo)}">Escrever: ${PROJ[A.proj.tipo].nome.toLowerCase()}</span>${stepper('pesquisa',0,S.agenda.pesquisa||0,free)}</div>`:'')
    +(A.doc?`<div class="row"><span class="name">Dar aulas</span>${stepper('docencia',0,S.agenda.docencia||0,free)}</div>`:''); }
function qualidade(area){ const T=S.ac.titulos; return S.skills.pesquisa*.4+S.skills.escrita*.3+S.skills[area]*.3+(T.mestrado?5:0)+(T.doutorado?10:0); }
function chanceSelecao(tipo){ const A=S.ac, cr=(S.formacao&&S.formacao.cr)||6;
  return tipo==='mestrado'?clamp(sig((S.skills.pesquisa+cr*3+A.indice*2-55)/8),.05,.95):clamp(sig((S.skills.pesquisa+A.indice*2+10-60)/8),.05,.95); }
const remuneracaoAula=()=>{ const D=S.ac.doc; if(!D) return 0; return Math.round((D.tipo==='publica'?220:110)*[1,1.3,1.6][D.nivel||0]*(.8+S.skills.didatica/250)*(tem('didatica',1)?1.2:1)); };
function publicar(pj){ const A=S.ac, q=qualidade(pj.area)+rnd(-8,8);
  if(pj.tipo==='artigo'){ const [ql,pts,pr]=q>=80?['A1',4,1.5]:q>=68?['A2',3,1]:q>=55?['B1',2,.5]:['B2',1,.2];
    A.pubs.push({tipo:'artigo',titulo:pj.titulo,qualis:ql,pts,semana:S.semana}); A.indice+=pts; S.prest=clamp(S.prest+pr,0,100);
    return `Artigo publicado em revista Qualis ${ql}: “${pj.titulo}”. +${pts} no índice de produção.`; }
  const man=pj.tipo==='manual', v0=Math.max(5,(q/10)*(1+S.prest/50)*(man?50:20)), pts=man?1:5;
  A.pubs.push({tipo:pj.tipo,titulo:pj.titulo,pts,semana:S.semana,v0,q:Math.round(q)}); A.indice+=pts; S.prest=clamp(S.prest+(man?.5:3),0,100);
  return `${man?'Manual':'Livro'} lançado: “${pj.titulo}”. Primeira mês com cerca de ${Math.round(v0)} exemplares vendidos.`; }
async function semanaAcademia(){ const A=S.ac, G=S.agenda; if(!A) return [];
  const L=[], up=(k,v)=>{ S.skills[k]=clamp(S.skills[k]+v*(1-S.skills[k]/110),0,100); };
  if(A.curso){ const c=A.curso, n=G.curso||0; c.prog+=n; if(c.mensal) pagarPessoal(c.mensal); if(c.bolsa&&S.carreira==='academico') pagarPessoal(-c.bolsa);
    for(let i=0;i<n;i++){ up('pesquisa',.25); up('escrita',.15); up(c.area,.3); }
    if(c.prog>=c.meta&&S.semana-c.inicio>=c.minSem){
      if(c.tipo==='esp'){ A.titulos.esp++; (A.titulos.areas=A.titulos.areas||{})[c.area]=Math.max(titArea(c.area),1); up(c.area,6); S.prest=clamp(S.prest+1,0,100); L.push(`Especialização concluída em ${AREAS[c.area].nome}.`); A.curso=null; G.curso=0; }
      else { const ch=clamp(sig(((S.skills.pesquisa+S.skills.escrita)/2-(c.tipo==='doutorado'?52:42))/8),.05,.95);
        const ok=await rolar(`Defesa ${c.tipo==='doutorado'?'da tese':'da dissertação'}`,`A banca avalia a sua pesquisa em ${AREAS[c.area].nome}. Pesquisa e Escrita contam.`,ch,'Aprovado','Volte com ajustes');
        if(ok){ A.titulos[c.tipo]=true; (A.titulos.areas=A.titulos.areas||{})[c.area]=2; const pts=c.tipo==='doutorado'?5:3; A.indice+=pts; A.pubs.push({tipo:c.tipo==='doutorado'?'tese':'dissertação',titulo:c.titulo,pts,semana:S.semana});
          up('pesquisa',c.tipo==='doutorado'?8:5); up(c.area,4); S.prest=clamp(S.prest+(c.tipo==='doutorado'?5:3),0,100);
          L.push(`Você agora é ${c.tipo==='doutorado'?gen('doutor','doutora'):'mestre'} em Direito.`); A.curso=null; G.curso=0; }
        else { c.meta=Math.round(c.meta*1.2); L.push('A banca pediu ajustes: mais trabalho antes da nova defesa.'); } } } }
  if(A.proj){ const pj=A.proj, n=G.pesquisa||0; pj.prog+=n; for(let i=0;i<n;i++){ up('pesquisa',.3); up('escrita',.25); }
    if(pj.prog>=pj.meta){ L.push(publicar(pj)); A.proj=null; G.pesquisa=0; } }
  let ganho=0;
  if(A.doc){ const n=G.docencia||0; ganho+=n*remuneracaoAula(); for(let i=0;i<n;i++){ up('didatica',.6); up('oratoria',.15); }
    if(A.doc.tipo==='publica'){ if(A.doc.nivel===0&&A.indice>=25){ A.doc.nivel=1; L.push('Progressão: Professor Associado.'); }
      else if(A.doc.nivel===1&&A.indice>=60&&S.skills.didatica>=60){ A.doc.nivel=2; S.prest=clamp(S.prest+3,0,100); L.push(`Você virou ${fem('Professor')} Titular.`); } }
    if(n&&Math.random()<.05){ const bom=S.skills.didatica>=55; S.prest=clamp(S.prest+(bom?1:-1),0,100); L.push(bom?`A turma elegeu você ${gen('professor homenageado','professora homenageada')}.`:'Os alunos reclamaram das aulas na avaliação docente.'); } }
  let roy=0; for(const p of A.pubs) if(p.v0){ const v=p.v0*Math.pow(.97,S.semana-p.semana); if(v>=1) roy+=Math.round(v*(p.tipo==='manual'?6:10)); }
  A.roySemana=roy; ganho+=roy;
  if(ganho){ pagarPessoal(-ganho); L.push(`Academia: ${brl(ganho)} em aulas e direitos autorais.`); }
  if(tem('didatica',2)&&S.prest>=40&&Math.random()<.08){ const fee=Math.round((2000+S.prest*80+A.indice*60)/100)*100;
    const v=await modal(`<h2>Convite para palestra</h2><p>Um congresso quer você como palestrante. Cachê de ${brl(fee)}; custa 1 bloco no próximo mês.</p>`,[{t:'Recusar',v:0,cls:'ghost'},{t:'Aceitar',v:1,cls:'brass'}]);
    if(v){ pagarPessoal(-fee); S.vida.falta=(S.vida.falta||0)+1; S.prest=clamp(S.prest+.5,0,100); L.push(`Palestra em congresso: +${brl(fee)}.`); } }
  for(const t of L) addLog(t,'g');
  return L; }
async function escolherArea(titulo){ return await modal(`<h2>${titulo}</h2><div class="opts">${Object.entries(AREAS).map(([k,a])=>`<button class="opt" data-mv="${k}"><span>${a.nome}</span><b class="num">${Math.floor(S.skills[k])}</b><small>Sua skill na área</small></button>`).join('')}</div>`,[{t:'Cancelar',v:'',cls:'ghost'}]); }
async function acMatricular(tipo){ const A=S.ac, C=CURSOS[tipo]; if(ocupado||A.curso) return;
  if(tipo==='doutorado'&&!A.titulos.mestrado) return; if(C.selecao&&A.selEm>S.semana) return;
  const area=await escolherArea(`${C.nome}: em qual área? ${tipo==='esp'?'Libera a 4ª estrela nela.':'Libera a 5ª estrela nela.'}`); if(!area) return;
  if(C.selecao){ ocupado=true; let ok;
    try{ ok=await rolar(`Seleção do ${C.nome.toLowerCase()}`,`Projeto de pesquisa, prova e entrevista. Pesquisa, ${tipo==='mestrado'?'CR da graduação':'experiência'} e publicações contam.`,chanceSelecao(tipo),'Aprovado','Não foi desta vez'); }
    finally{ ocupado=false; }
    if(!ok){ A.selEm=S.semana+10; addLog(`Reprovado na seleção do ${C.nome.toLowerCase()}. Nova seleção no mês ${A.selEm}.`,'r'); salvar(); render(); return; } }
  A.curso={tipo,area,prog:0,meta:C.meta,inicio:S.semana,minSem:C.minSem,mensal:C.mensal,bolsa:C.bolsa||0,titulo:tituloPesquisa(area)};
  S.agenda.curso=Math.max(S.agenda.curso||0,2); addLog(`Matrícula: ${C.nome} em ${AREAS[area].nome}.`,'g'); salvar(); render(); }
async function acProjeto(tipo){ const A=S.ac; if(ocupado||A.proj) return; const area=await escolherArea(`${PROJ[tipo].nome}: sobre qual área?`); if(!area) return;
  A.proj={tipo,area,prog:0,meta:PROJ[tipo].meta,titulo:tituloPesquisa(area)}; S.agenda.pesquisa=Math.max(S.agenda.pesquisa||0,2);
  addLog(`Você começou a escrever: “${A.proj.titulo}”.`); salvar(); render(); }
async function acDocencia(tipo){ const A=S.ac; if(ocupado||A.doc) return;
  if(tipo==='particular'&&!(A.titulos.esp||A.titulos.mestrado)) return;
  if(tipo==='publica'){ if(!A.titulos.doutorado) return; ocupado=true; let ok;
    try{ ok=await rolar('Concurso para professor universitário','Prova escrita, prova didática e títulos. Didática, Pesquisa e o índice de produção contam.',clamp(sig(((S.skills.didatica+S.skills.pesquisa)/2+A.indice-55)/8),.05,.95),'Aprovado','Reprovado'); }
    finally{ ocupado=false; }
    if(!ok){ addLog('Reprovado no concurso para professor.','r'); salvar(); render(); return; } }
  A.doc={tipo,nivel:0}; S.agenda.docencia=Math.max(S.agenda.docencia||0,3);
  addLog(tipo==='publica'?'Você tomou posse como Professor Adjunto numa universidade pública.':'Você começou a dar aulas numa faculdade particular.','g'); salvar(); render(); }
function iniciarAcademico(){ S.carreira='academico'; S.casos=[]; S.ofertas=[]; S.filiais=[]; S.aReceber=0; S.u=estruturaInicial(true); if(!S.ac) S.ac=acadInicial(); view='escritorio'; }
function nomeAcad(){ return fem(nomeAcad0()); }
function nomeAcad0(){ const A=S.ac; return A.doc?(A.doc.tipo==='publica'?NIVEIS_DOC[A.doc.nivel||0]:'Professor de faculdade particular'):A.curso&&A.curso.tipo!=='esp'?(A.curso.tipo==='doutorado'?'Doutorando':'Mestrando'):'Pesquisador'; }
function painelFormacao(){ const A=S.ac, T=A.titulos, c=A.curso;
  return `<section class="panel"><div class="panel-head"><h2>Formação</h2><span class="label">títulos +${bonusTitulos()} em concursos</span></div>
    <ul class="break"><li><span>Graduação em Direito${S.formacao?' · '+FACS[S.formacao.tier].nome:''}</span><span class="num">${S.formacao?'CR '+S.formacao.cr.toLocaleString('pt-BR',{maximumFractionDigits:1}):'✓'}</span></li>
      <li><span>Especializações</span><span class="num">${T.esp}</span></li><li><span>Mestrado</span><span class="num ${T.mestrado?'hi':''}">${T.mestrado?'✓':'—'}</span></li><li><span>Doutorado</span><span class="num ${T.doutorado?'hi':''}">${T.doutorado?'✓':'—'}</span></li></ul>
    ${c?`<span class="label">Cursando: ${CURSOS[c.tipo].nome} em ${AREAS[c.area].nome}</span>
      <div class="vs"><span>Trabalho</span><div class="bar"><i style="width:${Math.min(100,c.prog/c.meta*100)}%;background:var(--b-estudo)"></i></div><span class="num">${Math.round(c.prog/c.meta*100)}%</span>
        <span>Tempo</span><div class="bar"><i style="width:${Math.min(100,(S.semana-c.inicio)/c.minSem*100)}%;background:var(--brass)"></i></div><span class="num">${S.semana-c.inicio}/${c.minSem}</span></div>
      <p style="margin:0;font-size:12px;color:var(--muted)">${c.prog}/${c.meta} blocos e ${c.minSem} meses no mínimo${c.mensal?` · mensalidade ${brl(c.mensal)}/mês`:''}${c.bolsa?` · bolsa de ${brl(c.bolsa)}/mês só em dedicação exclusiva`:''}.</p>`
    :`<div class="opts">${Object.entries(CURSOS).map(([k,C])=>{ const bloq=k==='doutorado'&&!T.mestrado, espera=C.selecao&&A.selEm>S.semana;
        return `<button class="opt" data-act="acMatricular" data-v="${k}" ${bloq||espera?'disabled':''}><span>${C.nome}</span><b class="num">${C.selecao?pct(chanceSelecao(k)):brl(C.mensal)+'/mês'}</b><small>${C.meta} blocos e pelo menos ${C.minSem} meses (${C.minSem/ANO} ano${C.minSem/ANO>1?'s':''})${C.selecao?' · chance na seleção':''}${bloq?' · exige mestrado':''}${espera?` · nova seleção no mês ${A.selEm}`:''}</small></button>`; }).join('')}</div>`}
  </section>`; }
function painelPesquisa(){ const A=S.ac, pj=A.proj;
  return `<section class="panel"><div class="panel-head"><h2>Pesquisa e publicações</h2><span class="label">índice ${A.indice}</span></div>
    ${pj?`<span class="label" style="text-transform:none;letter-spacing:0">Escrevendo: “${esc(pj.titulo)}” · ${PROJ[pj.tipo].nome}</span>
      <div class="vs"><span>Progresso</span><div class="bar"><i style="width:${Math.min(100,pj.prog/pj.meta*100)}%;background:var(--b-estudo)"></i></div><span class="num">${pj.prog}/${pj.meta}</span>
        <span>Qualidade</span><div class="bar"><i style="width:${Math.min(100,qualidade(pj.area))}%;background:var(--win)"></i></div><span class="num">${Math.round(qualidade(pj.area))}</span></div>`
    :`<div class="opts">${Object.entries(PROJ).map(([k,P])=>`<button class="opt" data-act="acProjeto" data-v="${k}"><span>${P.nome}</span><b class="num">${P.meta} blocos</b><small>${k==='artigo'?'Revista com Qualis A1 a B2 conforme a qualidade. Rende prestígio e índice, não dinheiro.':k==='livro'?'Vende por anos (R$ 10 por exemplar) e dá muito prestígio acadêmico.':'Vende 2,5 vezes mais (R$ 6 por exemplar), com pouco prestígio.'}</small></button>`).join('')}</div>`}
    ${A.pubs.length?`<ul class="break">${A.pubs.slice().reverse().slice(0,8).map(p=>{ const v=p.v0?Math.round(p.v0*Math.pow(.97,S.semana-p.semana)):0;
      return `<li><span>${p.tipo==='artigo'?'Artigo':p.tipo==='livro'?'Livro':p.tipo==='manual'?'Manual':p.tipo==='tese'?'Tese':'Dissertação'} · ${esc(p.titulo)}</span><span class="num">${p.qualis||(p.v0?v+' ex/mês':'+'+p.pts)}</span></li>`; }).join('')}</ul>`:''}
    ${A.roySemana?`<p class="hi" style="margin:0;font-size:12.5px">Direitos autorais no último mês: ${brl(A.roySemana)}</p>`:''}
  </section>`; }
function painelDocencia(){ const A=S.ac, D=A.doc, T=A.titulos;
  return `<section class="panel"><div class="panel-head"><h2>Docência</h2><span class="label">Didática ${Math.floor(S.skills.didatica)}</span></div>
    ${D?`<dl class="meta"><dt>Cargo</dt><dd>${nomeAcad()}</dd><dt>Por bloco de aula</dt><dd class="num">${brl(remuneracaoAula())}</dd><dt>Índice para progredir</dt><dd class="num">${D.tipo==='publica'?(D.nivel===0?'25 (Associado)':D.nivel===1?'60 e Didática 60 (Titular)':'topo'):'—'}</dd></dl>
      <button class="btn ghost" data-act="acDocSair">Deixar a docência</button>`
    :`<div class="opts"><button class="opt" data-act="acDocencia" data-v="particular" ${T.esp||T.mestrado?'':'disabled'}><span>Faculdade particular</span><b class="num">~${brl(110)}/bloco</b><small>Exige especialização ou mestrado.</small></button>
      <button class="opt" data-act="acDocencia" data-v="publica" ${T.doutorado?'':'disabled'}><span>Concurso para universidade pública</span><b class="num">~${brl(220)}/bloco</b><small>Exige doutorado. Progressão por produção: Adjunto, Associado e Titular.</small></button></div>`}
    <p style="margin:0;font-size:12px;color:var(--muted)">Dar aulas treina Didática e Oratória. Didática melhora a remuneração, abre convites para palestras pagas e melhora os estagiários que você contrata.</p>
  </section>`; }
function renderAcademia(principal){ const A=S.ac, G=S.agenda, free=livres();
  let agenda='';
  if(principal){ const cells=[]; const push=(k,n)=>{for(let i=0;i<n;i++) cells.push(k);};
    push('estudo',acadBlocos()+G.estudo); push('lazer',G.lazer); push('familia',G.familia||0); push('saude',G.saude||0); push('descanso',Math.max(0,S.disp-cells.length)); push('off',BLOCOS-S.disp);
    let grid='';
    for(let r=0;r<3;r++) for(let d=0;d<7;d++) grid+=`<div class="blk ${cells[d*3+r]||'descanso'}"></div>`;
    agenda=`<section class="panel"><div class="panel-head"><h2>Agenda do mês</h2><span class="num">${S.disp-free}/${S.disp} blocos</span></div><div class="blocks">${grid}</div>
      <div class="rows">${rowsAcad(free)||'<p class="empty" style="padding:0">Matricule-se num curso, comece uma pesquisa ou consiga uma vaga de professor.</p>'}
        <div class="row"><span class="name">Estudo</span><select id="estudo-skill" data-act="estudoSkill">${Object.entries(SKILLS).map(([k,v])=>`<option value="${k}" ${G.estudoSkill===k?'selected':''}>${v}</option>`).join('')}</select>${stepper('estudo',0,G.estudo,free)}</div>
        <div class="row"><span class="name">Lazer (reduz estresse)</span>${stepper('lazer',0,G.lazer,free)}</div>${rowsVida(free)}</div>
      <p class="label" style="margin:0">Custo de vida de R$ 650 por mês. Em dedicação exclusiva, mestrado e doutorado pagam bolsa; a renda vem de bolsa, aulas, livros e palestras.</p>
      <button class="btn brass wide" data-act="fimSemana">Encerrar mês ▶</button></section>`; }
  app.innerHTML=`${header()}
  <div class="grid">
    <div class="col">${agenda}${painelFormacao()}${principal?painelSkills()+painelDiario():''}</div>
    <div class="col">${painelPesquisa()}${painelDocencia()}
      ${principal?'':'<p class="label" style="margin:0">Os blocos de pós, pesquisa e aulas aparecem na agenda da tela principal da sua carreira.</p>'}</div>
  </div>`; }
async function fimSemanaAcademico(){
  if(ocupado) return; ocupado=true;
  try{ const G=S.agenda, pessoal=acadBlocos()+G.estudo, desc=Math.max(0,S.disp-pessoal-G.lazer-vidaBlocos());
    S.energia=clamp(S.energia-2.8*pessoal*(S.traits.includes('workaholic')?.7:1)+3*desc+1.5*G.lazer,0,100);
    S.estresse=clamp(S.estresse+1.8*pessoal*(S.traits.includes('ansioso')?1.25:1)-1.2*desc-6*G.lazer,0,100);
    if(G.estudo){ const k=G.estudoSkill, mult=(S.traits.includes('rato')?1.5:1)*(tem('pesquisa',3)?1.5:1)*multAtual(k);
      for(let i=0;i<G.estudo;i++) S.skills[k]=clamp(S.skills[k]+1.1*mult*(1-S.skills[k]/110),0,100); S.estudoTotal=(S.estudoTotal||0)+G.estudo; }
    pagarPessoal(650); // vida mais simples em dedicação exclusiva
    await semanaAcademia();
    if(await semanaVida()) return;
    S.semana++; S.agenda.estudo=0; S.agenda.lazer=0; S.disp=BLOCOS-blocosPerdidos();
    if(S.estresse>=100){ S.disp=10; S.estresse=70; addLog('Burnout: você só terá 10 blocos no próximo mês.','r'); }
    if(S.caixa<-30000){ await modal('<h2 class="lo">Dívidas demais</h2><p>Sem renda suficiente, as dívidas passaram de R$ 30 mil. Você volta para a advocacia para pagar as contas.</p>',[{t:'Continuar',v:1}]);
      S.carreira='adv'; S.u=estruturaInicial(false); S.bolso=S.caixa; S.caixa=5000; gerarOfertas(); }
    salvar();
  } finally { ocupado=false; render(); }
}
async function virarAcademico(){ const v=await modal('<h2>Largar a advocacia pela academia?</h2><p>Você fecha o escritório, encerra os casos e vive de bolsa, aulas, livros e palestras. O caixa do escritório vai para o seu bolso.</p>',[{t:'Cancelar',v:0,cls:'ghost'},{t:'Virar acadêmico',v:1}]);
  if(!v) return; const din=S.caixa+(S.bolso||0); iniciarAcademico(); S.caixa=din; S.bolso=0; addLog('Você fechou o escritório e virou acadêmico em dedicação exclusiva.','g'); salvar(); render(); }

