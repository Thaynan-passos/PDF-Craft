import React from 'react';
import { X, FileText, BarChart2, Plus, Upload, Check } from 'lucide-react';
import { sampleTemplates, SampleDoc } from '../services/samplePdfs';

interface SampleDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSample: (sample: SampleDoc) => void;
  onUploadCustomPdf: (file: File) => void;
}

export const SampleDocsModal: React.FC<SampleDocsModalProps> = ({
  isOpen,
  onClose,
  onSelectSample,
  onUploadCustomPdf,
}) => {
  if (!isOpen) return null;

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadCustomPdf(file);
      onClose();
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileText':
        return <FileText className="w-5 h-5 text-indigo-600" />;
      case 'BarChart2':
        return <BarChart2 className="w-5 h-5 text-blue-600" />;
      default:
        return <Plus className="w-5 h-5 text-emerald-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div>
            <h2 className="text-base font-semibold text-neutral-900">Modelos Prontos & Novo Documento</h2>
            <p className="text-xs text-neutral-500">
              Escolha um modelo de demonstração ou carregue seu próprio arquivo PDF
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {sampleTemplates.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => {
                  onSelectSample(tpl);
                  onClose();
                }}
                className="group flex flex-col p-4 rounded-xl border border-neutral-200 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all text-left shadow-2xs hover:shadow-xs"
              >
                <div className="w-9 h-9 rounded-lg bg-neutral-100 group-hover:bg-white flex items-center justify-center mb-3 transition-colors border border-neutral-200/60">
                  {getIcon(tpl.iconName)}
                </div>
                <h3 className="text-xs font-bold text-neutral-900 group-hover:text-indigo-700 mb-1">
                  {tpl.title}
                </h3>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  {tpl.description}
                </p>
              </button>
            ))}
          </div>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-neutral-400 font-semibold tracking-wider text-[10px]">
                Ou carregue seu arquivo
              </span>
            </div>
          </div>

          {/* Upload card */}
          <label className="flex items-center justify-center gap-3 p-5 border-2 border-dashed border-neutral-300 hover:border-indigo-500 hover:bg-indigo-50/30 rounded-xl cursor-pointer transition-all">
            <Upload className="w-6 h-6 text-indigo-600" />
            <div>
              <span className="text-xs font-semibold text-neutral-800 block">
                Carregar arquivo PDF do computador
              </span>
              <span className="text-[11px] text-neutral-400">
                Arraste ou clique para selecionar qualquer PDF (.pdf)
              </span>
            </div>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileInput}
              className="hidden"
            />
          </label>
        </div>

        <div className="flex items-center justify-end px-6 py-3.5 bg-neutral-50 border-t border-neutral-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-200 rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
