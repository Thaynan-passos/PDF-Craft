import React, { useState } from 'react';
import { X, Check, Droplets } from 'lucide-react';
import { WatermarkConfig } from '../types/pdf';

interface WatermarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  watermark: WatermarkConfig;
  onSaveWatermark: (config: WatermarkConfig) => void;
}

export const WatermarkModal: React.FC<WatermarkModalProps> = ({
  isOpen,
  onClose,
  watermark,
  onSaveWatermark,
}) => {
  const [config, setConfig] = useState<WatermarkConfig>({ ...watermark });

  if (!isOpen) return null;

  const presetTexts = ['CONFIDENCIAL', 'CÓPIA NÃO AUTORIZADA', 'RASCUNHO', 'APROVADO', 'URGENTE'];

  const handleSave = () => {
    onSaveWatermark(config);
    onClose();
  };

  const handleRemove = () => {
    onSaveWatermark({
      ...config,
      enabled: false,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-md overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-semibold text-neutral-900">Marca d'Água no Documento</h2>
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
            Ativar Marca d'Água nas Páginas
          </label>

          {/* Quick presets */}
          <div>
            <span className="block text-xs font-medium text-neutral-600 mb-1.5">Modelos Rápidos:</span>
            <div className="flex flex-wrap gap-1.5">
              {presetTexts.map((text) => (
                <button
                  key={text}
                  onClick={() => setConfig({ ...config, enabled: true, text })}
                  className="px-2.5 py-1 text-[11px] rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
                >
                  {text}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Texto da Marca d'Água:</label>
            <input
              type="text"
              value={config.text}
              onChange={(e) => setConfig({ ...config, text: e.target.value })}
              placeholder="Ex: CONFIDENCIAL"
              className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 uppercase font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Tamanho da Fonte: <span className="text-neutral-500">{config.fontSize}px</span>
              </label>
              <input
                type="range"
                min="24"
                max="84"
                value={config.fontSize}
                onChange={(e) => setConfig({ ...config, fontSize: Number(e.target.value) })}
                className="w-full accent-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Opacidade: <span className="text-neutral-500">{Math.round(config.opacity * 100)}%</span>
              </label>
              <input
                type="range"
                min="0.05"
                max="0.6"
                step="0.05"
                value={config.opacity}
                onChange={(e) => setConfig({ ...config, opacity: Number(e.target.value) })}
                className="w-full accent-indigo-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Ângulo: <span className="text-neutral-500">{config.rotation}°</span>
              </label>
              <input
                type="range"
                min="-90"
                max="90"
                step="5"
                value={config.rotation}
                onChange={(e) => setConfig({ ...config, rotation: Number(e.target.value) })}
                className="w-full accent-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">Cor:</label>
              <div className="flex items-center gap-2">
                {['#94a3b8', '#dc2626', '#2563eb', '#16a34a', '#475569'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setConfig({ ...config, color: c })}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${
                      config.color === c ? 'scale-110 border-indigo-600 ring-2 ring-indigo-200' : 'border-white'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Mini preview */}
          <div className="p-3 bg-neutral-100 rounded-lg border border-neutral-200 h-24 flex items-center justify-center overflow-hidden relative">
            <span
              style={{
                fontSize: `${config.fontSize * 0.4}px`,
                color: config.color,
                opacity: config.opacity,
                transform: `rotate(${config.rotation}deg)`,
              }}
              className="font-bold tracking-widest uppercase select-none pointer-events-none"
            >
              {config.text || 'PREVIEW'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-3.5 bg-neutral-50 border-t border-neutral-200">
          <button
            onClick={handleRemove}
            className="text-xs text-rose-600 hover:text-rose-700 font-medium"
          >
            Remover Marca d'Água
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
              Aplicar ao Documento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
