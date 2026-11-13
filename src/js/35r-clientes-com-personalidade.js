// ===================== CLIENTES COM PERSONALIDADE =====================
// cada cliente fixo tem um jeito: muda o partido, a paciência, quem ele aceita na audiência e o que ele traz.
const PERFIS={
  pagador:{nome:'Bom pagador',ico:'💼',desc:'Partido 15% maior e sempre em dia.'},
  atrasa:{nome:'Paga atrasado',ico:'⏳',desc:'Em alguns meses atrasa o partido; paga depois, acumulado. Três atrasos seguidos e você pode cobrar ou perdoar.'},
  exigente:{nome:'Exigente',ico:'🎩',desc:'Quer você na audiência: se mandar outra pessoa, a satisfação cai. Se você for e ganhar, sobe mais.'},
  indicador:{nome:'Bem relacionado',ico:'🤝',desc:'Satisfeito (70 ou mais), indica casos de amigos, muitas vezes raros ou maiores.'},
  fiel:{nome:'Fiel',ico:'🛡️',desc:'Derrota pesa metade e a concorrência não consegue levá-lo.'},
  impaciente:{nome:'Impaciente',ico:'⚡',desc:'Manda mais casos, mas fica insatisfeito nos meses sem nenhum caso dele em andamento.'},
  pechincha:{nome:'Pechincheiro',ico:'🧾',desc:'Partido 20% menor, mas manda casos com mais frequência.'},
  midiatico:{nome:'Midiático',ico:'📣',desc:'Casos dele saem no jornal: vitória rende prestígio extra, derrota custa prestígio.'},
};
const perfilDe=f=>f&&PERFIS[f.perfil];
const clienteDoCaso=c=>c&&c.clienteFixo&&(S.clientes||[]).find(x=>x.id===c.clienteFixo);
function darPerfil(f){ if(f.perfil) return; f.perfil=pick(Object.keys(PERFIS));
  if(f.perfil==='pagador') f.partido=Math.round(f.partido*1.15/100)*100;
  if(f.perfil==='pechincha') f.partido=Math.round(f.partido*.8/100)*100; }
const tagPerfil=f=>{ const P=perfilDe(f); return P?`<span class="tag perfil-cl" title="${esc(P.desc)}">${P.ico} ${P.nome}</span>`:''; };
// saves antigos: clientes sem perfil ganham um
{ const r0=render; render=function(){ if(S&&S.clientes) for(const f of S.clientes) darPerfil(f); r0(); }; }
// vitória e derrota
const foiVoce=c=>c._modo!=='enviar';
{ const v0=clienteVitoria; clienteVitoria=function(c){ const antes=(S.clientes||[]).length, f=clienteDoCaso(c); v0(c);
    if((S.clientes||[]).length>antes){ const n=S.clientes[S.clientes.length-1]; darPerfil(n); addLog(`Perfil de ${n.nome}: ${PERFIS[n.perfil].nome.toLowerCase()}. ${PERFIS[n.perfil].desc}`); }
    if(!f) return; const P=f.perfil;
    if(P==='exigente'){ if(foiVoce(c)) f.satisf=clamp(f.satisf+5,0,100); else { f.satisf=clamp(f.satisf-12,0,100); addLog(`${f.nome} ganhou, mas reclamou: queria você na audiência, não ${c._subNome||'outra pessoa'}.`,'r'); } }
    if(P==='midiatico'){ const g=Math.round(RAR[c.rar].ganho*.5*10)/10; S.prest=clamp(S.prest+g,0,100); addLog(`A vitória de ${f.nome} saiu na imprensa. ${sgn(g)} prestígio.`,'g'); } }; }
{ const d0=clienteDerrota; clienteDerrota=function(c){ const f=clienteDoCaso(c); d0(c); if(!f) return; const P=f.perfil;
    if(P==='fiel') f.satisf=clamp(f.satisf+10,0,100); // a derrota pesa metade
    if(P==='exigente'&&!foiVoce(c)){ f.satisf=clamp(f.satisf-10,0,100); addLog(`${f.nome} ficou furioso: perdeu sem você na audiência.`,'r'); }
    if(P==='midiatico'){ const g=Math.round(RAR[c.rar].ganho*.4*10)/10; S.prest=clamp(S.prest-g,0,100); addLog(`A derrota de ${f.nome} virou notícia. −${g} prestígio.`,'r'); } }; }
// casos novos: impacientes e pechincheiros mandam mais; bem relacionados indicam
{ const o0=ofertasClientes; ofertasClientes=function(){ o0(); if(S.carreira!=='adv') return;
    for(const f of S.clientes||[]){
      if((f.perfil==='impaciente'||f.perfil==='pechincha')&&Math.random()<.18){ const a=areasAtivas().includes(f.area)?f.area:areaOferta(S.sede), c=novoCaso(S.sede,{},a); c.cliente=f.nome; c.clienteFixo=f.id; S.ofertas.push(c); }
      if(f.perfil==='indicador'&&f.satisf>=70&&Math.random()<.12){ const c=novoCaso(S.sede,{raro:20,epico:6},areaOferta(S.sede)); c.indicadoPor=f.nome; S.ofertas.push(c);
        addLog(`${f.nome} indicou um caso: “${c.titulo}”.`,'g'); } } }; }
// mês: atrasos, impaciência e fidelidade
{ const s0=semanaClientes; semanaClientes=async function(){ if(S.carreira!=='adv') return s0(); if(!S.clientes) S.clientes=[]; const L=S.clientes;
    const atrasou=[];
    for(const f of L) if(f.perfil==='atrasa'&&Math.random()<.3){ atrasou.push([f,f.partido]); f.partido=0; }
    const fieis=L.filter(f=>f.perfil==='fiel'&&f.satisf>20);
    await s0();
    const mt=TIERS[tierEscritorio()].partido;
    for(const [f,v] of atrasou){ f.partido=v; f.devendo=(f.devendo||0)+Math.round(v*mt/100)*100; f.atrasos=(f.atrasos||0)+1; addLog(`${f.nome} atrasou o partido deste mês (devendo ${brl(f.devendo)}).`,'r'); }
    for(const f of L) if(f.perfil==='atrasa'&&f.devendo&&!atrasou.some(([x])=>x===f)){ S.caixa+=f.devendo; S.u.honSemana+=f.devendo; addLog(`${f.nome} quitou o partido atrasado: ${brl(f.devendo)}.`,'g'); f.devendo=0; f.atrasos=0; }
    // fiéis não trocam de escritório (só saem se a satisfação desabar)
    for(const f of fieis) if(!S.clientes.includes(f)&&f.satisf>20){ S.clientes.push(f); }
    for(const f of S.clientes) if(f.perfil==='impaciente'&&!S.casos.some(c=>c.clienteFixo===f.id)){ f.satisf=clamp(f.satisf-3,0,100); }
    const cobrar=S.clientes.find(f=>f.perfil==='atrasa'&&(f.atrasos||0)>=3);
    if(cobrar){ const v=await modal(`<h2>${esc(cobrar.nome)} está devendo</h2><p>Três meses seguidos de partido atrasado: ${brl(cobrar.devendo)} em aberto.</p>
      <div class="opts"><button class="opt" data-mv="cobrar"><span>Cobrar na justiça</span><b class="num">recebe ~70%</b><small>Você recupera parte do valor, mas o cliente vai embora.</small></button>
      <button class="opt" data-mv="perdoar"><span>Perdoar a dívida</span><b class="num">+15 satisfação</b><small>Você perde o valor, mas o cliente fica grato e para de atrasar por um tempo.</small></button>
      <button class="opt" data-mv="esperar"><span>Esperar mais</span><b class="num">—</b><small>Talvez pague no mês que vem.</small></button></div>`,[]);
      if(v==='cobrar'){ const r=Math.round(cobrar.devendo*.7/100)*100; S.caixa+=r; S.clientes=S.clientes.filter(x=>x!==cobrar); addLog(`Você cobrou ${cobrar.nome} na justiça e recebeu ${brl(r)}. O cliente foi embora.`); }
      else if(v==='perdoar'){ cobrar.devendo=0; cobrar.atrasos=0; cobrar.satisf=clamp(cobrar.satisf+15,0,100); cobrar.perfil='pagador'; addLog(`Você perdoou a dívida de ${cobrar.nome}. Grato, passou a pagar em dia.`,'g'); }
      else cobrar.atrasos=2; } }; }
// mostrar o perfil no painel de clientes e no cartão do caso
{ const p0=painelClientes; painelClientes=function(){ let h=p0(); for(const f of S.clientes||[]) h=h.replace(`<b>${esc(f.nome)}</b> · `,`<b>${esc(f.nome)}</b> ${tagPerfil(f)} · `); return h; }; }
{ const p0=pasta; pasta=function(c,ativo){ let h=p0(c,ativo); const f=clienteDoCaso(c);
    const extra=f?`<p class="txt-s"><b>Cliente fixo</b> ${tagPerfil(f)} · satisfação ${Math.round(f.satisf)}<br><span class="mut">${esc(PERFIS[f.perfil].desc)}</span></p>`:c.indicadoPor?`<p class="txt-s">🤝 Indicação de <b>${esc(c.indicadoPor)}</b>.</p>`:'';
    return extra?h.replace('</h3>','</h3>'+extra):h; }; }
