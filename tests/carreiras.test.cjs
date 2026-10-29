// Teste de fumaça: começa cada carreira e joga alguns meses com um robô simples, procurando erros e textos antigos.
const { chromium } = require('playwright');
const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '..', 'index.html') + '?teste';
const MESES = +(process.env.MESES || 8);
const drenar = async p => { let livre = 0; for (let k = 0; k < 600; k++) { await p.waitForTimeout(25); if (!await p.$('.ov')) { if (++livre >= 6) return; continue; } livre = 0;
  const opt = await p.$('.ov .opt:not([disabled])'); if (opt) { await opt.click().catch(() => {}); continue; }
  const bs = await p.$$('.ov [data-mi]:not([disabled])'); if (bs.length) await bs[bs.length - 1].click().catch(() => {}); } };
let falhas = 0;
(async () => {
  const b = await chromium.launch();
  for (const [inicio, carreira] of [['faculdade', 'adv'], ['formado', 'adv'], ['formado', 'juiz'], ['formado', 'promotor'], ['formado', 'defensor']]) {
    const p = await b.newPage({ viewport: { width: 1280, height: 900 } }); const erros = []; p.on('pageerror', e => erros.push(e.message));
    await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.reload();
    await p.selectOption('#carreira', carreira); await p.selectOption('#inicio', inicio); await p.click('[data-act=comecar]'); await drenar(p);
    let jogados = 0;
    for (let m = 0; m < MESES; m++) {
      await drenar(p); const a = await p.$('[data-act=aceitar]:not([disabled])'); if (a) { await a.click({ timeout: 2000 }).catch(() => {}); await drenar(p); }
      for (let t = 0; t < 10; t++) { await drenar(p); const i = await p.$('[data-act=inc][data-k=case]:not([disabled]), [data-act=inc][data-k=proc]:not([disabled]), [data-act=inc][data-k=inq]:not([disabled]), [data-act=inc][data-k=dp]:not([disabled])'); if (!i) break; await i.click({ timeout: 2000 }).catch(() => {}); }
      await drenar(p); if (!await p.$('[data-act=fimSemana]')) break; await p.click('[data-act=fimSemana]', { timeout: 3000 }).catch(() => {}); await drenar(p); jogados++;
    }
    const texto = (await p.evaluate(() => document.body.innerText)).replace(/fim de semana/gi, '');
    const S = await p.evaluate(() => JSON.parse(localStorage.getItem('toga-proto') || 'null'));
    const problemas = [...erros.map(e => 'erro: ' + e), ...(/semana/i.test(texto) ? ['texto ainda fala em "semana"'] : []), ...(!S ? ['save sumiu'] : []), ...(jogados < MESES ? [`parou no mês ${jogados}`] : [])];
    console.log(`${problemas.length ? 'FALHA' : 'OK  '} ${inicio}/${carreira} · ${jogados} meses${problemas.length ? ' · ' + problemas.join(' | ') : ''}`); if (problemas.length) falhas++;
    await p.close();
  }
  await b.close(); if (falhas) { console.log(`\n${falhas} carreira(s) com problema`); process.exit(1); } console.log('\nCarreiras: tudo certo');
})();
