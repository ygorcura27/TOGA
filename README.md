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
