'use client';

import type React from 'react';
import { useState, useEffect, useMemo } from 'react';
import {
  FaBuilding,
  FaPlus,
  FaTrash,
  FaEdit,
  FaSearch,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaFileInvoiceDollar,
  FaChevronRight,
} from 'react-icons/fa';
import { getContacts, type Contact as ContactType } from '@/lib/contact';
import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
  type Client as ClientType,
} from '@/lib/client';
import Link from 'next/link';

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientType[]>([]);
  const [contacts, setContacts] = useState<ContactType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');

  // Modais
  const [showClientModal, setShowClientModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientType | null>(null);
  const [editingClient, setEditingClient] = useState<ClientType | null>(null);

  // Formulário
  const [formData, setFormData] = useState({
    companyName: '',
    cnpj: '',
    segment: '',
    contactId: '',
    project: '',
    plan: '',
    status: 'ativo' as ClientType['status'],
  });

  const formatCnpj = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 14);
    return digits
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  };

  // --- CARREGAMENTO ---
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [contactsData, clientsData] = await Promise.all([
          getContacts(),
          getClients(),
        ]);
        setContacts(contactsData || []);
        setClients(clientsData || []);
      } catch (error) {
        console.error('Erro ao carregar clientes:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // --- FILTROS ---
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchesSearch =
        client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.cnpj.includes(searchTerm);
      const matchesStatus =
        filterStatus === 'todos' || client.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [clients, searchTerm, filterStatus]);

  // --- HANDLERS ---
  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClient) {
        const updated = await updateClient(editingClient.id, formData);
        setClients(
          clients.map((c) => (c.id === editingClient.id ? updated : c)),
        );
      } else {
        const created = await createClient(formData);
        setClients([...clients, created]);
      }
      setShowClientModal(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      alert('Erro ao salvar cliente');
    }
  };

  const resetForm = () => {
    setFormData({
      companyName: '',
      cnpj: '',
      segment: '',
      contactId: '',
      project: '',
      plan: '',
      status: 'ativo',
    });
    setEditingClient(null);
  };

  const openEditModal = (client: ClientType) => {
    setEditingClient(client);
    setFormData({
      companyName: client.companyName,
      cnpj: formatCnpj(client.cnpj),
      segment: client.segment || '',
      contactId: client.contactId || '',
      project: client.project || '',
      plan: client.plan || '',
      status: client.status,
    });
    setShowClientModal(true);
  };

  const handleDeleteClient = async (id: string) => {
    if (confirm('Deseja realmente excluir este cliente?')) {
      try {
        await deleteClient(id);
        setClients(clients.filter((c) => c.id !== id));
      } catch (error) {
        console.error('Erro ao excluir cliente:', error);
        alert('Erro ao excluir cliente');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      ativo: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      inativo: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
      em_implantacao: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    };
    const labels = {
      ativo: 'Ativo',
      inativo: 'Inativo',
      em_implantacao: 'Em Implantação',
    };
    return (
      <span
        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
          styles[status as keyof typeof styles]
        }`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'pago':
        return <FaCheckCircle className="text-emerald-500" />;
      case 'aberto':
        return <FaClock className="text-amber-500" />;
      case 'atrasado':
        return <FaExclamationCircle className="text-rose-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background text-foreground ">
      {/* --- HEADER --- */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-3 rounded-xl">
            <FaBuilding className="text-primary text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Gestão de Clientes
            </h1>
            <p className="text-sm text-muted-foreground">
              Empresas, projetos e controle financeiro
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs" />
            <input
              type="text"
              placeholder="Buscar empresa ou CNPJ..."
              className="pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none w-64 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="bg-card border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="todos">Todos os Status</option>
            <option value="ativo">Ativos</option>
            <option value="em_implantacao">Em Implantação</option>
            <option value="inativo">Inativos</option>
          </select>

          <button
            onClick={() => {
              resetForm();
              setShowClientModal(true);
            }}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-all shadow-sm"
          >
            <FaPlus size={14} />
            <span>Novo Cliente</span>
          </button>
        </div>
      </header>

      {/* --- CLIENTS TABLE --- */}
      <main className="flex-1 overflow-hidden bg-card border border-border rounded-2xl shadow-sm flex flex-col">
        <div className="overflow-x-auto flex-1 scrollbar-thin">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-muted/50 backdrop-blur-md z-10">
              <tr>
                <th className="p-4 text-[10px] font-bold uppercase text-muted-foreground tracking-widest border-b">
                  Empresa / CNPJ
                </th>
                <th className="p-4 text-[10px] font-bold uppercase text-muted-foreground tracking-widest border-b">
                  Contato Principal
                </th>
                <th className="p-4 text-[10px] font-bold uppercase text-muted-foreground tracking-widest border-b">
                  Projeto / Plano
                </th>
                <th className="p-4 text-[10px] font-bold uppercase text-muted-foreground tracking-widest border-b">
                  Status
                </th>
                <th className="p-4 text-[10px] font-bold uppercase text-muted-foreground tracking-widest border-b">
                  Financeiro
                </th>
                <th className="p-4 text-[10px] font-bold uppercase text-muted-foreground tracking-widest border-b text-right">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredClients.map((client) => {
                const contact = contacts.find((c) => c.id === client.contactId);
                const pendingPayments = client.payments.filter(
                  (p) => p.status !== 'pago',
                ).length;

                return (
                  <tr
                    key={client.id}
                    className="hover:bg-muted/20 transition-colors group"
                  >
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm group-hover:text-primary transition-colors">
                          {client.companyName}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {client.cnpj}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">
                          {contact?.name?.[0] || '?'}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium">
                            {contact?.name || 'Não atrelado'}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {client.segment}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold">
                          {client.project}
                        </span>
                        <span className="text-[10px] text-primary font-bold">
                          {client.plan}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">{getStatusBadge(client.status)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${
                            pendingPayments > 0
                              ? 'bg-amber-500/10 text-amber-600'
                              : 'bg-emerald-500/10 text-emerald-600'
                          }`}
                        >
                          <FaFileInvoiceDollar size={10} />
                          {pendingPayments > 0
                            ? `${pendingPayments} Pendente(s)`
                            : 'Em dia'}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/main/clientes/${client.id}`}
                          className="p-2 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-lg transition-all"
                          title="Ver Detalhes"
                        >
                          <FaChevronRight size={12} />
                        </Link>
                        <button
                          onClick={() => openEditModal(client)}
                          className="p-2 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-lg transition-all"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteClient(client.id)}
                          className="p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-all"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredClients.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-12 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2 opacity-50">
                      <FaBuilding size={40} />
                      <p className="font-medium">Nenhum cliente encontrado</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* --- MODAL CLIENTE (CRIAR/EDITAR) --- */}
      {showClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-2xl rounded-2xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
              </h2>
              <button
                onClick={() => {
                  setShowClientModal(false);
                  resetForm();
                }}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form
              onSubmit={handleSaveClient}
              className="p-6 space-y-6 max-h-[80vh] overflow-y-auto scrollbar-thin"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">
                    Empresa
                  </label>
                  <input
                    type="text"
                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="Ex: Lintra Tech"
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData({ ...formData, companyName: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">
                    CNPJ
                  </label>
                  <input
                    type="text"
                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="00.000.000/0000-00"
                    value={formData.cnpj}
                    maxLength={18}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cnpj: formatCnpj(e.target.value),
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">
                    Segmento
                  </label>
                  <input
                    type="text"
                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="Ex: Tecnologia"
                    value={formData.segment}
                    onChange={(e) =>
                      setFormData({ ...formData, segment: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">
                    Contato Principal
                  </label>
                  <select
                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
                    value={formData.contactId}
                    onChange={(e) =>
                      setFormData({ ...formData, contactId: e.target.value })
                    }
                  >
                    <option value="">Sem contato</option>
                    {contacts.map((contact) => (
                      <option key={contact.id} value={contact.id}>
                        {contact.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">
                    Projeto
                  </label>
                  <input
                    type="text"
                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="Ex: Implementação ERP"
                    value={formData.project}
                    onChange={(e) =>
                      setFormData({ ...formData, project: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">
                    Plano
                  </label>
                  <input
                    type="text"
                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="Ex: Premium Mensal"
                    value={formData.plan}
                    onChange={(e) =>
                      setFormData({ ...formData, plan: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  Status
                </label>
                <select
                  className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as ClientType['status'],
                    })
                  }
                >
                  <option value="ativo">Ativo</option>
                  <option value="em_implantacao">Em Implantação</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowClientModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2.5 border border-border rounded-xl font-medium hover:bg-muted transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all shadow-lg border border-border shadow-primary/20 cursor-pointer"
                >
                  {editingClient ? 'Salvar Cliente' : 'Criar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


