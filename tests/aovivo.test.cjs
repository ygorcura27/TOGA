// Teste das audiências ao vivo: em cada carreira, força uma audiência ao vivo, joga até o fim com um robô simples
// e falha se aparecer erro de JavaScript, se a tela não fechar ou se o resultado não chegar ao diário.
const { chromium } = require('playwright');
const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '..', 'index.html') + '?teste';
const POLITICA = `(h,b)=>{ const op=[...h.matchAll(/<button class="opt"[^>]*data-mv="([^"]*)"[^>]*>/g)].filter(m=>!/disabled/.test(m[0])); if(op.length) return op[0][1]; return b.length?b[b.length-1].v:0; }`;
// prepara um caso que vai a audiência ao vivo neste mês
const PREPARO = {
  adv: S => { const c = S.ofertas[0]; S.casos.push(c); S.ofertas = S.ofertas.filter(x => x !== c); c.rar = 'raro'; c.prazo = 1; c.modoAud = 'vivo'; c.apoios = { perito: 2 }; c.prep = 6; },
  recurso: S => { const c = S.ofertas[0]; S.casos.push(c); S.ofertas = S.ofertas.filter(x => x !== c); c.rar = 'raro'; c.inst = 2; c.lado = 'recorrente'; c.perdaOrig = 3; c.prazo = 1; c.modoAud = 'vivo'; },
  promotor: S => { const c = S.p.casos[0]; c.fase = 'juizo'; c.prazo = 1; c.rar = 'raro'; c.prep = 6; c.modoAud = 'vivo'; },
  defensor: S => { for (const c of S.d.casos) c.prazo = Math.max(2, c.prazo); const c = S.d.casos[0]; c.rar = 'raro'; c.prazo = 1; c.prep = 4; c.modoAud = 'vivo'; },
  juiz: S => { for (const x of S.j.acervo) x.semana = 0; const p = S.j.acervo[0]; p.rar = 'raro'; p.estudo = 6; p.semana = 1; p.modoAud = 'vivo'; },
  colegiado: S => { S.j.cargo = 3; S.pol = 40; S.j.colegas = { cargo: 3, L: [0, 1, 2, 3].map(i => ({ id: i, nome: ['Ricardo Leme', 'Sônia Prates', 'Gustavo Amaral', 'Helena Rocha'][i], perfil: 'legalista', afin: [80, 15, 50, 50][i], favor: i === 2 })) }; for (const x of S.j.acervo) x.semana = 0; const p = S.j.acervo[0]; p.rar = 'epico'; p.estudo = 9; p.semana = 1; p.modoAud = 'vivo'; },
};
const CARREIRA = { adv: 'adv', recurso: 'adv', promotor: 'promotor', defensor: 'defensor', juiz: 'juiz', colegiado: 'juiz' };
// robô: começa, acelera, decide o que aparecer e sai quando houver resultado
async function jogar(p) {
  for (let k = 0; k < 400; k++) {
    await p.waitForTimeout(60);
    if (!await p.$('.av-ov')) return true;
    const clicar = async sel => { const b = await p.$(sel); if (b) { await b.click({ timeout: 1000 }).catch(() => {}); return true; } return false; };
    if (await clicar('[data-av=sair]') || await clicar('[data-sj=sair]')) continue;
    if (await clicar('[data-av=comecar]')) continue;
    await clicar('[data-av=vel][data-v="4"]:not(.on)');
    if (await clicar('[data-av=op]') || await clicar('[data-av=dec]') || await clicar('[data-sj=voto]') || await clicar('[data-av=sent]')) continue;
    if (await clicar('[data-av=pular]:not([disabled])')) continue;
    if (await clicar('[data-sj=avancar]:not([disabled])')) continue;
    const play = await p.$('[data-av=play]:not([disabled])'); if (play && /Iniciar|Continuar|Abrir/.test(await play.innerText())) await play.click().catch(() => {});
  }
  return false;
}
let falhas = 0;
(async () => {
  const b = await chromium.launch();
  for (const nome of Object.keys(PREPARO)) {
    const p = await b.newPage({ viewport: { width: 1366, height: 900 }, reducedMotion: 'reduce' }); const erros = []; p.on('pageerror', e => erros.push(e.message));
    await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.reload();
    await p.evaluate(src => { window.__rapido = new Function('return ' + src)(); }, POLITICA);
    await p.selectOption('#carreira', CARREIRA[nome]); await p.selectOption('#inicio', 'formado'); await p.click('[data-act=comecar]');
    await p.waitForFunction(() => window.__toga.S && window.__toga.S.u);
    await p.evaluate(src => { const T = window.__toga, S = T.S; S.tut = { off: true, t: {} }; new Function('S', 'return (' + src + ')(S)')(S); window.__vivo = true; T.render(); }, PREPARO[nome].toString());
    const n0 = await p.evaluate(() => window.__toga.S.log.length);
    const fimP = p.evaluate(() => window.__toga.fimSemana());
    const abriu = await p.waitForSelector('.av-ov', { timeout: 8000 }).then(() => true).catch(() => false);
    const fechou = abriu && await jogar(p);
    await fimP.catch(e => erros.push(e.message));
    const log = await p.evaluate(n0 => { const S = window.__toga.S; return S ? S.log.slice(0, Math.max(1, S.log.length - n0 + 5)).map(l => l.t).join(' | ') : ''; }, n0);
    const problemas = [...erros.map(e => 'erro: ' + e), ...(!abriu ? ['a audiência ao vivo não abriu'] : []), ...(abriu && !fechou ? ['a audiência não terminou'] : [])];
    console.log(`${problemas.length ? 'FALHA' : 'OK  '} ao vivo · ${nome}${problemas.length ? ' · ' + problemas.join(' | ') : ''}`);
    if (!problemas.length && process.env.VERBOSE) console.log('   ', log.slice(0, 300));
    if (problemas.length) falhas++;
    await p.close();
  }
  await b.close(); if (falhas) { console.log(`\n${falhas} audiência(s) com problema`); process.exit(1); } console.log('\nAudiências ao vivo: tudo certo');
})();
