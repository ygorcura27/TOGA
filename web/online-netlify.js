// TOGA online sem Firebase: conta simples (usuário e senha) ou código de save, e Hall da Fama global,
// pelas funções do Netlify (/api/conta, /api/save, /api/hall). Implementa a interface window.TOGA_ONLINE que o jogo usa.
// Fica desligado se o Firebase estiver configurado.
if (!(window.TOGA_FIREBASE && window.TOGA_FIREBASE.apiKey)) iniciar();

function iniciar() {
  const ls = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) {} } };
  const fmt = c => c ? c.match(/.{1,4}/g).join('-') : '';
  const limpo = c => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  // dono do save: {tipo:'conta', usuario, token} ou {tipo:'codigo', codigo}
  let dono = null;
  try { dono = JSON.parse(ls.get('toga-conta') || 'null'); } catch (e) {}
  if (!dono && ls.get('toga-codigo')) dono = { tipo: 'codigo', codigo: ls.get('toga-codigo') };
  let timer = null, ultimo = '', cacheHall = null, status = '';
  const avisar = () => window.dispatchEvent(new CustomEvent('toga-online'));
  const guardar = () => { ls.set('toga-conta', dono && dono.tipo === 'conta' ? JSON.stringify(dono) : null); ls.set('toga-codigo', dono && dono.tipo === 'codigo' ? dono.codigo : null); };
  const tag = () => !dono ? '' : dono.tipo === 'conta' ? 'u:' + dono.usuario.slice(0, 6) : dono.codigo.slice(0, 4);

  async function req(metodo, url, corpo, d = dono) {
    const h = {}; if (corpo) h['content-type'] = 'application/json';
    let u = url;
    if (url === '/api/save' && d) { if (d.tipo === 'conta') h.authorization = 'Bearer ' + d.token; else u += '?codigo=' + d.codigo; }
    const r = await fetch(u, { method: metodo, headers: h, body: corpo ? JSON.stringify(corpo) : undefined });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { const e = new Error(j.erro || `erro ${r.status}`); e.status = r.status; throw e; }
    return j;
  }
  async function enviar(S) {
    const data = JSON.stringify(S); if (data === ultimo || !dono) return;
    try { await req('PUT', '/api/save', { data, nome: S.nome, semana: S.semana, salvoEm: S.salvoEm || Date.now() }); ultimo = data; status = 'salvo'; }
    catch (e) { status = 'falhou'; console.warn('Falha ao salvar na nuvem', e); if (e.status === 401) { dono = null; guardar(); } }
    avisar();
  }
  // escolhe entre o save da nuvem e o deste navegador
  async function sincronizar(d = dono) {
    let nuvem = null;
    try { nuvem = await req('GET', '/api/save', null, d); } catch (e) { if (e.status !== 404) throw e; }
    const local = window.TOGA_JOGO.estado();
    if (!nuvem) { if (local) { ultimo = ''; await enviar(local); } return 'novo'; }
    let dados; try { dados = JSON.parse(nuvem.data); } catch (e) { return 'erro'; }
    if (!local) { ultimo = nuvem.data; window.TOGA_JOGO.carregarEstado(dados); return 'carregado'; }
    if (nuvem.data === JSON.stringify(local)) { ultimo = nuvem.data; return 'igual'; }
    const usar = await window.TOGA_JOGO.escolherSave({ nome: nuvem.nome, semana: nuvem.semana, salvoEm: nuvem.salvoEm }, { nome: local.nome, semana: local.semana, salvoEm: local.salvoEm });
    if (usar === 'nuvem') { ultimo = nuvem.data; window.TOGA_JOGO.carregarEstado(dados); return 'carregado'; }
    ultimo = ''; await enviar(local); return 'enviado';
  }

  window.TOGA_ONLINE = {
    ativo: true,
    get logado() { return !!dono; },
    get nome() { return dono ? (dono.tipo === 'conta' ? dono.usuario : fmt(dono.codigo)) : ''; },
    textoEntrar: 'Entrar ou criar conta',
    descEntrar: 'Crie uma conta com usuário e senha para salvar na nuvem e continuar o jogo em qualquer navegador ou no celular.',
    get descConectado() {
      const falha = status === 'falhou' ? ' · <span class="lo">última gravação falhou, tentando de novo</span>' : '';
      return dono && dono.tipo === 'conta' ? `Conectado como <b>${dono.usuario}</b> · o progresso é salvo na nuvem${falha}.`
        : `Save na nuvem ativo · código <b class="num">${fmt(dono ? dono.codigo : '')}</b>${falha}. Anote o código para abrir o jogo em outro aparelho.`; },
    get textoSair() { return dono && dono.tipo === 'conta' ? 'Sair' : 'Desligar neste navegador'; },
    async login() {
      const r = await window.TOGA_JOGO.dialogoConta(); if (!r) return;
      let novo;
      if (r.tipo === 'criar' || r.tipo === 'entrar') {
        const j = await req('POST', '/api/conta', { acao: r.tipo, usuario: r.usuario, senha: r.senha });
        novo = { tipo: 'conta', usuario: j.usuario, token: j.token };
      } else {
        const c = limpo(r.codigo); if (c.length !== 16) throw new Error('O código tem 16 letras e números, como TOGA-7KQ2-M9XP-4HRT.');
        novo = { tipo: 'codigo', codigo: c };
      }
      const res = await sincronizar(novo);
      if (r.tipo === 'codigo' && res === 'novo' && !window.TOGA_JOGO.estado()) throw new Error('Nenhum jogo salvo com esse código.');
      dono = novo; guardar(); ultimo = ''; const S = window.TOGA_JOGO.estado(); if (S) await enviar(S); avisar();
    },
    async logout() { clearTimeout(timer); const S = window.TOGA_JOGO.estado(); if (S && dono) await enviar(S); dono = null; ultimo = ''; guardar(); avisar(); },
    salvar(S) { if (!dono || !S) return; clearTimeout(timer); timer = setTimeout(() => enviar(S), 1500); },
    async apagar() { if (!dono) return; clearTimeout(timer); ultimo = ''; try { await req('DELETE', '/api/save'); } catch (e) { console.warn(e); } },
    async enviarHall(v) { try { await req('POST', '/api/hall', { ...v, jogador: tag() }); cacheHall = null; } catch (e) { console.warn('Falha ao enviar ao Hall da Fama', e); } },
    async topHall() {
      if (cacheHall && Date.now() - cacheHall.t < 30000) return cacheHall.l;
      const t = tag(), l = (await req('GET', '/api/hall')).map(v => ({ ...v, meu: !!t && v.jogador === t }));
      cacheHall = { t: Date.now(), l }; return l;
    },
  };
  // ao abrir o jogo já conectado, puxa da nuvem se este navegador estiver sem jogo ou com outro
  if (dono) { const tentar = () => window.TOGA_JOGO ? sincronizar().catch(e => { console.warn('Sincronização falhou', e); if (e.status === 401) { dono = null; guardar(); } }).finally(avisar) : setTimeout(tentar, 200); tentar(); }
  avisar();
}
