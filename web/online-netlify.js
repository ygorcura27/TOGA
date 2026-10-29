// TOGA online sem Firebase: save na nuvem por código e Hall da Fama global, pelas funções do Netlify (/api/save, /api/hall).
// Implementa a mesma interface window.TOGA_ONLINE que o jogo já usa. Fica desligado se o Firebase estiver configurado.
if (!(window.TOGA_FIREBASE && window.TOGA_FIREBASE.apiKey)) iniciar();

function iniciar() {
  const CHAVE = 'toga-codigo';
  const ler = () => { try { return localStorage.getItem(CHAVE) || ''; } catch (e) { return ''; } };
  const gravar = c => { try { c ? localStorage.setItem(CHAVE, c) : localStorage.removeItem(CHAVE); } catch (e) {} };
  const fmt = c => c ? c.match(/.{1,4}/g).join('-') : '';
  const limpo = c => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const novoCodigo = () => { const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', r = crypto.getRandomValues(new Uint8Array(16)); return Array.from(r, x => A[x % A.length]).join(''); };
  let codigo = ler(), timer = null, ultimo = '', cacheHall = null, status = '';
  const avisar = () => window.dispatchEvent(new CustomEvent('toga-online'));

  async function req(metodo, url, corpo) {
    const r = await fetch(url, { method: metodo, headers: corpo ? { 'content-type': 'application/json' } : {}, body: corpo ? JSON.stringify(corpo) : undefined });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { const e = new Error(j.erro || `erro ${r.status}`); e.status = r.status; throw e; }
    return j;
  }
  async function enviar(S) {
    const data = JSON.stringify(S); if (data === ultimo || !codigo) return;
    try { await req('PUT', `/api/save?codigo=${codigo}`, { data, nome: S.nome, semana: S.semana, salvoEm: S.salvoEm || Date.now() }); ultimo = data; status = 'salvo'; }
    catch (e) { status = 'falhou'; console.warn('Falha ao salvar na nuvem', e); }
    avisar();
  }
  // escolhe entre o save da nuvem e o deste navegador
  async function sincronizar() {
    let nuvem = null;
    try { nuvem = await req('GET', `/api/save?codigo=${codigo}`); } catch (e) { if (e.status !== 404) throw e; }
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
    get logado() { return !!codigo; },
    get nome() { return fmt(codigo); },
    textoEntrar: 'Salvar na nuvem',
    descEntrar: 'Crie um código de save para continuar este jogo em outro navegador ou no celular, ou use um código que você já tem.',
    get descConectado() { return `Save na nuvem ativo · código <b class="num">${fmt(codigo)}</b>${status === 'falhou' ? ' · <span class="lo">última gravação falhou, tentando de novo</span>' : ''}. Anote o código para abrir o jogo em outro aparelho.`; },
    textoSair: 'Desligar neste navegador',
    async login() {
      const r = await window.TOGA_JOGO.dialogoCodigo(fmt(novoCodigo()));
      if (!r) return;
      const c = limpo(r.codigo); if (c.length !== 16) throw new Error('O código tem 16 letras e números, como TOGA-7KQ2-M9XP-4HRT.');
      const antigo = codigo; codigo = c;
      try {
        if (r.tipo === 'usar') { const res = await sincronizar(); if (res === 'novo' && !window.TOGA_JOGO.estado()) throw new Error('Nenhum jogo salvo com esse código.'); }
        else { const local = window.TOGA_JOGO.estado(); if (local) { ultimo = ''; await enviar(local); } }
        gravar(codigo); avisar();
      } catch (e) { codigo = antigo; throw e; }
    },
    async logout() { clearTimeout(timer); codigo = ''; ultimo = ''; gravar(''); avisar(); },
    salvar(S) { if (!codigo || !S) return; clearTimeout(timer); timer = setTimeout(() => enviar(S), 1500); },
    async apagar() { if (!codigo) return; clearTimeout(timer); ultimo = ''; try { await req('DELETE', `/api/save?codigo=${codigo}`); } catch (e) { console.warn(e); } },
    async enviarHall(v) { try { await req('POST', '/api/hall', { ...v, jogador: codigo.slice(0, 4) }); cacheHall = null; } catch (e) { console.warn('Falha ao enviar ao Hall da Fama', e); } },
    async topHall() {
      if (cacheHall && Date.now() - cacheHall.t < 30000) return cacheHall.l;
      const l = (await req('GET', '/api/hall')).map(v => ({ ...v, meu: !!codigo && v.jogador === codigo.slice(0, 4) }));
      cacheHall = { t: Date.now(), l }; return l;
    },
  };
  // ao abrir o jogo com um código salvo, puxa da nuvem se este navegador estiver sem jogo ou com outro
  if (codigo) { const tentar = () => window.TOGA_JOGO ? sincronizar().catch(e => console.warn('Sincronização falhou', e)).finally(avisar) : setTimeout(tentar, 200); tentar(); }
  avisar();
}
