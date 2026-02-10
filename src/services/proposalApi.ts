const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

export interface GenerateProposalResponse {
  success: boolean;
  proposal: string;
  files_processed: string[];
}

export interface DocumentInfo {
  name: string;
  size: number;
}

export interface ListDocumentsResponse {
  success: boolean;
  documents: DocumentInfo[];
  message?: string;
}

export async function generateProposal(metadata?: { files?: any[]; companyName?: string; brandColor?: string; answers?: Record<string, string> }): Promise<GenerateProposalResponse> {
  const payload = {
    files: metadata?.files || [],
    companyName: metadata?.companyName || 'Cliente',
    brandColor: metadata?.brandColor || '#000000',
    answers: metadata?.answers || {},
  };
  
  console.log('📤 Payload being sent:', {
    companyName: payload.companyName,
    brandColor: payload.brandColor,
    filesCount: payload.files.length,
    filesNames: payload.files.map((f: any) => f.name),
    payloadSize: JSON.stringify(payload).length + ' bytes',
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300000); // 300s (5 min) timeout

  try {
    const response = await fetch(`${API_BASE_URL}/api/generate-proposal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      console.error('❌ Error in response:', response.status, error);
      throw new Error(error.detail || 'Erro ao gerar proposta');
    }

    const data = await response.json();
    console.log('✅ Response received:', { success: data.success, proposalLength: data.proposal?.length });
    return data;
  } catch (e: any) {
    clearTimeout(timeoutId);
    if (e.name === 'AbortError') {
      console.error('⏱️ Timeout: request took longer than 60 seconds');
      throw new Error('O servidor demorou demais a responder.');
    }
    throw e;
  }
}

export async function listDocuments(): Promise<ListDocumentsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/list-documents`, {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || 'Erro ao listar documentos.');
  }

  return response.json();
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

export async function uploadFile(file: File, type: 'reference' | 'input'): Promise<void> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('doc_type', type);

  const response = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Falha ao enviar arquivo ${file.name}`);
  }
}