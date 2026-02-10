interface GenerateProposalRequest {
  files: any[];
  companyName: string;
  brandColor: string;
}

interface GenerateProposalResponse {
  proposal: string;
  files_processed: { name: string }[];
}

export async function generateProposal(payload: GenerateProposalRequest): Promise<GenerateProposalResponse> {
  // TODO: Replace with actual API endpoint
  // For now, simulate API call with sample content
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const sampleProposal = `<h1>Proposta Comercial</h1>
<p>Prezado(a) cliente <strong>${payload.companyName}</strong>,</p>
<p>É com grande satisfação que apresentamos nossa proposta comercial para os serviços solicitados.</p>

<h2>Escopo do Projeto</h2>
<p>Com base nos documentos fornecidos, elaboramos uma solução completa que atende às necessidades identificadas.</p>

<h2>Metodologia</h2>
<ul>
<li>Análise detalhada dos requisitos</li>
<li>Planejamento e cronograma</li>
<li>Desenvolvimento e implementação</li>
<li>Testes e validação</li>
<li>Entrega e suporte</li>
</ul>

<h2>Investimento</h2>
<p>Os valores serão definidos após análise completa dos requisitos do projeto.</p>

<h2>Prazo</h2>
<p>O prazo estimado será apresentado junto com o cronograma detalhado.</p>

<p>Ficamos à disposição para quaisquer esclarecimentos.</p>
<p><strong>Atenciosamente,</strong></p>
<p>Equipe avaliAI</p>`;

  return {
    proposal: sampleProposal,
    files_processed: payload.files.map(f => ({ name: f.name || 'arquivo' })),
  };
}