'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FaBuilding,
  FaArrowLeft,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaMoneyBillWave,
  FaPlus,
  FaUserTie,
  FaProjectDiagram,
  FaFileContract
} from 'react-icons/fa';
import {
  getClientById,
  getAbacatepayCustomer,
  ensureAbacatepayCustomer,
  getAbacatepayBillings,
  createAbacatepayBilling,
  type Client as ClientType,
} from '@/lib/client';

export default function ClientDetails() {
  const params = useParams();
  const router = useRouter();
  const [client, setClient] = useState<ClientType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [abacatepayCustomer, setAbacatepayCustomer] = useState<any | null>(null);
  const [abacatepayBillings, setAbacatepayBillings] = useState<any[]>([]);
  const [isAbacatepayLoading, setIsAbacatepayLoading] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [isBillingSubmitting, setIsBillingSubmitting] = useState(false);
  const [billingForm, setBillingForm] = useState({
    description: '',
    amount: '',
    dueDate: '',
  });

  // Busca os dados quando a pÃ¡gina carrega
  useEffect(() => {
    async function loadData() {
      if (!params?.id) return;
      
      setIsLoading(true);
      try {
        const data = await getClientById(params.id as string);
        setClient(data || null);
      } catch (error) {
        console.error("Erro ao buscar cliente", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [params?.id]);

  useEffect(() => {
    if (!client?.id) return;
    async function loadAbacatepay() {
      setIsAbacatepayLoading(true);
      try {
        const [customerResponse, billingsResponse] = await Promise.all([
          getAbacatepayCustomer(client.id),
          getAbacatepayBillings(client.id),
        ]);
        setAbacatepayCustomer(customerResponse?.customer || null);
        setAbacatepayBillings(billingsResponse || []);
      } catch (error) {
        console.error('Erro ao carregar dados do AbacatePay', error);
      } finally {
        setIsAbacatepayLoading(false);
      }
    }
    loadAbacatepay();
  }, [client?.id]);

  // Helpers de UI
  const getStatusBadge = (status: string) => {
    const styles = {
      ativo: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      inativo: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
      em_implantacao: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    };
    const labels = { ativo: 'Ativo', inativo: 'Inativo', em_implantacao: 'Em ImplantaÃ§Ã£o' };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${styles[status as keyof typeof styles] || ''}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const getPaymentIcon = (status: string) => {
    switch (status) {
      case 'pago': return <FaCheckCircle className="text-emerald-500" />;
      case 'aberto': return <FaClock className="text-amber-500" />;
      case 'atrasado': return <FaExclamationCircle className="text-rose-500" />;
      default: return null;
    }
  };

  const normalizeBillingStatus = (status: string) => {
    const value = (status || '').toString().toLowerCase();
    if (['pago', 'paid', 'settled', 'approved'].includes(value)) return 'pago';
    if (['atrasado', 'overdue', 'late'].includes(value)) return 'atrasado';
    return 'aberto';
  };

  const getBillingField = (billing: any, keys: string[]) => {
    for (const key of keys) {
      if (billing?.[key] !== undefined && billing?.[key] !== null) {
        return billing[key];
      }
    }
    return undefined;
  };

  const formatBillingDate = (value: any) => {
    if (!value) return '-';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '-';
    return parsed.toLocaleDateString('pt-BR');
  };

  const formatBillingAmount = (value: any) => {
    const amount = Number(value);
    if (Number.isNaN(amount)) return 'R$ 0,00';
    return `R$ ${amount.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
    })}`;
  };

  const handleEnsureAbacatepayCustomer = async () => {
    if (!client) return;
    try {
      setIsAbacatepayLoading(true);
      const response = await ensureAbacatepayCustomer(client.id);
      setAbacatepayCustomer(response?.customer || null);
    } catch (error) {
      console.error('Erro ao vincular cliente no AbacatePay', error);
      alert('Erro ao vincular cliente no AbacatePay');
    } finally {
      setIsAbacatepayLoading(false);
    }
  };

  const handleCreateBilling = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;
    try {
      setIsBillingSubmitting(true);
      const amount = Number(
        String(billingForm.amount).replace(',', '.').trim(),
      );
      const payload = {
        description: billingForm.description,
        amount,
        dueDate: billingForm.dueDate,
      };

      await createAbacatepayBilling(client.id, payload);

      const billingsResponse = await getAbacatepayBillings(client.id);
      setAbacatepayBillings(billingsResponse || []);

      setShowBillingModal(false);
      setBillingForm({ description: '', amount: '', dueDate: '' });
    } catch (error) {
      console.error('Erro ao criar cobranÃ§a', error);
      alert('Erro ao criar cobranÃ§a');
    } finally {
      setIsBillingSubmitting(false);
    }
  };

  // --- RENDERIZAÃ‡ÃƒO ---

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-background text-foreground">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 bg-muted rounded-full"></div>
          <p className="text-muted-foreground">Carregando detalhes...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-background text-foreground p-6">
        <h2 className="text-2xl font-bold mb-2">Cliente nÃ£o encontrado</h2>
        <p className="text-muted-foreground mb-6">O ID solicitado nÃ£o existe na base de dados.</p>
        <Link href="/main/clientes" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg">
          Voltar para Lista
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background text-foreground p-6">
      
      {/* --- HEADER --- */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 shrink-0">
        <div className="flex items-center gap-4">
            <button 
                onClick={() => router.back()} 
                className="p-2 hover:bg-muted rounded-full transition-colors"
                title="Voltar"
            >
                <FaArrowLeft className="text-muted-foreground" />
            </button>
            <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-3 rounded-xl">
                    <FaBuilding className="text-primary text-2xl" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{client.companyName}</h1>
                    <p className="text-sm text-muted-foreground">{client.cnpj} â€¢ {client.segment}</p>
                </div>
            </div>
        </div>

        <div className="flex items-center gap-3">
            {getStatusBadge(client.status)}
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90">
                Editar Cliente
            </button>
        </div>
      </header>

      {/* --- CONTEÃšDO PRINCIPAL (GRID) --- */}
      <main className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUNA ESQUERDA: Detalhes do Projeto */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex items-center gap-4">
                    <div className="bg-blue-500/10 p-3 rounded-lg text-blue-500"><FaProjectDiagram size={20}/></div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase font-bold">Projeto</p>
                        <p className="font-semibold text-sm">{client.project}</p>
                    </div>
                </div>
                <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex items-center gap-4">
                    <div className="bg-purple-500/10 p-3 rounded-lg text-purple-500"><FaFileContract size={20}/></div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase font-bold">Plano</p>
                        <p className="font-semibold text-sm">{client.plan}</p>
                    </div>
                </div>
                <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex items-center gap-4">
                    <div className="bg-orange-500/10 p-3 rounded-lg text-orange-500"><FaUserTie size={20}/></div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase font-bold">ResponsÃ¡vel</p>
                        <p className="font-semibold text-sm">Verificar ID {client.contactId}</p>
                    </div>
                </div>
            </div>

            {/* HistÃ³rico Financeiro */}
            <section className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
                    <h3 className="font-bold flex items-center gap-2">
                        <FaMoneyBillWave className="text-emerald-500" />
                        HistÃ³rico Financeiro
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground text-[10px] uppercase font-bold">
                            <tr>
                                <th className="p-3">DescriÃ§Ã£o</th>
                                <th className="p-3">Vencimento</th>
                                <th className="p-3">Valor</th>
                                <th className="p-3 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {client.payments.map(pay => (
                                <tr key={pay.id} className="hover:bg-muted/20">
                                    <td className="p-3 font-medium">{pay.description}</td>
                                    <td className="p-3 text-muted-foreground">
                                        {new Date(pay.dueDate).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="p-3 font-mono">
                                        R$ {pay.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="p-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <span className="text-xs capitalize">{pay.status}</span>
                                            {getPaymentIcon(pay.status)}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {client.payments.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-6 text-center text-muted-foreground">Nenhum pagamento registrado</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
            {/* Cobranças AbacatePay */}
            <section className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
                    <h3 className="font-bold flex items-center gap-2">
                        <FaMoneyBillWave className="text-primary" />
                        Cobranças AbacatePay
                    </h3>
                    <div className="flex items-center gap-2">
                        {!abacatepayCustomer && (
                            <button
                                onClick={handleEnsureAbacatepayCustomer}
                                className="px-3 py-1.5 text-[10px] font-bold uppercase border border-border rounded-lg hover:bg-muted transition-all"
                                disabled={isAbacatepayLoading}
                            >
                                Vincular Cliente
                            </button>
                        )}
                        <button
                            onClick={() => setShowBillingModal(true)}
                            className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase hover:opacity-90 transition-all shadow-sm disabled:opacity-50"
                            disabled={!abacatepayCustomer || isAbacatepayLoading}
                        >
                            <FaPlus size={10} />
                            Nova Cobrança
                        </button>
                    </div>
                </div>
                {!abacatepayCustomer && !isAbacatepayLoading && (
                    <div className="p-6 text-center text-muted-foreground text-sm">
                        Cliente ainda não vinculado ao AbacatePay.
                    </div>
                )}
                {abacatepayCustomer && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground text-[10px] uppercase font-bold">
                                <tr>
                                    <th className="p-3">Descrição</th>
                                    <th className="p-3">Vencimento</th>
                                    <th className="p-3">Valor</th>
                                    <th className="p-3 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {isAbacatepayLoading && (
                                    <tr>
                                        <td colSpan={4} className="p-6 text-center text-muted-foreground">
                                            Carregando cobranças...
                                        </td>
                                    </tr>
                                )}
                                {!isAbacatepayLoading && abacatepayBillings.map((billing) => {
                                    const description = getBillingField(billing, ['description', 'title', 'name']) || 'Cobrança';
                                    const amount = getBillingField(billing, ['amount', 'value', 'total', 'price']);
                                    const dueDate = getBillingField(billing, ['dueDate', 'due_date', 'expiresAt', 'expirationDate', 'deadline']);
                                    const rawStatus = getBillingField(billing, ['status', 'state']) || 'aberto';
                                    const status = normalizeBillingStatus(rawStatus);

                                    return (
                                        <tr key={billing.id || `${description}-${dueDate}`} className="hover:bg-muted/20">
                                            <td className="p-3 font-medium">{description}</td>
                                            <td className="p-3 text-muted-foreground">
                                                {formatBillingDate(dueDate)}
                                            </td>
                                            <td className="p-3 font-mono">
                                                {formatBillingAmount(amount)}
                                            </td>
                                            <td className="p-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <span className="text-xs capitalize">{status}</span>
                                                    {getPaymentIcon(status)}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {!isAbacatepayLoading && abacatepayBillings.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-6 text-center text-muted-foreground">
                                            Nenhuma cobrança encontrada
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>

        {/* COLUNA DIREITA: InformaÃ§Ãµes Adicionais */}
        <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl shadow-sm p-6">
                <h3 className="font-bold mb-4 text-sm uppercase text-muted-foreground">Dados Cadastrais</h3>
                <div className="space-y-4 text-sm">
                    <div>
                        <span className="block text-muted-foreground text-xs">RazÃ£o Social</span>
                        <span className="font-medium">{client.companyName}</span>
                    </div>
                    <div>
                        <span className="block text-muted-foreground text-xs">CNPJ</span>
                        <span className="font-mono text-muted-foreground">{client.cnpj}</span>
                    </div>
                    <div>
                        <span className="block text-muted-foreground text-xs">Cliente desde</span>
                        <span>{new Date(client.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="pt-4 border-t border-border">
                        <button className="w-full bg-muted hover:bg-muted/80 text-foreground py-2 rounded-lg text-xs font-bold uppercase transition-colors">
                            Ver Contrato PDF
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm p-6">
                <h3 className="font-bold mb-4 text-sm uppercase text-muted-foreground">AbacatePay</h3>
                {abacatepayCustomer ? (
                    <div className="space-y-4 text-sm">
                        <div>
                            <span className="block text-muted-foreground text-xs">Cliente</span>
                            <span className="font-medium">
                                {getBillingField(abacatepayCustomer, ['name', 'fullName']) || client.companyName}
                            </span>
                        </div>
                        <div>
                            <span className="block text-muted-foreground text-xs">E-mail</span>
                            <span className="text-muted-foreground">
                                {getBillingField(abacatepayCustomer, ['email']) || '-'}
                            </span>
                        </div>
                        <div>
                            <span className="block text-muted-foreground text-xs">Tax ID</span>
                            <span className="font-mono text-muted-foreground">
                                {getBillingField(abacatepayCustomer, ['taxId', 'tax_id', 'document']) || client.cnpj}
                            </span>
                        </div>
                        <div className="pt-4 border-t border-border">
                            <button
                                onClick={() => setShowBillingModal(true)}
                                className="w-full bg-primary text-primary-foreground py-2 rounded-lg text-xs font-bold uppercase transition-colors hover:opacity-90 disabled:opacity-50"
                                disabled={isAbacatepayLoading}
                            >
                                Nova Cobrança
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 text-sm">
                        <p className="text-muted-foreground">
                            Cliente não vinculado ao AbacatePay.
                        </p>
                        <button
                            onClick={handleEnsureAbacatepayCustomer}
                            className="w-full bg-muted hover:bg-muted/80 text-foreground py-2 rounded-lg text-xs font-bold uppercase transition-colors disabled:opacity-50"
                            disabled={isAbacatepayLoading}
                        >
                            Vincular Cliente
                        </button>
                    </div>
                )}
            </div>
        </div>
      {showBillingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-bold">Nova Cobrança</h2>
              <button
                onClick={() => setShowBillingModal(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >x</button>
            </div>
            <form onSubmit={handleCreateBilling} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  Descrição
                </label>
                <input
                  type="text"
                  className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="Ex: Mensalidade"
                  value={billingForm.description}
                  onChange={(e) =>
                    setBillingForm({ ...billingForm, description: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">
                    Valor
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="0,00"
                    value={billingForm.amount}
                    onChange={(e) =>
                      setBillingForm({ ...billingForm, amount: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">
                    Vencimento
                  </label>
                  <input
                    type="date"
                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    value={billingForm.dueDate}
                    onChange={(e) =>
                      setBillingForm({ ...billingForm, dueDate: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowBillingModal(false)}
                  className="flex-1 px-4 py-2.5 border border-border rounded-xl font-medium hover:bg-muted transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all shadow-lg border border-border shadow-primary/20 cursor-pointer disabled:opacity-50"
                  disabled={isBillingSubmitting}
                >
                  {isBillingSubmitting ? 'Salvando...' : 'Criar Cobrança'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </main>
    </div>
  );
}








