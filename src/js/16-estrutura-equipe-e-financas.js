// ===================== ESTRUTURA, EQUIPE E FINANÇAS =====================
const COMODOS={
  titular:{nome:'Sala do titular',custo:0,mant:0,desc:'A sua sala. Não pode ser removida.'},
  trabalho:{nome:'Sala de trabalho',custo:8000,mant:150,mesas:3,desc:'3 mesas para a equipe.'},
  recepcao:{nome:'Recepção',custo:6000,mant:120,mesas:1,desc:'1 mesa e +8 de organização. No escritório, traz 1 caso novo por mês.'},
  reuniao:{nome:'Sala de reunião',custo:7000,mant:100,desc:'+10% em acordos e conciliações.'},
  biblioteca:{nome:'Biblioteca',custo:9000,mant:120,desc:'+2 de chance em todos os casos.'},
  arquivo:{nome:'Arquivo e TI',custo:10000,mant:200,desc:'+15 de organização.'},
  copa:{nome:'Copa',custo:5000,mant:80,desc:'Moral da equipe +3 por mês e o seu estresse −3.'},
};
const IMOVEIS={
  adv:[{nome:'Sala comercial',cols:3,rows:2,aluguel:900,mudar:0},{nome:'Conjunto comercial',cols:4,rows:3,aluguel:2400,mudar:15000},{nome:'Andar corporativo',cols:5,rows:4,aluguel:6000,mudar:50000}],
  pub:[{nome:'Gabinete no fórum',cols:3,rows:2,aluguel:0,mudar:0},{nome:'Gabinete ampliado',cols:4,rows:3,aluguel:0,mudar:30000},{nome:'Andar do tribunal',cols:5,rows:4,aluguel:0,mudar:80000,cargoMin:2}],
};
const FUNCOES={
  adv:{estagiario:{nome:'Estagiário',bl:2,q:[25,45],sal:450},secretaria:{nome:'Secretária',bl:0,q:[30,50],org:6,sal:900},
       associado:{nome:'Advogado associado',bl:4,q:[40,58],sal:0,parteHon:.1},junior:{nome:'Advogado júnior',bl:4,q:[40,60],sal:1500},pleno:{nome:'Advogado pleno',bl:5,q:[55,72],sal:2600},
       senior:{nome:'Advogado sênior',bl:6,q:[68,85],sal:4200},gestor:{nome:'Gestor administrativo',bl:0,q:[30,50],g:[55,90],sal:3200},
       socio:{nome:'Sócio',bl:7,q:[70,90],sal:0}},
  pub:{estagiario:{nome:'Estagiário',bl:3,q:[25,45],sal:350},servidor:{nome:'Servidor efetivo',bl:5,q:[35,65],org:4,sal:0},
       assessor:{nome:'Assessor (cargo em comissão)',bl:8,q:[55,85],sal:2200},gestor:{nome:'Chefe de gabinete',bl:2,q:[40,60],g:[55,90],sal:2800}},
};
const PRIM=['Ana','Bruno','Carla','Diego','Elisa','Felipe','Gabriela','Hugo','Isabela','João','Karen','Lucas','Marina','Nelson','Olívia','Paulo','Rita','Sandro','Tânia','Vitor','Yara','Caio','Bianca','Davi'];
const SOBR=['Almeida','Barros','Campos','Dias','Esteves','Freitas','Gomes','Holanda','Igarashi','Jardim','Lima','Macedo','Nogueira','Oliveira','Pires','Queiroz','Rocha','Santos','Tavares','Vieira'];
const nomePessoa=()=>pick(PRIM)+' '+pick(SOBR);
const PRIM_M=['Bruno','Diego','Felipe','Hugo','João','Lucas','Nelson','Paulo','Sandro','Vitor','Caio','Davi','Rafael','Tiago'];
const PRIM_F=['Ana','Carla','Elisa','Gabriela','Isabela','Karen','Marina','Olívia','Rita','Tânia','Yara','Bianca','Luiza','Helena'];
const nomeGenero=g=>pick(g==='m'?PRIM_M:PRIM_F)+' '+pick(SOBR);
const FEM={Juiz:'Juíza',Promotor:'Promotora',Procurador:'Procuradora',Defensor:'Defensora',Desembargador:'Desembargadora',Ministro:'Ministra',Substituto:'Substituta','Público':'Pública',Professor:'Professora',Adjunto:'Adjunta',Associado:'Associada',Pesquisador:'Pesquisadora',Mestrando:'Mestranda',Doutorando:'Doutoranda'};
const fem=t=>S&&S.genero==='f'?String(t).replace(/(Juiz|Promotor|Procurador|Defensor|Desembargador|Ministro|Substituto|Público|Professor|Adjunto|Associado|Pesquisador|Mestrando|Doutorando)(?![a-zçãáéíóú])/g,w=>FEM[w]):t;
const gen=(m,f)=>S&&S.genero==='f'?f:m;
const PROMO_ADV={estagiario:'junior',junior:'pleno',pleno:'senior'};
const ORC_BASE=[4000,6000,9000,12000,15000];
const CUSTO_VIDA=900;
const pubCar=()=>S.carreira!=='adv';
const FX=()=>FUNCOES[pubCar()?'pub':'adv'];
const temSala=k=>!!(S&&S.u&&S.u.salas.includes(k));
const nomeGestor=()=>S.carreira==='juiz'?'Chefe de gabinete':S.carreira==='promotor'?'Chefe de secretaria':S.carreira==='defensor'?'Coordenador de atendimento':'Gestor administrativo';
const nomeFuncao=f=>f.funcao==='gestor'?nomeGestor():FX()[f.funcao].nome;
const gestorAtual=()=>S.u.equipe.find(f=>f.id===S.u.gestorId)||null;
const mesas=()=>S.u.salas.reduce((a,k)=>a+((k&&COMODOS[k].mesas)||0),0);
const imovelAtual=()=>(pubCar()?IMOVEIS.pub:IMOVEIS.adv)[S.u.imovel];
const cargoAtual=()=>S.carreira==='juiz'?S.j.cargo:S.carreira==='promotor'?S.p.cargo:S.carreira==='defensor'?S.d.cargo:0;
const salarioAtual=()=>S.carreira==='juiz'?CARGOS[S.j.cargo].salario:S.carreira==='promotor'?CARGOS_MP[S.p.cargo].salario:CARGOS_DP[S.d.cargo].salario;
function listaCasos(){ return S.carreira==='juiz'?S.j.acervo:S.carreira==='promotor'?S.p.casos:S.carreira==='defensor'?S.d.casos:S.casos; }
const pendentes=()=>listaCasos().length;
const trabalhadores=()=>S.u.equipe.filter(f=>FX()[f.funcao].bl>0);
function organizacao(){ const U=S.u; let o=35; const g=gestorAtual(); if(g) o+=g.g*.45;
  for(const k of U.salas){ if(k==='arquivo') o+=15; if(k==='recepcao') o+=8; }
  for(const f of U.equipe){ const F=FX()[f.funcao]; if(F.org) o+=F.org; }
  o-=Math.max(0,pendentes()/(trabalhadores().length+1)-6)*2;
  return clamp(Math.round(o),0,100); }
function qualEquipe(){ const w=trabalhadores(); if(!w.length) return null;
  return w.reduce((a,f)=>a+f.q*FX()[f.funcao].bl,0)/w.reduce((a,f)=>a+FX()[f.funcao].bl,0); }
function staffBlocos(){ const org=organizacao();
  return Math.floor(S.u.equipe.reduce((a,f)=>a+FX()[f.funcao].bl*(.6+f.moral/250),0)*(.85+org/500)); }
const fatorAtraso=()=>1.4-organizacao()/100;
function bonusEstrutura(c,add){
  add('Organização da equipe',Math.round((organizacao()-50)/12*10)/10);
  const q=qualEquipe(); if(q!==null && ((c.semana||0)>0||(c.prep||0)>0)) add('Qualidade da equipe',Math.round((q-55)/8*10)/10);
  if(temSala('biblioteca')) add('Biblioteca',2);
}
function gerarCandidato(funcao,area){ const F=FX()[funcao], q=Math.min(95,rint(F.q[0],F.q[1])+(tem('didatica',3)?5:0)), g=F.g?rint(F.g[0],F.g[1]):rint(15,40);
  const fator=F.sal?(.85+(q-F.q[0])/Math.max(1,F.q[1]-F.q[0])*.4+(F.g?(g-F.g[0])/100:0)):0;
  const sal=Math.round(F.sal*fator/50)*50;
  const c={id:++uid,nome:nomePessoa(),funcao,q,g,moral:rint(55,75),semanas:0,sal,salBase:sal,promoEm:0};
  if(!pubCar()&&AE_FAIXA[funcao]){ c.area=area||S.espec; const [a,b]=AE_FAIXA[funcao]; c.ae=rint(a,b); }
  return c; }
function estruturaInicial(pub){ const im=(pub?IMOVEIS.pub:IMOVEIS.adv)[0], salas=Array(im.cols*im.rows).fill(null); salas[0]='titular'; salas[1]='trabalho';
  return {imovel:0,salas,equipe:[],gestorId:null,auto:true,retirada:pub?0:1500,honSemana:0,orc:pub?8000:0,efet:60,lastConcl:0,hist:[],sel:null,pedidoSoc:null}; }
function estruturaPub(){ const U=estruturaInicial(true); S.u=U; U.equipe.push(gerarCandidato('servidor'),gerarCandidato('estagiario')); return U; }
function despesasEscritorio(){ const U=S.u, im=IMOVEIS.adv[U.imovel];
  const sal=U.equipe.reduce((a,f)=>a+f.sal,0), mant=U.salas.reduce((a,k)=>a+(k?COMODOS[k].mant:0),0), fil=S.filiais.reduce((a,f)=>a+aluguel(LOC[f]),0);
  return {aluguel:im.aluguel,sal,mant,fil,total:im.aluguel+sal+mant+fil}; }
const despesasPub=()=>S.u.equipe.reduce((a,f)=>a+f.sal,0)+S.u.salas.reduce((a,k)=>a+(k?COMODOS[k].mant:0),0);
const receitaPub=()=>Math.round(ORC_BASE[cargoAtual()]*(.5+S.u.efet/100));
function concluidos(){ return S.carreira==='juiz'?S.j.sentencas:S.carreira==='promotor'?S.p.denuncias+S.p.acordos+S.p.arquivados:S.d.atendimentos; }
function atrasadosPub(){ return S.carreira==='juiz'?S.j.acervo.filter(p=>p.idade>p.meta).length:S.carreira==='promotor'?S.p.casos.filter(c=>c.fase==='inq'&&c.idade>c.meta).length:S.d.casos.filter(c=>c.preso&&!c.prep).length; }

function filaPrioridade(){
  if(S.carreira==='juiz') return [...S.j.acervo].sort((a,b)=>(b.idade-b.meta)-(a.idade-a.meta));
  if(S.carreira==='promotor') return [...S.p.casos].sort((a,b)=>(a.fase==='juizo'?a.prazo:99)-(b.fase==='juizo'?b.prazo:99)||(b.idade-a.idade));
  if(S.carreira==='defensor') return [...S.d.casos].sort((a,b)=>(a.prazo-b.prazo)||(b.preso-a.preso));
  return [...S.casos].sort((a,b)=>a.prazo-b.prazo);
}
function autoDistribuir(){ const U=S.u, g=gestorAtual(); if(!U.auto||!g) return 0;
  let livre=Math.max(0,gabinete()-listaCasos().reduce((a,c)=>a+(c.semana||0),0)); if(!livre) return 0;
  const lista=filaPrioridade(); if(!lista.length) return 0;
  if(Math.random()*100>g.g) lista.sort(()=>Math.random()-.5);
  let n=0; while(livre>0){ const c=lista[n%lista.length]; c.semana=(c.semana||0)+1; livre--; n++; }
  addLog(`${g.nome} (${nomeGestor().toLowerCase()}) distribuiu ${n} bloco(s) da equipe pelos casos mais urgentes.`);
  return n; }

function removeFunc(id){ const U=S.u; U.equipe=U.equipe.filter(f=>f.id!==id); if(U.gestorId===id) U.gestorId=null; }
function semanaEquipe(){ const U=S.u, linhas=[], carga=pendentes()/(trabalhadores().length+1), semGestor=U.equipe.length>4&&!gestorAtual();
  if(temSala('copa')) S.estresse=clamp(S.estresse-3,0,100);
  for(const f of U.equipe){ f.semanas++;
    let dm=(60-f.moral)*.1+(temSala('copa')?3:0)-Math.max(0,carga-8)*.5-(semGestor?2:0);
    if(f.salBase) dm+=(f.sal/f.salBase-1)*20;
    f.moral=clamp(f.moral+dm+rnd(-2,2),0,100); f.q=clamp(f.q+.15,0,95); }
  for(const f of [...U.equipe]) if(f.moral<25&&f.funcao!=='socio'&&Math.random()<.35){
    removeFunc(f.id);
    const t=`${f.nome} (${nomeFuncao(f)}) ${pubCar()?'pediu remoção para outra unidade':'pediu demissão'} por moral baixa.`;
    linhas.push(t); addLog(t,'r');
    if(!pubCar()&&(f.funcao==='senior'||f.funcao==='pleno')&&S.casos.length&&Math.random()<.5){
      const c=pick(S.casos); S.casos=S.casos.filter(x=>x!==c); linhas.push(`E levou o cliente de “${esc(c.titulo)}”.`); addLog(`${f.nome} levou o cliente de “${c.titulo}”.`,'r'); } }
  if(!pubCar()){ const cand=U.equipe.find(f=>f.funcao==='senior'&&f.semanas>=12&&f.moral>=65&&!f.pediuSoc);
    if(cand&&Math.random()<.35){ cand.pediuSoc=true; U.pedidoSoc=cand.id; } }
  return linhas; }
function semanaEstruturaAdv(){ const U=S.u, d=despesasEscritorio();
  S.caixa-=d.total;
  S.bolso-=CUSTO_VIDA; // a retirada agora é feita na hora pelo jogador (fazerRetirada)
  U.hist.unshift({w:S.semana,hon:U.honSemana,desp:d.total}); U.hist=U.hist.slice(0,6);
  addLog(`Escritório: ${brl(U.honSemana)} de honorários e ${brl(d.total)} de despesas.`);
  const socios=U.equipe.filter(f=>f.funcao==='socio');
  if(socios.length&&S.semana-(U.ultRet||0)>3) for(const f of socios){ f.moral=clamp(f.moral-3,0,100); }
  U.honSemana=0;
  if(S.bolso<0){ S.estresse=clamp(S.estresse+5,0,100); addLog('Seu dinheiro pessoal está negativo: o estresse sobe.','r'); }
  semanaAreasEquipe(); semanaEquipe(); }
function semanaEstruturaPub(novos){ const U=S.u, conc=concluidos()-U.lastConcl; U.lastConcl=concluidos();
  const org=organizacao(), atr=atrasadosPub();
  const eS=clamp(60+30*(conc-novos)/Math.max(1,novos)-3*atr+(org-50)/5,0,100);
  U.efet=Math.round((U.efet*.7+eS*.3)*10)/10;
  const rec=receitaPub(), desp=despesasPub(); U.orc+=rec-desp;
  const linhas=[`Índice de efetividade: <b>${U.efet.toLocaleString('pt-BR')}</b> (${conc} concluídos e ${novos} novos neste mês)`,
    `Orçamento da unidade: +${brl(rec)} do tribunal e −${brl(desp)} com equipe e estrutura. Saldo: ${brl(U.orc)}`];
  if(U.orc<0){ U.efet=Math.max(0,U.efet-5); for(const f of U.equipe) f.moral=clamp(f.moral-5,0,100); linhas.push('<span class="lo">Orçamento negativo: os cortes derrubaram a moral da equipe e a efetividade.</span>'); }
  if(U.efet>=80){ const g=Math.round(salarioAtual()*.1); S.caixa+=g; linhas.push(`<span class="hi">Gratificação por desempenho: +${brl(g)}</span>`); }
  linhas.push(...semanaEquipe());
  return linhas; }
async function pedidoSociedade(){ const U=S.u, f=U.equipe.find(x=>x.id===U.pedidoSoc); U.pedidoSoc=null; if(!f) return;
  const v=await modal(`<h2>${esc(f.nome)} quer virar sócio</h2><p>Advogado sênior há ${f.semanas} meses, qualidade ${Math.round(f.q)}. Pede 10% do lucro mensal do escritório no lugar do salário de ${brl(f.sal)}.</p>
    <dl class="meta"><dt>Se aceitar</dt><dd>7 blocos por mês, não pede demissão e recebe 10% do lucro</dd><dt>Se recusar</dt><dd class="lo">−35 de moral; pode sair e levar clientes</dd></dl>`,
    [{t:'Recusar',v:0,cls:'ghost'},{t:'Aceitar como sócio',v:1,cls:'brass'}]);
  if(v){ f.funcao='socio'; f.sal=0; f.salBase=0; f.part=.1; f.moral=clamp(f.moral+20,0,100); f.q=clamp(f.q+5,0,95); addLog(`${f.nome} virou sócio do escritório.`,'g'); }
  else { f.moral=clamp(f.moral-35,0,100); addLog(`Você recusou o pedido de sociedade de ${f.nome}.`,'r'); }
  salvar(); render(); }

// ----- ações -----
async function contratar(funcao){
  if(ocupado) return; const F=FX()[funcao], U=S.u;
  if(U.equipe.length>=mesas()) return modal('<h2>Sem mesa livre</h2><p>Construa uma sala de trabalho ou uma recepção na planta antes de contratar.</p>',[{t:'Ok',v:1}]);
  if(funcao==='servidor'&&U.equipe.filter(f=>f.funcao==='servidor').length>=1+cargoAtual())
    return modal(`<h2>Lotação completa</h2><p>O tribunal só cede ${1+cargoAtual()} servidor(es) efetivo(s) para este cargo. Promoções aumentam a lotação.</p>`,[{t:'Ok',v:1}]);
  let cands;
  if(!pubCar()&&AE_FAIXA[funcao]){ // advogados: candidatos gerados por área, e a escolha mostra a skill deles (não a sua)
    const porArea={}; for(const k in AREAS) porArea[k]=[gerarCandidato(funcao,k),gerarCandidato(funcao,k),gerarCandidato(funcao,k)];
    const at=areasEsc();
    const area=await modal(`<h2>${F.nome}: de qual área?</h2><p>Três candidatos em cada área. Um pleno, sênior ou sócio com 3★ na área pode abrir essa área no escritório.</p>
      <div class="opts">${Object.entries(AREAS).map(([k,A])=>{ const L=porArea[k], ae=L.map(c=>c.ae), mx=Math.max(...ae), mn=Math.min(...ae), est=L.map(estrelasF), chefe=RESP_FUNCS.includes(funcao)&&L.some(c=>estrelasF(c)>=3);
        return `<button class="opt" data-mv="${k}"><span>${A.nome}</span><b class="num">${mn}–${mx}</b><small>Skill dos candidatos na área · ${'★'.repeat(Math.min(...est))}${Math.max(...est)>Math.min(...est)?' a '+'★'.repeat(Math.max(...est)):''}${at.includes(k)?' · área já atendida':chefe?' · algum pode abrir a área':''}</small></button>`; }).join('')}</div>`,[{t:'Cancelar',v:'',cls:'ghost'}]);
    if(!area) return; cands=porArea[area]; }
  else cands=[gerarCandidato(funcao),gerarCandidato(funcao),gerarCandidato(funcao)];
  const origem=funcao==='associado'?'Sem salário fixo: fica com 10% dos honorários que o escritório recebe (até 30% somando todos os associados)':funcao==='servidor'?'Servidores disponíveis para requisição (pagos pelo tribunal)':pubCar()?'Salário pago pelo orçamento da unidade':'Salário pago pelo caixa do escritório';
  const v=await modal(`<h2>${funcao==='servidor'?'Requisitar':'Contratar'}: ${funcao==='gestor'?nomeGestor():F.nome}</h2><p>${origem}. ${F.bl?`Rende cerca de ${F.bl} blocos por mês, conforme a moral.`:'Não atende casos, mas melhora a organização.'}</p>
    <div class="opts">${cands.map((c,i)=>`<button class="opt" data-mv="${i}"><span>${esc(c.nome)}</span><b class="num">${F.sal?brl(c.sal)+'/mês':'sem custo'}</b><small>Qualidade ${c.q}${F.g?` · gestão ${c.g}`:''} · moral ${c.moral}${c.area?` · ${AREAS[c.area].nome} ${'★'.repeat(estrelasF(c))} (${c.ae})${estrelasF(c)>=3&&RESP_FUNCS.includes(funcao)?' · pode chefiar a área':''}`:''}</small></button>`).join('')}</div>`,[{t:'Cancelar',v:'',cls:'ghost'}]);
  if(v===''||v===undefined) return;
  const c=cands[+v]; U.equipe.push(c); if(funcao==='gestor'&&!U.gestorId) U.gestorId=c.id;
  addLog(`${c.nome} entrou na equipe como ${nomeFuncao(c).toLowerCase()}.`,'g'); salvar(); render(); }
async function demitir(id){ const U=S.u, f=U.equipe.find(x=>x.id===id); if(!f||ocupado) return;
  if(f.funcao==='socio') return modal('<h2>Sócio não pode ser demitido</h2><p>A saída de um sócio exige acordo societário, que fica para uma próxima versão.</p>',[{t:'Ok',v:1}]);
  const pub=pubCar(), multa=pub?0:f.sal*2;
  const verbo=pub?(f.funcao==='servidor'?'Devolver ao tribunal':'Exonerar do cargo em comissão'):'Demitir';
  const v=await modal(`<h2>${verbo}: ${esc(f.nome)}?</h2><p>${pub?'A pessoa sai da sua unidade e vai para outra lotação.':`Custa ${brl(multa)} de rescisão.`} O resto da equipe perde um pouco de moral.</p>`,[{t:'Cancelar',v:0,cls:'ghost'},{t:verbo,v:1}]);
  if(!v) return; removeFunc(id); S.caixa-=multa; for(const x of U.equipe) x.moral=clamp(x.moral-3,0,100);
  addLog(`${f.nome} saiu da equipe.`,'r'); salvar(); render(); }
function promoverF(id){ const U=S.u, f=U.equipe.find(x=>x.id===id), prox=PROMO_ADV[f&&f.funcao]; if(!f||!prox||f.semanas<f.promoEm) return;
  const F=FUNCOES.adv[prox]; f.funcao=prox; if(f.ae) f.ae=clamp(f.ae+5,0,95); f.sal=Math.max(f.sal,F.sal); f.salBase=f.sal; f.q=clamp(Math.max(f.q+5,F.q[0]),0,95); f.moral=clamp(f.moral+15,0,100); f.promoEm=f.semanas+8;
  addLog(`${f.nome} foi promovido a ${F.nome.toLowerCase()}.`,'g'); salvar(); render(); }
function aumento(id){ const f=S.u.equipe.find(x=>x.id===id); if(!f||!f.sal) return;
  f.sal=Math.round(f.sal*1.15/50)*50; f.moral=clamp(f.moral+15,0,100); addLog(`${f.nome} recebeu aumento para ${brl(f.sal)}.`,'g'); salvar(); render(); }
function construir(tipo){ const U=S.u, i=U.sel, C=COMODOS[tipo], pub=pubCar(); if(i===null||U.salas[i]) return;
  if((pub?U.orc:S.caixa)<C.custo) return; if(pub) U.orc-=C.custo; else S.caixa-=C.custo;
  U.salas[i]=tipo; addLog(`Obra concluída: ${C.nome}.`,'g'); salvar(); render(); }
function demolir(){ const U=S.u, i=U.sel, k=U.salas[i]; if(!k||k==='titular') return;
  if(COMODOS[k].mesas && U.equipe.length>mesas()-COMODOS[k].mesas) return modal('<h2>Sala ocupada</h2><p>Há pessoas trabalhando nessas mesas. Desligue alguém ou construa outra sala antes.</p>',[{t:'Ok',v:1}]);
  U.salas[i]=null; addLog(`${COMODOS[k].nome} desmontada.`); salvar(); render(); }
function mudarImovel(){ const U=S.u, pub=pubCar(), lista=pub?IMOVEIS.pub:IMOVEIS.adv, prox=lista[U.imovel+1]; if(!prox) return;
  if(prox.cargoMin&&cargoAtual()<prox.cargoMin) return; if((pub?U.orc:S.caixa)<prox.mudar) return;
  if(pub) U.orc-=prox.mudar; else S.caixa-=prox.mudar;
  U.imovel++; while(U.salas.length<prox.cols*prox.rows) U.salas.push(null);
  addLog(`${pub?'Reforma concluída':'Mudança concluída'}: ${prox.nome}.`,'g'); salvar(); render(); }

// ----- planta -----
const CW=150, CH=112, MX=70, MY=64, MR=40, MB=128, M_PX=1/33.3; // 1 m ≈ 33,3 px na escala 1:100
const m2=(w,h)=>(w*M_PX*h*M_PX).toLocaleString('pt-BR',{maximumFractionDigits:1});
const metro=v=>(v*M_PX).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
function moveis(k,x,y,quem){ let s='';
  const R=(a,b,w,h,r=2,c='f')=>`<rect x="${x+a}" y="${y+b}" width="${w}" height="${h}" rx="${r}" class="${c}"/>`;
  const O=(a,b,r,c='f')=>`<circle cx="${x+a}" cy="${y+b}" r="${r}" class="${c}"/>`;
  const L=(a,b,c,d,cl='fl')=>`<line x1="${x+a}" y1="${y+b}" x2="${x+c}" y2="${y+d}" class="${cl}"/>`;
  const cad=(a,b)=>R(a-5,b-4.5,10,9,2);
  const vaso=(a,b)=>O(a,b,6)+L(a-8,b,a+8,b)+L(a,b-8,a,b+8)+L(a-5.5,b-5.5,a+5.5,b+5.5)+L(a-5.5,b+5.5,a+5.5,b-5.5)+O(a,b,2,'fd');
  const ini=f=>f.nome.split(' ').map(w=>w[0]).join('').slice(0,2);
  const pessoa=(a,b,f)=>f?`<circle cx="${x+a}" cy="${y+b}" r="8.5" class="pessoa ${f.id===S.u.gestorId?'gest':''}"/><text x="${x+a}" y="${y+b+3}" class="pessoa-t" text-anchor="middle">${ini(f)}</text>`:cad(a,b);
  if(k==='titular'){ s+=R(30,48,90,40,3,'fd')+R(45,38,60,22)+R(56,42,18,9,1)+L(80,46,96,46)+L(80,50,92,50)+R(16,86,28,14,4)+L(25,86,25,100)+L(35,86,35,100)+vaso(132,24);
    s+=`<circle cx="${x+75}" cy="${y+70}" r="8.5" class="pessoa voce"/><text x="${x+75}" y="${y+73}" class="pessoa-t" text-anchor="middle">EU</text>`; }
  if(k==='trabalho'){ for(let m=0;m<3;m++){ const a=12+m*44; s+=R(a,30,36,18)+R(a+11,32,14,4,1)+L(a+18,36,a+18,40); s+=pessoa(a+18,62,quem[m]); } s+=vaso(136,96)+L(10,92,60,92,'fd'); }
  if(k==='recepcao'){ s+=`<path d="M${x+18} ${y+38} H${x+92} V${y+64}" class="balcao"/>`+R(98,84,10,9)+R(112,84,10,9)+R(126,84,10,9)+L(96,96,138,96,'fd')+vaso(20,92); s+=pessoa(55,54,quem[0]); }
  if(k==='reuniao'){ s+=R(32,44,86,28,12); for(let m=0;m<3;m++){ s+=cad(50+m*25,36)+cad(50+m*25,80); } s+=cad(24,58)+cad(126,58)+L(142,36,142,80,'bp-tv')+O(75,58,6,'fd'); }
  if(k==='biblioteca'){ for(let m=0;m<3;m++){ s+=R(10+m*44,34,38,11,1); for(let l=1;l<6;l++) s+=L(10+m*44+l*6.3,34,10+m*44+l*6.3,45); } s+=R(48,64,54,24,4)+cad(40,76)+cad(110,76)+O(75,76,4,'fd'); }
  if(k==='arquivo'){ for(let m=0;m<4;m++){ s+=R(10+m*25,34,21,30,1); for(let l=1;l<4;l++) s+=L(12+m*25,34+l*7.5,29+m*25,34+l*7.5); } s+=R(116,34,24,58,2); for(let l=0;l<6;l++) s+=O(128,41+l*8.5,1.6,'bp-led'); s+=L(10,80,104,80,'fd'); }
  if(k==='copa'){ s+=R(10,34,130,14,1)+O(32,41,5)+O(108,41,3.5)+O(120,41,3.5)+O(75,78,14)+cad(53,78)+cad(97,78)+cad(75,99)+vaso(136,96); }
  return s; }
function plantaSVG(){ const U=S.u, im=imovelAtual(), w=im.cols*CW, h=im.rows*CH, W=w+MX+MR, H=h+MY+MB;
  const trabalhando=[...U.equipe].sort((a,b)=>(b.id===U.gestorId)-(a.id===U.gestorId)); let idx=0;
  let s=`<defs>
    <pattern id="bpMin" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0H0V10" class="bp-g1"/></pattern>
    <pattern id="bpMaj" width="50" height="50" patternUnits="userSpaceOnUse"><rect width="50" height="50" fill="url(#bpMin)"/><path d="M50 0H0V50" class="bp-g2"/></pattern>
    <radialGradient id="bpVig" cx="50%" cy="45%" r="75%"><stop offset="60%" stop-color="#0B2F5C" stop-opacity="0"/><stop offset="100%" stop-color="#0B2F5C" stop-opacity=".55"/></radialGradient>
    <filter id="bpGlow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect width="${W}" height="${H}" class="bp-bg"/><rect width="${W}" height="${H}" fill="url(#bpMaj)"/><rect width="${W}" height="${H}" fill="url(#bpVig)"/>
  <rect x="10" y="10" width="${W-20}" height="${H-20}" class="bp-frame"/><rect x="14" y="14" width="${W-28}" height="${H-28}" class="bp-frame fino"/>`;
  const ox=MX, oy=MY; let paredes='', vaos='', portas='', janelas='', topo='';
  U.salas.forEach((k,i)=>{ const col=i%im.cols, row=Math.floor(i/im.cols), x=ox+col*CW, y=oy+row*CH;
    let quem=[]; if(k&&COMODOS[k].mesas){ quem=trabalhando.slice(idx,idx+COMODOS[k].mesas); idx+=COMODOS[k].mesas; }
    s+=`<g class="slot ${U.sel===i?'sel':''}" data-act="slot" data-v="${i}" role="button" tabindex="0" aria-label="${k?COMODOS[k].nome:'Espaço vazio'}">`;
    if(!k) s+=`<rect x="${x+12}" y="${y+12}" width="${CW-24}" height="${CH-24}" rx="3" class="bp-empty"/><line x1="${x+12}" y1="${y+12}" x2="${x+CW-12}" y2="${y+CH-12}" class="bp-empty x"/><line x1="${x+CW-12}" y1="${y+12}" x2="${x+12}" y2="${y+CH-12}" class="bp-empty x"/><rect x="${x+CW/2-44}" y="${y+CH/2-9}" width="88" height="18" class="bp-chip"/><text x="${x+CW/2}" y="${y+CH/2+3.5}" text-anchor="middle" class="bp-empty-t">+ CONSTRUIR</text>`;
    else s+=`<rect x="${x}" y="${y}" width="${CW}" height="${CH}" class="bp-floor"/>${moveis(k,x,y,quem)}<text x="${x+9}" y="${y+16}" class="bp-t">${COMODOS[k].nome.toUpperCase()}</text><text x="${x+9}" y="${y+26}" class="bp-a">${m2(CW,CH)} m²</text>`;
    s+=`<rect x="${x+3}" y="${y+3}" width="${CW-6}" height="${CH-6}" class="bp-hit"/></g>`;
    paredes+=`<rect x="${x}" y="${y}" width="${CW}" height="${CH}" class="bp-wall"/>`;
    if(k){ // porta: parede esquerda (interna) ou de baixo
      if(col>0){ vaos+=`<rect x="${x-3}" y="${y+CH-36}" width="6" height="24" class="bp-gap"/>`; portas+=`<line x1="${x}" y1="${y+CH-12}" x2="${x+24}" y2="${y+CH-12}" class="fl"/><path d="M${x+24} ${y+CH-12} A24 24 0 0 0 ${x} ${y+CH-36}" class="fd"/>`; }
      else if(row<im.rows-1){ vaos+=`<rect x="${x+CW-36}" y="${y+CH-3}" width="24" height="6" class="bp-gap"/>`; portas+=`<line x1="${x+CW-12}" y1="${y+CH}" x2="${x+CW-12}" y2="${y+CH-24}" class="fl"/><path d="M${x+CW-12} ${y+CH-24} A24 24 0 0 0 ${x+CW-36} ${y+CH}" class="fd"/>`; }
      else { vaos+=`<rect x="${x+CW-44}" y="${y+CH-5}" width="32" height="10" class="bp-gap"/>`; portas+=`<line x1="${x+CW-12}" y1="${y+CH}" x2="${x+CW-12}" y2="${y+CH-32}" class="fl"/><path d="M${x+CW-12} ${y+CH-32} A32 32 0 0 0 ${x+CW-44} ${y+CH}" class="fd"/><text x="${x+CW-28}" y="${y+CH+20}" text-anchor="middle" class="bp-dimt">ENTRADA</text>`; } }
    if(row===0){ janelas+=`<rect x="${x+CW/2-22}" y="${y-5}" width="44" height="10" class="bp-gap"/><line x1="${x+CW/2-22}" y1="${y-2}" x2="${x+CW/2+22}" y2="${y-2}" class="fl"/><line x1="${x+CW/2-22}" y1="${y+2}" x2="${x+CW/2+22}" y2="${y+2}" class="fl"/><line x1="${x+CW/2-22}" y1="${y-5}" x2="${x+CW/2-22}" y2="${y+5}" class="fl"/><line x1="${x+CW/2+22}" y1="${y-5}" x2="${x+CW/2+22}" y2="${y+5}" class="fl"/>`;
      topo+=`<line x1="${x}" y1="${oy-30}" x2="${x+CW}" y2="${oy-30}" class="bp-dim"/><line x1="${x-4}" y1="${oy-26}" x2="${x+4}" y2="${oy-34}" class="bp-dim"/><line x1="${x+CW-4}" y1="${oy-26}" x2="${x+CW+4}" y2="${oy-34}" class="bp-dim"/><line x1="${x}" y1="${oy-38}" x2="${x}" y2="${oy-8}" class="bp-dim fino"/><text x="${x+CW/2}" y="${oy-35}" text-anchor="middle" class="bp-dimt">${metro(CW)}</text>`; }
    if(col===im.cols-1) janelas+=`<rect x="${x+CW-5}" y="${y+CH/2-18}" width="10" height="36" class="bp-gap"/><line x1="${x+CW-2}" y1="${y+CH/2-18}" x2="${x+CW-2}" y2="${y+CH/2+18}" class="fl"/><line x1="${x+CW+2}" y1="${y+CH/2-18}" x2="${x+CW+2}" y2="${y+CH/2+18}" class="fl"/>`;
    if(col===0) topo+=`<line x1="${ox-32}" y1="${y}" x2="${ox-32}" y2="${y+CH}" class="bp-dim"/><line x1="${ox-36}" y1="${y+4}" x2="${ox-28}" y2="${y-4}" class="bp-dim"/><line x1="${ox-36}" y1="${y+CH+4}" x2="${ox-28}" y2="${y+CH-4}" class="bp-dim"/><line x1="${ox-40}" y1="${y}" x2="${ox-8}" y2="${y}" class="bp-dim fino"/><text x="${ox-38}" y="${y+CH/2}" text-anchor="middle" transform="rotate(-90 ${ox-38} ${y+CH/2})" class="bp-dimt">${metro(CH)}</text>`; });
  topo+=`<line x1="${ox+w}" y1="${oy-38}" x2="${ox+w}" y2="${oy-8}" class="bp-dim fino"/><line x1="${ox-40}" y1="${oy+h}" x2="${ox-8}" y2="${oy+h}" class="bp-dim fino"/>`;
  // cota total embaixo
  const yb=oy+h+44; topo+=`<line x1="${ox}" y1="${yb}" x2="${ox+w}" y2="${yb}" class="bp-dim"/><line x1="${ox-4}" y1="${yb+4}" x2="${ox+4}" y2="${yb-4}" class="bp-dim"/><line x1="${ox+w-4}" y1="${yb+4}" x2="${ox+w+4}" y2="${yb-4}" class="bp-dim"/><text x="${ox+w/2}" y="${yb-5}" text-anchor="middle" class="bp-dimt">${metro(w)} m · área total ${m2(w,h)} m²</text>`;
  s+=paredes+`<rect x="${ox}" y="${oy}" width="${w}" height="${h}" class="bp-wall-ext"/><rect x="${ox}" y="${oy}" width="${w}" height="${h}" class="bp-wall-oco"/>`+vaos+janelas+portas+topo;
  // rosa dos ventos e escala
  const nx=ox+18, ny=H-48;
  s+=`<g class="bp-norte"><circle cx="${nx}" cy="${ny}" r="15" class="fl"/><path d="M${nx} ${ny-13} L${nx+5} ${ny+6} L${nx} ${ny+2} L${nx-5} ${ny+6}Z" class="bp-seta"/><text x="${nx}" y="${ny-19}" text-anchor="middle" class="bp-dimt">N</text></g>`;
  const sx=ox+50, sy=H-40; for(let m=0;m<4;m++) s+=`<rect x="${sx+m/M_PX}" y="${sy}" width="${1/M_PX}" height="5" class="${m%2?'bp-esc-b':'bp-esc-a'}"/><text x="${sx+m/M_PX}" y="${sy-4}" text-anchor="middle" class="bp-a">${m}</text>`;
  s+=`<text x="${sx+4/M_PX}" y="${sy-4}" text-anchor="middle" class="bp-a">4 m</text>`;
  // carimbo
  const cw=Math.min(300,W-MR+20-(sx+4/M_PX)-24), cx0=W-MR-cw+20, cy0=H-MB+66, ch=46, dv=cx0+cw-72;
  s+=`<g class="bp-carimbo"><rect x="${cx0}" y="${cy0}" width="${cw}" height="${ch}" class="bp-frame"/><line x1="${cx0}" y1="${cy0+18}" x2="${cx0+cw}" y2="${cy0+18}" class="bp-frame"/><line x1="${dv}" y1="${cy0+18}" x2="${dv}" y2="${cy0+ch}" class="bp-frame"/>
    <text x="${cx0+8}" y="${cy0+12.5}" class="bp-t">PLANTA BAIXA · ${im.nome.toUpperCase()}</text>
    <text x="${cx0+8}" y="${cy0+30}" class="bp-a">TITULAR: ${esc(S.nome).toUpperCase()}</text><text x="${cx0+8}" y="${cy0+40}" class="bp-a">${U.equipe.length} NA EQUIPE · ORG. ${organizacao()}</text>
    <text x="${dv+8}" y="${cy0+30}" class="bp-a">ESC. 1:100</text><text x="${dv+8}" y="${cy0+40}" class="bp-a">MÊS ${String(S.semana).padStart(2,'0')}</text></g>`;
  return {s,W,H}; }

// ----- tela -----
function painelSala(){ const U=S.u, i=U.sel, pub=pubCar(), saldo=pub?U.orc:S.caixa, lista=pub?IMOVEIS.pub:IMOVEIS.adv, prox=lista[U.imovel+1];
  let corpo;
  if(i===null||i===undefined) corpo='<p style="margin:0;font-size:12.5px;color:var(--muted)">Clique num espaço da planta para construir ou ver um cômodo.</p>';
  else if(!U.salas[i]) corpo=`<span class="label">Construir neste espaço · pago pelo ${pub?'orçamento da unidade':'caixa do escritório'}</span>
    <div class="opts">${Object.entries(COMODOS).filter(([k])=>k!=='titular').map(([k,C])=>`<button class="opt" data-act="construir" data-v="${k}" ${saldo<C.custo?'disabled':''}><span>${C.nome}</span><b class="num">${brl(C.custo)}</b><small>${C.desc} Manutenção ${brl(C.mant)}/mês.</small></button>`).join('')}</div>`;
  else { const C=COMODOS[U.salas[i]]; corpo=`<p style="margin:0">${C.desc}</p><dl class="meta"><dt>Manutenção</dt><dd class="num">${brl(C.mant)}/mês</dd></dl>${U.salas[i]!=='titular'?'<button class="btn ghost" data-act="demolir">Desmontar cômodo</button>':''}`; }
  return `<section class="panel"><div class="panel-head"><h2>${i===null||i===undefined?'Planta':U.salas[i]?COMODOS[U.salas[i]].nome:'Espaço vazio'}</h2></div>${corpo}
    ${prox?`<button class="btn ghost" data-act="mudarImovel" ${saldo<prox.mudar||(prox.cargoMin&&cargoAtual()<prox.cargoMin)?'disabled':''}>${pub?'Reformar para':'Mudar para'} ${prox.nome} · ${brl(prox.mudar)}${prox.cargoMin&&cargoAtual()<prox.cargoMin?' (exige cargo mais alto)':''}${pub?'':` · aluguel ${brl(prox.aluguel)}/mês`}</button>`:''}
  </section>`; }
function painelFinancas(){ const U=S.u;
  if(!pubCar()){ const d=despesasEscritorio(), soc=U.equipe.filter(f=>f.funcao==='socio');
    return `<section class="panel"><div class="panel-head"><h2>Finanças do escritório</h2></div>
      <dl class="meta"><dt>Caixa do escritório</dt><dd class="num ${S.caixa<0?'lo':''}">${brl(S.caixa)}</dd><dt>Seu dinheiro pessoal</dt><dd class="num ${S.bolso<0?'lo':''}">${brl(S.bolso)}</dd>
        <dt>Honorários neste mês</dt><dd class="num hi">${brl(U.honSemana)}</dd>
        <dt>Aluguel · ${IMOVEIS.adv[U.imovel].nome}</dt><dd class="num">${brl(d.aluguel)}</dd><dt>Salários</dt><dd class="num">${brl(d.sal)}</dd><dt>Manutenção</dt><dd class="num">${brl(d.mant)}</dd>${d.fil?`<dt>Filiais</dt><dd class="num">${brl(d.fil)}</dd>`:''}
        <dt>Despesas por mês</dt><dd class="num lo">${brl(d.total)}</dd>
        ${soc.length?`<dt>Sócios (${soc.length})</dt><dd class="num">${pct(soc.reduce((a,f)=>a+f.part,0))} do lucro</dd>`:''}
        <dt>Seu custo de vida</dt><dd class="num">${brl(CUSTO_VIDA)}/mês</dd></dl>
      ${painelRetirada()}
      ${U.hist.length?`<span class="label">Últimos meses</span><ul class="break">${U.hist.map(h=>`<li><span>M${h.w} · honorários ${brl(h.hon)} · despesas ${brl(h.desp)}</span><span class="num ${h.hon-h.desp>=0?'hi':'lo'}">${brl(h.hon-h.desp)}</span></li>`).join('')}</ul>`:''}
    </section>`; }
  const rec=receitaPub(), desp=despesasPub();
  return `<section class="panel"><div class="panel-head"><h2>Orçamento da unidade</h2></div>
    <dl class="meta"><dt>Saldo do orçamento</dt><dd class="num ${U.orc<0?'lo':''}">${brl(U.orc)}</dd>
      <dt>Repasse do tribunal por mês</dt><dd class="num hi">${brl(rec)}</dd><dt>Equipe e manutenção por mês</dt><dd class="num lo">${brl(desp)}</dd>
      <dt>Índice de efetividade</dt><dd class="num ${cls(U.efet/100)}">${U.efet.toLocaleString('pt-BR')}</dd></dl>
    <div class="bar"><i style="width:${U.efet}%;background:var(--brass)"></i></div>
    <p style="margin:0;font-size:12px;color:var(--muted)">O tribunal repassa entre 50% e 150% de ${brl(ORC_BASE[cargoAtual()])} por mês conforme a efetividade: concluir mais casos do que chegam, sem atrasos e com boa organização. Com 80 ou mais, você ganha gratificação de 10% do salário. O salário em si é fixo.</p>
  </section>`; }
function painelOrganizacao(){ const U=S.u, o=organizacao(), g=gestorAtual(), q=qualEquipe();
  return `<section class="panel"><div class="panel-head"><h2>Organização</h2><span class="num ${cls(o/100)}">${o}</span></div>
    <div class="bar"><i style="width:${o}%;background:var(--brass)"></i></div>
    <dl class="meta"><dt>${nomeGestor()}</dt><dd>${g?esc(g.nome)+' · gestão '+g.g:'<span class="lo">ninguém</span>'}</dd>
      <dt>Qualidade média da equipe</dt><dd class="num">${q===null?'—':Math.round(q)}</dd>
      <dt>Casos por pessoa</dt><dd class="num">${(pendentes()/(trabalhadores().length+1)).toLocaleString('pt-BR',{maximumFractionDigits:1})}</dd>
      <dt>Efeito na chance</dt><dd class="num">${sgn(Math.round((o-50)/12*10)/10)}</dd>
      ${pubCar()?`<dt>Peso dos atrasos</dt><dd class="num">×${fatorAtraso().toLocaleString('pt-BR',{maximumFractionDigits:2})}</dd>`:''}</dl>
    <label class="row" style="font-size:12.5px"><input type="checkbox" id="auto-dist" data-act="autoDist" ${U.auto?'checked':''} ${g?'':'disabled'}> <span class="name">O ${nomeGestor().toLowerCase()} distribui os blocos livres da equipe</span></label>
    <p style="margin:0;font-size:12px;color:var(--muted)">Organização sobe com um bom gestor, arquivo e TI, recepção e servidores. Cai quando há casos demais por pessoa.</p>
  </section>`; }
function cardFunc(f){ const F=FX()[f.funcao], pub=pubCar(), gest=f.id===S.u.gestorId, prox=!pub&&PROMO_ADV[f.funcao];
  return `<article class="panel" style="gap:8px">
    <div class="panel-head"><h3 style="font-size:15px">${esc(f.nome)}</h3>${gest?'<span class="tag">Gestor</span>':''}</div>
    <span class="label" style="text-transform:none;letter-spacing:0">${nomeFuncao(f)} · ${f.semanas} meses na equipe${f.area?` · ${AREAS[f.area].nome} <span style="color:var(--brass)">${'★'.repeat(estrelasF(f))}</span> (${Math.floor(f.ae)})`:''}</span>
    <div class="vs"><span>Qualidade</span><div class="bar"><i style="width:${f.q}%;background:var(--win)"></i></div><span class="num">${Math.round(f.q)}</span>
      <span>Gestão</span><div class="bar"><i style="width:${f.g}%;background:var(--b-estudo)"></i></div><span class="num">${f.g}</span>
      <span>Moral</span><div class="bar"><i style="width:${f.moral}%;background:${f.moral<35?'var(--loss)':'var(--brass)'}"></i></div><span class="num">${Math.round(f.moral)}</span></div>
    <dl class="meta"><dt>${f.funcao==='socio'?'Participação':'Salário'}</dt><dd class="num">${f.funcao==='socio'?pct(f.part)+' do lucro':F.sal?brl(f.sal)+'/mês':'pago pelo tribunal'}</dd><dt>Blocos por mês</dt><dd class="num">${F.bl}</dd></dl>
    <div class="chips">
      ${gest?'':`<button class="chip" data-act="gestorF" data-id="${f.id}">Tornar gestor</button>`}
      ${prox?`<button class="chip" data-act="promoverF" data-id="${f.id}" ${f.semanas<f.promoEm?'disabled':''}>Promover a ${FUNCOES.adv[prox].nome.toLowerCase()}</button>`:''}
      ${f.sal?`<button class="chip" data-act="aumento" data-id="${f.id}">Aumento de 15%</button>`:''}
      ${f.funcao==='socio'?'':`<button class="chip bad" data-act="demitir" data-id="${f.id}">${pub?(f.funcao==='servidor'?'Devolver':'Exonerar'):'Demitir'}</button>`}
    </div></article>`; }
function renderEstrutura(){ const U=S.u, P=plantaSVG(), funcs=Object.entries(FX()).filter(([k])=>k!=='socio');
  app.innerHTML=`${header()}
  <div class="mapgrid">
    <section class="mapbox">
      <div class="panel-head" style="flex-wrap:wrap"><h2>${imovelAtual().nome}</h2><span class="label">${U.equipe.length}/${mesas()} mesas ocupadas · ${gabinete()} blocos da equipe por mês</span></div>
      <svg viewBox="0 0 ${P.W} ${P.H}" role="img" aria-label="Planta da estrutura" style="border-radius:4px">${P.s}</svg>
      <div class="legend"><span><i style="background:#8FE3FF"></i>Equipe</span><span><i style="background:#FFC857"></i>Gestor</span><span><i style="background:#F4F8FF;border:1px solid var(--line)"></i>Você</span><span>Clique num espaço para construir ou trocar o cômodo</span></div>
    </section>
    <div class="col">${painelSala()}${S.carreira==='adv'?painelAreas():''}${painelFinancas()}${painelOrganizacao()}</div>
  </div>
  <section class="panel" style="margin-top:20px;background:transparent;border:0;padding:0">
    <div class="panel-head"><h2>Equipe</h2><span class="num">${U.equipe.length} pessoa${U.equipe.length===1?'':'s'}</span></div>
    <div class="chips">${funcs.map(([k,F])=>`<button class="btn ghost" data-act="contratar" data-v="${k}" ${U.equipe.length>=mesas()?'disabled':''}>${k==='servidor'?'Requisitar':'Contratar'} ${(k==='gestor'?nomeGestor():F.nome).toLowerCase()}${F.sal?' · ~'+brl(F.sal):F.parteHon?` · sem salário, ${pct(F.parteHon)} dos honorários ganhos`:''}</button>`).join('')}</div>
    <div class="cases" style="margin-top:12px">${U.equipe.length?U.equipe.map(cardFunc).join(''):'<p class="empty">Ninguém na equipe ainda. Contrate alguém para dividir o trabalho.</p>'}</div>
  </section>`;
}

