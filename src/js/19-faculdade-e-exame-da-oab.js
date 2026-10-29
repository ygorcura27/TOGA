// ===================== FACULDADE E EXAME DA OAB =====================
const FACS={publica:{nome:'Universidade pública',mensal:0,dif:2,prest:8,vest:.45},ponta:{nome:'Faculdade particular de ponta',mensal:700,dif:1.5,prest:6,vest:1},comum:{nome:'Faculdade particular',mensal:300,dif:.5,prest:0,vest:1}};
const ESTAGIOS={adv:{nome:'Escritório de advocacia',bolsa:90},juiz:{nome:'Gabinete de juiz',bolsa:60},promotor:{nome:'Ministério Público',bolsa:60},defensor:{nome:'Defensoria Pública',bolsa:50}};
const MESADA=500;
const estudBlocos=()=>S.carreira==='estudante'?['aulas','estagio','nucleo','ic','bico'].reduce((a,k)=>a+(S.agenda[k]||0),0):0;
async function iniciarComFaculdade(tier){
  const F0=FACS[tier]; let t=tier;
  if(tier==='publica'){ const ch=clamp(F0.vest+(S.traits.includes('rato')?.15:0),.05,.95);
    const ok=await rolar('Vestibular da universidade pública','A concorrência é grande. Estudo e o traço Rato de biblioteca ajudam.',ch,'Aprovado','Não passou');
    if(!ok){ t='comum'; addLog('Você não passou na pública e entrou numa faculdade particular.','r'); } }
  S.carreira='estudante'; S.casos=[]; S.ofertas=[]; S.filiais=[]; S.aReceber=0;
  S.vida.idade0=18; S.vida.ultimoAniv=18; S.vida.semana0=S.semana;
  for(const k in S.skills) S.skills[k]=(k in AREAS)?8:15; S.skills[S.espec]=14;
  S.caixa=3000; S.bolso=0; S.prest=0;
  for(const n of (S.npcs||[])) n.nivel=-1;
  S.fac={tier:t,semestre:1,sem:0,cr:null,notas:[],notaSem:[],freqBaixa:0,estagio:null,contatos:{adv:0,juiz:0,promotor:0,defensor:0},icProg:0,fase:'curso',oabEm:0,oabEstudo:0};
  Object.assign(S.agenda,{aulas:8,estagio:0,nucleo:0,ic:0,bico:0});
  S.log=[]; addLog(`Você entrou em Direito na ${FACS[t].nome.toLowerCase()}. São 10 semestres até a formatura.`,'g');
  view='escritorio'; salvar(); render();
}
function crTxt(){ const c=S.fac&&S.fac.cr; return c===null||c===undefined?'—':c.toLocaleString('pt-BR',{maximumFractionDigits:1}); }
function renderFaculdade(){ const F=S.fac, A=S.agenda, free=livres(), fase=F.fase;
  const cells=[]; const push=(k,n)=>{for(let i=0;i<n;i++) cells.push(k);};
  push('case',A.aulas||0); push('apoio',A.estagio||0); push('estudo',(A.nucleo||0)+(A.ic||0)+A.estudo); push('case',A.bico||0);
  push('lazer',A.lazer); push('familia',A.familia||0); push('saude',A.saude||0); push('descanso',Math.max(0,S.disp-cells.length)); push('off',BLOCOS-S.disp);
  let grid='';
  for(let r=0;r<3;r++) for(let d=0;d<7;d++) grid+=`<div class="blk ${cells[d*3+r]||'descanso'}"></div>`;
  const row=(k,l,ok=true,dica='')=>ok?`<div class="row"><span class="name" title="${dica}">${l}</span>${stepper(k,0,A[k]||0,free)}</div>`:'';
  const {fs:oabF,b:oabB}=fasesOAB();
  app.innerHTML=`${header()}
  <div class="grid">
    <div class="col">
      <section class="panel">
        <div class="panel-head"><h2>Agenda do mês</h2><span class="num">${S.disp-free}/${S.disp} blocos</span></div>
        <div class="blocks">${grid}</div>
        <div class="legend"><span><i style="background:var(--b-case)"></i>Aulas e trabalho</span><span><i style="background:var(--b-apoio)"></i>Estágio</span><span><i style="background:var(--b-estudo)"></i>Estudo e pesquisa</span><span><i style="background:var(--b-lazer)"></i>Lazer</span><span><i style="background:var(--b-familia)"></i>Família</span><span><i style="background:var(--b-saude)"></i>Saúde</span></div>
        <div class="rows">
          ${fase==='curso'?row('aulas','Aulas (mínimo 4 por mês)',true,'Menos de 4 blocos em 3 meses do semestre reprova por falta'):''}
          ${row('estagio','Estágio · '+(F.estagio?F.estagio.nome:''),!!F.estagio)}
          ${row('nucleo','Núcleo de prática jurídica',fase==='curso'&&F.semestre>=7,'Atende casos reais com supervisão')}
          ${row('ic','Iniciação científica',fase==='curso'&&F.semestre>=3,'Pesquisa com orientador: rende o primeiro artigo')}
          ${row('bico','Trabalho de meio período · R$ 60 por bloco')}
          <div class="row"><span class="name">${fase==='oab'?'Estudar para a OAB':'Estudo extra'}</span><select id="estudo-skill" data-act="estudoSkill">${Object.entries(SKILLS).map(([k,v])=>`<option value="${k}" ${A.estudoSkill===k?'selected':''}>${v}</option>`).join('')}</select>${stepper('estudo',0,A.estudo,free)}</div>
          <div class="row"><span class="name">Lazer (reduz estresse)</span>${stepper('lazer',0,A.lazer,free)}</div>
          ${rowsVida(free)}
        </div>
        <button class="btn brass wide" data-act="fimSemana">Encerrar mês ▶</button>
      </section>
      ${painelSkills()}${painelDiario()}
    </div>
    <div class="col">
      <section class="panel"><div class="panel-head"><h2>${FACS[F.tier].nome}</h2><span class="label">${fase==='oab'?'Formado':`${F.semestre}º de 10 semestres`}</span></div>
        <dl class="meta"><dt>Mês do semestre</dt><dd class="num">${fase==='oab'?'—':(F.sem+1)+' de 6'}</dd>
          <dt>Coeficiente de rendimento (CR)</dt><dd class="num ${F.cr!==null&&F.cr>=7?'hi':''}">${crTxt()}</dd>
          <dt>Notas dos semestres</dt><dd class="num">${F.notas.map(n=>n==='R'?'R':n.toLocaleString('pt-BR',{maximumFractionDigits:1})).join(' · ')||'—'}</dd>
          <dt>Mensalidade</dt><dd class="num">${FACS[F.tier].mensal?brl(FACS[F.tier].mensal)+'/mês':'gratuita'}</dd>
          <dt>Mesada da família</dt><dd class="num">${brl(MESADA)}/mês</dd><dt>Dinheiro</dt><dd class="num ${S.caixa<0?'lo':''}">${brl(S.caixa)}</dd></dl>
        <p style="margin:0;font-size:12px;color:var(--muted)">A nota do mês depende dos blocos de aula, da sua Análise e Escrita e da exigência da faculdade. O CR alto abre portas no mestrado e dá prestígio inicial na advocacia.</p>
      </section>
      <section class="panel"><div class="panel-head"><h2>Estágio</h2></div>
        ${F.estagio?`<dl class="meta"><dt>Onde</dt><dd>${F.estagio.nome}</dd><dt>Bolsa</dt><dd class="num">${brl(F.estagio.bolsa)} por bloco</dd><dt>Contatos feitos</dt><dd class="num">${Math.round(F.contatos[F.estagio.tipo])}</dd></dl>
          <p style="margin:0;font-size:12px;color:var(--muted)">Contatos no escritório dão prestígio quando você abrir o seu. Contatos em tribunal, MP ou Defensoria dão bônus no concurso dessa carreira.</p>
          <button class="btn ghost" data-act="facEstagioSair">Sair do estágio</button>`
          :`<p style="margin:0;font-size:12.5px">${F.semestre>=3||fase==='oab'?'Você pode procurar um estágio.':'Estágios abrem a partir do 3º semestre.'}</p><button class="btn ghost" data-act="facEstagio" ${F.semestre>=3||fase==='oab'?'':'disabled'}>Procurar estágio</button>`}
      </section>
      ${fase==='curso'&&F.semestre>=3?`<section class="panel"><div class="panel-head"><h2>Iniciação científica</h2></div><div class="vs"><span>Artigo</span><div class="bar"><i style="width:${Math.min(100,F.icProg/25*100)}%;background:var(--b-estudo)"></i></div><span class="num">${Math.round(F.icProg)}/25</span></div><p style="margin:0;font-size:12px;color:var(--muted)">A cada 25 blocos de pesquisa sai um artigo. Publicações ajudam na seleção do mestrado.</p></section>`:''}
      ${fase==='oab'?`<section class="panel"><div class="panel-head"><h2>Exame da OAB</h2></div>
        <dl class="meta">${oabF.map(x=>`<dt>${x.n} · skill ${x.sk} vs ${x.d}</dt><dd class="num ${cls(x.ch)}">${pct(x.ch)}</dd>`).join('')}<dt>Bônus de estudo</dt><dd class="num">+${oabB.toLocaleString('pt-BR',{maximumFractionDigits:1})}</dd></dl>
        <p style="margin:0;font-size:12px;color:var(--muted)">Blocos de "Estudar para a OAB" aumentam o bônus (máximo +15). Sem aprovação na OAB não dá para advogar.</p>
        <button class="btn brass" data-act="facOAB" ${F.oabEm>S.semana?'disabled':''}>${F.oabEm>S.semana?`Próximo exame no mês ${F.oabEm}`:'Fazer o Exame da OAB'}</button></section>`:''}
    </div>
  </div>`;
}
function fasesOAB(){ const F=S.fac||{}, b=Math.min(15,(F.oabEstudo||0)*.6)+(F.tier==='publica'?2:F.tier==='ponta'?1:0)+((F.cr||6)-6);
  const areas=Object.keys(AREAS).reduce((a,k)=>a+S.skills[k],0)/Object.keys(AREAS).length;
  const f=(n,sk,d)=>({n,sk:Math.round(sk),d,ch:clamp(sig((sk+b-d)/8),.05,.95)});
  return {b,fs:[f('1ª fase · prova objetiva',areas,24),f('2ª fase · peça prática',(S.skills[S.espec]+S.skills.escrita)/2,28)]}; }
async function exameOAB(){ const F=S.fac; if(ocupado||F.oabEm>S.semana) return; ocupado=true;
  try{ const {fs}=fasesOAB();
    for(const x of fs){ const ok=await rolar(x.n,`Skill ${x.sk} contra dificuldade ${x.d}.`,x.ch,'Aprovado','Reprovado');
      if(!ok){ F.oabEm=S.semana+5; S.estresse=clamp(S.estresse+8,0,100); addLog(`Reprovado na ${x.n} da OAB. Próximo exame no mês ${F.oabEm}.`,'r'); salvar(); return; } }
    const v=await modal(`<h2 class="hi">Aprovado na OAB</h2><p>Carteira da ordem na mão. Qual é o próximo passo?</p>
      <div class="opts"><button class="opt" data-mv="adv"><span>Abrir o próprio escritório</span><b class="num">adv</b><small>Começa com ${brl(15000)} de capital da família. Daqui a 24 meses de prática você pode prestar concursos.</small></button>
      <button class="opt" data-mv="academico"><span>Carreira acadêmica</span><b class="num">CR ${crTxt()}</b><small>Dedicação exclusiva à pesquisa e à docência: mestrado com bolsa, doutorado, artigos, livros e aulas.</small></button></div>`,[]);
    formar(v); salvar();
  } finally { ocupado=false; render(); }
}
function formar(cam){ const F=S.fac, cr=F.cr||6; for(const n of (S.npcs||[])) if(n.nivel<0) n.nivel=0;
  S.formacao={tier:F.tier,cr,contatos:{...F.contatos}}; S.semanaFormatura=S.semana;
  const pessoal=S.caixa;
  if(cam==='academico'){ iniciarAcademico(); S.caixa=pessoal; addLog('Você escolheu a carreira acadêmica. Comece pela seleção do mestrado.','g'); return; }
  S.carreira='adv'; S.u=estruturaInicial(false); S.bolso=pessoal; S.caixa=15000; S.casos=[]; S.filiais=[];
  S.prest=clamp(Math.round(12+FACS[F.tier].prest+(cr-6)*3+F.contatos.adv/10),5,40);
  Object.assign(S.agenda,{aulas:0,estagio:0,nucleo:0,ic:0,bico:0});
  gerarOfertas(); addLog(`Formado e aprovado na OAB, você abriu escritório em ${CIDADES[S.sede].nome} com prestígio ${S.prest}.`,'g'); view='escritorio';
}
async function facEstagio(){ if(ocupado) return; const tipos=Object.keys(ESTAGIOS).sort(()=>Math.random()-.5).slice(0,3);
  const ofs=tipos.map(t=>({tipo:t,nome:ESTAGIOS[t].nome+(t==='adv'?' · '+AREAS[pick(Object.keys(AREAS))].nome:''),area:t==='adv'?pick(Object.keys(AREAS)):t==='juiz'?pick(['civel','familia','penal']):t==='promotor'?'penal':'familia',bolsa:ESTAGIOS[t].bolsa}));
  ofs.forEach(o=>{ if(o.tipo==='adv'){ const a=Object.entries(AREAS).find(([k,v])=>o.nome.endsWith(v.nome)); if(a) o.area=a[0]; } });
  const v=await modal(`<h2>Vagas de estágio</h2><p>Escolha onde estagiar. Cada bloco de estágio paga a bolsa, treina a área e gera contatos.</p>
    <div class="opts">${ofs.map((o,i)=>`<button class="opt" data-mv="${i}"><span>${o.nome}</span><b class="num">${brl(o.bolsa)}/bloco</b><small>Treina ${AREAS[o.area].nome} e Negociação</small></button>`).join('')}</div>`,[{t:'Cancelar',v:'',cls:'ghost'}]);
  if(v===''||v===undefined) return; S.fac.estagio=ofs[+v]; addLog(`Você começou a estagiar: ${ofs[+v].nome}.`,'g'); salvar(); render(); }
async function fimSemanaEstudante(){
  if(ocupado) return; ocupado=true;
  try{ const F=S.fac, A=S.agenda, up=(k,v)=>{ S.skills[k]=clamp(S.skills[k]+v*(1-S.skills[k]/110),0,100); };
    const pessoal=estudBlocos()+A.estudo, desc=Math.max(0,S.disp-pessoal-A.lazer-vidaBlocos());
    S.energia=clamp(S.energia-2.6*pessoal*(S.traits.includes('workaholic')?.7:1)+3*desc+1.5*A.lazer,0,100);
    S.estresse=clamp(S.estresse+1.8*pessoal*(S.traits.includes('ansioso')?1.25:1)-1.2*desc-6*A.lazer,0,100);
    const mult=(S.traits.includes('rato')?1.5:1)*(tem('pesquisa',3)?1.5:1);
    if(A.estudo){ for(let i=0;i<A.estudo;i++) up(A.estudoSkill,1.1*mult*multAtual(A.estudoSkill)); S.estudoTotal=(S.estudoTotal||0)+A.estudo; if(F.fase==='oab') F.oabEstudo+=A.estudo; }
    const ar=Object.keys(AREAS);
    for(let i=0;i<(A.aulas||0);i++){ up(pick(ar),.3*mult); up(pick(ar),.3*mult); up('analise',.15); up('escrita',.15); }
    if(F.estagio&&A.estagio){ for(let i=0;i<A.estagio;i++){ up(F.estagio.area,.8); up('negociacao',.25); } S.caixa+=F.estagio.bolsa*A.estagio; F.contatos[F.estagio.tipo]+=A.estagio; }
    for(let i=0;i<(A.nucleo||0);i++){ up('oratoria',.5); up(pick(['civel','familia','penal']),.4); up('escrita',.2); }
    if(A.ic){ for(let i=0;i<A.ic;i++){ up('pesquisa',.45); up('escrita',.3); } F.icProg+=A.ic;
      if(F.icProg>=25){ F.icProg-=25; const t=tituloPesquisa(S.espec); S.ac.pubs.push({tipo:'artigo',titulo:t,qualis:'B2',pts:1,semana:S.semana}); S.ac.indice+=1; addLog(`Artigo de iniciação científica publicado: “${t}”.`,'g'); } }
    S.caixa+=(A.bico||0)*60+MESADA-FACS[F.tier].mensal;
    let resumo=null;
    if(F.fase==='curso'){
      const nota=clamp((A.aulas||0)*.8+(S.skills.analise+S.skills.escrita)/40-FACS[F.tier].dif+(A.nucleo||0)*.1,0,10);
      F.notaSem.push(nota); if((A.aulas||0)<4) F.freqBaixa++;
      F.sem++;
      if(F.sem>=6){ const media=F.notaSem.reduce((a,b)=>a+b,0)/F.notaSem.length, rep=F.freqBaixa>=3||media<5;
        if(rep){ F.notas.push('R'); addLog(`Reprovado no ${F.semestre}º semestre${F.freqBaixa>=3?' por falta':''}. Vai cursar de novo.`,'r'); S.estresse=clamp(S.estresse+10,0,100); }
        else { F.notas.push(media); F.semestre++; addLog(`${F.semestre-1}º semestre concluído com média ${media.toLocaleString('pt-BR',{maximumFractionDigits:1})}.`,'g'); }
        const ok=F.notas.filter(n=>n!=='R'); F.cr=ok.length?ok.reduce((a,b)=>a+b,0)/ok.length:null;
        resumo={media,rep}; F.sem=0; F.notaSem=[]; F.freqBaixa=0;
        if(F.semestre>10){ F.fase='oab'; A.aulas=0; A.nucleo=0; A.ic=0; }
      }
    }
    if(resumo) await modal(`<span class="label">${FACS[F.tier].nome}</span><h2>${resumo.rep?'Semestre perdido':'Fim de semestre'}</h2>
      <p>Média do semestre: <b class="num">${resumo.media.toLocaleString('pt-BR',{maximumFractionDigits:1})}</b> · CR: <b class="num">${crTxt()}</b></p>
      ${F.fase==='oab'?`<p class="hi">Formatura! Você concluiu o curso de Direito com CR ${crTxt()}. Agora falta o Exame da OAB.</p>`:''}`,[{t:'Continuar',v:1,cls:'brass'}]);
    if(await semanaVida()) return;
    S.semana++; S.agenda.estudo=0; S.agenda.lazer=0; S.disp=BLOCOS-blocosPerdidos();
    if(S.estresse>=100){ S.disp=10; S.estresse=70; addLog('Burnout: você só terá 10 blocos no próximo mês.','r'); }
    salvar();
  } finally { ocupado=false; render(); }
}

