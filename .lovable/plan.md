

# Questionario de Contexto para Propostas

## Resumo

Adicionar uma seção de perguntas contextuais no `ProposalGenerator`, exibida **apos** o usuario anexar pelo menos um arquivo. As perguntas serao fixas no frontend, com respostas enviadas ao backend junto com os arquivos e metadados. O botao "Gerar Proposta" so ficara habilitado quando as perguntas obrigatorias estiverem respondidas.

## Fluxo do usuario

1. Preenche nome da empresa e cor da marca (ja existe)
2. Anexa arquivos de referencia/entrada (ja existe)
3. **Novo:** Uma secao "Informacoes adicionais" aparece abaixo dos documentos anexados
4. Responde as perguntas obrigatorias (campos com indicador visual de obrigatoriedade)
5. Clica em "Gerar Proposta" (so habilitado quando tudo preenchido)

## Perguntas iniciais (genericas, editaveis depois)

| # | Pergunta | Tipo de campo | Obrigatoria |
|---|----------|--------------|-------------|
| 1 | Qual o objetivo principal desta proposta? | Textarea | Sim |
| 2 | Quem e o publico-alvo ou tomador de decisao? | Input texto | Sim |
| 3 | Qual o tom desejado para a proposta? | Select (Formal / Semi-formal / Informal) | Sim |
| 4 | Existe alguma informacao adicional ou restricao importante? | Textarea | Nao |

## Detalhes tecnicos

### 1. Definicao das perguntas (constante no ProposalGenerator)

Criar um array `CONTEXT_QUESTIONS` com objetos contendo: `id`, `label`, `placeholder`, `type` (input/textarea/select), `required`, e `options` (para selects). Isso facilita adicionar/remover perguntas no futuro.

### 2. Estado das respostas

Adicionar um estado `answers` do tipo `Record<string, string>` no `ProposalGenerator`, mapeando o `id` da pergunta para a resposta.

### 3. Interface visual

- Secao aparece condicionalmente quando `files.length > 0`
- Titulo com icone: "Informacoes para a proposta"
- Campos obrigatorios marcados com asterisco vermelho no label
- Campos vazios obrigatorios com borda vermelha apos tentativa de gerar (validacao visual)
- Mesma estilizacao dos campos ja existentes (rounded-xl, border-primary/20, etc.)

### 4. Validacao no botao "Gerar Proposta"

O botao ficara desabilitado se:
- Nenhum arquivo anexado (ja existe)
- Nome da empresa vazio (ja existe)
- Arquivo pendente sem tipo (ja existe)
- **Novo:** Alguma pergunta obrigatoria sem resposta

### 5. Envio ao backend

Atualizar a interface `ProposalGeneratorProps.onGenerate` para incluir `answers: Record<string, string>` nos metadados. Em `Index.tsx`, passar as respostas no payload da chamada `generateProposal()`. O `proposalApi.ts` incluira o campo `answers` no body do POST.

### Arquivos modificados

- **`src/components/ProposalGenerator.tsx`** -- Adicionar constante de perguntas, estado de respostas, secao de UI, validacao e passagem das respostas no `onGenerate`
- **`src/pages/Index.tsx`** -- Atualizar tipo do metadata e passar `answers` para `generateProposal()`
- **`src/services/proposalApi.ts`** -- Incluir campo `answers` no payload enviado ao backend

