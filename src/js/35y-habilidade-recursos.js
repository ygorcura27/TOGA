// ===================== HABILIDADE DE RECURSOS =====================
// Uma skill com estrelas por instância: Apelação no tribunal (2ª instância) pede 1★, Recurso Especial no STJ/TST 3★,
// Recurso Extraordinário no STF 5★. Peso leve: cada estrela que falta tira 3 (no máximo −9); ter as estrelas dá +3.
// Quem sustenta o recurso é quem conta: você, ou o advogado enviado. Sobe com a experiência em recursos e com congresso
// (uma vez por ano por pessoa). No juiz, a skill fortalece a sentença: as partes recorrem menos.
SKILLS.recursos='Recursos'; SK5.push('recursos');
const REC_INST={2:{nome:'Apelação',onde:'Tribunal (2ª instância)',est:1},3:{nome:'Recurso Especial',onde:'STJ / TST',est:3},4:{nome:'Recurso Extraordinário',onde:'STF',est:5}};
const REC_PASSO=3, REC_MAX=9, REC_OK=3, CONGRESSO={custo:8000,ganho:8};
const estRec=v=>NIV_AREA.filter(x=>(v||0)>=x).length;
function bonusRecurso(inst,valor){ const R=REC_INST[Math.min(4,inst)]; if(!R) return 0; const falta=R.est-estRec(valor); return falta>0?-Math.min(REC_MAX,falta*REC_PASSO):REC_OK; }
// quem sustenta: o advogado enviado (se for o caso) ou você
function quemSustenta(c){ if(S.carreira==='adv'&&typeof modoDe==='function'&&modoDe(c)==='enviar'){ const s=melhorSub(c); if(s) return {nome:s.f.nome,rec:s.f.rec||0,f:s.f}; } return {nome:'Você',rec:S.skills.recursos||0}; }
// advocacia
{ const b0=bonusPerks; bonusPerks=function(c,add){ b0(c,add); if((c.inst||1)<2) return; const q=quemSustenta(c), b=bonusRecurso(c.inst,q.rec), R=REC_INST[Math.min(4,c.inst)];
    add(`${R.nome}: ${q.nome==='Você'?'seus':'de '+q.nome.split(' ')[0]} Recursos ${'★'.repeat(estRec(q.rec))||'0★'} (pede ${R.est}★)`,b); }; }
// promotor e defensor: o recurso do próprio órgão
for(const nome of ['calcCondenacao','calcDefesa']){ const f0=nome==='calcCondenacao'?calcCondenacao:calcDefesa;
  const f=function(c){ const r=f0(c); if((c.inst||1)<2) return r; const b=bonusRecurso(c.inst,S.skills.recursos), R=REC_INST[Math.min(4,c.inst)];
    r.items=r.items||[]; r.items.push([`${R.nome}: seus Recursos (pede ${R.est}★)`,b]); r.ch=clamp(r.ch+b*.02,.05,.95); return r; };
  if(nome==='calcCondenacao') calcCondenacao=f; else calcDefesa=f; }
// juiz: sentença bem fundamentada desestimula recurso (−3% por estrela, até −15%)
{ const c0=chanceRecursoJ; chanceRecursoJ=function(p){ const v=c0(p); return v?Math.max(0,v-.03*estRec(S.skills.recursos)):v; }; }
// experiência: quem vai ao recurso aprende
const XP_REC={comum:1.5,incomum:2,raro:2.5,epico:3,lendario:3.5};
{ const g0=ganharXp; ganharXp=function(c,mult){ g0(c,mult); if((c.inst||1)>=2&&c._modo!=='enviar') S.skills.recursos=clamp((S.skills.recursos||0)+XP_REC[c.rar]*mult*(1-(S.skills.recursos||0)/110),0,100); }; }
{ const x0=xpSubstituto; xpSubstituto=function(c,mult){ x0(c,mult); if((c.inst||1)<2) return; const a=acharMembro(c._sub); if(a){ const f=a[0]; f.rec=clamp((f.rec||0)+XP_REC[c.rar]*mult*(1-(f.rec||0)/110),0,95); } }; }
// equipe: cada advogado nasce com um nível de Recursos; alguns têm foco em recursos
const REC_FAIXA={associado:[20,40],junior:[20,38],pleno:[32,55],senior:[45,70],socio:[52,78]};
function darRecursos(f){ if(f.rec!==undefined||!REC_FAIXA[f.funcao]) return; const [a,b]=REC_FAIXA[f.funcao]; f.recEsp=Math.random()<.2; f.rec=clamp(rint(a,b)+(f.recEsp?15:0),0,92); }
{ const g0=gerarCandidato; gerarCandidato=function(funcao,area){ const c=g0(funcao,area); if(!pubCar()) darRecursos(c); return c; }; }
// saves antigos e jogos novos
{ const r0=render; render=function(){ if(S&&S.skills&&S.skills.recursos===undefined) S.skills.recursos=35;
    if(S&&S.u&&S.carreira==='adv') for(const f of todosDaEquipe().map(x=>x[0])) darRecursos(f); r0(); }; }
// congresso: uma vez por ano por pessoa
const anoJogo=()=>Math.floor((S.semana-1)/12);
const pagaCongresso=()=>S.carreira==='adv'?S.caixa:dinheiroPessoal();
function congresso(id){ const eu=id==='eu', f=eu?null:(acharMembro(+id)||[])[0]; if(!eu&&!f) return;
  const ja=eu?S.congressoEm===anoJogo():f.congressoEm===anoJogo(); if(ja||pagaCongresso()<CONGRESSO.custo) return;
  if(S.carreira==='adv') S.caixa-=CONGRESSO.custo; else pagarPessoal(CONGRESSO.custo);
  if(eu){ S.congressoEm=anoJogo(); S.skills.recursos=clamp((S.skills.recursos||0)+CONGRESSO.ganho,0,100); addLog(`Você foi a um congresso de recursos: Recursos agora ${Math.round(S.skills.recursos)}.`,'g'); }
  else { f.congressoEm=anoJogo(); f.rec=clamp((f.rec||0)+CONGRESSO.ganho,0,95); f.moral=clamp(f.moral+5,0,100); addLog(`${f.nome} foi a um congresso de recursos: Recursos agora ${Math.round(f.rec)}.`,'g'); }
  salvar(); render(); }
document.addEventListener('click',e=>{ const b=e.target.closest('[data-act=congresso]'); if(!b||b.disabled||!S) return; congresso(b.dataset.id); });
// ---------- painel na aba Estrutura e equipe ----------
const starsRec=v=>{ const e=estRec(v); return `<span style="color:var(--brass)">${'★'.repeat(e)}<span style="opacity:.3">${'★'.repeat(5-e)}</span></span>`; };
function painelRecursos(){ if(!S||!['adv','juiz','promotor','defensor'].includes(S.carreira)) return ''; const eu=S.skills.recursos||0, adv=S.carreira==='adv', ano=anoJogo();
  const bt=(id,ja)=>`<button class="chip" data-act="congresso" data-id="${id}" ${ja||pagaCongresso()<CONGRESSO.custo?'disabled':''} title="+${CONGRESSO.ganho} em Recursos · uma vez por ano por pessoa">${ja?'já foi este ano':`Congresso · ${brl(CONGRESSO.custo)}`}</button>`;
  const inst=S.carreira==='juiz'?`<p class="gx-nt">No juiz, Recursos fortalece a sentença: cada estrela reduz em 3% a chance de as partes recorrerem (até −15%). Hoje: −${3*estRec(eu)}%.</p>`
    :`<div class="rec-inst">${Object.entries(REC_INST).map(([i,R])=>{ const b=bonusRecurso(+i,eu); return `<div class="${b<0?'falta':''}"><span class="label">${R.onde}</span><b>${R.nome}</b><small>pede ${R.est}★ · ${b<0?`<span class="lo">${b} na chance</span>`:`<span class="hi">+${b} na chance</span>`}</small></div>`; }).join('')}</div>`;
  const equipe=adv?todosDaEquipe().map(x=>x[0]).filter(f=>f.rec!==undefined).sort((a,b)=>b.rec-a.rec):[];
  return `<section class="panel rec-p"><div class="panel-head"><h2>Recursos</h2><span class="label">${adv?'quem sustenta recursos':'sua habilidade'}</span></div>
    ${inst}
    ${adv?'<p class="gx-nt">Faltar estrela pesa pouco: −3 por estrela, no máximo −9. Conta quem sustenta o recurso: você ou o advogado enviado. Sobe com a experiência em recursos e com congresso.</p>':''}
    <div class="tblwrap"><table class="aj-tab"><thead><tr><th>Pessoa</th><th>Recursos</th><th>Estrelas</th><th></th></tr></thead><tbody>
      <tr><td><b>Você</b></td><td class="num">${Math.floor(eu)}</td><td>${starsRec(eu)}</td><td>${bt('eu',S.congressoEm===ano)}</td></tr>
      ${equipe.map(f=>`<tr><td><b>${esc(f.nome)}</b>${f.recEsp?' <span class="tag">foco em recursos</span>':''}<br><small class="gx-mut">${nomeFuncao(f)}</small></td><td class="num">${Math.floor(f.rec)}</td><td>${starsRec(f.rec)}</td><td>${bt(f.id,f.congressoEm===ano)}</td></tr>`).join('')}
    </tbody></table></div></section>`; }
{ const r0=renderEstrutura; renderEstrutura=function(){ r0(); const h=painelRecursos(); if(!h) return; const fil=app.querySelector('.panel.filiais-eq'); if(fil) fil.insertAdjacentHTML('beforebegin',h); else app.insertAdjacentHTML('beforeend',h); }; }
// texto de ajuda da skill
if(typeof USO_SKILL==='object') USO_SKILL.recursos='Recursos no tribunal, no STJ/TST e no STF: Apelação pede 1★, Recurso Especial 3★, Recurso Extraordinário 5★. Cada estrela que falta tira 3 (até −9); ter as estrelas dá +3. No juiz, reduz a chance de recurso contra as suas sentenças. Sobe com experiência em recursos e com congresso (uma vez por ano).';
