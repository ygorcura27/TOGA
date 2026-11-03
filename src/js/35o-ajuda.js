// ===================== AJUDA: PERGUNTAS FREQUENTES =====================
// aba "Ajuda" em todas as carreiras. Os números saem das próprias tabelas do jogo, para não ficarem desatualizados.
const pularAjuda=k=>!(k in S.skills);
function tabelaEstrelas(){ const faixas=k=>ehArea(k)||SK5.includes(k)?NIV_AREA:NIV;
  const prox=(v,k)=>{ const F=faixas(k), n=F.find(x=>v<x); return n?`faltam ${Math.ceil(n-v)} para ${F.indexOf(n)+1}★`:'máximo'; };
  const linhas=Object.entries(SKILLS).filter(([k])=>!pularAjuda(k)).map(([k,nome])=>{ const v=S.skills[k]||0, teto=ehArea(k)?tetoArea(k):100;
    return `<tr><td>${esc(nome)}</td><td class="num">${Math.floor(v)}${teto<100?`<small style="color:var(--muted)"> /${teto}</small>`:''}</td><td style="color:var(--brass)">${estrelasHtml(k)}</td><td style="color:var(--muted);font-size:12px">${v>=teto&&teto<100?'no teto: precisa de título':prox(v,k)}</td></tr>`; }).join('');
  return `<table class="aj-tab"><thead><tr><th>Skill</th><th>Valor</th><th>Estrelas</th><th>Próxima</th></tr></thead><tbody>${linhas}</tbody></table>`; }
function tabelaTiers(){ const R=t=>{ const r=t.req; if(!r) return 'ponto de partida'; const it=[];
    if(r.imovel!=null) it.push(IMOVEIS.adv[r.imovel].nome.toLowerCase()); if(r.advs) it.push(`${r.advs} advogados`); if(r.filiais) it.push(`${r.filiais} filial`);
    if(r.estados) it.push(`filiais em ${r.estados} estado${r.estados>1?'s':''}`); if(r.clientes) it.push(`${r.clientes} clientes fixos`); if(r.areas) it.push(`${r.areas} áreas`);
    if(r.full) it.push('full service'); if(r.prest) it.push(`prestígio ${r.prest}`); if(r.anos) it.push(`${r.anos} anos`); return it.join(' · '); };
  return `<table class="aj-tab"><thead><tr><th>Nível</th><th>Requisitos</th><th>Casos até</th></tr></thead><tbody>${TIERS.map((t,i)=>`<tr${S.carreira==='adv'&&tierEscritorio()===i?' style="font-weight:700"':''}><td>${t.nome.replace('Escritório ','')}</td><td style="font-size:12.5px">${R(t)}</td><td>${RAR[RORD[t.rarMax]].nome}</td></tr>`).join('')}</tbody></table>`; }
function faq(){ const P=PERKS, A=PERK_AREA5;
  return [
  ['Habilidades','Quanto de skill preciso para cada estrela?',`
    <p>Toda skill vai de 0 a 100. <b>Áreas do direito</b>, <b>Gestão</b> e <b>Idiomas</b> têm 5 estrelas, que acendem em <b>${NIV_AREA.map((x,i)=>`${x} (${i+1}★)`).join(' · ')}</b>. As <b>skills gerais</b> (Oratória, Escrita, Pesquisa, Negociação, Análise, Didática) têm 3 estrelas, em <b>${NIV.map((x,i)=>`${x} (${i+1}★)`).join(' · ')}</b>, e cada estrela abre um efeito.</p>
    <p><b>Áreas do direito</b> (Penal, Cível, Trabalho…) têm teto: estudando sozinho você chega a <b>${TETO_AREA[0]}</b> (3★). Uma <b>especialização</b> na área sobe o teto para ${TETO_AREA[1]} (4★) e <b>mestrado ou doutorado</b> para ${TETO_AREA[2]} (5★). Os títulos se fazem na aba Academia.</p>
    <p>O que cada estrela de área dá: ${A.map((t,i)=>`${i+1}★ ${t.toLowerCase()}`).join('; ')}.</p>
    <p><b>Skills gerais</b> não têm teto. Exemplo, Escrita: ${P.escrita.map((t,i)=>`${NIV[i]} = ${t.toLowerCase()}`).join('; ')}.</p>
    <p><b>Gestão</b> e <b>Idiomas</b> usam as mesmas faixas e liberam filiais (veja abaixo).</p>
    <span class="label">Suas skills agora</span>${tabelaEstrelas()}`],
  ['Habilidades','Como subo as skills?',`<p>Com blocos de <b>Estudo</b> na agenda (escolha a skill), trabalhando nos casos da área, fazendo audiências e com cursos e títulos na Academia. Quanto mais alta a skill, mais devagar ela sobe.</p>`],
  ['Escritório de advocacia','Quais os requisitos para o escritório subir de nível?',`<p>O escritório sobe sozinho quando você cumpre <b>todos</b> os itens do próximo nível, um nível por vez. O painel <b>Nível do escritório</b>, na aba Estrutura e equipe, mostra o que falta.</p>${tabelaTiers()}
    <p>Os advogados das <b>filiais</b> contam junto com os da sede (estagiários não contam). O tempo de escritório conta desde a fundação.</p>`],
  ['Escritório de advocacia','Como consigo casos épicos e lendários?',`<ul class="aj-lista">
    <li><b>Nível do escritório:</b> o Iniciante só recebe até raro. A partir do <b>Local</b> aparecem épicos, e a partir do <b>Nacional</b>, lendários.</li>
    <li><b>Prestígio:</b> é o que mais pesa. Épicos começam a aparecer com prestígio <b>35</b> e ficam mais frequentes a cada ponto; lendários só com prestígio <b>65</b> ou mais.</li>
    <li><b>Filiais:</b> com prestígio 25 ou mais, cada filial aumenta a chance de épicos, e todas elas trazem casos da própria cidade.</li>
    <li><b>Especialidade:</b> 5★ numa área (exige mestrado ou doutorado nela) traz mais casos épicos e lendários daquela área.</li>
    <li><b>Porte:</b> para atender, um épico exige ${PORTE.epico} advogado na equipe e um lendário ${PORTE.lendario}. Sem isso, a chance cai.</li>
    <li>Na advocacia, só você ou um sócio podem ir à audiência de um épico ou lendário.</li></ul>`],
  ['Escritório de advocacia','Como funcionam as filiais?',`<p>Abra pela aba Região ou Brasil. Exige <b>2★ em Gestão</b> para outro bairro, <b>3★</b> para outra cidade ou estado e <b>4★ em Gestão + 3★ em Idiomas</b> para outro país (Portugal dispensa o idioma).</p>
    <p>Cada filial tem imóvel e equipe próprios, no painel <b>Filiais</b> da aba Estrutura e equipe. A equipe de lá trabalha nos casos daquela cidade sem gastar a sua energia, pode ir às audiências de lá e cada advogado dela soma uma vaga de caso.</p>`],
  ['Escritório de advocacia','Como funciona a gestão automática?',`<p>No topo da aba Estrutura e equipe. Você pode deixar o escritório aceitar casos sozinho acima de uma chance mínima, escolher a partir de que raridade você mesmo vai às audiências (o resto vai com o advogado adequado) e, com um gestor administrativo, deixar a distribuição dos blocos da equipe automática.</p>`],
  ['Casos','Como funcionam os recursos?',`<p>Recurso não ocupa vaga de caso. Cada instância acima da primeira tira <b>13 pontos</b> da chance (tribunal −13, STJ −26, STF −39). Se a decisão anterior foi a seu favor, você ganha +10; se foi contra, perde 10. Escrita ${NIV[2]} dá +8 em recursos.</p>`],
  ['Casos','Como sobe a chance de um caso?',`<p>Blocos de trabalho no caso (com retorno decrescente), skills da área, estrelas, teses e apoios na pasta do caso, estrutura do escritório e o seu estado (energia e estresse). Abaixo de 30 de energia você perde 10 de chance.</p>`],
  ['Rotina','Como a energia recarrega?',`<ul class="aj-lista">
    <li>Cada bloco <b>livre</b> no mês vira descanso: cerca de <b>+3</b> de energia.</li>
    <li>Cada bloco de <b>lazer</b>: +1,5 de energia e −6 de estresse.</li>
    <li>Cada bloco seu de trabalho gasta cerca de <b>3,2</b> (Workaholic: 30% menos). Os blocos da equipe não gastam a sua energia.</li>
    <li>Na audiência ao vivo, o fôlego é a sua energia; o recesso devolve 40.</li>
    <li>Abaixo de 20 a saúde cai; em 0 você se esgota e tem só 14 blocos no mês seguinte. Estresse 100 é burnout (10 blocos).</li></ul>
    <p>A agenda mostra a previsão: “Energia: X hoje → Y no fim do mês”.</p>`],
  ['Rotina','Por que investir não tirou dinheiro do caixa?',`<p>Investimentos usam o dinheiro <b>pessoal</b>, não o caixa do escritório. Para passar dinheiro do escritório para você, faça uma retirada na aba Estrutura e equipe.</p>`],
  ['Rotina','Como escrevo artigos e a coluna de opinião?',`<p><b>Artigos</b>: na aba Academia, ponha blocos de escrita no painel de pesquisa. <b>Coluna de opinião</b>: na aba Jornal, uma por mês, custa 8 de energia e usa a sua Escrita.</p>`],
  ['Conta','Como troco de conta?',`<p>Na tela inicial ou na aba Conquistas, use <b>Sair</b> e depois <b>Entrar</b> com a outra conta. Ao sincronizar, o jogo pergunta qual save manter.</p>`],
  ]; }
function renderAjuda(){ const L=faq(), grupos=[...new Set(L.map(x=>x[0]))];
  app.innerHTML=`${header()}
  <section class="panel"><div class="panel-head"><h2>Ajuda</h2><span class="label">perguntas frequentes</span></div>
    <p style="margin:0;font-size:13px;color:var(--muted)">Os números abaixo são os do jogo atual. Clique numa pergunta para abrir.</p>
    ${grupos.map(g=>`<span class="label" style="margin-top:6px">${g}</span>${L.filter(x=>x[0]===g).map(([,q,r],i)=>`<details class="aj-q"${g==='Habilidades'&&i===0?' open':''}><summary>${q}</summary><div class="aj-r">${r}</div></details>`).join('')}`).join('')}
  </section>`; }
{ const h0=header; header=function(){ const h=h0(); if(!S) return h;
    const bt=`<button class="tab ${view==='ajuda'?'on':''}" data-act="view" data-v="ajuda">Ajuda</button>`;
    return /<span class="label" style="align-self:center;margin-left:auto">/.test(h)?h.replace('<span class="label" style="align-self:center;margin-left:auto">',bt+'<span class="label" style="align-self:center;margin-left:auto">')
      :h.replace(/(<nav class="tabs"[^>]*>[\s\S]*?)(<\/nav>)/,`$1${bt}$2`); }; }
{ const r0=render; render=function(){ if(S&&view==='ajuda'){ renderAjuda(); return; } r0(); }; }
