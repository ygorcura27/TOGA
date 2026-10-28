# LexSystem — Simulador de Redes de Escritórios de Advocacia

> Documento de design e especificação técnica para programar o jogo.
> Inspiração: **MetroSystem** (metrosystemgame.com), um simulador e editor de redes de metrô no navegador.
> Aqui a cidade continua sendo o mapa, mas no lugar de estações, linhas e trens entram **escritórios, fóruns, áreas do direito e equipes jurídicas**.

---

## 1. Visão geral

| Item | Definição |
|------|-----------|
| Gênero | Simulação / gestão / sandbox, com editor de rede sobre mapa real |
| Plataforma | Navegador (desktop primeiro, responsivo depois) |
| Sessão típica | 20 a 60 minutos (um "ano jurídico" simulado) |
| Público | Advogados, estudantes de Direito, gestores jurídicos e quem gosta de *tycoon* |
| Pitch | "Monte uma banca de advocacia em uma cidade real: abra escritórios, ligue-os aos fóruns com equipes especializadas, cumpra prazos e cresça sem quebrar o caixa." |

### 1.1 Como o MetroSystem vira LexSystem

| MetroSystem (metrô) | LexSystem (advocacia) |
|---------------------|------------------------|
| Mapa da cidade (exemplo: São Paulo) | Mapa da cidade com fóruns, varas e tribunais reais ou gerados |
| Estação | **Nó**: escritório (sede/filial), fórum, vara, tribunal, delegacia, cartório, cliente corporativo |
| Linha (cor, traçado) | **Área de atuação**: Trabalhista, Cível, Tributário, Família, Criminal, Empresarial (cada uma com uma cor) |
| Trem | **Equipe**: advogado(s) + estagiário(s) que circulam pela linha levando processos |
| Passageiro | **Demanda**: caso, processo ou consulta com origem (cliente) e destino (órgão julgador) |
| Lotação do trem | Capacidade da equipe (processos ativos simultâneos) |
| Intervalo entre trens | Frequência de atendimento (com que periodicidade a equipe "passa" em cada nó) |
| Pico / Vale / Noite | **Pauta** (manhã de audiências) / **Expediente** (tarde) / **Plantão** (noite, peticionamento eletrônico) |
| Velocidade 1× / 4× / 10× / 25× e pausa | Iguais, mais os botões +1h e +6h |
| Resumo e parâmetros de custo | Folha, aluguel, OAB, custas, deslocamento, software, contra honorários |
| Moeda e câmbio | Moeda configurável (BRL padrão, USD, EUR) |
| Camadas | Camadas do mapa: fóruns, renda por bairro, concorrência, criminalidade, empresas |
| Hall da Fama | Ranking de bancas (lucro, taxa de êxito, reputação) |
| Exportar JSON / GeoJSON | Igual: projeto `.json` e rede `.geojson` |
| Tutorial interativo | Tutorial "Primeiro escritório" |

---

## 2. Loop principal

```
┌────────────────────────────────────────────────────────────────┐
│ 1. OBSERVAR   mapa de demanda (clientes surgindo pelos bairros)│
│ 2. CONSTRUIR  abrir escritório, desenhar área de atuação       │
│ 3. ALOCAR     contratar equipes e pôr cada uma em uma linha    │
│ 4. SIMULAR    o tempo corre e as equipes atendem e protocolam  │
│ 5. RESULTADO  honorários entram, prazos vencem, reputação muda │
│ 6. AJUSTAR    rebalancear, expandir ou cortar custos           │
└──────────────────────── volta ao passo 1 ──────────────────────┘
```

### 2.1 Objetivos
- **Modo Carreira:** cumprir metas por fase (exemplo: "atingir R$ 500 mil de faturamento anual com taxa de perda de prazo abaixo de 2%").
- **Modo Sandbox:** dinheiro infinito, só o editor e a simulação (como o "Novo mapa" do MetroSystem).
- **Modo Cenário:** mapas prontos, como "São Paulo: Fórum João Mendes + TRT-2" ou "Rio: TRT-1 e Fórum Central".

### 2.2 Derrota (Modo Carreira)
- Caixa negativo por 3 meses seguidos, ou
- Reputação abaixo de 10, ou
- 3 **perdas de prazo fatal** no mesmo trimestre, que viram processo disciplinar na OAB.

---

## 3. Entidades e mecânicas

### 3.1 Nós (o equivalente às estações)

| Tipo | Função | Custo de abertura | Manutenção/mês |
|------|--------|-------------------|----------------|
| Sede | Origem obrigatória de toda linha; define o limite de equipes | R$ 80.000 | R$ 12.000 |
| Filial | Atende demanda local; aumenta o raio de captação | R$ 35.000 | R$ 6.000 |
| Ponto de atendimento (coworking) | Barato, com capacidade baixa | R$ 5.000 | R$ 1.500 |
| Fórum / Vara / Tribunal | Nó **fixo** do mapa, que não se compra; é o destino dos processos | — | — |
| Cliente corporativo | Nó especial que gera demanda recorrente (contrato de partido) | — | — |

Atributos de cada nó:
`id, tipo, nome, lat, lng, capacidade, raioCaptacao, nivel (1-3), areasAtendidas[]`

### 3.2 Linhas (áreas de atuação)
- O jogador desenha a linha clicando em nós sucessivos, como no traçado de uma linha de metrô.
- Toda linha precisa começar em um escritório próprio (sede ou filial) e passar por pelo menos um órgão julgador compatível. Exemplos: Trabalhista exige uma Vara do Trabalho ou TRT; Tributário exige uma Vara da Fazenda ou o CARF.
- **Custo da linha** = soma das distâncias entre os nós × custo de deslocamento por km + taxa de especialização da área.
- Atributos: `id, area, cor, nos[], equipes[], tempoCiclo`.

| Área | Cor | Ticket médio | Duração média do caso | Risco de prazo |
|------|-----|--------------|-----------------------|----------------|
| Trabalhista | 🟠 laranja | baixo | 18 meses | alto |
| Cível | 🔵 azul | médio | 24 meses | médio |
| Família | 🟣 roxo | médio | 12 meses | médio |
| Criminal | 🔴 vermelho | alto | 10 meses | muito alto (réu preso) |
| Tributário | 🟢 verde | muito alto | 36 meses | baixo |
| Empresarial/Contratos | ⚫ cinza | alto | 3 meses (consultivo) | baixo |

### 3.3 Equipes (o equivalente aos trens)
- Composição: `socio | associado | junior | estagiario`, cada cargo com salário, capacidade e qualidade próprios.
- A equipe **percorre a linha em ciclo** (ida e volta), como um trem: em cada nó ela pega e entrega demandas.
- **Capacidade** = soma da capacidade dos membros. Exemplo: sócio 15, associado 25, júnior 20, estagiário 10 processos ativos.
- **Qualidade** (0-100) = média ponderada da senioridade. Ela afeta a taxa de êxito.
- **Fadiga:** acima de 90% de lotação por muito tempo, a qualidade cai e o risco de perder prazo sobe.

| Cargo | Salário/mês | Capacidade | Qualidade | Pode fazer audiência |
|-------|-------------|------------|-----------|----------------------|
| Sócio | R$ 30.000 | 15 | 95 | sim |
| Associado sênior | R$ 15.000 | 25 | 80 | sim |
| Júnior | R$ 7.000 | 20 | 60 | sim |
| Estagiário | R$ 2.000 | 10 | 35 | não (só acompanha) |

### 3.4 Demanda (o equivalente aos passageiros)
- Surge nos **bairros** (células de um grid ou hexágonos H3). A taxa depende de população, renda e perfil:
  - bairros industriais geram muito Trabalhista;
  - bairros de alta renda geram Família, Tributário e Empresarial;
  - a região central gera Criminal e Cível.
- Cada demanda tem: `id, area, origem(celula), destino(orgaoJulgador), valorCausa, honorarioEsperado, prazoFatal, complexidade(1-5), status`.
- **Captação:** a demanda só entra para a banca se houver um nó próprio dentro do raio que atenda aquela área. Se não houver, ela vai para a concorrência e aparece em cinza no mapa.
- **Fila:** se a equipe está lotada, a demanda espera no nó. A espera aumenta a insatisfação e, depois de N dias, o cliente desiste.

### 3.5 Ciclo de vida do processo
```
CAPTADO → PETIÇÃO INICIAL → AGUARDANDO AUDIÊNCIA → INSTRUÇÃO → SENTENÇA → (RECURSO?) → ENCERRADO
                 │                    │                                         │
                 └── prazo ───────────┴── prazo ── ... ──────────────────────────┘
```
- Cada etapa tem um **prazo** em dias úteis (o calendário pula fins de semana, feriados e o recesso de 20/12 a 20/01).
- O processo só avança quando uma equipe da linha **passa pelo órgão julgador de destino** dentro do prazo. Esse é o coração da mecânica: frequência e traçado da linha importam.
- **Perda de prazo:** derrota automática no processo, multa de reputação e chance de reclamação na OAB.
- **Resultado da sentença:** `P(êxito) = base_area × (qualidadeEquipe/100) × (1 − complexidade×0.08) × bônusEspecialização`.

### 3.6 Períodos do dia (o equivalente a Pico/Vale/Noite)

| Período | Horário | Efeito |
|---------|---------|--------|
| **Pauta** | 08h–12h | Audiências acontecem. Precisa haver advogado presente no fórum, e estagiário sozinho não conta |
| **Expediente** | 12h–19h | Atendimento de clientes e captação em dobro nos escritórios |
| **Plantão** | 19h–00h | Só protocolo eletrônico (PJe/e-SAJ): avança etapas sem deslocamento, com custo de horas extras e fadiga |
| Madrugada | 00h–08h | Nada acontece. O tempo pode ser acelerado automaticamente |

### 3.7 Economia

**Receitas**
- Honorários contratuais: entrada na captação mais parcelas mensais.
- Honorários de êxito: percentual do valor da causa quando a sentença é favorável.
- Sucumbência: bônus quando ganha.
- Partido mensal: receita fixa dos clientes corporativos.

**Despesas**
- Folha (salários + encargos de 70%).
- Aluguel e manutenção dos nós.
- Deslocamento: km rodados pelas equipes × R$/km.
- Custas e preparo recursal, adiantados pela banca.
- Anuidade da OAB por advogado e software jurídico por usuário.

**Painel "Resumo de custos"** (como no MetroSystem): tabela mensal com receitas, despesas, margem e projeção de 12 meses.

**Parâmetros editáveis** (como os "Parâmetros de custo"): todos os valores acima ficam em `config/economia.json` e podem ser ajustados no menu.

### 3.8 Reputação (0–100)
- Sobe com êxito, prazo cumprido, baixa espera e avaliação do cliente.
- Cai com perda de prazo, derrota, fila longa e fadiga alta.
- Afeta o **raio de captação** (+1% por ponto acima de 50) e o ticket médio.

### 3.9 Eventos aleatórios
- **Greve do Judiciário:** prazos suspensos por X dias.
- **Instabilidade do PJe:** o plantão fica indisponível naquela noite.
- **Mutirão de conciliação:** chance de acordo dobrada na semana.
- **Reforma legislativa:** a demanda de uma área sobe ou cai 30% por 6 meses.
- **Cliente grande quer contrato de partido:** surge um nó corporativo, que exige uma linha até ele.
- **Sócio pede saída:** leva parte da carteira se a reputação for baixa.

### 3.10 Progressão e desbloqueios
| Fase | Meta | Desbloqueia |
|------|------|-------------|
| 1 — Escritório de bairro | Faturar R$ 100 mil | Filial e Cível |
| 2 — Banca regional | 3 nós e 2 áreas | Tribunal (2ª instância) e recursos |
| 3 — Full service | 5 áreas ativas | Tributário e clientes corporativos |
| 4 — Big Law | R$ 5 mi/ano e reputação 80 | Tribunais superiores (STJ/TST) e expansão para outra cidade |

---

## 4. Interface (UI)

Layout inspirado no MetroSystem:

```
┌──────────────────────────────────────────────────────────────────────┐
│ ☰ LexSystem   Tutorial | Hall da Fama | Mapa ▾   Seg 08:42  ⏸ 1× 4× 10× 25× +1h +6h │
├──────────┬───────────────────────────────────────────────────────────┤
│ SIDEBAR  │                                                           │
│ ◀ ▶      │                    MAPA (Leaflet/MapLibre)                │
│          │     ● escritório   ◆ fórum   ── linhas coloridas          │
│ Nós      │     ▪ equipes animadas percorrendo as linhas              │
│ Linhas   │     ░ heatmap de demanda                                  │
│ Equipes  │                                                           │
│ Processos│                                                           │
│ Finanças │                                     [Enquadrar rede]      │
│ Camadas  │                         Estilo: Mapa | Claro | Escuro | Satélite │
├──────────┴───────────────────────────────────────────────────────────┤
│ Caixa R$ 182.340 ▲  | Reputação 64 | Processos 312 | Prazos hoje 7 ⚠ │
└──────────────────────────────────────────────────────────────────────┘
```

### 4.1 Controles
| Ação | Entrada |
|------|---------|
| Abrir escritório | Ferramenta "Nó" e clique no mapa |
| Desenhar linha | Ferramenta "Linha", clicar nos nós em sequência e Enter para fechar |
| Editar traçado | Arrastar um nó da linha; botão direito remove |
| Contratar ou alocar equipe | Arrastar a equipe da sidebar para cima da linha |
| Pausar | Espaço |
| Velocidade | Teclas 1, 2, 3, 4 (1×, 4×, 10×, 25×) |
| Avançar tempo | H (+1h), Shift+H (+6h) |
| Enquadrar rede | F |
| Camadas | L |

### 4.2 Painéis
- **Inspector de nó:** fila, demandas por área, capacidade e lucro do nó.
- **Inspector de linha:** tempo de ciclo, lotação média, prazos em risco e margem.
- **Agenda:** calendário com audiências e prazos dos próximos 15 dias úteis.
- **Alertas:** prazos vencendo em até 48h, equipes acima de 90% e caixa baixo.
- **Gráficos:** faturamento mensal, taxa de êxito por área, lotação por equipe.

### 4.3 Idiomas
PT (padrão), EN, ES, FR, DE, IT, via `i18n/*.json`.

---

## 5. Arquitetura técnica

### 5.1 Stack recomendada
| Camada | Tecnologia | Motivo |
|--------|------------|--------|
| Linguagem | TypeScript | Tipos para as entidades da simulação |
| Build | Vite | Rápido e simples |
| Mapa | MapLibre GL JS (ou Leaflet + OSM) | Gratuito, com estilos claro, escuro e satélite |
| Render das equipes | Camada WebGL do MapLibre ou canvas sobreposto | Milhares de pontos animados |
| UI | Preact ou Svelte (leve) | Sidebar e painéis |
| Estado | Store única imutável (Zustand ou caseira) | Facilita salvar e carregar |
| Simulação | Web Worker | Não trava a UI em 25× |
| Persistência | localStorage + export JSON (Firebase opcional para Hall da Fama) | |
| Deploy | Netlify | |
| Testes | Vitest | Testar fórmulas e o *tick* |

> Alternativa sem build: HTML/CSS/JS puro + Leaflet via CDN, no mesmo estilo do Hub Tower.

### 5.2 Estrutura de pastas
```
lexsystem/
├── index.html
├── src/
│   ├── main.ts                 # bootstrap
│   ├── state/
│   │   ├── store.ts            # estado global
│   │   └── types.ts            # interfaces (seção 5.3)
│   ├── sim/
│   │   ├── worker.ts           # loop da simulação (Web Worker)
│   │   ├── clock.ts            # tempo, dias úteis, feriados, recesso
│   │   ├── demand.ts           # geração de demanda por célula
│   │   ├── routing.ts          # equipes percorrendo linhas
│   │   ├── lifecycle.ts        # etapas do processo e prazos
│   │   ├── economy.ts          # receitas e despesas
│   │   ├── reputation.ts
│   │   └── events.ts           # eventos aleatórios
│   ├── map/
│   │   ├── mapView.ts          # MapLibre e estilos
│   │   ├── layers.ts           # heatmap, fóruns, concorrência
│   │   └── tools.ts            # ferramentas Nó/Linha/Selecionar
│   ├── ui/
│   │   ├── TopBar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Inspector.tsx
│   │   ├── Agenda.tsx
│   │   └── Charts.tsx
│   ├── io/
│   │   ├── saveLoad.ts         # JSON
│   │   └── geojson.ts          # export GeoJSON
│   └── i18n/
├── config/
│   ├── economia.json
│   ├── areas.json
│   ├── cargos.json
│   └── feriados.json
├── maps/
│   ├── sao-paulo.json          # fóruns, varas e TRT-2 reais
│   └── rio-de-janeiro.json     # TJRJ e TRT-1
└── tests/
```

### 5.3 Modelo de dados (TypeScript)
```ts
type AreaId = 'trabalhista' | 'civel' | 'familia' | 'criminal' | 'tributario' | 'empresarial';
type NoTipo = 'sede' | 'filial' | 'ponto' | 'forum' | 'vara' | 'tribunal' | 'corporativo';
type Periodo = 'pauta' | 'expediente' | 'plantao' | 'madrugada';

interface No {
  id: string; tipo: NoTipo; nome: string;
  lat: number; lng: number;
  proprio: boolean;              // false para fóruns e tribunais
  nivel: 1 | 2 | 3;
  raioCaptacaoKm: number;
  areasAceitas: AreaId[];        // para órgãos julgadores: competência
  fila: string[];                // ids de Demanda aguardando
}

interface Linha {
  id: string; area: AreaId; cor: string;
  nos: string[];                 // sequência ordenada de ids de No
  equipes: string[];
}

interface Membro { cargo: 'socio' | 'associado' | 'junior' | 'estagiario'; nome: string; }

interface Equipe {
  id: string; linhaId: string | null;
  membros: Membro[];
  posicao: { segmento: number; t: number; sentido: 1 | -1 }; // t ∈ [0,1] no segmento
  carga: string[];               // ids de Processo ativos
  fadiga: number;                // 0-100
}

type Etapa = 'captado' | 'inicial' | 'aguardando_audiencia' | 'instrucao'
           | 'sentenca' | 'recurso' | 'encerrado';

interface Processo {
  id: string; area: AreaId;
  origemCelula: string; destinoNo: string; atendidoPor: string; // id No próprio
  valorCausa: number; honorarioFixo: number; percentualExito: number;
  complexidade: 1 | 2 | 3 | 4 | 5;
  etapa: Etapa;
  prazoFatal: number;            // timestamp simulado
  resultado?: 'exito' | 'derrota' | 'acordo' | 'perda_prazo';
}

interface Jogo {
  versao: number; seed: number;
  relogio: { t: number; velocidade: 0 | 1 | 4 | 10 | 25 };
  caixa: number; reputacao: number;
  nos: Record<string, No>; linhas: Record<string, Linha>;
  equipes: Record<string, Equipe>; processos: Record<string, Processo>;
  historico: { mes: string; receita: number; despesa: number }[];
  config: ConfigEconomia;
}
```

### 5.4 Loop de simulação
- **Tick fixo:** 1 tick = 1 minuto simulado. Em 1× rodam 10 ticks/s; em 25×, 250 ticks/s, com várias passadas por frame dentro do Worker.
- **RNG determinístico** com *seed* (mulberry32), para que todo save seja reproduzível e o Hall da Fama seja verificável.

```ts
function tick(j: Jogo) {
  avancarRelogio(j);                       // trata dias úteis e feriados
  const p = periodoAtual(j.relogio.t);

  if (inicioDeHora(j)) gerarDemanda(j, p);       // Poisson por célula × área
  moverEquipes(j);                               // avança t no segmento pela velocidade
  for (const e of equipesQueChegaramEmNo(j)) {
    entregar(j, e);                              // processos cujo destino é este nó avançam etapa
    embarcar(j, e);                              // puxa da fila até a capacidade
    if (p === 'pauta') realizarAudiencias(j, e);
  }
  if (p === 'plantao') protocoloEletronico(j);   // avança etapas sem deslocamento, custa fadiga
  verificarPrazos(j);                            // vencidos → perda_prazo
  if (inicioDeDia(j))  sortearEventos(j);
  if (inicioDeMes(j))  fecharMes(j);             // folha, aluguel, receitas, reputação
  verificarDerrota(j);
}
```

### 5.5 Fórmulas-chave
```
taxaDemanda(celula, area, periodo) = pop × perfil[area] × multPeriodo[periodo] × (reputacao/50)
tempoCiclo(linha) = Σ dist(nó_i, nó_i+1) / velocidadeKmH × 2 + Σ paradas × 20min
frequenciaNo = nº de equipes / tempoCiclo
riscoPrazo(processo) = max(0, 1 − (prazoRestante / tempoAteProximaPassagem))
P(exito) = base[area] × qualidade/100 × (1 − 0.08×complexidade) × (1 + 0.1×nivelEspecializacao)
deslocamentoMes = Σ km rodados × custoKm
```

### 5.6 Save e load
- Autosave no `localStorage` a cada mês simulado.
- **Exportar `.json`**: o objeto `Jogo` inteiro com `versao`, para migrações futuras.
- **Exportar `.geojson`**: nós como `Point` e linhas como `LineString`, com `properties` de área e cor.
- **Importar `.json`**: valida o schema (Zod) e migra versões antigas.

### 5.7 Dados de mapa
- Fóruns e tribunais: lista curada em `maps/*.json` (nome, lat/lng, competência).
- Demanda por bairro: grid hexagonal (H3, resolução 8) com população e renda aproximadas (dados públicos do IBGE ou valores gerados).
- **Modo Procedural:** gera a cidade e posiciona os fóruns por *seed*, sem precisar de mapa real.

---

## 6. Áudio e visual
- Estilo *flat*, inspirado em diagramas de metrô: linhas grossas e coloridas, nós circulares, fóruns em losango.
- Equipes como pequenas pastas ou pastas de processo que andam pela linha; a cor indica a lotação (verde, amarelo, vermelho).
- Efeitos sonoros discretos: carimbo (protocolo), martelo (sentença), caixa registradora (honorário), alerta (prazo).

---

## 7. Roadmap de implementação

### MVP (fase 1, cerca de 2 a 3 semanas)
- [ ] Mapa com MapLibre, estilos claro e escuro, botão "Enquadrar rede"
- [ ] Ferramenta para criar nós (sede e filial) com fóruns fixos carregados de JSON
- [ ] Ferramenta de linha (uma área: Trabalhista)
- [ ] Equipe animada percorrendo a linha
- [ ] Geração de demanda simples, com fila e embarque
- [ ] Ciclo do processo com 3 etapas e prazo
- [ ] Relógio com pausa, 1×, 4×, 10× e 25×
- [ ] Caixa, folha mensal e honorários
- [ ] Save e load em JSON

### Fase 2
- [ ] As 6 áreas, cargos e composição de equipe
- [ ] Períodos Pauta/Expediente/Plantão
- [ ] Calendário com dias úteis, feriados e recesso
- [ ] Reputação e raio de captação
- [ ] Painéis de inspector, agenda e alertas
- [ ] Resumo de custos e parâmetros editáveis

### Fase 3
- [ ] Eventos aleatórios
- [ ] Modo Carreira com fases e desbloqueios
- [ ] Recursos e 2ª instância
- [ ] Camadas (heatmap, concorrência, renda)
- [ ] Tutorial interativo
- [ ] Exportação em GeoJSON

### Fase 4
- [ ] Hall da Fama (Firebase), com validação por *seed* e replay
- [ ] Mapas reais (SP e RJ) e modo procedural
- [ ] i18n com 6 idiomas
- [ ] Modo mobile

---

## 8. Critérios de pronto (MVP)
1. Consigo abrir uma sede, desenhar uma linha Trabalhista até uma Vara do Trabalho e alocar uma equipe.
2. A equipe anda pela linha, pega demandas na sede e "entrega" no fórum.
3. Processos avançam de etapa só quando a equipe passa pelo fórum; se o prazo vence, o processo é perdido.
4. No fim do mês, o caixa desconta a folha e soma os honorários; o painel mostra o resultado.
5. O jogo roda a 25× sem travar a UI e salva e carrega pelo JSON.
6. Testes unitários cobrem `P(exito)`, o cálculo de dias úteis e o fechamento de mês.

---

## 9. Prompt sugerido para começar a codar com IA
> "Crie o MVP do LexSystem conforme a seção 7 (MVP) deste documento, usando Vite + TypeScript + MapLibre GL. Comece por `src/state/types.ts` (seção 5.3), depois `src/sim/clock.ts` e `src/sim/worker.ts` (seção 5.4), e por fim o mapa com as ferramentas de nó e linha. Use os valores de `config/economia.json` das tabelas 3.1 e 3.3. Inclua testes Vitest para as fórmulas da seção 5.5."

---

## 10. Referência
- MetroSystem: https://metrosystemgame.com/ (simulador e editor de redes metroviárias, com controles de tempo, períodos Pico/Vale/Noite, parâmetros de custo, camadas e exportação JSON/GeoJSON).
