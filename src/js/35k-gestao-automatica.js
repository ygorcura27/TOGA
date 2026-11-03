// ===================== GESTÃO AUTOMÁTICA DO ESCRITÓRIO =====================
// o escritório pode andar sozinho: aceitar casos com chance mínima, mandar a equipe às audiências e distribuir os blocos dela.
// Automático é mais confortável, mas a skill dos advogados costuma ser menor que a sua: a chance cai nos casos que eles levam.
const GESTAO_AUD={raras:'Eu vou às raras ou maiores',epicas:'Eu vou só às épicas e lendárias',nenhuma:'A equipe vai sempre que puder'};
const gestao=()=>{ const G=S.gestao||(S.gestao={aceitar:false,minCh:.5,aud:'raras'}); if(G.acordo===undefined){ G.acordo=false; G.minAc=.6; } return G; };
// postura padrão das audiências: uma escolha por faixa de raridade e por instância (nas carreiras públicas, só por raridade)
const GRUPOS_AUD={alta:'Épicos e lendários',media:'Raros e incomuns',baixa:'Comuns'};
const INST_AUD={1:'1ª instância',2:'2ª instância',3:'STJ',4:'STF'};
const grupoAud=c=>{ const r=RORD.indexOf(c.rar); return r>=3?'alta':r>=1?'media':'baixa'; };
// advogado pode delegar; juiz, promotor e defensor são titulares e conduzem sempre
const MODOS_AUD=()=>S.carreira==='juiz'?{vivo:'Audiência completa',rapido:'Julgamento rápido',rapida:'Sentença direta'}
  :papelAud()==='adv'?{vivo:'Sempre ao vivo',rapida:'Rápida',enviar:'Enviar advogado'}:{vivo:'Sempre ao vivo',rapida:'Rápida'};
// converte a regra antiga (um seletor só) na tabela nova
function modosIniciais(aud){ const eu={alta:aud!=='nenhuma',media:aud==='raras',baixa:false}, M={};
  for(const g in GRUPOS_AUD){ M[g]={}; for(const i in INST_AUD) M[g][i]=eu[g]?'vivo':'enviar'; } return M; }
const modosAud=()=>{ const G=gestao(); if(!G.modos) G.modos=modosIniciais(G.aud||'raras'); return G.modos; };
const modoDesejado=c=>{ const m=modosAud()[grupoAud(c)]; return m[S.carreira==='adv'?Math.min(4,c.inst||1):1]; };
const euVou=c=>modoDesejado(c)==='vivo';
// o que der para cumprir: ao vivo só onde cabe; enviar só se houver alguém que possa ir (hierarquia); senão, rápida
{ modoPadrao=function(c){ const m=modoDesejado(c);
    if(m==='vivo'&&vivoPermitido(c)) return 'vivo';
    if(m==='enviar'||m==='vivo') return melhorSub(c)?'enviar':'rapida';
    return 'rapida'; }; }
function tabelaModos(){ const M=modosAud(), adv=S.carreira==='adv', cols=adv?Object.keys(INST_AUD):['1'], O=MODOS_AUD();
  const sel=(g,i)=>`<select data-gestao-modo="${g}:${i}" aria-label="${GRUPOS_AUD[g]}${adv?', '+INST_AUD[i]:''}">${Object.entries(O).map(([k,t])=>`<option value="${k}" ${(O[M[g][i]]?M[g][i]:'rapida')===k?'selected':''}>${t}</option>`).join('')}</select>`;
  return `<div class="modos-aud"><table><thead><tr><th></th>${cols.map(i=>`<th>${adv?INST_AUD[i]:''}</th>`).join('')}</tr></thead>
    <tbody>${Object.keys(GRUPOS_AUD).map(g=>`<tr><th scope="row">${GRUPOS_AUD[g]}</th>${cols.map(i=>`<td>${sel(g,i)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`; }
function aceitarAutomatico(){ if(S.carreira!=='adv'||!gestao().aceitar) return 0; let n=0;
  const L=ofertasFiltradas().filter(c=>!(c.npcJuiz&&npcTipo(npcPor(c.npcJuiz))==='amigo')&&calcChance(c).ch>=gestao().minCh).sort((a,b)=>calcChance(b).ch-calcChance(a).ch);
  for(const c of L){ if(casos1()>=maxCasos()) break; S.casos.push(c); S.ofertas=S.ofertas.filter(x=>x!==c); n++;
    addLog(`Gestão automática aceitou “${c.titulo}” (${RAR[c.rar].nome}, chance ${pct(calcChance(c).ch)}).`); }
  return n; }
{ const g0=gerarOfertas; gerarOfertas=function(){ g0(); aceitarAutomatico(); }; }
function painelGestao(){ if(S.carreira!=='adv') return ''; const G=gestao(), U=S.u, g=gestorAtual();
  const opt=(o,v)=>Object.entries(o).map(([k,t])=>`<option value="${k}" ${String(v)===k?'selected':''}>${t}</option>`).join('');
  const nt=t=>`<p class="label" style="margin:0;text-transform:none;letter-spacing:0;font-weight:400">${t}</p>`;
  return `<section class="panel gestao" style="margin-bottom:16px"><div class="panel-head"><h2>Gestão do escritório</h2><span class="label">${G.aceitar||(U.auto&&g)?'automática':'manual'}</span></div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px 24px;align-items:start">
    <div style="display:grid;gap:8px"><span class="label">Casos novos</span>
      <label class="row"><input type="checkbox" data-gestao="aceitar" ${G.aceitar?'checked':''}> <span>Aceitar casos sozinho, do maior para o menor chance</span></label>
      <div class="row"><span class="name">Chance mínima</span><select data-gestao="minCh" ${G.aceitar?'':'disabled'}>${opt({'0.4':'40%','0.5':'50%','0.6':'60%','0.7':'70%'},G.minCh)}</select></div>
      ${nt('Respeita o filtro dos casos novos e as vagas livres (recursos não ocupam vaga).')}</div>
    <div style="display:grid;gap:8px"><span class="label">Equipe</span>
      <label class="row"><input type="checkbox" data-gestao="dist" ${U.auto&&g?'checked':''} ${g?'':'disabled'}> <span>${g?`${esc(g.nome)} distribui os blocos da equipe pelos casos mais urgentes`:'Distribuir os blocos da equipe: contrate um gestor administrativo'}</span></label></div>
    </div>
    <span class="label" style="margin-top:4px">Audiências · sua postura padrão</span>
    ${tabelaModos()}
    ${nt(`Ao vivo cabem ${VIVO_MES} por mês; as que passarem disso vão com a equipe ou rápidas. Quem vai no seu lugar segue a hierarquia: épicos e lendários só um sócio; raros a partir de sênior; incomuns a partir de pleno; comuns qualquer advogado. Sem ninguém que possa ir, a audiência é rápida. Você ainda pode mudar caso a caso na pasta.`)}
  </section>`; }
// fica na aba Estrutura e equipe, junto do trabalho nos casos (ver 35m)
document.addEventListener('change',e=>{ const k=e.target.dataset&&e.target.dataset.gestao; if(!k||!S) return; const G=gestao();
  if(k==='aceitar'){ G.aceitar=e.target.checked; if(G.aceitar) aceitarAutomatico(); }
  if(k==='minCh'){ G.minCh=+e.target.value; aceitarAutomatico(); }
  if(k==='dist') S.u.auto=e.target.checked;
  salvar(); render(); });
document.addEventListener('change',e=>{ const k=e.target.dataset&&e.target.dataset.gestaoModo; if(!k||!S) return; const [g,i]=k.split(':');
  modosAud()[g][i]=e.target.value;
  for(const c of [...S.casos,...(S.j?S.j.acervo:[]),...(S.p?S.p.casos:[]),...(S.d?S.d.casos:[])]) if(grupoAud(c)===g&&(S.carreira!=='adv'||Math.min(4,c.inst||1)==+i)) delete c.modoAud; // esses casos voltam para a regra nova
  salvar(); render(); });
