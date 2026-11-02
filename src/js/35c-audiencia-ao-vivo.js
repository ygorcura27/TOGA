// ===================== AUDIÊNCIA AO VIVO, AUDIÊNCIA RÁPIDA E ADVOGADO ENVIADO =====================
// Cada caso escolhe como vai à audiência:
//  · ao vivo: você conduz uma partida de 60 minutos (postura, foco, juiz, fôlego, embalo, trunfos, momentos decisivos, acordo);
//  · rápida: a balança de sempre, com o momento decisivo;
//  · enviar: um advogado (ou assessor, nas carreiras públicas) vai no seu lugar e a chance usa a skill dele.
// Ao vivo cabem só VIVO_MES audiências por mês: o resto vai rápida ou com a equipe, para o mês não ficar cansativo.
const VIVO_MES=3;
const vivoUsadas=()=>S.vivo&&S.vivo.mes===S.semana?S.vivo.n:0;
const usarVivo=()=>{ if(!S.vivo||S.vivo.mes!==S.semana) S.vivo={mes:S.semana,n:0}; S.vivo.n++; };
const papelAud=()=>S.carreira==='promotor'?'mp':S.carreira==='defensor'?'dp':'adv';
// quem pode ir no seu lugar: advogados com área no escritório; nas carreiras públicas, assessores
function substitutos(c){ const eq=S.u?S.u.equipe:[];
  if(papelAud()==='adv') return eq.filter(f=>f.ae).map(f=>({f,sk:f.area===c.area?f.ae:Math.round(f.q*.85)}));
  return eq.filter(f=>f.funcao==='assessor').map(f=>({f,sk:Math.round(f.q*.9)})); }
const melhorSub=c=>substitutos(c).sort((a,b)=>b.sk-a.sk)[0]||null;
const skillTitular=c=>papelAud()==='adv'?skillCaso(c):papelAud()==='mp'?.5*S.skills[c.area]+.3*S.skills.analise+.2*S.skills.oratoria:skillCaso(c);
const vivoPermitido=c=>papelAud()!=='dp'||RORD.indexOf(c.rar)>=2; // na Defensoria, comuns e incomuns vão em lote
function modoPadrao(c){ if(RORD.indexOf(c.rar)>=2&&vivoPermitido(c)) return 'vivo'; return melhorSub(c)?'enviar':'rapida'; }
const modoDe=c=>c.modoAud||modoPadrao(c);
const chanceDe=c=>(papelAud()==='mp'?calcCondenacao(c):papelAud()==='dp'?calcDefesa(c):calcChance(c)).ch;
// acha o ajuste de c.mod que leva a chance do caso até p (a fórmula do jogo continua valendo, inclusive no júri)
function ajustarPara(c,p){ const m0=c.mod||0; let lo=-80, hi=80;
  for(let i=0;i<24;i++){ const mid=(lo+hi)/2; c.mod=m0+mid; if(chanceDe(c)<p) lo=mid; else hi=mid; }
  c.mod=m0+(lo+hi)/2; }

// ---------- seletor no cartão do caso ----------
function seletorModo(c){ const m=modoDe(c), sub=melhorSub(c), cheio=vivoUsadas()>=VIVO_MES&&m==='vivo';
  const b=(v,t,dis,tt)=>`<button class="chip ${m===v?'on':''}" data-act="modoAud" data-id="${c.id}" data-v="${v}" ${dis?'disabled':''} title="${tt}">${t}</button>`;
  return `<div class="modo-aud"><span class="label">Audiência</span><div class="chips">
    ${vivoPermitido(c)?b('vivo','Ao vivo',false,`Você conduz a audiência. Cabem ${VIVO_MES} por mês.`):''}
    ${b('rapida','Rápida',false,'A balança de sempre, com o momento decisivo.')}
    ${b('enviar',sub?`Enviar ${esc(sub.f.nome.split(' ')[0])} · ${sub.sk}`:'Enviar ninguém',!sub,sub?`${nomeFuncao(sub.f)} vai no seu lugar. A chance usa a skill dele no caso (${sub.sk}) no lugar da sua (${Math.round(skillTitular(c))}).`:'Contrate advogados para enviar à audiência.')}
  </div>${cheio?`<small class="lo">Você já tem ${VIVO_MES} audiências ao vivo neste mês: esta vai ${sub?'com '+esc(sub.f.nome.split(' ')[0]):'rápida'}.</small>`:''}</div>`; }
{ const p0=pasta; pasta=function(c,ativo){ const h=p0(c,ativo); return ativo&&S.casos.includes(c)&&(c.inst||1)===1?h.replace('<div class="ctl">',seletorModo(c)+'<div class="ctl">'):h; }; }
{ const m0=mpCard; mpCard=function(c){ const h=m0(c); return c.fase==='juizo'?h.replace('<div class="ctl">',seletorModo(c)+'<div class="ctl">'):h; }; }
{ const d0=dpCard; dpCard=function(c){ const h=d0(c); return RORD.indexOf(c.rar)>=2?h.replace('<div class="ctl">',seletorModo(c)+'<div class="ctl">'):h; }; }
document.addEventListener('click',e=>{ const b=e.target.closest('[data-act=modoAud]'); if(!b||b.disabled||!S) return;
  const L=listaCasos(), c=L.find(x=>x.id===+b.dataset.id); if(!c) return; c.modoAud=b.dataset.v; salvar(); render(); });

// ---------- antes do veredito: decide o modo e ajusta a chance ----------
async function prepararAudiencia(c){
  let m=modoDe(c); const sub=melhorSub(c);
  if(m==='vivo'&&!vivoPermitido(c)) m='rapida';
  if(m==='vivo'&&vivoUsadas()>=VIVO_MES){ m=sub?'enviar':'rapida'; addLog(`Agenda cheia de audiências ao vivo: “${c.titulo}” foi ${sub?'com '+sub.f.nome:'pela audiência rápida'}.`); }
  if(m==='enviar'&&!sub) m='rapida';
  c._modo=m;
  if(m==='enviar'){ c.mod=(c.mod||0)+(sub.sk-skillTitular(c)); addLog(`${sub.f.nome} (${nomeFuncao(sub.f).toLowerCase()}) representou você em “${c.titulo}”.`); return null; }
  if(m!=='vivo') return null;
  usarVivo(); c._vivoIni=chanceDe(c);
  const r=await audienciaAoVivo(c); if(!r) return null; c._vivoFim=r.acordo?r.acordo:r.p;
  if(r.acordo) return r;
  ajustarPara(c,r.p); return null; }
const limparModo=c=>{ delete c._modo; };
{ const m0=momentoDecisivo; momentoDecisivo=async function(c){ if(c._modo==='vivo'||c._modo==='enviar') return; return m0(c); }; }
{ const r0=reviravolta; reviravolta=async function(c){ if(c._modo==='vivo'||c._modo==='enviar') return; return r0(c); }; }
{ const a0=audiencia; audiencia=async function(c){ if((c.inst||1)>1) return a0(c);
    const r=await prepararAudiencia(c);
    if(r&&r.acordo){ const val=c.valor*r.acordo, hon=Math.round(val*.2); S.caixa+=hon; S.u.honSemana+=hon; pagarAssociados(hon); S.vitorias++; S.casos=S.casos.filter(x=>x.id!==c.id);
      addLog(`Acordo na audiência de “${c.titulo}”: ${pct(r.acordo)} do pedido, ${brl(hon)} de honorários.`,'g'); return; }
    try{ return await a0(c); } finally{ limparModo(c); } }; }
{ const j0=julgamentoMP; julgamentoMP=async function(c){ if((c.inst||1)===1) await prepararAudiencia(c); try{ return await j0(c); } finally{ limparModo(c); } }; }
{ const j0=julgamentoDP; julgamentoDP=async function(c){ if((c.inst||1)===1) await prepararAudiencia(c); try{ return await j0(c); } finally{ limparModo(c); } }; }

// ---------- a partida ----------
const AV_FIM=60;
const AV_FASES=[[0,'Abertura'],[10,'Testemunhas'],[30,'Provas'],[45,'Debates'],[55,'Sentença']];
const AV_PESO={Abertura:{tese:3,prova:1,testemunha:0,mag:3},Testemunhas:{tese:1,prova:1,testemunha:4,mag:4.5},Provas:{tese:0,prova:4,testemunha:1,mag:5},Debates:{tese:4,prova:1,testemunha:1,mag:4.5}};
const AV_NOMES={testemunha:'Testemunhas',prova:'Provas',tese:'Tese jurídica'};
const AV_TXT={
  tese:{nos:['Sua tese prende a atenção de quem julga.','Você cita o precedente certo no momento certo.','Você amarra prova e tese num argumento firme.'],
        eles:['A outra parte sustenta uma tese bem construída.','O adversário cita precedentes fortes.','A outra parte explora uma brecha na sua tese.']},
  prova:{nos:['Um documento seu derruba a versão contrária.','A perícia aponta a contradição que você queria.','Os registros confirmam a sua linha do tempo.'],
         eles:['A outra parte contesta a sua prova técnica.','O adversário junta um documento que complica a sua tese.','Sua prova é considerada frágil.']},
  testemunha:{nos:['Sua testemunha sustenta a versão com firmeza.','Você expõe uma contradição da testemunha contrária.','O depoimento confirma o ponto central do caso.'],
              eles:['A testemunha contrária é convincente.','Sua testemunha se confunde com as datas.','O adversário acha uma contradição no seu depoimento.']},
};
// cada juiz valoriza um tipo de lance; alguns não gostam de certas posturas; no júri decidem os jurados
const AV_JUIZ={
  rigoroso:{pref:'tese',contra:'agressiva',txt:'quer técnica jurídica e detesta teatro: postura agressiva irrita'},
  garantista:{pref:'testemunha',txt:'valoriza os depoimentos e a palavra das pessoas'},
  formalista:{pref:'prova',txt:'decide pelo que está nos autos: provas e documentos'},
  impaciente:{pref:'tese',contra:'cautelosa',txt:'quer objetividade: postura cautelosa irrita'},
  pragmatico:{pref:'prova',acordo:.15,txt:'gosta de soluções: acordo fica mais fácil'},
  juri:{pref:'testemunha',txt:'os jurados se convencem por pessoas e histórias'},
};
const AV_POST={cautelosa:{t:'Cautelosa',mag:.7,freq:.75,gasto:.2},equilibrada:{t:'Equilibrada',mag:1,freq:1,gasto:.55},agressiva:{t:'Agressiva',mag:1.35,freq:1.3,gasto:1.3}};
const AV_VENCE={cautelosa:'agressiva',agressiva:'equilibrada',equilibrada:'cautelosa'};
const AV_MOMENTOS={
  18:{t:'A testemunha da outra parte hesita num detalhe importante.',ops:[['Pressionar a contradição','testemunha',8,10,-7],['Pedir acareação com a sua testemunha','testemunha',-4,16,-10],['Não arriscar',null,0,0,0]]},
  38:{t:'A prova técnica deixa um ponto em aberto.',ops:[['Explorar com os seus documentos','prova',10,8,-5],['Pedir nova perícia ou diligência','prova',-6,15,-9],['Deixar como está',null,0,0,0]]},
  50:{t:'A outra parte encerra com um precedente forte.',ops:[['Distinguir o precedente','tese',6,9,-6],['Arriscar uma tese ousada','tese',-8,18,-12],['Reforçar o que já está provado',null,0,2,0]]},
};
// trunfos vêm do que você preparou: apoios do caso no escritório, diligências no MP, atendimento na Defensoria
function avCartas(c){ const L=[], ap=c.apoios||{}, feito=k=>ap[k]===2||ap[k]===1;
  if(feito('pesquisa')) L.push({id:'pesquisa',t:'Jurisprudência garimpada',q:'Precedentes que o adversário não viu.',tipo:'tese',fase:'Debates',forca:7,risco:.1});
  if(feito('testemunha')) L.push({id:'testemunha',t:'Testemunha preparada',q:'Ensaiada para não cair em contradição.',tipo:'testemunha',fase:'Testemunhas',forca:8,risco:.15});
  if(feito('perito')) L.push({id:'perito',t:'Laudo do perito',q:'Análise técnica a seu favor.',tipo:'prova',fase:'Provas',forca:10,risco:.15});
  if(feito('parecer')) L.push({id:'parecer',t:'Parecer de jurista',q:'Autoridade acadêmica na tese.',tipo:'tese',fase:'Debates',forca:11,risco:.1});
  const prep=(c.prep||0)+(c.estudo||0);
  if(papelAud()==='mp'&&prep>=3) L.push({id:'diligencia',t:'Prova da investigação',q:'O que as diligências encontraram.',tipo:'prova',fase:'Provas',forca:6+Math.min(6,prep),risco:.12});
  if(papelAud()==='dp'&&prep>=2) L.push({id:'atendimento',t:'Relato detalhado do assistido',q:'Fatos que só o atendimento revelou.',tipo:'testemunha',fase:'Testemunhas',forca:6+Math.min(6,prep),risco:.15});
  if(prep>=prepIdeal(c)) L.push({id:'peca',t:'Peça impecável',q:'Preparo completo do caso.',tipo:'tese',fase:'Abertura',forca:6,risco:.05});
  if(!L.length) L.push({id:'improviso',t:'Improviso',q:'Sem preparo: só o talento salva.',tipo:'testemunha',fase:'Testemunhas',forca:6,risco:.4});
  return L.slice(0,3); }

function audienciaAoVivo(c){
  if(MODO_TESTE&&!window.__vivo) return Promise.resolve(null); // nos testes automáticos a audiência segue pela fórmula (window.__vivo liga a partida)
  return new Promise(fim=>{
  const papel=papelAud(), ch0=chanceDe(c), d=c.d+10*((c.inst||1)-1);
  const orat=S.skills.oratoria+(S.traits.includes('orador')?8:0);
  const area=papel==='adv'?S.skills[c.area]:S.skills[c.area]||S.skills.penal;
  const NOS={testemunha:Math.round(orat),prova:Math.round(Math.max(S.skills.analise,S.skills.pesquisa*.9)),tese:Math.round(area)};
  if(!c.perfilAdv) c.perfilAdv={testemunha:rint(-6,6),prova:rint(-6,6),tese:rint(-6,6)};
  const advSk=t=>d+c.perfilAdv[t], gap0=Object.keys(NOS).reduce((a,t)=>a+NOS[t]-advSk(t),0)/3;
  const fortAdv=Object.keys(NOS).sort((a,b)=>advSk(b)-advSk(a))[0];
  const JZ=AV_JUIZ[c.juri?'juri':papel==='adv'?c.juiz:'garantista']||AV_JUIZ.garantista;
  const quem=c.juri?'Os jurados':papel==='adv'?c.juizNome:'O juiz';
  const R={adv:['Você',papel==='adv'?ADV[c.adv].nome:''],mp:['Acusação · você','Defesa'],dp:['Defesa · você',c.area==='penal'?'Ministério Público':'Parte contrária']}[papel];
  const cartas=avCartas(c);
  const s={pre:true,escolha:[],min:0,rodando:false,vel:1,conv:ch0*100,ini:Math.round(ch0*100),postura:'equilibrada',foco:Object.keys(NOS).sort((a,b)=>NOS[b]-NOS[a])[0],advPostura:'equilibrada',
    objecoes:2,recessos:1,folego:vip('nervos')?100:S.energia,combo:0,juizVisto:false,sondou:false,acordoEm:0,usadas:{},
    advCartas:[{t:'Prova surpresa da outra parte',forca:6,quando:rint(30,44)},{t:'Testemunha de última hora',forca:5,quando:rint(12,28)}].slice(0,RORD.indexOf(c.rar)>=3?2:1),
    feed:[{m:0,t:`${quem} abre${c.juri?'m':''} a audiência.`,l:'neutro'}],barras:[],ultimo:null,momento:null,feitos:{},fim:false,res:null};
  const lim=v=>Math.max(5,Math.min(95,v)), fase=m=>{ let f='Abertura'; for(const [a,n] of AV_FASES) if(m>=a) f=n; return f; };
  const cans=()=>s.folego<35?-6:s.folego<60?-2:0;
  const skN=t=>NOS[t]+(t===s.foco?10:-4)+cans(), skA=t=>advSk(t)+(t===fortAdv?6:-2);
  const duelo=()=>s.postura===AV_VENCE[s.advPostura]?1:s.advPostura===AV_VENCE[s.postura]?-1:0;
  const lance=(t,l)=>{ s.feed.unshift({m:s.min,t,l}); s.feed=s.feed.slice(0,9); };
  const mexer=(v,l)=>{ s.conv=lim(s.conv+v); if(l==='nos') s.combo=Math.max(1,s.combo+1); else if(l==='eles') s.combo=Math.min(-1,s.combo-1); };
  const chOp=o=>!o[1]?1:Math.max(.1,Math.min(.9,sig((skN(o[1])+o[2]-d)/10)));
  const chAcordo=()=>Math.max(.05,Math.min(.9,sig((s.conv-58)/7)+(S.skills.negociacao-50)/200+(JZ.acordo||0)));
  const box=document.createElement('div'); box.className='av-ov'; box.setAttribute('role','dialog'); box.setAttribute('aria-modal','true'); box.setAttribute('aria-label','Audiência ao vivo');
  document.body.appendChild(box);
  let timer;
  function encerrar(){ clearTimeout(timer); S.energia=clamp(Math.round(s.folego),0,100); box.remove(); fim(s.res); }
  function terminar(texto){ s.fim=true; s.rodando=false; s.res={p:s.conv/100}; lance(texto,'neutro'); }
  // pré-audiência: escolha até 2 testemunhas; cada uma muda a sua skill de um tipo de lance
  const TESTEMUNHAS=[{id:'firme',t:'Testemunha firme',q:'Não se abala com pergunta difícil.',ef:'+6 em testemunhas',tipo:'testemunha',v:6},
    {id:'tecnica',t:'Testemunha técnica',q:'Explica documentos e números.',ef:'+6 em provas',tipo:'prova',v:6},
    {id:'emotiva',t:'Testemunha comovente',q:'Brilha com juízes garantistas e no júri.',ef:'+4 em testemunhas, +4 se quem julga valoriza depoimentos',tipo:'testemunha',v:4,pref:4},
    {id:'arriscada',t:'Testemunha-bomba',q:'Sabe de tudo, mas pode desmoronar.',ef:'+10 em testemunhas · 30% de desmoronar (−8)',tipo:'testemunha',v:10,risco:.3}];
  function comecar(){ for(const id of s.escolha){ const w=TESTEMUNHAS.find(x=>x.id===id); NOS[w.tipo]+=w.v+(w.pref&&JZ.pref==='testemunha'?w.pref:0);
      if(w.risco&&Math.random()<w.risco) s.desmorona=rint(12,28); }
    s.pre=false; lance(s.escolha.length?`Você leva ${s.escolha.length} testemunha${s.escolha.length>1?'s':''} para a audiência.`:'Você vai sem testemunhas próprias.','neutro'); }
  function passo(){
    if(s.desmorona===s.min+1){ s.desmorona=0; mexer(-8,'eles'); lance('A testemunha-bomba desmorona no depoimento (−8).','eles'); }
    if(!s.rodando||s.momento||s.fim) return;
    s.min++; const f=fase(s.min); let dv=0;
    if(AV_MOMENTOS[s.min]&&!s.feitos[s.min]){ s.momento=s.min; s.feitos[s.min]=1; s.rodando=false; return desenhar(); }
    if(s.min%6===0){ let p=s.conv>62?'agressiva':s.conv<38?'cautelosa':'equilibrada'; if(Math.random()<.3) p=pick(Object.keys(AV_POST));
      if(p!==s.advPostura){ s.advPostura=p; lance(`A outra parte muda para postura ${AV_POST[p].t.toLowerCase()}.`,'neutro'); } }
    const PN=AV_POST[s.postura], PA=AV_POST[s.advPostura]; s.folego=Math.max(0,s.folego-PN.gasto*1.4);
    for(const k of s.advCartas) if(!k.usado&&s.min===k.quando){ k.usado=true; const v=k.forca*PA.mag; mexer(-v,'eles'); s.ultimo={v,min:s.min}; lance(`Trunfo da outra parte: ${k.t}.`,'eles'); s.barras.push({m:s.min,d:-v}); return desenhar(); }
    if(f!=='Sentença'&&Math.random()<.34*(PN.freq+PA.freq)/2){
      const W=AV_PESO[f], peso=t=>W[t]*(t===s.foco||t===fortAdv?1.4:1), tipos=Object.keys(NOS), tot=tipos.reduce((a,t)=>a+peso(t),0);
      let r=Math.random()*tot, tipo=tipos[0]; for(const t of tipos){ r-=peso(t); if(r<=0){ tipo=t; break; } }
      const emb=Math.max(-.09,Math.min(.09,.03*s.combo)), irrita=JZ.contra&&s.postura===JZ.contra?-.06:0;
      const pN=Math.max(.08,Math.min(.92,sig((skN(tipo)-skA(tipo)-gap0)/12)+.08*duelo()+emb+irrita));
      const nos=Math.random()<pN, l=nos?'nos':'eles';
      let v=W.mag*(PN.mag+PA.mag)/2*(.7+Math.random()*.6); if(tipo===JZ.pref) v*=nos&&s.foco===tipo?1.5:1.1; v=Math.round(v*10)/10;
      dv=nos?v:-v; mexer(dv,l); s.ultimo=nos?null:{v,min:s.min};
      lance(pick(AV_TXT[tipo][l])+(nos&&tipo===JZ.pref&&s.juizVisto?' Isso pesa para quem julga.':''),l); }
    if(s.min===55) lance(`${quem} encerra${c.juri?'m':''} a instrução.`,'neutro');
    s.barras.push({m:s.min,d:dv});
    if(s.min>=AV_FIM) terminar(`Fim da audiência. ${quem} vai decidir com ${Math.round(s.conv)}% a seu favor.`);
    desenhar(); }
  function agendar(){ clearTimeout(timer); timer=setTimeout(()=>{ passo(); if(!s.fim) agendar(); },700/s.vel); }
  function acao(a,v){
    if(a==='testemunha'){ const i=s.escolha.indexOf(v); if(i>=0) s.escolha.splice(i,1); else if(s.escolha.length<(vip('ouro')?3:2)) s.escolha.push(v); }
    else if(a==='comecar'){ comecar(); s.rodando=true; }
    else if(a==='play'){ if(!s.fim&&!s.momento) s.rodando=!s.rodando; }
    else if(a==='vel'){ s.vel=+v; agendar(); }
    else if(a==='postura') s.postura=v;
    else if(a==='foco') s.foco=v;
    else if(a==='op'){ const o=AV_MOMENTOS[s.momento].ops[+v], ch=chOp(o), deu=Math.random()<ch, dv=deu?o[3]:o[4];
      lance(!o[1]?(o[3]?'Você reforça o que já está provado.':'Você não arrisca.'):deu?`${o[0]}: deu certo.`:`${o[0]}: saiu pela culatra.`,dv>0?'nos':dv<0?'eles':'neutro');
      mexer(dv,dv>0?'nos':dv<0?'eles':null); s.barras.push({m:s.min,d:dv}); s.momento=null; s.rodando=true; }
    else if(a==='carta'){ const k=cartas.find(x=>x.id===v); if(!k||s.usadas[v]||!s.min) return; s.usadas[v]=1;
      const certa=fase(s.min)===k.fase, pref=k.tipo===JZ.pref;
      if(Math.random()<k.risco+(certa?0:.15)){ const x=Math.round(k.forca*.55); mexer(-x,'eles'); s.barras.push({m:s.min,d:-x}); lance(`${k.t}: impugnado pela outra parte (−${x}).`,'eles'); }
      else { const x=Math.round(k.forca*(certa?1:.5)*(pref?1.25:1)); mexer(x,'nos'); s.barras.push({m:s.min,d:x}); lance(`Trunfo: ${k.t}${certa?'':' fora da hora'} (+${x}).`,'nos'); } }
    else if(a==='objecao'&&s.objecoes){ s.objecoes--; const u=s.ultimo, fresco=!!u&&s.min-u.min<=3, pen=c.juiz==='rigoroso'?3:2;
      if(fresco&&Math.random()<sig((skN('prova')-d+8)/10)){ mexer(u.v,'nos'); s.ultimo=null; lance('Objeção acolhida: o último lance da outra parte é desconsiderado.','nos'); }
      else { mexer(-pen,'eles'); lance(fresco?`Objeção indeferida (−${pen}).`:`Objeção sem motivo (−${pen}).`,'eles'); } }
    else if(a==='recesso'&&s.recessos){ s.recessos=0; s.folego=Math.min(100,s.folego+40); s.combo=0; lance('Recesso: você recupera o fôlego e o embalo dos dois lados esfria.','neutro'); }
    else if(a==='sondar'&&!s.sondou){ s.sondou=s.juizVisto=true; s.folego=Math.max(0,s.folego-12); lance(`Você sonda: ${quem.toLowerCase()} ${JZ.txt}.`,'neutro'); }
    else if(a==='acordo'&&papel==='adv'&&s.acordoEm<=s.min){
      if(Math.random()<chAcordo()){ const fr=Math.round(Math.max(.2,Math.min(.85,s.conv/100-.08))*100)/100; s.fim=true; s.rodando=false; s.res={acordo:fr}; lance(`Acordo homologado: ${pct(fr)} do pedido.`,'nos'); }
      else { s.acordoEm=s.min+10; mexer(-3,'eles'); lance('A outra parte recusa o acordo e sente fraqueza (−3).','eles'); } }
    else if(a==='pular'){ // termina pela fórmula sem mexer em nada: o resto da audiência corre sem você
      while(!s.fim){ s.rodando=true; if(s.momento){ s.momento=null; } passo(); } }
    else if(a==='sair') return encerrar();
    desenhar(); }
  box.addEventListener('click',e=>{ const b=e.target.closest('[data-av]'); if(!b||b.disabled) return; acao(b.dataset.av,b.dataset.v); });
  function desenhar(){
    if(s.pre){ box.innerHTML=`<div class="av"><header class="av-placar"><div class="av-lado"><span class="label">${R[0]}</span><b>${esc(S.nome)}</b></div>
      <div class="av-centro"><span class="label av-fase">Pré-audiência · ${esc(c.titulo)}</span><div class="av-relogio">Escalação</div><small>Chance de partida: <b>${s.ini}%</b> · ${quem}${c.juri?' · júri':''}</small></div>
      <div class="av-lado dir"><span class="label">${R[1]||'Outra parte'}</span><b>Dificuldade ${d}</b></div></header>
      <section class="panel"><div class="panel-head"><h2>Quem você leva para depor?</h2><span class="label">até ${vip('ouro')?3:2} · ${s.escolha.length} escolhida${s.escolha.length===1?'':'s'}</span></div>
        <div class="av-cartas">${TESTEMUNHAS.map(w=>`<button class="av-carta ${s.escolha.includes(w.id)?'agora':''}" data-av="testemunha" data-v="${w.id}" aria-pressed="${s.escolha.includes(w.id)}"><b>${w.t}</b><small>${w.q}</small><small class="hi">${w.ef}</small></button>`).join('')}</div></section>
      <section class="panel"><div class="panel-head"><h2>Seus trunfos</h2><span class="label">vêm do preparo · use na fase certa</span></div>
        <div class="av-cartas">${cartas.map(k=>`<div class="av-carta"><b>${k.t}</b><small>${k.q}</small><small>${AV_NOMES[k.tipo]} · +${k.forca} · melhor em ${k.fase.toLowerCase()}</small></div>`).join('')}</div></section>
      <div class="av-ctl" style="max-width:420px"><button class="btn brass" data-av="comecar">Começar a audiência</button></div></div>`; return; }
    const f=fase(s.min), conv=Math.round(s.conv), du=duelo(), parado=s.fim||!!s.momento;
    const corConv=conv>=60?'var(--win)':conv>=40?'var(--warn)':'var(--loss)';
    const barras=s.barras.map(b=>{ const h=Math.min(64,Math.abs(b.d)*6+(b.d?5:2)); return `<i style="left:${b.m/AV_FIM*98.5}%;height:${h}px;top:${b.d>=0?70-h:70}px;background:${b.d>0?'var(--win)':b.d<0?'var(--loss)':'var(--line)'}"></i>`; }).join('');
    box.innerHTML=`<div class="av">
      <header class="av-placar">
        <div class="av-lado"><span class="label">${R[0]}</span><b>${esc(S.nome)}</b><small>Oratória ${NOS.testemunha} · Análise ${NOS.prova} · ${AREAS[c.area]?AREAS[c.area].nome:'Área'} ${NOS.tese}</small></div>
        <div class="av-centro"><span class="label av-fase">${f} · ${esc(c.titulo)}</span><div class="av-relogio num">${String(s.min).padStart(2,'0')}' / ${AV_FIM}'</div>
          <div class="av-cabo" role="img" aria-label="Convicção: ${conv}% a seu favor"><i style="width:${conv}%"></i></div><small>Convicção: <b>${conv}%</b> a seu favor · começou em ${s.ini}%</small></div>
        <div class="av-lado dir"><span class="label">${R[1]||'Outra parte'}</span><b>Dificuldade ${d}</b><small>${quem}${c.juri?' · júri':''}</small></div>
      </header>
      <div class="av-faixa">
        <div class="av-mini"><span class="label">Quem julga</span><span>${s.juizVisto?`${quem} ${JZ.txt}.`:`${quem}: o que valoriza? Sonde ou observe.`}</span></div>
        <div class="av-mini"><span class="label">Seu fôlego · ${Math.round(s.folego)}</span><div class="meter ${s.folego<35?'s':'e'}" style="width:100%"><i style="width:${s.folego}%"></i></div><span>${s.folego<35?'Exausto: −6 nas skills.':s.folego<60?'Cansando: −2 nas skills.':'Inteiro.'}</span></div>
        <div class="av-mini"><span class="label">Embalo</span><span>${s.combo>0?`Você embalou ${s.combo}: +${Math.min(9,3*s.combo)}% no próximo lance.`:s.combo<0?`A outra parte embalou ${-s.combo}: −${Math.min(9,-3*s.combo)}%.`:'Ninguém embalado.'}</span></div>
      </div>
      <div class="av-corpo">
        <section class="panel av-feed"><div class="panel-head"><h2>Lance a lance</h2></div>
          ${s.momento?`<div class="av-momento"><span class="label">Momento decisivo · pausado</span><span>${AV_MOMENTOS[s.momento].t}</span>
            ${AV_MOMENTOS[s.momento].ops.map((o,i)=>`<button class="opt" data-av="op" data-v="${i}"><span>${o[0]}</span><b class="num">${o[1]?`${pct(chOp(o))} · +${o[3]}/${o[4]}`:o[3]?'+'+o[3]:'±0'}</b></button>`).join('')}</div>`:''}
          ${s.feed.map(x=>`<div class="av-ev ${x.l}"><span class="num">${x.m}'</span><span>${x.t}</span></div>`).join('')}</section>
        <section class="av-meio">
          <div class="panel"><div class="panel-head"><h2>Trunfos</h2><span class="label">uma vez cada · melhor na fase certa</span></div>
            <div class="av-cartas">${cartas.map(k=>{ const certa=f===k.fase; return `<button class="av-carta ${certa&&!s.usadas[k.id]?'agora':''}" data-av="carta" data-v="${k.id}" ${s.usadas[k.id]||parado||!s.min?'disabled':''}><b>${k.t}</b><small>${k.q}</small><small>${AV_NOMES[k.tipo]} · +${k.forca} · risco ${pct(k.risco)}</small><small class="${certa?'hi':''}">${s.usadas[k.id]?'usado':certa?'hora certa: agora':'melhor em '+k.fase.toLowerCase()}</small></button>`; }).join('')}</div></div>
          <div class="panel"><div class="panel-head"><h2>Pressão</h2><span class="label">acima: você · abaixo: a outra parte</span></div><div class="av-pressao">${barras}</div></div>
          <div class="panel av-chance"><span class="label">Chance agora</span><strong style="color:${corConv}">${conv}%</strong>
            ${s.fim?`<div class="verdict ${s.res&&s.res.acordo?'mid':''}">${s.res&&s.res.acordo?'Acordo':'Encerrada'}</div><button class="btn brass" data-av="sair">${s.res&&s.res.acordo?'Continuar':'Ver o veredito'}</button>`:''}</div>
        </section>
        <section class="panel av-instr"><h2>Instruções</h2>
          <span class="label">Postura</span><div class="av-pills">${Object.entries(AV_POST).map(([k,p])=>`<button class="tab ${s.postura===k?'on':''}" data-av="postura" data-v="${k}" aria-pressed="${s.postura===k}">${p.t}</button>`).join('')}</div>
          <small class="${du>0?'hi':du<0?'lo':''}">Outra parte: ${AV_POST[s.advPostura].t.toLowerCase()}. ${du>0?'Sua postura vence: +8% por lance.':du<0?'A dela vence a sua: −8% por lance.':'Empate.'} Cautelosa vence agressiva, agressiva vence equilibrada, equilibrada vence cautelosa.</small>
          <span class="label">Foco · você × outra parte</span><div class="av-focos">${Object.keys(NOS).map(k=>`<button class="tab ${s.foco===k?'on':''}" data-av="foco" data-v="${k}" aria-pressed="${s.foco===k}"><span>${AV_NOMES[k]}${s.juizVisto&&JZ.pref===k?' ★':''}</span><b class="num">${skN(k)} × ${skA(k)}</b></button>`).join('')}</div>
          <span class="label">Ações</span><div class="av-acoes">
            <button class="btn ghost" data-av="objecao" ${!s.objecoes||parado?'disabled':''} title="Logo depois de um lance contrário: pode anulá-lo. Indeferida custa 2.">Objeção · ${s.objecoes}</button>
            <button class="btn ghost" data-av="recesso" ${!s.recessos||parado?'disabled':''} title="+40 de fôlego e zera o embalo dos dois lados.">Recesso · ${s.recessos}</button>
            <button class="btn ghost" data-av="sondar" ${s.sondou||parado?'disabled':''} title="−12 de fôlego: revela o que quem julga valoriza.">${s.sondou?'Sondado':'Sondar quem julga'}</button>
            ${papel==='adv'?`<button class="btn ghost" data-av="acordo" ${s.acordoEm>s.min||parado||!s.min?'disabled':''} title="Aceito com mais facilidade quando a outra parte está perdendo (${pct(chAcordo())} agora). Recusa custa 3.">${s.acordoEm>s.min?`Acordo · ${s.acordoEm-s.min}'`:'Propor acordo'}</button>`:''}
          </div>
          <div class="av-ctl"><button class="btn brass" data-av="play" ${parado?'disabled':''}>${s.fim?'Encerrada':s.momento?'Escolha o lance':s.rodando?'Pausar':s.min?'Continuar':'Iniciar audiência'}</button>
            ${[1,2,4].map(v=>`<button class="tab ${s.vel===v?'on':''}" data-av="vel" data-v="${v}">${v}×</button>`).join('')}</div>
          <button class="lnk" data-av="pular" ${s.fim?'disabled':''}>Pular: deixar a audiência correr sozinha até o fim</button>
        </section>
      </div></div>`; }
  desenhar(); agendar();
  }); }
