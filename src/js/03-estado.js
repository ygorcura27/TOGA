// ===================== ESTADO =====================
let S=null;
function novoJogo(nome,espec,traits,sede='sp'){
  const skills={}; for(const k in SKILLS) skills[k]=25;
  for(const a in AREAS) skills[a]=20;
  skills[espec]=35;
  S={nome,espec,traits,carreira:'adv',sede,filiais:[],semana:1,caixa:20000,prest:20,energia:80,estresse:20,integ:80,
    skills,teses:[],casos:[],ofertas:[],agenda:{estudo:0,estudoSkill:espec,lazer:0,familia:0,saude:0,curso:0,pesquisa:0,docencia:0},
    disp:BLOCOS,log:[],vitorias:0,derrotas:0,metaAtingida:false,mesV:1,fim:null,aReceber:0};
  S.u=estruturaInicial(false); S.bolso=3000; S.vida=vidaInicial(); S.ac=acadInicial(); criarColegas();
  gerarOfertas(); addLog('Você abriu a sua sala. Escolha os primeiros casos e monte a agenda do mês.');
}
function addLog(t,k=''){S.log.unshift({w:S.semana,t,k}); S.log=S.log.slice(0,60);}
function salvar(){ if(S) S.salvoEm=Date.now(); try{localStorage.setItem('toga-proto',JSON.stringify(S));}catch(e){} if(window.TOGA_ONLINE) window.TOGA_ONLINE.salvar(S); }
function carregar(){try{const r=localStorage.getItem('toga-proto'); return r?JSON.parse(r):null;}catch(e){return null;}}

