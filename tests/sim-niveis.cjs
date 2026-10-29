// Simulação econômica por nível do escritório: monta um escritório em cada nível, um robô joga N meses
// e mede o ganho líquido mensal (honorários e partido menos salários, aluguel e custo de vida), comparando com o juiz.
// Rodar: node tests/sim-niveis.cjs [meses]   (demora alguns minutos)
const { chromium } = require('playwright');
const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '..', 'index.html') + '?teste';
const MESES = +(process.argv[2] || 24);
const PERFIS_TODOS = [
  { nivel: 0, imovel: 0, advs: 0, estag: 0, filiais: [], clientes: 0, prest: 30, anos: 0, skill: 55, areas: null },
  { nivel: 1, imovel: 1, advs: 2, estag: 1, filiais: [], clientes: 1, prest: 40, anos: 2, skill: 62, areas: 2 },
  { nivel: 2, imovel: 1, advs: 4, estag: 2, filiais: ['sp:paulista'], clientes: 2, prest: 50, anos: 4, skill: 70, areas: 3 },
  { nivel: 3, imovel: 2, advs: 8, estag: 3, filiais: ['sp:paulista', 'rj'], clientes: 4, prest: 68, anos: 7, skill: 76, areas: 4 },
  { nivel: 4, imovel: 2, advs: 15, estag: 4, filiais: ['sp:paulista', 'sp:farialima', 'rj', 'bh', 'df'], clientes: 6, prest: 82, anos: 11, skill: 82, areas: 'full' },
];
const PERFIS = process.env.NIVEL!=null ? [PERFIS_TODOS[+process.env.NIVEL]] : PERFIS_TODOS;
const drenar = async p => { for (let k = 0; k < 4000; k++) { const fim = await p.evaluate(() => window.__fim); const ov = await p.$('.ov');
  if (fim && !ov) return; if (!ov) { await p.waitForTimeout(20); continue; }
  const opt = await p.$('.ov .opt:not([disabled])'); if (opt) { await opt.click().catch(() => {}); continue; }
  const bs = await p.$$('.ov [data-mi]:not([disabled])'); if (bs.length) await bs[bs.length - 1].click().catch(() => {}); else await p.waitForTimeout(30); } };
(async () => {
  const b = await chromium.launch(), res = [];
  for (const P of PERFIS) {
    const p = await b.newPage({ reducedMotion: 'reduce' }); const erros = []; p.on('pageerror', e => erros.push(e.message));
    await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.reload();
    await p.selectOption('#inicio', 'formado'); await p.click('[data-act=comecar]'); await p.waitForTimeout(300);
    await p.evaluate(P => { const T = window.__toga, S = T.S; S.tut = { off: true, t: {} }; S.semResumo = true; S.semana = 12 * P.anos + 13; S.u.fundado = 1; S.prest = P.prest;
      const AR = ['penal', 'civel', 'trabalho', 'familia', 'empresarial', 'tributario'];
      for (const k of AR) S.skills[k] = Math.min(P.skill, 91); for (const k of ['oratoria', 'escrita', 'pesquisa', 'negociacao', 'analise']) S.skills[k] = P.skill; S.ac.titulos.areas = Object.fromEntries(AR.map(a => [a, 1]));
      S.u.imovel = P.imovel; S.u.equipe = []; const fun = ['pleno', 'senior', 'pleno', 'junior'];
      for (let i = 0; i < P.advs; i++) { const c = T.gerarCandidato(fun[i % 4], AR[i % 6]); c.moral = 75; S.u.equipe.push(c); }
      for (let i = 0; i < P.estag; i++) S.u.equipe.push(T.gerarCandidato('estagiario'));
      if (P.advs >= 4) S.u.equipe.push(T.gerarCandidato('gestor'));
      S.filiais = P.filiais.slice(); S.u.full = P.areas === 'full'; S.u.areas = P.areas === 'full' ? AR.slice() : AR.slice(0, P.areas || 1);
      S.clientes = Array.from({ length: P.clientes }, (_, i) => ({ id: 9000 + i, nome: 'Cliente ' + i, area: AR[i % 6], satisf: 70, partido: 3000, casos: 2, desde: 1 }));
      S.caixa = 300000; S.bolso = 50000; T.salvar(); }, P);
    await p.reload(); await p.waitForTimeout(300);
    const t = await p.evaluate(() => window.__toga.TIERS[window.__toga.tierEscritorio()].nome);
    const ini = await p.evaluate(() => { const S = window.__toga.S; return S.caixa + S.bolso; });
    for (let m = 0; m < MESES; m++) {
      await p.evaluate(() => { const T = window.__toga, S = T.S;
        // aceita casos com chance de pelo menos 40% enquanto houver vaga
        for (const c of [...S.ofertas].sort((a, b) => T.calcChance(b).ch - T.calcChance(a).ch)) if (T.casos1() < T.maxCasos() && T.calcChance(c).ch >= .4) { S.casos.push(c); S.ofertas = S.ofertas.filter(x => x !== c); }
        // reparte os blocos livres entre os casos, priorizando a manutenção e os prazos curtos
        let livre = T.livres(); const L = [...S.casos].sort((a, b) => a.prazo - b.prazo);
        while (livre > 0 && L.length) { const c = L.reduce((a, x) => ((x.semana || 0) - T.manut(x) - (x.prep || 0) / 4 < (a.semana || 0) - T.manut(a) - (a.prep || 0) / 4 ? x : a)); c.semana = (c.semana || 0) + 1; livre--; }
        // retirada mensal para pagar o custo de vida
        if (S.caixa > 20000) { S.bolso += 15000; S.caixa -= 15000; }
        window.__fim = false; T.fimSemana().finally(() => { window.__fim = true; }); });
      await drenar(p);
    }
    const r = await p.evaluate(ini => { const T = window.__toga, S = T.S; return S && { ganhoMes: Math.round((S.caixa + S.bolso - ini) / 1), equipe: S.u.equipe.length, clientes: (S.clientes || []).length, prest: Math.round(S.prest), vit: S.vitorias, der: S.derrotas, nivel: T.TIERS[T.tierEscritorio()].nome }; }, ini);
    r.ganhoMes = Math.round(r.ganhoMes / MESES); res.push({ perfil: t, ...r, erros: erros.length });
    console.log(`${t.padEnd(22)} ganho líquido ≈ ${('R$ ' + r.ganhoMes.toLocaleString('pt-BR')).padStart(12)}/mês · ${r.vit}V ${r.der}D · equipe ${r.equipe} · clientes ${r.clientes} · prestígio ${r.prest}${erros.length ? ' · ERROS: ' + erros[0] : ''}`);
    await p.close();
  }
  const j = await (async () => { const p = await b.newPage(); await p.goto(URL); const v = await p.evaluate(() => { const T = window.__toga; return T.CARGOS.map(c => [c.nome, c.salario - T.CUSTO_VIDA_MAG]); }); await p.close(); return v; })();
  console.log('\nJuiz, líquido por mês (salário menos custo de vida): ' + j.map(([n, v]) => `${n} R$ ${v.toLocaleString('pt-BR')}`).join(' · '));
  await b.close();
})();
