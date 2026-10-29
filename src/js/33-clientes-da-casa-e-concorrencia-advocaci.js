// ===================== CLIENTES DA CASA E CONCORRÊNCIA (advocacia) =====================
// clientes satisfeitos viram fixos: pagam partido mensal e mandam casos; escritórios rivais disputam clientes e advogados
const RIVAIS_NOMES=['Mattos & Leme Advogados','Rocha Carvalho Sociedade de Advogados','Prates, Amaral & Associados','Nogueira Freitas Advocacia','Campos Vieira Advogados'];
function rivais(){ if(!S.rivais){ const L=[...RIVAIS_NOMES].sort(()=>Math.random()-.5).slice(0,3); S.rivais=L.map(n=>({nome:n,prest:rint(30,65)})); } return S.rivais; }
const partidoDe=c=>clamp(Math.round(c.valor*.0015/100)*100,800,8000);
function clienteVitoria(c){ if(S.carreira!=='adv') return; S.clientes=S.clientes||[];
  const f=c.clienteFixo&&S.clientes.find(x=>x.id===c.clienteFixo);
  if(f){ f.satisf=clamp(f.satisf+10,0,100); f.casos++; return; }
  if((c.inst||1)===1&&RORD.indexOf(c.rar)>=2&&S.clientes.length<8&&Math.random()<.35){
    const n={id:++uid,nome:c.cliente,area:c.area,satisf:65,partido:partidoDe(c),casos:1,desde:S.semana};
    S.clientes.push(n); addLog(`${n.nome} gostou do resultado e virou cliente fixo: partido de ${brl(n.partido)} por mês.`,'g'); } }
function clienteDerrota(c){ if(S.carreira!=='adv'||!c.clienteFixo) return; const f=(S.clientes||[]).find(x=>x.id===c.clienteFixo); if(f) f.satisf=clamp(f.satisf-20,0,100); }
function ofertasClientes(){ if(S.carreira!=='adv') return; for(const f of S.clientes||[]) if(Math.random()<.3){
  const a=areasAtivas().includes(f.area)?f.area:areaOferta(S.sede), c=novoCaso(S.sede,{},a); c.cliente=f.nome; c.clienteFixo=f.id; S.ofertas.push(c); } }
async function semanaClientes(){ if(S.carreira!=='adv') return; const U=S.u, L=S.clientes||[], R=rivais();
  let tot=0; const mt=TIERS[tierEscritorio()].partido; for(const f of L){ const v=Math.round(f.partido*mt/100)*100; S.caixa+=v; U.honSemana+=v; tot+=v; }
  if(tot) addLog(`Partido mensal de ${L.length} cliente${L.length>1?'s':''} fixo${L.length>1?'s':''}: ${brl(tot)}.`);
  for(const f of [...L]){ const rv=pick(R);
    if(f.satisf<=20){ S.clientes=S.clientes.filter(x=>x!==f); addLog(`${f.nome} se cansou dos resultados e deixou o escritório.`,'r'); }
    else if(f.satisf<50&&Math.random()<.05){ S.clientes=S.clientes.filter(x=>x!==f); rv.prest=clamp(rv.prest+2,0,100); addLog(`${f.nome} trocou o seu escritório pelo ${rv.nome}.`,'r'); } }
  for(const r of R) r.prest=clamp(r.prest+rnd(-1.5,1.5)+(55-r.prest)*.02,5,100);
  // rival tenta levar um advogado bom e insatisfeito
  const alvo=U.equipe.filter(f=>['pleno','senior'].includes(f.funcao)&&f.moral<75).sort((a,b)=>b.q-a.q)[0];
  if(alvo&&Math.random()<.04){ const rv=pick(R), novo=Math.round(alvo.sal*1.25/50)*50;
    const v=await modal(`<h2>Proposta da concorrência</h2><p>O ${esc(rv.nome)} ofereceu a ${esc(alvo.nome)} (${nomeFuncao(alvo).toLowerCase()}, qualidade ${Math.round(alvo.q)}) um salário maior para mudar de escritório.</p>
      <div class="opts"><button class="opt" data-mv="cobrir"><span>Cobrir a proposta</span><b class="num">${brl(novo)}/mês</b><small>Salário +25% e moral +15. ${esc(alvo.nome.split(' ')[0])} fica.</small></button>
      <button class="opt" data-mv="deixar"><span>Deixar ir</span><b class="num">−1 advogado</b><small>Você economiza o salário, mas perde os blocos e pode perder um cliente junto.</small></button></div>`,[]);
    if(v==='cobrir'){ alvo.sal=novo; alvo.salBase=novo; alvo.moral=clamp(alvo.moral+15,0,100); addLog(`Você cobriu a proposta do ${rv.nome}: ${alvo.nome} fica por ${brl(novo)}/mês.`,'g'); }
    else { removeFunc(alvo.id); rv.prest=clamp(rv.prest+3,0,100); addLog(`${alvo.nome} foi para o ${rv.nome}.`,'r');
      const cl=(S.clientes||[]).find(x=>x.area===alvo.area); if(cl&&Math.random()<.5){ S.clientes=S.clientes.filter(x=>x!==cl); addLog(`E levou o cliente ${cl.nome}.`,'r'); } } } }
function painelClientes(){ const L=S.clientes||[], R=rivais(), ranking=[{nome:'Seu escritório',prest:S.prest,eu:true},...R].sort((a,b)=>b.prest-a.prest);
  return `<section class="panel"><div class="panel-head"><h2>Clientes e concorrência</h2><span class="label">${L.length} cliente${L.length===1?'':'s'} fixo${L.length===1?'':'s'}</span></div>
    ${L.length?`<ul class="break">${L.map(f=>`<li><span><b>${esc(f.nome)}</b> · ${AREAS[f.area].nome} · ${f.casos} caso${f.casos>1?'s':''}</span><span class="num ${f.satisf>=60?'hi':f.satisf<40?'lo':''}">${brl(f.partido)}/mês · satisfação ${Math.round(f.satisf)}</span></li>`).join('')}</ul>`
      :'<p style="margin:0;font-size:12.5px;color:var(--muted)">Ganhe casos raros ou maiores para conquistar clientes fixos: eles pagam partido mensal e mandam casos novos. Derrotas derrubam a satisfação; abaixo de 50, a concorrência pode levá-los.</p>'}
    <span class="label">Prestígio na praça</span>
    <ol class="hall">${ranking.map((r,i)=>`<li class="${r.eu?'top':''}"><span class="num pos">${i+1}</span><div><b>${esc(r.nome)}</b></div><b class="num pts">${Math.round(r.prest)}</b></li>`).join('')}</ol></section>`; }

