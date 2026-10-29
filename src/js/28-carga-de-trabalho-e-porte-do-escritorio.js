// ===================== CARGA DE TRABALHO E PORTE DO ESCRITÓRIO =====================
// cada caso ativo consome blocos de manutenção (prazos, petições, cliente) antes de render preparação;
// o limite de casos e o porte para casos grandes dependem da equipe de advogados
// advogado associado: sem salário fixo; cada um fica com 10% dos honorários que entram (no máximo 30% somados)
function pagarAssociados(v){ if(S.carreira!=='adv'||!S.u||v<=0) return 0; const A=S.u.equipe.filter(f=>f.funcao==='associado'); if(!A.length) return 0;
  const parte=Math.round(v*Math.min(.3,A.length*FUNCOES.adv.associado.parteHon)); S.caixa-=parte; S.u.honSemana-=parte;
  for(const f of A) f.moral=clamp(f.moral+3,0,100);
  addLog(`${A.length>1?'Os associados ficaram':`${A[0].nome} (associado) ficou`} com ${brl(parte)} dos honorários.`); return parte; }
const MANUT={comum:1,incomum:1,raro:2,epico:3,lendario:4};
const manut=c=>(c.inst||1)>1?1:MANUT[c.rar];
const PORTE={epico:1,lendario:2}; // advogados na equipe para atender o porte do caso
const advsEquipe=()=>S&&S.u&&S.carreira==='adv'?S.u.equipe.filter(f=>['associado','junior','pleno','senior','socio'].includes(f.funcao)).length:0;
const estagEquipe=()=>S&&S.u&&S.carreira==='adv'?S.u.equipe.filter(f=>f.funcao==='estagiario').length:0;
const faltaPorte=c=>Math.max(0,(PORTE[c.rar]||0)-advsEquipe());
// aplica os blocos do mês: primeiro a manutenção, depois o atraso acumulado, o resto vira preparação
function cargaCaso(c,aplicar){ let s=c.semana||0, at=c.atraso||0, prep=c.prep||0; const m=manut(c);
  if(s<m){ at+=m-s; s=0; } else { s-=m; const q=Math.min(s,at); at-=q; s-=q; prep+=s; }
  if(aplicar){ const antes=c.atraso||0; c.prep=prep; c.atraso=at; c.semana=0; if(at>antes) addLog(`Prazos apertando em “${c.titulo}”: faltaram ${at-antes} bloco(s) de manutenção.`,'r'); }
  return {prep,atraso:at}; }
const penAtraso=at=>-Math.min(18,at*3);
// preparação cresce com o porte: um caso comum satura em ~5 blocos, um lendário pede ~35 (trabalho de equipe)
const PREP_M={comum:15,incomum:18,raro:22,epico:26,lendario:30}, PREP_K={comum:2,incomum:3,raro:5,epico:8,lendario:12};
const prepCaso=(c,n)=>PREP_M[c.rar]*(1-Math.exp(-n/PREP_K[c.rar]));
const prepIdeal=c=>Math.round(PREP_K[c.rar]*2.5);

