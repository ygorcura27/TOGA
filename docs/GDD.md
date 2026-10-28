# TOGA: Uma vida no Direito

> **Documento de design (GDD)**, atualizado para refletir o protótipo jogável (`index.html`).
> As seções 1 a 13 descrevem o que **já está implementado**, com os números usados no código. A seção 14 reúne o que ainda é **visão de produto**: ideias do design original que o protótipo não cobre.
> Título internacional pensado: **TOGA: A Life in Law**. Inspiração de partida: **MetroSystem** (o mapa como tabuleiro e a rede que cresce).

---

## 0. Pitch e pilares

> **"Da primeira aula de Direito até o Supremo, ou até um escritório com bandeira em outro continente. E depois, o seu filho."**

Você entra na faculdade de Direito aos 18 anos (ou começa já formado), passa na OAB ou num concurso e segue uma carreira: **advocacia, magistratura, Ministério Público, Defensoria ou academia**. Cada caso é uma aposta com a chance na tela: **skill × dificuldade × chance de vitória**. Fora do tribunal, você cuida da saúde, do namoro, dos filhos, da casa, dos investimentos e dos colegas da faculdade. Quando a vida acaba, um filho pode continuar a dinastia.

**Pilares**
1. **Fácil de começar, difícil de largar.** Cada sistema é raso sozinho, mas todos se conectam.
2. **A chance sempre visível e explicada.** Nenhum resultado é surpresa matemática: o jogador vê cada bônus e cada penalidade antes de agir.
3. **Tempo é a moeda real.** A agenda de 21 blocos por semana força a escolha entre carreira e vida.
4. **Microgestão no começo, delegação no topo.** No início você faz tudo; depois contrata, escolhe gestor e organiza a equipe.
5. **Metas longas.** Promoções, filiais, títulos acadêmicos, família, conquistas e o Hall da Fama dão motivo para "só mais uma semana" e "só mais uma geração".

---

## 1. Os três loops

```
LOOP CURTO · um CASO
  Oferta → ver a CHANCE → preparar (blocos, apoios, estratégia) → audiência
  (reviravolta, momento decisivo) → VEREDITO → honorários/reputação → recurso?

LOOP MÉDIO · uma SEMANA
  Planejar a agenda (21 blocos) → aceitar casos → fim de semana: audiências,
  acordos, finanças, equipe, academia, vida pessoal, amigos → eventos e escolhas

LOOP LONGO · uma VIDA (10 semanas = 1 ano de idade)
  Faculdade → OAB/concurso → carreira e promoções → escritório e filiais
  → família, patrimônio, títulos → aposentadoria/morte → HERDEIRO
```

---

## 2. Início de jogo

### 2.1 Tela inicial
- **Gênero** (primeiro campo), **nome**, **ponto de partida** (faculdade aos 18 anos, recomendado, ou já formado), **faculdade**, **carreira** (se já formado), **área de especialização** (+15 na skill; para juízes, define a vara) e **cidade da sede ou comarca**.
- **Traços (escolha 2):**

| Traço | Efeito |
|---|---|
| Orador nato | +5 em casos com júri; +8 de Oratória nos momentos decisivos |
| Rato de biblioteca | Estudo rende 50% mais |
| Ansioso | −5 em casos épicos e lendários; estresse sobe 25% mais rápido |
| Carismático | +10 na chance de acordo |
| Workaholic | Trabalho gasta 30% menos energia |
| Sortudo | +3 de chance em todo caso |

- Abaixo do formulário aparece o **Hall da Fama** (seção 12), quando já houver vidas registradas.

### 2.2 Faculdade (modo estudante)
| Faculdade | Mensalidade/semana | Observação |
|---|---|---|
| Universidade pública | grátis | exige vestibular (45% de base), +8 de prestígio, mais difícil |
| Particular de ponta | R$ 700 | +6 de prestígio |
| Particular | R$ 300 | mais fácil, sem prestígio extra |

- **10 semestres** com notas, **CR**, controle de frequência e uma **mesada** de R$ 500 por semana.
- **Estágio** com bolsa por bloco: escritório (R$ 90), gabinete de juiz (R$ 60), Ministério Público (R$ 60) ou Defensoria (R$ 50). O estágio gera **contatos** na carreira correspondente.
- **Iniciação científica**: a cada 25 pontos de progresso sai um artigo B2.
- **Núcleo de prática** e o **Exame da OAB** no fim do curso. Depois da formatura, o jogador escolhe a carreira, inclusive a **carreira acadêmica**.
- Na faculdade nascem os **colegas** (seção 10): dois amigos e dois rivais.

---

## 3. Casos: skill × dificuldade × chance

### 3.1 Raridade
| Raridade | Dificuldade | Reputação (vitória / derrota) | Chance de a outra parte recorrer | Prazo (semanas) | XP |
|---|---|---|---|---|---|
| Comum | 10–30 | +1 / −2 | 15% | 2–3 | ×1 |
| Incomum | 25–45 | +2 / −3 | 30% | 3–4 | ×1,3 |
| Raro | 40–65 | +3 / −5 | 45% | 4–6 | ×1,6 |
| Épico | 60–85 | +4 / −7 | 60% | 6–8 | ×2 |
| Lendário | 80–100 | +6 / −10 | 80% | 8–10 | ×2,5 |

- A raridade sorteada depende do prestígio e do número de filiais. Casos lendários só aparecem com prestígio a partir de 65.
- **Valor da causa** = 5.000 × 1,1^dificuldade × (0,8 a 1,2) × fator da cidade. Ele cresce exponencialmente com a dificuldade.
- **Honorários: sempre 20% do valor da causa, pagos só na vitória.** Na derrota, só se perde reputação.
- Os casos vêm de cerca de 50 modelos em 6 áreas (penal, cível, trabalho, família, empresarial e tributário), com a demanda ponderada pela cidade.

### 3.2 A chance
```
chance = sigmoide((skill do caso + soma dos bônus − dificuldade) / 12), limitada a 5%–95%
```
- **Skill do caso** é a média ponderada das skills que a área exige.
- **Bônus visíveis na ficha:**

| Fonte | Efeito |
|---|---|
| Preparação | Σ max(0, 6 − i) por bloco, com retorno decrescente; juiz impaciente reduz para 60% |
| Apoios | pesquisa de jurisprudência +5 (2 blocos), preparar testemunha +5 (1 bloco), perito +8 (custo de 0,5% da causa), parecer de jurista +10 (1%), correspondente local +10 (só fora da sede), **atalho antiético +20** (risco de ser descoberto) |
| Estratégia | conservadora +15 (reputação ×0,5 na vitória), equilibrada, agressiva −15 (reputação ×2 na vitória e ×1,5 na derrota), buscar acordo (20% de honorários sobre 50%–80% da causa) |
| Prestígio | (prestígio − 50) / 10 |
| Juiz | rigoroso −5, garantista +5 para a defesa no penal, formalista ±5 conforme a Escrita, pragmático +10 no acordo |
| Estado pessoal | energia abaixo de 30: −10; estresse acima de 70: −8; felicidade acima de 80: +3; parceiro da área jurídica: +2 |
| Distância | −10 se não houver escritório na cidade do caso |
| Teses | 3 teses por área (+5 a +10), ganhas ao vencer casos raros ou melhores; valem as 3 melhores da área (4 com Pesquisa nível 2) |
| Estrutura e equipe | organização, qualidade da equipe e biblioteca (+2) |
| Colegas | um juiz amigo ou rival no caso, ou um advogado rival do outro lado |
| Instância | −10 por instância acima da 1ª e ±10 conforme a decisão anterior |

- O **júri** comprime a chance em direção a 50%.

### 3.3 Fluxo do caso
1. **Oferta:** 3 casos novos por semana, +1 por filial, +1 com recepção, além de indicações de amigos. Limite de 5 casos ativos, +1 por filial.
2. **Preparação** ao longo das semanas, com os blocos da agenda e da equipe.
3. **Antecipar audiência:** encerrar antes do prazo com a preparação acumulada até ali.
4. **Audiência:**
   - 30% de chance de uma **reviravolta**;
   - um **momento decisivo**, em que o jogador escolhe entre opções com chance própria (Oratória, Análise, Negociação…);
   - a **rolagem** com a animação da balança.
5. **Resultado:**
   - vitória **histórica**: 15% da faixa de vitória, com reputação em dobro;
   - vitória;
   - derrota;
   - derrota **feia**: 5% piores rolagens, quando a chance era menor que 50%, com perda de reputação ×1,5.
6. **Recurso:** quem perde **pode** recorrer, nunca automaticamente, e a chance de sucesso aparece antes da decisão. O recurso sobe pela 1ª instância, Tribunal, Tribunal Superior e **STF**.

### 3.4 O mesmo sistema em todas as carreiras
- **Juiz:** julga um **acervo** de processos da sua vara. A taxa de reforma das sentenças nas instâncias superiores conta para a promoção.
- **Promotor:** denuncia, arquiva ou propõe acordo. As condenações e a taxa de acerto contam.
- **Defensor:** atende, defende e consegue solturas. Os atendimentos e a taxa de vitória contam.

---

## 4. Skills

- **Áreas:** penal, cível, trabalho, família, empresarial e tributário.
- **Habilidades transversais:**

| Skill | Onde pesa |
|---|---|
| Oratória | júri, momentos decisivos, palestras |
| Escrita | peças, juiz formalista, livros, sentenças |
| Pesquisa | teses, artigos, mestrado e doutorado |
| Negociação | acordos, transações penais, honorários |
| Análise | provas, momentos decisivos, triagem de processos |
| Didática | aulas, formação da equipe (+5 na qualidade dos candidatos no nível 3) |

- As skills sobem com o uso: o XP de cada caso é ponderado pela raridade e desacelera perto de 100. Também sobem com estudo, faculdade, pós-graduação e eventos.
- **Habilidades transversais** têm 3 níveis (40 · 60 · 80), cada um com um efeito próprio.
- **Áreas do direito têm 5 estrelas** (40 · 55 · 70 · 82 · 92), e o teto depende do título **naquela área**:

| Formação na área | Teto da skill | Estrelas possíveis |
|---|---|---|
| Só estudo e prática | 81 | 3★ |
| Especialização | 91 | 4★ |
| Mestrado ou doutorado | 100 | 5★ |

- **Efeito das estrelas:**
  - 1★: mais casos da área;
  - 2★: +2 em casos da área;
  - 3★: +4 (especialista);
  - 4★: +8 e ainda mais casos (referência);
  - 5★: +12 e mais casos épicos e lendários da área (autoridade).

---

## 4A. Época: crises e reformas da lei

### 4A.1 Crises e ciclos
- Os eventos sorteiam toda semana e duram meses.
- Só existe uma época econômica por vez: recessão ou boom.

| Época | Chance/sem | Duração | Efeito |
|---|---|---|---|
| Recessão econômica | 1,2% | 20–40 sem | empresarial ×1,6 e trabalho ×1,5 em demanda; causas −15%; ações −20% |
| Boom econômico | 0,9% | 20–30 sem | empresarial ×1,4 e tributário ×1,25; causas +15%; ações +12% |
| Pandemia | 0,25% | 15–25 sem | audiências virtuais (sem penalidade de distância); família ×1,6, cível ×1,2, trabalho ×1,3; saúde −0,4/sem |
| Grande operação anticorrupção | 0,7% | 20–40 sem | penal ×1,7; causas +10% |

### 4A.2 Reformas da lei
- **Janela legislativa:** cada reforma tem uma janela a cada 4 ou 8 anos.
  - Na janela, o projeto entra em pauta com 60% de chance. Não é certo.
  - A votação acontece 1 ano depois, com a chance de aprovação visível (40%–80%).
- **Reformas e perda de skill:**

| Reforma | Área | Ciclo | Perda se aprovada |
|---|---|---|---|
| Novo Código de Processo Civil | cível | 8 anos | 15% |
| Reforma do Código Civil | cível | 8 anos | 12% |
| Reforma Tributária | tributário | 8 anos | 20% |
| Reforma Trabalhista | trabalho | 8 anos | 18% |
| Pacote Anticrime | penal | 4 anos | 10% |
| Novo Código de Processo Penal | penal | 8 anos | 15% |
| Nova Lei de Falências e Recuperação Judicial | empresarial | 8 anos | 14% |
| Marco Legal da Inteligência Artificial | empresarial | 4 anos | 8% |
| Estatuto das Famílias | família | 8 anos | 12% |

- **Se a reforma for aprovada:**
  - a skill da área cai o percentual indicado, e você pode perder estrelas;
  - curso de atualização: o estudo da área rende o dobro por 20 semanas;
  - onda de processos: +60% de casos da área por 30 semanas.
- **Faixa "Brasil agora":** fica abaixo do cabeçalho e mostra as crises ativas, os projetos em votação e as atualizações em curso.

## 5. Carreiras

### 5.1 Advocacia
- **Escritório próprio:** honorários entram no **caixa do escritório**, que paga aluguel, salários e manutenção. O dinheiro **pessoal** é separado.
- **Retirada semanal** opcional do sócio titular.
- **Sócios:**
  - um advogado sênior pode **pedir para virar sócio**;
  - se aceito, passa a receber uma parte do lucro em vez de salário;
  - se recusado, a moral dele cai 35.
- **Fim da carreira por falência:** o caixa abaixo de −R$ 25 mil fecha o escritório.
- **Fim da carreira por reputação:** prestígio zero encerra a carreira.

### 5.2 Magistratura (por vara)
| Cargo | Gabinete | Salário/sem | Requisitos |
|---|---|---|---|
| Juiz Substituto | 3 | R$ 7.500 | concurso |
| Juiz Titular | 6 | R$ 8.500 | prestígio 35, 40 sentenças, reforma ≤ 35% |
| Desembargador | 10 | R$ 10.000 | prestígio 60, 120 sentenças, reforma ≤ 25% |
| Ministro do STJ | 14 | R$ 11.500 | prestígio 85, 250 sentenças, reforma ≤ 20% |
| Ministro do STF | 18 | R$ 13.000 | prestígio 95, 400 sentenças, reforma ≤ 15% |

- **Varas:** criminal, cível, família, empresarial, trabalho e federal tributária. O juiz só recebe processos da própria vara; no STF, julga todas as áreas.
- **Propina:** se a corregedoria descobrir, o juiz é cassado.

### 5.3 Ministério Público
| Cargo | Gabinete | Salário/sem | Requisitos |
|---|---|---|---|
| Promotor Substituto | 2 | R$ 7.300 | concurso |
| Promotor de Justiça | 4 | R$ 8.300 | prestígio 35, 15 condenações, taxa 55% |
| Procurador de Justiça | 7 | R$ 9.800 | prestígio 60, 50 condenações, taxa 60% |
| Procurador-Geral de Justiça | 10 | R$ 11.200 | prestígio 85, 100 condenações, taxa 65% |

### 5.4 Defensoria Pública
| Cargo | Gabinete | Salário/sem | Requisitos |
|---|---|---|---|
| Defensor Público Substituto | 3 | R$ 7.000 | concurso |
| Defensor Público | 5 | R$ 8.000 | prestígio 35, 60 atendimentos, taxa 50% |
| Defensor de Classe Especial | 8 | R$ 9.500 | prestígio 60, 200 atendimentos, taxa 55% |
| Defensor Público-Geral | 10 | R$ 11.000 | prestígio 85, 400 atendimentos, taxa 60% |

### 5.5 Exoneração
- Qualquer cargo público permite **pedir exoneração** e voltar à advocacia.
- Há uma **quarentena** de 12 semanas na antiga comarca, e o prestígio é recalculado.

### 5.6 Carreira acadêmica
- Dedicação exclusiva à pesquisa e à docência. O custo de vida é R$ 650 por semana.
- A renda vem de bolsa, aulas, direitos autorais de livros e palestras (seção 9).

### 5.7 Nomes no feminino
- Todos os cargos se ajustam ao gênero do personagem: Juíza, Promotora, Ministra, Professora Titular etc.

---

## 6. Estrutura física e equipe

### 6.1 Planta em blueprint
- O escritório ou gabinete aparece como uma **planta técnica**, em estilo blueprint, com uma grade de cômodos.
- **Imóveis da advocacia:**

| Imóvel | Grade | Aluguel/sem | Mudança |
|---|---|---|---|
| Sala comercial | 3 × 2 | R$ 900 | — |
| Conjunto comercial | 4 × 3 | R$ 2.400 | R$ 15 mil |
| Andar corporativo | 5 × 4 | R$ 6.000 | R$ 50 mil |

- **Carreira pública:**
  - gabinete no fórum;
  - gabinete ampliado (R$ 30 mil);
  - andar do tribunal (R$ 80 mil, a partir de desembargador ou cargo equivalente).

### 6.2 Cômodos
| Cômodo | Custo | Manutenção/sem | Efeito |
|---|---|---|---|
| Sala do titular | — | — | obrigatória |
| Sala de trabalho | R$ 8.000 | R$ 150 | 3 mesas |
| Recepção | R$ 6.000 | R$ 120 | 1 mesa, +8 de organização, +1 caso por semana |
| Sala de reunião | R$ 7.000 | R$ 100 | +10% em acordos |
| Biblioteca | R$ 9.000 | R$ 120 | +2 de chance em todo caso |
| Arquivo e TI | R$ 10.000 | R$ 200 | +15 de organização |
| Copa | R$ 5.000 | R$ 80 | moral da equipe +3/sem, seu estresse −3 |

### 6.3 Equipe
| Advocacia | Blocos/sem | Salário/sem | | Carreira pública | Blocos/sem | Salário |
|---|---|---|---|---|---|---|
| Estagiário | 2 | R$ 450 | | Estagiário | 2 | R$ 350 |
| Secretária | 0 (+6 org.) | R$ 900 | | Servidor efetivo | 3 (+4 org.) | pago pelo tribunal |
| Advogado júnior | 4 | R$ 1.500 | | Assessor (comissão) | 5 | R$ 2.200 |
| Advogado pleno | 5 | R$ 2.600 | | Chefe de gabinete | 1 + gestão | R$ 2.800 |
| Advogado sênior | 6 | R$ 4.200 | | | | |
| Gestor administrativo | 0 + gestão | R$ 3.200 | | | | |
| Sócio | 7 | parte do lucro | | | | |

- **Atributos de cada pessoa:** qualidade, moral e, para o gestor, habilidade de gestão. O salário pedido acompanha a qualidade.
- **Ações:** contratar (3 candidatos sorteados), demitir, **remover** um servidor efetivo e promover. Na advocacia, a carreira sobe de estagiário para júnior, de júnior para pleno e de pleno para sênior.
- **Organização** vem da secretária, da recepção, do arquivo e do gestor. A **qualidade da equipe** entra como bônus na chance dos casos em que a equipe trabalhou.
- **Lotação pública:** o tribunal cede 1 + nível do cargo servidores efetivos.

### 6.4 Dinheiro
- **Advocacia:** o caixa recebe os honorários e paga salários, aluguel, manutenção e filiais. Há também a retirada do titular e a distribuição de lucro aos sócios.
- **Carreira pública:**
  - o orçamento do gabinete (R$ 4 mil a R$ 15 mil por semana, conforme o cargo) vem do **índice de efetividade**, que mede processos concluídos contra processos novos;
  - com orçamento negativo, há cortes, a moral da equipe cai e a efetividade cai junto;
  - o salário do cargo vai para o dinheiro pessoal.

---

## 7. Mapas e expansão

- **Mapa regional** (São Paulo e Rio): contorno orgânico dividido em distritos (Voronoi), sem linhas de metrô nem círculos.
- **Mapa nacional** (Brasil) e **mapa-múndi.**
- **Filiais:** cada filial exige um prestígio mínimo e paga aluguel. Ela traz +1 caso por semana, +1 de limite de casos e bônus no sorteio de casos raros.
- **Demanda por área** em cada local, tributário incluído.
- Na carreira pública, o mapa mostra a comarca; promoções podem exigir mudança de cidade, o que afeta o parceiro (seção 8.2).

---

## 8. Vida pessoal

### 8.1 Tempo, idade e medidores
- **Agenda semanal de 21 blocos** (7 dias × 3 turnos):
  - casos;
  - estudo;
  - lazer;
  - família;
  - saúde (academia);
  - descanso.
- **Idade:** 10 semanas de jogo equivalem a 1 ano de vida.
- **Medidores:** saúde, felicidade, energia e estresse.
  - felicidade acima de 80 dá +3 nos casos;
  - a saúde cai com a idade e o estresse;
  - saúde baixa traz risco de **doença**, com custo de R$ 5 mil e 2 semanas com menos blocos.

### 8.2 Relacionamento
- **Namoro** só com pessoas do gênero oposto, depois casamento (R$ 30 mil, felicidade +20).
- **Personalidade do parceiro** muda as regras:

| Personalidade | Efeito |
|---|---|
| Ciúme | reclama de semanas com 15 blocos de trabalho ou mais; valoriza cada bloco de família |
| Ambição | gosta do seu prestígio, se irrita quando falta dinheiro, aceita mudar por promoção |
| Vida caseira | precisa de mais família, resiste a mudanças de cidade |
| Espírito aventureiro | lazer conta como tempo juntos, viagens valem o dobro |
| Independência | sente menos a ausência, se apega menos, hesita em ter filhos |
| Gosto por luxo | +R$ 600/sem de custo, valoriza presentes e casa à altura |
| Mesma área (jurídica) | +2 de chance nos casos com a relação boa |

- **Eventos do casal:** aniversário, viagem, presente, briga, pedido de casamento, mudança de cidade e término.

### 8.3 Filhos
- Gravidez, nascimento, nome e gênero.
- A relação com cada filho depende do tempo de família e de eventos como apresentações na escola.
- Um filho adulto, com 22 anos ou mais e relação de pelo menos 40, pode ser **herdeiro**. Se ele estudou Direito, começa com skills melhores.

### 8.4 Bens e financiamento
| Moradia | Preço | Felicidade | | Carro | Preço |
|---|---|---|---|---|---|
| Apartamento alugado | — | 0 | | Transporte público | — |
| Apartamento próprio | R$ 250 mil | +1 | | Carro popular | R$ 60 mil |
| Casa com quintal | R$ 900 mil | +2 | | Sedã executivo | R$ 150 mil |
| Cobertura | R$ 3 milhões | +3 | | SUV de luxo | R$ 400 mil |
| | | | | Esportivo importado | R$ 1,2 milhão |

- **Financiamento pela tabela Price:**
  - **imóvel:** entrada de 20%, prazo de 10, 20 ou 30 anos, juros de 10% ao ano;
  - **carro:** entrada de 30%, prazo de 2, 4 ou 5 anos, juros de 20% ao ano.
- **Aprovação:** o banco aprova parcelas até **35% da renda**.
- **Troca:** o bem atual entra no negócio por 80% do valor (imóvel) ou 70% (carro), descontada a dívida.
- **Inadimplência:** com 3 semanas seguidas de dinheiro pessoal negativo, o banco **retoma o bem**.

### 8.5 Investimentos e imóveis para alugar
- **Renda fixa:** 10% ao ano, sem oscilação.
- **Ações:** 15% ao ano na média, com oscilação forte e crises.
- **Fundos imobiliários:** 9% ao ano em rendimentos semanais, com pouca oscilação.
- **Imóveis para alugar:**
  - opções: kitnet (R$ 180 mil), apartamento de 2 quartos (R$ 400 mil), sala comercial (R$ 650 mil) e loja de rua (R$ 1,2 milhão);
  - rendem 6% ao ano de aluguel bruto;
  - podem ficar **vagos** e o estado de conservação cai com o tempo;
  - dá para reformar ou vender.

### 8.6 Aposentadoria e fim da vida
- **Aposentadoria voluntária:** a partir dos 60 anos.
- **Compulsória:** aos 75 nas carreiras públicas.
- **Morte:** risco crescente depois dos 70, maior com a saúde baixa.
- O fim da vida abre a tela de **Legado**, com carreira, resultado, prestígio, patrimônio e família, e a escolha do herdeiro (seção 11).

---

## 9. Academia

- **Pós-graduação:**

| Curso | Meta de progresso | Mínimo | Custo/bolsa |
|---|---|---|---|
| Especialização (lato sensu) | 40 | 10 semanas | R$ 600/sem |
| Mestrado | 120 | 20 semanas | seleção; bolsa de R$ 750/sem |
| Doutorado | 240 | 40 semanas | exige mestrado; seleção; bolsa de R$ 1.050/sem |

- **Títulos dão bônus permanentes nos concursos:** especialização +2 cada (até +4), mestrado +3 e doutorado +5. Mestrado e doutorado também aumentam a qualidade da pesquisa (+5 e +10).
- **Publicações:**
  - **artigo** (meta 12): a qualidade define o Qualis, de A1 (+4 no índice) até B2 (+1);
  - **livro acadêmico** (meta 60) e **manual para OAB e concursos** (meta 45): vendem exemplares que decaem 3% por semana e pagam direitos autorais (R$ 10 por exemplar no livro e R$ 6 no manual).
- **Docência:**
  - faculdade particular, com especialização ou mestrado;
  - concurso para universidade pública, com doutorado;
  - progressão de Professor Adjunto para Associado e Titular;
  - a aula rende por bloco e desenvolve **Didática**.
- **Palestras:** com Didática nível 2 e prestígio a partir de 40, chegam convites pagos (cachê de R$ 2 mil + R$ 80 por ponto de prestígio + R$ 60 por ponto do índice), que custam 1 bloco.
- Fora da carreira acadêmica, a pós e as publicações podem ser feitas em paralelo, com blocos de estudo.

---

## 10. Amigos e rivais da faculdade

- **Quatro colegas** são gerados na faculdade: dois amigos (relação 60 e 45) e dois rivais (−45 e −30).
- Cada colega segue uma carreira própria (advocacia, magistratura, MP, Defensoria ou academia) e é **promovido com o tempo**, com cerca de 1,2% de chance por semana. Exemplos: de juiz substituto até ministro do STJ, de advogado até sócio-fundador de banca famosa.
- **Efeitos no jogo:**
  - um amigo advogado **indica casos**;
  - um colega juiz pode cair no seu caso: o amigo ajuda, o rival atrapalha, e julgar um caso de amigo é uma questão ética;
  - um rival pode estar do outro lado do processo;
  - eventos: pedidos de favor, coautoria de artigo (A2), almoço e provocações do rival na imprensa.
- **Ações:** almoço, ajuda e reconciliação. Um rival pode virar amigo.

---

## 11. Dinastia

- No fim da vida, um filho elegível continua a história.
- **O herdeiro recebe:**
  - metade do patrimônio, menos a moradia;
  - a moradia;
  - um dos traços do pai ou da mãe;
  - parte das skills, 15% do que passava de 25, ou 30% se ele estudou Direito;
  - prestígio 30.
- **Carreira:** o jogador escolhe a carreira do herdeiro (advocacia, juiz, promotor ou defensor).
- O **legado** de cada geração fica registrado e as **conquistas passam ao herdeiro**.

---

## 12. Conquistas e Hall da Fama

### 12.1 Conquistas
- **46 conquistas em 6 categorias** (inclui "Autoridade no assunto", 5★ numa área, e "Lei nova, estudo novo", recuperar a estrela perdida numa reforma):
  - tribunais;
  - escritório;
  - carreira pública;
  - academia;
  - vida e patrimônio;
  - dinastia.
- **Raridade e pontos:** comum (10 pontos), rara (25), épica (50) e lendária (100), com as cores das raridades de caso.
- **Exemplos:**
  - "Primeiro caso lendário" e "Lenda dos tribunais" (5 lendários);
  - "Escritório internacional" e "Supremo";
  - "Chefe do Ministério Público";
  - "Best-seller" (200 exemplares na primeira semana);
  - "Bodas de prata" e "Nada a dever";
  - "Página virada" (rival vira amigo);
  - "Três gerações no STF".
- **Verificação:** as conquistas são verificadas a cada tela renderizada e a cada vitória. Ao desbloquear, aparece um aviso no canto da tela e uma linha no diário.
- **Aba Conquistas:** mostra o progresso de cada conquista e marca as que já foram obtidas **em partidas anteriores**.
- As conquistas pertencem à **dinastia**. Algumas só existem nela, como "Polivalente" (3 carreiras na família) e "Linhagem suprema".

### 12.2 Hall da Fama
- **Quando registra:** cada vida encerrada, por morte, aposentadoria, compulsória, falência ou afastamento, entra no ranking.
- **Onde fica:** num armazenamento próprio do navegador (`toga-hall`), que **sobrevive ao fim da partida** e ao reinício.
- **Pontos de legado** = prestígio final + pontos das conquistas obtidas naquela vida + 1 ponto por R$ 100 mil de patrimônio (até 200).
- **Onde aparece:** os 10 melhores na aba Conquistas e os 5 melhores na tela inicial.

---

## 13. Interface e técnica do protótipo

### 13.1 Telas (abas)
- **Escritório / Gabinete / Promotoria / Defensoria:** agenda, casos ativos, ofertas e diário.
- **Estrutura e equipe:** planta, imóvel, cômodos, equipe, finanças e orçamento.
- **Vida:** medidores, parceiro, filhos, bens e financiamentos, investimentos e aluguéis, colegas.
- **Conquistas:** legado atual, Hall da Fama e conquistas por categoria.
- **Academia:** formação, projetos, docência.
- **Região, Brasil e Mundo:** mapas, só na advocacia.
- Estudante e acadêmico têm telas principais próprias.

### 13.1A Tutorial guiado
- **Onde aparece:** um cartão-guia não bloqueante abaixo do cabeçalho nas primeiras semanas. Ele destaca na tela o botão ou o campo da vez.
- **Como avança:**
  - passos de ação avançam sozinhos quando o jogador faz a ação (aceitar um caso, pôr blocos, encerrar a semana, abrir uma aba);
  - passos de explicação têm o botão "Entendi".
- **Trilhas:**
  - faculdade: 6 passos;
  - advocacia: 7 passos (ofertas, preparação, estratégia e apoios, honorários e recursos, estrutura, mapas, Brasil agora e conquistas);
  - carreira pública: 4 passos;
  - academia: 3 passos.
- Ao trocar de carreira, a trilha nova começa do zero. "Pular tutorial" desliga tudo. Herdeiros e saves antigos começam sem tutorial.

### 13.1B Casos ativos e recursos
- Os casos ativos se dividem em **1ª instância** e **Recursos**.
- Os recursos são agrupados por tribunal:
  - TJ, TRT (trabalho) ou TRF (tributário);
  - STJ ou TST (trabalho);
  - STF.
- Cada grupo conta os recursos seus e os da outra parte.
- No gabinete do juiz, as sentenças em recurso também aparecem separadas por tribunal.

### 13.2 Direção visual
- Paleta de papel e tinta com acentos em latão.
- **Fontes:** Spectral SC nos títulos, IBM Plex Sans no texto e IBM Plex Mono nos números.
- Tema claro e escuro automáticos, cores de raridade e blueprint na planta.
- Layout responsivo: em telas estreitas, as colunas viram uma só e as abas quebram linha.

### 13.3 Técnica
- **Formato:** um único arquivo `index.html`, com HTML, CSS e JavaScript puro, sem build.
- **Estado:**
  - um objeto global `S`, salvo no `localStorage` (`toga-proto`);
  - migração de saves antigos em `start()`;
  - o Hall da Fama fica em `toga-hall`.
- **Interface:**
  - renderização por string de template conforme a aba e a carreira;
  - eventos delegados por `data-act`;
  - modais assíncronos (`modal()` retorna uma Promise);
  - `rolar()` faz a animação da balança.
- **Semana:** cada carreira tem o próprio `fimSemana…`, e todas chamam `semanaAcademia()` e `semanaVida()`. `semanaVida()` cuida de dívidas, investimentos, amigos, saúde e morte.

---

## 14. Visão de produto (ainda não implementado)

Ideias do design original que continuam valendo como direção, mas não estão no protótipo:

### 14.1 Sistema jurídico global
- Estudar em **EUA, Brasil, Inglaterra, Itália, França ou Portugal**, com um núcleo universal (os 4 arquétipos: advogado, promotor, juiz e defensor) e uma "pele" local por país: nomes, provas, cargos, júri na common law e assim por diante.
- Revalidação do diploma para trabalhar em outro país. Hoje, o mapa-múndi só serve para abrir filiais.
- **Implementação sugerida:** um arquivo de dados por país, com a família jurídica, a prova de ingresso, a escada de cargos e o peso do júri.

### 14.2 Sistemas futuros
- **Três reputações** (técnica, pública e ética) em vez de um prestígio único.
- **Delegação em lote** no fim de jogo: casos resolvidos pela equipe com risco.
- **Pontos de legado como meta-moeda,** para comprar bônus de início (traço extra, faculdade melhor).
- **Ranking online:** Hall da Fama global e um **"Caso do Dia"** com a mesma *seed* para todos.

### 14.3 Modelo comercial
- **PC (Steam):** premium com preço de indie, mais DLCs de países e expansões.
- **Mobile:** grátis para começar (faculdade e primeira carreira) e compra única para liberar o resto, mais cosméticos.
- **Evitar:** *loot boxes*, *pay-to-win* e energia limitada por tempo.

### 14.4 Produção
- **Engine sugerida para a versão comercial:** Godot 4, com os dados (casos, teses, cargos, países) em JSON.
- **Arte:** 2.5D isométrico "cozy-corporativo". O escritório cresce visualmente e o personagem envelhece e troca de roupa.
- **Áudio:** trilha calma na agenda, tensão crescente na rolagem e um "carimbo" no veredito.
- Localização em 6 idiomas.

### 14.5 Próximos passos sugeridos
1. **Playtest humano de balanceamento:** dinheiro na advocacia e nas carreiras públicas, velocidade de promoção, bolsas, financiamentos e taxa de morte.
2. Tutorial e eventos do mundo.
3. Segundo país (EUA) para validar a abstração global.
4. Separar o código em módulos, se o protótipo continuar crescendo.

---

## 15. Riscos e mitigação
| Risco | Mitigação |
|---|---|
| Complexidade excessiva | Liberar sistemas aos poucos (a faculdade funciona como tutorial); chance sempre explicada |
| Sensação de "só sorte" | Ficha de chance detalhada, momento decisivo, recursos, estratégia conservadora |
| Fim de jogo vazio | Promoções altas, filiais internacionais, academia, dinastia, conquistas e Hall da Fama |
| Imprecisão jurídica | Aviso de "simplificação lúdica"; dados por país revisados por consultor local |
| Temas sensíveis | Tratamento respeitoso; classificação 12+ |
