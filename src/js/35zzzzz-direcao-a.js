// ===================== DIREÇÃO VISUAL A · TRIBUNAL NOTURNO REFINADO =====================
// Reorganiza a tela depois de desenhada, sem mudar a marcação que os outros módulos usam:
//  · cabeçalho: medidores agrupados por tema (dinheiro, carreira, corpo), com alerta no que pede atenção;
//  · cartão do caso: faixa na cor da raridade e uma linha de selos com o prazo da audiência.
const GRUPO_STAT=[['corpo',/energia|estresse|sa[uú]de|felicidade/i],['dinheiro',/caixa|pessoal|receber|custo|sal[aá]rio|or[cç]amento|bolsa|mesada|patrim/i]];
const NOME_GRUPO={dinheiro:'Dinheiro',carreira:'Carreira',corpo:'Corpo'};
function agruparCabecalho(){ const top=app.querySelector('header.top'); if(!top||top.querySelector('.grupos')) return;
  const stats=[...top.children].filter(el=>el.classList.contains('stat')); if(stats.length<3) return;
  const G={dinheiro:[],carreira:[],corpo:[]};
  for(const st of stats){ const lb=(st.querySelector('.label')||{}).textContent||'', g=(GRUPO_STAT.find(([,re])=>re.test(lb))||['carreira'])[0]; G[g].push(st);
    const v=parseFloat(((st.querySelector('b')||{}).textContent||'').replace(/[^\d,-]/g,'').replace(',','.'));
    if((/energia/i.test(lb)&&v<30)||(/estresse/i.test(lb)&&v>=80)||(/sa[uú]de/i.test(lb)&&v<40)) st.classList.add('alerta'); }
  const box=document.createElement('div'); box.className='grupos'; top.insertBefore(box,stats[0]);
  for(const k of ['dinheiro','carreira','corpo']){ if(!G[k].length) continue; const d=document.createElement('div'); d.className='grupo g-'+k; d.setAttribute('role','group'); d.setAttribute('aria-label',NOME_GRUPO[k]);
    d.innerHTML=`<span class="grupo-t" aria-hidden="true">${NOME_GRUPO[k]}</span>`; for(const st of G[k]) d.appendChild(st); box.appendChild(d); } }
function refinarCartoes(){ for(const f of app.querySelectorAll('.folder:not([data-ref])')){ f.dataset.ref='1';
    const st=f.querySelector(':scope > .stamp'); if(st&&st.style.color) f.style.setProperty('--rc',st.style.color);
    const h=f.querySelector(':scope > h3'); if(!h) continue;
    const row=document.createElement('div'); row.className='selos';
    let prazo=''; for(const dt of f.querySelectorAll(':scope > .meta dt')){ const t=dt.textContent.trim(), dd=dt.nextElementSibling; if(!dd) continue;
      if(/^Audi[eê]ncia$/i.test(t)){ prazo=dd.textContent.split('·')[0].trim(); if(/pr[oó]ximo m[eê]s|neste m[eê]s/i.test(dd.textContent)) row.dataset.urg='1'; break; }
      if(/^No acervo há$|^Na promotoria há$/i.test(t)){ const m=dd.textContent.match(/(\d+)\s*meses?\s*·\s*meta\s*(\d+)/); if(m){ prazo=`${m[1]} de ${m[2]} meses`; if(dd.classList.contains('lo')||+m[1]>+m[2]){ row.dataset.urg='1'; prazo+=' · atrasado'; } } break; } }
    if(prazo){ const p=document.createElement('span'); p.className='prazo'+(row.dataset.urg?' urg':''); p.textContent=/^em |^no |^neste/i.test(prazo)?'audiência '+prazo:/^\d+ de/.test(prazo)?prazo:'audiência '+prazo; row.appendChild(p); }
    for(const t of [...f.children].filter(el=>el.tagName==='SPAN'&&el.classList.contains('tag'))) row.appendChild(t);
    if(row.children.length) h.insertAdjacentElement('afterend',row); } }
{ const r0=render; render=function(){ r0(); try{ agruparCabecalho(); refinarCartoes(); }catch(e){ console.warn('direção A',e); } }; }
// aba Estrutura e equipe: navegação por seções no topo (rola até o painel)
function navEstrutura(){ if(view!=='estrutura'||app.querySelector('.sec-nav')) return; const itens=[];
  for(const el of [...app.children]){ if(el.matches('header.top,.ticker,.tut')) continue; const h=el.querySelector('h2'); if(!h) continue;
    const nome=el.classList.contains('mapgrid')?'Planta e nível':h.textContent.trim().replace(/^Gestão d[oa] .*/,'Gestão'); el.dataset.sec=String(itens.length); itens.push(nome); }
  if(itens.length<3) return; const alvo=[...app.children].find(el=>el.dataset.sec==='0');
  alvo.insertAdjacentHTML('beforebegin',`<nav class="sec-nav" aria-label="Seções desta aba">${itens.map((n,i)=>`<button class="chip" data-sec-ir="${i}">${esc(n)}</button>`).join('')}</nav>`); }
document.addEventListener('click',e=>{ const b=e.target.closest('[data-sec-ir]'); if(!b) return; const el=app.querySelector(`[data-sec="${b.dataset.secIr}"]`); if(!el) return;
  const red=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches; el.scrollIntoView({behavior:red?'auto':'smooth',block:'start'}); });
{ const r1=render; render=function(){ r1(); try{ navEstrutura(); }catch(e){ console.warn('nav estrutura',e); } }; }
// celular: a barra de abas rola sozinha até a aba ativa (sem mexer na rolagem da página)
function centrarAba(){ const tabs=app.querySelector('.top .tabs'), t=tabs&&tabs.querySelector('.tab.on'); if(!t||tabs.scrollWidth<=tabs.clientWidth) return;
  tabs.scrollLeft=Math.max(0,t.offsetLeft-tabs.offsetLeft-(tabs.clientWidth-t.offsetWidth)/2); }
{ const r2=render; render=function(){ r2(); try{ centrarAba(); }catch(e){} }; }
