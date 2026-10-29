// ===================== CONQUISTAS E HALL DA FAMA =====================
// conquistas valem para a dinastia inteira (passam ao herdeiro); o Hall da Fama guarda as vidas encerradas neste navegador
const CQ_TIER={comum:{nome:'Comum',pts:10},raro:{nome:'Rara',pts:25},epico:{nome:'Épica',pts:50},lendario:{nome:'Lendária',pts:100}};
const CQ_CAT={casos:'Tribunais',escritorio:'Escritório',publica:'Carreira pública',academia:'Academia',vida:'Vida e patrimônio',dinastia:'Dinastia'};
const pubsDe=t=>S.ac?S.ac.pubs.filter(p=>!t||p.tipo===t):[];
const ehCasado=()=>S.vida.parceiro&&S.vida.parceiro.status==='casado';
const invTotal=()=>{ const I=S.vida.inv; return I?(I.rf||0)+(I.acoes||0)+(I.fii?I.fii.v||0:0):0; };
const CONQUISTAS=[
  {id:'vit1',cat:'casos',tier:'comum',nome:'Primeira vitória',desc:'Vença o primeiro caso.',ok:()=>S.vitorias>=1},
  {id:'vit50',cat:'casos',tier:'raro',nome:'Cinquenta vitórias',desc:'Some 50 vitórias como advogado.',ok:()=>S.vitorias>=50,prog:()=>[S.vitorias,50]},
  {id:'vit200',cat:'casos',tier:'epico',nome:'Máquina de ganhar',desc:'Some 200 vitórias como advogado.',ok:()=>S.vitorias>=200,prog:()=>[S.vitorias,200]},
  {id:'hist',cat:'casos',tier:'raro',nome:'Vitória histórica',desc:'Consiga um resultado histórico em audiência.',ok:()=>S.cq.cont.hist>=1},
  {id:'lend1',cat:'casos',tier:'epico',nome:'Primeiro caso lendário',desc:'Vença um caso de raridade lendária.',ok:()=>S.cq.cont.lend>=1},
  {id:'lend5',cat:'casos',tier:'lendario',nome:'Lenda dos tribunais',desc:'Vença 5 casos lendários.',ok:()=>S.cq.cont.lend>=5,prog:()=>[S.cq.cont.lend,5]},
  {id:'prest90',cat:'casos',tier:'epico',nome:'Nome nacional',desc:'Chegue a 90 de prestígio.',ok:()=>S.prest>=90,prog:()=>[Math.round(S.prest),90]},
  {id:'filial',cat:'escritorio',tier:'comum',nome:'Segundo endereço',desc:'Abra a primeira filial.',ok:()=>S.filiais.length>=1},
  {id:'rede',cat:'escritorio',tier:'raro',nome:'Rede de escritórios',desc:'Tenha 5 filiais ao mesmo tempo.',ok:()=>S.filiais.length>=5,prog:()=>[S.filiais.length,5]},
  {id:'intl',cat:'escritorio',tier:'epico',nome:'Escritório internacional',desc:'Abra um escritório fora do Brasil.',ok:()=>S.filiais.some(f=>LOC[f]&&LOC[f].nivel==='global')},
  {id:'socio',cat:'escritorio',tier:'raro',nome:'Primeiro sócio',desc:'Aceite um advogado sênior como sócio.',ok:()=>S.carreira==='adv'&&S.u&&S.u.equipe.some(f=>f.funcao==='socio')},
  {id:'banca',cat:'escritorio',tier:'epico',nome:'Banca de peso',desc:'Tenha 12 pessoas na equipe do escritório.',ok:()=>S.carreira==='adv'&&S.u&&S.u.equipe.length>=12,prog:()=>[S.carreira==='adv'&&S.u?S.u.equipe.length:0,12]},
  {id:'toga',cat:'publica',tier:'comum',nome:'Posse',desc:'Tome posse como juiz, promotor ou defensor.',ok:()=>['juiz','promotor','defensor'].includes(S.carreira)},
  {id:'desemb',cat:'publica',tier:'raro',nome:'Segunda instância',desc:'Chegue a desembargador.',ok:()=>S.carreira==='juiz'&&S.j.cargo>=2},
  {id:'stf',cat:'publica',tier:'lendario',nome:'Supremo',desc:'Chegue a ministro do STF.',ok:()=>S.carreira==='juiz'&&S.j.cargo>=4},
  {id:'pgj',cat:'publica',tier:'epico',nome:'Chefe do Ministério Público',desc:'Chegue a Procurador-Geral de Justiça.',ok:()=>S.carreira==='promotor'&&S.p.cargo>=3},
  {id:'dpg',cat:'publica',tier:'epico',nome:'Chefe da Defensoria',desc:'Chegue a Defensor Público-Geral.',ok:()=>S.carreira==='defensor'&&S.d.cargo>=3},
  {id:'volta',cat:'publica',tier:'comum',nome:'De volta à advocacia',desc:'Peça exoneração de um cargo público.',ok:()=>!!S.ex},
  {id:'poli',cat:'publica',tier:'raro',nome:'Polivalente',desc:'Exerça 3 carreiras diferentes na mesma dinastia.',ok:()=>S.cq.car.length>=3,prog:()=>[S.cq.car.length,3]},
  {id:'mestre',cat:'academia',tier:'comum',nome:'Mestre',desc:'Conclua o mestrado.',ok:()=>!!(S.ac&&S.ac.titulos.mestrado)},
  {id:'doutor',cat:'academia',tier:'raro',nome:'Doutor',desc:'Conclua o doutorado.',ok:()=>!!(S.ac&&S.ac.titulos.doutorado)},
  {id:'prof',cat:'academia',tier:'comum',nome:'Professor',desc:'Dê aulas numa faculdade.',ok:()=>!!(S.ac&&S.ac.doc)},
  {id:'a1',cat:'academia',tier:'raro',nome:'Qualis A1',desc:'Publique um artigo em revista A1.',ok:()=>pubsDe('artigo').some(p=>p.qualis==='A1')},
  {id:'best',cat:'academia',tier:'epico',nome:'Best-seller',desc:'Lance um livro que venda 200 exemplares no primeiro mês.',ok:()=>pubsDe().some(p=>p.v0>=200)},
  {id:'cinco',cat:'academia',tier:'epico',nome:'Autoridade no assunto',desc:'Chegue a 5 estrelas numa área do direito.',ok:()=>Object.keys(AREAS).some(k=>estrelas(k)>=5)},
  {id:'reforma',cat:'casos',tier:'raro',nome:'Lei nova, estudo novo',desc:'Recupere a estrela perdida depois de uma reforma da lei.',ok:()=>!!S.epoca&&Object.keys(S.epoca.atual).some(k=>S.cq.cont['ref_'+k]!==undefined&&estrelas(k)>S.cq.cont['ref_'+k])},
  {id:'prolif',cat:'academia',tier:'epico',nome:'Autor prolífico',desc:'Some 20 publicações.',ok:()=>pubsDe().length>=20,prog:()=>[pubsDe().length,20]},
  {id:'casou',cat:'vida',tier:'comum',nome:'Sim, aceito',desc:'Case-se.',ok:ehCasado},
  {id:'bodas',cat:'vida',tier:'raro',nome:'Bodas de prata',desc:'Fique 25 anos com a mesma pessoa.',ok:()=>!!S.vida.parceiro&&S.semana-S.vida.parceiro.desde>=25*ANO,prog:()=>[S.vida.parceiro?Math.floor((S.semana-S.vida.parceiro.desde)/ANO):0,25]},
  {id:'filho',cat:'vida',tier:'comum',nome:'Família',desc:'Tenha o primeiro filho.',ok:()=>S.vida.filhos.length>=1},
  {id:'filhos3',cat:'vida',tier:'raro',nome:'Casa cheia',desc:'Tenha 3 filhos.',ok:()=>S.vida.filhos.length>=3,prog:()=>[S.vida.filhos.length,3]},
  {id:'casa',cat:'vida',tier:'comum',nome:'Casa própria',desc:'Saia do aluguel.',ok:()=>S.vida.moradia>0},
  {id:'cobertura',cat:'vida',tier:'epico',nome:'Vista do alto',desc:'More numa cobertura.',ok:()=>S.vida.moradia===MORADIAS.length-1},
  {id:'esportivo',cat:'vida',tier:'raro',nome:'Esportivo na garagem',desc:'Compre o esportivo importado.',ok:()=>(S.vida.carro||0)===CARROS.length-1},
  {id:'quitado',cat:'vida',tier:'raro',nome:'Nada a dever',desc:'Quite todos os financiamentos.',ok:()=>S.cq.cont.divida>0&&!(S.vida.dividas||[]).length},
  {id:'senhorio',cat:'vida',tier:'raro',nome:'Senhorio',desc:'Tenha 3 imóveis alugados.',ok:()=>(S.vida.alugueis||[]).length>=3,prog:()=>[(S.vida.alugueis||[]).length,3]},
  {id:'investidor',cat:'vida',tier:'raro',nome:'Investidor',desc:'Tenha R$ 500 mil aplicados.',ok:()=>invTotal()>=5e5},
  {id:'milhao',cat:'vida',tier:'raro',nome:'Primeiro milhão',desc:'Chegue a R$ 1 milhão de patrimônio.',ok:()=>patrimonio()>=1e6},
  {id:'dezmi',cat:'vida',tier:'epico',nome:'Fortuna',desc:'Chegue a R$ 10 milhões de patrimônio.',ok:()=>patrimonio()>=1e7},
  {id:'amigo',cat:'vida',tier:'comum',nome:'Amigo para a vida',desc:'Chegue a 90 de relação com um colega da faculdade.',ok:()=>(S.npcs||[]).some(n=>n.rel>=90)},
  {id:'paz',cat:'vida',tier:'raro',nome:'Página virada',desc:'Transforme um rival da faculdade em amigo.',ok:()=>(S.npcs||[]).some(n=>S.cq.rivais.includes(n.id)&&n.rel>=50)},
  {id:'oitenta',cat:'vida',tier:'raro',nome:'Oitenta anos',desc:'Chegue aos 80 anos.',ok:()=>idade()>=80},
  {id:'ger2',cat:'dinastia',tier:'raro',nome:'Dinastia',desc:'Passe a carreira a um filho.',ok:()=>S.vida.geracao>=2},
  {id:'ger3',cat:'dinastia',tier:'epico',nome:'Três gerações',desc:'Chegue à 3ª geração da família.',ok:()=>S.vida.geracao>=3},
  {id:'stf2',cat:'dinastia',tier:'epico',nome:'Linhagem suprema',desc:'Duas gerações da família no STF.',ok:()=>S.cq.stf.length>=2,prog:()=>[S.cq.stf.length,2]},
  {id:'stf3',cat:'dinastia',tier:'lendario',nome:'Três gerações no STF',desc:'Três gerações da família no STF.',ok:()=>S.cq.stf.length>=3,prog:()=>[S.cq.stf.length,3]},
];
const cqInicial=()=>({ids:{},cont:{lend:0,hist:0,divida:0},car:[],stf:[],rivais:[]});
const cqPontos=(fil=()=>true)=>CONQUISTAS.filter(c=>S.cq.ids[c.id]&&fil(S.cq.ids[c.id])).reduce((a,c)=>a+CQ_TIER[c.tier].pts,0);
function cqCheck(){ if(!S) return; const Q=S.cq||(S.cq=cqInicial()), V=S.vida;
  if(['adv','juiz','promotor','defensor','academico'].includes(S.carreira)&&!Q.car.includes(S.carreira)) Q.car.push(S.carreira);
  if(S.carreira==='juiz'&&S.j.cargo>=4&&!Q.stf.includes(V.geracao)) Q.stf.push(V.geracao);
  if((V.dividas||[]).length) Q.cont.divida=1;
  for(const n of (S.npcs||[])) if(n.rel<0&&!Q.rivais.includes(n.id)) Q.rivais.push(n.id);
  for(const c of CONQUISTAS){ if(Q.ids[c.id]) continue; let ok=false; try{ ok=c.ok(); }catch(e){}
    if(!ok) continue; Q.ids[c.id]={semana:S.semana,ger:V.geracao,quem:S.nome}; hallMarcar(c.id);
    addLog(`Conquista ${CQ_TIER[c.tier].nome.toLowerCase()}: ${c.nome}.`,'g'); toastCq(c); } }
function cqVitoria(c,res){ if(!S.cq) S.cq=cqInicial(); if(c.rar==='lendario') S.cq.cont.lend++; if(res==='historica') S.cq.cont.hist++; cqCheck(); }

// toasts: não bloqueiam o jogo, somem sozinhos
function toastCq(c){ let box=document.getElementById('toasts'); if(!box){ box=document.createElement('div'); box.id='toasts'; document.body.appendChild(box); }
  const t=document.createElement('div'); t.className='toast'; t.style.setProperty('--tc',`var(--r-${c.tier})`);
  t.innerHTML=`<span class="label">Conquista ${CQ_TIER[c.tier].nome.toLowerCase()} · +${CQ_TIER[c.tier].pts}</span><b>${esc(c.nome)}</b><small>${esc(c.desc)}</small>`;
  box.appendChild(t); setTimeout(()=>t.classList.add('sai'),4200); setTimeout(()=>t.remove(),4700); }

// Hall da Fama: localStorage próprio, sobrevive ao fim da partida
function hallLer(){ try{ const r=JSON.parse(localStorage.getItem('toga-hall')||'null'); if(r&&Array.isArray(r.vidas)) return {vidas:r.vidas,ids:r.ids||{}}; }catch(e){} return {vidas:[],ids:{}}; }
function hallGravar(H){ try{ localStorage.setItem('toga-hall',JSON.stringify(H)); }catch(e){} }
function hallMarcar(id){ const H=hallLer(); if(!H.ids[id]){ H.ids[id]=1; hallGravar(H); } }
function legadoPontos(pat){ const ger=S.vida.geracao; return Math.round(S.prest+cqPontos(x=>x.ger===ger)+Math.min(200,Math.max(0,pat)/1e5)); }
function hallRegistrar(motivo){ if(!S||S.hallOk===S.semana) return; S.hallOk=S.semana; cqCheck();
  const pat=patrimonio(), ger=S.vida.geracao, H=hallLer();
  H.vidas.push({nome:S.nome,genero:S.genero,geracao:ger,carreira:descCarreira(),resumo:resumoCarreira(),idade:idade(),prest:Math.round(S.prest),patrimonio:pat,
    conq:CONQUISTAS.filter(c=>S.cq.ids[c.id]&&S.cq.ids[c.id].ger===ger).length,pontos:legadoPontos(pat),motivo,data:new Date().toISOString().slice(0,10)});
  const nova=H.vidas[H.vidas.length-1]; H.vidas.sort((a,b)=>b.pontos-a.pontos); H.vidas=H.vidas.slice(0,50); hallGravar(H); if(window.TOGA_ONLINE) window.TOGA_ONLINE.enviarHall(nova); }
const MOTIVO_HALL={morte:'faleceu',compulsoria:'compulsória',aposentadoria:'aposentou-se',falencia:'falência',encerrada:'carreira encerrada'};
function painelHall(lim=10){ const H=hallLer();
  return `<section class="panel"><div class="panel-head"><h2>Hall da Fama</h2><span class="label">${H.vidas.length} vida${H.vidas.length===1?'':'s'} registrada${H.vidas.length===1?'':'s'}</span></div>
    ${H.vidas.length?`<ol class="hall">${H.vidas.slice(0,lim).map((v,i)=>`<li class="${i===0?'top':''}"><span class="num pos">${i+1}</span>
      <div><b>${esc(v.nome)}</b> <span class="label">${v.geracao}ª geração · ${v.idade} anos · ${MOTIVO_HALL[v.motivo]||v.motivo}</span><small>${v.carreira} · ${v.resumo} · prestígio ${v.prest} · ${brl(v.patrimonio)} · ${v.conq} conquista${v.conq===1?'':'s'}</small></div>
      <b class="num pts">${v.pontos}</b></li>`).join('')}</ol>
      <p style="margin:0;font-size:12px;color:var(--muted)">Pontos de legado: prestígio final + pontos das conquistas obtidas na vida + 1 ponto por R$ 100 mil de patrimônio (até 200).</p>`
    :'<p style="margin:0;color:var(--muted)">Nenhuma vida encerrada ainda. Quando uma carreira terminar, por morte, aposentadoria ou falência, ela entra aqui, mesmo depois de apagar o save.</p>'}
    <div class="hall-online" data-lim="${lim}"></div></section>`; }

function renderConquistas(){ cqCheck(); const Q=S.cq, H=hallLer(), feitas=CONQUISTAS.filter(c=>Q.ids[c.id]).length, ger=S.vida.geracao;
  const card=c=>{ const u=Q.ids[c.id], ant=!u&&H.ids[c.id], p=!u&&c.prog?(()=>{ try{ return c.prog(); }catch(e){ return null; } })():null;
    return `<div class="cq ${u?'on':''}" style="--tc:var(--r-${c.tier})"><div class="cq-top"><b>${esc(c.nome)}</b><span class="num">${CQ_TIER[c.tier].pts}</span></div>
      <small>${esc(c.desc)}</small>
      ${u?`<span class="label">${u.ger!==ger?`${u.ger}ª geração · ${esc(u.quem||'')}`:`mês ${u.semana}`}</span>`
        :p?`<div class="bar"><i style="width:${Math.min(100,p[0]/p[1]*100)}%;background:var(--tc)"></i></div><span class="label">${Math.min(p[0],p[1])} de ${p[1]}${ant?' · já obtida em outra partida':''}</span>`
        :`<span class="label">${ant?'Já obtida em outra partida':CQ_TIER[c.tier].nome}</span>`}</div>`; };
  app.innerHTML=`${header()}
  <div class="grid">
    <div class="col">
      <section class="panel"><div class="panel-head"><h2>Legado atual</h2><span class="label">${ger}ª geração</span></div>
        <dl class="meta"><dt>Pontos de legado</dt><dd class="num">${legadoPontos(patrimonio())}</dd><dt>Conquistas desta vida</dt><dd class="num">${CONQUISTAS.filter(c=>Q.ids[c.id]&&Q.ids[c.id].ger===ger).length}</dd>
          <dt>Carreiras na família</dt><dd>${Q.car.length?Q.car.map(k=>({adv:'advocacia',juiz:'magistratura',promotor:'Ministério Público',defensor:'Defensoria',academico:'academia'})[k]).join(', '):'nenhuma ainda'}</dd>
          <dt>Gerações no STF</dt><dd class="num">${Q.stf.length}</dd></dl>
        ${contaHtml()}
        ${S.vida.legado.length?`<span class="label">Gerações anteriores</span><ul class="log">${S.vida.legado.map(r=>`<li><span class="w">${r.geracao}ª</span><span>${esc(r.nome)} · ${r.carreira} · ${brl(r.patrimonio)}</span></li>`).join("")}</ul>`:''}
      </section>
      ${painelHall()}
    </div>
    <div class="col">
      <section class="panel"><div class="panel-head"><h2>Conquistas</h2><span class="label">${feitas} de ${CONQUISTAS.length} · ${cqPontos()} pontos da dinastia</span></div>
        <div class="bar"><i style="width:${feitas/CONQUISTAS.length*100}%;background:var(--brass)"></i></div>
        <p style="margin:0;font-size:12px;color:var(--muted)">As conquistas são da família: o herdeiro continua de onde a geração anterior parou. As que você já obteve em partidas antigas aparecem marcadas.</p></section>
      ${Object.entries(CQ_CAT).map(([k,n])=>{ const L=CONQUISTAS.filter(c=>c.cat===k);
        return `<section class="panel"><div class="panel-head"><h2>${n}</h2><span class="label">${L.filter(c=>Q.ids[c.id]).length} de ${L.length}</span></div><div class="cqs">${L.map(card).join('')}</div></section>`; }).join('')}
    </div>
  </div>`; }

