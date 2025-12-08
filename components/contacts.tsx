"use client"

import type React from "react"

import { useState } from "react"
import { useCRM, type Contact } from "@/context/crm-context"

export default function Contacts() {
  const { contacts, addContact, updateContact, deleteContact } = useCRM()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [showModal, setShowModal] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    status: "lead" as Contact["status"],
    notes: "",
  })

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || contact.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const openModal = (contact?: Contact) => {
    if (contact) {
      setEditingContact(contact)
      setFormData({
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        company: contact.company,
        status: contact.status,
        notes: contact.notes || "",
      })
    } else {
      setEditingContact(null)
      setFormData({ name: "", email: "", phone: "", company: "", status: "lead", notes: "" })
    }
    setShowModal(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingContact) {
      updateContact(editingContact.id, formData)
    } else {
      addContact(formData)
    }
    setShowModal(false)
  }

  const handleDelete = (id: string) => {
    if (confirm("Deseja realmente excluir este contato?")) {
      deleteContact(id)
    }
  }

  return (
    <div>
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Contatos</h1>
          <p style={{ color: "var(--color-muted-foreground)" }}>Gerencie seus contatos e leads</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          + Novo Contato
        </button>
      </header>

      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Buscar contatos..."
            className="input flex-1"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="input"
            style={{ width: "auto" }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Todos os status</option>
            <option value="lead">Lead</option>
            <option value="prospect">Prospect</option>
            <option value="customer">Cliente</option>
            <option value="inactive">Inativo</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="table">
          <thead>
            <tr>
              <th>Contato</th>
              <th>Empresa</th>
              <th>Telefone</th>
              <th>Status</th>
              <th>Data</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredContacts.map((contact) => (
              <tr key={contact.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div
                      className="avatar"
                      style={{
                        backgroundColor: "var(--color-accent)",
                        color: "var(--color-primary-foreground)",
                      }}
                    >
                      {contact.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
                        {contact.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td>{contact.company}</td>
                <td style={{ color: "var(--color-muted-foreground)" }}>{contact.phone}</td>
                <td>
                  <span
                    className={`badge badge-${
                      contact.status === "customer"
                        ? "success"
                        : contact.status === "prospect"
                          ? "primary"
                          : contact.status === "lead"
                            ? "warning"
                            : "danger"
                    }`}
                  >
                    {contact.status}
                  </span>
                </td>
                <td style={{ color: "var(--color-muted-foreground)" }}>
                  {new Date(contact.createdAt).toLocaleDateString("pt-BR")}
                </td>
                <td>
                  <div className="flex gap-2">
                    <button
                      className="btn btn-ghost"
                      style={{ padding: "6px 10px" }}
                      onClick={() => openModal(contact)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: "6px 10px", color: "var(--color-danger)" }}
                      onClick={() => handleDelete(contact.id)}
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredContacts.length === 0 && (
          <div className="text-center py-12" style={{ color: "var(--color-muted-foreground)" }}>
            Nenhum contato encontrado
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-6">{editingContact ? "Editar Contato" : "Novo Contato"}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  className="input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Telefone</label>
                <input
                  type="tel"
                  className="input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Empresa</label>
                <input
                  type="text"
                  className="input"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  className="input"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Contact["status"] })}
                >
                  <option value="lead">Lead</option>
                  <option value="prospect">Prospect</option>
                  <option value="customer">Cliente</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Notas</label>
                <textarea
                  className="input"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              <div className="flex gap-3 mt-4">
                <button type="button" className="btn btn-secondary flex-1" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary flex-1">
                  {editingContact ? "Salvar" : "Criar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
