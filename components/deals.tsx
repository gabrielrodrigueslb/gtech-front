'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import {
  getPipelines,
  createPipeline as createPipelineService,
} from '@/lib/pipeline';
import { useCRM, type Deal } from '@/context/crm-context';

export default function Deals() {
  const {
    deals,
    contacts,
    funnels,
    addDeal,
    updateDeal,
    deleteDeal,
    moveDeal,
    addFunnel,
  } = useCRM();

  // --- ESTADOS GERAIS ---
  const [activeFunnelId, setActiveFunnelId] = useState(funnels[0]?.id || '1');
  const [showModal, setShowModal] = useState(false);
  const [showFunnelModal, setShowFunnelModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  
  // Drag and Drop do KANBAN (Cards)
  const [draggedDeal, setDraggedDeal] = useState<string | null>(null);
  const [dragSource, setDragSource] = useState<{
    stageId: string;
    funnelId: string;
  } | null>(null);

  // --- ESTADOS DO FORMULÁRIO DE OPORTUNIDADE (DEAL) ---
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    value: 0,
    contactId: '',
    probability: 50,
    expectedClose: '',
  });

  // --- NOVOS ESTADOS PARA O MODAL DE FUNIL (PIPELINE) ---
  const [funnelName, setFunnelName] = useState('');

  // Lista temporária de etapas sendo criadas
  const [funnelStages, setFunnelStages] = useState<{name: string, color: string}[]>([
    { name: 'Lead', color: '#F59E0B' },
    { name: 'Negociação', color: '#8B5CF6' },
    { name: 'Fechado', color: '#10B981' }
  ]);
  
  // Estado para controlar o Drag and Drop das ETAPAS no modal
  const [draggedStageIndex, setDraggedStageIndex] = useState<number | null>(null);

  // Inputs para adicionar uma nova etapa na lista
  const [newStageName, setNewStageName] = useState('');
  const [newStageColor, setNewStageColor] = useState('#6366F1');

  // Cores sugeridas
  const PRESET_COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#06B6D4', '#EC4899', '#6366F1'];

  // --- CARREGAMENTO INICIAL ---
  useEffect(() => {
    async function loadFunnels() {
      try {
        const data = await getPipelines();
        console.log('Funis vindos do Back-end:', data);

        if (data && data.length > 0) {
          data.forEach((pipeline: any) => {
            // Verifica se já não existe no contexto
            const exists = funnels.find((f) => f.id === pipeline.id);
            if (!exists) {
              addFunnel({
                id: pipeline.id,
                name: pipeline.name,
                stages: pipeline.stages || [], 
              });
            }
          });
        }
      } catch (error) {
        console.error('Erro ao carregar funis:', error);
      }
    }

    loadFunnels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeFunnel = funnels.find((f) => f.id === activeFunnelId);
  const funnelDeals = deals.filter((d) => d.funnelId === activeFunnelId);

  // --- LÓGICA DO MODAL DE FUNIL (ADD/REMOVE/REORDER ETAPAS) ---

  const handleAddStage = (e: React.MouseEvent) => {
    e.preventDefault(); 
    if (!newStageName.trim()) return;

    setFunnelStages([
      ...funnelStages, 
      { name: newStageName, color: newStageColor }
    ]);
    
    setNewStageName('');
    setNewStageColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
  };

  const handleRemoveStage = (index: number) => {
    const newStages = [...funnelStages];
    newStages.splice(index, 1);
    setFunnelStages(newStages);
  };

  // Funções de Drag and Drop para as Etapas
  const handleStageDragStart = (index: number) => {
    setDraggedStageIndex(index);
  };

  const handleStageDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessário para permitir o drop
  };

  const handleStageDrop = (targetIndex: number) => {
    if (draggedStageIndex === null || draggedStageIndex === targetIndex) return;

    const newStages = [...funnelStages];
    const itemToMove = newStages[draggedStageIndex];

    // Remove da posição antiga e insere na nova
    newStages.splice(draggedStageIndex, 1);
    newStages.splice(targetIndex, 0, itemToMove);

    setFunnelStages(newStages);
    setDraggedStageIndex(null);
  };

  const handleFunnelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!funnelName.trim()) {
      alert("O nome do funil é obrigatório");
      return;
    }

    if (funnelStages.length === 0) {
      alert("Adicione pelo menos uma etapa ao funil");
      return;
    }

    try {
      // O backend já usa a ordem do array para definir o campo 'order'
      const newPipeline = await createPipelineService(
        funnelName,
        funnelStages 
      );

      console.log('Pipeline criado:', newPipeline);

      addFunnel({
        id: newPipeline.id,
        name: newPipeline.name,
        stages: newPipeline.stages, 
      });

      setShowFunnelModal(false);
      setFunnelName('');
      setFunnelStages([
        { name: 'Lead', color: '#F59E0B' },
        { name: 'Fechado', color: '#10B981' }
      ]);
      setActiveFunnelId(newPipeline.id);

      alert('Funil criado com sucesso!');
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.error || 'Erro ao criar funil');
    }
  };

  // --- LÓGICA DE MANIPULAÇÃO DE DEALS (MODAIS E SUBMITS) ---

  const openModal = (deal?: Deal) => {
    if (deal) {
      setEditingDeal(deal);
      setFormData({
        title: deal.title,
        description: deal.description || '',
        value: deal.value,
        contactId: deal.contactId,
        probability: deal.probability,
        expectedClose: new Date(deal.expectedClose).toISOString().split('T')[0],
      });
    } else {
      setEditingDeal(null);
      setFormData({
        title: '',
        description: '',
        value: 0,
        contactId: '',
        probability: 50,
        expectedClose: '',
      });
    }
    setShowModal(true);
  };

  const openDetailsModal = (deal: Deal) => {
    setSelectedDeal(deal);
    setShowDetailsModal(true);
  };

  const openEditModal = (deal: Deal) => {
    setEditingDeal(deal);
    setFormData({
      title: deal.title,
      description: deal.description || '',
      value: deal.value,
      contactId: deal.contactId,
      probability: deal.probability,
      expectedClose: new Date(deal.expectedClose).toISOString().split('T')[0],
    });
    setShowDetailsModal(false);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dealData = {
      ...formData,
      stage: activeFunnel?.stages[0].id || 'lead',
      funnelId: activeFunnelId,
      expectedClose: new Date(formData.expectedClose),
    };
    if (editingDeal) {
      updateDeal(editingDeal.id, dealData);
    } else {
      addDeal(dealData);
    }
    setShowModal(false);
  };

  // --- DRAG AND DROP (KANBAN) ---

  const handleDragStart = (dealId: string, stageId: string) => {
    setDraggedDeal(dealId);
    setDragSource({ stageId, funnelId: activeFunnelId });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (stageId: string) => {
    if (draggedDeal && dragSource) {
      moveDeal(draggedDeal, stageId, activeFunnelId);
      setDraggedDeal(null);
      setDragSource(null);
    }
  };

  const getStageDeals = (stageId: string) =>
    funnelDeals.filter((d) => d.stage === stageId);
  const getStageTotal = (stageId: string) =>
    getStageDeals(stageId).reduce((acc, d) => acc + d.value, 0);

  // --- RENDER ---

  return (
    <div>
      <header className="mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">CRM</h1>
          </div>
        </div>

        <div className="flex gap-2 justify-between pb-2 w-full">
          <div className="flex gap-2">
            {funnels.map((funnel) => (
              <button
                key={funnel.id}
                onClick={() => setActiveFunnelId(funnel.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                  activeFunnelId === funnel.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-foreground hover:bg-muted'
                }`}
              >
                {funnel.name}
              </button>
            ))}
            <button
              onClick={() => setShowFunnelModal(true)}
              className="px-4 py-2 rounded-lg font-medium bg-secondary text-foreground hover:bg-muted transition-all whitespace-nowrap cursor-pointer"
            >
              + Novo Funil
            </button>
          </div>

          <button
            className="btn btn-primary cursor-pointer"
            onClick={() => openModal()}
          >
            + Nova Oportunidade
          </button>
        </div>
      </header>

      {/* --- KANBAN BOARD --- */}
      {activeFunnel && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {activeFunnel.stages.map((stage) => {
            const stageDealsList = getStageDeals(stage.id);
            const stageTotal = getStageTotal(stage.id);

            return (
              <div
                key={stage.id}
                className="kanban-column shrink-0"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(stage.id)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                    <h3 className="font-semibold">{stage.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-background text-muted-foreground">
                      {stageDealsList.length}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  R$ {stageTotal.toLocaleString()}
                </p>

                <div className="flex flex-col gap-3 min-h-96">
                  {stageDealsList.map((deal) => {
                    const contact = contacts.find(
                      (c) => c.id === deal.contactId,
                    );
                    return (
                      <div
                        key={deal.id}
                        className={`kanban-card group ${
                          draggedDeal === deal.id ? 'opacity-50' : ''
                        }`}
                        draggable
                        onDragStart={() => handleDragStart(deal.id, stage.id)}
                        onClick={() => openDetailsModal(deal)}
                      >
                        <h4 className="font-medium mb-2 text-sm line-clamp-2">
                          {deal.title}
                        </h4>
                        <p
                          className="text-lg font-bold mb-3"
                          style={{ color: stage.color }}
                        >
                          R$ {deal.value.toLocaleString()}
                        </p>
                        <div className="flex items-center justify-between text-xs mb-3 text-muted-foreground">
                          <span className="truncate">
                            {contact?.name || 'Sem contato'}
                          </span>
                          <span className="font-medium">
                            {deal.probability}%
                          </span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${deal.probability}%`,
                              backgroundColor: stage.color,
                            }}
                          />
                        </div>
                        {deal.description && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-1">
                            {deal.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                  {stageDealsList.length === 0 && (
                    <div className="flex items-center justify-center h-24 rounded-lg border-2 border-dashed border-border text-muted-foreground text-sm">
                      Arraste oportunidades aqui
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- MODAL DETALHES DA OPORTUNIDADE --- */}
      {showDetailsModal && selectedDeal && (
        <div
          className="modal-overlay"
          onClick={() => setShowDetailsModal(false)}
        >
          <div className="modal max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">{selectedDeal.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {activeFunnel?.stages.find((s) => s.id === selectedDeal.stage)
                    ?.name || 'Sem estágio'}
                </p>
              </div>
              <button
                className="text-muted-foreground hover:text-foreground transition-colors text-2xl"
                onClick={() => setShowDetailsModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1 font-medium">
                    VALOR
                  </p>
                  <p className="text-2xl font-bold">
                    R$ {selectedDeal.value.toLocaleString()}
                  </p>
                </div>
                <div className="bg-secondary p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1 font-medium">
                    PROBABILIDADE
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">
                      {selectedDeal.probability}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-medium">
                    CONTATO
                  </p>
                  <p className="text-sm font-medium">
                    {contacts.find((c) => c.id === selectedDeal.contactId)
                      ?.name || 'Sem contato'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-medium">
                    PREVISÃO DE FECHAMENTO
                  </p>
                  <p className="text-sm font-medium">
                    {new Date(selectedDeal.expectedClose).toLocaleDateString(
                      'pt-BR',
                    )}
                  </p>
                </div>
              </div>

              {selectedDeal.description && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-medium">
                    DESCRIÇÃO
                  </p>
                  <p className="text-sm text-foreground bg-secondary p-3 rounded-lg">
                    {selectedDeal.description}
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs text-muted-foreground mb-3 font-medium">
                  PROBABILIDADE
                </p>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${selectedDeal.probability}%` }}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  className="btn btn-secondary flex-1"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Fechar
                </button>
                <button
                  className="btn btn-primary flex-1"
                  onClick={() => openEditModal(selectedDeal)}
                >
                  Editar
                </button>
                <button
                  className="btn btn-ghost text-destructive"
                  onClick={() => {
                    deleteDeal(selectedDeal.id);
                    setShowDetailsModal(false);
                  }}
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL EDITAR/CRIAR OPORTUNIDADE --- */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {editingDeal ? 'Editar Oportunidade' : 'Nova Oportunidade'}
              </h2>
              {editingDeal && (
                <button
                  className="btn btn-ghost text-destructive"
                  onClick={() => {
                    deleteDeal(editingDeal.id);
                    setShowModal(false);
                  }}
                >
                  Excluir
                </button>
              )}
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Título</label>
                <input
                  type="text"
                  className="input"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Descrição
                </label>
                <textarea
                  className="input"
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Valor (R$)
                  </label>
                  <input
                    type="number"
                    className="input"
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        value: Number(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Probabilidade (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="input"
                    value={formData.probability}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        probability: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Contato
                </label>
                <select
                  className="input"
                  value={formData.contactId}
                  onChange={(e) =>
                    setFormData({ ...formData, contactId: e.target.value })
                  }
                  required
                >
                  <option value="">Selecione um contato</option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Previsão de Fechamento
                </label>
                <input
                  type="date"
                  className="input"
                  value={formData.expectedClose}
                  onChange={(e) =>
                    setFormData({ ...formData, expectedClose: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  className="btn btn-secondary flex-1"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary flex-1">
                  {editingDeal ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL NOVO FUNIL (ATUALIZADO COM DRAG & DROP) --- */}
      {showFunnelModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowFunnelModal(false)}
        >
          <div className="modal max-w-lg" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Novo Funil de Vendas</h2>
            
            <form onSubmit={handleFunnelSubmit} className="flex flex-col gap-6">
              
              {/* === NOME DO FUNIL === */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nome do Funil
                </label>
                <input
                  type="text"
                  className="input w-full"
                  value={funnelName}
                  onChange={(e) => setFunnelName(e.target.value)}
                  placeholder="Ex: Vendas Enterprise"
                  required
                />
              </div>

              {/* === GERENCIADOR DE ETAPAS === */}
              <div className="bg-secondary/30 p-4 rounded-xl border border-border">
                <label className="block text-sm font-bold mb-3">
                  Configurar Etapas
                </label>
                
                {/* Lista de Etapas (Arrastável) */}
                <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                  {funnelStages.map((stage, index) => (
                    <div 
                      key={index} 
                      
                      // --- LÓGICA DE DRAG AND DROP ---
                      draggable
                      onDragStart={() => handleStageDragStart(index)}
                      onDragOver={handleStageDragOver}
                      onDrop={() => handleStageDrop(index)}
                      // -------------------------------
                      
                      className={`flex items-center gap-3 bg-background p-2 rounded-lg border shadow-sm cursor-move transition-all ${
                        draggedStageIndex === index ? 'opacity-50 border-dashed border-primary' : 'hover:border-primary/50'
                      }`}
                    >
                      {/* Ícone de "Grip" */}
                      <span className="text-muted-foreground/50 text-xs select-none">⋮⋮</span>

                      {/* Bolinha da cor */}
                      <div 
                        className="w-4 h-4 rounded-full shrink-0 border border-gray-200" 
                        style={{ backgroundColor: stage.color }} 
                      />
                      
                      {/* Nome da Etapa */}
                      <span className="flex-1 font-medium text-sm select-none">{stage.name}</span>
                      
                      {/* Botão Remover */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation(); 
                          handleRemoveStage(index);
                        }}
                        className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors cursor-pointer"
                        title="Remover etapa"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  
                  {funnelStages.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-2">
                      Nenhuma etapa definida. Adicione abaixo.
                    </p>
                  )}
                </div>

                {/* Inputs para Adicionar Nova Etapa */}
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <input
                      type="text"
                      className="input h-9 text-sm"
                      placeholder="Nome da etapa (ex: Proposta)"
                      value={newStageName}
                      onChange={(e) => setNewStageName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddStage(e as any);
                        }
                      }}
                    />
                  </div>
                  
                  {/* Seletor de Cor */}
                  <div className="flex gap-1 bg-background p-1 rounded-lg border items-center">
                    {PRESET_COLORS.slice(0, 3).map(color => (
                       <button
                         key={color}
                         type="button"
                         onClick={() => setNewStageColor(color)}
                         className={`w-5 h-5 rounded-full transition-transform ${newStageColor === color ? 'scale-125 ring-2 ring-offset-1 ring-primary' : 'opacity-70 hover:opacity-100'}`}
                         style={{ backgroundColor: color }}
                       />
                    ))}
                    <input 
                      type="color" 
                      value={newStageColor}
                      onChange={(e) => setNewStageColor(e.target.value)}
                      className="w-6 h-6 rounded-full overflow-hidden cursor-pointer border-0 p-0 ml-1"
                      title="Escolher outra cor"
                    />
                  </div>

                  <button
                    type="button" 
                    onClick={handleAddStage}
                    className="h-9 px-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* === BOTÕES DE AÇÃO === */}
              <div className="flex gap-3 mt-2 border-t pt-4">
                <button
                  type="button"
                  className="btn btn-secondary flex-1"
                  onClick={() => setShowFunnelModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary flex-1">
                  Salvar Funil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}