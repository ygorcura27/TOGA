// ===================== CASOS DE ÉPOCA =====================
// crises, ciclos e leis novas trazem casos que só existem naquele momento do país: são raros ou maiores,
// valem mais e, ganhos, rendem prestígio extra e manchete na Gazeta. Vale para as quatro carreiras.
const TEMAS_EPOCA={
  recessao:[['empresarial','Recuperação judicial de rede varejista'],['empresarial','Falência de construtora com 2 mil credores'],['trabalho','Demissão em massa em montadora'],['trabalho','Verbas rescisórias de fábrica fechada']],
  boom:[['empresarial','Disputa societária em fusão bilionária'],['empresarial','Briga pelo controle de startup unicórnio'],['tributario','Autuação fiscal sobre lucros recordes']],
  pandemia:[['familia','Guarda compartilhada durante o isolamento'],['familia','Inventário de vítima da pandemia'],['civel','Revisão de aluguel comercial na pandemia'],['trabalho','Teletrabalho e horas extras sem controle'],['penal','Fraude na compra de respiradores']],
  operacao:[['penal','Delação premiada de ex-diretor de estatal'],['penal','Lavagem de dinheiro em obra pública'],['penal','Prisão preventiva de empresário investigado']],
};
// temas possíveis agora: épocas ativas e ondas de processos depois de uma lei aprovada
function temasAgora(){ if(!S||!S.epoca) return []; const E=S.epoca, L=[];
  for(const e of E.ev) if(e.ate>S.semana) for(const [area,t] of TEMAS_EPOCA[e.tipo]||[]) L.push({area,titulo:t,tag:EPOCAS[e.tipo].nome});
  for(const k in E.onda) if(E.onda[k]>S.semana){ const r=REFORMAS.filter(x=>x.area===k).find(x=>E.hist.some(h=>h.t===`Aprovada: ${x.nome}`));
    if(r) L.push({area:k,titulo:`Caso-teste da ${r.nome}`,tag:r.nome},{area:k,titulo:`Primeira grande disputa sob a ${r.nome}`,tag:r.nome}); }
  return L; }
const CHANCE_EPOCA=.15;
const titulosEmUso=()=>new Set([...(S.ofertas||[]),...(S.casos||[]),...(S.j?S.j.acervo:[]),...(S.p?S.p.casos:[]),...(S.d?S.d.casos:[])].map(c=>c.titulo));
function tornarDeEpoca(c,mudaArea){ const usados=titulosEmUso(), T=temasAgora().filter(t=>(mudaArea||t.area===c.area)&&!usados.has(t.titulo)); if(!T.length||Math.random()>=CHANCE_EPOCA) return c;
  const t=pick(T); if(mudaArea) c.area=t.area; c.titulo=t.titulo; c.epocaTag=t.tag;
  if(RORD.indexOf(c.rar)<2){ c.rar='raro'; const R=RAR.raro; c.d=rint(R.d[0],R.d[1]); if(c.meta!==undefined) c.meta=META.raro; }
  if(c.valor) c.valor=Math.round(c.valor*1.3/1000)*1000;
  return c; }
{ const n0=novoCaso; novoCaso=function(...a){ const c=n0(...a); return tornarDeEpoca(c,S.carreira==='adv'||S.carreira==='juiz'&&S.j&&S.j.cargo===4); }; }
{ const n0=novoInquerito; novoInquerito=function(){ return tornarDeEpoca(n0(),false); }; }
{ const n0=novoAssistido; novoAssistido=function(){ return tornarDeEpoca(n0(),false); }; }
// selo no cartão do caso
const seloEpoca=c=>c&&c.epocaTag?`<span class="tag epoca-tag" title="Caso de época: vale mais e, ganho, rende prestígio extra e manchete.">📰 ${esc(c.epocaTag)}</span>`:'';
const comSelo=h0=>function(c,...r){ const h=h0(c,...r); return c&&c.epocaTag?h.replace('</h3>','</h3>'+seloEpoca(c)):h; };
pasta=comSelo(pasta); procCard=comSelo(procCard); mpCard=comSelo(mpCard); dpCard=comSelo(dpCard);
// vitória: prestígio extra e manchete
{ const d0=depoisDoVeredito; depoisDoVeredito=function(c,ganhou){ d0(c,ganhou); if(!c||!c.epocaTag||!ganhou) return;
    const g=Math.round(RAR[c.rar].ganho*.5*10)/10; S.prest=clamp(S.prest+g,0,100);
    noticia('caso',`${S.nome} vence caso símbolo da época: ${c.titulo}`,`Em meio a ${c.epocaTag.toLowerCase().startsWith('reforma')||c.epocaTag.startsWith('Novo')||c.epocaTag.startsWith('Nova')||c.epocaTag.startsWith('Marco')||c.epocaTag.startsWith('Estatuto')||c.epocaTag.startsWith('Pacote')?`mudanças da ${c.epocaTag}`:c.epocaTag.toLowerCase()}, o resultado virou referência no meio jurídico.`,3);
    addLog(`Caso de época vencido: “${c.titulo}”. ${sgn(g)} ${S.carreira==='adv'?'prestígio':'reputação'}.`,'g');
    S.cq=S.cq||{}; S.cq.cont=S.cq.cont||{}; S.cq.cont.epocaV=(S.cq.cont.epocaV||0)+1; }; }
