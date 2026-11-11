import React, { useState } from 'react';
import { X, Check, Hash } from 'lucide-react';
import { PageNumberConfig } from '../types/pdf';

interface PageNumberModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageNumbers: PageNumberConfig;
  totalPages: number;
  onSavePageNumbers: (config: PageNumberConfig) => void;
}

export const PageNumberModal: React.FC<PageNumberModalProps> = ({
  isOpen,
  onClose,
  pageNumbers,
  totalPages,
  onSavePageNumbers,
}) => {
  const [config, setConfig] = useState<PageNumberConfig>({ ...pageNumbers });

  if (!isOpen) return null;

  const handleSave = () => {
    onSavePageNumbers(config);
    onClose();
  };

  const handleDisable = () => {
    onSavePageNumbers({
      ...config,
      enabled: false,
    });
    onClose();
  };

  const formatPreview = (format: PageNumberConfig['format']) => {
    if (format === 'page_of_total') return `Página 1 de ${totalPages}`;
    if (format === 'fraction') return `1 / ${totalPages}`;
    if (format === 'prefix_number') return `Pág. 1`;
    return `1`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-md overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-semibold text-neutral-900">Numeração de Páginas</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <label className="flex items-center gap-2 text-xs font-semibold text-neutral-800 cursor-pointer">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
              className="rounded text-indigo-600 w-4 h-4"
            />
            Ativar Numeração Automática de Páginas
          </label>

          {/* Formats */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1.5">Formato do Texto:</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'page_of_total', label: `Página {n} de {total}` },
                { id: 'fraction', label: `{n} / {total}` },
                { id: 'prefix_number', label: `Pág. {n}` },
                { id: 'number', label: `Apenas número ({n})` },
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  onClick={() => setConfig({ ...config, enabled: true, format: fmt.id as any })}
                  className={`p-2 rounded-lg border text-xs text-left transition-all ${
                    config.format === fmt.id
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 font-semibold'
                      : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <div className="font-mono text-[11px] text-neutral-900">{formatPreview(fmt.id as any)}</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">{fmt.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Position */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1.5">Posição no Documento:</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'bottom-center', label: 'Rodapé Centro' },
                { id: 'bottom-right', label: 'Rodapé Direita' },
                { id: 'bottom-left', label: 'Rodapé Esquerda' },
                { id: 'top-center', label: 'Cabeçalho Centro' },
                { id: 'top-right', label: 'Cabeçalho Direita' },
              ].map((pos) => (
                <button
                  key={pos.id}
                  onClick={() => setConfig({ ...config, position: pos.id as any })}
                  className={`p-2 rounded-lg border text-xs text-center transition-all ${
                    config.position === pos.id
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 font-semibold'
                      : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer">
              <input
                type="checkbox"
                checked={config.skipFirstPage}
                onChange={(e) => setConfig({ ...config, skipFirstPage: e.target.checked })}
                className="rounded text-indigo-600"
              />
              Ignorar capa / 1ª página
            </label>

            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-600">Iniciar em:</span>
              <input
                type="number"
                min="1"
                value={config.startAt}
                onChange={(e) => setConfig({ ...config, startAt: Number(e.target.value) || 1 })}
                className="w-14 px-2 py-1 text-xs border border-neutral-300 rounded text-center"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-3.5 bg-neutral-50 border-t border-neutral-200">
          <button
            onClick={handleDisable}
            className="text-xs text-rose-600 hover:text-rose-700 font-medium"
          >
            Desativar Numeração
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Aplicar Numeração
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
