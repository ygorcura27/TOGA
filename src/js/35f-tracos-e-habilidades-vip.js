// ===================== EFEITOS DOS TRAÇOS NOVOS E HABILIDADES VIP =====================
const traco=k=>!!S&&(S.traits||[]).includes(k);
{ const b0=bonusPerks; bonusPerks=function(c,add){ b0(c,add);
    if(traco('memoria')&&RORD.indexOf(c.rar)>=2) add('Memória fotográfica',3);
    if(traco('tecnico')&&['tributario','empresarial'].includes(c.area)) add('Técnico',4);
    if(traco('calmo')&&S.estresse>70) add('Sangue frio (anula o estresse)',8);
    if(traco('perfeccionista')&&(c.prep||0)+(c.semana||0)+(c.estudo||0)>=prepIdeal(c)) add('Perfeccionista (preparo completo)',4);
    if(traco('procrastinador')) add('Procrastinador',-3);
    if(traco('briguento')&&(c.juri||c.area==='penal')) add('Briguento (penal e júri)',3); }; }
{ const a0=chanceAcordo; chanceAcordo=function(c){ return Math.max(.05,a0(c)-(traco('briguento')?.15:0)); }; }
function mesTracos(){
  if(traco('resiliente')) S.estresse=clamp(S.estresse-3,0,100);
  if(traco('perfeccionista')) S.estresse=clamp(S.estresse+2,0,100);
  if(traco('gastador')) pagarPessoal(600);
  if(traco('insone')) S.energia=Math.min(85,S.energia);
  if(traco('networker')&&S.carreira!=='adv') S.pol=clamp((S.pol??10)+1,0,100); }
{ const g0=gerarOfertas; gerarOfertas=function(){ g0(); if(S.carreira!=='adv') return;
    if(traco('networker')) S.ofertas.push(casoEsc(S.sede));
    if(vip('banca')) S.ofertas.push(casoEsc(S.sede)); }; }

// ---------- Habilidades VIP: desbloqueadas jogando, valem para todas as partidas seguintes ----------
const VIP=[
  {id:'faro',nome:'Faro para mentira',desc:'Juiz: perguntas às testemunhas acertam 10% mais.',req:'Acertar a verdade em 5 audiências presididas',cont:'acertos',alvo:5},
  {id:'ouro',nome:'Testemunha de ouro',desc:'Pré-audiência: leve até 3 testemunhas.',req:'Vencer 10 audiências ao vivo',cont:'vivoVit',alvo:10},
  {id:'nervos',nome:'Nervos de aço',desc:'Toda audiência ao vivo começa com fôlego 100.',req:'Vencer ao vivo um caso que começou abaixo de 30%',cont:'viradaBaixa',alvo:1},
  {id:'labia',nome:'Lábia de corredor',desc:'Articular apoio rende 50% mais capital político.',req:'Chegar a 70 de capital político',cont:'pol70',alvo:1},
  {id:'pena',nome:'Pena de ouro',desc:'Coluna de opinião: +20% de chance de ser bem recebida.',req:'Publicar 5 colunas bem recebidas',cont:'colunas',alvo:5},
  {id:'banca',nome:'Carteira de elite',desc:'Advocacia: 1 oferta de caso a mais por mês.',req:'Chegar ao escritório nacional',cont:'nacional',alvo:1},
  {id:'memoria',nome:'Memória institucional',desc:'Cada partida nova começa com +5 em todas as áreas do Direito.',req:'Encerrar uma carreira e entrar no Hall da Fama',cont:'hall',alvo:1},
  {id:'herdeiro',nome:'Nome de família',desc:'Herdeiros da dinastia começam com +10 de prestígio.',req:'Chegar à 2ª geração da dinastia',cont:'geracao',alvo:1},
];
function vipLer(){ try{ const r=JSON.parse(localStorage.getItem('toga-vip')||'null'); if(r&&r.cont) return r; }catch(e){} return {cont:{},ids:{}}; }
function vipSalvar(V){ try{ localStorage.setItem('toga-vip',JSON.stringify(V)); }catch(e){} }
const vip=id=>!!vipLer().ids[id];
function vipConta(k,n=1,abs){ const V=vipLer(); V.cont[k]=abs?Math.max(V.cont[k]||0,n):(V.cont[k]||0)+n;
  for(const h of VIP) if(!V.ids[h.id]&&(V.cont[h.cont]||0)>=h.alvo){ V.ids[h.id]=true;
    if(S){ addLog(`Habilidade VIP desbloqueada: ${h.nome}. ${h.desc}`,'g'); noticia('perfil',`${S.nome} conquista “${h.nome}”`,h.desc,2,'trofeu'); }
    let box=document.getElementById('toasts'); if(!box){ box=document.createElement('div'); box.id='toasts'; document.body.appendChild(box); }
    const t=document.createElement('div'); t.className='toast'; t.style.setProperty('--tc','var(--gold)'); t.innerHTML=`<span class="label">Habilidade VIP</span><b>${esc(h.nome)}</b><small>${esc(h.desc)}</small>`;
    box.appendChild(t); setTimeout(()=>t.classList.add('sai'),4500); setTimeout(()=>t.remove(),5000); }
  vipSalvar(V); }
// contadores: audiências, colunas e marcos de carreira
{ const d0=depoisDoVeredito; depoisDoVeredito=function(c,ganhou){ const vivo=c._vivoFim!==undefined, ini=c._vivoIni; d0(c,ganhou);
    if(vivo&&ganhou){ vipConta('vivoVit'); if(ini<.3) vipConta('viradaBaixa'); } }; }
{ const a0=audienciaJuizSe; audienciaJuizSe=async function(p){ const r=await a0(p); if(r&&r.recMais===0) vipConta('acertos'); return r; }; }
{ const c0=escreverColuna; escreverColuna=function(){ const p0=S.prest; c0(); if(S.prest>p0) vipConta('colunas'); }; }
{ const a0=articular; articular=function(){ const p0=S.pol??10; a0(); if(vip('labia')&&(S.pol??10)>p0) S.pol=clamp(S.pol+((S.pol-p0)*.5),0,100); }; }
{ const h0=hallRegistrar; hallRegistrar=function(...a){ vipConta('hall'); return h0(...a); }; }
function mesVip(){
  if(capPol()>=70) vipConta('pol70',1,true);
  if(S.carreira==='adv'&&tierEscritorio()>=3) vipConta('nacional',1,true);
  if(S.vida&&S.vida.geracao>=2) vipConta('geracao',1,true);
  if(vip('memoria')&&!S.vipMemoria){ S.vipMemoria=true; for(const k in AREAS) S.skills[k]=Math.min(tetoArea(k),S.skills[k]+5); addLog('Memória institucional: +5 em todas as áreas do Direito.','g'); }
  if(vip('herdeiro')&&S.vida&&S.vida.geracao>=2&&!S.vipHerdeiro){ S.vipHerdeiro=true; S.prest=clamp(S.prest+10,0,100); addLog('Nome de família: +10 de prestígio para o herdeiro.','g'); } }
{ const r0=render; render=function(){ if(S&&!S.fim&&S.mesTraco!==S.semana){ const primeiro=S.mesTraco===undefined; S.mesTraco=S.semana; if(!primeiro) mesTracos(); mesVip(); } r0(); }; }
{ const c0=renderConquistas; renderConquistas=function(){ c0(); const V=vipLer();
    app.insertAdjacentHTML('beforeend',`<section class="panel vip"><div class="panel-head"><h2>Habilidades VIP</h2><span class="label">${Object.keys(V.ids).length} de ${VIP.length} · valem para todas as partidas</span></div>
      <div class="cqs">${VIP.map(h=>{ const ok=V.ids[h.id], c=Math.min(h.alvo,V.cont[h.cont]||0); return `<div class="cq ${ok?'on':''}" style="--tc:var(--gold)"><div class="cq-top"><b>${h.nome}</b><span class="num">${ok?'ativa':`${c}/${h.alvo}`}</span></div><small>${h.desc}</small><small>${ok?'Desbloqueada.':h.req}</small></div>`; }).join('')}</div></section>`); }; }
