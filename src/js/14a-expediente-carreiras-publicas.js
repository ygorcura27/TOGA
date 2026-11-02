// ===================== EXPEDIENTE E EQUIPE NAS CARREIRAS PÚBLICAS =====================
// juiz, promotor e defensor seguem o mesmo padrão: todo mês a unidade gera expediente (rotina que não é caso),
// a equipe absorve primeiro e o que sobrar sai da agenda do titular; casos épicos e lendários pedem assessor
const EXPEDIENTE={
  juiz:{nome:'Expediente do gabinete',desc:'Despachos, decisões de urgência, atendimento a advogados e audiências de rotina',complexo:'processo complexo'},
  promotor:{nome:'Expediente da promotoria',desc:'Vistas de processos, ofícios, notificações e atendimento ao público',complexo:'investigação complexa'},
  defensor:{nome:'Expediente da Defensoria',desc:'Triagem, atendimento ao público, ofícios e visitas a presídios',complexo:'caso complexo'},
};
const pubAtual=()=>!S?null:S.carreira==='juiz'?S.j:S.carreira==='promotor'?S.p:S.carreira==='defensor'?S.d:null;
// 1 + metade do porte da comarca + o cargo (cresce com as promoções)
const expediente=()=>{ const X=EXPEDIENTE[S&&S.carreira]&&pubAtual(); return X?1+Math.floor(CIDADES[X.comarca].pop/2)+X.cargo+(S.carreira==='defensor'?2:0):0; }; // a Defensoria tem a triagem do balcão: +2
const expEquipe=()=>Math.min(gabinete(),expediente()), expPessoal=()=>Math.max(0,expediente()-gabinete());
const gabCasos=()=>Math.max(0,gabinete()-expediente());
const assessores=()=>S.u?S.u.equipe.filter(f=>f.funcao==='assessor'):[];
function bonusAssessoria(c,add){ if(RORD.indexOf(c.rar)<3) return; const n=assessores().length, E=EXPEDIENTE[S.carreira];
  if(!n) add(`Sem assessor para ${E.complexo}`,-10); else add(`Assessoria técnica (${n})`,Math.min(6,3*n)); }
// fim do mês: em dia só com a equipe cobrindo tudo; feito pelo titular, pesa no estresse
function expedienteMes(){ const p=expPessoal();
  if(!p){ S.prest=clamp(S.prest+.5,0,100); return 'Expediente em dia, todo feito pela equipe: +0,5 reputação.'; }
  S.estresse=clamp(S.estresse+1.5*p,0,100); return `<span class="lo">A equipe não deu conta do expediente: você cobriu ${p} bloco${p>1?'s':''}.</span>`; }
const legendaExp='<span><i class="exp"></i>Expediente</span>';
function linhaExpediente(){ const E=EXPEDIENTE[S.carreira], p=expPessoal();
  return `<div class="row"><span class="name" title="${E.desc}. Cresce com a comarca e o cargo.">${E.nome}</span><span class="num ${p?'lo':''}">${expediente()} · equipe ${expEquipe()}${p?` · você ${p}`:''}</span></div>`; }
const celulasEquipe=(gab,usados)=>{ const e=expEquipe(); return Array.from({length:gab},(_,i)=>`<div class="blk ${i<e?'exp':i<e+usados?'apoio':''}"></div>`).join(''); };
{ const l0=livres; livres=function(){ return l0()-expediente(); }; }
