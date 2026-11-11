import React, { useRef, useEffect, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import {
  PageInfo,
  Annotation,
  ToolType,
  WatermarkConfig,
  PageNumberConfig,
  Point,
} from '../types/pdf';
import { PdfRendererService } from '../services/pdfRenderer';
import { AnnotationElement } from './AnnotationElement';

interface CanvasViewportProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy | null;
  pages: PageInfo[];
  currentPageIndex: number;
  annotations: Annotation[];
  activeTool: ToolType;
  zoom: number;
  watermark: WatermarkConfig;
  pageNumbers: PageNumberConfig;
  selectedAnnotationId: string | null;
  onSelectAnnotation: (id: string | null) => void;
  onAddAnnotation: (annotation: Annotation) => void;
  onUpdateAnnotation: (id: string, updated: Partial<Annotation>, commit?: boolean) => void;
  onDeleteAnnotation: (id: string) => void;
  onPageVisible: (pageIndex: number) => void;
}

export const CanvasViewport: React.FC<CanvasViewportProps> = ({
  pdfDoc,
  pages,
  currentPageIndex,
  annotations,
  activeTool,
  zoom,
  watermark,
  pageNumbers,
  selectedAnnotationId,
  onSelectAnnotation,
  onAddAnnotation,
  onUpdateAnnotation,
  onDeleteAnnotation,
  onPageVisible,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pageCanvasRefs = useRef<{ [pageIndex: number]: HTMLCanvasElement | null }>({});
  const pageContainerRefs = useRef<{ [pageIndex: number]: HTMLDivElement | null }>({});

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [drawingPageIndex, setDrawingPageIndex] = useState<number | null>(null);
  const [dragShapeStart, setDragShapeStart] = useState<Point | null>(null);
  const [dragShapeCurrent, setDragShapeCurrent] = useState<Point | null>(null);

  // Render pages when pdfDoc, pages, or zoom changes
  useEffect(() => {
    if (!pdfDoc) return;

    let isCancelled = false;

    pages.forEach(async (pageInfo, idx) => {
      const canvas = pageCanvasRefs.current[idx];
      if (!canvas || isCancelled) return;

      try {
        await PdfRendererService.renderPageToCanvas(
          pdfDoc,
          idx,
          canvas,
          zoom * 1.5, // Render at 1.5x of zoom for ultra-sharpness
          pageInfo.rotation
        );
      } catch (err) {
        if (!isCancelled) {
          console.error(`Erro ao renderizar página ${idx + 1}:`, err);
        }
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [pdfDoc, pages, zoom]);

  // Scroll to current page when currentPageIndex changes externally
  useEffect(() => {
    const el = pageContainerRefs.current[currentPageIndex];
    if (el && containerRef.current) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentPageIndex]);

  // Get mouse coords relative to page
  const getPageCoords = (e: React.MouseEvent, pageIdx: number): Point => {
    const pageEl = pageContainerRefs.current[pageIdx];
    if (!pageEl) return { x: 0, y: 0 };
    const rect = pageEl.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    return { x, y };
  };

  // Handle Mouse Down on Page
  const handlePageMouseDown = (e: React.MouseEvent, pageIdx: number) => {
    // If clicking on page background, deselect
    if (activeTool === 'select') {
      onSelectAnnotation(null);
      return;
    }

    const { x, y } = getPageCoords(e, pageIdx);

    // Text tool: click to create text box
    if (activeTool === 'text') {
      const newAnn: Annotation = {
        id: `ann-${Date.now()}`,
        pageIndex: pageIdx,
        type: 'text',
        x,
        y,
        width: 180,
        height: 40,
        text: 'Novo texto aqui',
        fontSize: 14,
        fontFamily: 'Helvetica',
        color: '#0f172a',
        bold: false,
        italic: false,
      };
      onAddAnnotation(newAnn);
      onSelectAnnotation(newAnn.id);
      return;
    }

    // Sticky note tool
    if (activeTool === 'note') {
      const newAnn: Annotation = {
        id: `ann-${Date.now()}`,
        pageIndex: pageIdx,
        type: 'note',
        x,
        y,
        width: 140,
        height: 110,
        text: 'Escreva um comentário...',
        color: '#fef08a',
      };
      onAddAnnotation(newAnn);
      onSelectAnnotation(newAnn.id);
      return;
    }

    // Pen or Highlighter
    if (activeTool === 'draw' || activeTool === 'highlight') {
      setIsDrawing(true);
      setDrawingPageIndex(pageIdx);
      setCurrentPoints([{ x, y }]);
      return;
    }

    // Shapes or Redact
    if (['rectangle', 'circle', 'line', 'arrow', 'redact'].includes(activeTool)) {
      setIsDrawing(true);
      setDrawingPageIndex(pageIdx);
      setDragShapeStart({ x, y });
      setDragShapeCurrent({ x, y });
      return;
    }
  };

  // Handle Mouse Move
  const handlePageMouseMove = (e: React.MouseEvent, pageIdx: number) => {
    if (!isDrawing || drawingPageIndex !== pageIdx) return;
    const { x, y } = getPageCoords(e, pageIdx);

    if (activeTool === 'draw' || activeTool === 'highlight') {
      setCurrentPoints((prev) => [...prev, { x, y }]);
    } else if (dragShapeStart) {
      setDragShapeCurrent({ x, y });
    }
  };

  // Handle Mouse Up
  const handlePageMouseUp = (e: React.MouseEvent, pageIdx: number) => {
    if (!isDrawing || drawingPageIndex !== pageIdx) return;

    if (activeTool === 'draw' || activeTool === 'highlight') {
      if (currentPoints.length > 1) {
        const isHighlight = activeTool === 'highlight';
        const newAnn: Annotation = {
          id: `ann-${Date.now()}`,
          pageIndex: pageIdx,
          type: isHighlight ? 'highlight' : 'draw',
          points: currentPoints,
          x: Math.min(...currentPoints.map((p) => p.x)),
          y: Math.min(...currentPoints.map((p) => p.y)),
          width: Math.max(...currentPoints.map((p) => p.x)) - Math.min(...currentPoints.map((p) => p.x)) || 10,
          height: Math.max(...currentPoints.map((p) => p.y)) - Math.min(...currentPoints.map((p) => p.y)) || 10,
          color: isHighlight ? '#fde047' : '#2563eb',
          strokeWidth: isHighlight ? 16 : 2.5,
          opacity: isHighlight ? 0.35 : 1,
        };
        onAddAnnotation(newAnn);
        onSelectAnnotation(newAnn.id);
      }
    } else if (dragShapeStart && dragShapeCurrent) {
      const minX = Math.min(dragShapeStart.x, dragShapeCurrent.x);
      const minY = Math.min(dragShapeStart.y, dragShapeCurrent.y);
      const w = Math.abs(dragShapeCurrent.x - dragShapeStart.x);
      const h = Math.abs(dragShapeCurrent.y - dragShapeStart.y);

      if (w > 5 || h > 5) {
        if (activeTool === 'redact') {
          const newAnn: Annotation = {
            id: `ann-${Date.now()}`,
            pageIndex: pageIdx,
            type: 'redact',
            x: minX,
            y: minY,
            width: w,
            height: h,
            color: '#000000',
          };
          onAddAnnotation(newAnn);
          onSelectAnnotation(newAnn.id);
        } else if (['rectangle', 'circle'].includes(activeTool)) {
          const newAnn: Annotation = {
            id: `ann-${Date.now()}`,
            pageIndex: pageIdx,
            type: activeTool as 'rectangle' | 'circle',
            x: minX,
            y: minY,
            width: w,
            height: h,
            strokeColor: '#2563eb',
            strokeWidth: 2,
            fillColor: 'transparent',
          };
          onAddAnnotation(newAnn);
          onSelectAnnotation(newAnn.id);
        } else if (['line', 'arrow'].includes(activeTool)) {
          const newAnn: Annotation = {
            id: `ann-${Date.now()}`,
            pageIndex: pageIdx,
            type: activeTool as 'line' | 'arrow',
            x: minX,
            y: minY,
            width: w,
            height: h,
            strokeColor: '#2563eb',
            strokeWidth: 2,
            points: [dragShapeStart, dragShapeCurrent],
          };
          onAddAnnotation(newAnn);
          onSelectAnnotation(newAnn.id);
        }
      }
    }

    setIsDrawing(false);
    setDrawingPageIndex(null);
    setCurrentPoints([]);
    setDragShapeStart(null);
    setDragShapeCurrent(null);
  };

  return (
    <main
      ref={containerRef}
      className="flex-1 h-full overflow-auto bg-neutral-200/70 p-8 flex flex-col items-center gap-8 relative select-none"
      onClick={() => onSelectAnnotation(null)}
    >
      {pages.map((pageInfo, idx) => {
        const pageWidth = pageInfo.width * zoom;
        const pageHeight = pageInfo.height * zoom;
        const pageAnnotations = annotations.filter((a) => a.pageIndex === idx);

        return (
          <div
            key={idx}
            ref={(el) => {
              pageContainerRefs.current[idx] = el;
            }}
            onMouseEnter={() => onPageVisible(idx)}
            className="relative bg-white shadow-xl rounded-xs transition-shadow duration-200 group"
            style={{
              width: `${pageWidth}px`,
              height: `${pageHeight}px`,
            }}
          >
            {/* Page number pill on hover */}
            <div className="absolute -top-6 left-0 text-[11px] font-semibold text-neutral-500 tabular-nums">
              Página {idx + 1} de {pages.length}
            </div>

            {/* Base PDF Canvas */}
            <canvas
              ref={(el) => {
                pageCanvasRefs.current[idx] = el;
              }}
              className="absolute inset-0 pointer-events-none w-full h-full"
            />

            {/* Interactive Drawing & Annotation Layer */}
            <div
              onMouseDown={(e) => handlePageMouseDown(e, idx)}
              onMouseMove={(e) => handlePageMouseMove(e, idx)}
              onMouseUp={(e) => handlePageMouseUp(e, idx)}
              className={`absolute inset-0 z-20 ${
                activeTool === 'select'
                  ? 'cursor-default'
                  : activeTool === 'draw' || activeTool === 'highlight'
                  ? 'cursor-crosshair'
                  : activeTool === 'text'
                  ? 'cursor-text'
                  : 'cursor-crosshair'
              }`}
            >
              {/* Existing Annotations on this page */}
              {pageAnnotations.map((ann) => (
                <AnnotationElement
                  key={ann.id}
                  annotation={ann}
                  isSelected={selectedAnnotationId === ann.id}
                  scale={zoom}
                  onSelect={() => onSelectAnnotation(ann.id)}
                  onUpdate={(upd, commit) => onUpdateAnnotation(ann.id, upd, commit)}
                  onDelete={() => onDeleteAnnotation(ann.id)}
                />
              ))}

              {/* Live drawing preview (Pen & Highlighter) */}
              {isDrawing && drawingPageIndex === idx && currentPoints.length > 1 && (
                <svg className="absolute inset-0 pointer-events-none w-full h-full overflow-visible z-30">
                  <polyline
                    points={currentPoints.map((p) => `${p.x * zoom},${p.y * zoom}`).join(' ')}
                    fill="none"
                    stroke={activeTool === 'highlight' ? '#fde047' : '#2563eb'}
                    strokeWidth={(activeTool === 'highlight' ? 16 : 2.5) * zoom}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={activeTool === 'highlight' ? 0.4 : 1}
                  />
                </svg>
              )}

              {/* Live shape dragging preview */}
              {isDrawing && drawingPageIndex === idx && dragShapeStart && dragShapeCurrent && (
                <svg className="absolute inset-0 pointer-events-none w-full h-full overflow-visible z-30">
                  {activeTool === 'rectangle' || activeTool === 'redact' ? (
                    <rect
                      x={Math.min(dragShapeStart.x, dragShapeCurrent.x) * zoom}
                      y={Math.min(dragShapeStart.y, dragShapeCurrent.y) * zoom}
                      width={Math.abs(dragShapeCurrent.x - dragShapeStart.x) * zoom}
                      height={Math.abs(dragShapeCurrent.y - dragShapeStart.y) * zoom}
                      fill={activeTool === 'redact' ? '#000000' : 'rgba(37, 99, 235, 0.1)'}
                      stroke={activeTool === 'redact' ? '#000000' : '#2563eb'}
                      strokeWidth={2 * zoom}
                    />
                  ) : activeTool === 'circle' ? (
                    <ellipse
                      cx={((dragShapeStart.x + dragShapeCurrent.x) / 2) * zoom}
                      cy={((dragShapeStart.y + dragShapeCurrent.y) / 2) * zoom}
                      rx={(Math.abs(dragShapeCurrent.x - dragShapeStart.x) / 2) * zoom}
                      ry={(Math.abs(dragShapeCurrent.y - dragShapeStart.y) / 2) * zoom}
                      fill="rgba(37, 99, 235, 0.1)"
                      stroke="#2563eb"
                      strokeWidth={2 * zoom}
                    />
                  ) : (
                    <line
                      x1={dragShapeStart.x * zoom}
                      y1={dragShapeStart.y * zoom}
                      x2={dragShapeCurrent.x * zoom}
                      y2={dragShapeCurrent.y * zoom}
                      stroke="#2563eb"
                      strokeWidth={2 * zoom}
                    />
                  )}
                </svg>
              )}

              {/* Watermark Overlay */}
              {watermark.enabled && watermark.text.trim() && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-10">
                  <span
                    style={{
                      fontSize: `${watermark.fontSize * zoom}px`,
                      color: watermark.color,
                      opacity: watermark.opacity,
                      transform: `rotate(${watermark.rotation}deg)`,
                    }}
                    className="font-black tracking-widest uppercase"
                  >
                    {watermark.text}
                  </span>
                </div>
              )}

              {/* Page Number Overlay */}
              {pageNumbers.enabled && (!pageNumbers.skipFirstPage || idx > 0) && (
                <div
                  className={`absolute pointer-events-none select-none z-10 text-neutral-500 font-mono ${
                    pageNumbers.position === 'bottom-center'
                      ? 'bottom-4 left-1/2 -translate-x-1/2'
                      : pageNumbers.position === 'bottom-right'
                      ? 'bottom-4 right-6'
                      : pageNumbers.position === 'bottom-left'
                      ? 'bottom-4 left-6'
                      : pageNumbers.position === 'top-right'
                      ? 'top-4 right-6'
                      : 'top-4 left-1/2 -translate-x-1/2'
                  }`}
                  style={{
                    fontSize: `${pageNumbers.fontSize * zoom}px`,
                    color: pageNumbers.color,
                  }}
                >
                  {pageNumbers.format === 'page_of_total'
                    ? `Página ${idx + pageNumbers.startAt} de ${pages.length}`
                    : pageNumbers.format === 'fraction'
                    ? `${idx + pageNumbers.startAt} / ${pages.length}`
                    : pageNumbers.format === 'prefix_number'
                    ? `Pág. ${idx + pageNumbers.startAt}`
                    : `${idx + pageNumbers.startAt}`}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </main>
  );
};
