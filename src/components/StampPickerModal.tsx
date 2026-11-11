import React, { useState } from 'react';
import { X, Check, Award, ShieldAlert, DollarSign, Clock, FileEdit, AlertCircle } from 'lucide-react';
import { StampType } from '../types/pdf';

interface StampPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStamp: (stamp: { stampType: StampType; label: string; subText?: string; color: string }) => void;
}

const PRESET_STAMPS: {
  type: StampType;
  label: string;
  subText: string;
  color: string;
  icon: any;
}[] = [
  { type: 'APROVADO', label: 'APROVADO', subText: 'CONFORME HOMOLOGAÇÃO', color: '#16a34a', icon: Award },
  { type: 'PAGO', label: 'PAGO', subText: 'QUITAÇÃO INTEGRAL', color: '#2563eb', icon: DollarSign },
  { type: 'CONFIDENCIAL', label: 'CONFIDENCIAL', subText: 'USO INTERNO EXCLUSIVO', color: '#dc2626', icon: ShieldAlert },
  { type: 'URGENTE', label: 'URGENTE', subText: 'PRIORIDADE MÁXIMA', color: '#ea580c', icon: Clock },
  { type: 'RASCUNHO', label: 'RASCUNHO', subText: 'NÃO DEFINITIVO', color: '#475569', icon: FileEdit },
  { type: 'REVISADO', label: 'REVISADO', subText: 'AUDITORIA CONCLUÍDA', color: '#7c3aed', icon: Check },
  { type: 'REJEITADO', label: 'REJEITADO', subText: 'NÃO HOMOLOGADO', color: '#be123c', icon: AlertCircle },
];

export const StampPickerModal: React.FC<StampPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectStamp,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const [customText, setCustomText] = useState('VALIDADO');
  const [customSubText, setCustomSubText] = useState('DEPARTAMENTO FISCAL');
  const [customColor, setCustomColor] = useState('#2563eb');

  if (!isOpen) return null;

  const handleSelectPreset = (stamp: typeof PRESET_STAMPS[0]) => {
    const today = new Date().toLocaleDateString('pt-BR');
    onSelectStamp({
      stampType: stamp.type,
      label: stamp.label,
      subText: `${stamp.subText} · ${today}`,
      color: stamp.color,
    });
    onClose();
  };

  const handleCustomSubmit = () => {
    if (!customText.trim()) return;
    const today = new Date().toLocaleDateString('pt-BR');
    onSelectStamp({
      stampType: 'CUSTOM',
      label: customText.toUpperCase(),
      subText: customSubText ? `${customSubText} · ${today}` : today,
      color: customColor,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div>
            <h2 className="text-base font-semibold text-neutral-900">Carimbos do Documento</h2>
            <p className="text-xs text-neutral-500">Insira carimbos oficiais ou crie um carimbo personalizado</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-neutral-200 bg-neutral-50 px-6 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('presets')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-colors ${
              activeTab === 'presets'
                ? 'border-indigo-600 bg-white text-indigo-600 shadow-xs'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Modelos Prontos
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-colors ${
              activeTab === 'custom'
                ? 'border-indigo-600 bg-white text-indigo-600 shadow-xs'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Carimbo Personalizado
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {activeTab === 'presets' ? (
            <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
              {PRESET_STAMPS.map((stamp) => {
                const Icon = stamp.icon;
                return (
                  <button
                    key={stamp.type}
                    onClick={() => handleSelectPreset(stamp)}
                    className="group flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed transition-all hover:scale-[1.02] hover:shadow-sm"
                    style={{
                      borderColor: stamp.color,
                      backgroundColor: `${stamp.color}08`,
                    }}
                  >
                    <div
                      className="px-3 py-1.5 rounded border-2 font-bold tracking-wider text-xs flex items-center gap-1.5 mb-1"
                      style={{
                        borderColor: stamp.color,
                        color: stamp.color,
                      }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {stamp.label}
                    </div>
                    <span className="text-[10px] text-neutral-500 font-medium">
                      {stamp.subText}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Texto Principal do Carimbo:
                </label>
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Ex: AUDITADO, RECEBIDO, CONFERIDO"
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 uppercase font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Subtítulo / Departamento (Opcional):
                </label>
                <input
                  type="text"
                  value={customSubText}
                  onChange={(e) => setCustomSubText(e.target.value)}
                  placeholder="Ex: Setor Jurídico / Matriz"
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                  Cor da Tinta do Carimbo:
                </label>
                <div className="flex items-center gap-2">
                  {['#dc2626', '#2563eb', '#16a34a', '#ea580c', '#7c3aed', '#0f172a'].map((col) => (
                    <button
                      key={col}
                      onClick={() => setCustomColor(col)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        customColor === col ? 'scale-110 border-indigo-600 ring-2 ring-indigo-200' : 'border-white'
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="mt-2 p-4 bg-neutral-50 rounded-lg border border-neutral-200 flex flex-col items-center justify-center">
                <span className="text-[11px] text-neutral-400 mb-2">Prévia em tempo real:</span>
                <div
                  className="px-4 py-2 rounded border-2 font-bold tracking-wider text-sm flex flex-col items-center"
                  style={{
                    borderColor: customColor,
                    color: customColor,
                    backgroundColor: `${customColor}10`,
                  }}
                >
                  <span>{customText.toUpperCase() || 'CARIMBO'}</span>
                  <span className="text-[9px] font-normal tracking-normal mt-0.5 opacity-80">
                    {customSubText || 'DATA / ASSINATURA'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-3.5 bg-neutral-50 border-t border-neutral-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          {activeTab === 'custom' && (
            <button
              onClick={handleCustomSubmit}
              disabled={!customText.trim()}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Inserir Carimbo
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
