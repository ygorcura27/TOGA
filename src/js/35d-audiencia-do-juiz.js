// ===================== AUDIÊNCIA DO JUIZ AO VIVO =====================
// O juiz não disputa: preside. As partes jogam sozinhas e um dos lados tem razão (escondido). Você pergunta às testemunhas
// (Análise e o estudo do processo), decide objeções, determina perícia, resolve incidentes e sentencia. Acertar a verdade
// faz o tribunal manter a sentença; errar faz reformar; objeções mal decididas podem anular. Cabem VIVO_MES por mês.
const vivoJuizOk=p=>RORD.indexOf(p.rar)>=2;
const modoJuiz=p=>p.modoAud||(vivoJuizOk(p)?'vivo':'gabinete');
{ const c0=procCard; procCard=function(p){ const h=c0(p); if(!vivoJuizOk(p)) return h; const m=modoJuiz(p), cheio=m==='vivo'&&vivoUsadas()>=VIVO_MES;
    const b=(v,t,tt)=>`<button class="chip ${m===v?'on':''}" data-act="modoAud" data-id="${p.id}" data-v="${v}" title="${tt}">${t}</button>`;
    return h.replace('<div class="ctl">',`<div class="modo-aud"><span class="label">Audiência</span><div class="chips">${b('vivo','Presidir ao vivo',`Você preside a audiência e investiga quem tem razão. Cabem ${VIVO_MES} por mês.`)}${b('gabinete','Pelo gabinete','Sentença pelo estudo do processo, como sempre.')}</div>${cheio?`<small class="lo">Já são ${VIVO_MES} audiências ao vivo neste mês: esta vai pelo gabinete.</small>`:''}</div><div class="ctl">`); }; }
async function audienciaJuizSe(p){
  if(modoJuiz(p)!=='vivo') return null;
  if(vivoUsadas()>=VIVO_MES){ addLog(`Agenda cheia de audiências ao vivo: “${p.titulo}” foi sentenciado pelo gabinete.`); return null; }
  if(MODO_TESTE&&!window.__vivo) return null;
  usarVivo(); return audienciaJuiz(p); }

function audienciaJuiz(p){ return new Promise(fim=>{
  const penal=p.area==='penal';
  if(!p.partes){ const pA=.5+rnd(-.15,.15); p.partes={a:rint(45,78),b:rint(45,78),verdade:Math.random()<pA?'a':'b'}; }
  const P={a:{rot:penal?'Acusação':'Autor',nome:penal?'Ministério Público':p.cliente,sk:p.partes.a},b:{rot:penal?'Defesa':'Réu',nome:penal?p.cliente:ADV[p.adv].nome,sk:p.partes.b}};
  const sentA=penal?'Condenação':'Procedente', sentB=penal?'Absolvição':'Improcedente';
  const estudo=(p.estudo||0)+(p.semana||0);
  const acc=clamp(sig((S.skills.analise+prepCaso(p,estudo)*1.5-p.d+20)/12)+(vip('faro')?.1:0),.55,.96), sabeArea=clamp(sig((S.skills[p.area]-50)/10),.4,.9);
  const s={min:0,rodando:false,vel:1,autos:50,logOdds:0,folego:vip('nervos')?100:S.energia,nulidade:0,diligencia:1,folego0:0,feed:[{m:0,t:'Você abre a audiência. As partes não fazem acordo.',l:''}],lances:[],pistas:[],barras:[],decisao:null,feitos:{},fim:false,fund:'tecnica',extra:0,res:null};
  const lado=x=>P[x].rot.toLowerCase(), lim=(v,a,b)=>Math.max(a,Math.min(b,v));
  const TX={a:['A testemunha do {a} descreve os fatos com detalhes.','O {a} junta um documento que confirma a sua versão.','O {a} expõe uma contradição da outra parte.','A testemunha do {a} confirma datas e horários.'],
            b:['A testemunha do {b} contradiz a versão do {a}.','O {b} apresenta um documento que complica a versão do {a}.','O {b} levanta dúvida sobre os fatos.','A testemunha do {b} diz que tudo foi diferente.']};
  const OBJ=[{q:'a',t:'Objeção do {a}: a pergunta induz a testemunha.',certa:'deferir',dica:'A pergunta já trazia a resposta pronta.',falsa:'A pergunta parecia apenas pedir detalhes.'},
    {q:'b',t:'Objeção do {b}: fato estranho ao processo.',certa:'deferir',dica:'O assunto não está no pedido.',falsa:'O assunto parece ligado ao pedido.'},
    {q:'a',t:'Objeção do {a}: a testemunha é parente da outra parte.',certa:'indeferir',dica:'O parentesco não foi provado.',falsa:'Os sobrenomes são iguais.'},
    {q:'b',t:'Objeção do {b}: documento juntado fora do prazo.',certa:'indeferir',dica:'O documento é novo e só surgiu agora.',falsa:'O documento já existia antes.'}];
  const nm=t=>t.replace(/\{a\}/g,lado('a')).replace(/\{b\}/g,lado('b'));
  const lance=(t,l,x)=>{ const e={m:s.min,t,l,...x}; s.feed.unshift(e); s.feed=s.feed.slice(0,10); return e; };
  const pista=(t,l)=>s.pistas.unshift({t,l});
  const box=document.createElement('div'); box.className='av-ov'; box.setAttribute('role','dialog'); box.setAttribute('aria-modal','true'); box.setAttribute('aria-label','Audiência do juiz');
  document.body.appendChild(box); let timer;
  function encerrar(){ clearTimeout(timer); S.energia=clamp(Math.round(s.folego)+s.extra,0,100); box.remove(); fim(s.res); }
  function concluir(){ s.fim=true; s.rodando=false; lance('Instrução encerrada. Os autos vêm conclusos para sentença.',''); }
  function passo(){ if(!s.rodando||s.decisao||s.fim) return; s.min++; s.folego=Math.min(100,s.folego+.3);
    if([20,36,46].includes(s.min)&&!s.feitos[s.min]){ s.feitos[s.min]=1; s.rodando=false;
      if(s.min===20){ const x=Math.random()<.5?'a':'b'; s.decisao={tipo:'falso',x}; lance(`A testemunha do ${lado(x)} muda a versão no meio do depoimento.`,x); }
      if(s.min===36){ const x=Math.random()<.5?'a':'b'; s.decisao={tipo:'liminar',x}; lance(`O ${lado(x)} pede uma decisão urgente antes da sentença.`,x); }
      if(s.min===46){ s.decisao={tipo:'propina'}; lance('Um intermediário procura seu gabinete no intervalo.',''); }
      return desenhar(); }
    if(s.min<55&&Math.random()<.07){ const o=pick(OBJ); s.decisao={tipo:'obj',o,dica:Math.random()<sabeArea?o.dica:o.falsa}; s.rodando=false; lance(nm(o.t),o.q); return desenhar(); }
    if(s.min<55&&Math.random()<.42){ const x=Math.random()<sig((P.a.sk-P.b.sk)/12)?'a':'b', verd=x===p.partes.verdade?Math.random()<.9:Math.random()<.3, v=3+Math.random()*4;
      s.autos=lim(s.autos+(x==='a'?v:-v),5,95); s.lances.push(lance(nm(pick(TX[x])),x,{verd,chk:false})); s.barras.push({m:s.min,d:x==='a'?v:-v}); }
    else s.barras.push({m:s.min,d:0});
    if(s.min>=55&&!s.fim) concluir(); desenhar(); }
  function agendar(){ clearTimeout(timer); timer=setTimeout(()=>{ passo(); if(!s.fim) agendar(); },700/s.vel); }
  function sentenciar(x){ const ac=x===p.partes.verdade, tec=s.fund==='tecnica', esc=(S.skills.escrita-50)/400;
    let ch=ac?(tec?.93:.82)+esc:(tec?.3:.15)+esc/2; ch*=1-s.nulidade/100;
    if(!tec) s.extra+=5;
    s.res={ch:clamp(ch,.03,.97),recMais:ac?0:.25}; s.sent={x,ac};
    lance(`Sentença: ${x==='a'?sentA:sentB}. Fundamentação ${tec?'técnica':'curta'}.`,'');
    addLog(`Audiência presidida em “${p.titulo}”: ${x==='a'?sentA:sentB.toLowerCase()} · ${ac?'a prova confirmava a sua leitura':'a verdade estava do outro lado'}.`,ac?'g':'r'); }
  function acao(a,v){
    if(a==='play'){ if(!s.fim&&!s.decisao) s.rodando=!s.rodando; }
    else if(a==='vel'){ s.vel=+v; agendar(); }
    else if(a==='fund') s.fund=v;
    else if(a==='sent'&&!s.res) sentenciar(v);
    else if(a==='sair') return encerrar();
    else if(a==='encerrar'&&!s.fim&&s.min>=25){ s.extra+=5; concluir(); }
    else if(a==='perguntar'&&!s.fim&&!s.decisao&&s.folego>=10){ s.folego-=10; const al=[...s.lances].reverse().find(l=>!l.chk);
      if(!al) lance('Não há nada novo a esclarecer com as testemunhas.','');
      else { al.chk=true; const certo=Math.random()<acc; al.parece=certo?al.verd:!al.verd; const w=Math.log(acc/(1-acc))*.5;
        s.logOdds+=(al.l==='a'?1:-1)*(al.parece?w:-w); if(!al.parece) s.autos=lim(s.autos+(al.l==='a'?-4:4),5,95);
        pista(`${al.m}' · ${al.parece?'Confirmado':'Contradição'}: “${al.t}”`,al.parece?al.l:al.l==='a'?'b':'a'); lance(`Você pergunta sobre o lance do minuto ${al.m}.`,''); } }
    else if(a==='pericia'&&s.diligencia&&!s.fim&&!s.decisao){ s.diligencia=0; p.idade=(p.idade||0)+1; const certo=Math.random()<.88, ap=certo?p.partes.verdade:p.partes.verdade==='a'?'b':'a';
      s.logOdds+=(ap==='a'?1:-1)*1.8; pista(`Perícia do juízo aponta a favor do ${lado(ap)}. O processo envelhece 1 mês.`,ap); lance('Você determina uma perícia.',''); }
    else if(a==='dec'&&s.decisao){ const D=s.decisao; s.decisao=null;
      if(D.tipo==='obj'){ const ok=v===D.o.certa; if(!ok) s.nulidade=Math.min(60,s.nulidade+12); lance(`Objeção ${v==='deferir'?'deferida':'indeferida'}.${ok?'':' A parte prejudicada protesta na ata.'}`,''); }
      if(D.tipo==='falso'){ const mente=D.x!==p.partes.verdade;
        if(v==='apurar'){ if(mente){ s.logOdds+=(D.x==='a'?-1:1)*1.6; s.autos=lim(s.autos+(D.x==='a'?-8:8),5,95); pista(`A testemunha do ${lado(D.x)} mentiu: o depoimento cai.`,D.x==='a'?'b':'a'); }
          else { s.nulidade=Math.min(60,s.nulidade+15); lance('A apuração não encontra mentira. A parte acusa o juízo de parcialidade.',D.x); } }
        else lance('Você registra a contradição e segue.',''); }
      if(D.tipo==='liminar'){ const certo=(v==='deferir')===(D.x===p.partes.verdade); S.prest=clamp(S.prest+(certo?1:-1),0,100); lance(`Pedido urgente ${v==='deferir'?'deferido':'indeferido'}.`,''); }
      if(D.tipo==='propina'){ if(v==='aceitar'){ S.caixa+=Math.round(p.valor*.03); S.integ=clamp(S.integ-30,0,100); S.j.propina++; lance('Você aceita. Ninguém viu… por enquanto.',''); }
        else { S.prest=clamp(S.prest+3,0,100); S.integ=clamp(S.integ+5,0,100); lance('Você recusa e comunica à corregedoria.',''); } }
      if(!s.fim) s.rodando=true; }
    desenhar(); }
  box.addEventListener('click',e=>{ const b=e.target.closest('[data-av]'); if(!b||b.disabled) return; acao(b.dataset.av,b.dataset.v); });
  function desenhar(){
    const autos=Math.round(s.autos), pA=sig(s.logOdds), cert=Math.round(pA*100), parado=s.fim||!!s.decisao, D=s.decisao;
    const op=(v,t,sm)=>`<button class="opt" data-av="dec" data-v="${v}"><span>${t}</span><small>${sm}</small></button>`;
    let dh='';
    if(D&&D.tipo==='obj') dh=`<span class="label">Objeção · decida</span><span>${nm(D.o.t)}</span><small>O que você percebeu: ${D.dica}</small>${op('deferir','Deferir','aceitar a objeção')}${op('indeferir','Indeferir','seguir como está')}<small>Decidir errado aumenta o risco de nulidade.</small>`;
    if(D&&D.tipo==='falso') dh=`<span class="label">Incidente · falso testemunho?</span><span>A testemunha do ${lado(D.x)} mudou a versão. Mentira ou nervosismo?</span>${op('apurar','Mandar apurar','se mentiu: grande pista · se não: risco de nulidade')}${op('seguir','Registrar e seguir','sem risco')}`;
    if(D&&D.tipo==='liminar') dh=`<span class="label">Incidente · pedido urgente</span><span>O ${lado(D.x)} pede uma decisão imediata, antes de toda a prova.</span>${op('deferir','Deferir','reputação ±1 conforme a verdade')}${op('indeferir','Indeferir','reputação ±1 conforme a verdade')}`;
    if(D&&D.tipo==='propina') dh=`<span class="label">Incidente · gabinete</span><span>Um intermediário oferece dinheiro por uma sentença “bem pensada”.</span>${op('recusar','Recusar e comunicar à corregedoria','+3 de reputação e +5 de integridade')}${op('aceitar','Aceitar',`+${brl(Math.round(p.valor*.03))}, −30 de integridade e risco de perder o cargo`)}`;
    const barras=s.barras.map(b=>{ const h=Math.min(54,Math.abs(b.d)*6+(b.d?5:2)); return `<i style="left:${b.m/55*98}%;height:${h}px;top:${b.d>=0?70-h:70}px;background:${b.d>0?'var(--b-case)':b.d<0?'var(--b-familia)':'var(--line)'}"></i>`; }).join('');
    let sent;
    if(s.res) sent=`<div class="verdict ${s.sent.ac?'hi':'lo'}">${s.sent.x==='a'?sentA:sentB}</div><small>${s.nulidade?`Risco de nulidade: ${s.nulidade}%. `:''}O tribunal confere se havia razão para isso nos próximos meses, se houver recurso.</small><button class="btn brass" data-av="sair">Voltar ao gabinete</button>`;
    else if(s.fim) sent=`<small>Os autos mostram ${autos>=50?lado('a'):lado('b')} na frente; suas pistas apontam ${s.pistas.length?`${pA>=.5?lado('a'):lado('b')} (${Math.max(cert,100-cert)}%)`:'para nada ainda'}.</small>
      <div class="av-pills"><button class="tab ${s.fund==='tecnica'?'on':''}" data-av="fund" data-v="tecnica">Técnica · resiste ao recurso</button><button class="tab ${s.fund==='curta'?'on':''}" data-av="fund" data-v="curta">Curta · +5 de energia</button></div>
      <button class="btn" data-av="sent" data-v="a">${sentA}</button><button class="btn" data-av="sent" data-v="b">${sentB}</button>`;
    else sent='<small>Ao fim da instrução você decide. Até lá, separe o que convence do que é verdade.</small>';
    box.innerHTML=`<div class="av">
      <header class="av-placar">
        <div class="av-lado"><span class="label" style="color:var(--b-case)">${P.a.rot}</span><b>${esc(P.a.nome)}</b><small>skill ${P.a.sk}</small></div>
        <div class="av-centro"><span class="label av-fase">Você preside · ${esc(p.titulo)}</span><div class="av-relogio num">${String(s.min).padStart(2,'0')}' / 55'</div>
          <div class="av-cabo jz" role="img" aria-label="Os autos mostram ${autos}% a favor do ${lado('a')}"><i style="width:${autos}%"></i></div><small>Os autos mostram: <b>${autos>=50?`${autos}% ${lado('a')}`:`${100-autos}% ${lado('b')}`}</b></small></div>
        <div class="av-lado dir"><span class="label" style="color:var(--b-familia)">${P.b.rot}</span><b>${esc(P.b.nome)}</b><small>skill ${P.b.sk}</small></div>
      </header>
      <div class="av-faixa">
        <div class="av-mini"><span class="label">Sua convicção · pelas pistas</span><span>${s.pistas.length?(Math.abs(cert-50)<8?'Ainda em dúvida.':`Apontam para o ${cert>50?lado('a'):lado('b')} (${Math.max(cert,100-cert)}%).`):'Sem pistas: você só sabe o que as partes mostraram.'}</span></div>
        <div class="av-mini"><span class="label">Seu fôlego · ${Math.round(s.folego)}</span><div class="meter ${s.folego<30?'s':'e'}" style="width:100%"><i style="width:${s.folego}%"></i></div><span>Cada pergunta custa 10.</span></div>
        <div class="av-mini"><span class="label">Risco de nulidade</span><span class="${s.nulidade>25?'lo':''}">${s.nulidade?`${s.nulidade}% de o tribunal anular a sentença.`:'Audiência limpa até aqui.'}</span></div>
      </div>
      <div class="av-corpo">
        <section class="panel av-feed"><div class="panel-head"><h2>Na sala</h2></div>${dh?`<div class="av-momento">${dh}</div>`:''}
          ${s.feed.map(x=>`<div class="av-ev ${x.l==='a'?'pa':x.l==='b'?'pb':''}"><span class="num">${x.m}'</span><span>${x.t}${x.chk?` <b class="${x.parece?'hi':'lo'}">· ${x.parece?'confirmado':'contradição'}</b>`:x.verd!==undefined?' <small class="label">· não verificado</small>':''}</span></div>`).join('')}</section>
        <section class="av-meio">
          <div class="panel"><div class="panel-head"><h2>Pistas</h2><span class="label">o que você apurou</span></div>${s.pistas.length?s.pistas.map(x=>`<div class="av-pista" style="border-left-color:var(--${x.l==='a'?'b-case':'b-familia'})">${x.t}</div>`).join(''):'<small style="color:var(--muted)">Nenhuma ainda. Pergunte sobre os lances decisivos ou determine uma perícia.</small>'}</div>
          <div class="panel"><div class="panel-head"><h2>Força das partes</h2><span class="label">acima: ${lado('a')} · abaixo: ${lado('b')}</span></div><div class="av-pressao">${barras}</div></div>
          <div class="panel av-instr"><h2>Sentença</h2>${sent}</div>
        </section>
        <section class="panel av-instr"><h2>Bancada</h2>
          <button class="btn ghost" data-av="perguntar" ${parado||s.folego<10||!s.min?'disabled':''} title="Revela se o último lance não verificado é verdade. Acerta ${pct(acc)} (Análise e estudo do processo).">Perguntar às testemunhas · ${pct(acc)}</button>
          <button class="btn ghost" data-av="pericia" ${parado||!s.diligencia||!s.min?'disabled':''} title="Pista forte (88%) sobre quem tem razão. O processo envelhece 1 mês.">Determinar perícia · ${s.diligencia}</button>
          <button class="btn ghost" data-av="encerrar" ${parado||s.min<25?'disabled':''} title="Menos tempo para apurar, +5 de energia.">Encerrar a instrução agora</button>
          <small>As partes disputam sozinhas. O melhor advogado nem sempre tem razão: a verdade aparece nas pistas. Sentenciar contra ela faz o tribunal reformar.</small>
          <div class="av-ctl"><button class="btn brass" data-av="play" ${parado?'disabled':''}>${s.fim?'Instrução encerrada':s.decisao?'Decida o incidente':s.rodando?'Pausar':s.min?'Continuar':'Abrir a audiência'}</button>
            ${[1,2,4].map(v=>`<button class="tab ${s.vel===v?'on':''}" data-av="vel" data-v="${v}">${v}×</button>`).join('')}</div>
        </section>
      </div></div>`; }
  desenhar(); agendar(); }); }
