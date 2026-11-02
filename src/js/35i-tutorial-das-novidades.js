// ===================== TUTORIAL DAS NOVIDADES =====================
// passos extras no fim das trilhas do tutorial: audiência ao vivo, pré-audiência, jornal, metas e Habilidades VIP
const TUT_AUDIENCIA={txt:'Cada caso escolhe como vai à <b>audiência</b>: <b>Ao vivo</b> (você conduz uma partida de 60 minutos), <b>Rápida</b> (a balança de sempre) ou <b>Enviar</b> alguém da equipe, que usa a skill dele no caso. Cabem 3 audiências ao vivo por mês.',alvo:'.modo-aud',man:true};
const TUT_AO_VIVO={txt:'Na audiência ao vivo: escolha as testemunhas na pré-audiência, leia a postura da outra parte (cautelosa vence agressiva, agressiva vence equilibrada, equilibrada vence cautelosa), sonde quem julga para descobrir o que ele valoriza e use os trunfos na fase certa.',alvo:'.modo-aud',man:true};
const TUT_JORNAL={txt:'Todo mês sai a <b>Gazeta Forense</b>: viradas, rivais, promoções e as suas colunas de opinião viram notícia, e a manchete rende prestígio. Abra a aba <b>Jornal</b>.',alvo:'[data-act=view][data-v=jornal]',ok:t=>!!t.viu.jornal};
const TUT_METAS={txt:'As <b>metas</b> de 24 meses ficam no painel da esquerda e dão recompensa quando cumpridas. Na aba <b>Conquistas</b>, as <b>Habilidades VIP</b> mostram bônus que você desbloqueia jogando e leva para as próximas partidas.',alvo:'.meta-it',man:true};
TUT.adv.push(TUT_AUDIENCIA,TUT_AO_VIVO,TUT_JORNAL,TUT_METAS);
TUT.pub.push(
  {txt:'O <b>expediente</b> (rotina da unidade que não é caso) é coberto primeiro pela equipe; o que sobra sai da sua agenda e aumenta o estresse. Com a equipe cobrindo tudo, você ganha +0,5 de reputação por mês.',alvo:'.rows',man:true},
  {txt:'Casos raros ou maiores podem ir <b>ao vivo</b>: o promotor e o defensor conduzem a partida; o juiz preside e investiga quem tem razão, e nos tribunais vota em colegiado tentando formar maioria. Cabem 3 por mês; os outros vão pela equipe ou pelo gabinete.',alvo:'.modo-aud',man:true},
  TUT_JORNAL,TUT_METAS);
