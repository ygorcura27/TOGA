// ===================== SKILLS: NÍVEIS E EFEITOS =====================
const NIV=[40,60,80];
const tem=(k,n)=>S&&S.skills[k]>=NIV[n-1];
const nivel=k=>NIV.filter(x=>S.skills[k]>=x).length;
const PERKS={
  oratoria:['+5 em casos com júri','+10 de Oratória nos momentos decisivos','+1 de reputação ao vencer casos Raros ou acima'],
  escrita:['+3 de chance em todo caso','+1 bloco de trabalho por mês','+8 de chance em recursos'],
  pesquisa:['+3 quando o caso tem preparo','Equipa 4 teses por caso em vez de 3','Estudo rende 50% mais'],
  negociacao:['+10% em acordos e conciliações','Apoios 30% mais baratos e custas de recurso pela metade','Acordos fecham pelo teto (80% da causa)'],
  analise:['Reviravoltas negativas pela metade','+4 em casos Raros ou acima; diligências acham inocência com mais facilidade','+5 em casos com dificuldade 60 ou mais'],
  didatica:['Aulas rendem 20% mais','Convites para palestras pagas','Os estagiários e candidatos que você contrata vêm 5 pontos melhores'],
};
const PERK_AREA=['Mais casos da área aparecem','+4 em casos da área (especialista)','+8 em casos da área e ainda mais casos dela (referência)'];
function bonusPerks(c,add){
  if(tem('oratoria',1)&&c.juri) add('Oratória: júri',5);
  if(tem('escrita',1)) add('Escrita: peças bem escritas',3);
  if(tem('escrita',3)&&c.inst>1) add('Escrita: recursos',8);
  if(tem('pesquisa',1)&&((c.prep||0)+(c.semana||0))>0) add('Pesquisa: preparo eficiente',3);
  if(tem('analise',2)&&RORD.indexOf(c.rar)>=2) add('Análise: casos complexos',4);
  if(tem('analise',3)&&c.d>=60) add('Análise: casos muito difíceis',5);
  bonusArea(c,add);
  if(S.u) bonusEstrutura(c,add);
  bonusVida(add);
}
const blocoEscrita=()=>tem('escrita',2)?1:0;
const custoApoio=(a,c)=>Math.round(a.custo(c)*(tem('negociacao',2)?.7:1)/100)*100;
const fracAcordo=()=>tem('negociacao',3)?.8:.5+.3*S.skills.negociacao/100;
function listaPerks(){
  const linha=(nome,arr,k)=>`<li style="flex-direction:column;align-items:stretch;gap:2px"><b>${nome} <span class="num" style="color:var(--brass)">${'★'.repeat(nivel(k))}${'☆'.repeat(3-nivel(k))}</span></b>
    ${arr.map((t,i)=>`<span class="${tem(k,i+1)?'hi':''}" style="${tem(k,i+1)?'':'color:var(--muted)'}">${NIV[i]} · ${t}</span>`).join('')}</li>`;
  return `<ul class="break" style="gap:8px">${Object.entries(PERKS).map(([k,arr])=>linha(SKILLS[k],arr,k)).join('')}
    <li style="flex-direction:column;align-items:stretch;gap:2px"><b>Áreas do direito (cada uma) <span class="num" style="color:var(--brass)">${estrelasHtml(S.espec)}</span></b>
    ${PERK_AREA5.map((t,i)=>`<span class="${estrelas(S.espec)>i?'hi':''}" style="${estrelas(S.espec)>i?'':'color:var(--muted)'}">${NIV_AREA[i]} · ${i+1}★ · ${t}${i===3?' · exige especialização na área':i===4?' · exige mestrado ou doutorado na área':''}</span>`).join('')}
    <span style="color:var(--muted)">Estudando sozinho, cada área para em 81 (3★). Leis novas aprovadas no Congresso derrubam parte da skill da área.</span></li></ul>`;
}

