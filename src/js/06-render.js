// ===================== RENDER =====================
const app=document.getElementById('app');
function render(){
  if(!S){renderInicio();return;}
  aplicarTetos(); cqCheck();
  if(['estudante','academico'].includes(S.carreira) && !['vida','conquistas'].includes(view)) view='escritorio';
  if(S.carreira!=='adv' && !['brasil','estrutura','vida','academia','conquistas'].includes(view)) view='escritorio';
  if(view==='conquistas'){renderConquistas();return;}
  if(view==='estrutura'){renderEstrutura();return;}
  if(view==='vida'){renderVida();return;}
  if(view==='academia'){renderAcademia(false);return;}
  if(S.carreira==='estudante'){renderFaculdade();return;}
  if(S.carreira==='academico'){renderAcademia(true);return;}
  if(view!=='escritorio'){renderMapa(view);return;}
  if(S.carreira==='juiz'){renderGabinete();return;}
  if(S.carreira==='promotor'){renderPromotoria();return;}
  if(S.carreira==='defensor'){renderDefensoria();return;}
  const used=blocosUsados(), free=livres(), gabA=gabinete(), casoTot=S.casos.reduce((a,c)=>a+(c.semana||0),0), gabUsed=Math.min(gabA,casoTot);
  const cells=[]; const push=(k,n)=>{for(let i=0;i<n;i++) cells.push(k);};
  push('case',casoTot-gabUsed); for(const c of S.casos) for(const k in c.apoios) if(c.apoios[k]===1) push('apoio',APOIOS[k].blocos);
  push('estudo',S.agenda.estudo+acadBlocos()); push('lazer',S.agenda.lazer); push('familia',S.agenda.familia||0); push('saude',S.agenda.saude||0); push('descanso',Math.max(0,S.disp+blocoEscrita()-cells.length)); push('off',BLOCOS-S.disp);
  const gabCellsA=Array.from({length:gabA},(_,i)=>`<div class="blk ${i<gabUsed?'apoio':''}"></div>`).join('');
  const dias=[]; // a grade mostra os 21 blocos do mês, sem dias
  // grade em colunas (dia) × 3 blocos
  let gridHtml=dias.map(d=>`<div class="day">${d}</div>`).join('');
  for(let r=0;r<3;r++) for(let d=0;d<7;d++){ const k=cells[d*3+r]; gridHtml+=`<div class="blk ${k}"></div>`; }

  app.innerHTML=`
  ${header()}
  <div class="grid">
    <div class="col">
      <section class="panel">
        <div class="panel-head"><h2>Agenda do mês</h2><span class="num">${used}/${S.disp+blocoEscrita()+gabA} blocos</span></div>
        <div class="blocks">${gridHtml}</div>
        ${gabA?`<span class="label">Equipe do escritório · ${gabA} blocos por mês</span><div class="blocks">${gabCellsA}</div>`:'<span class="label">Sem equipe: contrate gente na aba Estrutura e equipe</span>'}
        <div class="legend"><span><i style="background:var(--b-case)"></i>Casos</span><span><i style="background:var(--b-apoio)"></i>Apoios</span><span><i style="background:var(--b-estudo)"></i>Estudo</span><span><i style="background:var(--b-lazer)"></i>Lazer</span><span><i style="background:var(--b-familia)"></i>Família</span><span><i style="background:var(--b-saude)"></i>Saúde</span><span><i style="background:var(--b-descanso)"></i>Descanso (${free})</span></div>
        <div class="rows">
          ${S.casos.map(c=>`<div class="row"><span class="name" title="${esc(c.titulo)}">${esc(c.titulo)}</span>${stepper('case',c.id,c.semana||0,free)}</div>`).join('')}
          <div class="row"><span class="name">Estudo</span><select id="estudo-skill" data-act="estudoSkill">${Object.entries(SKILLS).map(([k,v])=>`<option value="${k}" ${S.agenda.estudoSkill===k?'selected':''}>${v}</option>`).join('')}</select>${stepper('estudo',0,S.agenda.estudo,free)}</div>
          <div class="row"><span class="name">Lazer (reduz estresse)</span>${stepper('lazer',0,S.agenda.lazer,free)}</div>
          ${rowsVida(free)}${rowsAcad(free)}
        </div>
        <p class="label" style="margin:0">Blocos livres viram descanso e recuperam energia.</p>
        <button class="btn brass wide" data-act="fimSemana">Encerrar mês ▶</button>
      </section>
      ${painelSkills()}${painelClientes()}${painelCarreiraAdv()}${painelDiario()}
    </div>
    <div class="col">
      ${painelCasosAtivos()}
      <section class="panel" style="background:transparent;border:0;padding:0">
        <div class="panel-head"><h2>Novos casos deste mês</h2><span class="label">Renovam todo mês</span></div>
        <div class="cases">${S.ofertas.length?S.ofertas.map(c=>pasta(c,false)).join(''):'<p class="empty">Sem ofertas restantes neste mês.</p>'}</div>
      </section>
    </div>
  </div>`;
}
function header(){
  if(S.carreira==='estudante'||S.carreira==='academico'){ const est=S.carreira==='estudante', F=S.fac;
    return `<header class="top">
    <div class="brand"><h1>Toga</h1><span>${esc(S.nome)}, ${idade()} anos · ${est?FACS[F.tier].nome+' · '+(F.fase==='oab'?'formado, preparando a OAB':F.semestre+'º semestre'):nomeAcad()} · Mês ${S.semana}</span></div>
    <div class="stat"><span class="label">Dinheiro</span><b class="${S.caixa<0?'lo':''}">${brl(S.caixa)}</b></div>
    ${est?`<div class="stat"><span class="label">CR</span><b>${crTxt()}</b></div>`:`<div class="stat"><span class="label">Índice de produção</span><b>${S.ac.indice}</b></div><div class="stat"><span class="label">Prestígio</span><b>${Math.round(S.prest)}</b><div class="meter"><i style="width:${S.prest}%"></i></div></div>`}
    <div class="stat"><span class="label">Energia</span><b>${Math.round(S.energia)}</b><div class="meter e"><i style="width:${S.energia}%"></i></div></div>
    <div class="stat"><span class="label">Estresse</span><b>${Math.round(S.estresse)}</b><div class="meter s"><i style="width:${S.estresse}%"></i></div></div>
    <div class="stat"><span class="label">Saúde</span><b>${Math.round(S.vida.saude)}</b><div class="meter e"><i style="width:${S.vida.saude}%"></i></div></div>
    <div class="stat"><span class="label">Felicidade</span><b>${Math.round(S.vida.felicidade)}</b><div class="meter"><i style="width:${S.vida.felicidade}%"></i></div></div>
    <nav class="tabs" aria-label="Telas">
      <button class="tab ${view==='escritorio'?'on':''}" data-act="view" data-v="escritorio">${est?'Faculdade':'Academia'}</button>
      <button class="tab ${view==='vida'?'on':''}" data-act="view" data-v="vida">Vida</button>
      <button class="tab ${view==='conquistas'?'on':''}" data-act="view" data-v="conquistas">Conquistas</button>
    </nav></header>`; }
  if(S.carreira==='defensor'){ const D=S.d, presos=D.casos.filter(c=>c.preso).length;
    return `<header class="top">
    <div class="brand"><h1>Toga</h1><span>${esc(S.nome)}, ${idade()} anos · ${fem(CARGOS_DP[D.cargo].nome)} · ${CIDADES[D.comarca].nome} · Mês ${S.semana}</span></div>
    <div class="stat"><span class="label">Caixa</span><b>${brl(S.caixa)}</b></div>
    <div class="stat"><span class="label">Efetividade</span><b>${S.u.efet.toLocaleString('pt-BR')}</b><div class="meter"><i style="width:${S.u.efet}%"></i></div></div>
    <div class="stat"><span class="label">Salário/mês</span><b>${brl(CARGOS_DP[D.cargo].salario)}</b></div>
    <div class="stat"><span class="label">Reputação</span><b>${Math.round(S.prest)}</b><div class="meter"><i style="width:${S.prest}%"></i></div></div>
    <div class="stat"><span class="label">Assistidos</span><b>${D.casos.length}${presos?` <span class="lo">· ${presos} presos</span>`:''}</b></div>
    <div class="stat"><span class="label">Êxito</span><b>${pct(taxaDP())}</b></div>
    <div class="stat"><span class="label">Energia</span><b>${Math.round(S.energia)}</b><div class="meter e"><i style="width:${S.energia}%"></i></div></div>
    <div class="stat"><span class="label">Estresse</span><b>${Math.round(S.estresse)}</b><div class="meter s"><i style="width:${S.estresse}%"></i></div></div>
    <div class="stat"><span class="label">Saúde</span><b class="${S.vida.saude<40?'lo':''}">${Math.round(S.vida.saude)}</b><div class="meter e"><i style="width:${S.vida.saude}%"></i></div></div>
    <div class="stat"><span class="label">Felicidade</span><b>${Math.round(S.vida.felicidade)}</b><div class="meter"><i style="width:${S.vida.felicidade}%"></i></div></div>
    <div class="stat"><span class="label">Integridade</span><b>${Math.round(S.integ)}</b></div>
    <nav class="tabs" aria-label="Telas">
      <button class="tab ${view==='escritorio'?'on':''}" data-act="view" data-v="escritorio">Defensoria</button>
      <button class="tab ${view==='estrutura'?'on':''}" data-act="view" data-v="estrutura">Estrutura e equipe</button>
      <button class="tab ${view==='vida'?'on':''}" data-act="view" data-v="vida">Vida</button>
      <button class="tab ${view==='conquistas'?'on':''}" data-act="view" data-v="conquistas">Conquistas</button>
      <button class="tab ${view==='academia'?'on':''}" data-act="view" data-v="academia">Academia</button>
      <button class="tab ${view==='brasil'?'on':''}" data-act="view" data-v="brasil">Brasil</button>
    </nav></header>`; }
  if(S.carreira==='promotor'){ const P=S.p, atr=P.casos.filter(c=>c.fase==='inq'&&c.idade>c.meta).length;
    return `<header class="top">
    <div class="brand"><h1>Toga</h1><span>${esc(S.nome)}, ${idade()} anos · ${fem(CARGOS_MP[P.cargo].nome)} · ${CIDADES[P.comarca].nome} · Mês ${S.semana}</span></div>
    <div class="stat"><span class="label">Caixa</span><b>${brl(S.caixa)}</b></div>
    <div class="stat"><span class="label">Efetividade</span><b>${S.u.efet.toLocaleString('pt-BR')}</b><div class="meter"><i style="width:${S.u.efet}%"></i></div></div>
    <div class="stat"><span class="label">Salário/mês</span><b>${brl(CARGOS_MP[P.cargo].salario)}</b></div>
    <div class="stat"><span class="label">Reputação</span><b>${Math.round(S.prest)}</b><div class="meter"><i style="width:${S.prest}%"></i></div></div>
    <div class="stat"><span class="label">Inquéritos</span><b>${P.casos.filter(c=>c.fase==='inq').length}${atr?` <span class="lo">· ${atr} atras.</span>`:''}</b></div>
    <div class="stat"><span class="label">Condenação</span><b>${pct(taxaCond())}</b></div>
    <div class="stat"><span class="label">Energia</span><b>${Math.round(S.energia)}</b><div class="meter e"><i style="width:${S.energia}%"></i></div></div>
    <div class="stat"><span class="label">Estresse</span><b>${Math.round(S.estresse)}</b><div class="meter s"><i style="width:${S.estresse}%"></i></div></div>
    <div class="stat"><span class="label">Saúde</span><b class="${S.vida.saude<40?'lo':''}">${Math.round(S.vida.saude)}</b><div class="meter e"><i style="width:${S.vida.saude}%"></i></div></div>
    <div class="stat"><span class="label">Felicidade</span><b>${Math.round(S.vida.felicidade)}</b><div class="meter"><i style="width:${S.vida.felicidade}%"></i></div></div>
    <div class="stat"><span class="label">Integridade</span><b>${Math.round(S.integ)}</b></div>
    <nav class="tabs" aria-label="Telas">
      <button class="tab ${view==='escritorio'?'on':''}" data-act="view" data-v="escritorio">Promotoria</button>
      <button class="tab ${view==='estrutura'?'on':''}" data-act="view" data-v="estrutura">Estrutura e equipe</button>
      <button class="tab ${view==='vida'?'on':''}" data-act="view" data-v="vida">Vida</button>
      <button class="tab ${view==='conquistas'?'on':''}" data-act="view" data-v="conquistas">Conquistas</button>
      <button class="tab ${view==='academia'?'on':''}" data-act="view" data-v="academia">Academia</button>
      <button class="tab ${view==='brasil'?'on':''}" data-act="view" data-v="brasil">Brasil</button>
    </nav></header>`; }
  if(S.carreira==='juiz'){ const J=S.j, atr=J.acervo.filter(p=>p.idade>p.meta).length;
    return `<header class="top">
    <div class="brand"><h1>Toga</h1><span>${esc(S.nome)}, ${idade()} anos · ${nomeCargo(J.cargo)}${J.cargo<2?' · '+VARAS[vara()]:''} · ${CIDADES[J.comarca].nome} · Mês ${S.semana}</span></div>
    <div class="stat"><span class="label">Caixa</span><b>${brl(S.caixa)}</b></div>
    <div class="stat"><span class="label">Efetividade</span><b>${S.u.efet.toLocaleString('pt-BR')}</b><div class="meter"><i style="width:${S.u.efet}%"></i></div></div>
    <div class="stat"><span class="label">Salário/mês</span><b>${brl(CARGOS[J.cargo].salario)}</b></div>
    <div class="stat"><span class="label">Reputação</span><b>${Math.round(S.prest)}</b><div class="meter"><i style="width:${S.prest}%"></i></div></div>
    <div class="stat"><span class="label">Acervo</span><b>${J.acervo.length}${atr?` <span class="lo">· ${atr} atras.</span>`:''}</b></div>
    <div class="stat"><span class="label">Reforma</span><b>${pct(taxaReforma())}</b></div>
    <div class="stat"><span class="label">Energia</span><b>${Math.round(S.energia)}</b><div class="meter e"><i style="width:${S.energia}%"></i></div></div>
    <div class="stat"><span class="label">Estresse</span><b>${Math.round(S.estresse)}</b><div class="meter s"><i style="width:${S.estresse}%"></i></div></div>
    <div class="stat"><span class="label">Saúde</span><b class="${S.vida.saude<40?'lo':''}">${Math.round(S.vida.saude)}</b><div class="meter e"><i style="width:${S.vida.saude}%"></i></div></div>
    <div class="stat"><span class="label">Felicidade</span><b>${Math.round(S.vida.felicidade)}</b><div class="meter"><i style="width:${S.vida.felicidade}%"></i></div></div>
    <div class="stat"><span class="label">Integridade</span><b>${Math.round(S.integ)}</b></div>
    <nav class="tabs" aria-label="Telas">
      <button class="tab ${view==='escritorio'?'on':''}" data-act="view" data-v="escritorio">Gabinete</button>
      <button class="tab ${view==='estrutura'?'on':''}" data-act="view" data-v="estrutura">Estrutura e equipe</button>
      <button class="tab ${view==='vida'?'on':''}" data-act="view" data-v="vida">Vida</button>
      <button class="tab ${view==='conquistas'?'on':''}" data-act="view" data-v="conquistas">Conquistas</button>
      <button class="tab ${view==='academia'?'on':''}" data-act="view" data-v="academia">Academia</button>
      <button class="tab ${view==='brasil'?'on':''}" data-act="view" data-v="brasil">Brasil</button>
    </nav></header>`; }
  return `<header class="top">
    <div class="brand"><h1>Toga</h1><span>${esc(S.nome)}, ${idade()} anos · Advocacia · Mês ${S.semana}</span></div>
    <div class="stat"><span class="label">Caixa do escritório</span><b class="${S.caixa<0?'lo':''}">${brl(S.caixa)}</b></div>
    <div class="stat"><span class="label">Pessoal</span><b class="${S.bolso<0?'lo':''}">${brl(S.bolso)}</b></div>
    <div class="stat"><span class="label">A receber</span><b>${brl(S.aReceber)}</b></div>
    <div class="stat"><span class="label">Custo/mês</span><b>${brl(custoSemanal())}</b></div>
    <div class="stat"><span class="label">Prestígio</span><b>${Math.round(S.prest)}</b><div class="meter"><i style="width:${S.prest}%"></i></div></div>
    <div class="stat"><span class="label">Energia</span><b>${Math.round(S.energia)}</b><div class="meter e"><i style="width:${S.energia}%"></i></div></div>
    <div class="stat"><span class="label">Estresse</span><b>${Math.round(S.estresse)}</b><div class="meter s"><i style="width:${S.estresse}%"></i></div></div>
    <div class="stat"><span class="label">Saúde</span><b class="${S.vida.saude<40?'lo':''}">${Math.round(S.vida.saude)}</b><div class="meter e"><i style="width:${S.vida.saude}%"></i></div></div>
    <div class="stat"><span class="label">Felicidade</span><b>${Math.round(S.vida.felicidade)}</b><div class="meter"><i style="width:${S.vida.felicidade}%"></i></div></div>
    <div class="stat"><span class="label">Integridade</span><b>${Math.round(S.integ)}</b></div>
    <nav class="tabs" aria-label="Telas">
      <button class="tab ${view==='escritorio'?'on':''}" data-act="view" data-v="escritorio">Escritório</button>
      <button class="tab ${view==='estrutura'?'on':''}" data-act="view" data-v="estrutura">Estrutura e equipe</button>
      <button class="tab ${view==='vida'?'on':''}" data-act="view" data-v="vida">Vida</button>
      <button class="tab ${view==='conquistas'?'on':''}" data-act="view" data-v="conquistas">Conquistas</button>
      <button class="tab ${view==='academia'?'on':''}" data-act="view" data-v="academia">Academia</button>
      <button class="tab ${view==='regiao'?'on':''}" data-act="view" data-v="regiao">Região</button>
      <button class="tab ${view==='brasil'?'on':''}" data-act="view" data-v="brasil">Brasil</button>
      <button class="tab ${view==='mundo'?'on':''}" data-act="view" data-v="mundo">Mundo</button>
      <span class="label" style="align-self:center;margin-left:auto">${1+S.filiais.length} escritório${S.filiais.length?'s':''}</span>
    </nav>
  </header>`;
}
let view='escritorio', sel={regiao:null,brasil:null,mundo:null}, regiaoSel=null;
function regiaoAtual(){ if(regiaoSel) return regiaoSel; if(S.sede==='sp'||S.sede==='rj') return S.sede;
  return S.filiais.find(f=>f==='sp'||f==='rj')||'sp'; }
function nomeLocal(k){ const C=LOC[k]; return C.nivel==='regional'?`${C.nome} · ${CIDADES[C.parent].nome}`:C.nivel==='global'?`${C.nome} · ${C.pais}`:C.nome; }
function motivoAbrir(k){ const C=LOC[k];
  if(temEscritorio(k)) return 'Você já tem escritório aqui';
  if(C.centro) return `Abra um escritório ${emCidade(C.parent)} no mapa do Brasil`;
  if(C.nivel==='regional' && !temEscritorio(C.parent)) return `Abra antes um escritório ${emCidade(C.parent)}`;
  if(S.prest<C.req) return `Exige ${C.req} de prestígio`;
  if(S.caixa<custoAbrir(C)) return 'Caixa insuficiente';
  return ''; }
const TIPO={regional:'unidade de bairro',nacional:'filial',global:'escritório internacional'};
function noSvg(k,x,y,selK,extra=''){
  const c=LOC[k], o=temEscritorio(k), r=3+c.pop*1.3, n=S.casos.filter(z=>z.cidade===k).length;
  const L=c.lbl||'r'; let dx=r+6,dy=4,anc='start';
  if(L==='l'){dx=-(r+6);anc='end';} else if(L==='b'){dx=0;dy=r+14;anc='middle';} else if(L==='t'){dx=0;dy=-(r+8);anc='middle';}
  const sede=S.carreira!=='adv'?k===comarcaAtual():(k===S.sede||(c.centro&&c.parent===S.sede));
  return `<g class="city ${extra} ${o?'off':''} ${k===selK?'sel':''}" data-act="cidade" data-v="${k}" role="button" tabindex="0" aria-label="${c.nome}">
    ${o?`<circle class="halo" cx="${x}" cy="${y}" r="${r+8}"/>`:''}
    <circle class="ring" cx="${x}" cy="${y}" r="${r+4}"/><circle class="dot" cx="${x}" cy="${y}" r="${r}"/>
    <text x="${x+dx}" y="${y+dy}" text-anchor="${anc}">${c.nome}</text>
    ${sede?`<text class="lbl-sede" x="${x+dx}" y="${y+dy+(L==='t'?-12:11)}" text-anchor="${anc}">${S.carreira!=='adv'?'COMARCA':'SEDE'}</text>`:''}
    ${n?`<g class="badge"><circle cx="${x+r+1}" cy="${y-r-1}" r="7"/><text x="${x+r+1}" y="${y-r+2}" text-anchor="middle">${n}</text></g>`:''}
  </g>`;
}
// recorta o polígono mantendo o lado mais perto de a do que de b (bissetriz)
function meiaPlano(poly,a,b){ const mx=(a[0]+b[0])/2, my=(a[1]+b[1])/2, dx=b[0]-a[0], dy=b[1]-a[1];
  const f=p=>(p[0]-mx)*dx+(p[1]-my)*dy, out=[];
  for(let i=0;i<poly.length;i++){ const p=poly[i], q=poly[(i+1)%poly.length], fp=f(p), fq=f(q);
    if(fp<=0) out.push(p);
    if((fp<0&&fq>0)||(fp>0&&fq<0)){ const t=fp/(fp-fq); out.push([p[0]+t*(q[0]-p[0]),p[1]+t*(q[1]-p[1])]); } }
  return out; }
const arco=(a,b,h=40)=>`<path class="route" d="M${a[0]},${a[1]} Q${(a[0]+b[0])/2},${Math.min(a[1],b[1])-h} ${b[0]},${b[1]}"/>`;
const projR=(sx,sy)=>[Math.round(70+sx*5),Math.round(80+sy*4.2)];
const projW=(lon,lat)=>[Math.round((lon+125)*40)/10,Math.round((70-lat)*40)/10];
const wpos=k=>{const c=LOC[k],[x,y]=projW(c.lon,c.lat); return [x+(c.wdx||0),y+(c.wdy||0)];};
const emCidade=k=>k==='rj'?'no Rio de Janeiro':'em '+CIDADES[k].nome;
let WORLD_DOTS=null;
function worldDots(){ if(WORLD_DOTS) return WORLD_DOTS; let s='';
  WORLD.forEach((row,i)=>{ const lat=83-2*i; if(lat>70||lat<-45) return; let j=0,on=false;
    for(const t of row.split('.')){ const n=parseInt(t,36);
      if(on) for(let q=0;q<n;q++){ const lon=-179+2*(j+q); if(lon>=-125&&lon<=35){ const [x,y]=projW(lon,lat); s+=`<circle class="wdot" cx="${x}" cy="${y}" r="2.1"/>`; } }
      j+=n; on=!on; } });
  return WORLD_DOTS=s; }
// contorno da região em coordenadas esquemáticas (0–100), suavizado em curvas
const CONTORNO={
  sp:[[-6,0],[20,-4],[45,6],[70,-4],[92,0],[100,18],[90,40],[98,62],[92,88],[70,98],[48,104],[22,100],[14,80],[16,58],[8,40],[-8,22]],
  rj:[[-8,6],[18,-4],[46,0],[70,2],[96,14],[104,40],[98,58],[84,66],[72,80],[52,92],[30,100],[10,96],[-2,78],[4,56],[-6,34]],
};
function suave(ps){ const n=ps.length; let d=`M${ps[0][0]},${ps[0][1]}`;
  for(let i=0;i<n;i++){ const p0=ps[(i-1+n)%n],p1=ps[i],p2=ps[(i+1)%n],p3=ps[(i+2)%n];
    const c1=[p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6], c2=[p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6];
    d+=` C${c1.map(Math.round)} ${c2.map(Math.round)} ${p2.map(Math.round)}`; }
  return d+'Z'; }
const REGIAO_BG={
  sp:()=>{const p=(a,b)=>projR(a,b).join(' ');
    return `<path class="river" d="M${p(-8,24)} Q${p(25,42)} ${p(50,37)} T${p(108,28)}"/><text class="water-lbl" x="${projR(86,24)[0]}" y="${projR(86,24)[1]}">Rio Tietê</text>`;},
  rj:()=>{const [bx,by]=projR(76,24), a=projR(-8,104), b=projR(108,90);
    return `<ellipse class="water" cx="${bx}" cy="${by}" rx="46" ry="68"/><text class="water-lbl" x="${bx}" y="${by}" text-anchor="middle">Baía de</text><text class="water-lbl" x="${bx}" y="${by+12}" text-anchor="middle">Guanabara</text>
      <polygon class="water" points="-60,${a[1]} 700,${b[1]} 700,700 -60,700"/><text class="water-lbl" x="${projR(70,99)[0]}" y="${projR(70,99)[1]}">Oceano Atlântico</text>`;},
};
function painel(k){
  if(S.carreira!=='adv') return painelComarca(k);
  const C=LOC[k], of=temEscritorio(k), isSede=k===S.sede, nAqui=S.casos.filter(z=>z.cidade===k).length;
  const sub=C.nivel==='regional'?CIDADES[C.parent].nome:C.nivel==='global'?`${C.pais} · ${C.sistema==='common'?'Common law':'Civil law'}`:C.uf;
  const status=isSede?'Sede':C.centro&&of?'Coberto pelo escritório da cidade':of?TIPO[C.nivel]:'Sem escritório';
  const custo=custoAbrir(C), alug=aluguel(C), motivo=motivoAbrir(k);
  const semTxt=C.nivel==='regional'
    ?'Sem unidade aqui, os casos deste bairro só chegam por indicação.'
    :'Sem escritório, os casos daqui só chegam por indicação e têm −10 de chance, a não ser que você pague um correspondente local.';
  return `<section class="panel">
    <div class="panel-head"><h2>${C.nome}</h2><span class="label">${sub}</span></div>
    <div><span class="tag">${status}</span></div>
    ${C.nota?`<p style="margin:0;font-size:12.5px">${C.nota}</p>`:''}
    ${C.sistema==='common'?'<p style="margin:0;font-size:12.5px">Common law: a Oratória entra com 20% de peso em todos os casos daqui.</p>':''}
    <dl class="meta">
      <dt>Tamanho do mercado</dt><dd>${'●'.repeat(C.pop)}${'○'.repeat(5-C.pop)}</dd>
      <dt>Valor das causas</dt><dd class="num">×${C.fator.toLocaleString('pt-BR')}</dd>
      <dt>Casos ativos aqui</dt><dd class="num">${nAqui}</dd>
      ${of&&!C.centro?`<dt>Custo mensal</dt><dd class="num">${brl(isSede?IMOVEIS.adv[S.u.imovel].aluguel:alug)}</dd><dt>Casos novos por mês</dt><dd class="num">${isSede?3:1}</dd>`
        :of?'':`<dt>Abrir ${TIPO[C.nivel]}</dt><dd class="num">${C.centro?'—':brl(custo)}</dd><dt>Aluguel mensal</dt><dd class="num">${C.centro?'—':brl(alug)}</dd><dt>Prestígio exigido</dt><dd class="num ${S.prest<C.req?'lo':''}">${C.req}</dd>`}
    </dl>
    <span class="label">Demanda por área</span>
    <div class="dem">${Object.entries(C.areas).sort((a,b)=>b[1]-a[1]).map(([a,w])=>`<span>${AREAS[a].nome}</span><div class="bar"><i style="width:${w/3*100}%;background:var(--b-case)"></i></div>`).join('')}</div>
    ${of?'':`<p style="margin:0;font-size:12px;color:var(--muted)">${semTxt}${C.nivel==='global'?' O custo inclui contratar um sócio local habilitado no país.':''}</p>
      <button class="btn brass" data-act="abrirFilial" data-v="${k}" ${motivo?'disabled':''}>${motivo||`Abrir ${TIPO[C.nivel]} · ${brl(custo)}`}</button>`}
  </section>`;
}
function painelRede(){ if(S.carreira==='juiz') return painelCarreiraJuiz(); if(S.carreira==='promotor') return painelCarreiraMP(); if(S.carreira==='defensor') return painelCarreiraDP();
  const cnt=n=>S.filiais.filter(f=>LOC[f].nivel===n).length;
  return `<section class="panel"><div class="panel-head"><h2>Sua rede</h2></div><dl class="meta">
    <dt>Sede</dt><dd>${CIDADES[S.sede].nome}</dd>
    <dt>Unidades de bairro</dt><dd class="num">${cnt('regional')}</dd>
    <dt>Filiais no Brasil</dt><dd class="num">${cnt('nacional')}</dd>
    <dt>Escritórios no exterior</dt><dd class="num">${cnt('global')}</dd>
    <dt>Custo mensal total</dt><dd class="num">${brl(custoSemanal())}</dd>
    <dt>Limite de casos ativos</dt><dd class="num">${maxCasos()}</dd>
    <dt>Casos novos por mês</dt><dd class="num">${3+S.filiais.length} + indicação</dd>
    <dt>Bônus de rede</dt><dd>${S.filiais.length?`+${S.filiais.length*2} no sorteio de casos raros`:'abra escritórios para ganhar'}</dd>
  </dl><button class="btn brass wide" data-act="fimSemana">Encerrar mês ▶</button></section>`; }
function renderMapa(level){
  let W,H,bg='',nodes,titulo,extra='',legenda,selK;
  if(level==='regiao'){
    const rg=regiaoAtual(); W=640; H=590; titulo='Região '+(rg==='rj'?'do Rio de Janeiro':'de '+CIDADES[rg].nome);
    extra=`<div class="chips">${['sp','rj'].map(r=>`<button class="chip ${rg===r?'on':''}" data-act="regiao" data-v="${r}">${CIDADES[r].nome}</button>`).join('')}</div>`;
    // contorno orgânico da região; bairros = células de Voronoi recortadas pelo contorno
    const ks=Object.keys(BAIRROS).filter(k=>BAIRROS[k].parent===rg);
    const pts=ks.map(k=>projR(LOC[k].sx,LOC[k].sy));
    const contorno=suave(CONTORNO[rg].map(([a,b])=>projR(a,b)));
    const cells=pts.map((a,i)=>{ let poly=[[-100,-100],[W+100,-100],[W+100,H+100],[-100,H+100]];
      pts.forEach((b,j)=>{ if(i!==j) poly=meiaPlano(poly,a,b); });
      return `<polygon class="district ${temEscritorio(ks[i])?'off':''}" points="${poly.map(p=>p.map(v=>Math.round(v)).join(',')).join(' ')}"/>`; }).join('');
    bg=`<defs><clipPath id="mancha-${rg}"><path d="${contorno}"/></clipPath></defs>`
      +`<path class="region-edge" d="${contorno}"/>`
      +`<g clip-path="url(#mancha-${rg})">${cells}</g>`;
    bg+=REGIAO_BG[rg]();
    const c0=projR(LOC[rg+':centro'].sx,LOC[rg+':centro'].sy);
    bg+=S.filiais.filter(f=>LOC[f].parent===rg).map(f=>arco(c0,projR(LOC[f].sx,LOC[f].sy),30)).join('');
    selK=(sel.regiao&&LOC[sel.regiao].parent===rg)?sel.regiao:rg+':centro';
    nodes=Object.keys(BAIRROS).filter(k=>BAIRROS[k].parent===rg).map(k=>{const [x,y]=projR(LOC[k].sx,LOC[k].sy); return noSvg(k,x,y,selK);}).join('');
    legenda='<span><i style="background:var(--brass)"></i>Seus escritórios</span><span><i style="background:var(--land);border:1px solid var(--land-edge)"></i>Área urbana</span><span>Linhas tracejadas: ligação com o escritório da cidade</span><span><i style="background:var(--b-case)"></i>Casos ativos</span>';
  } else if(level==='mundo'){
    W=640; H=460; titulo='Mundo';
    bg=worldDots();
    const s=projW(CIDADES[S.sede].lon,CIDADES[S.sede].lat);
    bg+=S.filiais.filter(f=>LOC[f].nivel==='global').map(f=>arco(s,wpos(f),70)).join('');
    selK=sel.mundo||'lis';
    nodes=[S.sede,...Object.keys(GLOBAL)].map(k=>{const [x,y]=wpos(k); return noSvg(k,x,y,selK);}).join('');
    legenda='<span><i style="background:var(--brass)"></i>Seus escritórios</span><span>Linhas tracejadas: rotas a partir da sede</span><span><i style="background:var(--b-case)"></i>Casos ativos</span>';
  } else {
    W=574; H=564; titulo='Brasil';
    for(let lo=-70;lo<=-40;lo+=10){const [x]=proj(lo,0); bg+=`<line class="grat" x1="${x}" y1="0" x2="${x}" y2="${H}"/>`;}
    for(let la=0;la>=-30;la-=10){const [,y]=proj(-50,la); bg+=`<line class="grat" x1="0" y1="${y}" x2="${W}" y2="${y}"/>`;}
    bg+=`<polygon class="land" points="${BR.map(p=>proj(p[0],p[1]).join(',')).join(' ')}"/>`;
    const s=proj(CIDADES[S.sede].lon,CIDADES[S.sede].lat);
    bg+=S.filiais.filter(f=>LOC[f].nivel==='nacional').map(f=>arco(s,proj(LOC[f].lon,LOC[f].lat))).join('');
    selK=sel.brasil||(S.carreira!=='adv'?comarcaAtual():S.sede);
    nodes=Object.keys(CIDADES).map(k=>{const [x,y]=proj(CIDADES[k].lon,CIDADES[k].lat); return noSvg(k,x,y,selK);}).join('');
    legenda='<span><i style="background:var(--brass)"></i>Seus escritórios</span><span><i style="background:var(--surface);border:1px solid var(--ink)"></i>Cidade sem escritório</span><span>Linhas tracejadas: rotas de indicação</span>';
  }
  app.innerHTML=`${header()}
  <div class="mapgrid">
    <section class="mapbox">
      <div class="panel-head" style="flex-wrap:wrap"><h2>${titulo}</h2>${extra}</div>
      <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Mapa: ${titulo}">${bg}${nodes}</svg>
      <div class="legend">${legenda}</div>
    </section>
    <div class="col">${painel(selK)}${painelRede()}</div>
  </div>`;
}
function stepper(kind,id,val,free){
  return `<div class="step"><button data-act="dec" data-k="${kind}" data-id="${id}" ${val<=0?'disabled':''} aria-label="Menos">−</button><span>${val}</span><button data-act="inc" data-k="${kind}" data-id="${id}" ${free<=0?'disabled':''} aria-label="Mais">+</button></div>`;
}
function pasta(c,ativo){
  const R=RAR[c.rar], A=AREAS[c.area], cc=calcChance(c);
  const E=ESTR[c.estrategia];
  const ganho=c.lado==='recorrido'?1:c.lado==='recorrente'?R.ganho+c.perdaOrig/2:R.ganho*(E.win||1);
  const perda=c.lado==='recorrido'?R.perda:c.lado==='recorrente'?R.perda/2:R.perda*E.loss;
  const instTxt=c.inst>1?`<span class="tag">${INST[c.inst]} · ${c.lado==='recorrente'?'você recorreu':'a outra parte recorreu'}</span>`:'';
  const skillsTxt=Object.entries(A.skills).map(([k,w])=>`${SKILLS[k]} ${Math.round(w*100)}%`).join(' · ');
  const apelo=chanceApeloAdv(c,false);
  let ctl='';
  if(ativo){
    const acordoOk=c.inst===1&&!c.acordoFalhou;
    ctl=`<div class="ctl">
      <span class="label">Estratégia</span>
      <div class="chips">${Object.entries(ESTR).map(([k,e])=>`<button class="chip ${c.estrategia===k?'on':''}" data-act="estr" data-id="${c.id}" data-v="${k}" title="${e.desc}" ${k==='acordo'&&!acordoOk?'disabled':''}>${e.nome}</button>`).join('')}</div>
      ${c.estrategia==='acordo'?`<span style="font-size:12px">Chance de acordo: <b class="num">${pct(chanceAcordo(c))}</b> · honorários de ${brl(.2*c.valor*fracAcordo())}</span>`:''}
      <span class="label">Apoios</span>
      <div class="chips">${Object.entries(APOIOS).filter(([k,a])=>!a.longe||longe(c)).map(([k,a])=>{const st=c.apoios[k]||0; const custo=custoApoio(a,c);
        const info=[`+${a.bonus}`, a.blocos?`${a.blocos} bloco${a.blocos>1?'s':''}`:'', custo?brl(custo):'', a.bad?'risco de escândalo':''].filter(Boolean).join(' · ');
        const dis = st===2 || (!st && ((a.blocos && livres()<a.blocos) || (custo && S.caixa<custo)));
        return `<button class="chip ${st?'on':''} ${a.bad?'bad':''}" data-act="apoio" data-id="${c.id}" data-v="${k}" ${dis?'disabled':''} title="${info}">${a.nome}${st===2?' ✓':''} <span class="num">(${info})</span></button>`;}).join('')}</div>
      <button class="btn ghost" data-act="antecipar" data-id="${c.id}" ${c.estrategia==='acordo'?'disabled title="Troque a estratégia para antecipar"':''}>Antecipar audiência · chance atual ${pct(cc.ch)}</button>
    </div>`;
  } else {
    ctl=`<div class="actions"><button class="btn ghost" data-act="recusar" data-id="${c.id}">Recusar</button><button class="btn" data-act="aceitar" data-id="${c.id}" ${S.casos.length>=maxCasos()?'disabled title="Limite de casos ativos"':''}>Aceitar</button></div>`;
  }
  return `<article class="folder" data-area="${A.nome}">
    <span class="stamp" style="color:var(--r-${c.rar})">${R.nome}</span>
    <h3>${esc(c.titulo)}</h3>
    ${instTxt}
    ${c.indicadoPor?`<span class="tag">Indicação de ${esc(c.indicadoPor)}</span>`:''}${c.clienteFixo?'<span class="tag" style="background:var(--brass);color:#fff">Cliente da casa</span>':''}
    ${c.indicacao&&!temEscritorio(c.cidade)?'<span class="tag">Indicação de outra cidade</span>':''}
    <dl class="meta">
      <dt>Local</dt><dd>${nomeLocal(c.cidade)}${longe(c)?' · <span class="lo">sem escritório (−10)</span>':''}</dd>
      ${LOC[c.cidade].sistema==='common'?'<dt>Sistema</dt><dd>Common law · Oratória pesa 20%</dd>':''}
      <dt>Cliente</dt><dd>${esc(c.cliente)}</dd>
      <dt>Parte contrária</dt><dd>${ADV[c.adv].nome}${c.npcAdv?npcTag(c.npcAdv):''}</dd>
      <dt>Valor da causa</dt><dd class="num">${brl(c.valor)}</dd>
      <dt>Se ganhar</dt><dd><span class="num hi">${brl(c.hon)}</span> · <span class="hi">${sgn(ganho)} prestígio</span></dd>
      <dt>Se perder</dt><dd class="lo">${sgn(-perda)} prestígio</dd>
      <dt>Audiência</dt><dd>${c.prazo<=1?'<b class="mid">no próximo mês</b>':`em ${c.prazo} meses`}${c.juri?' · <b>com júri</b>':''}</dd>
       <dt>Manutenção</dt><dd>${manut(c)} bloco${manut(c)>1?'s':''}/mês${c.atraso?` · <b class="lo">${c.atraso} atrasado${c.atraso>1?'s':''}</b>`:''}</dd>
       ${PORTE[c.rar]?`<dt>Porte</dt><dd class="${faltaPorte(c)?'lo':'hi'}">exige ${PORTE[c.rar]} advogado${PORTE[c.rar]>1?'s':''} na equipe${faltaPorte(c)?` · você tem ${advsEquipe()}`:''}</dd>`:''}
      <dt>Juiz</dt><dd title="${JUIZES[c.juiz].desc}">${c.juizNome} · ${JUIZES[c.juiz].nome}${c.npcJuiz?npcTag(c.npcJuiz):''}</dd>
      <dt>Recurso do adversário</dt><dd class="num">${c.inst<maxInst(c)?pct(apelo):'sem recurso'}</dd>
    </dl>
    <div class="vs">
      <span>Dificuldade</span><div class="bar"><i style="width:${c.d}%;background:var(--loss)"></i></div><span class="num">${c.d}</span>
      <span>Sua skill</span><div class="bar"><i style="width:${cc.skill}%;background:var(--win)"></i></div><span class="num">${Math.round(cc.skill)}</span>
    </div>
    <span class="label" style="text-transform:none;letter-spacing:0;font-weight:400">${skillsTxt}</span>
    <div class="chance"><span class="label">Chance de vitória</span><strong class="${cls(cc.ch)}">${pct(cc.ch)}</strong></div>
    <details><summary>Ver detalhes da chance</summary><ul class="break">
      <li><span>Sua skill no caso</span><span class="num">${Math.round(cc.skill)}</span></li>
      ${cc.items.map(([l,v])=>`<li><span>${esc(l)}</span><span class="num ${v>0?'hi':'lo'}">${sgn(v)}</span></li>`).join('')}
      <li><span>Dificuldade</span><span class="num lo">−${c.d}</span></li>
      ${c.juri?'<li><span>Júri: resultado menos previsível</span><span class="num">×0,8</span></li>':''}
      <li><b>Chance final (entre 5% e 95%)</b><b class="num">${pct(cc.ch)}</b></li></ul></details>
    ${ctl}
  </article>`;
}

