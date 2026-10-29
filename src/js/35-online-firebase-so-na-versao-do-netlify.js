// ===================== ONLINE (Firebase, só na versão do Netlify) =====================
// window.TOGA_ONLINE é criado por web/online.js; sem ele, tudo abaixo vira no-op e o jogo segue offline
const ON=()=>window.TOGA_ONLINE&&window.TOGA_ONLINE.ativo?window.TOGA_ONLINE:null;
function apagarSave(){ try{localStorage.removeItem('toga-proto');}catch(e){} const o=ON(); if(o) o.apagar(); }
function contaInner(){ const o=ON(); if(!o) return '';
  return o.logado?`<span>${o.descConectado||`Conectado como <b>${esc(o.nome)}</b> · o progresso é salvo na nuvem.`}</span><button class="btn ghost" data-act="logout">${o.textoSair||'Sair'}</button>`
    :`<span>${o.descEntrar||'Entre com Google para salvar o progresso na nuvem e continuar em outro aparelho.'}</span><button class="btn" data-act="login">${o.textoEntrar||'Entrar com Google'}</button>`; }
const contaHtml=()=>`<div class="conta-box">${contaInner()}</div>`;
async function preencherHallOnline(){ const els=document.querySelectorAll('.hall-online'), o=ON(); if(!els.length) return;
  if(!o){ els.forEach(el=>el.innerHTML=''); return; }
  let L; try{ L=await o.topHall(20); }catch(e){ els.forEach(el=>el.innerHTML='<p class="label" style="margin:0">Ranking online indisponível agora.</p>'); return; }
  els.forEach(el=>{ const lim=+el.dataset.lim||10;
    el.innerHTML=`<span class="label">Ranking online · todos os jogadores</span>${L.length?`<ol class="hall">${L.slice(0,lim).map((v,i)=>`<li class="${i===0?'top':''}"><span class="num pos">${i+1}</span>
      <div><b>${esc(v.nome)}</b>${v.meu?' <span class="label hi">você</span>':''} <span class="label">${v.geracao}ª geração · ${v.idade} anos · ${MOTIVO_HALL[v.motivo]||esc(v.motivo)}</span><small>${esc(v.carreira)} · ${esc(v.resumo)} · prestígio ${v.prest} · ${brl(v.patrimonio)} · ${v.conq} conquista${v.conq===1?'':'s'}</small></div>
      <b class="num pts">${v.pontos}</b></li>`).join('')}</ol>`:'<p style="margin:0;color:var(--muted)">Ninguém entrou no ranking online ainda. Seja a primeira vida registrada.</p>'}`; }); }
function atualizarOnline(){ const hi=document.querySelector('.hall-inicio'); if(hi&&!hi.innerHTML.trim()&&ON()) hi.innerHTML=painelHall(5);
  document.querySelectorAll('.conta-box').forEach(el=>el.innerHTML=contaInner()); preencherHallOnline(); }
window.addEventListener('toga-online',atualizarOnline);
{ const r0=render; render=function(){ r0(); atualizarOnline(); }; }
window.TOGA_JOGO={
  estado:()=>S,
  // diálogo da conta: entrar, criar conta ou usar um código de save antigo
  async dialogoConta(){ const val={};
    const v=await modal(`<h2>Salvar na nuvem</h2><p>Com uma conta, o jogo fica salvo na nuvem e você continua de qualquer navegador ou do celular.</p>
      <div class="field"><label class="label" for="ct-user">Usuário</label><input id="ct-user" maxlength="20" autocomplete="username" placeholder="ex.: ana.ribeiro"></div>
      <div class="field"><label class="label" for="ct-pass">Senha (mínimo 6 caracteres)</label><input id="ct-pass" type="password" maxlength="100" autocomplete="current-password"></div>
      <details><summary class="label">Tenho um código de save</summary><div class="field" style="margin-top:6px"><input id="cod-in" placeholder="TOGA-XXXX-XXXX-XXXX" maxlength="19" autocomplete="off" style="font-family:var(--f-mono);text-transform:uppercase">
        <button class="btn ghost" data-mv="codigo" style="margin-top:6px">Usar o código</button></div></details>`,
      [{t:'Cancelar',v:'',cls:'ghost'},{t:'Criar conta',v:'criar'},{t:'Entrar',v:'entrar',cls:'brass'}],
      root=>{ for(const [id,k] of [['ct-user','usuario'],['ct-pass','senha'],['cod-in','codigo']]){ const i=root.querySelector('#'+id); if(i) i.addEventListener('input',()=>{ val[k]=i.value; }); }
        const u=root.querySelector('#ct-user'); if(u) setTimeout(()=>u.focus(),0); });
    if(v==='codigo') return val.codigo&&val.codigo.trim()?{tipo:'codigo',codigo:val.codigo}:null;
    if(v==='criar'||v==='entrar') return {tipo:v,usuario:(val.usuario||'').trim(),senha:val.senha||''};
    return null; },
  carregarEstado(d){ start({S:d}); if(S) salvar(); },
  async escolherSave(n,l){ const q=x=>`${esc(x.nome)} · mês ${x.semana}${x.salvoEm?' · '+new Date(x.salvoEm).toLocaleString('pt-BR'):''}`;
    return await modal(`<h2>Qual save usar?</h2><p>Há um jogo salvo na nuvem diferente do jogo deste navegador. O que você não escolher será substituído.</p>
      <div class="opts"><button class="opt" data-mv="nuvem"><span>Save da nuvem</span><small>${q(n)}</small></button>
      <button class="opt" data-mv="local"><span>Save deste navegador</span><small>${q(l)}</small></button></div>`,[])||'local'; },
};

