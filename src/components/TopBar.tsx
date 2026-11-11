import React, { useState } from 'react';
import {
  FileText,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Printer,
  ChevronDown,
  Edit2,
  FolderOpen,
  Sparkles,
} from 'lucide-react';

interface TopBarProps {
  documentTitle: string;
  onUpdateTitle: (title: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onFitWidth: () => void;
  currentPage: number;
  totalPages: number;
  onExportPdf: () => void;
  onPrint: () => void;
  onOpenSampleModal: () => void;
  onUploadNewPdf: (file: File) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  documentTitle,
  onUpdateTitle,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitWidth,
  currentPage,
  totalPages,
  onExportPdf,
  onPrint,
  onOpenSampleModal,
  onUploadNewPdf,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(documentTitle);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (tempTitle.trim()) {
      onUpdateTitle(tempTitle.trim());
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadNewPdf(file);
    }
  };

  return (
    <header className="flex items-center justify-between gap-8 px-6 py-2.5 bg-white border-b border-neutral-200 select-none z-30 shrink-0">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <FileText className="w-4 h-4" />
          </div>
          <span className="text-base font-bold tracking-tight text-neutral-900 whitespace-nowrap shrink-0">
            DocuCraft <span className="text-indigo-600 font-extrabold">PDF</span>
          </span>
        </div>

        {/* Quick upload & Templates link */}
        <div className="hidden lg:flex items-center gap-1.5 pl-3 border-l border-neutral-200">
          <label
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-neutral-700 hover:text-indigo-600 hover:bg-neutral-100 rounded-md cursor-pointer transition-colors whitespace-nowrap shrink-0"
            title="Abrir arquivo PDF do seu computador"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            Abrir PDF
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileInput}
              className="hidden"
            />
          </label>
          <button
            onClick={onOpenSampleModal}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors whitespace-nowrap shrink-0"
            title="Carregar modelos prontos de PDF"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Modelos de Exemplo
          </button>
        </div>
      </div>

      {/* Zone 2: Navigation & Document Controls */}
      <nav className="flex items-center gap-4 text-xs font-medium text-neutral-600">
        {/* Document Title pill/inline */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 rounded-lg text-neutral-800 whitespace-nowrap shrink-0">
          {isEditingTitle ? (
            <input
              type="text"
              value={tempTitle}
              autoFocus
              onChange={(e) => setTempTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSubmit();
                if (e.key === 'Escape') setIsEditingTitle(false);
              }}
              className="bg-white border border-indigo-500 rounded px-1.5 py-0.5 text-xs font-semibold focus:outline-hidden"
            />
          ) : (
            <button
              onClick={() => {
                setTempTitle(documentTitle);
                setIsEditingTitle(true);
              }}
              className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors"
              title="Clique para renomear"
            >
              <span className="font-semibold text-neutral-900 truncate max-w-44">
                {documentTitle}
              </span>
              <Edit2 className="w-3 h-3 text-neutral-400 hover:text-neutral-700" />
            </button>
          )}
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 bg-neutral-100 p-0.5 rounded-lg whitespace-nowrap shrink-0">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 rounded-md hover:bg-white text-neutral-700 hover:text-neutral-900 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Desfazer (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 rounded-md hover:bg-white text-neutral-700 hover:text-neutral-900 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Refazer (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-neutral-100 p-0.5 rounded-lg whitespace-nowrap shrink-0">
          <button
            onClick={onZoomOut}
            className="p-1.5 rounded-md hover:bg-white text-neutral-700 hover:text-neutral-900 transition-colors"
            title="Diminuir Zoom"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onResetZoom}
            className="px-2 py-1 text-[11px] font-mono font-semibold text-neutral-800 tabular-nums hover:bg-white rounded transition-colors"
            title="Clique para 100%"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={onZoomIn}
            className="p-1.5 rounded-md hover:bg-white text-neutral-700 hover:text-neutral-900 transition-colors"
            title="Aumentar Zoom"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onFitWidth}
            className="p-1.5 rounded-md hover:bg-white text-neutral-700 hover:text-neutral-900 transition-colors hidden md:block"
            title="Ajustar à Largura"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Page Counter Indicator */}
        <div className="hidden md:flex items-center gap-1 text-xs text-neutral-500 tabular-nums whitespace-nowrap shrink-0">
          <span>Pág.</span>
          <span className="font-bold text-neutral-900">{currentPage}</span>
          <span>de</span>
          <span className="font-bold text-neutral-900">{totalPages}</span>
        </div>
      </nav>

      {/* Zone 3: 1 Primary Action */}
      <div className="relative flex items-center gap-2 shrink-0">
        <button
          onClick={onExportPdf}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Baixar PDF</span>
        </button>

        <button
          onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
          className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg border border-neutral-200 transition-colors shrink-0"
          title="Mais opções de exportação"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>

        {/* Dropdown Menu */}
        {isExportMenuOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-neutral-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
            <button
              onClick={() => {
                setIsExportMenuOpen(false);
                onExportPdf();
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-neutral-800 hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-left"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Arquivo PDF</span>
            </button>
            <button
              onClick={() => {
                setIsExportMenuOpen(false);
                onPrint();
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-neutral-800 hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-left"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Documento</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
