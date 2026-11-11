import React, { useState } from 'react';
import {
  X,
  RotateCw,
  RotateCcw,
  Copy,
  Trash2,
  Plus,
  ArrowLeft,
  ArrowRight,
  FilePlus,
  Download,
  Check,
} from 'lucide-react';
import { PageInfo } from '../types/pdf';

interface PageManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pages: PageInfo[];
  thumbnails: { [pageIndex: number]: string };
  onReorderPages: (fromIndex: number, toIndex: number) => void;
  onRotatePage: (pageIndex: number, deltaAngle: number) => void;
  onDeletePage: (pageIndex: number) => void;
  onDuplicatePage: (pageIndex: number) => void;
  onInsertBlankPage: (atIndex: number) => void;
  onMergePdfFile: (file: File) => void;
  onExtractPage: (pageIndex: number) => void;
}

export const PageManagerModal: React.FC<PageManagerModalProps> = ({
  isOpen,
  onClose,
  pages,
  thumbnails,
  onReorderPages,
  onRotatePage,
  onDeletePage,
  onDuplicatePage,
  onInsertBlankPage,
  onMergePdfFile,
  onExtractPage,
}) => {
  const [selectedPageIndex, setSelectedPageIndex] = useState<number | null>(pages.length > 0 ? 0 : null);

  if (!isOpen) return null;

  const handleMergeFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onMergePdfFile(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <div>
            <h2 className="text-base font-semibold text-neutral-900">Organizador e Gerenciador de Páginas</h2>
            <p className="text-xs text-neutral-500">
              Reordene, gire, duplique, exclua ou mescle novas páginas no documento
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg cursor-pointer transition-colors border border-indigo-200">
              <FilePlus className="w-4 h-4" />
              Mesclar outro PDF
              <input
                type="file"
                accept="application/pdf"
                onChange={handleMergeFileInput}
                className="hidden"
              />
            </label>
            <button
              onClick={() => onInsertBlankPage(pages.length)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors border border-neutral-200"
            >
              <Plus className="w-4 h-4" />
              Adicionar Página em Branco
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Pages Grid Container */}
        <div className="flex-1 overflow-y-auto p-6 bg-neutral-50">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {pages.map((page, idx) => {
              const isSelected = selectedPageIndex === idx;
              const thumbUrl = thumbnails[idx];

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedPageIndex(idx)}
                  className={`group relative flex flex-col bg-white rounded-xl border-2 transition-all cursor-pointer overflow-hidden ${
                    isSelected
                      ? 'border-indigo-600 ring-2 ring-indigo-200 shadow-md'
                      : 'border-neutral-200 hover:border-neutral-300 hover:shadow-xs'
                  }`}
                >
                  {/* Top Bar inside card */}
                  <div className="flex items-center justify-between px-2.5 py-1.5 bg-neutral-50 border-b border-neutral-100 text-[11px] font-semibold text-neutral-700">
                    <span className="tabular-nums">Pág. {idx + 1}</span>
                    <div className="flex items-center gap-1">
                      {idx > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onReorderPages(idx, idx - 1);
                            setSelectedPageIndex(idx - 1);
                          }}
                          className="p-1 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 rounded"
                          title="Mover para esquerda"
                        >
                          <ArrowLeft className="w-3 h-3" />
                        </button>
                      )}
                      {idx < pages.length - 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onReorderPages(idx, idx + 1);
                            setSelectedPageIndex(idx + 1);
                          }}
                          className="p-1 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 rounded"
                          title="Mover para direita"
                        >
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Thumbnail Preview */}
                  <div className="h-44 p-2 flex items-center justify-center bg-neutral-100/60 overflow-hidden">
                    {thumbUrl ? (
                      <img
                        src={thumbUrl}
                        alt={`Página ${idx + 1}`}
                        style={{
                          transform: `rotate(${page.rotation}deg)`,
                          transition: 'transform 0.2s ease',
                        }}
                        className="max-h-full max-w-full object-contain shadow-xs border border-neutral-200 bg-white"
                      />
                    ) : (
                      <div className="w-24 h-32 bg-white border border-neutral-200 rounded shadow-xs flex items-center justify-center text-neutral-400 text-xs font-mono">
                        {idx + 1}
                      </div>
                    )}
                  </div>

                  {/* Bottom Actions Bar */}
                  <div className="flex items-center justify-around p-1 bg-white border-t border-neutral-100 text-neutral-500">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRotatePage(idx, -90);
                      }}
                      className="p-1 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                      title="Girar 90° anti-horário"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRotatePage(idx, 90);
                      }}
                      className="p-1 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                      title="Girar 90° horário"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicatePage(idx);
                      }}
                      className="p-1 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                      title="Duplicar página"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onExtractPage(idx);
                      }}
                      className="p-1 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                      title="Extrair / Baixar esta página"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (pages.length <= 1) {
                          alert('O documento precisa ter pelo menos uma página.');
                          return;
                        }
                        if (confirm(`Excluir a Página ${idx + 1}?`)) {
                          onDeletePage(idx);
                          setSelectedPageIndex(0);
                        }
                      }}
                      disabled={pages.length <= 1}
                      className="p-1 hover:text-rose-600 hover:bg-rose-50 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                      title="Excluir página"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-neutral-50 border-t border-neutral-200">
          <div className="flex items-center gap-2 text-xs text-neutral-600 font-medium">
            <span>Total de Páginas:</span>
            <span className="font-bold text-neutral-900 tabular-nums">{pages.length}</span>
            <span className="text-neutral-300">·</span>
            <span>Clique numa página para selecionar ou use os botões de ação</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            Concluir Organização
          </button>
        </div>
      </div>
    </div>
  );
};
