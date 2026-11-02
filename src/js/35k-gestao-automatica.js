// ===================== GESTÃO AUTOMÁTICA DO ESCRITÓRIO =====================
// o escritório pode andar sozinho: aceitar casos com chance mínima, mandar a equipe às audiências e distribuir os blocos dela.
// Automático é mais confortável, mas a skill dos advogados costuma ser menor que a sua: a chance cai nos casos que eles levam.
const GESTAO_AUD={raras:'Eu vou às raras ou maiores',epicas:'Eu vou só às épicas e lendárias',nenhuma:'A equipe vai sempre que puder'};
const gestao=()=>S.gestao||(S.gestao={aceitar:false,minCh:.5,aud:'raras'});
// quem vai à audiência por padrão segue a regra escolhida; a hierarquia de quem pode ir continua valendo
{ const m0=modoPadrao; modoPadrao=function(c){ if(papelAud()!=='adv') return m0(c); const G=gestao(), r=RORD.indexOf(c.rar);
    const eu=G.aud==='raras'?r>=2:G.aud==='epicas'?r>=3:false;
    if(eu&&vivoPermitido(c)) return 'vivo'; return melhorSub(c)?'enviar':'rapida'; }; }
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
    <div style="display:grid;gap:8px"><span class="label">Audiências</span>
      <select data-gestao="aud">${opt(GESTAO_AUD,G.aud)}</select>
      ${nt('Quem vai no seu lugar: épicas e lendárias só um sócio; raras a partir de sênior; incomuns a partir de pleno; comuns qualquer advogado. A chance usa a skill de quem for.')}</div>
    <div style="display:grid;gap:8px"><span class="label">Equipe</span>
      <label class="row"><input type="checkbox" data-gestao="dist" ${U.auto&&g?'checked':''} ${g?'':'disabled'}> <span>${g?`${esc(g.nome)} distribui os blocos da equipe pelos casos mais urgentes`:'Distribuir os blocos da equipe: contrate um gestor administrativo'}</span></label></div>
    </div>
  </section>`; }
// fica na aba Estrutura e equipe, junto do trabalho nos casos (ver 35m)
document.addEventListener('change',e=>{ const k=e.target.dataset&&e.target.dataset.gestao; if(!k||!S) return; const G=gestao();
  if(k==='aceitar'){ G.aceitar=e.target.checked; if(G.aceitar) aceitarAutomatico(); }
  if(k==='minCh'){ G.minCh=+e.target.value; aceitarAutomatico(); }
  if(k==='aud'){ G.aud=e.target.value; for(const c of S.casos) delete c.modoAud; } // volta todos os casos para a regra nova
  if(k==='dist') S.u.auto=e.target.checked;
  salvar(); render(); });
