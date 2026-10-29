# Publicar o TOGA online

**No ar em https://toga-jogo.netlify.app.** O save na nuvem e o Hall da Fama global funcionam só com o Netlify:
- `netlify/functions/conta.mts` (`/api/conta`): cria conta e faz login com usuário e senha. A senha é guardada como hash scrypt com sal, e o login devolve um token de sessão. Limite de 10 tentativas por minuto.
- `netlify/functions/save.mts` (`/api/save`): GET, PUT ou DELETE do jogo salvo. O dono é identificado pelo token da conta (cabeçalho `Authorization: Bearer`) ou por um código de save de 16 caracteres.
- `netlify/functions/hall.mts` (`/api/hall`): POST de uma vida encerrada e GET do top 20.
- Os dados ficam em Netlify Blobs, nos stores `saves` e `hall`. As duas funções têm limite de requisições por IP.
- No navegador, `web/online-netlify.js` cria ou usa o código, grava sozinho e pergunta qual save usar quando a nuvem e o navegador divergem.

O Firebase (abaixo) é opcional e substitui o save por código pelo login com Google. Quando `FIREBASE_CONFIG` existe, o módulo do Netlify se desliga.

# Opção com Firebase (Netlify + Firebase)

O jogo funciona sem Firebase: sem configuração, ele roda offline e salva só no navegador.
Com Firebase, ganha **login com Google, save na nuvem** (continuar em outro aparelho) e **Hall da Fama global**.

## 1. Firebase (banco de dados e login)
1. Acesse https://console.firebase.google.com e clique em **Adicionar projeto** (por exemplo, `toga-jogo`). O Google Analytics é opcional.
2. **Authentication → Começar → Método de login**: ative **Google** e **Anônimo**.
   - O login anônimo serve para enviar vidas ao Hall da Fama sem pedir conta.
   - O login com Google serve para o save na nuvem.
3. **Firestore Database → Criar banco de dados**: escolha o modo de produção e a região `southamerica-east1` (São Paulo).
4. **Firestore → Regras**: cole o conteúdo de [`firestore.rules`](../firestore.rules) e clique em **Publicar**.
5. **Configurações do projeto (engrenagem) → Seus apps → Web (`</>`)**: registre o app (sem Hosting). Copie o objeto `firebaseConfig`.
6. Depois do deploy no Netlify, volte em **Authentication → Configurações → Domínios autorizados** e adicione o domínio do site (por exemplo, `toga-jogo.netlify.app`).

## 2. Netlify (site com link)
1. Acesse https://app.netlify.com e clique em **Add new site → Import an existing project → GitHub**. Escolha o repositório `ygorcura27/TOGA`.
2. As configurações de build já vêm do `netlify.toml`: comando `node scripts/build.mjs` e pasta `dist`. Não precisa mudar nada.
3. Antes de publicar, ou depois em **Site configuration → Environment variables**, crie a variável `FIREBASE_CONFIG` com o objeto do passo 1.5 em JSON, numa linha só:
   ```json
   {"apiKey":"...","authDomain":"toga-jogo.firebaseapp.com","projectId":"toga-jogo","storageBucket":"toga-jogo.appspot.com","messagingSenderId":"...","appId":"..."}
   ```
4. Clique em **Deploy**. Se você criou a variável depois do primeiro deploy, rode **Deploys → Trigger deploy**.
5. Em **Site configuration → Change site name**, escolha o nome do link (`https://NOME.netlify.app`).

A cada `git push` na branch `main`, o Netlify publica a nova versão sozinho.

## Como funciona
- `index.html` é o jogo, igual ao da versão publicada no Claude.
- `scripts/build.mjs` gera `dist/` com um documento HTML completo, o `online.js` e o `firebase-config.js` montado a partir de `FIREBASE_CONFIG`.
- `web/online.js` carrega o SDK do Firebase e cuida de:
  - login anônimo automático e login com Google;
  - save na nuvem, uma gravação por vez com 1,5 s de espera;
  - escolher entre o save da nuvem e o do navegador quando eles diferem;
  - enviar vidas encerradas ao Hall da Fama global e ler o top 20.
- **Firestore:**
  - `saves/{uid}`: o jogo salvo em JSON. Só o dono, com conta Google, lê e escreve.
  - `hall/{id}`: as vidas do ranking. Todos leem; cada jogador só cria registros próprios, com campos e limites validados; ninguém edita nem apaga.

## Limitações
- O cálculo dos pontos roda no navegador, então quem souber mexer no console pode inflar a pontuação dentro do limite das regras (até 5.000). Para um ranking à prova de trapaça, seria preciso validar a vida num servidor (Cloud Functions).
- O plano gratuito do Firebase (Spark) cobre com folga um jogo pequeno: 50 mil leituras e 20 mil gravações por dia.

## Testar localmente com emuladores
```bash
npm i -g firebase-tools
firebase emulators:start --only firestore,auth --project demo-toga
# em web/firebase-config.js, use temporariamente:
# window.TOGA_FIREBASE = {apiKey:"demo-key",authDomain:"localhost",projectId:"demo-toga",emulador:true};
node scripts/build.mjs && npx serve dist
```
