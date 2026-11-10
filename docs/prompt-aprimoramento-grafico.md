# Prompt: aprimoramento gráfico do TOGA

Copie o bloco abaixo inteiro para a ferramenta ou sessão que vai fazer o trabalho.

---

Você vai aprimorar o visual do **TOGA**, um jogo de navegador sobre uma vida no Direito no Brasil (advocacia, juiz, promotor, defensor e carreira acadêmica). O repositório é `ygorcura27/TOGA` (branch `main`). Todo o texto do jogo é em português do Brasil e deve continuar assim.

## Objetivo
Deixar o jogo mais bonito, legível e com cara de produto acabado, **sem mudar nenhuma regra, número ou fluxo de jogo**. É um trabalho de direção de arte e interface: hierarquia visual, ritmo de espaçamento, tipografia, cor, ícones, ilustração e microinterações.

## Como o projeto funciona (leia antes de mexer)
- O código-fonte fica em `src/`: `head.html`, `estilo.css` (cerca de 490 linhas), `corpo.html`, `rodape.html` e 68 módulos em `src/js/NN-nome.js`, concatenados em ordem alfabética dentro de uma única IIFE.
- **Nunca edite `index.html` à mão.** Ele é gerado com `npm run montar`. Rode `npm test` antes de terminar (regras, carreiras e audiências ao vivo) e confirme "tudo certo" nos três.
- As telas são HTML montado em template strings dentro de funções como `renderEstrutura`, `pasta(c)`, `procCard`, `painelGestao` e `renderJornal`. Muitos módulos mais novos "embrulham" funções antigas (`f0=f; f=function(){…}`) e trocam pedaços do HTML com `.replace('</h3>', …)` ou `.replace('<div class="ctl">', …)`. **Se mudar a marcação de uma tela, procure com `grep` quem faz `replace` naquele trecho** e mantenha os marcadores (`</h3>` do título do cartão, `<div class="ctl">`, `<div class="chips">`, `class="panel"`, `data-act`, `data-id`, `data-v`), ou os módulos que dependem deles quebram em silêncio.
- Tudo é desenhado por código: SVG inline (planta do escritório, mapas, retratos em `35g`, ícones de área, gráficos em `35zzz`) e som por WebAudio. Não há imagens externas. Mantenha assim: nada de arquivos de imagem, CDNs novos ou bibliotecas. As fontes vêm do Google Fonts (Cormorant Garamond, Inter, JetBrains Mono); pode trocar Inter por outra face com mais personalidade, se justificar.

## Direção de arte atual (manter e elevar)
"**Tribunal Noturno**": papel e latão (bronze/dourado) no modo claro, azul-noite no modo escuro, títulos em serifa clássica, números em fonte mono. Há um botão de modo noturno e um de música no cabeçalho.
- Tokens de cor no `:root` de `estilo.css`: `--bg --surface --ink --muted --line --brass --brass-soft --gold --win --loss --warn --shadow --overlay`, as raridades `--r-comum --r-incomum --r-raro --r-epico --r-lendario`, os blocos da agenda `--b-case --b-apoio --b-estudo --b-lazer --b-familia --b-saude --b-descanso`, mapas `--land --land-edge --water` e pastas `--folder --folder-edge`. Fontes `--f-display --f-body --f-mono`.
- Todas as cores devem continuar saindo dos tokens. O tema precisa funcionar nos três estados: claro, escuro, e sem escolha (seguindo `prefers-color-scheme`).

## O que melhorar, em ordem de prioridade
1. **Sistema de componentes coerente.** Hoje há muitos estilos inline espalhados nos `.js` (`style="margin:0;font-size:12px;…"`). Crie classes utilitárias e de componente no CSS (nota, rótulo, linha de dado, grade de cartões, pílula de estado, seletor segmentado) e troque os estilos inline mais repetidos por elas. Padronize raios, bordas, sombras e espaçamentos numa escala (por exemplo 4, 8, 12, 16, 24).
2. **Cartão do caso (`pasta`, `procCard`, `mpCard`, `dpCard`).** É a peça mais vista do jogo. Deixe a raridade, a chance e o prazo legíveis num relance: raridade como faixa ou selo com a cor do token, chance com medidor e cor semântica, prazo como etiqueta. Os selos extras (época, cliente fixo, rival, perfil do cliente) devem caber sem bagunçar o cartão.
3. **Cabeçalho e medidores.** Caixa, prestígio, energia, estresse, saúde e felicidade competem entre si. Agrupe por tema (dinheiro, carreira, corpo) e dê destaque ao que pede atenção (energia abaixo de 30, estresse acima de 80).
4. **Aba Estrutura e equipe.** Hoje é uma pilha longa de painéis (Gestão, Trabalho nos casos, planta, nível, equipe, Plano de carreira, Recursos, Filiais). Organize em seções com navegação interna ou abas secundárias. Os cartões de foco do mês (Comercial, Jurídico, Administrativo, e Mutirão nas públicas) e a fila "Sua palavra final" devem parecer decisões importantes, não formulários.
5. **Audiência ao vivo** (`35c`, `35d`, `35h`). É o momento mais dramático: reforce a sensação de sala de tribunal (barra de convicção, feed de lances, fôlego, momentos decisivos), com animação contida.
6. **Jornal (Gazeta Forense, `35e`).** Já tem cara de jornal; refine a diagramação da manchete e das colunas.
7. **Mapas** (Região, Brasil, Mundo) e painel do lugar com a vocação da filial: deixe claro onde há escritório, o que cada lugar oferece e quanto custa.
8. **Retratos (`35g`).** Mais variedade (tons de pele, cabelos, acessórios) e, se der, envelhecimento com a idade do personagem.
9. **Microinterações:** estados de hover e foco visíveis, transições curtas, toasts de conquista e meta. Respeite `prefers-reduced-motion`.

## Regras que não podem ser quebradas
- **Celular:** tudo precisa funcionar em 390 px de largura, sem rolagem horizontal da página, com alvos de toque de pelo menos 40 px.
- **Acessibilidade:** contraste AA nos dois temas, foco visível no teclado e `aria-label` nos controles só com ícone.
- **Desempenho:** nada de bibliotecas novas; o `index.html` gerado não deve crescer mais de 30%.
- **Saves:** não mude a estrutura do objeto de estado `S` nem as chaves do `localStorage`.

## Como entregar
1. Antes de mudar o jogo, monte uma **prévia** com 2 ou 3 propostas de direção (uma evolução do Tribunal Noturno e alternativas) mostrando o cartão do caso, o cabeçalho e um painel da Estrutura, nos dois temas e no celular. Espere a escolha.
2. Implemente em etapas pequenas (componentes, depois cartão do caso, cabeçalho e assim por diante). A cada etapa: `npm run montar`, `npm test` e capturas de tela de desktop e celular nos dois temas, com Playwright (já instalado).
3. Faça commits descritivos em português e não mude regras de jogo. Se achar um bug de lógica no caminho, anote e pergunte antes de corrigir.
