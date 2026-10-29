// ===================== TUTORIAL GUIADO =====================
// cartão-guia não bloqueante nos primeiros meses; cada passo conclui sozinho quando o jogador faz a ação, ou com "Entendi"
const TUT={
  fac:[
    {txt:'Bem-vindo à faculdade! A sua mês tem <b>21 blocos</b> de tempo (7 dias × 3 turnos). Mantenha pelo menos <b>4 blocos em Aulas</b>: menos que isso em 3 meses do semestre reprova por falta.',alvo:'[data-act=inc][data-k=aulas]',man:true},
    {txt:'Escolha uma área no <b>Estudo extra</b> e coloque blocos. Estudar sobe a skill e cada área tem estrelas: estudando sozinho você chega a 3★; especialização libera a 4ª e mestrado a 5ª.',alvo:'#estudo-skill',ok:()=>S.agenda.estudo>0},
    {txt:'Fique de olho na <b>energia</b> e no <b>estresse</b> no topo da tela. Blocos livres viram descanso; lazer baixa o estresse. Com energia baixa ou estresse alto, tudo rende menos.',alvo:'header.top',man:true},
    {txt:'Tudo pronto: clique em <b>Encerrar mês</b>. O semestre tem 5 meses e a nota depende dos blocos de aula, da sua Análise e da sua Escrita.',alvo:'[data-act=fimSemana]',ok:t=>S.semana>t.ini},
    {txt:'Abra a aba <b>Vida</b>: saúde, felicidade, namoro, moradia e os seus colegas da faculdade (dois amigos e dois rivais que vão cruzar o seu caminho na carreira).',alvo:'[data-act=view][data-v=vida]',ok:t=>!!t.viu.vida},
    {txt:'Do 3º semestre em diante abrem o <b>estágio</b> (bolsa e contatos na carreira) e a <b>iniciação científica</b> (seu primeiro artigo). No fim do curso vem o <b>Exame da OAB</b>. Boa faculdade!',alvo:'[data-act=facEstagio]',man:true},
  ],
  adv:[
    {txt:'Você abriu o seu escritório! À direita estão os <b>casos novos do mês</b>. Cada pasta mostra a dificuldade, a sua skill e a <b>chance de vitória</b>. Aceite um caso que você consiga ganhar.',alvo:'[data-act=aceitar]',ok:()=>S.casos.length>0||S.vitorias+S.derrotas>0},
    {txt:'Agora prepare o caso: coloque <b>blocos na agenda</b> na linha do caso. Cada caso consome <b>blocos de manutenção</b> por mês (prazos e petições: 1 num caso comum, até 4 num lendário); faltar gera atraso e derruba a chance. O que passar da manutenção vira preparação.',alvo:'[data-act=inc][data-k=case]',ok:()=>S.casos.some(c=>(c.semana||0)+(c.prep||0)>0)||S.vitorias+S.derrotas>0},
    {txt:'Na pasta, a <b>estratégia</b> (conservadora, equilibrada, agressiva ou acordo) e os <b>apoios</b> (pesquisa, perito, parecer…) mudam a chance. Abra <b>Ver detalhes da chance</b> para ver cada bônus.',alvo:'.cases .folder details',man:true},
    {txt:'Na vitória você recebe <b>20% do valor da causa</b> e prestígio; na derrota, só perde prestígio. Quem perde pode <b>recorrer</b>, e os recursos aparecem separados por tribunal. Encerre o mês quando estiver pronto.',alvo:'[data-act=fimSemana]',ok:t=>S.semana>t.ini},
    {txt:'Os honorários entram no <b>caixa do escritório</b>, que paga aluguel e salários; todo mês você saca a sua <b>retirada</b> na hora, no valor que quiser. Em <b>Estrutura e equipe</b> você monta salas e contrata. Sozinho você atende só 3 casos: cada advogado contratado aumenta o limite em 1, traz clientes e dá blocos; casos épicos e lendários exigem advogados na equipe. O escritório só recebe casos da sua área: em <b>Áreas de atuação</b> você abre outras quando tiver um advogado pleno com 3★ nelas.',alvo:'[data-act=view][data-v=estrutura]',ok:t=>!!t.viu.estrutura},
    {txt:'Nos mapas <b>Região, Brasil e Mundo</b> você abre filiais quando tiver prestígio: mais casos, casos maiores e o limite de casos ativos sobe.',alvo:'[data-act=view][data-v=regiao]',man:true},
    {txt:'Por último: a faixa <b>Brasil agora</b> avisa de crises e de leis em votação (uma reforma aprovada derruba parte da skill da área). A aba <b>Conquistas</b> guarda as metas de longo prazo. Boa advocacia!',alvo:'[data-act=view][data-v=conquistas]',man:true},
  ],
  pub:[
    {txt:'Você tomou posse! Todo mês chegam processos para o seu gabinete. Distribua os <b>blocos da agenda</b> entre eles: cada bloco é trabalho feito, e a equipe soma blocos extras.',alvo:'.rows',man:true},
    {txt:'O painel de <b>carreira</b> mostra os requisitos de promoção: prestígio, produção e qualidade das decisões. Promoções aumentam o salário, o gabinete e o tipo de processo.',alvo:'.panel .meta',man:true},
    {txt:'Em <b>Estrutura e equipe</b>, o orçamento do gabinete vem do <b>índice de efetividade</b>: concluir mais do que chega aumenta o dinheiro para contratar.',alvo:'[data-act=view][data-v=estrutura]',ok:t=>!!t.viu.estrutura},
    {txt:'Quando estiver pronto, <b>encerre o mês</b>. Cuide também da aba <b>Vida</b>: saúde, família e patrimônio contam até o fim da carreira.',alvo:'[data-act=fimSemana]',ok:t=>S.semana>t.ini},
  ],
  acad:[
    {txt:'Bem-vindo à academia! Aqui a renda vem de <b>bolsa, aulas, livros e palestras</b>. Matricule-se num mestrado ou comece um projeto de pesquisa.',alvo:'.panel',man:true},
    {txt:'Mestrado e doutorado na área liberam a <b>5ª estrela</b> nela. Artigos sobem o índice de produção; livros vendem e pagam direitos autorais.',alvo:'.panel',man:true},
    {txt:'Distribua os blocos entre curso, pesquisa e docência e <b>encerre o mês</b>.',alvo:'[data-act=fimSemana]',ok:t=>S.semana>t.ini},
  ],
};
const trilhaTut=()=>S.carreira==='estudante'?'fac':S.carreira==='adv'?'adv':S.carreira==='academico'?'acad':'pub';
function tutEstado(){ if(!S) return null; const U=S.tut||(S.tut={off:false,t:{}}); if(U.off) return null;
  const k=trilhaTut(), t=U.t[k]||(U.t[k]={i:0,ini:S.semana,viu:{}}); if(t.i>=TUT[k].length) return null; return {k,t,p:TUT[k][t.i],n:TUT[k].length}; }
function tutAvancar(){ const e=tutEstado(); if(!e) return false; let mudou=false;
  while(e.t.i<TUT[e.k].length){ const p=TUT[e.k][e.t.i]; if(p.man||!p.ok(e.t)) break; e.t.i++; e.t.ini=S.semana; mudou=true; }
  return mudou; }
function tutHtml(){ const e=tutEstado(); if(!e) return '';
  return `<div class="tut"><div class="tut-top"><span class="label">Tutorial · ${e.t.i+1} de ${e.n}</span><button class="lnk" data-act="tutSair">Pular tutorial</button></div>
    <p>${e.p.txt}</p>${e.p.man?`<button class="btn" data-act="tutOk">Entendi</button>`:'<span class="label">Faça a ação destacada para continuar</span>'}</div>`; }
function tutMarcar(){ document.querySelectorAll('.tut-alvo').forEach(x=>x.classList.remove('tut-alvo')); const e=tutEstado(); if(!e||!e.p.alvo) return;
  const el=document.querySelector(`#app ${e.p.alvo}`)||document.querySelector(e.p.alvo); if(el) el.classList.add('tut-alvo'); }
{ const h1=header; header=function(){ if(S){ const e=tutEstado(); if(e) e.t.viu[view]=1; tutAvancar(); } return h1()+tutHtml(); }; }
{ const r1=render; render=function(){ r1(); tutMarcar(); }; }

