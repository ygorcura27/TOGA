// Simulação rápida do promotor: um robô joga N meses chamando as funções do jogo direto (sem cliques nem animações)
// e repete várias partidas por cenário de equipe, para ver médias em vez de uma rodada só.
// Rodar: node tests/sim-promotor.cjs [meses] [partidas]     ex.: node tests/sim-promotor.cjs 24 20
// Variáveis: CENARIOS=nada,inicial,equipe   PESSOAL=9 (blocos próprios por mês que o robô aguenta)   COMARCA=sp
const { chromium } = require('playwright');
const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '..', 'index.html') + '?teste';
const MESES = +(process.argv[2] || 24), PARTIDAS = +(process.argv[3] || 12);
const CENARIOS = (process.env.CENARIOS || 'nada,inicial,equipe').split(',');
const PESSOAL = +(process.env.PESSOAL || 9);

// responde qualquer modal: primeira opção habilitada (comarca, escolhas) ou o último botão (confirmar/continuar)
function politica(html, botoes) {
  const op = [...html.matchAll(/<button class="opt"[^>]*data-mv="([^"]*)"[^>]*>/g)].filter(m => !/disabled/.test(m[0]));
  if (op.length) return op[0][1];
  return botoes.length ? botoes[botoes.length - 1].v : 0;
}

async function partida(p, cenario) {
  await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.reload();
  await p.evaluate(src => { window.__rapido = new Function('return ' + src)(); }, politica.toString());
  await p.selectOption('#carreira', 'promotor'); await p.selectOption('#inicio', 'formado'); await p.click('[data-act=comecar]');
  await p.waitForFunction(() => window.__toga.S && window.__toga.S.p);
  return p.evaluate(async ({ cenario, MESES, PESSOAL, COMARCA }) => {
    const T = window.__toga, S = T.S, AR = ['civel', 'trabalho', 'penal', 'familia', 'empresarial', 'tributario'];
    S.tut = { off: true, t: {} }; S.semResumo = true;
    for (const k of AR) S.skills[k] = 50; S.skills.analise = S.skills.oratoria = 45;
    if (COMARCA) S.p.comarca = COMARCA;
    if (cenario === 'nada') S.u.equipe = [];
    if (cenario === 'equipe') { S.u.equipe = []; for (const f of ['assessor', 'assessor', 'servidor', 'estagiario']) { const c = T.gerarCandidato(f); c.q = 60; c.moral = 70; S.u.equipe.push(c); } }
    const hist = [];
    for (let m = 0; m < MESES && !S.fim && T.S; m++) {
      const P = S.p, casos = P.casos;
      for (const c of casos) c.semana = 0;
      // orçamento de blocos: equipe que sobra do expediente + o que você aguenta, menos o expediente que cai em você
      let resta = Math.min(T.livres(), T.gabCasos() + Math.max(0, PESSOAL - T.expPessoal()));
      const dar = (c, n) => { const k = Math.min(n, resta); c.semana += k; resta -= k; };
      for (const c of casos.filter(c => c.fase === 'juizo').sort((a, b) => a.prazo - b.prazo)) dar(c, T.manut(c));
      const inqs = casos.filter(c => c.fase === 'inq').sort((a, b) => (b.idade - b.meta) - (a.idade - a.meta));
      for (const c of inqs) dar(c, Math.max(0, T.MIN_ATD[c.rar] - (c.prep || 0)));
      for (const c of inqs) dar(c, Math.max(0, T.prepIdeal(c) - T.dilig(c)));
      // decisões nos inquéritos
      for (const c of [...inqs]) {
        const d = T.dilig(c), urg = c.idade >= c.meta + 3, ch = T.calcCondenacao(c).ch;
        if (c.revelado && d >= 1) { await T.mpArquivar(c.id); continue; }
        if (d < T.MIN_ATD[c.rar]) continue;
        if (c.acordo && !c.acordoFalhou && ch < .7 && T.chanceAcordoMP() >= .6) { await T.mpAcordo(c.id); if (!S.p.casos.includes(c)) continue; }
        if (ch >= (urg ? .4 : .55)) await T.mpDenunciar(c.id);
        else if (urg || (d >= T.prepIdeal(c) && ch < .3)) await T.mpArquivar(c.id);
      }
      if (T.promoOkMP()) await T.promocao();
      await T.fimSemana();
      if (!T.S) break;
      hist.push(Math.round(T.S.prest));
    }
    const X = T.S;
    if (!X) return { fim: true, meses: hist.length };
    const Q = X.p, t = Q.condenacoes + Q.absolvicoes;
    return { fim: !!X.fim, meses: hist.length, prest: Math.round(X.prest), cargo: Q.cargo, cond: Q.condenacoes, taxa: t ? Q.condenacoes / t : 0,
      atr: Q.casos.filter(c => c.fase === 'inq' && c.idade > c.meta).length, pend: Q.casos.length, equipe: X.u.equipe.length,
      orc: Math.round(X.u.orc), efet: X.u.efet, estresse: Math.round(X.estresse), min: Math.min(...hist) };
  }, { cenario, MESES, PESSOAL, COMARCA: process.env.COMARCA || '' });
}

(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ reducedMotion: 'reduce' }); const erros = []; p.on('pageerror', e => erros.push(e.message));
  const media = (L, k) => L.length ? L.reduce((a, x) => a + (x[k] || 0), 0) / L.length : 0;
  console.log(`Promotor · ${MESES} meses · ${PARTIDAS} partidas por cenário · robô com ${PESSOAL} blocos próprios por mês\n`);
  console.log('cenário  encerradas  reputação  cargo  condenações  taxa  atrasados  equipe no fim  orçamento   estresse');
  for (const cen of CENARIOS) {
    const R = []; const t0 = Date.now();
    for (let i = 0; i < PARTIDAS; i++) { try { R.push(await partida(p, cen)); } catch (e) { erros.push(e.message.split('\n')[0]); } }
    const vivas = R.filter(r => !r.fim);
    console.log(`${cen.padEnd(8)} ${String(R.length - vivas.length).padStart(5)}/${R.length}  ${media(vivas, 'prest').toFixed(1).padStart(9)}  ${media(vivas, 'cargo').toFixed(1).padStart(5)}  ${media(vivas, 'cond').toFixed(0).padStart(11)}  ${(100 * media(vivas, 'taxa')).toFixed(0).padStart(3)}%  ${media(vivas, 'atr').toFixed(1).padStart(9)}  ${media(vivas, 'equipe').toFixed(1).padStart(13)}  ${('R$ ' + Math.round(media(vivas, 'orc'))).padStart(10)}  ${media(vivas, 'estresse').toFixed(0).padStart(8)}   (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
  }
  if (erros.length) console.log('\nErros:', [...new Set(erros)].slice(0, 5).join(' | '));
  await b.close();
})();
