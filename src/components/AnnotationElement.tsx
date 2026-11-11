import React, { useState, useRef, useEffect } from 'react';
import { Annotation } from '../types/pdf';
import { MessageSquare, Trash2, Move } from 'lucide-react';

interface AnnotationElementProps {
  annotation: Annotation;
  isSelected: boolean;
  scale: number;
  onSelect: () => void;
  onUpdate: (updated: Partial<Annotation>) => void;
  onDelete: () => void;
}

export const AnnotationElement: React.FC<AnnotationElementProps> = ({
  annotation,
  isSelected,
  scale,
  onSelect,
  onUpdate,
  onDelete,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeCorner, setResizeCorner] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, origX: 0, origY: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, origW: 0, origH: 0, origX: 0, origY: 0 });
  const [isEditingText, setIsEditingText] = useState(false);

  // Scaled dimensions
  const x = annotation.x * scale;
  const y = annotation.y * scale;
  const width = annotation.width * scale;
  const height = annotation.height * scale;

  // Handle Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();

    if (isEditingText) return;

    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      origX: annotation.x,
      origY: annotation.y,
    });
  };

  // Handle Resizing
  const handleResizeStart = (corner: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeCorner(corner);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      origW: annotation.width,
      origH: annotation.height,
      origX: annotation.x,
      origY: annotation.y,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const dx = (e.clientX - dragStart.x) / scale;
        const dy = (e.clientY - dragStart.y) / scale;
        onUpdate({
          x: Math.max(0, dragStart.origX + dx),
          y: Math.max(0, dragStart.origY + dy),
        });
      } else if (isResizing && resizeCorner) {
        const dx = (e.clientX - resizeStart.x) / scale;
        const dy = (e.clientY - resizeStart.y) / scale;

        let newW = resizeStart.origW;
        let newH = resizeStart.origH;
        let newX = resizeStart.origX;
        let newY = resizeStart.origY;

        if (resizeCorner === 'se') {
          newW = Math.max(20, resizeStart.origW + dx);
          newH = Math.max(20, resizeStart.origH + dy);
        } else if (resizeCorner === 'sw') {
          newW = Math.max(20, resizeStart.origW - dx);
          newH = Math.max(20, resizeStart.origH + dy);
          newX = resizeStart.origX + (resizeStart.origW - newW);
        } else if (resizeCorner === 'ne') {
          newW = Math.max(20, resizeStart.origW + dx);
          newH = Math.max(20, resizeStart.origH - dy);
          newY = resizeStart.origY + (resizeStart.origH - newH);
        } else if (resizeCorner === 'nw') {
          newW = Math.max(20, resizeStart.origW - dx);
          newH = Math.max(20, resizeStart.origH - dy);
          newX = resizeStart.origX + (resizeStart.origW - newW);
          newY = resizeStart.origY + (resizeStart.origH - newH);
        }

        onUpdate({
          x: newX,
          y: newY,
          width: newW,
          height: newH,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeCorner(null);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, resizeCorner, dragStart, resizeStart, scale, onUpdate]);

  // Render Inner Content
  const renderContent = () => {
    switch (annotation.type) {
      case 'text':
        return (
          <div
            className="w-full h-full p-1 select-none flex items-center"
            style={{
              backgroundColor: annotation.backgroundColor || 'transparent',
              textAlign: annotation.textAlign || 'left',
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              setIsEditingText(true);
            }}
          >
            {isEditingText ? (
              <textarea
                autoFocus
                defaultValue={annotation.text}
                onBlur={(e) => {
                  setIsEditingText(false);
                  onUpdate({ text: e.target.value });
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setIsEditingText(false);
                }}
                className="w-full h-full bg-white border border-indigo-500 rounded p-1 resize-none focus:outline-hidden"
                style={{
                  fontSize: `${(annotation.fontSize || 14) * scale}px`,
                  color: annotation.color || '#000000',
                  fontWeight: annotation.bold ? 'bold' : 'normal',
                  fontStyle: annotation.italic ? 'italic' : 'normal',
                  textDecoration: annotation.underline ? 'underline' : 'none',
                }}
              />
            ) : (
              <div
                className="w-full whitespace-pre-wrap break-words leading-tight"
                style={{
                  fontSize: `${(annotation.fontSize || 14) * scale}px`,
                  color: annotation.color || '#000000',
                  fontWeight: annotation.bold ? 'bold' : 'normal',
                  fontStyle: annotation.italic ? 'italic' : 'normal',
                  textDecoration: annotation.underline ? 'underline' : 'none',
                }}
              >
                {annotation.text || 'Clique 2x para editar texto'}
              </div>
            )}
          </div>
        );

      case 'redact':
        return (
          <div
            className="w-full h-full flex items-center justify-center relative cursor-move select-none"
            style={{ backgroundColor: annotation.color || '#000000' }}
          >
            {isSelected && (
              <span className="text-[10px] text-white/90 font-mono tracking-wider bg-black/60 px-1 py-0.5 rounded">
                CENSURA
              </span>
            )}
          </div>
        );

      case 'rectangle':
        return (
          <div
            className="w-full h-full box-border rounded-xs"
            style={{
              border: `${(annotation.strokeWidth || 2) * scale}px solid ${annotation.strokeColor || '#2563eb'}`,
              backgroundColor: annotation.fillColor && annotation.fillColor !== 'transparent' ? annotation.fillColor : 'transparent',
              opacity: annotation.opacity ?? 1,
            }}
          />
        );

      case 'circle':
        return (
          <div
            className="w-full h-full rounded-full box-border"
            style={{
              border: `${(annotation.strokeWidth || 2) * scale}px solid ${annotation.strokeColor || '#2563eb'}`,
              backgroundColor: annotation.fillColor && annotation.fillColor !== 'transparent' ? annotation.fillColor : 'transparent',
              opacity: annotation.opacity ?? 1,
            }}
          />
        );

      case 'line':
      case 'arrow':
        return (
          <svg className="w-full h-full overflow-visible pointer-events-none">
            {annotation.type === 'line' ? (
              <line
                x1={0}
                y1={0}
                x2={width}
                y2={height}
                stroke={annotation.strokeColor || '#2563eb'}
                strokeWidth={(annotation.strokeWidth || 2) * scale}
              />
            ) : (
              <g>
                <defs>
                  <marker
                    id={`arrowhead-${annotation.id}`}
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3.5, 0 7"
                      fill={annotation.strokeColor || '#2563eb'}
                    />
                  </marker>
                </defs>
                <line
                  x1={0}
                  y1={0}
                  x2={width}
                  y2={height}
                  stroke={annotation.strokeColor || '#2563eb'}
                  strokeWidth={(annotation.strokeWidth || 2) * scale}
                  markerEnd={`url(#arrowhead-${annotation.id})`}
                />
              </g>
            )}
          </svg>
        );

      case 'signature':
      case 'image':
        return (
          <img
            src={annotation.dataUrl}
            alt="Elemento"
            className="w-full h-full object-contain pointer-events-none select-none"
            draggable={false}
          />
        );

      case 'stamp':
        return (
          <div
            className="w-full h-full border-2 border-dashed rounded-lg p-2 flex flex-col items-center justify-center select-none"
            style={{
              borderColor: annotation.color || '#dc2626',
              backgroundColor: `${annotation.color || '#dc2626'}12`,
              color: annotation.color || '#dc2626',
            }}
          >
            <div
              className="font-black tracking-wider uppercase border-2 rounded px-2 py-0.5"
              style={{
                borderColor: annotation.color,
                fontSize: `${Math.max(10, height * 0.28)}px`,
              }}
            >
              {annotation.label}
            </div>
            {annotation.subText && (
              <span
                className="mt-1 font-semibold truncate"
                style={{ fontSize: `${Math.max(8, height * 0.14)}px` }}
              >
                {annotation.subText}
              </span>
            )}
          </div>
        );

      case 'note':
        return (
          <div
            className="w-full h-full rounded shadow-md p-2 flex flex-col justify-between text-neutral-800"
            style={{ backgroundColor: annotation.color || '#fef08a' }}
          >
            <div className="flex items-center justify-between border-b border-black/10 pb-1 mb-1">
              <span className="text-[10px] font-bold flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                Nota
              </span>
            </div>
            <textarea
              defaultValue={annotation.text}
              onBlur={(e) => onUpdate({ text: e.target.value })}
              className="w-full h-full bg-transparent resize-none focus:outline-hidden text-xs leading-relaxed"
              placeholder="Digite seu comentário..."
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
      }}
      className={`absolute group cursor-move ${
        isSelected
          ? 'ring-2 ring-indigo-500 ring-offset-1 z-30'
          : 'hover:ring-1 hover:ring-indigo-300 z-20'
      }`}
    >
      {renderContent()}

      {/* Selection handles and controls */}
      {isSelected && (
        <>
          {/* NW */}
          <div
            onMouseDown={(e) => handleResizeStart('nw', e)}
            className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-indigo-600 rounded-full cursor-nwse-resize z-40"
          />
          {/* NE */}
          <div
            onMouseDown={(e) => handleResizeStart('ne', e)}
            className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-indigo-600 rounded-full cursor-nesw-resize z-40"
          />
          {/* SW */}
          <div
            onMouseDown={(e) => handleResizeStart('sw', e)}
            className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-indigo-600 rounded-full cursor-nesw-resize z-40"
          />
          {/* SE */}
          <div
            onMouseDown={(e) => handleResizeStart('se', e)}
            className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-indigo-600 rounded-full cursor-nwse-resize z-40"
          />

          {/* Quick delete floating button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Excluir elemento"
            className="absolute -top-8 right-0 p-1 bg-rose-600 text-white rounded-md shadow-md hover:bg-rose-700 transition-colors z-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </>
      )}
    </div>
  );
};
