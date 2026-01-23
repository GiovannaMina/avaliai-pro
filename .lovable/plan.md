
# Plano de Alterações para o avaliAI

## Resumo das Alterações

Este plano implementa 4 alterações principais na interface de edição e geração de propostas:

1. Remoção do conteúdo placeholder da proposta
2. Adição de opção de divisória no editor de texto
3. Redesign do PDF para seguir o modelo de referência
4. Simplificação do modo de edição (apenas editor de texto)

---

## 1. Remoção do Conteúdo Placeholder

**Arquivo:** `src/pages/Index.tsx`

**Alteração:**
- Remover o template de proposta gerado automaticamente no `handleGenerate`
- A IA futura será responsável por gerar todo o conteúdo
- Manter apenas a estrutura básica vazia para que a IA preencha

**Resultado:** Quando os arquivos forem enviados, o sistema aguardará a integração com a IA real para gerar a proposta.

---

## 2. Adicionar Divisória no Editor de Texto

**Arquivo:** `src/components/RichTextEditor.tsx`

**Alterações:**
- Importar o ícone `Minus` do lucide-react (para representar linha horizontal)
- Adicionar um botão "Divisória" na barra de ferramentas
- Usar o comando `setHorizontalRule()` do StarterKit (já incluído por padrão)
- Posicionar após a seção de listas

**Código do botão:**
```text
<ToolbarButton
  onClick={() => editor.chain().focus().setHorizontalRule().run()}
  title="Divisória"
>
  <Minus className="w-4 h-4" />
</ToolbarButton>
```

**Também necessário:**
- Atualizar as funções de conversão markdown/html para suportar `<hr>` ↔ `---`

---

## 3. Redesign do PDF (Modelo de Referência)

**Arquivo:** `src/utils/pdfGenerator.ts`

**Análise do modelo de referência:**
- Header limpo: Logo do cliente à esquerda, logo da Flow.Ers à direita
- Fundo branco (sem barra laranja no topo)
- Título da proposta em negrito
- Metadados simples: "Para:", "Data:"
- Linhas horizontais finas como separadores de seção
- Títulos de seção em negrito maiúsculo (ex: "I. CONTEXTO...")
- Bullets com texto em negrito para destaque
- Tipografia limpa e profissional
- Sem rodapé colorido

**Alterações no gerador:**
1. Remover header laranja e substituir por header branco com espaço para logos
2. Simplificar metadados (Para, Data)
3. Usar linhas horizontais finas (cinza) como separadores
4. Títulos de seção em negrito, maiúsculas, com linha abaixo
5. Parágrafos com texto justificado
6. Bullets simples (pretos)
7. Rodapé minimalista ou sem rodapé

---

## 4. Simplificar Modo de Edição

**Arquivo:** `src/components/ProposalViewer.tsx`

**Estado atual:**
- Edição com visualização lado a lado (editor + PDF preview)

**Alteração:**
- Remover o painel de preview do PDF durante edição
- Expandir o editor para tela cheia
- Manter a experiência similar ao Google Docs

**Estrutura simplificada:**
```text
{isEditing ? (
  <div className="h-full max-w-4xl mx-auto">
    <RichTextEditor
      content={editedProposal}
      onChange={handleEditorChange}
    />
  </div>
) : (
  /* PDF View - permanece igual */
)}
```

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/Index.tsx` | Remover conteúdo placeholder do handleGenerate |
| `src/components/RichTextEditor.tsx` | Adicionar botão de divisória e atualizar conversores |
| `src/utils/pdfGenerator.ts` | Redesign completo do layout do PDF |
| `src/components/ProposalViewer.tsx` | Remover preview lado a lado na edição |

---

## Detalhes Técnicos

### Novo Layout do PDF

```text
┌─────────────────────────────────────────────┐
│  [Logo Cliente]              [Logo avaliAI] │
├─────────────────────────────────────────────┤
│                                             │
│  Proposta avaliAI, by Flow.Ers:             │
│                                             │
│  **Título da Proposta**                     │
│                                             │
│  Para: [Cliente]                            │
│  Data: [Data]                               │
│                                             │
│  ─────────────────────────────────────────  │
│                                             │
│  Prezados(as),                              │
│  [Conteúdo...]                              │
│                                             │
│  ─────────────────────────────────────────  │
│                                             │
│  **I. TÍTULO DA SEÇÃO**                     │
│  [Conteúdo...]                              │
│                                             │
└─────────────────────────────────────────────┘
```

### Conversão Markdown para Divisória

```text
// Adicionar na função convertMarkdownToHtml:
html = html.replace(/^---$/gm, '<hr>');

// Adicionar na função convertHtmlToMarkdown:
markdown = markdown.replace(/<hr\s*\/?>/g, '---\n');
```

---

## Resultado Esperado

Após as alterações:
- O sistema aguardará a IA para gerar propostas (sem conteúdo placeholder)
- O editor terá uma opção de adicionar linhas divisórias
- O PDF gerado seguirá o design profissional e limpo do modelo de referência
- A edição será uma experiência focada no texto, similar ao Google Docs
