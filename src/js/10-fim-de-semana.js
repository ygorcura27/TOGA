// ===================== FIM DE SEMANA =====================
let ocupado=false;
async function fimSemana(){
  if(S.carreira==='juiz') return fimSemanaJuiz();
  if(S.carreira==='promotor') return fimSemanaMP();
  if(S.carreira==='defensor') return fimSemanaDP();
  if(S.carreira==='estudante') return fimSemanaEstudante();
  if(S.carreira==='academico') return fimSemanaAcademico();
  if(ocupado) return; ocupado=true;
  try{
    autoDistribuir();
    const gabA=gabinete(), trab=Math.max(0,trabalhoSemana()-gabA), lazer=S.agenda.lazer, desc=Math.max(0,S.disp+blocoEscrita()-trab-lazer-vidaBlocos());
    // agenda → preparação
    for(const c of S.casos){ cargaCaso(c,true); for(const k in c.apoios) if(c.apoios[k]===1) c.apoios[k]=2; }
    if(S.agenda.estudo){ const k=S.agenda.estudoSkill, mult=(S.traits.includes('rato')?1.5:1)*(tem('pesquisa',3)?1.5:1)*multAtual(k);
      for(let i=0;i<S.agenda.estudo;i++) S.skills[k]=clamp(S.skills[k]+1.1*mult*(1-S.skills[k]/110),0,100);
      S.estudoTotal=(S.estudoTotal||0)+S.agenda.estudo; addLog(`Estudou ${SKILLS[k]} por ${S.agenda.estudo} bloco(s).`); }
    S.energia=clamp(S.energia-3.2*trab*(S.traits.includes('workaholic')?.7:1)+3*desc+1.5*lazer,0,100);
    S.estresse=clamp(S.estresse+2.2*trab*(S.traits.includes('ansioso')?1.25:1)-1.2*desc-6*lazer,0,100);
    // acordos
    for(const c of [...S.casos]){
      if(c.estrategia!=='acordo') continue;
      const ok=await rolar(`Tentativa de acordo · ${esc(c.titulo)}`,`Negociação ${Math.round(S.skills.negociacao)}${c.juiz==='pragmatico'?' · juiz pragmático':''}${S.traits.includes('carismatico')?' · carismático':''}.`,chanceAcordo(c),'Acordo fechado','Sem acordo');
      if(ok){ const val=c.valor*fracAcordo(), hon=Math.round(val*.2);
        S.caixa+=hon; S.u.honSemana+=hon; pagarAssociados(hon); S.casos=S.casos.filter(x=>x.id!==c.id); S.vitorias++;
        addLog(`Acordo em “${c.titulo}”: ${brl(val)} acordados, ${brl(hon)} de honorários.`,'g');
      } else { c.estrategia='equilibrada'; c.acordoFalhou=true; addLog(`Acordo falhou em “${c.titulo}”. O caso segue para julgamento.`,'r'); }
    }
    // prazos e audiências
    for(const c of S.casos) c.prazo--;
    const hoje=S.casos.filter(c=>c.prazo<=0);
    S.casos=S.casos.filter(c=>c.prazo>0);
    for(const c of hoje) await audiencia(c);
    semanaEstruturaAdv();
    if(S.u.pedidoSoc) await pedidoSociedade();
    // próximo mês
    await semanaAcademia(); if(await semanaVida()) return;
    S.semana++; S.agenda.estudo=0; S.agenda.lazer=0;
    S.disp=BLOCOS-blocosPerdidos();
    if(S.estresse>=100){ S.disp=10; S.estresse=70; addLog('Burnout: você só terá 10 blocos no próximo mês.','r'); }
    else if(S.energia<=0){ S.disp=14; addLog('Exaustão: você só terá 14 blocos no próximo mês.','r'); }
    gerarOfertas();
    if(S.caixa<-25000){ S.fim='falencia'; }
    else if(S.prest<=0){ S.fim='reputacao'; }
    salvar(); render();
    if(S.fim){
      await modal(`<h2 class="lo">${S.fim==='falencia'?'Falência':'Carreira encerrada'}</h2><p>${S.fim==='falencia'?'O caixa passou de −R$ 25 mil e o escritório fechou.':'Seu prestígio chegou a zero e nenhum cliente quer mais contratar você.'} Você durou ${S.semana-1} meses, com ${S.vitorias} vitórias e ${S.derrotas} derrotas.</p>`,[{t:'Nova carreira',v:1,cls:'brass'}]);
      hallRegistrar(S.fim==='falencia'?'falencia':'encerrada'); S=null; apagarSave(); render();
    }
  } finally { ocupado=false; render(); }
}

function painelSkills(){ return `<section class="panel">
        <div class="panel-head"><h2>Skills</h2><span class="label">${S.traits.map(t=>TRAITS[t].nome).join(' · ')}</span></div>
        <div class="skills">${Object.entries(SKILLS).map(([k,v])=>`<div><span>${v} <span style="color:var(--brass)">${estrelasHtml(k)}</span></span><span class="num">${Math.floor(S.skills[k])}${ehArea(k)&&tetoArea(k)<100?`<span style="color:var(--muted);font-size:10px">/${tetoArea(k)}</span>`:''}</span><div class="bar"><i style="width:${S.skills[k]}%"></i></div></div>`).join('')}</div>
        ${S.teses.length?`<div class="chips">${S.teses.map(t=>`<span class="tag" title="+${t.bonus} em ${AREAS[t.area].nome}">${esc(t.nome)} +${t.bonus}</span>`).join('')}</div>`:'<p class="label" style="margin:0">Teses: vença casos Raros ou acima para colecionar.</p>'}
      <details><summary>Efeitos das skills nos níveis 40 · 60 · 80 (áreas: 40 · 55 · 70 · 82 · 92)</summary>${listaPerks()}</details>
      </section>`; }
function painelDiario(){ return `<section class="panel">
        <div class="panel-head"><h2>Diário</h2><span class="label">${S.carreira==='juiz'?S.j.sentencas+' sentenças':S.carreira==='promotor'?S.p.condenacoes+' condenações':S.carreira==='defensor'?S.d.atendimentos+' atendimentos':S.carreira==='academico'||S.carreira==='estudante'?S.ac.pubs.length+' publicações':S.vitorias+'V · '+S.derrotas+'D'}</span></div>
        <ul class="log">${S.log.map(l=>`<li><span class="w">M${l.w}</span><span class="${l.k}">${l.t}</span></li>`).join('')}</ul>
        <button class="btn ghost" data-act="toggleSom">${somLigado()?'Desligar o som':'Ligar o som'}</button>
        <button class="btn ghost" data-act="toggleResumo">${S.semResumo?'Religar o resumo do mês':'Desligar o resumo do mês'}</button>
        <button class="btn ghost" data-act="reiniciar">Recomeçar carreira</button>
      </section>`; }
