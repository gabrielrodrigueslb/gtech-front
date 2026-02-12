'use client';

import { useState, useEffect} from 'react';
import {
  createPipeline as createPipelineService,
  updatePipeline as updatePipelineService,
} from '@/lib/pipeline';
import { useFunnel } from '@/context/funnel-context';
import { FaPlus, FaTrash, FaGripVertical } from 'react-icons/fa';

type Stage = {
  id?: string;
  name: string;
  color: string;
};

type FunnelFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  funnelToEdit: { id: string; name: string; stages: Stage[] } | null;
};

const PRESET_COLORS = [
  '#F59E0B', // Amber
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F43F5E', // Rose
  '#84CC16', // Lime
  '#6366F1', // Indigo
  '#64748B', // Slate
];

export default function FunnelFormModal({
  isOpen,
  onClose,
  funnelToEdit,
}: FunnelFormModalProps) {
  const { addFunnel, updateFunnel, setActiveFunnelId } = useFunnel();

  // Estados Locais
  const [funnelName, setFunnelName] = useState('');
  const [stages, setStages] = useState<Stage[]>([
    { name: 'Lead', color: '#F59E0B' },
    { name: 'Negociação', color: '#8B5CF6' },
    { name: 'Fechado', color: '#10B981' },
  ]);

  // Estados para nova etapa
  const [newStageName, setNewStageName] = useState('');
  const [newStageColor, setNewStageColor] = useState(PRESET_COLORS[0]);

  // Drag and Drop
  const [draggedStageIndex, setDraggedStageIndex] = useState<number | null>(null);

  // Carrega dados quando abre a modal ou troca o funil
  useEffect(() => {
    if (isOpen) {
      if (funnelToEdit) {
        setFunnelName(funnelToEdit.name);
        setStages(funnelToEdit.stages || []);
      } else {
        // Reset para criação
        setFunnelName('');
        setStages([
          { name: 'Lead', color: '#F59E0B' },
          { name: 'Negociação', color: '#8B5CF6' },
          { name: 'Fechado', color: '#10B981' },
        ]);
      }
      setNewStageName('');
      setNewStageColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
    }
  }, [isOpen, funnelToEdit]);

  // --- LOGICA DE ETAPAS ---
  const handleAddStage = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newStageName.trim()) return;
    setStages([...stages, { name: newStageName, color: newStageColor }]);
    setNewStageName('');
    // Seleciona uma cor aleatória para o próximo
    setNewStageColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
  };

  const handleRemoveStage = (index: number) => {
    const newStages = [...stages];
    newStages.splice(index, 1);
    setStages(newStages);
  };

  // --- DRAG AND DROP ---
  const handleStageDragStart = (index: number) => setDraggedStageIndex(index);
  const handleStageDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleStageDrop = (targetIndex: number) => {
    if (draggedStageIndex === null || draggedStageIndex === targetIndex) return;
    const newStages = [...stages];
    const itemToMove = newStages[draggedStageIndex];
    newStages.splice(draggedStageIndex, 1);
    newStages.splice(targetIndex, 0, itemToMove);
    setStages(newStages);
    setDraggedStageIndex(null);
  };

  // --- SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!funnelName.trim()) return alert('Nome do funil é obrigatório');
    if (stages.length === 0) return alert('Adicione pelo menos uma etapa');

    try {
      if (funnelToEdit) {
        const updatedPipeline = await updatePipelineService(
          funnelToEdit.id,
          funnelName,
          stages
        );
        updateFunnel(funnelToEdit.id, {
          id: updatedPipeline.id,
          name: updatedPipeline.name,
          stages: updatedPipeline.stages || [],
        });
      } else {
        const newPipeline = await createPipelineService(funnelName, stages);
        addFunnel({
          id: newPipeline.id,
          name: newPipeline.name,
          stages: newPipeline.stages || [],
        });
        setActiveFunnelId(newPipeline.id);
      }
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao salvar funil');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-lg rounded-2xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              {funnelToEdit ? 'Editar Funil' : 'Novo Funil'}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Configure as etapas do seu processo de vendas
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          
          {/* Nome do Funil */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground">
              Nome do Pipeline
            </label>
            <input
              type="text"
              className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
              placeholder="Ex: Vendas Enterprise"
              value={funnelName}
              onChange={(e) => setFunnelName(e.target.value)}
              required
            />
          </div>

          <div className="border-t border-border/50 my-4" />

          {/* Lista de Etapas (Drag & Drop) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase text-muted-foreground">
                Etapas do Processo
              </label>
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                {stages.length} Etapas
              </span>
            </div>
            
            <div className="space-y-2">
              {stages.map((stage, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={() => handleStageDragStart(index)}
                  onDragOver={handleStageDragOver}
                  onDrop={() => handleStageDrop(index)}
                  className={`flex items-center gap-3 bg-card hover:bg-muted/30 border border-border p-2 rounded-xl group cursor-move transition-all ${
                    draggedStageIndex === index ? 'opacity-50 border-dashed border-primary' : ''
                  }`}
                >
                  <div className="text-muted-foreground/30 group-hover:text-muted-foreground cursor-move p-1">
                     <FaGripVertical size={14} />
                  </div>
                  
                  <div
                    className="w-4 h-4 rounded-full shrink-0 shadow-sm ring-2 ring-white/10"
                    style={{ backgroundColor: stage.color }}
                  />
                  
                  <span className="flex-1 text-sm font-medium text-foreground">
                    {stage.name}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleRemoveStage(index)}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Remover etapa"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              ))}
              
              {stages.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed border-border rounded-xl">
                  Nenhuma etapa definida
                </div>
              )}
            </div>
          </div>

          {/* Adicionar Nova Etapa */}
          <div className="bg-muted/30 p-4 rounded-xl border border-border/50 space-y-3">
            <label className="text-xs font-bold uppercase text-muted-foreground block">
              Adicionar Nova Etapa
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary transition-all"
                placeholder="Nome da etapa..."
                value={newStageName}
                onChange={(e) => setNewStageName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddStage(e as any)}
              />
              <button
                type="button"
                onClick={handleAddStage}
                className="bg-primary text-primary-foreground w-10 h-10 rounded-xl flex items-center justify-center hover:opacity-90 transition-all shadow-lg shadow-primary/20"
              >
                <FaPlus size={14} />
              </button>
            </div>
            
            {/* Seletor de Cores */}
            <div className="flex flex-wrap gap-2 pt-1">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewStageColor(color)}
                  className={`w-6 h-6 rounded-full transition-all hover:scale-110 ${
                    newStageColor === color
                      ? 'ring-2 ring-offset-2 ring-offset-card ring-primary scale-110'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/20 flex gap-3">
          <button
            type="button"
            className="flex-1 px-4 py-3 border border-border bg-background rounded-xl font-medium hover:bg-muted transition-all text-sm"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/25 text-sm"
          >
            {funnelToEdit ? 'Salvar Alterações' : 'Criar Funil'}
          </button>
        </div>
      </div>
    </div>
  );
}