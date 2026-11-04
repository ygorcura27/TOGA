// ===================== CORRUPÇÃO E CÓPIA DE SEGURANÇA =====================
// Juiz pego com propina é demitido, mas pode voltar a advogar (com a ficha suja: prestígio menor e quarentena longa).
// Advogado que usa atalho antiético e é pego pode ser preso: aí a carreira acaba, mas a família pode seguir com um filho adulto.
// Toda partida encerrada fica guardada como cópia: a tela inicial oferece "Recuperar a última partida".
async function demissaoCorrupcao(){
  const cargo=nomeCargo(S.j.cargo), com=comarcaAtual(), novoP=clamp(Math.round(S.prest*.5),10,100);
  S.ficha=(S.ficha||0)+1; S.integ=clamp(S.integ-20,0,100);
  await modal(`<h2 class="lo">Demitido por corrupção</h2><p>A corregedoria descobriu a propina. Você perdeu o cargo de ${esc(cargo)} e responde a processo administrativo, mas continua inscrito na OAB e pode voltar a advogar.</p>
    <dl class="meta"><dt>Prestígio na advocacia</dt><dd class="num lo">${novoP}</dd><dt>Integridade</dt><dd class="num lo">${Math.round(S.integ)}</dd><dt>Quarentena</dt><dd>24 meses com −5 em casos de ${CIDADES[com].nome}</dd>
    <dt>Ficha</dt><dd class="lo">se for pego de novo em corrupção, como advogado, pode ser preso</dd></dl>`,[{t:'Abrir escritório',v:1,cls:'brass'}]);
  S.ex={cargo,comarca:com,ate:S.semana+24,corrupcao:true}; S.carreira='adv'; S.u=estruturaInicial(false); S.bolso=Math.round(S.caixa/2); S.caixa-=S.bolso; S.sede=com; S.filiais=[]; S.casos=[]; S.aReceber=0; S.prest=novoP;
  S.agenda.estudo=0; S.agenda.lazer=0; gerarOfertas(); view='escritorio';
  addLog(`Demitido por corrupção, você voltou à advocacia em ${CIDADES[com].nome}.`,'r'); salvar(); }
// prisão do advogado: depois de um escândalo por atalho antiético
function chancePrisao(){ return clamp(.12+.25*(S.ficha||0)+(S.integ<30?.15:0),0,.8); }
{ const a0=audiencia; audiencia=async function(c){ const r=await a0(c);
    if(S&&S.carreira==='adv'&&c._escandalo&&Math.random()<chancePrisao()){ S.fimPrisao=true; addLog(`O atalho em “${c.titulo}” virou inquérito: você foi preso por corrupção.`,'r'); }
    return r; }; }
{ const f0=fimSemana; fimSemana=async function(){ const r=await f0(); if(S&&S.fimPrisao&&!ocupado){ S.fimPrisao=false; ocupado=true; try{ await fimVida('prisao'); } finally{ ocupado=false; } render(); } return r; }; }
// texto do fim por prisão no legado (fimVida monta o texto a partir do motivo)
{ const m0=fimVida; fimVida=async function(motivo){ if(motivo!=='prisao') return m0(motivo);
    const nome=S.nome, id=idade(); await modal(`<h2 class="lo">Preso por corrupção</h2><p>${esc(nome)} foi condenado aos ${id} anos e perdeu a inscrição na OAB. A carreira acaba aqui${S.vida.filhos.some(f=>idadeFilho(f)>=22&&f.rel>=40)?', mas a família pode seguir com um dos filhos':''}.</p>`,[{t:'Continuar',v:1}]);
    return m0('prisao'); }; }
// ---------- cópia de segurança ----------
const BACKUP='toga-backup';
{ const a0=apagarSave; apagarSave=function(){ try{ const r=localStorage.getItem('toga-proto'); if(r) localStorage.setItem(BACKUP,JSON.stringify({em:Date.now(),save:r})); }catch(e){} a0(); }; }
function backupLer(){ try{ const r=localStorage.getItem(BACKUP); return r?JSON.parse(r):null; }catch(e){ return null; } }
function recuperarBackup(){ const b=backupLer(); if(!b) return; let era=null; try{ const s=JSON.parse(b.save); era=s.fim; s.fim=null; s.fimPrisao=false; S=s; salvar(); localStorage.removeItem(BACKUP); }catch(e){ return; }
  addLog('Partida recuperada da cópia de segurança.','g');
  if(era==='cassado'&&S.carreira==='juiz'){ demissaoCorrupcao().then(()=>render()); return; } // demissão por corrupção agora volta à advocacia
  render(); }
{ const r0=renderInicio; renderInicio=function(){ r0(); const b=backupLer(); if(!b) return; let nome='', mes='';
    try{ const s=JSON.parse(b.save); nome=s.nome; mes=s.semana; }catch(e){ return; }
    const sec=app.querySelector('section.panel'); if(!sec) return;
    sec.insertAdjacentHTML('afterbegin',`<div class="gx-lock" style="margin-bottom:4px"><b>Última partida encerrada</b><p class="gx-nt">${esc(nome)} · mês ${mes} · encerrada em ${new Date(b.em).toLocaleDateString('pt-BR')}. Você pode voltar a ela de onde parou.</p><div class="chips"><button class="btn brass" data-act="recuperarBackup">Recuperar a última partida</button></div></div>`); }; }
document.addEventListener('click',e=>{ const b=e.target.closest('[data-act=recuperarBackup]'); if(!b) return; recuperarBackup(); });
// ---------- cópia no servidor (quem joga conectado) ----------
let encerradoNuvem=null, buscouNuvem=false;
async function buscarEncerradoNuvem(){ const o=ON(); if(buscouNuvem||!o||!o.logado||!o.ultimoEncerrado) return; buscouNuvem=true;
  const r=await o.ultimoEncerrado(); if(r&&r.data){ encerradoNuvem=r; if(!S) render(); } }
function recuperarNuvem(){ const r=encerradoNuvem; if(!r) return; let era=null;
  try{ const s=JSON.parse(r.data); era=s.fim; s.fim=null; s.fimPrisao=false; S=s; }catch(e){ return; }
  encerradoNuvem=null; addLog('Partida recuperada da cópia guardada na nuvem.','g');
  if(era==='cassado'&&S.carreira==='juiz'){ demissaoCorrupcao().then(()=>{ salvar(); render(); }); return; }
  salvar(); render(); }
// ---------- reconstruir uma vida a partir do Hall da Fama ----------
// para vidas encerradas antes de existir a cópia de segurança: recria o personagem com o que o Hall guardou
// (nome, idade, prestígio e patrimônio). Casos, equipe e família recomeçam. Volta como advogado, com a ficha
// de quem deixou o cargo público por corrupção.
const ESPEC_CARREIRA=t=>/Federal|TRF|Tributári/i.test(t)?'tributario':/Trabalho|TRT|TST/i.test(t)?'trabalho':/Criminal|Promotor|Procurador/i.test(t)?'penal':'civel';
function reconstruirVida(v){ const espec=ESPEC_CARREIRA(v.carreira), traits=Object.keys(TRAITS).filter(k=>!TRAITS[k].neg).slice(0,2);
  novoJogo(v.nome,espec,traits,'sp'); S.genero=v.genero||'m'; S.vida.idade0=Math.max(25,v.idade||30); S.vida.ultimoAniv=S.vida.idade0;
  const pub=/Juiz|Desembargador|Ministro|Promotor|Procurador|Defensor/i.test(v.carreira);
  if(pub){ for(const a in AREAS) S.skills[a]=82; S.skills[espec]=88; S.skills.oratoria=92; S.skills.escrita=85; S.skills.analise=85; S.skills.recursos=55; S.skills.pesquisa=55; S.skills.negociacao=50; S.semanaFormatura=-36; }
  const pat=Math.max(0,v.patrimonio||0); S.vida.inv.rf.v=Math.round(pat*.9); S.vida.inv.rf.ap=S.vida.inv.rf.v; S.bolso=Math.round(pat*.1); S.caixa=30000;
  S.prest=clamp(Math.round((v.prest||20)*(pub?.5:1)),10,100);
  if(pub){ S.ficha=1; S.integ=55; S.ex={cargo:v.carreira,comarca:'sp',ate:S.semana+24,corrupcao:true}; }
  S.reconstruida={de:v.nome,data:v.data}; S.log=[]; addLog(`Vida reconstruída a partir do Hall da Fama: ${v.nome}, ex-${(v.carreira||'').toLowerCase()}, recomeça na advocacia em São Paulo.`,'g');
  view='escritorio'; salvar(); render(); }
let vidasHall=[];
async function listarVidasHall(){ const loc=hallLer().vidas.filter(v=>v.motivo==='encerrada').map(v=>({...v,onde:'neste navegador'}));
  let on=[]; const o=ON(); if(o&&o.topHall){ try{ on=(await o.topHall()).filter(v=>v.meu&&v.motivo==='encerrada').map(v=>({...v,onde:'na sua conta'})); }catch(e){} }
  const vistas=new Set(), L=[]; for(const v of [...on,...loc]){ const k=v.nome+'|'+v.data+'|'+v.carreira; if(vistas.has(k)) continue; vistas.add(k); L.push(v); }
  vidasHall=L.slice(0,4); if(!S) { const box=document.getElementById('reconstruir'); if(box) box.innerHTML=htmlReconstruir(); } }
const htmlReconstruir=()=>vidasHall.length?`<span class="label">Reconstruir uma vida encerrada</span><p class="gx-nt">Para partidas que acabaram antes da cópia de segurança: recria o personagem com nome, idade, prestígio e patrimônio do Hall da Fama. Casos, equipe e família recomeçam.</p>
  <div class="opts">${vidasHall.map((v,i)=>`<button class="opt" data-act="reconstruir" data-i="${i}"><span>${esc(v.nome)}</span><b class="num">${v.idade} anos</b><small>${esc(v.carreira)} · prestígio ${v.prest} · ${brl(v.patrimonio)} · encerrada em ${v.data} · ${v.onde}</small></button>`).join('')}</div>`:'';
{ const r0=renderInicio; renderInicio=function(){ r0(); const sec=app.querySelector('section.panel'); if(!sec) return;
    if(!backupLer()&&encerradoNuvem){ let nome='',mes=''; try{ const s=JSON.parse(encerradoNuvem.data); nome=s.nome; mes=s.semana; }catch(e){}
      sec.insertAdjacentHTML('afterbegin',`<div class="gx-lock" style="margin-bottom:4px"><b>Última partida encerrada (na nuvem)</b><p class="gx-nt">${esc(nome)} · mês ${mes}. Guardada na sua conta quando acabou.</p><div class="chips"><button class="btn brass" data-act="recuperarNuvem">Recuperar a última partida</button></div></div>`); }
    sec.insertAdjacentHTML('beforeend',`<div id="reconstruir" style="display:grid;gap:8px">${htmlReconstruir()}</div>`);
    buscarEncerradoNuvem(); if(!vidasHall.length) listarVidasHall(); }; }
document.addEventListener('click',e=>{ const b=e.target.closest('[data-act=recuperarNuvem],[data-act=reconstruir]'); if(!b) return;
  if(b.dataset.act==='recuperarNuvem') return recuperarNuvem();
  const v=vidasHall[+b.dataset.i]; if(v) reconstruirVida(v); });
