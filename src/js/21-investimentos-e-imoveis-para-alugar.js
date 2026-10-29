// ===================== INVESTIMENTOS E IMÓVEIS PARA ALUGAR =====================
const INV={
  rf:{nome:'Renda fixa (Tesouro e CDB)',desc:'10% ao ano, sem sustos.'},
  acoes:{nome:'Ações',desc:'Rende 15% ao ano na média, mas oscila muito e sofre nas crises.'},
  fii:{nome:'Fundos imobiliários',desc:'Pagam 9% ao ano em rendimentos mensais e oscilam pouco.'},
};
const ALUG=[{nome:'Kitnet',preco:180000},{nome:'Apartamento de 2 quartos',preco:400000},{nome:'Sala comercial',preco:650000},{nome:'Loja de rua',preco:1200000}];
const aluguelDe=preco=>Math.round(preco*.06/ANO/10)*10; // 6% ao ano de aluguel bruto
const gauss=()=>{ let u=0,v=0; while(!u) u=Math.random(); while(!v) v=Math.random(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); };
const invInicial=()=>({rf:{v:0,ap:0},acoes:{v:0,ap:0},fii:{v:0,ap:0}});
const totalInvest=()=>{ const I=S.vida.inv||invInicial(); return I.rf.v+I.acoes.v+I.fii.v; };
const valorImovel=m=>Math.round(m.preco*(.7+.3*m.estado/100));
const totalAlugueis=()=>(S.vida.alugueis||[]).reduce((a,m)=>a+valorImovel(m),0);
const rendaPassiva=()=>{ const V=S.vida; return (V.alugueis||[]).filter(m=>m.ocupado).reduce((a,m)=>a+m.aluguel,0)+Math.round(((V.inv&&V.inv.fii.v)||0)*.09/ANO); };
function semanaInvest(){ const V=S.vida; if(!V.inv) V.inv=invInicial(); if(!V.alugueis) V.alugueis=[]; const I=V.inv; let renda=0;
  I.rf.v*=Math.pow(1.10,1/ANO);
  I.acoes.v*=Math.max(.5,1+(Math.pow(1.15,1/ANO)-1)+.06*gauss());
  const div=I.fii.v*.09/ANO; renda+=div; I.fii.v*=1+.015*gauss();
  if((I.acoes.v>0||I.fii.v>0)&&Math.random()<.025){ I.acoes.v*=.75; I.fii.v*=.9; addLog('Crise na bolsa: ações caíram 25% e fundos imobiliários 10%.','r'); }
  for(const m of V.alugueis){ m.estado=clamp(m.estado-.8,0,100);
    if(m.ocupado){ if(Math.random()<.04){ m.atrasos=(m.atrasos||0)+1; addLog(`O inquilino de ${m.nome} atrasou o aluguel.`,'r');
        if(m.atrasos>=3){ m.ocupado=false; m.atrasos=0; addLog(`Despejo concluído: ${m.nome} está vago.`,'r'); } }
      else { renda+=m.aluguel*(m.estado<40?.7:1); }
      if(m.estado<30&&Math.random()<.08){ m.ocupado=false; addLog(`O inquilino de ${m.nome} saiu reclamando do estado do imóvel.`,'r'); } }
    else { pagarPessoal(Math.round(m.preco*.005/ANO)); if(Math.random()<.3*(m.estado/100+.3)){ m.ocupado=true; m.atrasos=0; addLog(`${m.nome} foi alugado por ${brl(m.aluguel)} por mês.`,'g'); } } }
  if(renda) pagarPessoal(-Math.round(renda));
  V.rendaPassivaSemana=Math.round(renda); }
async function investir(c){ if(ocupado) return; const I=S.vida.inv, din=dinheiroPessoal(), it=INV[c];
  const vals=[1000,10000,50000,200000];
  const v=await modal(`<h2>${it.nome}</h2><p>${it.desc}</p><dl class="meta"><dt>Aplicado hoje</dt><dd class="num">${brl(I[c].v)}</dd><dt>Total já aportado</dt><dd class="num">${brl(I[c].ap)}</dd><dt>Dinheiro pessoal</dt><dd class="num">${brl(din)}</dd></dl>
    <span class="label">Aplicar</span><div class="chips">${vals.map(x=>`<button class="chip" data-mv="a${x}" ${din<x?'disabled':''}>${brl(x)}</button>`).join('')}</div>
    <span class="label">Resgatar</span><div class="chips">${vals.map(x=>`<button class="chip" data-mv="r${x}" ${I[c].v<x?'disabled':''}>${brl(x)}</button>`).join('')}<button class="chip" data-mv="rall" ${I[c].v<1?'disabled':''}>Tudo</button></div>`,[{t:'Fechar',v:'',cls:'ghost'}]);
  if(!v) return;
  if(v[0]==='a'){ const x=+v.slice(1); pagarPessoal(x); I[c].v+=x; I[c].ap+=x; addLog(`Você aplicou ${brl(x)} em ${it.nome.toLowerCase()}.`); }
  else { const x=v==='rall'?I[c].v:+v.slice(1), fr=x/I[c].v; I[c].ap=Math.max(0,I[c].ap*(1-fr)); I[c].v-=x; pagarPessoal(-Math.round(x)); addLog(`Você resgatou ${brl(x)} de ${it.nome.toLowerCase()}.`); }
  salvar(); render(); }
async function comprarAluguel(i){ if(ocupado) return; const T=ALUG[i]; if(dinheiroPessoal()<T.preco) return;
  const v=await modal(`<h2>Comprar para alugar: ${T.nome}</h2><p>Custa ${brl(T.preco)} à vista. Rende cerca de ${brl(aluguelDe(T.preco))} por mês quando alugado. Vazio, você paga condomínio e IPTU. O imóvel se desgasta e precisa de reforma de tempos em tempos.</p>`,[{t:'Cancelar',v:0,cls:'ghost'},{t:'Comprar',v:1,cls:'brass'}]);
  if(!v) return; pagarPessoal(T.preco);
  S.vida.alugueis.push({id:++uid,nome:T.nome,preco:T.preco,aluguel:aluguelDe(T.preco),ocupado:false,estado:90,atrasos:0});
  addLog(`Você comprou ${T.nome.toLowerCase()} para alugar.`,'g'); salvar(); render(); }
function reformarAluguel(id){ const m=S.vida.alugueis.find(x=>x.id===id), c=Math.round(m.preco*.05); if(!m||dinheiroPessoal()<c) return;
  pagarPessoal(c); m.estado=100; addLog(`Reforma concluída em ${m.nome}.`,'g'); salvar(); render(); }
function venderAluguel(id){ const V=S.vida, m=V.alugueis.find(x=>x.id===id); if(!m) return; const v=valorImovel(m);
  pagarPessoal(-v); V.alugueis=V.alugueis.filter(x=>x!==m); addLog(`Você vendeu ${m.nome} por ${brl(v)}.`,'g'); salvar(); render(); }
function painelInvest(){ const V=S.vida, I=V.inv||invInicial(), A=V.alugueis||[], din=dinheiroPessoal();
  const linha=c=>{ const x=I[c], luc=x.v-x.ap; return `<button class="opt" data-act="investir" data-v="${c}"><span>${INV[c].nome}</span><b class="num">${brl(x.v)}</b><small>${INV[c].desc}${x.ap?` · resultado ${luc>=0?'+':''}${brl(luc)}`:''}</small></button>`; };
  return `<section class="panel"><div class="panel-head"><h2>Investimentos</h2><span class="num">${brl(totalInvest()+totalAlugueis())}</span></div>
    <div class="opts">${['rf','acoes','fii'].map(linha).join('')}</div>
    <span class="label">Imóveis para alugar</span>
    ${A.length?`<ul class="break">${A.map(m=>`<li style="flex-wrap:wrap;gap:6px"><span>${m.nome} · ${m.ocupado?`<span class="hi">alugado, ${brl(m.aluguel)}/mês</span>`:'<span class="lo">vago</span>'} · conservação ${Math.round(m.estado)}</span>
      <span class="chips"><button class="chip" data-act="reformarAlug" data-id="${m.id}" ${din<m.preco*.05?'disabled':''}>Reformar · ${brl(Math.round(m.preco*.05))}</button><button class="chip" data-act="venderAlug" data-id="${m.id}">Vender · ${brl(valorImovel(m))}</button></span></li>`).join('')}</ul>`:''}
    <div class="opts">${ALUG.map((t,i)=>`<button class="opt" data-act="comprarAlug" data-v="${i}" ${din<t.preco?'disabled':''}><span>Comprar ${t.nome.toLowerCase()}</span><b class="num">${brl(t.preco)}</b><small>Aluguel de cerca de ${brl(aluguelDe(t.preco))} por mês</small></button>`).join('')}</div>
    <p style="margin:0;font-size:12px;color:var(--muted)">Renda passiva no último mês: ${brl(V.rendaPassivaSemana||0)}. Aluguéis e rendimentos de fundos entram no dinheiro pessoal e contam como renda para o banco aprovar financiamentos.</p>
  </section>`; }

