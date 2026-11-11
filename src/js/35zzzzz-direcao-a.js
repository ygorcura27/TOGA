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
    let prazo=''; for(const dt of f.querySelectorAll(':scope > .meta dt')) if(/^Audi[eê]ncia$|^Prazo$|^Idade$/i.test(dt.textContent.trim())){ const dd=dt.nextElementSibling; if(dd){ prazo=dd.textContent.split('·')[0].trim(); if(/pr[oó]ximo m[eê]s|neste m[eê]s|atrasad/i.test(dd.textContent)) row.dataset.urg='1'; } break; }
    if(prazo){ const p=document.createElement('span'); p.className='prazo'+(row.dataset.urg?' urg':''); p.textContent=/^em |^no |^neste/i.test(prazo)?'audiência '+prazo:prazo; row.appendChild(p); }
    for(const t of [...f.children].filter(el=>el.tagName==='SPAN'&&el.classList.contains('tag'))) row.appendChild(t);
    if(row.children.length) h.insertAdjacentElement('afterend',row); } }
{ const r0=render; render=function(){ r0(); try{ agruparCabecalho(); refinarCartoes(); }catch(e){ console.warn('direção A',e); } }; }
