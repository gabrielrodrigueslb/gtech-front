"use client"

import { useCRM } from "@/context/crm-context"

export default function Analytics() {
  const { contacts, deals, tasks } = useCRM()

  const totalDealsValue = deals.reduce((acc, d) => acc + d.value, 0)
  const closedDeals = deals.filter((d) => d.stage === "closed")
  const closedValue = closedDeals.reduce((acc, d) => acc + d.value, 0)
  const openDeals = deals.filter((d) => d.stage !== "closed")
  const openValue = openDeals.reduce((acc, d) => acc + d.value, 0)
  const conversionRate = deals.length > 0 ? (closedDeals.length / deals.length) * 100 : 0

  const contactsByStatus = {
    lead: contacts.filter((c) => c.status === "lead").length,
    prospect: contacts.filter((c) => c.status === "prospect").length,
    customer: contacts.filter((c) => c.status === "customer").length,
    inactive: contacts.filter((c) => c.status === "inactive").length,
  }

  const dealsByStage = {
    lead: deals.filter((d) => d.stage === "lead"),
    qualified: deals.filter((d) => d.stage === "qualified"),
    proposal: deals.filter((d) => d.stage === "proposal"),
    negotiation: deals.filter((d) => d.stage === "negotiation"),
    closed: deals.filter((d) => d.stage === "closed"),
  }

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
  }

  const stageLabels: Record<string, string> = {
    lead: "Lead",
    qualified: "Qualificado",
    proposal: "Proposta",
    negotiation: "Negociação",
    closed: "Fechado",
  }

  const stageColors: Record<string, string> = {
    lead: "var(--color-muted)",
    qualified: "var(--color-primary)",
    proposal: "var(--color-warning)",
    negotiation: "var(--color-accent)",
    closed: "var(--color-success)",
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Relatórios e Analytics</h1>
        <p style={{ color: "var(--color-muted-foreground)" }}>Acompanhe as métricas do seu negócio</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stat-card">
          <p className="stat-label">Valor Total Pipeline</p>
          <p className="stat-value">R$ {(totalDealsValue / 1000).toFixed(0)}k</p>
          <p className="stat-change positive">+18% vs mês anterior</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Negócios Fechados</p>
          <p className="stat-value">R$ {(closedValue / 1000).toFixed(0)}k</p>
          <p className="stat-change positive">+25% vs mês anterior</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Taxa de Conversão</p>
          <p className="stat-value">{conversionRate.toFixed(1)}%</p>
          <p className="stat-change positive">+5% vs mês anterior</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Ticket Médio</p>
          <p className="stat-value">
            R$ {closedDeals.length > 0 ? (closedValue / closedDeals.length / 1000).toFixed(0) : 0}k
          </p>
          <p className="stat-change positive">+10% vs mês anterior</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h2 className="text-lg font-semibold mb-6">Funil de Vendas</h2>
          <div className="flex flex-col gap-4">
            {Object.entries(dealsByStage).map(([stage, stageDeals]) => {
              const value = stageDeals.reduce((acc, d) => acc + d.value, 0)
              const maxValue = Math.max(
                ...Object.values(dealsByStage).map((d) => d.reduce((acc, deal) => acc + deal.value, 0)),
              )
              const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0

              return (
                <div key={stage}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stageColors[stage] }} />
                      <span className="font-medium">{stageLabels[stage]}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold">R$ {(value / 1000).toFixed(0)}k</span>
                      <span className="text-sm ml-2" style={{ color: "var(--color-muted-foreground)" }}>
                        ({stageDeals.length})
                      </span>
                    </div>
                  </div>
                  <div className="progress-bar" style={{ height: 8 }}>
                    <div
                      className="progress-fill"
                      style={{ width: `${percentage}%`, backgroundColor: stageColors[stage] }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-6">Contatos por Status</h2>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(contactsByStatus).map(([status, count]) => {
              const statusColors: Record<string, string> = {
                lead: "var(--color-warning)",
                prospect: "var(--color-primary)",
                customer: "var(--color-success)",
                inactive: "var(--color-danger)",
              }
              const statusLabels: Record<string, string> = {
                lead: "Leads",
                prospect: "Prospects",
                customer: "Clientes",
                inactive: "Inativos",
              }

              return (
                <div key={status} className="p-4 rounded-lg" style={{ backgroundColor: "var(--color-background)" }}>
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                    style={{ backgroundColor: `${statusColors[status]}20` }}
                  >
                    <span style={{ color: statusColors[status], fontSize: 18 }}>
                      {status === "lead" ? "🎯" : status === "prospect" ? "📋" : status === "customer" ? "✓" : "⏸"}
                    </span>
                  </div>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
                    {statusLabels[status]}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-6">Tarefas</h2>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span style={{ color: "var(--color-muted-foreground)" }}>Total</span>
              <span className="font-semibold">{taskStats.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: "var(--color-muted-foreground)" }}>Pendentes</span>
              <span className="font-semibold" style={{ color: "var(--color-warning)" }}>
                {taskStats.pending}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: "var(--color-muted-foreground)" }}>Em Andamento</span>
              <span className="font-semibold" style={{ color: "var(--color-primary)" }}>
                {taskStats.inProgress}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: "var(--color-muted-foreground)" }}>Concluídas</span>
              <span className="font-semibold" style={{ color: "var(--color-success)" }}>
                {taskStats.completed}
              </span>
            </div>
            <div className="pt-4 border-t" style={{ borderColor: "var(--color-border)" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
                  Progresso
                </span>
                <span className="text-sm font-medium">
                  {taskStats.total > 0 ? ((taskStats.completed / taskStats.total) * 100).toFixed(0) : 0}%
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0}%`,
                    backgroundColor: "var(--color-success)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card lg:col-span-2">
          <h2 className="text-lg font-semibold mb-6">Top Negócios por Valor</h2>
          <div className="flex flex-col gap-3">
            {[...deals]
              .sort((a, b) => b.value - a.value)
              .slice(0, 5)
              .map((deal, index) => {
                const contact = contacts.find((c) => c.id === deal.contactId)
                const maxValue = Math.max(...deals.map((d) => d.value))
                const percentage = (deal.value / maxValue) * 100

                return (
                  <div key={deal.id}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ backgroundColor: "var(--color-primary)", color: "var(--color-primary-foreground)" }}
                        >
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium">{deal.title}</p>
                          <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
                            {contact?.name}
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold">R$ {deal.value.toLocaleString()}</span>
                    </div>
                    <div className="progress-bar ml-9">
                      <div
                        className="progress-fill"
                        style={{ width: `${percentage}%`, backgroundColor: stageColors[deal.stage] }}
                      />
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      </div>
    </div>
  )
}
