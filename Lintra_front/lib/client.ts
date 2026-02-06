import { api } from './api';

export interface Payment {
  id: string;
  amount: number;
  dueDate: string;
  status: 'pago' | 'aberto' | 'atrasado';
  description: string;
  createdAt?: string;
}

export interface Client {
  id: string;
  companyName: string;
  cnpj: string;
  segment?: string | null;
  contactId?: string | null;
  project?: string | null;
  plan?: string | null;
  status: 'ativo' | 'inativo' | 'em_implantacao';
  abacatepayCustomerId?: string | null;
  payments: Payment[];
  createdAt?: string;
  updatedAt?: string;
}

export async function getClients() {
  const { data } = await api.get('/clients');
  return data as Client[];
}

export async function getClientById(id: string) {
  const { data } = await api.get(`/clients/${id}`);
  return data as Client;
}

export async function createClient(payload: Partial<Client>) {
  const { data } = await api.post('/clients/createClient', payload);
  return data as Client;
}

export async function updateClient(id: string, payload: Partial<Client>) {
  const { data } = await api.put(`/clients/${id}`, payload);
  return data as Client;
}

export async function deleteClient(id: string) {
  await api.delete(`/clients/${id}`);
}

export async function addPayment(clientId: string, payload: Partial<Payment>) {
  const { data } = await api.post(`/clients/${clientId}/payments`, payload);
  return data as Payment;
}

export async function updatePayment(paymentId: string, payload: Partial<Payment>) {
  const { data } = await api.put(`/clients/payments/${paymentId}`, payload);
  return data as Payment;
}

export async function deletePayment(paymentId: string) {
  await api.delete(`/clients/payments/${paymentId}`);
}

export async function getAbacatepayCustomer(clientId: string) {
  const { data } = await api.get(`/clients/${clientId}/abacatepay/customer`);
  return data as { customer: any | null };
}

export async function ensureAbacatepayCustomer(clientId: string) {
  const { data } = await api.post(`/clients/${clientId}/abacatepay/customer`);
  return data as { customer: any };
}

export async function getAbacatepayBillings(clientId: string) {
  const { data } = await api.get(`/clients/${clientId}/abacatepay/billings`);
  return data as any[];
}

export async function createAbacatepayBilling(
  clientId: string,
  payload: Record<string, unknown>,
) {
  const { data } = await api.post(
    `/clients/${clientId}/abacatepay/billings`,
    payload,
  );
  return data as any;
}
