// ===================== O GESTOR APRENDE =====================
// A gestão do gestor (ou chefe de gabinete, de secretaria, coordenador) cresce com o tempo no cargo e com cursos.
// Tempo de casa: um pouco por mês, mais devagar quanto mais alto. Curso: +6 na hora, pago pelo caixa (ou orçamento da unidade), com intervalo de 12 meses.
const CURSO_GESTAO={custo:6000,ganho:6,intervalo:12,teto:95};
const pagaEstrutura=()=>pubCar()?S.u.orc:S.caixa;
function semanaGestor(){ const g=S.u&&gestorAtual(); if(!g) return;
  const antes=Math.floor(g.g); g.g=Math.min(CURSO_GESTAO.teto,g.g+.5*(1-g.g/110));
  if(Math.floor(g.g)>antes&&Math.floor(g.g)%5===0) addLog(`${g.nome} ganhou experiência na gestão: agora ${Math.floor(g.g)}.`,'g'); }
{ const s0=semanaEquipe; semanaEquipe=function(){ const r=s0(); semanaGestor(); return r; }; }
const cursoDisponivel=f=>!f.cursoGEm||S.semana-f.cursoGEm>=CURSO_GESTAO.intervalo;
function cursoGestao(id){ const f=S.u.equipe.find(x=>x.id===id); if(!f||f.id!==S.u.gestorId||!cursoDisponivel(f)||f.g>=CURSO_GESTAO.teto) return;
  if(pagaEstrutura()<CURSO_GESTAO.custo) return;
  if(pubCar()) S.u.orc-=CURSO_GESTAO.custo; else S.caixa-=CURSO_GESTAO.custo;
  const a=f.g; f.g=Math.min(CURSO_GESTAO.teto,f.g+CURSO_GESTAO.ganho); f.cursoGEm=S.semana; f.moral=clamp(f.moral+5,0,100);
  addLog(`${f.nome} fez um curso de gestão: ${Math.floor(a)} → ${Math.floor(f.g)}.`,'g'); salvar(); render(); }
// botão no cartão do gestor; a gestão aparece arredondada
{ const c0=cardFunc; cardFunc=function(f){ let h=c0(f); h=h.replace(`<span class="num">${f.g}</span>`,`<span class="num">${Math.floor(f.g)}</span>`);
    if(f.id!==S.u.gestorId) return h;
    const falta=f.cursoGEm?CURSO_GESTAO.intervalo-(S.semana-f.cursoGEm):0, sem=pagaEstrutura()<CURSO_GESTAO.custo, max=f.g>=CURSO_GESTAO.teto;
    const tt=max?'Gestão no máximo.':falta>0?`Próximo curso em ${falta} ${falta===1?'mês':'meses'}.`:sem?`Falta ${pubCar()?'orçamento':'caixa'}.`:`+${CURSO_GESTAO.ganho} de gestão na hora. Um curso a cada ${CURSO_GESTAO.intervalo} meses.`;
    const bt=`<button class="chip" data-act="cursoGestao" data-id="${f.id}" ${max||falta>0||sem?'disabled':''} title="${tt}">Curso de gestão · ${brl(CURSO_GESTAO.custo)}</button>`;
    return h.replace('<div class="chips">',`<p style="margin:0;font-size:12px;color:var(--muted)">Gestão cresce com o tempo no cargo (mais devagar quanto mais alta) e com cursos. ${tt}</p><div class="chips">${bt}`); }; }
// arredonda também no resumo de organização
{ const r0=renderEstrutura; renderEstrutura=function(){ r0(); const g=S.u&&gestorAtual(); if(!g) return;
    app.querySelectorAll('dd').forEach(dd=>{ if(dd.textContent.includes(' · gestão ')) dd.textContent=dd.textContent.replace(/ · gestão [\d.]+/,` · gestão ${Math.floor(g.g)}`); }); }; }
document.addEventListener('click',e=>{ const b=e.target.closest('[data-act=cursoGestao]'); if(!b||b.disabled||!S) return; cursoGestao(+b.dataset.id); });
