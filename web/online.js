// TOGA online: login (anônimo + Google), save na nuvem e Hall da Fama global no Firebase.
// Só é carregado na versão do Netlify. Sem configuração, o jogo segue 100% offline.
const cfg = window.TOGA_FIREBASE;
if (cfg && cfg.apiKey) iniciar().catch(e => console.warn('TOGA online desligado:', e));

async function iniciar() {
  const V = '10.12.2', base = `https://www.gstatic.com/firebasejs/${V}`;
  const { initializeApp } = await import(`${base}/firebase-app.js`);
  const A = await import(`${base}/firebase-auth.js`);
  const F = await import(`${base}/firebase-firestore.js`);
  const app = initializeApp(cfg), auth = A.getAuth(app), db = F.getFirestore(app);
  // para testes locais: { ..., emulador: true } liga nos emuladores do Firebase
  if (cfg.emulador) { A.connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true }); F.connectFirestoreEmulator(db, '127.0.0.1', 8085); }
  const google = new A.GoogleAuthProvider();
  let user = null, pronto = false, timer = null, ultimo = '', cacheHall = null;

  const avisar = () => window.dispatchEvent(new CustomEvent('toga-online'));
  const api = {
    get ativo() { return pronto; },
    get user() { return user; },
    get logado() { return !!user && !user.isAnonymous; },
    get nome() { return user && (user.displayName || user.email) || ''; },
    async login() {
      try {
        if (user && user.isAnonymous) await A.linkWithPopup(user, google);
        else await A.signInWithPopup(auth, google);
      } catch (e) {
        // a conta Google já existe: entra nela (o save anônimo não tem nada na nuvem)
        if (e.code === 'auth/credential-already-in-use' || e.code === 'auth/email-already-in-use') {
          const cred = A.GoogleAuthProvider.credentialFromError(e);
          if (cred) await A.signInWithCredential(auth, cred); else await A.signInWithPopup(auth, google);
        } else if (e.code !== 'auth/popup-closed-by-user' && e.code !== 'auth/cancelled-popup-request') throw e;
      }
      user = auth.currentUser; avisar();
      if (api.logado) await sincronizar();
    },
    async logout() { await A.signOut(auth); await A.signInAnonymously(auth); },
    // salva com atraso para juntar várias gravações seguidas numa só
    salvar(S) {
      if (!api.logado || !S) return;
      clearTimeout(timer);
      timer = setTimeout(async () => {
        const data = JSON.stringify(S); if (data === ultimo) return;
        try {
          await F.setDoc(F.doc(db, 'saves', user.uid), { data, nome: S.nome, semana: S.semana, salvoEm: S.salvoEm || Date.now(), atualizado: F.serverTimestamp() });
          ultimo = data;
        } catch (e) { console.warn('Falha ao salvar na nuvem', e); }
      }, 1500);
    },
    async apagar() {
      if (!api.logado) return; clearTimeout(timer); ultimo = '';
      try { await F.deleteDoc(F.doc(db, 'saves', user.uid)); } catch (e) { console.warn(e); }
    },
    async enviarHall(v) {
      if (!user) return;
      const e = { uid: user.uid, nome: String(v.nome).slice(0, 40), geracao: v.geracao | 0, carreira: String(v.carreira).slice(0, 60), resumo: String(v.resumo).slice(0, 120),
        idade: v.idade | 0, prest: v.prest | 0, patrimonio: Math.round(v.patrimonio) || 0, conq: v.conq | 0, pontos: v.pontos | 0, motivo: String(v.motivo).slice(0, 20),
        data: v.data, criado: F.serverTimestamp() };
      try { await F.addDoc(F.collection(db, 'hall'), e); cacheHall = null; } catch (err) { console.warn('Falha ao enviar ao Hall da Fama', err); }
    },
    async topHall(n = 20) {
      if (cacheHall && Date.now() - cacheHall.t < 60000) return cacheHall.l;
      const q = F.query(F.collection(db, 'hall'), F.orderBy('pontos', 'desc'), F.limit(n));
      const snap = await F.getDocs(q); const l = snap.docs.map(d => ({ ...d.data(), meu: user && d.data().uid === user.uid }));
      cacheHall = { t: Date.now(), l }; return l;
    },
  };

  // ao entrar com Google: decide entre o save da nuvem e o do navegador
  async function sincronizar() {
    let nuvem = null;
    try { const s = await F.getDoc(F.doc(db, 'saves', user.uid)); if (s.exists()) nuvem = s.data(); } catch (e) { console.warn(e); return; }
    const local = window.TOGA_JOGO.estado();
    if (!nuvem) { if (local) { ultimo = ''; api.salvar(local); } return; }
    let dados; try { dados = JSON.parse(nuvem.data); } catch (e) { return; }
    if (!local) { window.TOGA_JOGO.carregarEstado(dados); return; }
    if (nuvem.data === JSON.stringify(local)) { ultimo = nuvem.data; return; }
    const usar = await window.TOGA_JOGO.escolherSave(
      { nome: nuvem.nome, semana: nuvem.semana, salvoEm: nuvem.salvoEm },
      { nome: local.nome, semana: local.semana, salvoEm: local.salvoEm });
    if (usar === 'nuvem') { ultimo = nuvem.data; window.TOGA_JOGO.carregarEstado(dados); }
    else { ultimo = ''; api.salvar(local); }
  }

  window.TOGA_ONLINE = api;
  let primeira = true;
  A.onAuthStateChanged(auth, async u => {
    user = u;
    if (!u) { await A.signInAnonymously(auth).catch(e => console.warn('Login anônimo desligado no Firebase', e)); return; }
    pronto = true; avisar();
    if (primeira) { primeira = false; if (api.logado) await sincronizar(); }
  });
}
