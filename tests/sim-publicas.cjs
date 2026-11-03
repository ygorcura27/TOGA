// Simulação rápida das carreiras públicas (juiz, promotor e defensor): um robô joga N meses chamando as funções
// do jogo direto (sem cliques nem animações) e repete várias partidas por cenário de equipe, para ver médias.
// Rodar: node tests/sim-publicas.cjs [meses] [partidas]     ex.: node tests/sim-publicas.cjs 24 20
// Variáveis: CARREIRAS=juiz,promotor,defensor   CENARIOS=nada,inicial,mais1,equipe   PESSOAL=9 (blocos próprios por mês)   COMARCA=sp
const { chromium } = require('playwright');
const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '..', 'index.html') + '?teste';
const MESES = +(process.argv[2] || 24), PARTIDAS = +(process.argv[3] || 12);
const CARREIRAS = (process.env.CARREIRAS || 'juiz,promotor,defensor').split(',');
const CENARIOS = (process.env.CENARIOS || 'nada,inicial,equipe').split(',');
const PESSOAL = +(process.env.PESSOAL || 9);

// responde qualquer modal: primeira opção habilitada (comarca, vara, escolhas) ou o último botão (confirmar/continuar)
function politica(html, botoes) {
  const op = [...html.matchAll(/<button class="opt"[^>]*data-mv="([^"]*)"[^>]*>/g)].filter(m => !/disabled/.test(m[0]));
  if (op.length) return op[0][1];
  return botoes.length ? botoes[botoes.length - 1].v : 0;
}

// um mês de cada carreira, rodando dentro da página
async function jogar({ carreira, cenario, MESES, PESSOAL, COMARCA, NOCONC }) {
  const T = window.__toga, S = T.S, AR = ['civel', 'trabalho', 'penal', 'familia', 'empresarial', 'tributario'];
  const X = () => carreira === 'juiz' ? T.S.j : carreira === 'promotor' ? T.S.p : T.S.d;
  S.tut = { off: true, t: {} }; S.semResumo = true;
  for (const k of AR) S.skills[k] = 50; S.skills.analise = S.skills.oratoria = S.skills.escrita = 45;
  if (COMARCA) X().comarca = COMARCA;
  if (cenario === 'nada') S.u.equipe = [];
  if (cenario === 'mais1') { const c = T.gerarCandidato('servidor'); c.q = 50; c.moral = 65; S.u.equipe.push(c); } // equipe inicial + 1 servidor
  if (cenario === 'equipe') { S.u.equipe = []; for (const f of ['assessor', 'assessor', 'servidor', 'estagiario']) { const c = T.gerarCandidato(f); c.q = 60; c.moral = 70; S.u.equipe.push(c); } }
  const vivo = () => T.S && !T.S.fim;
  for (let m = 0; m < MESES && vivo(); m++) {
    const lista = carreira === 'juiz' ? X().acervo : X().casos;
    for (const c of lista) c.semana = 0;
    // blocos: equipe que sobra do expediente + o que você aguenta, menos o expediente que cai em você
    let resta = Math.min(T.livres(), T.gabCasos() + Math.max(0, PESSOAL - T.expPessoal()));
    const dar = (c, n) => { const k = Math.max(0, Math.min(n, resta)); c.semana += k; resta -= k; };
    if (carreira === 'juiz') {
      // sentencia os mais atrasados primeiro: só vai a sentença quem chega ao mínimo de estudo
      for (const p of [...lista].filter(p => !NOCONC && T.concilia(p) && !p.concFalhou && T.chanceConc() >= .6).slice(0, 2)) await T.jConciliar(p.id);
      for (const p of [...X().acervo].sort((a, b) => (b.idade - b.meta) - (a.idade - a.meta))) {
        const falta = T.minSent(p) - (p.estudo || 0); if (falta <= resta) dar(p, falta); }
    } else if (carreira === 'promotor') {
      for (const c of lista.filter(c => c.fase === 'juizo').sort((a, b) => a.prazo - b.prazo)) dar(c, T.manut(c));
      const inqs = lista.filter(c => c.fase === 'inq').sort((a, b) => (b.idade - b.meta) - (a.idade - a.meta));
      for (const c of inqs) dar(c, T.MIN_ATD[c.rar] - (c.prep || 0));
      for (const c of inqs) dar(c, T.prepIdeal(c) - T.dilig(c));
      for (const c of [...inqs]) {
        const d = T.dilig(c), urg = c.idade >= c.meta + 3, ch = T.calcCondenacao(c).ch;
        if (c.revelado && d >= 1) { await T.mpArquivar(c.id); continue; }
        if (d < T.MIN_ATD[c.rar]) continue;
        if (c.acordo && !c.acordoFalhou && ch < .7 && T.chanceAcordoMP() >= .6) { await T.mpAcordo(c.id); if (!X().casos.includes(c)) continue; }
        if (ch >= (urg ? .4 : .55)) await T.mpDenunciar(c.id);
        else if (urg || (d >= T.prepIdeal(c) && ch < .3)) await T.mpArquivar(c.id);
      }
    } else {
      // audiências mais próximas primeiro, presos na frente; acordo quando vale a pena
      for (const c of [...lista].filter(c => c.acordo && !c.acordoFalhou && c.inst === 1 && T.chanceAcordoDP() >= .6 && T.calcDefesa(c).ch < .7)) await T.dpAcordo(c.id);
      const ord = [...X().casos].sort((a, b) => (a.prazo - b.prazo) || (b.preso - a.preso));
      for (const c of ord) dar(c, Math.max(T.MIN_ATD[c.rar] - (c.prep || 0), c.prazo <= 1 ? 1 : 0));
      for (const c of ord.filter(c => c.prazo <= 2)) dar(c, T.prepIdeal(c) - (c.prep || 0) - c.semana);
      for (const c of X().casos.filter(c => c.preso && !c.hcFalhou && T.chanceHC(c) >= .5).slice(0, 2)) if (T.livres() >= 1) await T.dpHC(c.id); // como um jogador: até 2 HC por mês
    }
    const promo = carreira === 'juiz' ? T.promoOk() : carreira === 'promotor' ? T.promoOkMP() : T.promoOkDP();
    if (promo) await T.promocao();
    await T.fimSemana();
  }
  if (!T.S) return { fim: true };
  const Q = X(), U = T.S.u;
  const prod = carreira === 'juiz' ? Q.sentencas : carreira === 'promotor' ? Q.condenacoes : Q.atendimentos;
  const pend = carreira === 'juiz' ? Q.acervo.length : Q.casos.length;
  const atr = carreira === 'juiz' ? Q.acervo.filter(p => p.idade > p.meta).length : carreira === 'promotor' ? Q.casos.filter(c => c.fase === 'inq' && c.idade > c.meta).length : Q.casos.filter(c => c.preso && !c.prep).length;
  return { fim: !!T.S.fim, prest: T.S.prest, cargo: Q.cargo, prod, pend, atr, equipe: U.equipe.length, orc: U.orc, estresse: T.S.estresse, energia: T.S.energia, exaust: T.S.__exaust||0 };
}

async function partida(p, carreira, cenario) {
  await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.reload();
  await p.evaluate(src => { window.__rapido = new Function('return ' + src)(); }, politica.toString());
  await p.selectOption('#carreira', carreira); await p.selectOption('#inicio', 'formado'); await p.click('[data-act=comecar]');
  await p.waitForFunction(c => { const S = window.__toga.S; return S && S.carreira === c && S.u; }, carreira);
  return p.evaluate(jogar, { carreira, cenario, MESES, PESSOAL, COMARCA: process.env.COMARCA || "", NOCONC: !!process.env.NOCONC });
}

(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ reducedMotion: 'reduce' }); const erros = []; p.on('pageerror', e => erros.push(e.message));
  const media = (L, k) => L.length ? L.reduce((a, x) => a + (x[k] || 0), 0) / L.length : 0;
  const PROD = { juiz: 'sentenças', promotor: 'condenações', defensor: 'atendimentos' };
  console.log(`Carreiras públicas · ${MESES} meses · ${PARTIDAS} partidas por cenário · robô com ${PESSOAL} blocos próprios por mês`);
  for (const car of CARREIRAS) {
    console.log(`\n${car.toUpperCase()}\ncenário  encerradas  reputação  cargo  ${PROD[car].padStart(12)}  atrasados  pendentes  equipe no fim   orçamento  estresse  energia`);
    for (const cen of CENARIOS) {
      const R = []; const t0 = Date.now();
      for (let i = 0; i < PARTIDAS; i++) { try { R.push(await partida(p, car, cen)); } catch (e) { erros.push(e.message.split('\n')[0]); } }
      const V = R.filter(r => !r.fim);
      console.log(`${cen.padEnd(8)} ${String(R.length - V.length).padStart(5)}/${R.length}  ${media(V, 'prest').toFixed(1).padStart(9)}  ${media(V, 'cargo').toFixed(1).padStart(5)}  ${media(V, 'prod').toFixed(0).padStart(12)}  ${media(V, 'atr').toFixed(1).padStart(9)}  ${media(V, 'pend').toFixed(0).padStart(9)}  ${media(V, 'equipe').toFixed(1).padStart(13)}  ${('R$ ' + Math.round(media(V, 'orc'))).padStart(10)}  ${media(V, 'estresse').toFixed(0).padStart(8)}  ${media(V, 'energia').toFixed(0).padStart(7)}   (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
    }
  }
  if (erros.length) console.log('\nErros:', [...new Set(erros)].slice(0, 5).join(' | '));
  await b.close(); if (erros.length) process.exit(1);
})();
