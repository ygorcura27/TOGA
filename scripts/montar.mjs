// Monta o index.html (jogo em arquivo único, usado pelo Netlify e pelo Artifact) a partir de src/.
// Edite os arquivos em src/ e rode `npm run montar`. Com --check, só confere se o index.html está em dia.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const ler = f => readFileSync(f, 'utf8');
const js = readdirSync('src/js').filter(f => f.endsWith('.js')).sort().map(f => ler(`src/js/${f}`)).join('');
const html = ler('src/head.html') + '<style>\n' + ler('src/estilo.css') + '</style>\n' + ler('src/corpo.html') + '<script>\n' + js + '</script>\n' + ler('src/rodape.html');

if (process.argv.includes('--check')) {
  const atual = ler('index.html');
  if (atual !== html) { console.error('index.html está desatualizado em relação a src/. Rode: npm run montar'); process.exit(1); }
  console.log('index.html em dia com src/');
} else { writeFileSync('index.html', html); console.log('index.html montado a partir de src/'); }
