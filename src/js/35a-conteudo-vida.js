// ===================== MAIS VIDA: EVENTOS, BENS, ESTILO E SOM =====================
// mais imóveis e carros (acrescentados ao fim das listas para não mexer nos saves; a tela mostra em ordem de preço)
MORADIAS.push({nome:'Studio no centro',preco:180000,fel:.5},{nome:'Apartamento de 3 quartos',preco:550000,fel:1.5},{nome:'Casa em condomínio fechado',preco:1600000,fel:2.5},{nome:'Mansão',preco:8000000,fel:4});
CARROS.push({nome:'Hatch usado',preco:35000,fel:.3,prest:0},{nome:'Picape cabine dupla',preco:280000,fel:1.2,prest:1},{nome:'Elétrico premium',preco:650000,fel:2,prest:3},{nome:'Sedã blindado com motorista',preco:900000,fel:2,prest:3},{nome:'Superesportivo',preco:3500000,fel:3.5,prest:6});

// estilo: ternos, roupas e relógios dão imagem pessoal (chance nos casos com empresas e júris, felicidade e prestígio na compra)
const ESTILO={
  terno:{nome:'Ternos',itens:[{n:'Ternos de loja',p:0,img:0},{n:'Ternos sob medida',p:8000,img:1},{n:'Alfaiataria italiana',p:30000,img:2}]},
  roupa:{nome:'Guarda-roupa',itens:[{n:'Básico',p:0,img:0},{n:'Executivo',p:15000,img:1},{n:'Grifes',p:60000,img:2}]},
  relogio:{nome:'Relógio',itens:[{n:'Relógio comum',p:0,img:0},{n:'Suíço de entrada',p:25000,img:1},{n:'Relógio de luxo',p:120000,img:2},{n:'Peça de colecionador',p:600000,img:3}]},
};
const estiloAtual=()=>S.vida.estilo||(S.vida.estilo={terno:0,roupa:0,relogio:0});
const imagem=()=>{ const E=estiloAtual(); return Object.keys(ESTILO).reduce((a,k)=>a+ESTILO[k].itens[E[k]||0].img,0); };
function comprarEstilo(cat,i){ const E=estiloAtual(), it=ESTILO[cat].itens[i], at=ESTILO[cat].itens[E[cat]||0]; if(!it||i===(E[cat]||0)||ocupado) return;
  if(dinheiroPessoal()<it.p) return; pagarPessoal(it.p); E[cat]=i; if(it.img>at.img) S.prest=clamp(S.prest+(it.img-at.img),0,100);
  S.vida.felicidade=clamp(S.vida.felicidade+3,0,100); addLog(`Compra: ${it.n} (${ESTILO[cat].nome.toLowerCase()}) por ${brl(it.p)}.`,'g'); salvar(); render(); }
function painelEstilo(){ const E=estiloAtual();
  return `<section class="panel"><div class="panel-head"><h2>Estilo</h2><span class="label">imagem pessoal ${imagem()} de 7</span></div>
    ${Object.entries(ESTILO).map(([k,C])=>`<span class="label">${C.nome}</span><div class="chips">${C.itens.map((it,i)=>`<button class="chip ${i===(E[k]||0)?'on':''}" data-act="estilo" data-v="${k}:${i}" ${i===(E[k]||0)||dinheiroPessoal()<it.p?'disabled':''}>${it.n}${it.p?' · '+brl(it.p):''}</button>`).join('')}</div>`).join('')}
    <p style="margin:0;font-size:12px;color:var(--muted)">Cada ponto de imagem dá +0,5 de chance em casos contra empresas e com júri, e um pouco de felicidade por mês. Itens melhores dão prestígio na compra.</p></section>`; }

// eventos novos: namoro e casamento, filhos por idade e amigos
async function eventoParceiroExtra(P){ const V=S.vida, pn=esc(P.nome.split(' ')[0]), evs=['jantar','fds','pet'];
  if(P.pers==='ciume') evs.push('ciume'); if(P.pers==='ambicao'||P.pers==='independencia') evs.push('curso'); if(V.moradia>0) evs.push('reforma');
  const e=pick(evs);
  if(e==='jantar'){ const v=await modal(`<h2>Jantar surpresa</h2><p>${pn} preparou um jantar surpresa num dia de muito trabalho.</p>`,[{t:'Ficar no escritório',v:0,cls:'ghost'},{t:'Ir para casa (−1 bloco)',v:1,cls:'brass'}]);
    if(v){ P.rel=clamp(P.rel+8,0,100); V.falta=(V.falta||0)+1; V.felicidade=clamp(V.felicidade+4,0,100); addLog(`Jantar surpresa com ${P.nome}.`,'g'); } else P.rel=clamp(P.rel-8,0,100); }
  if(e==='fds'){ const v=await modal(`<h2>Fim de semana romântico</h2><p>${pn} achou uma pousada na serra com preço bom.</p>`,[{t:'Não dá agora',v:0,cls:'ghost'},{t:`Ir · ${brl(2500)} e −2 blocos`,v:1,cls:'brass',dis:dinheiroPessoal()<2500}]);
    if(v){ pagarPessoal(2500); V.falta=(V.falta||0)+2; P.rel=clamp(P.rel+12,0,100); S.estresse=clamp(S.estresse-12,0,100); addLog(`Fim de semana na serra com ${P.nome}.`,'g'); } else P.rel=clamp(P.rel-3,0,100); }
  if(e==='pet'&&!V.pet){ const v=await modal(`<h2>Adotar um cachorro?</h2><p>${pn} se apaixonou por um cachorro numa feira de adoção.</p>`,[{t:'Melhor não',v:0,cls:'ghost'},{t:`Adotar · ${brl(1500)} e ${brl(300)}/mês`,v:1,cls:'brass'}]);
    if(v){ pagarPessoal(1500); V.pet={nome:pick(['Thor','Mel','Bob','Luna','Pipoca','Fred','Nina']),desde:S.semana}; P.rel=clamp(P.rel+10,0,100); V.felicidade=clamp(V.felicidade+8,0,100); addLog(`Vocês adotaram o ${V.pet.nome}.`,'g'); } else P.rel=clamp(P.rel-4,0,100); }
  if(e==='ciume'){ const ch=chanceConversa(); const v=await modal(`<h2>Crise de ciúme</h2><p>${pn} viu mensagens de trabalho tarde da noite e desconfiou.</p><div class="opts">
      <button class="opt" data-mv="mostrar"><span>Mostrar as mensagens e conversar</span><b class="num">${pct(ch)}</b><small>Se der certo, relação +5; se não, −8.</small></button>
      <button class="opt" data-mv="ignorar"><span>Dizer que é paranoia</span><b class="num">−12</b><small>Relação −12.</small></button></div>`,[]);
    if(v==='mostrar'){ if(Math.random()<ch){ P.rel=clamp(P.rel+5,0,100); addLog(`A conversa com ${P.nome} resolveu a crise de ciúme.`,'g'); } else P.rel=clamp(P.rel-8,0,100); } else P.rel=clamp(P.rel-12,0,100); }
  if(e==='curso'){ const v=await modal(`<h2>${pn} quer voltar a estudar</h2><p>Uma pós na área de ${esc(P.prof)}. ${pn} pede ajuda para pagar.</p>`,[{t:'Não dá agora',v:0,cls:'ghost'},{t:`Pagar · ${brl(12000)}`,v:1,cls:'brass',dis:dinheiroPessoal()<12000}]);
    if(v){ pagarPessoal(12000); P.rel=clamp(P.rel+12,0,100); addLog(`Você pagou a pós de ${P.nome}.`,'g'); } else P.rel=clamp(P.rel-5,0,100); }
  if(e==='reforma'){ const v=await modal(`<h2>Reformar a casa?</h2><p>${pn} quer reformar a cozinha e a sala.</p>`,[{t:'Deixar como está',v:0,cls:'ghost'},{t:`Reformar · ${brl(25000)}`,v:1,cls:'brass',dis:dinheiroPessoal()<25000}]);
    if(v){ pagarPessoal(25000); P.rel=clamp(P.rel+6,0,100); V.felicidade=clamp(V.felicidade+8,0,100); addLog('A casa foi reformada.','g'); } else P.rel=clamp(P.rel-3,0,100); }
}
async function eventoFilhoExtra(){ const V=S.vida; if(!V.filhos.length) return; const f=pick(V.filhos), a=idadeFilho(f), pn=esc(f.nome.split(' ')[0]);
  if(a<5){ const v=await modal(`<h2>${pn} está com febre</h2><p>${pn}, ${a} ano${a===1?'':'s'}, passou a noite com febre e precisa ir ao pediatra.</p>`,[{t:'Pedir para outra pessoa levar',v:0,cls:'ghost'},{t:`Levar · ${brl(800)} e −1 bloco`,v:1,cls:'brass'}]);
    if(v){ pagarPessoal(800); V.falta=(V.falta||0)+1; f.rel=clamp(f.rel+8,0,100); } else f.rel=clamp(f.rel-6,0,100); return; }
  if(a<13){ const e=pick(['boletim','esporte']);
    if(e==='boletim'){ const v=await modal(`<h2>Boletim de ${pn}</h2><p>As notas de ${pn} caíram neste bimestre.</p>`,[{t:'Pagar aulas de reforço · '+brl(1200),v:'pagar',cls:'ghost'},{t:'Ajudar nas tarefas (−2 blocos)',v:'ajudar',cls:'brass'}]);
      if(v==='ajudar'){ V.falta=(V.falta||0)+2; f.rel=clamp(f.rel+12,0,100); addLog(`Você ajudou ${pn} nas tarefas da escola.`,'g'); } else { pagarPessoal(1200); f.rel=clamp(f.rel+2,0,100); } }
    else { const v=await modal(`<h2>Final do campeonato</h2><p>O time de ${pn} chegou à final do campeonato da escola.</p>`,[{t:'Não posso ir',v:0,cls:'ghost'},{t:'Ir torcer (−1 bloco)',v:1,cls:'brass'}]);
      if(v){ V.falta=(V.falta||0)+1; f.rel=clamp(f.rel+10,0,100); V.felicidade=clamp(V.felicidade+4,0,100); addLog(`Você foi à final do campeonato de ${pn}.`,'g'); } else f.rel=clamp(f.rel-8,0,100); }
    return; }
  if(a<18){ const e=pick(['briga','intercambio']);
    if(e==='briga'){ const ch=clamp(f.rel/100+S.skills.negociacao/300,.05,.95); const v=await modal(`<h2>Adolescência</h2><p>${pn} chegou tarde em casa e não quer conversa.</p><div class="opts">
        <button class="opt" data-mv="conversa"><span>Conversar com calma</span><b class="num">${pct(ch)}</b><small>Se der certo, relação +8; se não, −6.</small></button>
        <button class="opt" data-mv="castigo"><span>Deixar de castigo</span><b class="num">−4</b><small>Relação −4.</small></button></div>`,[]);
      if(v==='conversa'){ f.rel=clamp(f.rel+(Math.random()<ch?8:-6),0,100); } else f.rel=clamp(f.rel-4,0,100); }
    else { const v=await modal(`<h2>Intercâmbio</h2><p>${pn} quer fazer um semestre de intercâmbio no exterior.</p>`,[{t:'Não dá',v:0,cls:'ghost'},{t:`Pagar · ${brl(40000)}`,v:1,cls:'brass',dis:dinheiroPessoal()<40000}]);
      if(v){ pagarPessoal(40000); f.rel=clamp(f.rel+15,0,100); f.intercambio=true; addLog(`${pn} foi fazer intercâmbio.`,'g'); } else f.rel=clamp(f.rel-6,0,100); }
    return; }
  if(a<=24&&!f.formou&&a>=22){ f.formou=true; const v=await modal(`<h2>Formatura de ${pn}</h2><p>${pn} se forma${f.direito?' em Direito':''} neste mês.</p>`,[{t:'Só ir à cerimônia',v:0,cls:'ghost'},{t:`Dar a festa · ${brl(10000)}`,v:1,cls:'brass',dis:dinheiroPessoal()<10000}]);
    if(v){ pagarPessoal(10000); f.rel=clamp(f.rel+12,0,100); } else f.rel=clamp(f.rel+4,0,100); V.felicidade=clamp(V.felicidade+8,0,100); addLog(`Formatura de ${pn}.`,'g'); }
}
async function eventoAmigoExtra(){ const N=(S.npcs||[]).filter(n=>n.rel>=20); if(!N.length) return; const n=pick(N), pn=esc(n.nome.split(' ')[0]), V=S.vida;
  const e=pick(['casamento','futebol','emprestimo','aniversario']);
  if(e==='casamento'&&!n.casou){ n.casou=true; const v=await modal(`<h2>Casamento de ${pn}</h2><p>${esc(n.nome)} vai se casar e convidou você para padrinho.</p>`,[{t:'Recusar',v:0,cls:'ghost'},{t:`Ser padrinho · ${brl(2500)} e −1 bloco`,v:1,cls:'brass'}]);
    if(v){ pagarPessoal(2500); V.falta=(V.falta||0)+1; n.rel+=15; V.felicidade=clamp(V.felicidade+5,0,100); addLog(`Você foi padrinho no casamento de ${n.nome}.`,'g'); } else n.rel-=10; }
  else if(e==='futebol'){ const v=await modal(`<h2>Futebol com a turma</h2><p>${pn} chamou a turma da faculdade para uma partida no sábado.</p>`,[{t:'Não vou',v:0,cls:'ghost'},{t:'Jogar (−1 bloco)',v:1,cls:'brass'}]);
    if(v){ V.falta=(V.falta||0)+1; n.rel+=6; S.estresse=clamp(S.estresse-10,0,100); V.felicidade=clamp(V.felicidade+4,0,100); V.saude=clamp(V.saude+2,0,100); } }
  else if(e==='emprestimo'){ const val=10000; const v=await modal(`<h2>${pn} pediu dinheiro emprestado</h2><p>${esc(n.nome)} está apertado e pede ${brl(val)} emprestados, prometendo devolver.</p>`,[{t:'Negar',v:0,cls:'ghost'},{t:`Emprestar ${brl(val)}`,v:1,cls:'brass',dis:dinheiroPessoal()<val}]);
    if(v){ pagarPessoal(val); n.rel+=15; n.divida={val,ate:S.semana+rint(4,10),paga:Math.random()<.65}; addLog(`Você emprestou ${brl(val)} para ${n.nome}.`); } else n.rel-=10; }
  else { const v=await modal(`<h2>Aniversário de ${pn}</h2><p>${esc(n.nome)} faz festa no fim de semana.</p>`,[{t:'Mandar uma mensagem',v:0,cls:'ghost'},{t:`Ir com presente · ${brl(400)}`,v:1,cls:'brass'}]);
    if(v){ pagarPessoal(400); n.rel+=8; V.felicidade=clamp(V.felicidade+3,0,100); } else n.rel+=1; }
  n.rel=clamp(n.rel,-100,100); }
async function eventosExtras(){ const V=S.vida; if(!V) return;
  if(V.pet){ pagarPessoal(300); V.felicidade=clamp(V.felicidade+.8,0,100); }
  V.felicidade=clamp(V.felicidade+imagem()*.1,0,100);
  for(const n of S.npcs||[]) if(n.divida&&S.semana>=n.divida.ate){ const d=n.divida; n.divida=null;
    if(d.paga){ pagarPessoal(-d.val); addLog(`${n.nome} devolveu os ${brl(d.val)} emprestados.`,'g'); } else { n.rel=clamp(n.rel-20,-100,100); addLog(`${n.nome} não devolveu os ${brl(d.val)} emprestados.`,'r'); } }
  if(V.parceiro&&Math.random()<.08) await eventoParceiroExtra(V.parceiro);
  if(V.filhos.length&&Math.random()<.08) await eventoFilhoExtra();
  if(Math.random()<.06) await eventoAmigoExtra(); }
{ const sv0=semanaVida; semanaVida=async function(){ const r=await sv0(); if(r||!S) return r; await eventosExtras(); return false; }; }
let casoImg=false; // o caso em cálculo é contra empresa ou com júri
{ const bv0=bonusVida; bonusVida=function(add){ bv0(add); const im=imagem(); if(im&&casoImg) add(`Imagem pessoal (${im})`,im*.5); }; }
{ const cc0=calcChance; calcChance=function(c,extra){ casoImg=!!c&&(c.adv==='empresa'||!!c.juri); try{ return cc0(c,extra); } finally{ casoImg=false; } }; }

// som: veredito e conquistas, sintetizado no navegador (sem arquivos); pode ser desligado no Diário
const somLigado=()=>{ try{ return localStorage.getItem('toga-som')!=='off'; }catch(e){ return true; } };
let audioCtx=null;
function tocar(tipo){ if(!somLigado()) return; try{ audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();
  const notas={ganhou:[523,659,784],perdeu:[392,330,262],conquista:[659,784,988,1319]}[tipo]||[440];
  notas.forEach((f,i)=>{ const o=audioCtx.createOscillator(), g=audioCtx.createGain(), t=audioCtx.currentTime+i*.11;
    o.type=tipo==='perdeu'?'triangle':'sine'; o.frequency.value=f; g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(.12,t+.02); g.gain.exponentialRampToValueAtTime(.0001,t+.28);
    o.connect(g).connect(audioCtx.destination); o.start(t); o.stop(t+.3); }); }catch(e){} }
new MutationObserver(ms=>{ for(const m of ms){ const el=m.target; if(el.classList&&el.classList.contains('verdict')&&!el.hidden) tocar(el.classList.contains('hi')?'ganhou':'perdeu'); } })
  .observe(document.getElementById('modal-root'),{subtree:true,attributes:true,attributeFilter:['hidden']});
{ const t0=toastCq; toastCq=function(c){ t0(c); tocar('conquista'); }; }

