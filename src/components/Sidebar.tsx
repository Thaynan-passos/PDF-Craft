import React, { useState } from 'react';
import {
  FileText,
  Layers,
  RotateCw,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Type,
  Pen,
  Highlighter,
  Square,
  ShieldAlert,
  FileSignature,
  Award,
  Plus,
} from 'lucide-react';
import { PageInfo, Annotation } from '../types/pdf';

interface SidebarProps {
  pages: PageInfo[];
  currentPageIndex: number;
  thumbnails: { [pageIndex: number]: string };
  annotations: Annotation[];
  selectedAnnotationId: string | null;
  onSelectPage: (pageIndex: number) => void;
  onRotatePage: (pageIndex: number, delta: number) => void;
  onDeletePage: (pageIndex: number) => void;
  onSelectAnnotation: (id: string) => void;
  onDeleteAnnotation: (id: string) => void;
  onAddBlankPage: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  pages,
  currentPageIndex,
  thumbnails,
  annotations,
  selectedAnnotationId,
  onSelectPage,
  onRotatePage,
  onDeletePage,
  onSelectAnnotation,
  onDeleteAnnotation,
  onAddBlankPage,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [sidebarTab, setSidebarTab] = useState<'thumbnails' | 'layers'>('thumbnails');

  if (isCollapsed) {
    return (
      <div className="w-12 bg-white border-r border-neutral-200 flex flex-col items-center py-3 gap-3 select-none shrink-0 z-20">
        <button
          onClick={onToggleCollapse}
          className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
          title="Expandir barra lateral"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            onToggleCollapse();
            setSidebarTab('thumbnails');
          }}
          className="p-1.5 text-neutral-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
          title="Miniaturas de páginas"
        >
          <FileText className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            onToggleCollapse();
            setSidebarTab('layers');
          }}
          className="p-1.5 text-neutral-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
          title="Camadas de anotações"
        >
          <Layers className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const currentPageAnnotations = annotations.filter((a) => a.pageIndex === currentPageIndex);

  const getAnnotationIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <Type className="w-3.5 h-3.5 text-indigo-500" />;
      case 'draw':
        return <Pen className="w-3.5 h-3.5 text-blue-500" />;
      case 'highlight':
        return <Highlighter className="w-3.5 h-3.5 text-amber-500" />;
      case 'rectangle':
      case 'circle':
      case 'line':
      case 'arrow':
        return <Square className="w-3.5 h-3.5 text-violet-500" />;
      case 'redact':
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />;
      case 'signature':
        return <FileSignature className="w-3.5 h-3.5 text-emerald-500" />;
      case 'stamp':
        return <Award className="w-3.5 h-3.5 text-red-500" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-neutral-400" />;
    }
  };

  const getAnnotationLabel = (ann: Annotation) => {
    switch (ann.type) {
      case 'text':
        return ann.text ? `"${ann.text.slice(0, 15)}..."` : 'Texto';
      case 'signature':
        return ann.signerName ? `Assinatura: ${ann.signerName}` : 'Assinatura Digital';
      case 'stamp':
        return `Carimbo: ${ann.label}`;
      case 'redact':
        return 'Tarja de Censura';
      case 'highlight':
        return 'Marca-Texto';
      case 'draw':
        return 'Desenho Livre';
      case 'note':
        return 'Nota Adesiva';
      case 'image':
        return 'Imagem';
      default:
        return 'Forma Geométrica';
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col select-none shrink-0 z-20 h-full">
      {/* Top Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-neutral-200">
        <div className="flex items-center gap-1 bg-neutral-100 p-0.5 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setSidebarTab('thumbnails')}
            className={`px-3 py-1 rounded-md transition-all ${
              sidebarTab === 'thumbnails'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Páginas ({pages.length})
          </button>
          <button
            onClick={() => setSidebarTab('layers')}
            className={`px-3 py-1 rounded-md transition-all ${
              sidebarTab === 'layers'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Camadas ({currentPageAnnotations.length})
          </button>
        </div>

        <button
          onClick={onToggleCollapse}
          className="p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded transition-colors"
          title="Recolher painel"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-3">
        {sidebarTab === 'thumbnails' ? (
          <div className="flex flex-col gap-3">
            {pages.map((page, idx) => {
              const isCurrent = currentPageIndex === idx;
              const thumb = thumbnails[idx];

              return (
                <div
                  key={idx}
                  onClick={() => onSelectPage(idx)}
                  className={`group relative flex flex-col items-center p-2 rounded-xl border-2 transition-all cursor-pointer ${
                    isCurrent
                      ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-100'
                      : 'border-neutral-200 hover:border-neutral-300 bg-neutral-50/50 hover:bg-neutral-50'
                  }`}
                >
                  {/* Thumbnail box */}
                  <div className="relative w-full h-36 flex items-center justify-center overflow-hidden rounded bg-white border border-neutral-200 shadow-2xs">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={`Página ${idx + 1}`}
                        style={{
                          transform: `rotate(${page.rotation}deg)`,
                          transition: 'transform 0.2s ease',
                        }}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <div className="w-16 h-20 bg-neutral-100 rounded border border-neutral-200 flex items-center justify-center text-neutral-400 font-mono text-xs">
                        {idx + 1}
                      </div>
                    )}

                    {/* Quick action overlay */}
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white/90 backdrop-blur-xs p-1 rounded-md shadow-xs">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRotatePage(idx, 90);
                        }}
                        className="p-1 text-neutral-600 hover:text-indigo-600 rounded hover:bg-neutral-100"
                        title="Girar 90°"
                      >
                        <RotateCw className="w-3 h-3" />
                      </button>
                      {pages.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Excluir página ${idx + 1}?`)) {
                              onDeletePage(idx);
                            }
                          }}
                          className="p-1 text-neutral-600 hover:text-rose-600 rounded hover:bg-rose-50"
                          title="Excluir página"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Page Label */}
                  <div className="flex items-center justify-between w-full mt-2 px-1 text-[11px] font-semibold">
                    <span
                      className={`tabular-nums ${
                        isCurrent ? 'text-indigo-700 font-bold' : 'text-neutral-600'
                      }`}
                    >
                      Página {idx + 1}
                    </span>
                    {page.rotation !== 0 && (
                      <span className="text-[10px] text-neutral-400 font-mono">{page.rotation}°</span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Quick add blank page */}
            <button
              onClick={onAddBlankPage}
              className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-dashed border-neutral-300 text-xs font-semibold text-neutral-600 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Inserir Página em Branco
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <div className="text-[11px] font-semibold text-neutral-500 uppercase px-1 pb-1 border-b border-neutral-100">
              Anotações na Página {currentPageIndex + 1}
            </div>

            {currentPageAnnotations.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-400">
                Nenhum elemento adicionado nesta página ainda. Use a barra de ferramentas para adicionar texto,
                desenho, carimbos ou assinatura.
              </div>
            ) : (
              currentPageAnnotations.map((ann) => {
                const isSelected = selectedAnnotationId === ann.id;
                return (
                  <div
                    key={ann.id}
                    onClick={() => onSelectAnnotation(ann.id)}
                    className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-50 text-indigo-900 border border-indigo-300 font-semibold shadow-xs'
                        : 'hover:bg-neutral-100 text-neutral-700 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {getAnnotationIcon(ann.type)}
                      <span className="truncate">{getAnnotationLabel(ann)}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteAnnotation(ann.id);
                      }}
                      className="p-1 text-neutral-400 hover:text-rose-600 rounded transition-colors"
                      title="Excluir anotação"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="p-3 border-t border-neutral-200 bg-neutral-50 text-[11px] text-neutral-500 flex flex-col gap-1">
        <div className="flex justify-between">
          <span>Tamanho:</span>
          <span className="font-medium text-neutral-700">A4 (595 × 842 pt)</span>
        </div>
        <div className="flex justify-between">
          <span>Orientação:</span>
          <span className="font-medium text-neutral-700">Retrato</span>
        </div>
      </div>
    </aside>
  );
};
