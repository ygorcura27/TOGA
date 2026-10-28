# TOGA — Uma Vida no Direito

> **Game Design Document (GDD) + especificação técnica**
> Título internacional: **TOGA: A Life in Law** (a palavra "toga" é reconhecida em PT, EN, IT, FR e ES).
> Inspiração de partida: **MetroSystem**. Dele vêm o mapa como tabuleiro e a rede que cresce visualmente. O resto é original: simulação de vida, carreira jurídica, gestão de escritório e batalhas de argumentos.

---

## 0. Pitch

> **"Da primeira aula de Direito até a Suprema Corte, ou até um escritório com bandeira em cinco continentes."**

Você escolhe **onde estudar** (EUA, Brasil, Inglaterra, Itália, França ou Portugal). Cada país segue o próprio sistema jurídico, com provas, cargos e carreiras próprios. Você se forma, encara o exame da ordem ou um concurso e segue um de quatro caminhos: **Advogado, Promotor, Juiz ou Defensor Público**. No caminho você vence casos com skill, preparação e boas apostas de risco, cuida da vida pessoal (saúde, amor, família, dinheiro) e, se for advogado, transforma uma sala alugada em uma firma global.

### 0.1 Pilares de design
1. **Fácil de começar, difícil de largar.** Cada sistema é raso sozinho, mas todos se conectam. No máximo 5 medidores visíveis por tela.
2. **Visual primeiro.** Tudo o que muda no jogo muda também na tela: o escritório cresce, o mapa acende, a roupa do personagem melhora, a cidade troca.
3. **Tempo é a moeda real.** A agenda semanal força escolhas entre carreira e vida, e é dessa tensão que o jogo vive.
4. **Microgestão no começo, estratégia no topo.** No início você faz tudo com as próprias mãos; quanto mais você cresce, mais delega, e delegar tem risco.
5. **Global, não regional.** Um núcleo universal (os 4 arquétipos) com uma "pele" local por país (nomes, provas, regras).
6. **Sessões curtas, metas longas.** Um caso dura de 30 segundos a 3 minutos, uma semana de jogo de 3 a 5 minutos, uma carreira inteira de 15 a 30 horas.

### 0.2 Referências de sensação
| Jogo | O que pegar |
|------|-------------|
| MetroSystem | Mapa como tabuleiro; rede de filiais ligada por linhas que acendem |
| BitLife / The Sims | Vida pessoal, eventos, relacionamentos, ciclo de vida |
| Two Point Hospital | Construir salas, contratar, satisfação da equipe, humor visual |
| Game Dev Tycoon | Crescer da garagem até a sede, decisões de negócio simples |
| Ace Attorney | Drama no tribunal e retratos expressivos (só na apresentação) |
| XCOM | Percentual de sucesso na tela antes de agir; a tensão da rolagem |
| Football Manager (versão leve) | Gestão de pessoas, atributos, delegação |

---

## 1. Os três loops

```
LOOP CURTO (0,5–3 min) ─ um CASO
  Receber caso → Ver a CHANCE (skill × dificuldade) → Preparar (tempo, equipe, apoios, estratégia) → VEREDITO → Recompensas

LOOP MÉDIO (1 semana de jogo ≈ 3–5 min)
  Planejar AGENDA (21 blocos) → Executar casos, estudo e vida → Eventos e dilemas → Fechamento semanal (dinheiro, XP, humor)

LOOP LONGO (anos de jogo ≈ horas)
  Faculdade → Exame/Concurso → Escada da carreira → Escritório e expansão / promoções e remoções
  → Topo da carreira → Aposentadoria → LEGADO (jogar com herdeiro, com bônus)
```

Cada loop alimenta o seguinte. Casos dão XP, dinheiro e reputação. A agenda define quantos casos você pega e como fica a sua vida. A carreira libera casos maiores, prédios maiores e o mapa-múndi.

---

## 2. Criação de personagem e faculdade

### 2.1 Criação
- **Aparência:** editor simples com estilo visual próprio (seção 13).
- **Origem social:** Modesta, Classe média ou Abastada. Muda o dinheiro inicial, a rede de contatos e as dívidas estudantis. Personagem rico começa com vantagem, mas recebe menos bônus de "superação".
- **Traços** (escolha 2 de 12): Orador nato, Rato de biblioteca, Carismático, Workaholic, Ansioso, Ético inflexível, Pragmático, Poliglota, Competitivo, Empático, Preguiçoso (dá bônus de felicidade), Sortudo.
- **País de estudo:** define o sistema jurídico de **toda a primeira carreira**. Revalidar depois é possível (seção 9.4).

### 2.2 Faculdade (o tutorial disfarçado, 1 a 2 horas)
A faculdade roda em **semestres**. Cada semestre é uma agenda simplificada:

| Atividade | Efeito |
|-----------|--------|
| Aulas / estudo | Nota (GPA/CR) e skills de Pesquisa e Escrita |
| Clínica jurídica / Núcleo de prática | Primeiros mini casos reais, que ensinam o sistema de chances |
| Competição de júri simulado (*moot court*) | Oratória; troféu que vale reputação inicial |
| Estágio | Dinheiro, contatos e chance de efetivação |
| Vida social / festas | Felicidade, relacionamentos e possível par romântico |
| Trabalho de meio período | Dinheiro, ao custo de estudo |
| Intercâmbio (evento) | +Idioma, +contato internacional; desbloqueia um segundo país mais cedo |

**Tier da faculdade:** a nota do vestibular (ou do LSAT/A-levels/bac) define o tier (1 a 3). Tier alto traz mais contatos de elite e estágios melhores, mas a mensalidade e a pressão também são maiores.

### 2.3 Exame da ordem e concursos
São dois minigames, com sabor diferente por país:
- **Exame da ordem / Bar / SQE / CRFPA / Esame di Stato:** 4 a 12 semanas de **plano de estudos** (blocos da agenda nas "matérias") e depois uma **prova** resolvida pelo sistema de chances (seção 5.8).
- **Concurso** (Juiz, Promotor, Defensor nos países onde existe): mais longo (3 a 18 meses), em fases: objetiva, discursiva, oral e títulos. Cada reprovação custa tempo e moral, mas dá **+bônus de experiência** para a próxima tentativa, o que suaviza a frustração.
- **Risco de burnout:** estudar demais sem descanso faz o estresse subir e pode levar a passar mal no dia da prova.

---

## 3. Sistema Jurídico Global

### 3.1 Núcleo universal: 4 arquétipos
| Arquétipo | Fantasia | Minigame próprio | Ritmo |
|-----------|----------|------------------|-------|
| ⚖️ **Advogado** | Ganhar clientes e dinheiro e construir um império | Escolher e preparar casos + gestão de escritório | Empreendedor |
| 🔎 **Promotor** | Investigar, acusar e fazer justiça | Diligências que reduzem a dificuldade + decidir denunciar, arquivar ou acordo | Detetive |
| 🛡️ **Defensor Público** | Defender quem não pode pagar, com volume gigante | Triagem de Pauta (distribuir pouco tempo entre muitos casos) | Herói sobrecarregado |
| 🏛️ **Juiz** | Decidir com justiça e sem ser reformado | Chance de Acerto por decisão + gestão de acervo | Estratégico e calmo |

Trocar de carreira é permitido e é uma das melhores histórias do jogo. Exemplos: advogado que vira juiz pelo concurso (civil law), por nomeação depois de anos de prática (common law) ou pelo "quinto constitucional" no Brasil; promotor que sai e abre um escritório criminal.

### 3.2 Famílias jurídicas (regras que mudam a jogabilidade)
| Família | Países | Efeito no jogo |
|---------|--------|----------------|
| **Common law** | EUA, Inglaterra | **Oratória** e **precedentes** pesam mais na chance; **Júri** frequente (resultado menos previsível); acordo penal (*plea bargain*) muito comum nos EUA |
| **Civil law** | Brasil, Itália, França, Portugal | **Escrita** e **Código** pesam mais na chance; resultado mais previsível; juiz conduz mais a instrução; júri só para crimes específicos |

### 3.3 Os 6 países do lançamento (versão simplificada para o jogo)

> ⚠️ É uma simplificação lúdica. Antes do lançamento, cada país deve ser validado por um consultor jurídico local. Os nomes dos cargos ficam em `data/countries/*.json` para ajuste fácil.

| | 🇺🇸 EUA | 🇧🇷 Brasil | 🇬🇧 Inglaterra & País de Gales | 🇮🇹 Itália | 🇫🇷 França | 🇵🇹 Portugal |
|---|---|---|---|---|---|---|
| Família | Common law | Civil law | Common law | Civil law | Civil law | Civil law |
| Formação | Graduação (4a) + LSAT + **J.D.** (3a) | **Direito** (5a) | **LLB** (3a) ou conversão | **Laurea magistrale in Giurisprudenza** (5a) | **Licence + Master** (5a) | **Licenciatura** (4a) + mestrado opcional |
| Habilitação | **Bar Exam** do estado | **Exame da OAB** | Solicitor: **SQE1+SQE2** + 2 anos de experiência · Barrister: Bar course + **pupillage** | **Praticantato** (18 meses) + **Esame di Stato** | **CRFPA** + escola de advogados (CAPA) | **Estágio na Ordem dos Advogados** + exame |
| Advogado | Attorney (Associate → Partner) | Advogado (Associado → Sócio) | **Solicitor** ou **Barrister** (→ King's Counsel) | Avvocato | Avocat | Advogado |
| Promotor | Assistant DA → **District Attorney** (geralmente eleito) / US Attorney | **Promotor de Justiça** (concurso MP) → Procurador de Justiça | **Crown Prosecutor** (CPS) | **Pubblico Ministero** (magistrado, concorso) | **Procureur** (magistrat du parquet, ENM) | **Procurador do MP** (CEJ) |
| Juiz | Eleito ou nomeado (estadual); federal nomeado pelo Presidente e confirmado pelo Senado | **Concurso** da magistratura | **Nomeação** (Judicial Appointments Commission) após anos de prática | **Concorso** em magistratura | **Concurso ENM** (juge du siège) | **CEJ** (magistratura judicial) |
| Defesa pública | **Public Defender** | **Defensor Público** (concurso) | Assistência jurídica (*legal aid*) / duty solicitor | Difensore d'ufficio / patrocínio estatal | Avocat commis d'office / *aide juridictionnelle* | Defensor oficioso / apoio judiciário |
| Topo | Suprema Corte (SCOTUS) / Attorney General | STF / Procurador-Geral da República | UK Supreme Court / Director of Public Prosecutions | Corte di Cassazione / Corte Costituzionale | Cour de cassation / Conseil constitutionnel | Supremo Tribunal de Justiça / Tribunal Constitucional |
| Mecânica exclusiva | **Eleições** para DA e juiz (campanha e marketing) | **Concursos** em fases e "quinto constitucional" | **Escolha Solicitor × Barrister** e "*Chambers*" | Magistrado pode alternar entre juiz e PM (sujeito à reforma de separação de carreiras) | Juiz e promotor no mesmo corpo da magistratura | Carreiras judicial e MP separadas, ambas formadas no CEJ |

**Defesa pública nos países sem cargo próprio:** a carreira "Defensor" vira **Advogado de Assistência Jurídica**. A mecânica é a mesma (volume alto, Triagem de Pauta), mas o pagamento vem do Estado por caso e você mantém a prática privada em paralelo.

### 3.4 Como um país é implementado (orientado a dados)
Cada país é um arquivo JSON que preenche o núcleo universal:
```json
{
  "id": "BR",
  "nome": "Brasil",
  "familia": "civil_law",
  "moeda": "BRL",
  "idiomas": ["pt"],
  "formacao": { "curso": "Direito", "anos": 5, "notaEntrada": "vestibular" },
  "habilitacao": { "advogado": { "tipo": "exame", "nome": "Exame da OAB", "fases": ["objetiva", "pratica"] } },
  "carreiras": {
    "advogado": { "escada": ["Estagiário", "Advogado Júnior", "Pleno", "Sênior", "Sócio", "Sócio-Gestor"] },
    "promotor": { "entrada": "concurso", "requisitoAnos": 3,
                  "escada": ["Promotor Substituto", "Promotor de Entrância Inicial", "Promotor de Entrância Final", "Procurador de Justiça", "Procurador-Geral"] },
    "juiz":     { "entrada": "concurso", "requisitoAnos": 3,
                  "escada": ["Juiz Substituto", "Juiz Titular", "Desembargador", "Ministro do STJ", "Ministro do STF"] },
    "defensor": { "entrada": "concurso", "escada": ["Defensor Substituto", "Defensor Titular", "Defensor de 2ª instância", "Defensor Público-Geral"] }
  },
  "modificadores": { "peso_codigo": 1.3, "peso_precedente": 0.9, "chance_juri": 0.05, "fase_escrita": 1.4 },
  "eventosExclusivos": ["quinto_constitucional", "greve_judiciario", "recesso_forense"],
  "mapa": "maps/br.json"
}
```
Um país novo vira DLC (Alemanha, Espanha, Japão, Canadá, Argentina...) sem mexer no código.

---

## 4. Carreiras em detalhe

### 4.1 ⚖️ Advogado
- **Escada:** Estagiário → Júnior → Pleno → Sênior → Sócio → Sócio-Gestor → Managing Partner Global.
- **Dois caminhos:**
  - **Empregado** em uma firma de NPCs: salário fixo e casos atribuídos, com metas de horas faturáveis (*billable hours*). Seguro, mas o chefe pode ser tóxico.
  - **Abrir o próprio escritório** (a qualquer momento depois da habilitação): risco alto, teto infinito, e libera o sistema de Escritório (seção 8).
- **Especializações:** Penal, Cível, Família, Trabalho, Empresarial/M&A, Tributário, Propriedade Intelectual, Internacional, Direitos Humanos, Digital/Tech. Cada uma tem seu tipo de cliente, valor médio de causa e perks exclusivos.

### 4.2 🔎 Promotor
- **Investigação:** um mural com fotos e documentos ligados por barbante vermelho (visual). Cada **diligência** (perícia, oitiva, quebra de sigilo) custa blocos ou orçamento e **reduz a dificuldade** do caso, com o efeito mostrado antes.
- **Decisão por caso:** Denunciar, Arquivar ou propor Acordo (acordo penal, *plea bargain*, *composition pénale*...). Os indicadores são taxa de condenação, imagem pública e Justiça (punir inocente dá um golpe pesado na Integridade).
- **Promoção = remoção:** subir na carreira obriga a mudar de comarca ou cidade no mapa, o que afeta família e relacionamentos. É dilema garantido.
- **EUA:** o District Attorney é eleito, e a eleição vira um minigame de campanha a cada 4 anos.

### 4.3 🛡️ Defensor Público
- **Minigame Triagem de Pauta:** chegam 30 casos por semana para 12 blocos de tempo. Você encaixa os casos como peças (estilo Tetris na agenda), priorizando réus presos, prazos e chances reais.
- **Fantasia:** ser o herói sobrecarregado. Recompensa emocional, com cartas de agradecimento colecionáveis e histórias de clientes que voltam anos depois.
- **Skill exclusiva, "Fazer muito com pouco":** casos simples resolvidos automaticamente com qualidade mínima.

### 4.4 🏛️ Juiz
- **Chance de Acerto:** cada processo mostra a dificuldade e a chance de a sua decisão ser mantida em recurso. Mais tempo no processo (ou um bom assessor) aumenta a chance, mas a fila cresce.
- **Gestão de acervo:** uma fila de processos que cresce sem parar, e esta é a herança do MetroSystem: fluxo e vazão. Contratar e gerir **assessores** (gestão de pessoas também para juízes!) aumenta a vazão.
- **Indicadores:** Taxa de Reforma (decisões derrubadas em recurso), Tempo Médio, Reputação e Integridade.
- **Common law:** você cria precedentes. Uma boa decisão vira um **Precedente com o seu nome**, uma tese que outros advogados do mundo do jogo passam a usar (e você vê isso acontecer).

---

## 5. Casos: Skill × Dificuldade × Chance (o coração do jogo)

> Sem minigame de batalha. Cada caso é uma **aposta calculada**: você vê a chance de vitória antes de agir, decide quanto investir para melhorá-la e assiste ao veredito. A graça está em **escolher bem os casos, preparar bem e aceitar o risco**, como em XCOM ou Football Manager.

### 5.1 Raridade dos casos
| Raridade | Cor | Dificuldade | Valor da causa (BR) | Reputação se ganhar | Reputação se perder | Exemplo |
|----------|-----|-------------|---------------------|---------------------|---------------------|---------|
| Comum | ⚪ | 10–30 | R$ 13 mil – 87 mil | +1 | −2 | Cobrança, multa, divórcio consensual |
| Incomum | 🟢 | 25–45 | R$ 54 mil – 365 mil | +2 | −3 | Demissão por justa causa, inventário litigioso |
| Raro | 🔵 | 40–65 | R$ 226 mil – 2,4 mi | +3 (+ tese colecionável) | −5 | Fraude empresarial, homicídio culposo |
| Épico | 🟣 | 60–85 | R$ 1,5 mi – 17 mi | +4 (+ mídia) | −7 | Recuperação judicial de multinacional |
| Lendário | 🟠 | 80–100 | R$ 10 mi – 69 mi | +6 (+ troféu e cutscene) | −10 | **"O Caso do Século"** (evento roteirizado, 1 a 2 por carreira) |

**Regras do dinheiro e da reputação** (Advogado):
- **O valor da causa cresce com a dificuldade:** `valorCausa = 5.000 × 1,1^dificuldade` (±20% de variação), em moeda local ajustada pelo `fatorEconomico` do país.
- **Honorários = sempre 20% do valor da causa, e só na vitória.** Perdeu, não recebe nada.
- **Ganhou:** recebe os honorários e **um pouco** de reputação (coluna "se ganhar").
- **Perdeu:** **perde** reputação (coluna "se perder"). Perder custa mais do que ganhar rende, então aceitar casos com chance baixa é uma aposta de verdade.
- "Reputação" aqui é o **Prestígio** (seção 10), que traz casos maiores e melhores.

Os casos vêm de **modelos procedurais** (partes, valor, área, dificuldade, reviravoltas) e de **Casos Roteirizados** escritos à mão, todos fictícios e inspirados em temas clássicos.

### 5.2 Ficha do caso
Cada caso aparece como um **cartão de processo** (visual de pasta, com carimbo de raridade):

```
┌───────────────────────────────────────────────┐
│ 🔵 RARO · Penal · Fraude na Construtora Atlas │
│ Cliente: Marcos Duarte (empresário)           │
│ Valor da causa: R$ 1.260.000                  │
│ Se ganhar: R$ 252.000 (20%) · +3 reputação    │
│ Se perder: −5 reputação                       │
│ Se ganhar, chance de recurso do outro: 60%    │
│ Prazo: 6 semanas · Juiz: Dra. Helena (Rigorosa)│
│                                               │
│ Dificuldade ████████░░  58                    │
│ Skills exigidas: Penal 50% · Análise 30% ·    │
│                  Oratória 20%                 │
│ Sua skill no caso ███████░░░  54              │
│                                               │
│ CHANCE DE VITÓRIA         ▶ 44% ◀             │
│ [ Ver detalhes ]  [ Aceitar ]  [ Recusar ]    │
└───────────────────────────────────────────────┘
```

- **Dificuldade (1–100):** combina complexidade, força do adversário, qualidade das provas e o perfil do juiz.
- **Skills exigidas:** de 2 a 3 skills com pesos que somam 100%. A **skill no caso** é a média ponderada das suas (ou da equipe designada).
- **Chance de vitória:** sempre visível e **sempre explicada**. "Ver detalhes" mostra cada bônus e penalidade, para que o jogador nunca sinta que o resultado foi arbitrário.

### 5.3 Fluxo de um caso
```
1. OFERTA         O caso chega com a chance inicial → Aceitar ou Recusar (alerta de conflito de interesses)
2. PREPARAÇÃO     Investir tempo, equipe, apoios e escolher a ESTRATÉGIA → a chance sobe (ou cai)
3. REVIRAVOLTA    (opcional, 30% dos casos) Um evento muda a chance e pede uma decisão
4. MOMENTO DECISIVO  Uma escolha na audiência, com o risco de cada opção visível
5. VEREDITO       Animação da balança → Vitória (20% da causa + reputação) ou Derrota (− reputação)
6. RECURSO?       Quem perdeu PODE recorrer, nunca é automático. A chance aparece antes (seção 5.7)
```

### 5.4 Como aumentar a chance (as alavancas do jogador)

**a) Preparação: tempo na agenda**
Cada bloco da agenda dedicado ao caso dá bônus, com retorno decrescente: +5, +4, +3, +2, +1... (até +15). Tempo gasto aqui é tempo tirado da vida pessoal ou de outros casos.

**b) Equipe designada** (quando houver escritório)
O caso pode ser conduzido por você, por um funcionário ou por uma dupla (o líder conta 70% e o apoio 30%). **Delegar usa as skills do funcionário**, e você vê a chance dele antes de delegar.

**c) Apoios (custam dinheiro ou blocos)**
| Apoio | Bônus | Custo |
|---------|-------|-------|
| Pesquisa de jurisprudência | +5 | 2 blocos |
| Preparar testemunha | +5 | 1 bloco |
| Perito / assistente técnico | +8 | $$ |
| Parecer de jurista renomado | +10 | $$$ |
| Correspondente local (caso em outra cidade) | evita −10 de "distância" | $ |
| Tese colecionável equipada (seção 5.9) | +3 a +12 | — |
| ⚠️ Atalho antiético (ex.: "esquecer" uma prova) | +20 | Risco de Integridade (seção 10) |

**d) Estratégia** (escolha 1 por caso, como a postura do time no Football Manager)
Os honorários são sempre 20%. A estratégia muda **a chance e a reputação**, nunca o percentual.

| Estratégia | Chance | Reputação | Observação |
|------------|--------|-----------|------------|
| 🛡️ Conservadora | +15 | Vitória rende ×0,5 | Vitória "sem brilho"; para não perder cliente importante |
| ⚖️ Equilibrada | 0 | ×1 | Padrão |
| 🔥 Agressiva | −15 | Vitória ×2 · Derrota ×1,5 | Vitória vira notícia; a derrota também |
| 🤝 Buscar acordo | fixa: 55% + Negociação/2 (máx. 95%) | +0 | O acordo fecha entre 50% e 80% do valor da causa (conforme Negociação) e os honorários são 20% do valor acordado. Resolve em 1 semana e não cabe recurso. Se o acordo falhar, o caso volta para o julgamento normal |

**e) Modificadores automáticos** (aparecem nos detalhes)
| Fonte | Efeito |
|-------|--------|
| Especialização na área (nível da árvore) | +0 a +10 |
| Reputação (Prestígio) | (Prestígio − 50) / 10 |
| Perfil do juiz | Rigoroso −5 em teses frágeis; Garantista +5 para a defesa; Formalista +5 se Escrita ≥ 60... |
| Família jurídica | Common law: Oratória e precedentes pesam mais. Civil law: Escrita e Código pesam mais |
| Júri (quando houver) | A chance é "comprimida" para o centro: `50 + (chance − 50) × 0,8`. O júri é menos previsível |
| Estado pessoal | Energia < 30: −10 · Estresse > 70: −8 · Felicidade > 80: +3 |
| Traços | Ex.: Orador nato +5 em casos com júri; Ansioso −5 em casos épicos e lendários |

### 5.5 Reviravoltas e Momento Decisivo (decisões com risco visível)
**Reviravolta** (aleatória, em cerca de 30% dos casos). Exemplos:
- "A testemunha-chave mudou a versão." → −10. Opções: *Investigar o motivo* (2 blocos, 60% de anular a penalidade) ou *Seguir em frente*.
- "Chegou um documento novo do adversário." → Opções: *Pedir prazo* (+0, adia 2 semanas) ou *Contestar na hora* (teste de Análise: +8 ou −8).

**Momento Decisivo** (uma vez por caso, durante a audiência). Uma cena curta com 2 ou 3 opções, cada uma com a **própria chance mostrada**:
```
A testemunha da acusação hesita ao responder sobre o horário.
 ▸ Pressionar a contradição    (Oratória 58 vs 60 → 47%)  sucesso +12 · falha −8
 ▸ Pedir a juntada do registro (Pesquisa 70 vs 55 → 74%)  sucesso +6  · falha −2
 ▸ Não arriscar                                          ±0
```
Isso dá tensão e escolha sem virar um minigame. É o momento "uau" do caso.

### 5.6 Veredito (a rolagem)
- **Visual:** o tribunal escurece, a câmera aproxima e aparece uma **balança dourada** com a faixa verde do tamanho da sua chance. O ponteiro oscila e para, com a música crescendo e o martelo batendo. Botão "Pular" para os impacientes e "Resolver todos" para casos comuns em lote.
- **Faixas de resultado** (sorteio `r` de 0 a 1):

| Resultado | Condição | Efeito |
|-----------|----------|--------|
| 🏆 Vitória Histórica | r ≤ chance × 0,15 | Honorários de 20% + reputação ×2 + troféu; o adversário tem −25% de chance de recorrer |
| ✅ Vitória | r ≤ chance | Honorários de 20% + reputação da tabela 5.1 |
| ❌ Derrota | r > chance | Sem honorários e perde a reputação da tabela 5.1; você **pode** recorrer (5.7) |
| 💥 Derrota feia | r > 0,95 e chance < 50% | Perda de reputação ×1,5 e o cliente reclama publicamente |

- **Limites:** a chance final fica sempre entre **5% e 95%**. Nada é garantido e nada é impossível.
- **Derrota ensina:** perder dá **+50% de XP** nas skills do caso, para suavizar a frustração e manter o "vou tentar de novo".
- **Sem trapaça escondida:** a chance mostrada é a chance real. A confiança do jogador no número é o que sustenta o sistema.

### 5.7 Recursos (apelação): quem perde **pode** recorrer
> O recurso **nunca é automático**. Quem perde decide se recorre, e o jogo mostra a chance de cada lado antes.

**Instâncias:** 1ª instância → 2ª instância (Tribunal) → Tribunal Superior/Suprema Corte (só para casos Raros ou acima). O nome de cada tribunal vem do arquivo do país.

**Quando VOCÊ perde: você escolhe.**
```
┌──────────────────────────────────────────────┐
│ ❌ DERROTA · Fraude na Construtora Atlas     │
│ Reputação: −5 (já aplicado)                  │
│                                              │
│ Recorrer ao Tribunal?                        │
│ Chance de reverter:   ▶ 44% ◀                │
│ Custas do recurso:    R$ 12.600 (1% da causa)│
│ Duração:              6–10 semanas           │
│ Se reverter: +R$ 252.000 e +3 de reputação   │
│ Se perder de novo: −3 de reputação           │
│                                              │
│      [ Recorrer ]        [ Aceitar ]         │
└──────────────────────────────────────────────┘
```
- **Chance de reverter:** a mesma fórmula do caso, com **dificuldade +10** (2ª instância) ou **+20** (Superior) e **−10 de "decisão contrária"**. Você pode preparar de novo (blocos, apoios, equipe).
- **Custas:** 1% do valor da causa, pagas na hora. Recorrer de casos caros pesa no caixa.
- **Reverter:** recebe os honorários de 20% e a reputação de vitória, e recupera metade da reputação perdida.
- **Perder de novo:** perde mais **metade** da reputação da tabela. Ainda é possível recorrer ao Superior, se o caso permitir.
- **Aceitar:** encerra o caso sem custo extra.

**Quando o ADVERSÁRIO perde: ele pode recorrer, e o jogo mostra a chance.**
```
✅ VITÓRIA! Honorários de R$ 252.000 a receber
⚠️ Chance de a outra parte recorrer: 60%
   (Raro 45% + Empresa grande 15%)
   → sorteio em 1 semana
```
- **Chance de recurso do adversário** (sorteada, não automática):

| Fator | Efeito na chance |
|-------|------------------|
| Base por raridade | Comum 15% · Incomum 30% · Raro 45% · Épico 60% · Lendário 80% |
| Perfil do adversário | Pessoa física −10% · Empresa grande +15% · Estado/governo +20% |
| Vitória Histórica | −25% (decisão muito sólida) |
| Limites | entre 5% e 95% |

- **Sem recurso:** o caso transita em julgado e os honorários entram no caixa.
- **Com recurso:** os honorários ficam **retidos** até o julgamento. Você defende a decisão com a mesma fórmula (dificuldade +10, mas **+10 de "decisão favorável"**), e pode preparar de novo.
  - **Decisão mantida:** recebe os honorários e mais **+1 de reputação**.
  - **Decisão reformada:** não recebe os honorários e perde a reputação da tabela.
- Cada recurso leva de 4 a 12 semanas de jogo. Isso cria tensão no fluxo de caixa: dinheiro "ganho" que ainda não entrou.

### 5.8 O mesmo sistema em todas as carreiras
| Carreira | O que a "chance" mede | Alavanca própria |
|----------|-----------------------|------------------|
| ⚖️ Advogado | Vitória do cliente | Aceitar ou recusar casos (gestão de risco da carteira), estratégia, decidir recorrer; honorários de 20% da causa na vitória |
| 🔎 Promotor | Condenação (ou acordo aceito) | **Diligências** (perícia, oitivas) **reduzem a dificuldade**; decidir Denunciar, Arquivar ou Acordo. Denunciar com chance baixa e perder custa imagem |
| 🛡️ Defensor | Absolvição ou melhor resultado | **Triagem:** 30 casos por semana e poucos blocos. Distribuir o tempo onde ele mais aumenta a chance (prioridade para réus presos) |
| 🏛️ Juiz | **Acerto** (decisão mantida em recurso) | Tempo por processo × tamanho da fila; assessores com skills próprias |
| 📝 Exames e concursos | Aprovação em cada fase | Semanas de estudo por matéria; cada fase (objetiva, discursiva, oral) é uma rolagem própria |

> Com um único sistema, o jogador aprende uma vez e entende tudo: casos, concursos, delegação e até a escolha de funcionários.
>
> **Carreiras públicas** (Promotor, Defensor, Juiz) não recebem honorários, e sim salário fixo. Nelas a vitória rende reputação e pontos de promoção, a derrota tira reputação, e os recursos funcionam igual (para o Juiz, uma decisão reformada em recurso custa reputação).

### 5.9 Coleção: Teses e Precedentes
- Vitórias em casos raros ou acima rendem **Teses colecionáveis**, como "Nulidade de prova ilícita" ou "Desconsideração da personalidade jurídica".
- Cada tese dá **+3 a +12** de chance em um tipo de caso e pode ser equipada (no máximo 3 por caso).
- **Galeria de Troféus:** um troféu físico na estante do escritório (visível!) para cada Vitória Histórica ou caso lendário.
- O **Modo Estudante (DLC/opcional)** troca a rolagem dos exames por um quiz real do país, para quem quer aprender jogando.

---

## 6. Skills

### 6.1 Atributos-base (0 a 100, sobem com uso)
| Skill | Para que serve |
|-------|----------------|
| 🗣️ Oratória | Audiências, júri e sustentação oral |
| ✍️ Escrita | Fase escrita; qualidade das peças; decisões de juiz |
| 🔍 Pesquisa | Casos complexos; bônus de jurisprudência e precedentes |
| 🤝 Negociação | Estratégia de Acordo; honorários; salários; fusões |
| 🧠 Análise | Casos com muitas provas; investigação; acerto do juiz |
| 👥 Liderança | Moral da equipe; eficiência dos delegados |
| 📊 Gestão | Custos; produtividade do escritório; vazão do acervo |
| 🌐 Networking | Captação de clientes; indicações; nomeações |
| 🗺️ Idiomas | **Exigido para expandir** e atuar em outros países |
| ⚖️ Integridade | Resistência a escândalos; bônus com juízes rigorosos |

### 6.2 Árvores de especialização (perks)
Cada área (Penal, Empresarial etc.) tem uma árvore de **3 ramos × 5 perks**. Exemplos:
- **Penal, ramo Tribuna:** *"Voz que ecoa"*: +8% de chance em casos com júri.
- **Empresarial, ramo Deal Maker:** *"Mesa redonda"*: acordos fecham 10 pontos percentuais mais altos (ex.: 70% → 80% do valor da causa).
- **Gestão, ramo Pessoas:** *"Porta aberta"*: conflitos entre funcionários se resolvem sozinhos 30% das vezes.

**XP:** vem de fazer (usar a skill no caso), estudar (blocos de agenda) e cursos (pós, LL.M., mestrado, doutorado; caros e demorados, mas dão saltos grandes e títulos para concursos).

---

## 7. Vida pessoal

### 7.1 Agenda semanal (a mecânica central de tempo)
- **7 dias × 3 blocos** (manhã, tarde, noite) = **21 blocos** por semana.
- Você arrasta **cartões de atividade** para os blocos: Trabalho, Caso X, Estudo, Academia, Família, Encontro, Networking, Hobby, Descanso.
- **Sono** é automático, mas uma "virada de noite" rende um bloco extra com estresse alto.
- **Modelos de agenda** salvos e o botão "repetir semana" mantêm o jogo ágil.

### 7.2 Medidores pessoais (só 4)
| Medidor | Sobe com | Cai com | Se zerar ou estourar |
|---------|----------|---------|----------------------|
| ❤️ Saúde | Academia, sono, médico | Viradas, estresse crônico, idade | Doença, internação, perda de semanas |
| ⚡ Energia | Descanso, férias | Trabalho, casos difíceis | A chance cai em todos os casos |
| 😰 Estresse | Prazos, derrotas, conflitos | Hobby, família, terapia, férias | **Burnout**: afastamento forçado |
| 😊 Felicidade | Relacionamentos, conquistas, lazer | Solidão, derrotas, rotina | Traços negativos e risco de vícios |

### 7.3 Relacionamentos e família
- **NPCs com memória:** colegas de faculdade reaparecem como juízes, adversários, sócios ou clientes ("Lembra de mim? Fui sua dupla no júri simulado.").
- **Romance:** namoro → casamento → filhos (opcional). O par tem carreira própria; se o seu emprego obrigar mudança de cidade, o par pode aceitar, recusar ou terminar.
- **Filhos** crescem com o tempo e têm traços herdados e criados por você. Um deles pode virar **herdeiro** (seção 11).
- **Dilemas clássicos:** a apresentação de balé da filha cai no mesmo dia da sustentação oral no tribunal superior. Escolher sempre o trabalho dá Carreira +, mas a Família sofre e as consequências aparecem anos depois.

### 7.4 Patrimônio e estilo de vida
- **Moradia:** república → apartamento → casa → mansão/cobertura. Tudo visível no jogo, e a moradia pode ser decorada.
- **Carro, roupas e relógio** dão bônus pequenos de "Presença" no primeiro encontro com clientes de elite.
- **Investimentos** simples (renda fixa, ações, imóveis), com risco de crise econômica (evento).
- **Hobbies** com buffs: golfe (+Networking), corrida (+Saúde), xadrez (+Análise), teatro (+Oratória), música (−Estresse).

---

## 8. Escritório: construção e gestão de pessoas

### 8.1 Visual
Construção **isométrica** no estilo Two Point. Você compra ou aluga um espaço, desenha salas e coloca móveis. Cada sala tem uma função:
| Sala | Função |
|------|--------|
| Recepção | Captação (o atendimento ruim afasta clientes) |
| Sala de advogados (baias → salas individuais) | Produção de casos |
| Sala de reunião | Fechamento de contratos (+Negociação) |
| Biblioteca / Sala de pesquisa | +Pesquisa para a equipe |
| Copa / Área de descanso | −Estresse da equipe |
| Sala do sócio | Status; atrai talentos |
| TI / Arquivo | Eficiência; reduz o risco de perder prazos |
| Sala de treinamento | XP para os funcionários |

### 8.2 Funcionários
Cada funcionário tem:
`nome, retrato, cargo, skills (as mesmas do jogador), traços (2), salário, moral, lealdade, ética, ambição, fadiga`
- **Cargos:** Estagiário, Secretária/Recepção, Paralegal, Advogado Jr/Pl/Sr, Coordenador de área, Financeiro, RH, Marketing, TI, Gerente Administrativo, Sócio, Diretor de País.
- **Eventos de pessoas:** pedido de aumento, proposta da concorrência, briga entre colegas, assédio (exige ação séria do RH), gravidez/licença, burnout, promoção pedida, sócio que quer levar clientes.

### 8.3 Níveis do escritório e delegação (requisito-chave)
> **Regra de ouro:** nos níveis baixos *tudo* passa pelas suas mãos; nos altos você escolhe **o que delegar e para quem**. Delegar tem custo (salário do delegado) e risco (a competência e a ética do delegado geram acertos e erros).

| Nível | Porte | O que **você** faz (micro) | O que dá para **delegar** |
|-------|-------|----------------------------|---------------------------|
| **1. Sala Solo** | Só você | Tudo: atender cliente, cobrar, pagar contas, agendar, peticionar, marketing, escolher cada caso | Nada. Este é o nível que ensina o jogo |
| **2. Pequeno Escritório** | 2–8 pessoas | Contratar e entrevistar (minigame de entrevista), atribuir **cada** caso, **revisar** o trabalho dos juniores (minigame de revisão: achar erros na peça), definir salários, mediar conflitos, fazer folha e cobrança | Agenda e recepção (secretária) |
| **3. Escritório Médio** | 10–50 | Contratações-chave, clientes grandes, casos raros+ | **Gerente Administrativo** (finanças/RH) e **Coordenadores de área** (atribuição automática por *políticas*) |
| **4. Banca Nacional** | Filiais em estados/cidades | Escolher expansões, aprovar orçamentos, acompanhar KPIs por filial, crises | **Sócio-diretor por filial** (roda a filial sozinho) |
| **5. Firma Global** | Escritórios em países | Estratégia (Diretrizes), fusões e aquisições, grandes crises, contas globais | **Board** e **Managing Partner por país** |

**Políticas de delegação** (liberadas no nível 3+), escritas como regras simples em cartões:
- "Casos comuns de Trabalho → Coordenador Trabalhista atribui automaticamente."
- "Contratações abaixo de Pleno → RH decide, com orçamento de até X."
- "Honorários acima de Y → exigem minha aprovação."
- "Se a moral de uma equipe cair abaixo de 40 → me notificar."

**Qualidade do delegado:** cada decisão delegada passa por um teste com as skills e a ética do delegado. Um delegado fraco aprova clientes ruins, perde prazos ou contrata mal. Um antiético pode desviar dinheiro (evento de escândalo). Assim, contratar bons delegados vira o desafio do *mid game*.

**Painel de comando (níveis 4–5):** um painel simples com 5 KPIs por unidade (Receita, Margem, Moral, Taxa de êxito, Reputação), em semáforo verde/amarelo/vermelho. Clicar em uma unidade vermelha leva à crise.

### 8.4 Economia do escritório (simples)
- **Receitas:** **honorários de 20% do valor da causa em cada vitória** (só entram depois do trânsito em julgado, ou seja, sem recurso pendente). Clientes empresariais (contrato de partido) não pagam mensalidade: eles garantem um **fluxo constante de casos**.
- **Tensão de caixa:** como o dinheiro só entra nas vitórias, e os recursos atrasam o pagamento, o começo do jogo é apertado. Pegar casos menores e seguros paga as contas; os grandes podem transformar o escritório.
- **Despesas:** salários, aluguel, manutenção das salas, marketing, software, impostos, anuidade da ordem.
- **Dívida/empréstimo:** possível, com juros. Falir significa fechar o escritório (a carreira continua como empregado, com reputação ferida).

---

## 9. Expansão: o mapa (a herança do MetroSystem)

### 9.1 Mapa nacional
- Mapa estilizado do país com **cidades/estados como nós**. Cada nó mostra demanda por área, concorrência, custo de vida e reputação local.
- Abrir uma filial acende o nó e cria uma **linha luminosa** até a sede. As filiais trocam indicações de clientes por essas linhas: quanto mais conectada a rede, maior o bônus (o efeito de "rede" do metrô).
- **Para juiz, promotor e defensor:** o mapa mostra as comarcas e a carreira avança por **remoções e promoções**, ou seja, você se muda no mapa.

### 9.2 Mapa-múndi
- Liberado no nível 4. Os nós são **cidades globais** (Nova York, Londres, São Paulo, Milão, Paris, Lisboa e outras via DLC).
- **Requisitos para abrir em outro país** (simplificados):
  1. **Sócio local habilitado** naquele país (contratar ou fazer joint venture), **ou**
  2. Você mesmo **revalidar o diploma** (estudar e fazer o exame daquele país, seção 9.4).
  3. **Idioma** mínimo em nível 40 (ou ter um diretor local fluente).
- **Rotas internacionais:** contas globais (multinacionais) exigem presença em vários países ligados e rendem muito.

### 9.3 Visual da rede
De noite o mapa mostra as linhas pulsando com o fluxo de casos. Quanto mais o império cresce, mais bonito o mapa fica, e esse é o "print de orgulho" que o jogador compartilha.

### 9.4 Revalidação e carreira internacional
Qualquer personagem pode estudar em outro país (mestrado ou LL.M. de 1 a 2 anos) e fazer o exame local. Isso libera atuar ou abrir um escritório ali sem sócio e cria personagens "globais" que trocam de sistema jurídico no meio da vida.

---

## 10. Reputação, ética e eventos

### 10.1 Três reputações
| Medidor | Efeito |
|---------|--------|
| ⭐ **Prestígio** (público/mídia) | Clientes grandes, eleições, nomeações |
| 🎓 **Respeito dos pares** | Indicações, contratar talentos, nomeação para tribunais |
| ⚖️ **Integridade** | Oculta em parte. Baixa = risco de escândalo e **processo disciplinar** (suspensão ou cassação) |

### 10.2 Dilemas éticos
- Um cliente confessa o crime em sigilo: continuar na defesa (dever profissional) ou abandonar o caso?
- Uma prova que prejudica o seu cliente aparece: entregar ou "esquecer"? (Esquecer dá vitória agora e uma bomba-relógio de Integridade depois.)
- Um juiz amigo oferece "facilitar" o processo.
- Um sócio quer cobrar horas não trabalhadas.

Atalhos antiéticos sempre dão ganho imediato e risco futuro. O jogo nunca obriga a corrupção.

### 10.3 Eventos do mundo
Crise econômica (falências: o Empresarial cai, a Recuperação sobe), pandemia (audiências virtuais), reforma trabalhista ou tributária (picos de demanda por área), escândalo na concorrência (chance de contratar talentos), mudança de governo (nomeações).

---

## 11. Legado e meta-progressão

- **Fim da vida profissional:** aposentadoria voluntária, compulsória (juízes têm idade-limite em vários países) ou morte natural.
- **Tela de Legado:** linha do tempo animada da carreira, com casos lendários, cargos, patrimônio, família e frases de NPCs.
- **Dinastia Jurídica:** continuar jogando como **filho, filha ou pupilo**, com herança de parte do dinheiro, do escritório (se houver), um traço do pai ou da mãe e o **sobrenome famoso**, que dá Prestígio inicial mas também expectativas: eventos de "vivendo à sombra do pai/da mãe".
- **Pontos de Legado (meta-moeda):** ganhos em cada vida e gastos em bônus permanentes de início (traço extra, faculdade melhor, país extra desbloqueado). É o gancho de "só mais uma vida".
- **Hall da Fama** (como no MetroSystem): ranking online por categoria (maior firma, juiz menos reformado, defensor com mais absolvições).

---

## 12. Ganchos de engajamento e modelo comercial

### 12.1 Por que vicia (de forma saudável)
| Gancho | Implementação |
|--------|---------------|
| Recompensa variável | Raridade dos casos, Vitórias Históricas, teses novas, eventos |
| Progresso sempre visível | O escritório cresce, o mapa acende, a casa muda |
| "Só mais uma semana" | A semana termina sempre com um *cliffhanger* (resultado de caso pendente, evento chegando) |
| Coleção | Álbum de teses, troféus, conquistas |
| Histórias emergentes | NPCs com memória, dilemas, consequências tardias |
| Meta-progressão | Legado e Dinastia |
| Desafio social | **"Caso do Dia"**: o mesmo caso com a mesma *seed* para todos, com ranking global |
| Temporadas | Pacotes temáticos gratuitos (ex.: "Temporada Direito Digital", "Temporada Grandes Júris") |

### 12.2 Modelo de negócio recomendado
- **PC/Console (Steam, Switch):** jogo **premium** (preço médio de indie) + **DLCs de países** e expansões ("Política & Tribunais Superiores", "Direito Internacional & ONU").
- **Mobile:** versão *free-to-start* (faculdade + primeira carreira grátis, compra única libera o resto) e cosméticos (roupas, móveis, temas de mapa).
- **Evitar:** *loot boxes* pagas (proibidas ou restritas em alguns países, como Bélgica, e malvistas pelo público), *pay-to-win* e energia limitada por tempo.

---

## 13. Direção visual e áudio

### 13.1 Estilo
- **2.5D isométrico estilizado**, "cozy-corporativo": cores vivas, personagens *chibi* de proporção média e muito humor visual (papéis voando, café derramado, gato do escritório).
- **Tribunal:** muda para **câmera dramática**, com retratos grandes e expressivos, linhas de velocidade e câmera lenta na rolagem do veredito.
- **Paleta por país** (o país "pinta" o jogo inteiro):

| País | Paleta e motivos |
|------|------------------|
| EUA | Azul-marinho, latão, madeira clara; arranha-céus e bandeiras |
| Brasil | Verde, amarelo e concreto modernista; plantas tropicais |
| Inglaterra | Madeira escura, vinho, perucas e becas; chuva na janela |
| Itália | Mármore, terracota; *palazzi* e espresso |
| França | Azul e dourado *art nouveau*; Haussmann |
| Portugal | Azulejo azul e branco, calçada portuguesa; elétrico amarelo |

### 13.2 Evolução visual (o progresso que se vê)
- **Personagem:** mochila e jeans → terno barato → alfaiataria → toga ou beca do cargo.
- **Escritório:** quarto de república → sala comercial → andar → prédio próprio com o seu nome na fachada.
- **Mapa:** apagado → rede acesa → mapa-múndi pulsando.

### 13.3 Áudio
- Trilha *lo-fi jazz* para a gestão e orquestral tensa no julgamento, crescendo até o veredito.
- SFX marcantes: martelo, carimbo, caixa registradora, e o anúncio do veredito dublado em 6 idiomas.

---

## 14. Telas principais (UI)

```
┌──────────────────────────────────────────────────────────────────────┐
│ 👤 Ana Ribeiro · 34 · Sócia  ❤️82 ⚡64 😰41 😊70   💰 R$ 1,2M  ⭐68 🎓55 ⚖️80 │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│              [ VISÃO PRINCIPAL: Escritório isométrico ]              │
│                 (ou Mapa · Casa · Tribunal)                          │
│                                                                      │
├───────────────┬───────────────────────────────────┬──────────────────┤
│ 📅 AGENDA     │ 📂 CASOS ATIVOS (cartões c/ raridade)│ 🔔 EVENTOS (3)   │
│ Seg Ter Qua…  │ 🔵 Fraude Construtora · 44% · aud 3d│ Pedro pede aumento│
│ ▦▦▦ ▦▦▦ ▦▦▦   │ ⚪ Divórcio Souza · 88% · lote      │ Filha: recital sex│
├───────────────┴───────────────────────────────────┴──────────────────┤
│  🏢 Escritório   🗺️ Mapa   🏠 Vida   🧠 Skills   👥 Pessoas   ▶ PRÓXIMA SEMANA │
└──────────────────────────────────────────────────────────────────────┘
```
- **Um botão gigante, "Próxima Semana":** o ritmo é dado pelo jogador, não por tempo real, o que funciona bem no mobile.
- **Notificações** agrupadas e no máximo 3 eventos por semana, para não sobrecarregar.

---

## 15. Arquitetura técnica

### 15.1 Engine recomendada: **Godot 4**
| Motivo | Detalhe |
|--------|---------|
| Gratuita e sem royalties | Bom para um projeto indie comercial |
| 2D/2.5D excelente | Isométrico com TileMap; UI forte |
| Exporta para tudo | Windows, Mac, Linux, Android, iOS, Web, consoles (via parceiros) |
| Orientada a dados | JSON + `Resource` para países, casos e teses |

> Alternativas: **Unity** (mais assets prontos, mais pesada) ou **Phaser 3 + React/TypeScript** (se a prioridade for Web, prototipagem rápida e integração com Firebase).

### 15.2 Sistemas (módulos)
```
core/
  GameState         # estado único serializável
  TimeSystem        # semanas, idade, calendário, feriados por país
  RNG               # seed determinística (necessária para o "Caso do Dia")
  EventBus          # sinais entre sistemas
systems/
  LifeSystem        # medidores pessoais, relacionamentos, patrimônio
  ScheduleSystem    # agenda de 21 blocos, execução semanal
  EducationSystem   # faculdade, semestres, exames, concursos
  CareerSystem      # máquina de estados por arquétipo + config do país
  CaseSystem        # geração procedural e roteirizada; ciclo do caso
  CaseResolution    # chance, preparação, estratégia, reviravoltas, momento decisivo, veredito
  SkillSystem       # XP, níveis, árvores de perks
  OfficeSystem      # salas, móveis, funcionários, finanças
  DelegationSystem  # políticas, delegados, testes de decisão
  MapSystem         # nós nacionais e globais, filiais, rotas
  ReputationSystem  # prestígio, pares, integridade
  WorldEventSystem  # crises, reformas, eventos
  LegacySystem      # herdeiros, pontos de legado
  SaveSystem        # JSON + versão + migração; nuvem opcional
data/
  countries/*.json  cards/*.json  case_templates/*.json  scripted_cases/*.json
  traits.json  perks/*.json  rooms.json  events/*.json  i18n/*.csv
```

### 15.3 Modelos de dados (exemplos)
```jsonc
// Tese colecionável
{ "id": "tese_prova_ilicita", "raridade": "rara",
  "bonus": 8, "aplicaEm": { "area": "penal", "lado": "defesa" },
  "modificadores": { "civil_law": 1.0, "common_law": 1.2 },
  "texto": "teses.prova_ilicita.desc" }

// Modelo de caso
{ "id": "trab_justa_causa", "area": "trabalho", "raridade": "incomum",
  "partes": { "cliente": "@npc.trabalhador", "adversario": "@npc.empresa_media" },
  "dificuldade": [25, 45], "prazoSemanas": [4, 8],
  "skills": { "trabalho": 0.5, "escrita": 0.3, "negociacao": 0.2 },
  "perfilAdversario": "empresa_grande",   // afeta a chance de recurso do adversário
  "instanciaMax": "segunda",              // "segunda" ou "superior"
  "apoios": ["pesquisa_jurisprudencia", "preparar_testemunha", "perito"],
  "reviravoltas": [{ "chance": 0.3, "evento": "testemunha_muda_versao" }],
  "momentoDecisivo": "md_contradicao_testemunha" }

// Funcionário
{ "id": "emp_042", "nome": "Pedro Alves", "cargo": "advogado_pleno",
  "skills": { "oratoria": 52, "escrita": 61, "pesquisa": 70, "gestao": 30 },
  "tracos": ["ambicioso", "perfeccionista"], "salario": 9500,
  "moral": 72, "lealdade": 55, "etica": 80, "fadiga": 20 }

// Política de delegação
{ "id": "pol_auto_trab", "delegado": "emp_017", "gatilho": "novo_caso",
  "condicao": { "area": "trabalho", "raridadeMax": "incomum" },
  "acao": "atribuir_automatico", "limiteAprovacao": 30000 }
```

### 15.4 Fórmulas-base (pontos de partida para balanceamento)
```
skillCaso        = Σ (peso_i × skill_i)                      // da pessoa ou da dupla (70% líder / 30% apoio)
bonus            = preparacao + apoios + estrategia + especializacao + (prestigio−50)/10
                   + juiz + familia + estadoPessoal + tracos + teses
chance           = clamp(0.05, 0.95, sigmoid((skillCaso + bonus − dificuldade) / 12))
                   // skill = dificuldade → 50% · +12 → 73% · +24 → 88% · −12 → 27%
chanceJuri       = 0.5 + (chance − 0.5) × 0.8
preparacao       = Σ max(0, 6 − n) para n = 1..blocos   // +5, +4, +3, +2, +1 (máx. +15)
testeMomento     = sigmoid((skillUsada − dificuldadeMomento) / 10)

valorCausa       = 5000 × 1.1^dificuldade × rand(0.8, 1.2) × fatorEconomicoPais
honorarios       = 0.20 × valorCausa            // só na vitória; acordo: 0.20 × valorAcordo
reputacaoGanho   = {comum:1, incomum:2, raro:3, epico:4, lendario:6}[raridade] × multEstrategia
reputacaoPerda   = {comum:2, incomum:3, raro:5, epico:7, lendario:10}[raridade] × multEstrategia
custasRecurso    = 0.01 × valorCausa
chanceReverter   = chance(dificuldade + 10×instancia − 10 "decisão contrária")
chanceManter     = chance(dificuldade + 10×instancia + 10 "decisão favorável")
chanceRecursoAdv = clamp(0.05, 0.95, baseRaridade + perfilAdversario − (historica ? 0.25 : 0))
xpSkill          = 10 × raridadeMult × (1 se usada no caso, 0.3 se só estudada)
moralEquipe      += (salarioRelativo − 1)×10 + salas_descanso×2 − fadigaMedia×0.1 + liderancaChefe×0.05
erroDelegado     = max(0.02, 0.35 − competenciaDelegado/300 − eticaDelegado/500)
burnoutRisco     = max(0, (estresse − 80) / 20)   // testado a cada semana
captacaoFilial   = demandaLocal × (prestigio/50) × (1 + 0.1 × filiaisConectadas)
```

### 15.5 Save e localização
- Save local em JSON com `versao` e migração; nuvem opcional (Steam Cloud, Google Play Games, Firebase).
- Localização via CSV com chaves (`cards.prec_boa_fe.desc`), cobrindo os 6 idiomas do lançamento: PT, EN, IT, FR, mais ES e DE.
- Nomes de cargos e instituições vêm **do arquivo do país**, nunca fixos no código.

---

## 16. Escopo e roadmap

### 16.1 Princípio de escopo
O núcleo (Agenda, Casos, Vida, Escritório níveis 1–3) precisa ser **divertido sozinho em 1 país** antes de qualquer expansão.

### 16.2 Fases
| Fase | Conteúdo | Meta de validação |
|------|----------|-------------------|
| **Protótipo (4–6 semanas)** | Sistema de casos (chance, preparação, estratégias, reviravoltas, momento decisivo, veredito) com 40 modelos de caso, sem arte final | Escolher e preparar casos é divertido por 1 hora seguida? |
| **Vertical Slice (3–4 meses)** | **Brasil**: faculdade, OAB, Advogado, agenda, vida básica, Escritório níveis 1–2, arte final de 1 cenário | 1 hora de jogo que "pede" a próxima |
| **Alpha (+4 meses)** | **EUA** (valida common law e júri), carreiras Juiz e Promotor, Escritório nível 3 com delegação, mapa nacional | A abstração global funciona? |
| **Beta (+4 meses)** | Inglaterra, Itália, França, Portugal; Defensor; níveis 4–5; mapa-múndi; Legado/Dinastia | Retenção D1, D7 e D30 em playtests |
| **Lançamento** | Polimento, 6 idiomas, conquistas, Caso do Dia, Hall da Fama | Early Access no Steam |
| **Pós-lançamento** | Temporadas, DLCs de países, Modo Estudante, mobile | |

### 16.3 Critérios de pronto do Vertical Slice
1. Criar personagem, cursar 10 semestres e passar (ou repetir) a OAB.
2. Jogar pelo menos 15 casos diferentes com 3 raridades, usando estratégias, apoios, momento decisivo e recursos.
3. Abrir escritório, contratar 3 pessoas, revisar o trabalho delas e lidar com 5 tipos de evento de RH.
4. Agenda semanal com 4 medidores pessoais funcionando, um relacionamento romântico e um dilema de família.
5. Save e load estáveis e 60 FPS em notebook básico.

---

## 17. Riscos e mitigação
| Risco | Mitigação |
|-------|-----------|
| Complexidade excessiva | Liberar sistemas aos poucos (tutorial disfarçado); auto-resolver; no máximo 5 medidores por tela |
| Imprecisão jurídica por país | Arquivo de dados por país + consultor local + aviso de "simplificação lúdica" |
| Casos repetitivos ou sensação de "só sorte" | Chance sempre visível e explicada; momentos decisivos; reviravoltas; raridades; recurso; resolução em lote no late game |
| Late game vazio | Delegação com risco, crises globais, eleições e nomeações, Dinastia |
| Tom sério demais | Humor visual, NPCs carismáticos, eventos leves entre os pesados |
| Temas sensíveis (crimes, assédio) | Tratamento respeitoso, opção de filtro de conteúdo, classificação etária 12+/PEGI 12 |

---

## 18. Prompt sugerido para começar a programar
> "Usando Godot 4 (GDScript), implemente o **Protótipo** do jogo TOGA conforme as seções 5 e 15 deste documento: o sistema `CaseResolution` com a ficha do caso (dificuldade, skills exigidas com pesos, chance explicada em detalhes), preparação por blocos com retorno decrescente, os apoios e as 4 estratégias da seção 5.4, os modificadores automáticos, reviravoltas, o Momento Decisivo com chance por opção (5.5), o veredito com a animação da balança (5.6), o valor da causa crescendo com a dificuldade, honorários de 20% só na vitória, ganho e perda de reputação (5.1) e os recursos opcionais para os dois lados com a chance exibida (5.7). Carregue os modelos de caso de `data/case_templates/*.json` e as teses de `data/teses/*.json` (formatos da seção 15.3). Crie 40 modelos de caso e 15 teses de exemplo, com uma agenda simples de 21 blocos por semana. UI provisória com retângulos e texto. Inclua testes unitários para a fórmula de `chance` (limites de 5% e 95%, júri e preparação) da seção 15.4."

---

### Apêndice A: Exemplo de primeira hora de jogo
1. **Min 0–5:** criação da Ana: origem modesta, traços *Oradora nata* + *Ansiosa*, estuda no Brasil.
2. **Min 5–25:** 2 semestres; ela entra no núcleo de prática e resolve o primeiro caso (tutorial do sistema de chances) defendendo um inquilino. Conhece o Lucas no júri simulado.
3. **Min 25–40:** estágio em um escritório tóxico (evento: o chefe pede para ela ficar até meia-noite). Primeiro dilema entre vida e trabalho.
4. **Min 40–50:** formatura (cutscene) e estudo para a OAB com a agenda (risco de burnout pelo traço *Ansiosa*).
5. **Min 50–60:** aprovada! Escolha: aceitar a vaga de associada júnior em uma firma grande ou alugar uma sala sozinha? O jogador quer saber o que vem depois, e esse é o gancho.
