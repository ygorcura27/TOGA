// ===================== EVENTOS =====================
app.addEventListener('click',e=>{
  const b=e.target.closest('[data-act]'); if(!b||b.disabled) return;
  if(['SELECT','INPUT','OPTION','TEXTAREA'].includes(b.tagName)) return; // campos usam 'change'; redesenhar aqui fechava o seletor aberto
  const a=b.dataset.act, id=+b.dataset.id, v=b.dataset.v;
  if(a==='trait'){ const t=escolha.traits; if(t.includes(v)) escolha.traits=t.filter(x=>x!==v); else if(t.length<2) t.push(v); else { t.shift(); t.push(v);}
    escolha.nome=document.getElementById('nome').value; escolha.espec=document.getElementById('espec').value; escolha.sede=document.getElementById('sede').value; escolha.carreira=document.getElementById('carreira').value; escolha.inicio=document.getElementById('inicio').value; escolha.facul=document.getElementById('facul').value; escolha.genero=document.getElementById('genero').value; render(); return; }
  if(a==='comecar'){ escolha.nome=document.getElementById('nome').value.trim()||'Ana Ribeiro'; escolha.espec=document.getElementById('espec').value;
    escolha.sede=document.getElementById('sede').value;
    escolha.carreira=document.getElementById('carreira').value;
    escolha.inicio=document.getElementById('inicio').value; escolha.facul=document.getElementById('facul').value;
    escolha.genero=document.getElementById('genero').value;
    novoJogo(escolha.nome,escolha.espec,[...escolha.traits],escolha.sede); S.genero=escolha.genero;
    if(escolha.inicio==='faculdade'){ view='escritorio'; sel={regiao:null,brasil:null,mundo:null}; regiaoSel=null; iniciarComFaculdade(escolha.facul); return; }
    if(escolha.carreira==='defensor'){ iniciarDP(escolha.sede); S.log=[]; addLog(`Posse como ${fem('Defensor Público Substituto')} em ${CIDADES[escolha.sede].nome}. A fila de assistidos já está grande.`); }
    if(escolha.carreira==='promotor'){ iniciarMP(escolha.sede); S.log=[]; addLog(`Posse como ${fem('Promotor Substituto')} na comarca de ${CIDADES[escolha.sede].nome}. Você herdou 8 inquéritos.`); }
    if(escolha.carreira==='juiz'){ iniciarMagistratura(escolha.sede); S.vida.idade0=30; S.vida.ultimoAniv=30; S.log=[]; addLog(`Posse como ${fem('Juiz Substituto')} na comarca de ${CIDADES[escolha.sede].nome}. Você herdou um acervo de 8 processos.`); } view='escritorio'; sel={regiao:null,brasil:null,mundo:null}; regiaoSel=null; salvar(); render(); return; }
  if(a==='login'){ window.TOGA_ONLINE&&window.TOGA_ONLINE.login().catch(err=>modal(`<h2>Não foi possível entrar</h2><p>${esc(err.message||err)}</p>`,[{t:'Tentar de novo',v:1,cls:'brass'},{t:'Fechar',v:0,cls:'ghost'}]).then(x=>{ if(x) app.querySelector('[data-act=login]')?.click(); })); return; }
  if(a==='logout'){ window.TOGA_ONLINE&&window.TOGA_ONLINE.logout(); return; }
  if(!S) return;
  if(a==='view'){ view=v; render(); window.scrollTo(0,0); return; }
  if(a==='cidade'){ sel[view]=v; render(); return; }
  if(a==='regiao'){ regiaoSel=v; render(); return; }
  if(a==='abrirFilial'){ const C=LOC[v], custo=custoAbrir(C), tipo=TIPO[C.nivel];
    const ganho=C.nivel==='regional'?'O bairro passa a gerar 1 caso novo por mês':'A cidade passa a gerar 1 caso novo por mês, sem a penalidade de distância';
    modal(`<h2>Abrir ${tipo} em ${C.nome}?</h2><p>Custa ${brl(custo)} agora e ${brl(aluguel(C))} por mês.${C.nivel==='global'?' Inclui contratar um sócio local habilitado.':''} ${ganho}, e o seu limite de casos ativos sobe 1.</p>`,
      [{t:'Cancelar',v:0,cls:'ghost'},{t:'Abrir '+tipo,v:1,cls:'brass'}]).then(r=>{
        if(r && S && !motivoAbrir(v)){ S.caixa-=custo; S.filiais.push(v);
          addLog(`Nova ${tipo} em ${nomeLocal(v)} por ${brl(custo)}.`,'g'); salvar(); render(); } });
    return; }
  if(a==='aceitar'){ const c0=S.ofertas.find(x=>x.id===id); if(c0&&c0.npcJuiz&&!c0.etica&&npcTipo(npcPor(c0.npcJuiz))==='amigo'&&S.casos.length<maxCasos()){ eticaAmigoJuiz(c0); return; } const c=S.ofertas.find(x=>x.id===id); if(c&&S.casos.length<maxCasos()){ S.casos.push(c); S.ofertas=S.ofertas.filter(x=>x.id!==id); addLog(`Aceitou “${c.titulo}” (${RAR[c.rar].nome}, ${brl(c.valor)}).`);} }
  if(a==='recusar'){ S.ofertas=S.ofertas.filter(x=>x.id!==id); }
  if(a==='inc'||a==='dec'){ const d=a==='inc'?1:-1; if(d>0&&livres()<=0) return;
    if(b.dataset.k==='case'){ const c=S.casos.find(x=>x.id===id); c.semana=Math.max(0,(c.semana||0)+d); }
    else if(b.dataset.k==='dp'){ const c=S.d.casos.find(x=>x.id===id); c.semana=Math.max(0,(c.semana||0)+d); }
    else if(b.dataset.k==='inq'){ const c=S.p.casos.find(x=>x.id===id); c.semana=Math.max(0,(c.semana||0)+d); }
    else if(b.dataset.k==='proc'){ const p=S.j.acervo.find(x=>x.id===id); p.semana=Math.max(0,(p.semana||0)+d); }
    else S.agenda[b.dataset.k]=Math.max(0,S.agenda[b.dataset.k]+d); }
  if(a==='estr'){ const c=S.casos.find(x=>x.id===id); c.estrategia=v; }
  if(a==='apoio'){ const c=S.casos.find(x=>x.id===id), ap=APOIOS[v], st=c.apoios[v]||0, custo=custoApoio(ap,c);
    if(st===0){ if(ap.blocos>livres()||S.caixa<custo) return; c.apoios[v]=1; S.caixa-=custo; if(ap.bad){ S.integ=clamp(S.integ-15,0,100); addLog(`Você usou um atalho antiético em “${c.titulo}”. −15 integridade.`,'r'); } }
    else if(st===1){ c.apoios[v]=0; S.caixa+=custo; if(ap.bad) S.integ=clamp(S.integ+15,0,100); } }
  if(a==='fimSemana'){ fimSemana(); return; }
  if(a==='concurso'){ concurso(v||'juiz'); return; }
  if(a==='promocao'){ S.carreira==='promotor'?promocaoMP():S.carreira==='defensor'?promocaoDP():promocao(); return; }
  if(a==='dpHC'){ dpHC(id); return; }
  if(a==='dpAcordo'){ dpAcordo(id); return; }
  if(a==='jConciliar'){ jConciliar(id); return; }
  if(a==='exonerar'){ exonerar(); return; }
  if(a==='moradia'){ comprarBem('moradia',+v); return; }
  if(a==='carro'){ comprarBem('carro',+v); return; }
  if(a==='quitar'){ quitarDivida(id); return; }
  if(a==='investir'){ investir(v); return; }
  if(a==='comprarAlug'){ comprarAluguel(+v); return; }
  if(a==='reformarAlug'){ reformarAluguel(id); return; }
  if(a==='venderAlug'){ venderAluguel(id); return; }
  if(a==='npc'){ acaoNPC(id,v); return; }
  if(a==='pAcao'){ acaoParceiro(v); return; }
  if(a==='facEstagio'){ facEstagio(); return; }
  if(a==='facEstagioSair'){ S.fac.estagio=null; S.agenda.estagio=0; salvar(); render(); return; }
  if(a==='facOAB'){ exameOAB(); return; }
  if(a==='acMatricular'){ acMatricular(v); return; }
  if(a==='acProjeto'){ acProjeto(v); return; }
  if(a==='acDocencia'){ acDocencia(v); return; }
  if(a==='acDocSair'){ S.ac.doc=null; S.agenda.docencia=0; addLog('Você deixou a docência.'); salvar(); render(); return; }
  if(a==='virarAcademico'){ virarAcademico(); return; }
  if(a==='aposentar'){ aposentar(); return; }
  if(a==='slot'){ S.u.sel=+v; render(); return; }
  if(a==='construir'){ construir(v); return; }
  if(a==='demolir'){ demolir(); return; }
  if(a==='mudarImovel'){ mudarImovel(); return; }
  if(a==='contratar'){ contratar(v); return; }
  if(a==='addArea'){ addArea(v); return; }
  if(a==='virarFull'){ virarFull(); return; }
  if(a==='demitir'){ demitir(id); return; }
  if(a==='gestorF'){ S.u.gestorId=id; addLog(`${S.u.equipe.find(f=>f.id===id).nome} agora é o ${nomeGestor().toLowerCase()}.`); salvar(); render(); return; }
  if(a==='promoverF'){ promoverF(id); return; }
  if(a==='aumento'){ aumento(id); return; }
  if(a==='ret'){ fazerRetirada(); return; }
  if(a==='retPreset'){ const el=document.getElementById('ret-valor'); if(el){ el.value=Math.max(0,Math.floor(+v/100)*100); atualizarRetirada(); } return; }
  if(a==='mpDenunciar'){ mpDenunciar(id); return; }
  if(a==='mpAcordo'){ mpAcordo(id); return; }
  if(a==='mpArquivar'){ mpArquivar(id); return; }
  if(a==='antecipar'){ antecipar(id); return; }
  if(a==='tutOk'){ const e=tutEstado(); if(e){ e.t.i++; e.t.ini=S.semana; } salvar(); render(); return; }
  if(a==='tutSair'){ if(S){ S.tut=S.tut||{t:{}}; S.tut.off=true; } salvar(); render(); return; }
  if(a==='estilo'){ const [c,i]=v.split(':'); comprarEstilo(c,+i); return; }
  if(a==='toggleSom'){ try{ localStorage.setItem('toga-som',somLigado()?'off':'on'); }catch(e){} render(); return; }
  if(a==='toggleResumo'){ S.semResumo=!S.semResumo; salvar(); render(); return; }
  if(a==='articular'){ articular(); return; }
  if(a==='reiniciar'){ modal('<h2>Recomeçar?</h2><p>A carreira atual será apagada.</p>',[{t:'Cancelar',v:0,cls:'ghost'},{t:'Recomeçar',v:1}]).then(v=>{ if(v){ S=null; apagarSave(); render(); } }); return; }
  salvar(); render();
});
app.addEventListener('keydown',e=>{
  if((e.key==='Enter'||e.key===' ') && e.target.matches && e.target.matches('g[data-act]')){ e.preventDefault(); e.target.dispatchEvent(new MouseEvent('click',{bubbles:true})); } });
app.addEventListener('input',e=>{ if(e.target.id==='ret-valor') atualizarRetirada(); });
app.addEventListener('change',e=>{
  // tela inicial: escolher carreira pública muda o ponto de partida para "Já formado"; a nota explica a regra
  if(!S&&(e.target.id==='carreira'||e.target.id==='inicio')){ const ini=document.getElementById('inicio'), car=document.getElementById('carreira'), nota=document.getElementById('car-nota');
    if(e.target.id==='carreira'&&car.value!=='adv') ini.value='formado';
    escolha.inicio=ini.value; escolha.carreira=car.value;
    if(nota) nota.textContent=ini.value==='formado'?'':'· na faculdade, você escolhe na formatura; mude para "Já formado" para começar direto na carreira'; return; }
  if(e.target.id==='genero'&&!S){ const n=document.getElementById('nome'); if(n&&['Ana Ribeiro','André Ribeiro'].includes(n.value)) n.value=e.target.value==='m'?'André Ribeiro':'Ana Ribeiro'; return; }
  if(e.target.dataset.act==='autoDist'&&S){ S.u.auto=e.target.checked; salvar(); return; }
  if(e.target.dataset.act==='estudoSkill'&&S){ S.agenda.estudoSkill=e.target.value; salvar(); } });

