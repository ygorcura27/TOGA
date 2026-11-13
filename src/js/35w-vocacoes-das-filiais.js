// ===================== VOCAÇÕES DAS FILIAIS =====================
// Cada lugar tem uma razão de existir na rede. Com escritório aberto ali (sede ou filial), a vocação vale para o escritório inteiro:
//  area: +N de chance nos casos dessa área em qualquer lugar (somando a rede, até VOC_TETO_AREA por área)
//  valor: causas dessas áreas valem mais nos casos novos (somando a rede, até ×VOC_TETO_VALOR)
//  ofertas: casos extras por mês vindos desse lugar, na área indicada
//  recSup: +N de chance em recursos no STJ/TST (3ª instância) e no STF
//  exterior: +N de chance nos casos fora do país
//  prest: prestígio por mês
// Filial de bairro também ganha +VOC_BAIRRO nos casos daquele bairro (presença no fórum regional e na clientela local).
const VOC_TETO_AREA=8, VOC_TETO_VALOR=1.5, VOC_BAIRRO=4;
const VOCACOES={
  // São Paulo
  'sp:paulista':{t:'Polo de contratos',area:{civel:3,empresarial:2},ofertas:[['empresarial',1]]},
  'sp:farialima':{t:'Centro financeiro',valor:{areas:['empresarial','tributario'],x:1.25},ofertas:[['empresarial',1]]},
  'sp:barrafunda':{t:'Ao lado do Fórum Criminal e do TRT',area:{penal:4,trabalho:3}},
  'sp:tatuape':{t:'Clientela de bairro',ofertas:[['familia',1],['trabalho',1]]},
  'sp:santoamaro':{t:'Volume trabalhista',area:{trabalho:2},ofertas:[['trabalho',1]]},
  'sp:abc':{t:'Polo industrial e sindical',area:{trabalho:4},valor:{areas:['trabalho'],x:1.15}},
  'sp:guarulhos':{t:'Aeroporto: consumo e logística',area:{civel:2},ofertas:[['civel',1]],exterior:2},
  'sp:campinas':{t:'Tecnologia e inovação',area:{empresarial:3,tributario:2}},
  // Rio de Janeiro
  'rj:zonasul':{t:'Famílias de alta renda',valor:{areas:['familia'],x:1.3},area:{familia:2}},
  'rj:barra':{t:'Condomínios e novos negócios',area:{familia:2,empresarial:2},ofertas:[['familia',1]]},
  'rj:tijuca':{t:'Classe média tradicional',area:{civel:3},ofertas:[['civel',1]]},
  'rj:madureira':{t:'Volume popular',ofertas:[['trabalho',1],['familia',1]]},
  'rj:niteroi':{t:'Porta do Leste Fluminense',area:{civel:2,familia:2}},
  'rj:caxias':{t:'Refinaria e polo petroquímico',valor:{areas:['empresarial','trabalho'],x:1.2}},
  'rj:novaiguacu':{t:'Baixada: demanda reprimida',ofertas:[['familia',1]],area:{penal:2}},
  // Brasil
  sp:{t:'Maior mercado do país',ofertas:[['empresarial',1]],valor:{areas:['empresarial'],x:1.1}},
  rj:{t:'Petróleo, energia e mídia',area:{empresarial:2},ofertas:[['civel',1]]},
  bh:{t:'Mineração e indústria',area:{trabalho:2,empresarial:2}},
  df:{t:'Tribunais superiores',recSup:6,area:{tributario:2}},
  gyn:{t:'Agronegócio',valor:{areas:['civel','empresarial'],x:1.2}},
  ssa:{t:'Direito de família e sucessões',area:{familia:3},ofertas:[['familia',1]]},
  rec:{t:'Justiça do Trabalho forte',area:{trabalho:3},ofertas:[['trabalho',1]]},
  for:{t:'Crescimento do Nordeste',area:{familia:2},ofertas:[['familia',1]]},
  bel:{t:'Amazônia: terra e meio ambiente',area:{civel:3,penal:2}},
  mao:{t:'Zona Franca',valor:{areas:['tributario','trabalho'],x:1.25},ofertas:[['tributario',1]]},
  cwb:{t:'Tradição em grandes operações penais',area:{penal:3,empresarial:2}},
  fln:{t:'Polo de tecnologia',area:{empresarial:2},ofertas:[['civel',1]]},
  poa:{t:'Escola trabalhista gaúcha',area:{trabalho:3,familia:2}},
  // mundo
  nyc:{t:'Wall Street',valor:{areas:['empresarial'],x:1.3},prest:.2},
  lon:{t:'Arbitragem internacional',area:{empresarial:5},prest:.1},
  par:{t:'Direito europeu',area:{civel:3,empresarial:2},prest:.1},
  mil:{t:'Moda, design e indústria',valor:{areas:['empresarial','trabalho'],x:1.15},area:{trabalho:2}},
  lis:{t:'Porta de entrada na Europa',exterior:4,area:{civel:2,familia:2}},
};
const escritoriosAbertos=()=>S.carreira==='adv'?[S.sede,...S.filiais]:[];
const vocacoesAtivas=()=>escritoriosAbertos().map(k=>[k,VOCACOES[k]]).filter(([,v])=>v);
function descVocacao(v){ if(!v) return ''; const L=[];
  if(v.area) L.push(Object.entries(v.area).map(([a,n])=>`+${n} em ${AREAS[a].nome}`).join(', ')+' (toda a rede)');
  if(v.valor) L.push(`causas de ${v.valor.areas.map(a=>AREAS[a].nome).join(' e ')} valem ${Math.round((v.valor.x-1)*100)}% mais`);
  if(v.ofertas) L.push(v.ofertas.map(([a,n])=>`+${n} caso${n>1?'s':''} de ${AREAS[a].nome} por mês`).join(', '));
  if(v.recSup) L.push(`+${v.recSup} em recursos no STJ/TST e no STF`);
  if(v.exterior) L.push(`+${v.exterior} nos casos no exterior`);
  if(v.prest) L.push(`+${String(v.prest).replace('.',',')} de prestígio por mês`);
  return L.join(' · '); }
// totais da rede, com teto
function vocArea(area){ return Math.min(VOC_TETO_AREA,vocacoesAtivas().reduce((s,[,v])=>s+((v.area&&v.area[area])||0),0)); }
function vocValor(area){ return Math.min(VOC_TETO_VALOR,vocacoesAtivas().reduce((m,[,v])=>m*(v.valor&&v.valor.areas.includes(area)?v.valor.x:1),1)); }
const vocSoma=campo=>vocacoesAtivas().reduce((s,[,v])=>s+(v[campo]||0),0);
// chance: área da rede, recursos superiores, exterior e presença no bairro
{ const b0=bonusPerks; bonusPerks=function(c,add){ b0(c,add); if(S.carreira!=='adv') return;
    const a=vocArea(c.area); if(a) add(`Rede em ${AREAS[c.area].nome}`,a);
    if((c.inst||1)>=3){ const r=vocSoma('recSup'); if(r) add('Escritório em Brasília',r); }
    const L=LOC[c.cidade];
    if(L&&L.nivel==='global'){ const x=vocSoma('exterior'); if(x) add('Rede no exterior',x); }
    if(L&&L.nivel==='regional'&&!L.centro&&S.filiais.includes(c.cidade)) add('Escritório no bairro',VOC_BAIRRO); }; }
// valor das causas novas
{ const n0=novoCaso; novoCaso=function(...a){ const c=n0(...a); if(S.carreira==='adv'&&c.valor){ const m=vocValor(c.area); if(m>1){ c.valor=Math.round(c.valor*m/100)*100; c.hon=Math.round(c.valor*.2); c.vocValor=m; } } return c; }; }
// casos extras por mês
{ const g0=gerarOfertas; gerarOfertas=function(){ g0(); if(S.carreira!=='adv') return; let n=0;
    for(const [k,v] of vocacoesAtivas()) for(const [area,q] of v.ofertas||[]) for(let i=0;i<q;i++){ const c=novoCaso(LOC[k].centro?LOC[k].parent:k,{},area); c.vocDe=k; S.ofertas.push(c); n++; }
    if(n&&typeof aceitarAutomatico==='function') aceitarAutomatico(); }; }
// prestígio mensal das filiais no exterior
{ const s0=semanaEstruturaAdv; semanaEstruturaAdv=function(){ s0(); const p=vocSoma('prest'); if(p) S.prest=clamp(S.prest+p,0,100); }; }
// ---------- telas ----------
const vocHtml=(k,ativa)=>{ const v=VOCACOES[k]; if(!v) return '';
  return `<div class="voc ${ativa?'on':''}"><span class="label">Vocação${ativa?' · ativa':''}</span><b>${esc(v.t)}</b><small>${descVocacao(v)}${LOC[k].nivel==='regional'&&!LOC[k].centro?` · +${VOC_BAIRRO} nos casos deste bairro`:''}</small></div>`; };
// no painel do lugar (mapas Região, Brasil e Mundo)
{ const p0=painel; painel=function(k){ const h=p0(k); if(S.carreira!=='adv'||!VOCACOES[k]) return h; return h.replace('<span class="label">Demanda por área</span>',vocHtml(k,temEscritorio(k))+'<span class="label">Demanda por área</span>'); }; }
// no painel "Sua rede": o que a rede está dando
{ const r0=painelRede; painelRede=function(){ const h=r0(); if(S.carreira!=='adv') return h; const A=vocacoesAtivas(); if(!A.length) return h;
    const areas=Object.keys(AREAS).map(a=>[a,vocArea(a),vocValor(a)]).filter(([,n,m])=>n||m>1);
    const efeitos=[...areas.map(([a,n,m])=>`${AREAS[a].nome} ${[n?'+'+n:'',m>1?'causas ×'+m.toLocaleString('pt-BR',{maximumFractionDigits:2}):''].filter(Boolean).join(' · ')}`),
      vocSoma('recSup')?`STJ/STF +${vocSoma('recSup')}`:'',vocSoma('exterior')?`Exterior +${vocSoma('exterior')}`:'',vocSoma('prest')?`Prestígio +${vocSoma('prest').toLocaleString('pt-BR',{maximumFractionDigits:1})}/mês`:''].filter(Boolean);
    const bloco=`<span class="label">Vocações ativas</span><ul class="rede-voc">${A.map(([k,v])=>`<li><b>${esc(v.t)}</b><small>${esc(nomeLocal(k))} · ${descVocacao(v)}</small></li>`).join('')}</ul>
      ${efeitos.length?`<span class="label">O que a rede soma</span><div class="chips rede-ef">${efeitos.map(t=>`<span class="tag">${t}</span>`).join('')}</div>`:''}`;
    return h.replace('</dl><button class="btn brass wide" data-act="fimSemana">','</dl>'+bloco+'<button class="btn brass wide" data-act="fimSemana">'); }; }
// no cartão de cada filial (aba Estrutura e equipe)
{ const p0=painelFiliais; painelFiliais=function(){ let h=p0(); if(!h) return h;
    for(const k of S.filiais){ const v=VOCACOES[k]; if(!v) continue; const nome=esc(nomeLocal(k));
      h=h.replace(`<h3>${nome}</h3>`,`<h3>${nome}</h3>`).replace(new RegExp(`(<h3>${nome.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}</h3><span class="label">[^<]*</span></div>)`),`$1<p style="margin:0;font-size:12px"><b>${esc(v.t)}</b> · <span class="mut">${descVocacao(v)}</span></p>`); }
    return h; }; }
