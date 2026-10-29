# TOGA — Uma vida no Direito

Protótipo jogável de simulação de carreira jurídica. Tudo roda num único arquivo, `index.html`, sem build: basta abrir no navegador.

## O que já existe no protótipo
- **Faculdade de Direito** (vestibular, 10 semestres, CR, estágio, iniciação científica, núcleo de prática) e **Exame da OAB**.
- **Carreiras:** advocacia, juiz (por vara, até o STF), promotor, defensor público e carreira acadêmica. Concursos, promoções, exoneração.
- **Casos** no sistema skill × dificuldade × chance, com estratégia, apoios, momento decisivo, veredito e recursos até o STF.
- **Mapas:** região (São Paulo e Rio), Brasil e mundo.
- **Estrutura e equipe:** planta em blueprint, cômodos, contratação, gestor, organização, finanças do escritório e orçamento público por efetividade.
- **Vida pessoal:** idade, saúde, felicidade, parceiro com personalidade, casamento, filhos, moradia, aposentadoria e dinastia.
- **Academia:** especialização, mestrado, doutorado, artigos, livros, docência e palestras.
- **Finanças pessoais:** casa e carro com financiamento, investimentos e imóveis para alugar.
- **Amigos e rivais da faculdade** que seguem carreira e cruzam o seu caminho.
- **Conquistas da dinastia e Hall da Fama.**

## Documentos
- `docs/GDD.md`: documento de design, atualizado com os sistemas e números do protótipo; a seção 14 reúne a visão de produto ainda não implementada.
- `docs/ideia-inicial-lexsystem.md`: primeira ideia, inspirada no MetroSystem.

## Como jogar
- Versão publicada: https://claude.ai/artifact/5mYeCmyvi3t7fpJi4qQm1R (privada; compartilhe pelo menu Share).
- Ou baixe o `index.html` e abra no navegador. O progresso fica salvo no próprio navegador.
- **Jogar online: https://toga-jogo.netlify.app** · conta com usuário e senha para salvar na nuvem (botão "Entrar ou criar conta"; o código de save também funciona) e Hall da Fama global, pelas funções do Netlify em `netlify/functions/`. O Firebase continua como opção: veja [`docs/DEPLOY.md`](docs/DEPLOY.md).

## Estrutura do código
- `src/`: o código-fonte do jogo, dividido por assunto.
  - `src/js/NN-*.js`: módulos em ordem de carregamento, como casos, magistratura, Ministério Público, Defensoria, estrutura, vida, academia, época, tutorial e resumo do mês.
  - `src/estilo.css`: o CSS do jogo.
  - `src/head.html`, `src/corpo.html` e `src/rodape.html`: o esqueleto da página.
- `index.html`: o jogo montado em arquivo único. **Não edite à mão:** altere `src/` e rode `npm run montar`.
- `scripts/montar.mjs`: monta o `index.html`. `scripts/build.mjs` gera `dist/` para o Netlify.
- `netlify/functions/`: contas, save na nuvem e Hall da Fama.
- `web/`: módulos online carregados só no site.

## Testes
```bash
npx playwright install chromium   # uma vez
npm test                          # confere se o index.html está montado, roda os testes de regras e joga 8 meses em cada carreira
```
- `tests/regras.test.cjs`: abre o jogo com `?teste` e confere as regras centrais: chance entre 5% e 95%, honorários de 20%, preparação por porte, manutenção, limite de casos, teto das áreas e retirada.
- `tests/carreiras.test.cjs`: começa cada carreira, joga alguns meses com um robô e falha se aparecer erro de JavaScript, texto antigo ("semana") ou save perdido. `MESES=24 npm test` joga mais tempo.
