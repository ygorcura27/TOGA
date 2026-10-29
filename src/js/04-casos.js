// ===================== CASOS =====================
function temEscritorio(k){ const C=LOC[k]; if(!C) return false; if(S.carreira!=='adv') return k===comarcaAtual(); if(C.centro) return temEscritorio(C.parent); return k===S.sede||S.filiais.includes(k); }
function longe(c){ const C=LOC[c.cidade]; return !temEscritorio(c.cidade) && !(C.nivel==='regional' && temEscritorio(C.parent)); }
const maxCasos=()=>3+advsEquipe()+Math.floor(estagEquipe()/2)+S.filiais.length;
const custoSemanal=()=>despesasEscritorio().total;
function pickW(arr,w){const ws=arr.map(w); let r=Math.random()*ws.reduce((a,b)=>a+b,0);
  for(let i=0;i<arr.length;i++){ r-=ws[i]; if(r<=0) return arr[i]; } return arr[arr.length-1];}
// porte do escritório: imóvel e filiais definem até que raridade de caso chega e quanto valem as causas
// nível do escritório: uma escada de anos. Só o High Tier, com carteira grande, filiais em vários estados e full service, rende mais que um juiz.
const TIERS=[
  {nome:'Escritório iniciante',rarMax:2,valor:.85,partido:1},
  {nome:'Escritório local',rarMax:3,valor:1.15,partido:1.2,req:{imovel:1,advs:2}},
  {nome:'Escritório regional',rarMax:3,valor:1.2,partido:1.4,req:{imovel:1,advs:4,filiais:1,clientes:2,prest:45,anos:3}},
  {nome:'Escritório nacional',rarMax:4,valor:1,partido:1.6,req:{imovel:2,advs:8,estados:1,clientes:4,areas:3,prest:65,anos:6}},
  {nome:'Escritório High Tier',rarMax:4,valor:1.7,partido:2.5,req:{imovel:2,advs:15,estados:3,clientes:6,full:true,prest:80,anos:10}},
];
const anosEscritorio=()=>S.u?Math.floor((S.semana-(S.u.fundado||S.semanaFormatura||1))/ANO):0;
function checarTier(r){ const U=S.u, est=S.filiais.filter(f=>LOC[f]&&(LOC[f].nivel==='nacional'||LOC[f].nivel==='global')).length;
  const it=[];
  if(r.imovel!=null) it.push({l:`Imóvel: ${IMOVEIS.adv[r.imovel].nome} ou maior`,ok:(U.imovel||0)>=r.imovel,v:IMOVEIS.adv[U.imovel||0].nome});
  if(r.advs) it.push({l:`${r.advs} advogados na equipe`,ok:advsEquipe()>=r.advs,v:advsEquipe()});
  if(r.filiais) it.push({l:`${r.filiais} filial em bairro ou cidade`,ok:S.filiais.length>=r.filiais,v:S.filiais.length});
  if(r.estados) it.push({l:`Filiais em ${r.estados} estado${r.estados>1?'s':''} fora da sede`,ok:est>=r.estados,v:est});
  if(r.clientes) it.push({l:`${r.clientes} clientes fixos`,ok:(S.clientes||[]).length>=r.clientes,v:(S.clientes||[]).length});
  if(r.areas) it.push({l:`${r.areas} áreas de atuação`,ok:areasAtivas().length>=r.areas,v:areasAtivas().length});
  if(r.full) it.push({l:'Full service (todas as áreas)',ok:!!U.full,v:U.full?'sim':'não'});
  if(r.prest) it.push({l:`Prestígio ${r.prest}`,ok:S.prest>=r.prest,v:Math.round(S.prest)});
  if(r.anos) it.push({l:`${r.anos} anos de escritório`,ok:anosEscritorio()>=r.anos,v:anosEscritorio()});
  return it; }
function tierEscritorio(){ if(!S.u||S.carreira!=='adv') return 0; let t=0; for(let i=1;i<TIERS.length;i++){ if(checarTier(TIERS[i].req).every(x=>x.ok)) t=i; else break; } return t; }
// casos em 1ª instância ocupam vaga; recursos ficam numa fila própria e não limitam a entrada de casos novos
const casos1=()=>S.casos.filter(c=>(c.inst||1)===1).length;
const PRAZO_REC={2:2,3:3,4:4}; // meses até o julgamento: tribunal, STJ/TST, STF (sem poder antecipar)
function pesosRaridade(C){const p=S.prest, f=S.filiais.length;
  return {comum:Math.max(10,60-p*.6),incomum:30,raro:8+p*.3+C.pop*1.5+f*2+(C.rarBonus||0),
    epico:(p>=35?(p-30)*.4:0)+(p>=25?f:0),lendario:p>=65?(p-60)*.15:0};}
function sortearRaridade(C,extra={}){const w=pesosRaridade(C); for(const k in extra) w[k]+=extra[k]; let tot=0; for(const k in w) tot+=w[k];
  let r=Math.random()*tot; for(const k of RORD){ r-=w[k]; if(r<=0) return k;} return 'comum';}
function novoCaso(cid=S.sede,extra={},area=null){
  const C=LOC[cid];
  let rar=sortearRaridade(C,extra);
  const PE=S.carreira==='adv'?TIERS[tierEscritorio()]:null; if(PE&&RORD.indexOf(rar)>PE.rarMax) rar=RORD[PE.rarMax];
  let pool=TEMPLATES.filter(t=>t.rars.includes(rar)&&(!area||t.area===area));
  if(!pool.length){ pool=TEMPLATES.filter(t=>t.area===area); }
  const t=pickW(pool,x=>(C.areas[x.area]||1)*pesoArea(x.area)*demEpoca(x.area)); if(!t.rars.includes(rar)) rar=t.rars[t.rars.length-1]; const R=RAR[rar];
  const d=rint(R.d[0],R.d[1]);
  const valor=Math.round(5000*Math.pow(1.06,d)*rnd(.8,1.2)*C.fator*valorEpoca()*(PE?PE.valor:1)/100)*100;
  const cliente = t.area==='empresarial' ? pick(EMPRESAS) : pick(NOMES);
  return {id:++uid,...t,rar,d,valor,hon:Math.round(valor*.2),cliente,cidade:cid,
    prazo:rint(R.prazo[0],R.prazo[1]),juiz:pick(Object.keys(JUIZES)),juizNome:pick(JNOMES),
    inst:1,lado:null,prep:0,semana:0,apoios:{},estrategia:'equilibrada',mod:0,acordoFalhou:false,perdaOrig:0,retido:false};
}
function gerarOfertas(){
  const of=[casoEsc(S.sede),casoEsc(S.sede),casoEsc(S.sede)];
  for(const f of S.filiais) of.push(casoEsc(f));
  if(temSala('recepcao')) of.push(casoEsc(S.sede));
  for(let i=0;i<Math.floor(advsEquipe()/2);i++){ const c=casoEsc(S.sede); c.captado=true; of.push(c); }
  const fora=Object.keys(LOC).filter(k=>{const C=LOC[k]; return !temEscritorio(k) && !C.centro && (C.nivel!=='global'||S.prest>=40) && (C.nivel!=='regional'||temEscritorio(C.parent));});
  if(fora.length && Math.random()<.6){ const c=casoEsc(pickW(fora,k=>LOC[k].pop)); c.indicacao=true; of.push(c); }
  if(S.carreira==='adv'){ for(const c of of) marcarNPC(c); indicacoes(of); }
  S.ofertas=of; ofertasClientes();
}
// épico e lendário envolvem questão constitucional e podem chegar ao STF (recurso extraordinário)
function maxInst(c){const r=RORD.indexOf(c.rar); return r>=3?4:r>=2?3:2;}
function prepBonus(n){let b=0; for(let i=1;i<=n;i++) b+=Math.max(0,6-i); return b;}
function skillCaso(c){let s=0; const w=AREAS[c.area].skills; for(const k in w) s+=w[k]*S.skills[k];
  if(LOC[c.cidade]&&LOC[c.cidade].sistema==='common') s=.8*s+.2*S.skills.oratoria; return s;}
function tesesDoCaso(c){return S.teses.filter(t=>t.area===c.area).sort((a,b)=>b.bonus-a.bonus).slice(0,tem('pesquisa',2)?4:3);}

function calcChance(c,extra=0){
  const items=[]; const add=(l,v)=>{ if(v) items.push([l,v]); };
  const skill=skillCaso(c);
  const cg=cargaCaso(c,false), blocos=cg.prep;
  let pb=prepCaso(c,blocos); if(c.juiz==='impaciente') pb*=.6;
  add(`Preparação (${blocos} de ~${prepIdeal(c)} blocos ideais)`,Math.round(pb*10)/10);
  if(cg.atraso) add(`Prazos e peças atrasados (${cg.atraso} bloco${cg.atraso>1?'s':''})`,penAtraso(cg.atraso));
  if(faltaPorte(c)) add(`Escritório pequeno para o porte (faltam ${faltaPorte(c)} advogado${faltaPorte(c)>1?'s':''} na equipe)`,-6*faltaPorte(c));
  const lg=longe(c);
  for(const k in c.apoios) if(c.apoios[k] && (!APOIOS[k].longe||lg)) add(APOIOS[k].nome,APOIOS[k].bonus);
  if(lg&&!epocaAtiva('pandemia')) add('Distância (sem escritório em '+LOC[c.cidade].nome+')',-10);
  if(c.estrategia!=='acordo') add('Estratégia '+ESTR[c.estrategia].nome.toLowerCase(),ESTR[c.estrategia].mod);
  add('Prestígio',(S.prest-50)/10);
  const j=c.juiz;
  if(j==='rigoroso') add('Juiz rigoroso',-5);
  if(j==='garantista' && c.area==='penal') add('Juiz garantista',5);
  if(j==='formalista') add('Juiz formalista',S.skills.escrita>=50?5:-5);
  if(S.energia<30) add('Cansaço',-10);
  if(S.estresse>70) add('Estresse alto',-8);
  if(S.traits.includes('orador') && c.juri) add('Orador nato (júri)',5);
  if(S.traits.includes('ansioso') && RORD.indexOf(c.rar)>=3) add('Ansiedade',-5);
  if(S.traits.includes('sortudo')) add('Sortudo',3);
  for(const t of tesesDoCaso(c)) add('Tese: '+t.nome,t.bonus);
  if(c.inst>1){ add(INST[c.inst],-10*(c.inst-1)); add(c.lado==='recorrido'?'Decisão a seu favor':'Decisão contrária',c.lado==='recorrido'?10:-10); }
  bonusNPC(c,add);
  if(S.ex&&S.semana<S.ex.ate&&c.cidade===S.ex.comarca) add('Quarentena de ex-'+S.ex.cargo.toLowerCase(),-5);
  bonusPerks(c,add); add('Audiência',c.mod); add('Esta jogada',extra);
  const bonus=items.reduce((a,x)=>a+x[1],0);
  let ch=sig((skill+bonus-c.d)/12);
  if(c.juri) ch=.5+(ch-.5)*.8;
  return {skill,bonus,items,ch:clamp(ch,.05,.95)};
}
function chanceAcordo(c){let v=.55+S.skills.negociacao/200+(tem('negociacao',1)?.1:0)+(temSala('reuniao')?.1:0)+(c.npcAdv&&npcTipo(npcPor(c.npcAdv))==='amigo'?.1:0);
  if(c.juiz==='pragmatico') v+=.10; if(S.traits.includes('carismatico')) v+=.10; return clamp(v,.05,.95);}
function chanceApeloAdv(c,hist){return clamp(RAR[c.rar].apelo+ADV[c.adv].apelo-(hist?.25:0),.05,.95);}

