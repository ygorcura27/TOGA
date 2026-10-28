// Gera dist/ para o Netlify: envolve o index.html (que não tem <html>/<head>/<body>) num documento completo
// e adiciona o módulo online do Firebase. A config vem da variável FIREBASE_CONFIG (JSON) ou de web/firebase-config.js.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';

const src = readFileSync('index.html', 'utf8');
const corte = src.indexOf('</style>') + '</style>'.length;
if (corte < 8) throw new Error('index.html sem </style>: estrutura inesperada');
const head = src.slice(0, corte), body = src.slice(corte);

mkdirSync('dist', { recursive: true });
writeFileSync('dist/index.html', `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="TOGA: uma vida no Direito. Faculdade, OAB, advocacia, magistratura, Ministério Público, Defensoria, família e dinastia.">
${head}
</head>
<body>
${body}
<script src="firebase-config.js"></script>
<script type="module" src="online.js"></script>
</body>
</html>
`);
copyFileSync('web/online.js', 'dist/online.js');

const env = process.env.FIREBASE_CONFIG;
if (env) {
  const cfg = JSON.parse(env);
  if (!cfg.apiKey || !cfg.projectId) throw new Error('FIREBASE_CONFIG precisa de apiKey e projectId');
  writeFileSync('dist/firebase-config.js', `window.TOGA_FIREBASE = ${JSON.stringify(cfg)};\n`);
  console.log(`Firebase ligado: projeto ${cfg.projectId}`);
} else {
  copyFileSync('web/firebase-config.js', 'dist/firebase-config.js');
  console.log('FIREBASE_CONFIG não definida: usando web/firebase-config.js');
}
console.log('dist/ pronto');
