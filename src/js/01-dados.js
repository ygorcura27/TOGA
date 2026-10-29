// ===================== DADOS =====================
const SKILLS = {penal:'Penal',civel:'Cível',trabalho:'Trabalho',familia:'Família',empresarial:'Empresarial',tributario:'Tributário',
  oratoria:'Oratória',escrita:'Escrita',pesquisa:'Pesquisa',negociacao:'Negociação',analise:'Análise',didatica:'Didática'};
const AREAS = {
  penal:{nome:'Penal',skills:{penal:.5,analise:.3,oratoria:.2}},
  civel:{nome:'Cível',skills:{civel:.5,escrita:.3,pesquisa:.2}},
  trabalho:{nome:'Trabalho',skills:{trabalho:.5,escrita:.25,negociacao:.25}},
  familia:{nome:'Família',skills:{familia:.5,negociacao:.3,oratoria:.2}},
  empresarial:{nome:'Empresarial',skills:{empresarial:.5,analise:.25,escrita:.25}},
  tributario:{nome:'Tributário',skills:{tributario:.5,pesquisa:.3,escrita:.2}},
};
const RAR = {
  comum:   {nome:'Comum',   d:[10,30], ganho:1, perda:2,  apelo:.15, prazo:[2,3],  xp:1},
  incomum: {nome:'Incomum', d:[25,45], ganho:2, perda:3,  apelo:.30, prazo:[3,4],  xp:1.3},
  raro:    {nome:'Raro',    d:[40,65], ganho:3, perda:5,  apelo:.45, prazo:[4,6],  xp:1.6},
  epico:   {nome:'Épico',   d:[60,85], ganho:4, perda:7,  apelo:.60, prazo:[6,8],  xp:2},
  lendario:{nome:'Lendário',d:[80,100],ganho:6, perda:10, apelo:.80, prazo:[8,10], xp:2.5},
};
const RORD = ['comum','incomum','raro','epico','lendario'];
const ADV = {pf:{nome:'Pessoa física',apelo:-.10}, empresa:{nome:'Empresa grande',apelo:.15}, estado:{nome:'Estado / Ministério Público',apelo:.20}};
const T = (area,titulo,adv,rars,juri=false) => ({area,titulo,adv,rars,juri});
const TEMPLATES = [
  T('penal','Furto em supermercado','estado',['comum']),
  T('penal','Lesão corporal em briga de bar','estado',['comum','incomum']),
  T('penal','Acidente de trânsito com vítima','estado',['incomum']),
  T('penal','Tráfico: flagrante questionável','estado',['incomum','raro']),
  T('penal','Homicídio: legítima defesa','estado',['raro','epico'],true),
  T('penal','Crime cibernético: invasão de sistema','estado',['raro']),
  T('penal','Fraude em licitação','estado',['raro','epico']),
  T('penal','Lavagem de dinheiro de banqueiro','estado',['epico','lendario']),
  T('civel','Cobrança de aluguel atrasado','pf',['comum']),
  T('civel','Indenização por voo cancelado','empresa',['comum']),
  T('civel','Dano moral contra rede social','empresa',['incomum']),
  T('civel','Obra entregue pela metade','empresa',['incomum']),
  T('civel','Herança de fazenda disputada','pf',['incomum','raro']),
  T('civel','Erro médico em hospital','empresa',['raro']),
  T('civel','Vazamento de dados de clientes','empresa',['raro','epico']),
  T('civel','Ação coletiva contra montadora','empresa',['epico','lendario']),
  T('trabalho','Horas extras não pagas','empresa',['comum']),
  T('trabalho','Reclamação de empregada doméstica','pf',['comum']),
  T('trabalho','Equiparação salarial','empresa',['comum','incomum']),
  T('trabalho','Demissão por justa causa','empresa',['incomum']),
  T('trabalho','Assédio moral na gerência','empresa',['incomum','raro']),
  T('trabalho','Acidente na fábrica','empresa',['raro']),
  T('trabalho','Vínculo de motorista de aplicativo','empresa',['raro','epico']),
  T('trabalho','Demissão em massa após greve','empresa',['epico']),
  T('familia','Divórcio consensual','pf',['comum']),
  T('familia','Revisão de pensão alimentícia','pf',['comum']),
  T('familia','Reconhecimento de paternidade','pf',['incomum']),
  T('familia','Guarda compartilhada disputada','pf',['incomum']),
  T('familia','Inventário litigioso entre irmãos','pf',['incomum','raro']),
  T('familia','Adoção internacional','estado',['raro']),
  T('familia','Partilha de bens de empresário','pf',['raro','epico']),
  T('familia','Divórcio de celebridade','pf',['epico']),
  T('empresarial','Cobrança entre fornecedores','empresa',['comum']),
  T('empresarial','Dissolução de sociedade','pf',['incomum']),
  T('empresarial','Quebra de contrato de franquia','empresa',['incomum']),
  T('empresarial','Marca copiada por concorrente','empresa',['incomum','raro']),
  T('empresarial','Recuperação judicial de varejista','empresa',['raro','epico']),
  T('empresarial','Patente farmacêutica','empresa',['epico']),
  T('empresarial','Disputa de fusão bilionária','empresa',['lendario']),
  T('tributario','Restituição de imposto pago a mais','estado',['comum']),
  T('tributario','Cobrança de IPTU indevida','estado',['comum']),
  T('tributario','Auto de infração da Receita','estado',['incomum']),
  T('tributario','ICMS sobre energia elétrica','estado',['incomum','raro']),
  T('tributario','Planejamento tributário questionado','estado',['raro']),
  T('tributario','Execução fiscal milionária','estado',['raro','epico']),
  T('tributario','Imposto sobre herança bilionária','estado',['epico']),
  T('tributario','Tese do século: ICMS na base do PIS/Cofins','estado',['lendario']),
  // casos extras para variar as ofertas
  T('penal','Estelionato em aplicativo de namoro','estado',['comum','incomum']),
  T('penal','Direção sob efeito de álcool','estado',['comum']),
  T('penal','Receptação de carga roubada','estado',['incomum','raro']),
  T('penal','Crime cibernético contra banco','estado',['raro','epico']),
  T('penal','Homicídio com grande repercussão','estado',['epico','lendario'],true),
  T('civel','Vizinho barulhento e perturbação do sossego','pf',['comum']),
  T('civel','Plano de saúde negou cirurgia','empresa',['comum','incomum']),
  T('civel','Vício oculto em carro usado','pf',['comum','incomum']),
  T('civel','Erro médico em hospital particular','empresa',['raro','epico']),
  T('civel','Vazamento de dados de clientes','empresa',['raro','epico']),
  T('trabalho','Horas extras de bancária','empresa',['comum','incomum']),
  T('trabalho','Acidente de trabalho em obra','empresa',['incomum','raro']),
  T('trabalho','Demissão durante a gravidez','empresa',['incomum','raro']),
  T('trabalho','Trabalho análogo à escravidão em fazenda','empresa',['epico','lendario']),
  T('familia','Pensão alimentícia atrasada','pf',['comum']),
  T('familia','Inventário com herdeiros brigados','pf',['incomum','raro']),
  T('familia','União estável não reconhecida','pf',['incomum']),
  T('familia','Disputa por herança de empresário','pf',['raro','epico']),
  T('familia','Guarda internacional de criança','pf',['epico']),
  T('empresarial','Briga entre sócios de restaurante','pf',['comum','incomum']),
  T('empresarial','Quebra de contrato de franquia','empresa',['incomum','raro']),
  T('empresarial','Recuperação judicial de varejista','empresa',['raro','epico']),
  T('empresarial','Patente farmacêutica em disputa','empresa',['epico','lendario']),
  T('tributario','Multa da Receita sobre MEI','estado',['comum']),
  T('tributario','ICMS na conta de luz','estado',['incomum','raro']),
  T('tributario','Planejamento tributário de holding familiar','estado',['raro','epico']),
  T('tributario','Guerra fiscal entre estados','estado',['epico','lendario']),
];
const NOMES = ['Marcos Duarte','Luíza Fontes','Rafael Brandão','Helena Cardoso','Tiago Moreira','Camila Rezende','Jorge Paiva','Beatriz Lacerda','André Sampaio','Patrícia Viana','Otávio Nunes','Renata Coelho','Sérgio Bastos','Aline Prado','Fábio Teixeira','Marta Albuquerque'];
const EMPRESAS = ['Construtora Atlas','Grupo Meridiano','Varejo Bom Preço','Logística Rota Sul','Tecnologia Alvorada','Indústrias Cobalto','Farmácia Vitalis','Agro Horizonte'];
const JUIZES = {
  rigoroso:{nome:'Rigoroso',desc:'−5 em qualquer caso'},
  garantista:{nome:'Garantista',desc:'+5 para a defesa em casos penais'},
  formalista:{nome:'Formalista',desc:'+5 se Escrita ≥ 50, senão −5'},
  impaciente:{nome:'Impaciente',desc:'preparação vale 60%'},
  pragmatico:{nome:'Pragmático',desc:'+10 na chance de acordo'},
};
const JNOMES = ['Dra. Helena Rocha','Dr. Paulo Mattos','Dra. Inês Carvalho','Dr. Ricardo Leme','Dra. Sônia Prates','Dr. Gustavo Amaral'];
const TRAITS = {
  orador:{nome:'Orador nato',desc:'+5 em casos com júri; +8 de Oratória nos momentos decisivos'},
  rato:{nome:'Rato de biblioteca',desc:'Estudo rende 50% mais'},
  ansioso:{nome:'Ansioso',desc:'−5 em casos Épicos e Lendários; estresse sobe 25% mais rápido'},
  carismatico:{nome:'Carismático',desc:'+10 na chance de acordo'},
  workaholic:{nome:'Workaholic',desc:'Trabalho gasta 30% menos energia'},
  sortudo:{nome:'Sortudo',desc:'+3 de chance em todo caso'},
};
const TESES = {
  penal:[['Nulidade de prova ilícita',8],['In dubio pro reo',5],['Cadeia de custódia quebrada',10]],
  civel:[['Responsabilidade objetiva',6],['Inversão do ônus da prova',8],['Teoria da perda de uma chance',10]],
  trabalho:[['Primazia da realidade',8],['Dano existencial',6],['Subordinação algorítmica',10]],
  familia:[['Melhor interesse da criança',8],['Alienação parental',6],['Afetividade como vínculo',10]],
  empresarial:[['Desconsideração da personalidade jurídica',8],['Função social do contrato',5],['Preservação da empresa',10]],
  tributario:[['Imunidade tributária',6],['Vedação ao confisco',8],['Modulação de efeitos',10]],
};
const APOIOS = {
  pesquisa:{nome:'Pesquisa de jurisprudência',bonus:5,blocos:2,custo:()=>0},
  testemunha:{nome:'Preparar testemunha',bonus:5,blocos:1,custo:()=>0},
  perito:{nome:'Perito',bonus:8,blocos:0,custo:c=>clamp(Math.round(c.valor*.005/100)*100,1500,15000)},
  parecer:{nome:'Parecer de jurista',bonus:10,blocos:0,custo:c=>clamp(Math.round(c.valor*.01/100)*100,4000,60000)},
  correspondente:{nome:'Correspondente local',bonus:10,blocos:0,custo:c=>clamp(Math.round(c.valor*.004/100)*100,1000,8000),longe:true},
  atalho:{nome:'Atalho antiético',bonus:20,blocos:0,custo:()=>0,bad:true},
};
const ESTR = {
  conservadora:{nome:'Conservadora',mod:15,win:.5,loss:1,desc:'+15 de chance; reputação na vitória ×0,5'},
  equilibrada:{nome:'Equilibrada',mod:0,win:1,loss:1,desc:'Padrão'},
  agressiva:{nome:'Agressiva',mod:-15,win:2,loss:1.5,desc:'−15 de chance; reputação ×2 na vitória e ×1,5 na derrota'},
  acordo:{nome:'Buscar acordo',mod:0,win:0,loss:1,desc:'Tenta acordo no fim do mês: 20% sobre 50–80% da causa'},
};
const INST = {1:'1ª instância',2:'Tribunal (2ª instância)',3:'Tribunal Superior',4:'Supremo Tribunal Federal'};
// pop 1–5 · fator multiplica o valor das causas · req = prestígio para abrir filial · lbl 'l' = rótulo à esquerda
const CID = (nome,uf,lon,lat,pop,fator,req,areas,lbl='r',extra={}) => ({nome,uf,lon,lat,pop,fator,req,areas,lbl,...extra});
const CIDADES = {
  sp: CID('São Paulo','SP',-46.63,-23.55,5,1.25,30,{empresarial:3,trabalho:3,civel:2,penal:2,familia:2},'l'),
  rj: CID('Rio de Janeiro','RJ',-43.2,-22.9,4,1.15,28,{civel:3,penal:3,trabalho:2,familia:2,empresarial:2}),
  bh: CID('Belo Horizonte','MG',-43.94,-19.92,3,1.0,22,{civel:3,trabalho:2,familia:2,penal:2,empresarial:2}),
  df: CID('Brasília','DF',-47.88,-15.79,3,1.2,35,{penal:3,empresarial:3,civel:2,trabalho:1,familia:1},'r',{rarBonus:6,nota:'Sede dos tribunais superiores: mais casos raros.'}),
  gyn:CID('Goiânia','GO',-49.25,-16.68,2,.9,12,{civel:3,empresarial:2,trabalho:2,familia:2,penal:1},'l',{nota:'Agronegócio forte: contratos e disputas de terra.'}),
  ssa:CID('Salvador','BA',-38.5,-12.97,3,.9,18,{familia:3,civel:2,penal:2,trabalho:2,empresarial:1},'l'),
  rec:CID('Recife','PE',-34.88,-8.05,3,.9,18,{trabalho:3,civel:2,penal:2,familia:2,empresarial:1},'l'),
  for:CID('Fortaleza','CE',-38.54,-3.72,3,.85,15,{familia:3,civel:2,penal:2,trabalho:2,empresarial:1},'l'),
  bel:CID('Belém','PA',-48.5,-1.46,2,.8,10,{civel:2,penal:2,familia:2,trabalho:2,empresarial:1}),
  mao:CID('Manaus','AM',-60.02,-3.12,2,.85,10,{empresarial:3,trabalho:3,penal:2,civel:1,familia:1},'r',{nota:'Zona Franca: muitas indústrias e causas trabalhistas.'}),
  cwb:CID('Curitiba','PR',-49.27,-25.43,3,1.05,22,{empresarial:3,civel:2,trabalho:2,penal:2,familia:1},'l'),
  fln:CID('Florianópolis','SC',-48.55,-27.6,2,1.0,15,{civel:2,familia:2,empresarial:2,trabalho:1,penal:1}),
  poa:CID('Porto Alegre','RS',-51.23,-30.03,3,1.0,22,{trabalho:3,civel:2,familia:2,empresarial:2,penal:1}),
};
// contorno simplificado do Brasil (lon, lat)
const BR = [[-53.4,-33.8],[-53.6,-33.2],[-53.2,-32.7],[-53.8,-32],[-54.6,-31.5],[-55.6,-30.9],[-56,-30.9],[-57,-30.1],[-57.6,-30.2],[-56.3,-28.9],[-55.2,-27.9],[-54.5,-27.5],[-53.6,-26.9],[-53.6,-26.1],[-54.1,-25.5],[-54.6,-25.7],[-54.4,-25.2],[-54.3,-24.6],[-54.3,-24],[-54.7,-23.8],[-55,-24],[-55.4,-24],[-55.5,-23.6],[-55.6,-22.7],[-55.8,-22.4],[-56.5,-22.1],[-56.9,-22.3],[-57.9,-22.1],[-57.9,-20.7],[-58.2,-20.2],[-57.9,-20],[-58,-19.4],[-57.7,-19],[-57.5,-18.2],[-57.7,-17.6],[-58.3,-17.3],[-58.4,-16.9],[-58.2,-16.3],[-60.2,-16.3],[-60.5,-15.1],[-60.3,-15.1],[-60.3,-14.6],[-60.5,-14.4],[-60.5,-13.8],[-61.1,-13.5],[-61.7,-13.5],[-62.1,-13.2],[-62.8,-13],[-63.2,-12.6],[-64.3,-12.5],[-65.4,-11.6],[-65.3,-10.9],[-65.4,-10.5],[-65.3,-9.8],[-66.6,-9.9],[-67.2,-10.3],[-68,-10.7],[-68.3,-11],[-68.8,-11],[-69.5,-11],[-70.1,-11.1],[-70.5,-11],[-70.5,-9.5],[-71.3,-10.1],[-72.2,-10.1],[-72.6,-9.5],[-73.2,-9.5],[-73,-9],[-73.6,-8.4],[-74,-7.5],[-73.7,-7.3],[-73.7,-6.9],[-73.1,-6.6],[-73.2,-6.1],[-73,-5.7],[-72.9,-5.3],[-71.7,-4.6],[-70.9,-4.4],[-70.8,-4.3],[-69.9,-4.3],[-69.4,-1.6],[-69.4,-1.1],[-69.6,-0.5],[-70,-0.2],[-70,0.5],[-69.5,0.7],[-69.3,0.6],[-69.2,1],[-69.8,1.1],[-69.8,1.7],[-67.9,1.7],[-67.5,2],[-67.3,1.7],[-67.1,1.1],[-66.9,1.3],[-66.3,0.7],[-65.5,0.8],[-65.4,1.1],[-64.6,1.3],[-64.2,1.5],[-64.1,1.9],[-63.4,2.2],[-63.4,2.4],[-64.3,2.5],[-64.4,3.1],[-64.4,3.8],[-64.8,4.1],[-64.6,4.1],[-63.9,4],[-63.1,3.8],[-62.8,4],[-62.1,4.2],[-61,4.5],[-60.6,4.9],[-60.7,5.2],[-60.2,5.2],[-60,5],[-60.1,4.6],[-59.8,4.4],[-59.5,4],[-59.8,3.6],[-60,2.8],[-59.7,2.2],[-59.6,1.8],[-59,1.3],[-58.5,1.3],[-58.4,1.5],[-58.1,1.5],[-57.7,1.7],[-57.3,1.9],[-56.8,1.9],[-56.5,1.9],[-56,1.8],[-55.9,2],[-56.1,2.2],[-56,2.5],[-55.6,2.4],[-55.1,2.5],[-54.5,2.3],[-54.1,2.1],[-53.8,2.4],[-53.6,2.3],[-53.4,2.1],[-52.9,2.1],[-52.6,2.5],[-52.2,3.2],[-51.7,4.2],[-51.3,4.2],[-51.1,3.6],[-50.5,1.9],[-50,1.7],[-49.9,1],[-50.7,0.2],[-50.4,-0.1],[-48.6,-0.2],[-48.6,-1.2],[-47.8,-0.6],[-46.6,-0.9],[-44.9,-1.6],[-44.4,-2.1],[-44.6,-2.7],[-43.4,-2.4],[-41.5,-2.9],[-40,-2.9],[-38.5,-3.7],[-37.2,-4.8],[-36.5,-5.1],[-35.6,-5.1],[-35.2,-5.5],[-34.9,-6.7],[-34.7,-7.3],[-35.1,-9],[-35.6,-9.6],[-37,-11],[-37.7,-12.2],[-38.4,-13],[-38.7,-13.1],[-39,-13.8],[-38.9,-15.7],[-39.2,-17.2],[-39.3,-17.9],[-39.6,-18.3],[-39.8,-19.6],[-40.8,-20.9],[-40.9,-21.9],[-41.8,-22.4],[-42,-23],[-43.1,-23],[-44.6,-23.4],[-45.4,-23.8],[-46.5,-24.1],[-47.6,-24.9],[-48.5,-25.9],[-48.6,-26.6],[-48.5,-27.2],[-48.7,-28.2],[-48.9,-28.7],[-49.6,-29.2],[-50.7,-31],[-51.6,-31.8],[-52.3,-32.2],[-52.7,-33.2],[-53.4,-33.8]];
const proj=(lon,lat)=>[Math.round((lon+74.5)*14*10)/10, Math.round((5.8-lat)*14*10)/10];
const BASE={regional:[12000,350],nacional:[40000,900],global:[90000,2000]};
const custoAbrir=C=>Math.round(BASE[C.nivel][0]*C.fator*(.6+C.pop*.15)/500)*500;
const aluguel=C=>Math.round(BASE[C.nivel][1]*C.fator*(.6+C.pop*.15)/50)*50;
for(const k in CIDADES) CIDADES[k].nivel='nacional';
// mapa regional: coordenadas esquemáticas 0–100, estilo mapa de metrô
const BAI=(parent,nome,sx,sy,pop,fator,req,areas,lbl='r',extra={})=>({parent,nome,sx,sy,pop,fator,req,areas,lbl,nivel:'regional',...extra});
const BAIRROS={
  'sp:centro':BAI('sp','Centro · Sé',50,42,3,1.0,0,{penal:3,civel:3,familia:2,trabalho:2,empresarial:1},'r',{centro:true,nota:'Fórum João Mendes. Fica coberto pelo escritório da cidade.'}),
  'sp:paulista':BAI('sp','Av. Paulista',44,58,3,1.3,15,{empresarial:3,civel:3,trabalho:2,familia:1,penal:1},'r'),
  'sp:farialima':BAI('sp','Faria Lima · Itaim',30,70,3,1.8,25,{empresarial:3,civel:2,trabalho:1,familia:1,penal:1},'l',{rarBonus:4,nota:'Centro financeiro: fusões, bancos e causas milionárias.'}),
  'sp:barrafunda':BAI('sp','Barra Funda',32,34,2,.9,0,{penal:3,trabalho:3,civel:1,familia:1,empresarial:1},'l',{nota:'Fórum Criminal e Tribunal do Trabalho ao lado.'}),
  'sp:tatuape':BAI('sp','Tatuapé · Zona Leste',66,30,3,.7,0,{familia:3,trabalho:3,civel:2,penal:2,empresarial:1},'r'),
  'sp:santoamaro':BAI('sp','Santo Amaro · Zona Sul',34,90,3,.8,5,{trabalho:3,familia:2,civel:2,penal:1,empresarial:1},'r'),
  'sp:abc':BAI('sp','ABC Paulista',72,78,3,.9,5,{trabalho:3,empresarial:2,civel:2,familia:1,penal:1},'r',{nota:'Polo industrial e sindical.'}),
  'sp:guarulhos':BAI('sp','Guarulhos',78,8,2,.8,0,{civel:2,trabalho:2,penal:2,familia:2,empresarial:1},'r',{nota:'Aeroporto internacional: muitas causas de consumo.'}),
  'sp:campinas':BAI('sp','Campinas',6,10,3,1.0,10,{empresarial:2,civel:2,trabalho:2,familia:2,penal:1},'r',{nota:'Tecnologia e universidades.'}),
  'rj:centro':BAI('rj','Centro',58,36,3,1.0,0,{penal:3,civel:3,empresarial:2,trabalho:2,familia:1},'t',{centro:true,nota:'Fórum Central do Tribunal de Justiça. Fica coberto pelo escritório da cidade.'}),
  'rj:zonasul':BAI('rj','Copacabana · Ipanema',64,68,3,1.4,12,{familia:3,civel:3,empresarial:1,trabalho:1,penal:1},'r'),
  'rj:barra':BAI('rj','Barra da Tijuca',30,86,3,1.5,15,{familia:3,empresarial:2,civel:2,trabalho:1,penal:1},'l',{rarBonus:2,nota:'Condomínios de alto padrão e novos centros empresariais.'}),
  'rj:tijuca':BAI('rj','Tijuca',42,46,2,.9,0,{civel:2,familia:2,trabalho:2,penal:1,empresarial:1},'b'),
  'rj:madureira':BAI('rj','Madureira · Zona Norte',22,44,3,.7,0,{trabalho:3,familia:3,penal:2,civel:1,empresarial:1},'b'),
  'rj:niteroi':BAI('rj','Niterói',90,40,2,1.0,8,{civel:2,familia:2,empresarial:1,trabalho:1,penal:1},'b'),
  'rj:caxias':BAI('rj','Duque de Caxias',26,10,3,.75,0,{trabalho:3,penal:2,civel:1,familia:1,empresarial:1},'r',{nota:'Refinaria e polo petroquímico.'}),
  'rj:novaiguacu':BAI('rj','Nova Iguaçu',6,20,3,.7,0,{familia:3,trabalho:2,penal:2,civel:1,empresarial:1},'b'),
};
const GLO=(nome,pais,lon,lat,pop,fator,req,sistema,areas,lbl='r',nota='')=>({nome,pais,lon,lat,pop,fator,req,sistema,areas,lbl,nota,nivel:'global'});
const GLOBAL={
  nyc:GLO('Nova York','EUA',-74,40.7,5,3.0,50,'common',{empresarial:3,penal:2,civel:2,trabalho:1,familia:1},'r','Wall Street: o maior mercado jurídico do mundo, com júri frequente.'),
  lon:{...GLO('Londres','Inglaterra',-.13,51.5,5,2.6,55,'common',{empresarial:3,civel:2,penal:2,familia:1,trabalho:1},'l','Arbitragens e disputas comerciais internacionais.'),wdx:-6,wdy:-10},
  par:{...GLO('Paris','França',2.35,48.86,5,2.2,50,'civil',{empresarial:3,civel:2,penal:2,familia:2,trabalho:1},'r'),wdx:8,wdy:2},
  mil:{...GLO('Milão','Itália',9.19,45.46,4,1.9,45,'civil',{empresarial:3,trabalho:2,civel:2,familia:1,penal:1},'b','Capital financeira e da moda da Itália.'),wdx:6,wdy:12},
  lis:GLO('Lisboa','Portugal',-9.14,38.72,3,1.3,40,'civil',{civel:3,familia:2,empresarial:2,trabalho:2,penal:1},'l','Mesma língua: a porta de entrada mais barata na Europa.'),
};
const LOC={...CIDADES,...BAIRROS,...GLOBAL};
const TRIB={sp:3,rj:2,bh:2,df:3,gyn:2,ssa:1,rec:1,for:1,bel:1,mao:3,cwb:2,fln:1,poa:2,'sp:farialima':3,'sp:paulista':2,'sp:centro':2,'rj:centro':2,'rj:barra':2,nyc:2,lon:2,par:2,mil:2,lis:2};
for(const k in LOC) LOC[k].areas.tributario=TRIB[k]||1;
// máscara de terra do mundo (grade de 2°, RLE base 36 por linha)
const WORLD=["1d.8.b.a.2u","17.1.1.b.2.p.1i.1.16","11.2.4.3.1.5.4.o.g.5.11.4.12","u.2.a.1.2.5.4.r.h.1.16.2.11","y.3.3.1.1.1.1.6.b.j.12.2.d.d.d.3.1.2.f","s.3.1.1.3.1.3.1.1.2.1.4.1.2.a.h.11.2.c.l.1.2.q","0.1.a.2.f.1.2.7.4.2.2.8.a.d.1.1.n.2.d.1.5.3.1.1g.1","8.2j.9.c.3.1.2.1.1b.1.5","3.2m.e.1.1.1.c.1.1h","0.2.2.2k.5.2.4.1.1.1.1y","8.11.9.2.1.1.7.4.p.5.2.27","7.7.1.s.8.4.b.3.o.6.2.1v.2.1.1.4.4","9.4.8.m.8.4.2.1.z.6.3.1n.5.1.3.1.9","b.1.b.m.7.7.s.2.5.1.1.2.3.1m.9.4.8","8.1.g.o.2.a.p.3.5.1.5.1m.a.3.9","p.o.2.b.n.2.1.2.2.1y.6.1.b","q.10.q.2.1.1x.1.1.i","r.1.1.r.1.1.3.2.q.1z.1.1.i","s.u.5.1.p.1y.2.1.i","s.s.1.2.u.7.1.8.2.1.1.5.2.16.m","s.r.u.7.3.2.2.5.6.4.2.15.3.2.i","s.q.w.4.4.1.2.2.1.4.1.a.2.12.5.1.j","s.o.x.5.8.1.1.2.1.c.2.w.4.1.6.1.j","t.n.z.2.4.3.1.1.6.b.2.y.2.2.3.2.k","u.m.z.8.7.1.3.1.1.16.3.1.2.4.k","v.j.10.a.c.16.5.2.n","w.h.10.e.1.4.1.1a.t","y.8.7.1.z.t.1.10.t","x.1.1.6.8.1.x.o.1.7.2.x.u","y.1.1.5.16.o.2.7.1.1.5.r.u","11.4.7.2.w.q.1.b.5.n.2.1.t","11.4.4.2.4.1.t.s.1.9.6.9.2.8.10","12.4.2.2.8.1.r.r.2.8.7.6.5.6.1.1.z","14.6.10.r.2.6.a.4.6.7.6.1.t","18.4.x.t.1.4.c.3.9.5.6.1.t","1a.2.y.t.1.1.e.3.9.6.5.1.t","1b.1.4.4.q.u.2.2.c.2.9.1.2.2.8.1.r","1c.1.1.1.1.8.n.w.d.1.1.1.8.1.2.1.11","1f.a.n.v.f.1.l.1.r","1f.d.l.2.1.1.4.l.o.1.1.2.5.2.v","1f.e.u.i.q.1.1.1.4.3.v","1e.f.u.h.r.2.4.4.1.1.t","1e.h.r.h.t.2.3.4.6.2.n","1e.k.p.f.v.2.2.3.1.2.3.1.1.1.1.3.j","1d.n.o.e.w.1.8.1.7.4.h","1e.n.n.e.x.3.d.5.4.1.b","1f.l.o.e.12.1.3.1.7.2.1.1.6.1.9","1f.k.q.d.1y","1g.j.p.e.4.1.14.3.3.1.i","1g.j.p.e.4.1.11.6.3.2.a.1.6","1i.g.q.d.3.3.10.8.2.2.h","1j.f.q.c.4.3.10.c.h","1j.f.r.b.4.2.y.h.7.1.7","1j.d.t.b.4.2.x.i.f","1j.b.v.a.5.1.y.j.e","1j.b.w.8.15.k.d","1i.b.x.8.15.k.d","1i.b.y.6.17.j.d","1i.a.z.5.18.4.5.9.e","1i.7.2f.1.a.6.b.1.3","1h.9.2q.5.c.1.2","1h.6.3a.2.1","1h.4.1.1.2v.2.c.2.2","1i.4.2x.1.b.2.3","1h.4.39.2.4","1h.4.3f","1g.4.1w.1.1j","1g.3.3h","1h.3.3g","1i.2.3g","50"];
const BLOCOS = 21, CUSTO_SEMANA = 1800, MAX_CASOS = 5, META_PREST = 60;

