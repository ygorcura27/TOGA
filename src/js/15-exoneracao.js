// ===================== EXONERAÇÃO =====================
async function exonerar(){
  if(ocupado||S.carreira==='adv') return;
  const cargo=S.carreira==='juiz'?nomeCargo(S.j.cargo):S.carreira==='promotor'?fem(CARGOS_MP[S.p.cargo].nome):fem(CARGOS_DP[S.d.cargo].nome);
  const com=comarcaAtual(), novoP=clamp(Math.round(S.prest*.9),15,100);
  const v=await modal(`<h2>Pedir exoneração?</h2><p>Você deixa o cargo de ${cargo} e volta à advocacia privada, com escritório em ${CIDADES[com].nome}. Os processos ficam com quem assumir o seu lugar.</p>
    <dl class="meta"><dt>Prestígio na advocacia</dt><dd class="num">${novoP}</dd><dt>Salário fixo</dt><dd class="lo">acaba</dd><dt>Quarentena</dt><dd>12 meses com −5 em casos de ${CIDADES[com].nome}</dd></dl>
    <p style="font-size:12px;color:var(--muted)">A fama de ex-${cargo.toLowerCase()} atrai clientes maiores. Quem sai do cargo fica um tempo sem poder atuar onde trabalhava.</p>`,
    [{t:'Ficar no cargo',v:0,cls:'ghost'},{t:'Pedir exoneração',v:1}]);
  if(!v) return;
  S.ex={cargo,comarca:com,ate:S.semana+12}; S.carreira='adv'; S.u=estruturaInicial(false); S.bolso=Math.round(S.caixa/2); S.caixa-=S.bolso; S.sede=com; S.filiais=[]; S.casos=[]; S.aReceber=0; S.prest=novoP;
  S.agenda.estudo=0; S.agenda.lazer=0; gerarOfertas(); view='escritorio';
  addLog(`Exoneração publicada. Ex-${cargo.toLowerCase()}, você abriu escritório em ${CIDADES[com].nome}.`,'g'); salvar(); render();
}

