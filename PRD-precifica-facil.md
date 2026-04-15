# PRD — Precifica Fácil
**Versão:** 1.0  
**Data:** Abril 2026  
**Status:** Produção

---

## 1. Visão Geral do Produto

**Precifica Fácil** é uma calculadora web de precificação de produtos voltada a pequenas empresas brasileiras. A ferramenta permite que empreendedores calculem o preço ideal de venda de um produto considerando todos os custos e encargos envolvidos — impostos, taxas de cartão, comissões, despesas operacionais e margem de lucro desejada — de forma simples e em tempo real.

O produto também inclui um **Simulador de Cenários** que compara o impacto financeiro de três modalidades de pagamento (Venda à Vista, Cartão 1X e Cartão 12x) sobre a margem efetiva do vendedor.

---

## 2. Problema

Pequenos empresários brasileiros frequentemente precificam produtos sem considerar a totalidade dos encargos, resultando em margens reais menores que o esperado ou em operações deficitárias. Os principais pontos de dor são:

- Dificuldade em calcular o preço correto considerando imposto, taxa de cartão, comissão e custo operacional simultaneamente
- Desconhecimento do impacto real do parcelamento no cartão sobre a margem de lucro
- Falta de uma ferramenta simples e rápida que não exija planilhas complexas ou conhecimento contábil

---

## 3. Público-Alvo

- Microempreendedores individuais (MEI) e empresas do Simples Nacional
- Varejistas, prestadores de serviço e distribuidores de pequeno porte
- Gestores financeiros de pequenas empresas sem acesso a software de gestão robusto

---

## 4. Escopo e Funcionalidades

### 4.1 Calculadora de Precificação

**Entradas do usuário:**

| Campo | Tipo | Descrição |
|---|---|---|
| Custo unitário | Monetário (R$) | Custo de aquisição ou produção do produto |
| Regime Tributário | Seleção (2 opções) | Simples Nacional ou Substituição Tributária |
| Alíquota de Imposto | Percentual (%) | Alíquota efetiva do Simples Nacional (desabilitado no ST) |
| Taxa de Cartão | Percentual (%) | Taxa da maquininha ou gateway de pagamento |
| Comissão | Percentual (%) | Comissão de representantes ou vendedores |
| Custo Operacional | Percentual (%) | Rateio de aluguel, energia, internet etc. |
| Margem de Lucro | Percentual (%) | Lucro líquido desejado sobre o preço de venda |

**Saídas calculadas em tempo real:**

| Campo | Descrição |
|---|---|
| Preço de Venda Sugerido | Valor em R$ que cobre todos os encargos e garante a margem |
| Lucro Bruto (R$) | Valor absoluto de lucro por unidade |
| Margem Real (%) | Percentual efetivo de lucro sobre o preço de venda |
| Fator Markup (%) | Percentual de markup sobre o custo — compatível com ERPs e planilhas externas |
| Tabela de Composição do Preço | Detalhamento linha a linha de cada componente com % e valor em R$ |
| Gráfico Donut | Visualização proporcional da composição do preço |

**Lógica de tributação:**

- **Simples Nacional:** O campo de alíquota fica editável. O imposto entra no cálculo do divisor.
- **Substituição Tributária (ST):** O campo de alíquota é desabilitado. Um aviso é exibido informando que o imposto já está incluído no custo de aquisição.

**Validação:**
- Se a soma de todos os percentuais atingir ou ultrapassar 100%, o cálculo é interrompido e uma mensagem de erro é exibida.
- Se o custo for zero ou não informado, o painel de resultados exibe o estado vazio (sem cálculo).

### 4.2 Tabela de Composição Detalhada

Dentro do painel de resultados, uma tabela mostra cada componente do preço com:
- Nome do item
- Percentual sobre o preço de venda
- Valor absoluto em R$

Linha de fechamento exibe o total = 100% = Preço de Venda.

Itens com percentual zero são omitidos da tabela para não poluir a leitura.

Codificação de cores por tipo:
- **Cinza neutro** — Custo de aquisição
- **Vermelho** — Impostos, taxa de cartão, comissão (deduções)
- **Laranja** — Custo operacional
- **Verde** — Lucro

### 4.3 Gráfico de Composição (Donut Chart)

- Biblioteca: Recharts
- Formato: Donut (innerRadius 60, outerRadius 100)
- Exibe percentuais diretamente nos segmentos (labels internos)
- Tooltip mostra o percentual e o valor em R$ ao passar o mouse
- Legenda abaixo do gráfico
- Itens com percentual zero são excluídos do gráfico
- Estado vazio: mensagem de instrução dentro de um contêiner tracejado

### 4.4 Simulador de Cenários

Compara três modalidades de pagamento sobre o preço de venda calculado:

**Cenário 01 — Venda à Vista (PIX ou Dinheiro)**
- Parâmetros configuráveis: Desconto (%) + Tarifa Fixa (R$)
- Cálculo: `Líquido = Preço Bruto − Desconto − Tarifa`

**Cenário 02 — Cartão 1X (Débito ou Crédito à Vista)** *(card visualmente destacado)*
- Parâmetros configuráveis: Taxa do Cartão (%)
- Cálculo: `Líquido = Preço Bruto − Taxa Intermediação`

**Cenário 03 — Cartão 12x (Parcelamento com Antecipação)**
- Parâmetros configuráveis: Taxa de Intermediação (%) + Taxa de Parcelamento (%)
- Cálculo: `Líquido = Preço Bruto − Taxa Intermediação − Taxa Parcelamento`

**Para cada cenário, são exibidos:**
- Preço Bruto
- Deduções (em vermelho)
- Líquido Recebido (R$)
- Lucro por unidade (R$)
- Margem Efetiva (%)
- Badge de classificação da margem:
  - **Excelente** (≥ 25%) — verde
  - **Equilibrado** (≥ 15%) — azul
  - **Crítico** (< 15%) — vermelho

**Estado vazio do Simulador:** Se o custo não estiver preenchido ou o cálculo for inválido, o simulador exibe um painel de espera com instrução ao usuário.

---

## 5. Fórmula Central de Cálculo

```
Preço de Venda = Custo ÷ (1 − Soma dos Percentuais / 100)
```

Onde `Soma dos Percentuais` = Imposto + Taxa Cartão + Comissão + Custo Operacional + Margem de Lucro.

Esta fórmula garante que todos os percentuais são calculados **sobre o preço de venda** (não sobre o custo), que é o comportamento correto para formação de preço de varejo.

**Exemplo:**
- Custo = R$ 100,00
- Imposto = 6%, Cartão = 3%, Operacional = 5%, Lucro = 20%
- Total = 34%
- Divisor = 1 − 0,34 = 0,66
- Preço = R$ 100 / 0,66 = **R$ 151,52**

**Markup (para ERP):**
```
Markup % = (Preço / Custo − 1) × 100
```

---

## 6. Arquitetura Técnica

| Camada | Tecnologia |
|---|---|
| Framework | React 18 + TypeScript |
| Build tool | Vite |
| Estilização | Tailwind CSS v4 |
| Componentes | Lucide React (ícones) |
| Gráficos | Recharts |
| Utilitários | clsx + tailwind-merge |
| Fonte | Plus Jakarta Sans (Google Fonts) |
| Hospedagem | Replit (client-side only, sem backend) |

**Estrutura de arquivos:**

```
artifacts/precifica-facil/src/
├── lib/
│   ├── pricing.ts          # Toda a lógica de cálculo (NÃO modificar)
│   └── utils.ts            # cn() helper
├── components/
│   ├── PrecificaFacil.tsx  # Calculadora principal (inputs + resultados)
│   ├── ScenarioSimulator.tsx # Simulador de 3 cenários
│   └── PriceChart.tsx      # Gráfico donut de composição
├── App.tsx                 # Shell, header, orquestração de estado
└── index.css               # Tema global, variáveis CSS, fonte
```

**Fluxo de estado:**
- `App.tsx` mantém o estado compartilhado `PrecificaFacilState` (`cost`, `sellingPrice`, `isValid`)
- `PrecificaFacil` notifica mudanças via callback `onStateChange` (dentro de `useEffect` para evitar setState during render)
- `ScenarioSimulator` recebe `basePrice`, `cost` e `isValid` como props
- Todo o estado dos cenários é local a cada `ScenarioCard`
- Nenhum estado global, nenhum backend, nenhuma chamada de rede

---

## 7. Design e Experiência do Usuário

**Paleta:** Indigo profundo como cor primária (`hsl(243 75% 59%)`), complementada por tons de muted, card e border definidos em CSS custom properties.

**Tipografia:** Plus Jakarta Sans — sem-serif moderna, clara em tabular numerals.

**Layout:**
- Header fixo com logo, nome do produto e navegação âncora
- Calculadora: grid 12 colunas — inputs à esquerda (7 cols) + resultados à direita (5 cols) em desktop; empilhado em mobile
- Simulador: 3 cards em grid, com o card central (Cartão 1X) visualmente elevado (fundo primário, sombra XL, scale 1.03)

**Interações:**
- Cálculo em tempo real — qualquer alteração nos inputs recalcula imediatamente
- Inputs com focus ring e transição de borda
- Botão "Copiar % Markup" altera visualmente para estado de confirmação por 2 segundos após cópia
- Todos os itens com valor zero são omitidos da visualização

**Responsividade:** Mobile-first. Colunas colapsam em telas menores, cards do simulador ficam empilhados em mobile.

---

## 8. Decisões de Produto

| Decisão | Justificativa |
|---|---|
| Sem campo "Nome do Produto" | Removido a pedido do usuário — desnecessário para o cálculo |
| Sem opção "Isento" de imposto | Removido a pedido do usuário — cenário não aplicável ao público-alvo |
| Markup exibido em % (não em multiplicador) | Formato esperado por ERPs e planilhas externas brasileiras |
| Substituição Tributária desabilita campo de imposto | ST já inclui o imposto no custo — impedir double-counting |
| Percentuais calculados sobre o preço de venda | Comportamento correto para formação de preço de varejo; diferente de markup simples sobre custo |
| Sem backend | Todos os cálculos são determinísticos e client-side — sem necessidade de servidor |
| Card Cartão 1X destacado no simulador | Modalidade mais comum no varejo brasileiro — facilita comparação visual |

---

## 9. Métricas de Sucesso (sugeridas)

- Tempo médio para calcular o primeiro preço < 60 segundos
- Uso do botão "Copiar Markup" como indicador de intenção de uso em ERP
- Taxa de retorno (sessões recorrentes) como indicador de utilidade contínua

---

## 10. Fora do Escopo (v1)

- Cadastro de usuário ou autenticação
- Persistência de dados entre sessões
- Múltiplos produtos em uma sessão
- Tabelas de preço por quantidade (desconto por volume)
- Integração com ERPs ou planilhas
- Versão mobile nativa
