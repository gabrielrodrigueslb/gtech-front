import { api } from './api';

export interface Opportunity {
  id: string;
  title: string;
  description?: string;
  value: number; // No banco é 'amount'
  amount?: number; // Compatibilidade caso venha do back
  probability: number;
  stageId?: string; // Para envio
  stage?: { id: string; name: string; color: string }; // Para recebimento
  pipelineId: string;
  contactId?: string;
  contacts?: { id: string; name: string }[]; // O back retorna array de contatos
  expectedClose?: string;
  dueDate?: string; // No banco é dueDate
}

// Buscar oportunidades por Pipeline (Funil)
export async function getOpportunities(pipelineId: string) {
  const { data } = await api.get(`/opportunities/pipeline/${pipelineId}`);
  return data;
}

// Criar nova oportunidade
export async function createOpportunity(data: {
  title: string;
  description?: string;
  amount: number;
  probability: number;
  pipelineId: string;
  stageId: string;
  contactId?: string;
  dueDate?: string;
}) {
  const { data: response } = await api.post('/opportunities/createOpportunity', data);
  return response;
}

// Atualizar oportunidade (incluindo mover de estágio)
export async function updateOpportunity(id: string, data: Partial<Opportunity> & { stageId?: string }) {
  const { data: response } = await api.put(`/opportunities/${id}`, data);
  return response;
}

// Deletar oportunidade
export async function deleteOpportunity(id: string) {
  await api.delete(`/opportunities/${id}`);
}