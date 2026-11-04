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
