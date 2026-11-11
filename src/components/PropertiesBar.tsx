import React from 'react';
import {
  Annotation,
  TextAnnotation,
  ShapeAnnotation,
  DrawAnnotation,
  RedactAnnotation,
} from '../types/pdf';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
  Copy,
  Layers,
  Palette,
} from 'lucide-react';

interface PropertiesBarProps {
  selectedAnnotation: Annotation | null;
  onUpdate: (updated: Partial<Annotation>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

const COMMON_COLORS = [
  '#0f172a', // Black / Dark Slate
  '#2563eb', // Royal Blue
  '#dc2626', // Red
  '#16a34a', // Emerald Green
  '#ea580c', // Orange
  '#7c3aed', // Purple
  '#eab308', // Yellow
  '#ffffff', // White
];

export const PropertiesBar: React.FC<PropertiesBarProps> = ({
  selectedAnnotation,
  onUpdate,
  onDelete,
  onDuplicate,
}) => {
  if (!selectedAnnotation) return null;

  const isText = selectedAnnotation.type === 'text';
  const isShape = ['rectangle', 'circle', 'line', 'arrow'].includes(selectedAnnotation.type);
  const isDraw = ['draw', 'highlight'].includes(selectedAnnotation.type);
  const isRedact = selectedAnnotation.type === 'redact';
  const isStamp = selectedAnnotation.type === 'stamp';
  const isNote = selectedAnnotation.type === 'note';

  const textAnn = isText ? (selectedAnnotation as TextAnnotation) : null;
  const shapeAnn = isShape ? (selectedAnnotation as ShapeAnnotation) : null;
  const drawAnn = isDraw ? (selectedAnnotation as DrawAnnotation) : null;
  const redactAnn = isRedact ? (selectedAnnotation as RedactAnnotation) : null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-neutral-200 px-4 py-2 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-150">
      {/* Type badge */}
      <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider pr-2 border-r border-neutral-200">
        {selectedAnnotation.type === 'text' && 'Texto'}
        {selectedAnnotation.type === 'rectangle' && 'Retângulo'}
        {selectedAnnotation.type === 'circle' && 'Círculo'}
        {selectedAnnotation.type === 'line' && 'Linha'}
        {selectedAnnotation.type === 'arrow' && 'Seta'}
        {selectedAnnotation.type === 'draw' && 'Desenho'}
        {selectedAnnotation.type === 'highlight' && 'Marca-Texto'}
        {selectedAnnotation.type === 'redact' && 'Tarja de Censura'}
        {selectedAnnotation.type === 'signature' && 'Assinatura'}
        {selectedAnnotation.type === 'stamp' && 'Carimbo'}
        {selectedAnnotation.type === 'image' && 'Imagem'}
        {selectedAnnotation.type === 'note' && 'Nota Adesiva'}
      </div>

      {/* Text Properties */}
      {textAnn && (
        <>
          {/* Font Size */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-neutral-500 font-medium">Tam:</span>
            <select
              value={textAnn.fontSize || 14}
              onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
              className="text-xs border border-neutral-300 rounded px-1.5 py-1 bg-white"
            >
              {[10, 12, 14, 16, 18, 20, 24, 28, 32, 40].map((s) => (
                <option key={s} value={s}>
                  {s}px
                </option>
              ))}
            </select>
          </div>

          {/* Bold, Italic, Underline */}
          <div className="flex items-center border border-neutral-200 rounded p-0.5 bg-neutral-50">
            <button
              onClick={() => onUpdate({ bold: !textAnn.bold })}
              className={`p-1 rounded text-xs transition-colors ${
                textAnn.bold ? 'bg-indigo-600 text-white' : 'text-neutral-600 hover:text-neutral-900'
              }`}
              title="Negrito"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onUpdate({ italic: !textAnn.italic })}
              className={`p-1 rounded text-xs transition-colors ${
                textAnn.italic ? 'bg-indigo-600 text-white' : 'text-neutral-600 hover:text-neutral-900'
              }`}
              title="Itálico"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onUpdate({ underline: !textAnn.underline })}
              className={`p-1 rounded text-xs transition-colors ${
                textAnn.underline ? 'bg-indigo-600 text-white' : 'text-neutral-600 hover:text-neutral-900'
              }`}
              title="Sublinhado"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Alignment */}
          <div className="flex items-center border border-neutral-200 rounded p-0.5 bg-neutral-50">
            <button
              onClick={() => onUpdate({ textAlign: 'left' })}
              className={`p-1 rounded text-xs transition-colors ${
                textAnn.textAlign === 'left' || !textAnn.textAlign
                  ? 'bg-indigo-600 text-white'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onUpdate({ textAlign: 'center' })}
              className={`p-1 rounded text-xs transition-colors ${
                textAnn.textAlign === 'center' ? 'bg-indigo-600 text-white' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onUpdate({ textAlign: 'right' })}
              className={`p-1 rounded text-xs transition-colors ${
                textAnn.textAlign === 'right' ? 'bg-indigo-600 text-white' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </>
      )}

      {/* Shape Properties (Stroke Width) */}
      {(shapeAnn || drawAnn) && (
        <div className="flex items-center gap-1">
          <span className="text-xs text-neutral-500 font-medium">Linha:</span>
          <select
            value={(shapeAnn?.strokeWidth || drawAnn?.strokeWidth || 2)}
            onChange={(e) => onUpdate({ strokeWidth: Number(e.target.value) })}
            className="text-xs border border-neutral-300 rounded px-1.5 py-1 bg-white"
          >
            {[1, 2, 3, 5, 8, 12].map((w) => (
              <option key={w} value={w}>
                {w}px
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Color Swatches */}
      {(textAnn || shapeAnn || drawAnn || redactAnn) && (
        <div className="flex items-center gap-1.5 pl-1 border-l border-neutral-200">
          <span className="text-xs text-neutral-500 font-medium">Cor:</span>
          <div className="flex items-center gap-1">
            {COMMON_COLORS.map((c) => {
              const activeColor =
                textAnn?.color ||
                shapeAnn?.strokeColor ||
                drawAnn?.color ||
                redactAnn?.color;
              return (
                <button
                  key={c}
                  onClick={() => {
                    if (textAnn) onUpdate({ color: c });
                    if (shapeAnn) onUpdate({ strokeColor: c });
                    if (drawAnn) onUpdate({ color: c });
                    if (redactAnn) onUpdate({ color: c });
                  }}
                  className={`w-5 h-5 rounded-full border transition-transform ${
                    activeColor === c ? 'scale-125 border-indigo-600 ring-2 ring-indigo-200' : 'border-neutral-300'
                  }`}
                  style={{ backgroundColor: c }}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Note Color */}
      {isNote && (
        <div className="flex items-center gap-1.5 pl-1 border-l border-neutral-200">
          <span className="text-xs text-neutral-500 font-medium">Post-it:</span>
          {['#fef08a', '#fbcfe8', '#bae6fd', '#bbf7d0'].map((bg) => (
            <button
              key={bg}
              onClick={() => onUpdate({ color: bg })}
              className="w-5 h-5 rounded-full border border-neutral-300 transition-transform hover:scale-110"
              style={{ backgroundColor: bg }}
            />
          ))}
        </div>
      )}

      {/* Opacity */}
      <div className="flex items-center gap-1 pl-1 border-l border-neutral-200">
        <span className="text-xs text-neutral-500 font-medium">Opacidade:</span>
        <input
          type="range"
          min="0.2"
          max="1"
          step="0.1"
          value={selectedAnnotation.opacity ?? 1}
          onChange={(e) => onUpdate({ opacity: Number(e.target.value) })}
          className="w-16 accent-indigo-600"
        />
      </div>

      {/* Duplicate & Delete Actions */}
      <div className="flex items-center gap-1 pl-2 border-l border-neutral-200">
        <button
          onClick={onDuplicate}
          className="p-1.5 text-neutral-600 hover:text-indigo-600 hover:bg-neutral-100 rounded-md transition-colors"
          title="Duplicar elemento"
        >
          <Copy className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors"
          title="Excluir elemento (Del)"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
