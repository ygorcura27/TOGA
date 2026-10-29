// ===================== AMIGOS E RIVAIS DA FACULDADE =====================
const NPC_CAR={
  adv:['Advogado','Advogado sênior','Sócio de escritório','Sócio-fundador de banca famosa'],
  juiz:['Juiz substituto','Juiz titular','Desembargador','Ministro do STJ'],
  promotor:['Promotor substituto','Promotor de Justiça','Procurador de Justiça','Procurador-Geral de Justiça'],
  defensor:['Defensor substituto','Defensor público','Defensor de classe especial','Defensor-Geral'],
  academico:['Mestrando','Doutor em Direito','Professor associado','Professor titular'],
};
const FEM2={Advogado:'Advogada','Sócio':'Sócia',fundador:'fundadora',substituto:'substituta','público':'pública',associado:'associada',Doutor:'Doutora',Juiz:'Juíza',Promotor:'Promotora',Procurador:'Procuradora',Defensor:'Defensora',Desembargador:'Desembargadora',Ministro:'Ministra',Mestrando:'Mestranda',Professor:'Professora'};
const femG=(t,g)=>g==='f'?String(t).replace(/(Advogado|Sócio|fundador|substituto|público|associado|Doutor|Juiz|Promotor|Procurador|Defensor|Desembargador|Ministro|Mestrando|Professor)(?![a-zçãáéíóú])/g,w=>FEM2[w]):t;
const npcPor=id=>(S.npcs||[]).find(n=>n.id===id);
const npcTipo=n=>!n?'':n.rel>=20?'amigo':n.rel<=-20?'rival':'conhecido';
const npcTipoTxt=n=>{ const t=npcTipo(n); return t==='amigo'?(n.genero==='f'?'amiga':'amigo'):t==='rival'?'rival':(n.genero==='f'?'conhecida':'conhecido'); };
const npcCargo=n=>n.nivel<0?(n.genero==='f'?'Estudante de Direito':'Estudante de Direito'):femG(NPC_CAR[n.car][n.nivel],n.genero);
function criarColegas(){ const cars=['adv','adv','juiz','promotor','defensor','academico'];
  S.npcs=[60,45,-45,-30].map(rel=>{ const g=Math.random()<.5?'m':'f'; return {id:++uid,nome:nomeGenero(g),genero:g,rel,car:pick(cars),nivel:0,cidade:Math.random()<.7?S.sede:pick(Object.keys(CIDADES)),acao:0}; }); }
function npcTag(id){ const n=npcPor(id); if(!n) return ''; const t=npcTipo(n); return ` · <span class="${t==='rival'?'lo':t==='amigo'?'hi':''}">${esc(n.nome.split(' ')[0])}, ${npcTipoTxt(n)} da faculdade</span>`; }
function marcarNPC(c){ const ns=(S.npcs||[]).filter(n=>n.nivel>=0&&n.cidade===c.cidade);
  const j=ns.find(n=>n.car==='juiz'&&n.nivel<=1&&npcTipo(n)!=='conhecido'); if(j&&Math.random()<.15){ c.npcJuiz=j.id; c.juizNome=femG('Juiz',j.genero)+' '+j.nome; }
  const opp=ns.filter(n=>(c.area==='penal'?['promotor','defensor']:['adv']).includes(n.car)&&npcTipo(n)!=='conhecido'); if(opp.length&&Math.random()<.15) c.npcAdv=pick(opp).id; }
function indicacoes(of){ for(const n of (S.npcs||[])) if(n.car==='adv'&&n.nivel>=0&&n.rel>=50&&Math.random()<.15){ const c=casoEsc(S.sede); c.indicadoPor=n.nome; of.push(c); } }
function bonusNPC(c,add){ if(c.indicadoPor) add('Indicação de colega',3);
  if(c.npcJuiz){ const n=npcPor(c.npcJuiz); if(npcTipo(n)==='rival') add('Juiz é seu desafeto',-4); else if(c.amizadeOculta) add('Juiz amigo (amizade não declarada)',4); }
  if(c.npcAdv&&npcTipo(npcPor(c.npcAdv))==='rival') add('Rival do outro lado',-3); }
async function eticaAmigoJuiz(c){ const n=npcPor(c.npcJuiz);
  const v=await modal(`<h2>O juiz é seu amigo</h2><p>${esc(n.nome)}, ${npcTipoTxt(n)} desde a faculdade, é quem vai julgar “${esc(c.titulo)}”. Amizade íntima com o advogado pode tornar o juiz suspeito.</p><div class="opts">
    <button class="opt" data-mv="declarar"><span>Declarar a amizade</span><b class="num">ética</b><small>O processo vai para outro juiz. +2 de integridade.</small></button>
    <button class="opt" data-mv="calar"><span>Não dizer nada</span><b class="num">+4</b><small>+4 de chance no caso, −8 de integridade e risco de a imprensa descobrir.</small></button></div>`,[]);
  c.etica=true;
  if(v==='declarar'){ c.npcJuiz=null; c.juizNome=pick(JNOMES); S.integ=clamp(S.integ+2,0,100); }
  else { c.amizadeOculta=true; S.integ=clamp(S.integ-8,0,100); if(Math.random()<.15){ S.prest=clamp(S.prest-5,0,100); addLog('A imprensa revelou a sua amizade com o juiz do caso. −5 de prestígio.','r'); } }
  if(S.casos.length<maxCasos()){ S.casos.push(c); S.ofertas=S.ofertas.filter(x=>x.id!==c.id); addLog(`Aceitou “${c.titulo}” (${RAR[c.rar].nome}, ${brl(c.valor)}).`); }
  salvar(); render(); }
async function semanaAmigos(){ const N=S.npcs||[]; if(!N.length) return;
  for(const n of N){ n.rel+= n.rel>0?-.4:n.rel<-20?.2:0; n.rel=clamp(n.rel,-100,100);
    if(n.nivel>=0&&n.nivel<3&&Math.random()<.012){ n.nivel++; addLog(`${n.nome} agora é ${npcCargo(n).toLowerCase()}.`); } }
  if(Math.random()>.1) return;
  const n=pick(N), t=npcTipo(n), pn=esc(n.nome.split(' ')[0]), pub=['juiz','promotor','defensor'].includes(S.carreira);
  if(t==='amigo'&&pub&&n.car==='adv'&&n.nivel>=0){
    const v=await modal(`<h2>Pedido de ${pn}</h2><p>${esc(n.nome)}, ${npcTipoTxt(n)} da faculdade e hoje ${npcCargo(n).toLowerCase()}, pede que você “dê uma olhada com carinho” num processo de um cliente.</p>`,[{t:'Recusar',v:0,cls:'ghost'},{t:'Ajudar',v:1}]);
    if(v){ n.rel+=15; S.integ=clamp(S.integ-10,0,100); if(Math.random()<.2){ S.prest=clamp(S.prest-6,0,100); addLog(`Vazou o favor que você fez para ${n.nome}. −6 de prestígio.`,'r'); } } else { n.rel-=15; S.integ=clamp(S.integ+2,0,100); } }
  else if(t==='amigo'&&n.car==='academico'&&n.nivel>=1){
    const v=await modal(`<h2>Convite de ${pn}</h2><p>${esc(n.nome)} convida você para escrever um artigo em coautoria.</p>`,[{t:'Agora não',v:0,cls:'ghost'},{t:'Aceitar (−1 bloco)',v:1,cls:'brass'}]);
    if(v){ S.vida.falta=(S.vida.falta||0)+1; n.rel+=8; S.ac.indice+=2; S.ac.pubs.push({tipo:'artigo',titulo:tituloPesquisa(S.espec),qualis:'A2',pts:2,semana:S.semana}); S.prest=clamp(S.prest+1,0,100); addLog(`Artigo em coautoria com ${n.nome} publicado.`,'g'); } }
  else if(t==='amigo'){
    const v=await modal(`<h2>${pn} chamou para almoçar</h2><p>${esc(n.nome)}, ${npcCargo(n).toLowerCase()}, quer colocar a conversa em dia e apresentar gente importante.</p>`,[{t:'Não dá',v:0,cls:'ghost'},{t:'Ir (−1 bloco)',v:1,cls:'brass'}]);
    if(v){ S.vida.falta=(S.vida.falta||0)+1; n.rel+=10; S.prest=clamp(S.prest+1,0,100); S.vida.felicidade=clamp(S.vida.felicidade+3,0,100); } else n.rel-=4; }
  else if(t==='rival'&&S.prest>=25){ const ch=clamp(sig((S.skills.oratoria-40)/10),.05,.95);
    const v=await modal(`<h2>${pn} provocou você</h2><p>${esc(n.nome)}, seu rival desde a faculdade, criticou o seu trabalho numa entrevista.</p><div class="opts">
      <button class="opt" data-mv="resp"><span>Responder em público</span><b class="num">${pct(ch)}</b><small>Usa Oratória. Sucesso +2 de prestígio; falha −2.</small></button>
      <button class="opt" data-mv="ign"><span>Ignorar</span><b class="num">−1</b><small>−1 de prestígio.</small></button></div>`,[]);
    if(v==='resp'){ if(Math.random()<ch){ S.prest=clamp(S.prest+2,0,100); addLog(`Você respondeu bem a ${n.nome}.`,'g'); } else { S.prest=clamp(S.prest-2,0,100); addLog(`A resposta a ${n.nome} pegou mal.`,'r'); } n.rel-=5; }
    else S.prest=clamp(S.prest-1,0,100); }
}
async function acaoNPC(id,tipo){ const n=npcPor(id); if(!n||ocupado||n.acao===S.semana) return; n.acao=S.semana;
  if(tipo==='almoco'){ pagarPessoal(200); n.rel+=8; addLog(`Almoço com ${n.nome}.`,'g'); }
  if(tipo==='pazes'){ ocupado=true; let ok; try{ ok=await rolar(`Fazer as pazes com ${esc(n.nome.split(' ')[0])}`,'Negociação e Oratória contam.',clamp(sig(((S.skills.negociacao+S.skills.oratoria)/2-45)/10),.05,.95),'Vocês se acertaram','Não deu'); } finally{ ocupado=false; }
    n.rel+=ok?35:-5; addLog(ok?`Você fez as pazes com ${n.nome}.`:`${n.nome} não quis conversa.`,ok?'g':'r'); }
  n.rel=clamp(n.rel,-100,100); salvar(); render(); }
function painelAmigos(){ const N=S.npcs||[]; if(!N.length) return '';
  return `<section class="panel"><div class="panel-head"><h2>Amigos e rivais da faculdade</h2></div>
    <div class="cases">${N.map(n=>{ const t=npcTipo(n), w=(n.rel+100)/2;
      return `<div class="panel" style="gap:6px"><b>${esc(n.nome)}</b><span class="label" style="text-transform:none;letter-spacing:0">${npcCargo(n)} · ${CIDADES[n.cidade].nome} · <span class="${t==='rival'?'lo':t==='amigo'?'hi':''}">${npcTipoTxt(n)}</span></span>
        <div class="vs"><span>Relação</span><div class="bar"><i style="width:${w}%;background:${t==='rival'?'var(--loss)':'var(--win)'}"></i></div><span class="num">${Math.round(n.rel)}</span></div>
        <div class="chips">${t==='rival'?`<button class="chip" data-act="npc" data-id="${n.id}" data-v="pazes" ${n.acao===S.semana?'disabled':''}>Tentar fazer as pazes</button>`:`<button class="chip" data-act="npc" data-id="${n.id}" data-v="almoco" ${n.acao===S.semana||dinheiroPessoal()<200?'disabled':''}>Almoçar · ${brl(200)}</button>`}</div></div>`; }).join('')}</div>
    <p style="margin:0;font-size:12px;color:var(--muted)">Colegas seguem carreiras próprias e reaparecem: como juízes e adversários nos seus casos, indicando clientes, pedindo favores ou provocando você na imprensa.</p>
  </section>`; }

