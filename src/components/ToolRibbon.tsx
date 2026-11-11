import React, { useState } from 'react';
import {
  MousePointer,
  Type,
  Pen,
  Highlighter,
  Square,
  Circle,
  Minus,
  ArrowRight,
  ShieldAlert,
  FileSignature,
  Award,
  Image as ImageIcon,
  StickyNote,
  Layers,
  Droplets,
  Hash,
  ChevronDown,
} from 'lucide-react';
import { ToolType } from '../types/pdf';

interface ToolRibbonProps {
  activeTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  onOpenSignatureModal: () => void;
  onOpenStampModal: () => void;
  onOpenPageManagerModal: () => void;
  onOpenWatermarkModal: () => void;
  onOpenPageNumberModal: () => void;
  onInsertImageFile: (file: File) => void;
}

export const ToolRibbon: React.FC<ToolRibbonProps> = ({
  activeTool,
  onSelectTool,
  onOpenSignatureModal,
  onOpenStampModal,
  onOpenPageManagerModal,
  onOpenWatermarkModal,
  onOpenPageNumberModal,
  onInsertImageFile,
}) => {
  const [shapesDropdownOpen, setShapesDropdownOpen] = useState(false);

  const handleImageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onInsertImageFile(file);
    }
  };

  const isShapeTool = ['rectangle', 'circle', 'line', 'arrow'].includes(activeTool);

  return (
    <div className="flex items-center justify-between px-6 py-2 bg-neutral-50/90 border-b border-neutral-200 text-xs overflow-x-auto select-none gap-4">
      {/* Primary Tools group */}
      <div className="flex items-center gap-1">
        {/* Selection / Pointer */}
        <button
          onClick={() => onSelectTool('select')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTool === 'select'
              ? 'bg-white text-indigo-700 shadow-xs border border-neutral-200 font-semibold'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
          }`}
          title="Selecionar e mover elementos (V)"
        >
          <MousePointer className="w-4 h-4" />
          <span>Selecionar</span>
        </button>

        {/* Text tool */}
        <button
          onClick={() => onSelectTool('text')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTool === 'text'
              ? 'bg-white text-indigo-700 shadow-xs border border-neutral-200 font-semibold'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
          }`}
          title="Adicionar Caixa de Texto (T)"
        >
          <Type className="w-4 h-4" />
          <span>Texto</span>
        </button>

        {/* Pen tool */}
        <button
          onClick={() => onSelectTool('draw')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTool === 'draw'
              ? 'bg-white text-indigo-700 shadow-xs border border-neutral-200 font-semibold'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
          }`}
          title="Caneta de Desenho Livre (P)"
        >
          <Pen className="w-4 h-4" />
          <span>Caneta</span>
        </button>

        {/* Highlighter tool */}
        <button
          onClick={() => onSelectTool('highlight')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTool === 'highlight'
              ? 'bg-white text-indigo-700 shadow-xs border border-neutral-200 font-semibold'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
          }`}
          title="Marca-Texto Translúcido (H)"
        >
          <Highlighter className="w-4 h-4 text-amber-500" />
          <span>Marca-Texto</span>
        </button>

        {/* Shapes Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShapesDropdownOpen(!shapesDropdownOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              isShapeTool
                ? 'bg-white text-indigo-700 shadow-xs border border-neutral-200 font-semibold'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
            }`}
            title="Formas Geométricas"
          >
            {activeTool === 'rectangle' && <Square className="w-4 h-4" />}
            {activeTool === 'circle' && <Circle className="w-4 h-4" />}
            {activeTool === 'line' && <Minus className="w-4 h-4" />}
            {activeTool === 'arrow' && <ArrowRight className="w-4 h-4" />}
            {!isShapeTool && <Square className="w-4 h-4" />}
            <span>Formas</span>
            <ChevronDown className="w-3 h-3 text-neutral-400" />
          </button>

          {shapesDropdownOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-36 bg-white rounded-xl shadow-xl border border-neutral-200 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={() => {
                  onSelectTool('rectangle');
                  setShapesDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-700 hover:bg-indigo-50 hover:text-indigo-700"
              >
                <Square className="w-3.5 h-3.5" />
                Retângulo
              </button>
              <button
                onClick={() => {
                  onSelectTool('circle');
                  setShapesDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-700 hover:bg-indigo-50 hover:text-indigo-700"
              >
                <Circle className="w-3.5 h-3.5" />
                Círculo
              </button>
              <button
                onClick={() => {
                  onSelectTool('line');
                  setShapesDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-700 hover:bg-indigo-50 hover:text-indigo-700"
              >
                <Minus className="w-3.5 h-3.5" />
                Linha Reta
              </button>
              <button
                onClick={() => {
                  onSelectTool('arrow');
                  setShapesDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-700 hover:bg-indigo-50 hover:text-indigo-700"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                Seta
              </button>
            </div>
          )}
        </div>

        {/* Redaction / Censura */}
        <button
          onClick={() => onSelectTool('redact')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTool === 'redact'
              ? 'bg-neutral-900 text-white shadow-xs font-semibold'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
          }`}
          title="Tarja de Censura / Ocultar dados confidenciais"
        >
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          <span>Censurar (Tarja)</span>
        </button>
      </div>

      <div className="h-4 w-px bg-neutral-300 hidden sm:block shrink-0" />

      {/* Insert Objects group */}
      <div className="flex items-center gap-1">
        {/* Signature */}
        <button
          onClick={onOpenSignatureModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-neutral-700 hover:text-indigo-600 hover:bg-indigo-50/80 transition-all border border-neutral-200 bg-white"
          title="Assinatura Digital (Desenhar, Digitar ou Imagem)"
        >
          <FileSignature className="w-4 h-4 text-indigo-600" />
          <span>Assinatura</span>
        </button>

        {/* Stamps */}
        <button
          onClick={onOpenStampModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-neutral-700 hover:text-emerald-700 hover:bg-emerald-50/80 transition-all border border-neutral-200 bg-white"
          title="Carimbos (Aprovado, Pago, Confidencial)"
        >
          <Award className="w-4 h-4 text-emerald-600" />
          <span>Carimbos</span>
        </button>

        {/* Image insertion */}
        <label
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-200/60 cursor-pointer transition-all"
          title="Inserir imagem / foto / logotipo"
        >
          <ImageIcon className="w-4 h-4" />
          <span>Imagem</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageInput}
            className="hidden"
          />
        </label>

        {/* Sticky Note */}
        <button
          onClick={() => onSelectTool('note')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTool === 'note'
              ? 'bg-amber-100 text-amber-900 shadow-xs border border-amber-300 font-semibold'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
          }`}
          title="Adicionar Nota Adesiva / Comentário"
        >
          <StickyNote className="w-4 h-4 text-amber-500" />
          <span>Nota</span>
        </button>
      </div>

      <div className="h-4 w-px bg-neutral-300 hidden md:block shrink-0" />

      {/* Document tools (Page manager, Watermark, Page numbering) */}
      <div className="flex items-center gap-1">
        <button
          onClick={onOpenPageManagerModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-neutral-700 hover:text-indigo-600 hover:bg-neutral-100 transition-all whitespace-nowrap"
          title="Organizar, girar, excluir ou mesclar páginas"
        >
          <Layers className="w-4 h-4 text-indigo-500" />
          <span>Organizar Páginas</span>
        </button>

        <button
          onClick={onOpenWatermarkModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-neutral-700 hover:text-indigo-600 hover:bg-neutral-100 transition-all whitespace-nowrap"
          title="Adicionar marca d'água"
        >
          <Droplets className="w-4 h-4 text-neutral-500" />
          <span>Marca d'Água</span>
        </button>

        <button
          onClick={onOpenPageNumberModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-neutral-700 hover:text-indigo-600 hover:bg-neutral-100 transition-all whitespace-nowrap"
          title="Configurar numeração de páginas"
        >
          <Hash className="w-4 h-4 text-neutral-500" />
          <span>Numeração</span>
        </button>
      </div>
    </div>
  );
};
