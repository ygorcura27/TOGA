// ===================== INÍCIO =====================
let escolha={genero:'f',nome:'Ana Ribeiro',inicio:'faculdade',facul:'publica',carreira:'adv',espec:'trabalho',sede:'sp',traits:['orador','workaholic']};
function renderInicio(){
  app.innerHTML=`<header class="top"><div class="brand"><h1>Toga</h1><span>Protótipo · sistema de casos</span></div></header>
  <section class="panel" style="max-width:560px;margin:0 auto">
    <h2>Uma vida no Direito</h2>
    ${contaHtml()}
    <p style="margin:0;color:var(--muted)">Comece na faculdade de Direito ou já formado. Advogue, faça concurso para juiz, promotor ou defensor, pesquise e dê aulas, construa um escritório, uma família e uma dinastia. Em cada caso, a sua skill enfrenta a dificuldade e a chance aparece antes do veredito.</p>
    <div class="field"><label class="label" for="genero">Gênero</label><select id="genero"><option value="f">Feminino</option><option value="m" ${escolha.genero==='m'?'selected':''}>Masculino</option></select></div>
    <div class="field"><label class="label" for="nome">Nome</label><input id="nome" value="${esc(escolha.nome)}" maxlength="30"></div>
    <div class="field"><label class="label" for="inicio">Ponto de partida</label><select id="inicio"><option value="faculdade">Faculdade de Direito, aos 18 anos (recomendado)</option><option value="formado" ${escolha.inicio==='formado'?'selected':''}>Já formado e aprovado, aos 25 anos</option></select></div>
    <div class="field"><label class="label" for="facul">Faculdade (se começar na faculdade)</label><select id="facul">${Object.entries(FACS).map(([k,f])=>`<option value="${k}" ${escolha.facul===k?'selected':''}>${f.nome} · ${f.mensal?brl(f.mensal)+'/mês':'gratuita, exige vestibular'}</option>`).join('')}</select></div>
    <div class="field"><label class="label" for="carreira">Carreira <span id="car-nota" style="text-transform:none;letter-spacing:0;font-weight:400">${escolha.inicio==='formado'?'':'· na faculdade, você escolhe na formatura; mude para "Já formado" para começar direto na carreira'}</span></label><select id="carreira"><option value="adv">Advocacia · abrir o próprio escritório</option><option value="juiz" ${escolha.carreira==='juiz'?'selected':''}>Magistratura · já aprovado no concurso, começa como juiz substituto</option><option value="promotor" ${escolha.carreira==='promotor'?'selected':''}>Ministério Público · já aprovado no concurso, começa como promotor substituto</option><option value="defensor" ${escolha.carreira==='defensor'?'selected':''}>Defensoria Pública · já aprovado no concurso, começa como defensor substituto</option></select></div>
    <div class="field"><label class="label" for="espec">Área de especialização (+15) · no escritório, é a área de atuação inicial; para juízes, é a vara</label>
      <select id="espec">${Object.entries(AREAS).map(([k,a])=>`<option value="${k}" ${escolha.espec===k?'selected':''}>${a.nome}</option>`).join('')}</select></div>
    <div class="field"><label class="label" for="sede">Cidade da sede ou comarca</label>
      <select id="sede">${Object.entries(CIDADES).map(([k,c])=>`<option value="${k}" ${escolha.sede===k?'selected':''}>${c.nome} (${c.uf}) · causas ×${c.fator.toLocaleString('pt-BR')}</option>`).join('')}</select></div>
    <div class="field"><span class="label">Traços (escolha 2)</span>
      <div class="start-traits">${Object.entries(TRAITS).map(([k,t])=>`<button class="chip ${escolha.traits.includes(k)?'on':''}" data-act="trait" data-v="${k}"><b>${t.nome}</b><br><span style="font-size:11px">${t.desc}</span></button>`).join('')}</div></div>
    <button class="btn brass" data-act="comecar" ${escolha.traits.length!==2?'disabled':''}>Começar</button>
  </section>
  <div class="hall-inicio" style="max-width:560px;margin:14px auto 0">${hallLer().vidas.length||ON()?painelHall(5):''}</div>`;
}

