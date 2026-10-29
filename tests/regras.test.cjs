// Testes de regras: chamam as funções do jogo pela página aberta com ?teste.
// Rodar: npm test   (precisa do Playwright com o Chromium instalado: npx playwright install chromium)
const { chromium } = require('playwright');
const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '..', 'index.html') + '?teste';
let falhas = 0; const ok = (cond, nome, extra = '') => { console.log(`${cond ? 'OK  ' : 'FALHA'} ${nome}${extra ? ' · ' + extra : ''}`); if (!cond) falhas++; };

(async () => {
  const b = await chromium.launch(); const p = await b.newPage(); const erros = []; p.on('pageerror', e => erros.push(e.message));
  await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.reload();
  await p.selectOption('#inicio', 'formado'); await p.click('[data-act=comecar]'); await p.waitForTimeout(300);
  const r = await p.evaluate(() => { const T = window.__toga, S = T.S, c = T.novoCaso(S.sede);
    const chs = []; for (let i = 0; i < 200; i++) { const x = T.novoCaso(S.sede); chs.push(T.calcChance(x).ch); }
    const lend = { ...c, rar: 'lendario' }, comum = { ...c, rar: 'comum' };
    return { ano: T.ANO, chMin: Math.min(...chs), chMax: Math.max(...chs), satComum: T.prepCaso(comum, 5) / T.prepCaso(comum, 50), satLend: T.prepCaso(lend, 5) / T.prepCaso(lend, 50),
      manutL: T.manut(lend), manutC: T.manut(comum), limite: T.maxCasos(), teto: T.tetoArea('penal'), honOk: c.hon === Math.round(c.valor * .2),
      ret: T.divisaoRetirada(10000), carga: T.cargaCaso({ ...comum, semana: 0, prep: 0, atraso: 0 }, false) }; });
  ok(r.ano === 12, 'ano tem 12 meses', r.ano);
  ok(r.chMin >= .05 && r.chMax <= .95, 'chance sempre entre 5% e 95%', `${r.chMin.toFixed(2)}–${r.chMax.toFixed(2)}`);
  ok(r.honOk, 'honorários são 20% do valor da causa');
  ok(r.satComum > .9, 'caso comum satura com ~5 blocos de preparação', r.satComum.toFixed(2));
  ok(r.satLend < .5, 'caso lendário precisa de muito mais preparação', r.satLend.toFixed(2));
  ok(r.manutC === 1 && r.manutL === 4, 'manutenção: comum 1, lendário 4 blocos');
  ok(r.limite === 3, 'advogado sozinho atende 3 casos', r.limite);
  ok(r.teto === 81, 'sem título, área para em 81 (3★)', r.teto);
  ok(r.ret.voce === 10000 && r.ret.soc === 0, 'retirada sem sócios fica toda com o titular');
  ok(r.carga.atraso === 1, 'manutenção não paga vira atraso', r.carga.atraso);
  ok(erros.length === 0, 'sem erros de JavaScript', erros.join(' | '));
  await b.close(); if (falhas) { console.log(`\n${falhas} teste(s) falharam`); process.exit(1); } console.log('\nRegras: tudo certo');
})();
