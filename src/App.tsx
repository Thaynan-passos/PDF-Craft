/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

import {
  PageInfo,
  Annotation,
  ToolType,
  WatermarkConfig,
  PageNumberConfig,
} from './types/pdf';
import { PdfRendererService } from './services/pdfRenderer';
import { PdfExporterService } from './services/pdfExporter';
import { sampleTemplates, SampleDoc } from './services/samplePdfs';

import { TopBar } from './components/TopBar';
import { ToolRibbon } from './components/ToolRibbon';
import { Sidebar } from './components/Sidebar';
import { CanvasViewport } from './components/CanvasViewport';
import { PropertiesBar } from './components/PropertiesBar';
import { SignatureModal } from './components/SignatureModal';
import { StampPickerModal } from './components/StampPickerModal';
import { PageManagerModal } from './components/PageManagerModal';
import { WatermarkModal } from './components/WatermarkModal';
import { PageNumberModal } from './components/PageNumberModal';
import { SampleDocsModal } from './components/SampleDocsModal';

export default function App() {
  // Document State
  const [documentTitle, setDocumentTitle] = useState('Contrato_Prestacao_Servicos.pdf');
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [thumbnails, setThumbnails] = useState<{ [pageIndex: number]: string }>({});

  // Annotations & History State
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [history, setHistory] = useState<Annotation[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Tools & Selection State
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1.0);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Document Configs
  const [watermark, setWatermark] = useState<WatermarkConfig>({
    enabled: false,
    text: 'CONFIDENCIAL',
    fontSize: 48,
    color: '#94a3b8',
    opacity: 0.18,
    rotation: 45,
    applyToAll: true,
  });

  const [pageNumbers, setPageNumbers] = useState<PageNumberConfig>({
    enabled: false,
    format: 'page_of_total',
    position: 'bottom-center',
    fontSize: 10,
    color: '#64748b',
    startAt: 1,
    skipFirstPage: false,
  });

  // Modals
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isStampModalOpen, setIsStampModalOpen] = useState(false);
  const [isPageManagerModalOpen, setIsPageManagerModalOpen] = useState(false);
  const [isWatermarkModalOpen, setIsWatermarkModalOpen] = useState(false);
  const [isPageNumberModalOpen, setIsPageNumberModalOpen] = useState(false);
  const [isSampleDocsModalOpen, setIsSampleDocsModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  // Load Initial Document on startup
  useEffect(() => {
    async function initDefaultPdf() {
      try {
        setIsLoading(true);
        // Load the contract template as default
        const contractTpl = sampleTemplates[0];
        const bytes = await contractTpl.create();
        await loadPdfBuffer(bytes, 'Contrato_Prestacao_Servicos.pdf');
      } catch (err) {
        console.error('Error initializing sample PDF:', err);
      } finally {
        setIsLoading(false);
      }
    }
    initDefaultPdf();
  }, []);

  // Core loader: takes raw Uint8Array and parses with PDF.js
  const loadPdfBuffer = async (
    bytes: Uint8Array,
    title: string,
    preservedAnnotations?: Annotation[]
  ) => {
    try {
      setIsLoading(true);
      setPdfBytes(bytes);
      setDocumentTitle(title);

      const loadedDoc = await PdfRendererService.loadDocument(bytes);
      setPdfDoc(loadedDoc);

      const pagesInfo = await PdfRendererService.getPagesInfo(loadedDoc);
      setPages(pagesInfo);
      setCurrentPageIndex(0);

      // Generate thumbnails asynchronously
      const thumbs: { [pageIndex: number]: string } = {};
      for (let i = 0; i < pagesInfo.length; i++) {
        thumbs[i] = await PdfRendererService.renderThumbnail(loadedDoc, i, 160);
      }
      setThumbnails(thumbs);

      // Apply preserved annotations or reset cleanly
      const nextAnnotations = preservedAnnotations ?? [];
      setAnnotations(nextAnnotations);
      setHistory([nextAnnotations]);
      setHistoryIndex(0);
      setSelectedAnnotationId(null);
    } catch (err) {
      console.error('Falha ao carregar buffer do PDF:', err);
      alert('Não foi possível carregar o arquivo PDF. Verifique se o arquivo é válido.');
    } finally {
      setIsLoading(false);
    }
  };

  // History tracking for annotations
  const pushToHistory = (newAnnotations: Annotation[]) => {
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(newAnnotations);
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
    setAnnotations(newAnnotations);
  };

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const targetIndex = historyIndex - 1;
      setHistoryIndex(targetIndex);
      setAnnotations(history[targetIndex]);
      setSelectedAnnotationId(null);
    }
  }, [historyIndex, history]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const targetIndex = historyIndex + 1;
      setHistoryIndex(targetIndex);
      setAnnotations(history[targetIndex]);
      setSelectedAnnotationId(null);
    }
  }, [historyIndex, history]);

  // Annotation CRUD
  const handleAddAnnotation = (ann: Annotation) => {
    const updated = [...annotations, ann];
    pushToHistory(updated);
  };

  const handleUpdateAnnotation = (
    id: string,
    updatedProps: Partial<Annotation>,
    commit: boolean = true
  ) => {
    const updated = annotations.map((ann) => {
      if (ann.id === id) {
        return { ...ann, ...updatedProps } as Annotation;
      }
      return ann;
    });
    if (commit) {
      pushToHistory(updated);
    } else {
      setAnnotations(updated);
    }
  };

  const handleDeleteAnnotation = (id: string) => {
    const updated = annotations.filter((ann) => ann.id !== id);
    pushToHistory(updated);
    if (selectedAnnotationId === id) {
      setSelectedAnnotationId(null);
    }
  };

  const handleDuplicateAnnotation = () => {
    if (!selectedAnnotationId) return;
    const item = annotations.find((a) => a.id === selectedAnnotationId);
    if (!item) return;

    const cloned: Annotation = {
      ...item,
      id: `ann-${Date.now()}`,
      x: item.x + 20,
      y: item.y + 20,
    };
    const updated = [...annotations, cloned];
    pushToHistory(updated);
    setSelectedAnnotationId(cloned.id);
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedAnnotationId) {
          e.preventDefault();
          handleDeleteAnnotation(selectedAnnotationId);
        }
      } else if (e.key === 'Escape') {
        setSelectedAnnotationId(null);
        setActiveTool('select');
      } else if (e.key === 'v' || e.key === 'V') {
        setActiveTool('select');
      } else if (e.key === 't' || e.key === 'T') {
        setActiveTool('text');
      } else if (e.key === 'p' || e.key === 'P') {
        setActiveTool('draw');
      } else if (e.key === 'h' || e.key === 'H') {
        setActiveTool('highlight');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedAnnotationId, handleUndo, handleRedo, annotations]);

  // Page Operations
  const handleRotatePage = (pageIndex: number, deltaAngle: number) => {
    setPages((prevPages) =>
      prevPages.map((p, idx) => {
        if (idx === pageIndex) {
          return { ...p, rotation: (p.rotation + deltaAngle + 360) % 360 };
        }
        return p;
      })
    );
  };

  const handleReorderPages = async (fromIndex: number, toIndex: number) => {
    if (!pdfBytes) return;
    try {
      const srcDoc = await PDFDocument.load(pdfBytes);
      const newDoc = await PDFDocument.create();

      const pageIndices = pages.map((_, i) => i);
      const [moved] = pageIndices.splice(fromIndex, 1);
      pageIndices.splice(toIndex, 0, moved);

      const copiedPages = await newDoc.copyPages(srcDoc, pageIndices);
      copiedPages.forEach((p) => newDoc.addPage(p));
      const newBytes = await newDoc.save();

      // Remap annotations to new page indices
      const remappedAnnotations = annotations
        .map((ann) => {
          if (ann.pageIndex === fromIndex) {
            return { ...ann, pageIndex: toIndex };
          }
          if (fromIndex < toIndex && ann.pageIndex > fromIndex && ann.pageIndex <= toIndex) {
            return { ...ann, pageIndex: ann.pageIndex - 1 };
          }
          if (fromIndex > toIndex && ann.pageIndex >= toIndex && ann.pageIndex < fromIndex) {
            return { ...ann, pageIndex: ann.pageIndex + 1 };
          }
          return ann;
        });

      await loadPdfBuffer(newBytes, documentTitle, remappedAnnotations);
    } catch (err) {
      console.error('Falha ao reordenar páginas:', err);
    }
  };

  const handleDeletePage = async (pageIndex: number) => {
    if (!pdfBytes || pages.length <= 1) return;
    try {
      const srcDoc = await PDFDocument.load(pdfBytes);
      srcDoc.removePage(pageIndex);
      const newBytes = await srcDoc.save();

      // Filter out annotations on deleted page and shift higher ones
      const remapped = annotations
        .filter((a) => a.pageIndex !== pageIndex)
        .map((a) => {
          if (a.pageIndex > pageIndex) {
            return { ...a, pageIndex: a.pageIndex - 1 };
          }
          return a;
        });

      await loadPdfBuffer(newBytes, documentTitle, remapped);
    } catch (err) {
      console.error('Falha ao excluir página:', err);
    }
  };

  const handleDuplicatePage = async (pageIndex: number) => {
    if (!pdfBytes) return;
    try {
      const srcDoc = await PDFDocument.load(pdfBytes);
      const [copiedPage] = await srcDoc.copyPages(srcDoc, [pageIndex]);
      srcDoc.insertPage(pageIndex + 1, copiedPage);
      const newBytes = await srcDoc.save();

      // Shift annotations on pages after the inserted one
      const remapped = annotations.map((ann) => {
        if (ann.pageIndex > pageIndex) {
          return { ...ann, pageIndex: ann.pageIndex + 1 };
        }
        return ann;
      });

      await loadPdfBuffer(newBytes, documentTitle, remapped);
    } catch (err) {
      console.error('Falha ao duplicar página:', err);
    }
  };

  const handleInsertBlankPage = async (atIndex: number) => {
    if (!pdfBytes) return;
    try {
      const srcDoc = await PDFDocument.load(pdfBytes);
      srcDoc.insertPage(atIndex, [595.28, 841.89]);
      const newBytes = await srcDoc.save();

      // Shift annotations on pages at or after the inserted blank page
      const remapped = annotations.map((ann) => {
        if (ann.pageIndex >= atIndex) {
          return { ...ann, pageIndex: ann.pageIndex + 1 };
        }
        return ann;
      });

      await loadPdfBuffer(newBytes, documentTitle, remapped);
    } catch (err) {
      console.error('Falha ao inserir página em branco:', err);
    }
  };

  const handleMergePdfFile = async (file: File) => {
    if (!pdfBytes) return;
    try {
      const fileBytes = new Uint8Array(await file.arrayBuffer());
      const baseDoc = await PDFDocument.load(pdfBytes);
      const toMergeDoc = await PDFDocument.load(fileBytes);

      const copiedPages = await baseDoc.copyPages(toMergeDoc, toMergeDoc.getPageIndices());
      copiedPages.forEach((p) => baseDoc.addPage(p));

      const newBytes = await baseDoc.save();
      await loadPdfBuffer(newBytes, documentTitle, annotations);
      alert(`${copiedPages.length} páginas mescladas com sucesso ao final do documento!`);
    } catch (err) {
      console.error('Falha ao mesclar PDF:', err);
      alert('Não foi possível mesclar o arquivo PDF.');
    }
  };

  const handleExtractPage = async (pageIndex: number) => {
    if (!pdfBytes) return;
    try {
      const srcDoc = await PDFDocument.load(pdfBytes);
      const singleDoc = await PDFDocument.create();
      const [extracted] = await singleDoc.copyPages(srcDoc, [pageIndex]);
      singleDoc.addPage(extracted);
      const singleBytes = await singleDoc.save();

      PdfExporterService.downloadBlob(
        singleBytes,
        `${documentTitle.replace('.pdf', '')}_pagina_${pageIndex + 1}.pdf`
      );
    } catch (err) {
      console.error('Failed to extract page:', err);
    }
  };

  // Insert Digital Signature onto page
  const handleInsertSignature = (dataUrl: string, name?: string) => {
    const newAnn: Annotation = {
      id: `sig-${Date.now()}`,
      pageIndex: currentPageIndex,
      type: 'signature',
      x: 100,
      y: 200,
      width: 180,
      height: 70,
      dataUrl,
      signerName: name,
      date: new Date().toLocaleDateString('pt-BR'),
    };
    handleAddAnnotation(newAnn);
    setSelectedAnnotationId(newAnn.id);
    setActiveTool('select');
  };

  // Insert Stamp onto page
  const handleInsertStamp = (stamp: { stampType: any; label: string; subText?: string; color: string }) => {
    const newAnn: Annotation = {
      id: `stamp-${Date.now()}`,
      pageIndex: currentPageIndex,
      type: 'stamp',
      stampType: stamp.stampType,
      label: stamp.label,
      subText: stamp.subText,
      color: stamp.color,
      x: 120,
      y: 180,
      width: 170,
      height: 75,
    };
    handleAddAnnotation(newAnn);
    setSelectedAnnotationId(newAnn.id);
    setActiveTool('select');
  };

  // Insert Image onto page
  const handleInsertImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const aspect = img.width / img.height;
        const targetWidth = 160;
        const targetHeight = targetWidth / aspect;

        const newAnn: Annotation = {
          id: `img-${Date.now()}`,
          pageIndex: currentPageIndex,
          type: 'image',
          dataUrl,
          x: 100,
          y: 150,
          width: targetWidth,
          height: targetHeight,
          originalWidth: img.width,
          originalHeight: img.height,
        };
        handleAddAnnotation(newAnn);
        setSelectedAnnotationId(newAnn.id);
        setActiveTool('select');
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Export Full PDF
  const handleExportPdf = async () => {
    if (!pdfBytes) return;
    try {
      const exportedBytes = await PdfExporterService.exportPdf(
        pdfBytes,
        pages,
        annotations,
        watermark,
        pageNumbers
      );

      PdfExporterService.downloadBlob(exportedBytes, documentTitle);

      // Celebration confetti!
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (err) {
      console.error('Error exporting PDF:', err);
      alert('Erro ao exportar o documento. Verifique os elementos adicionados.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedAnnotation = annotations.find((a) => a.id === selectedAnnotationId) || null;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-neutral-100 font-sans">
      {/* 1. Header / TopBar */}
      <TopBar
        documentTitle={documentTitle}
        onUpdateTitle={setDocumentTitle}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        zoom={zoom}
        onZoomIn={() => setZoom((z) => Math.min(2.5, +(z + 0.15).toFixed(2)))}
        onZoomOut={() => setZoom((z) => Math.max(0.4, +(z - 0.15).toFixed(2)))}
        onResetZoom={() => setZoom(1.0)}
        onFitWidth={() => setZoom(1.25)}
        currentPage={currentPageIndex + 1}
        totalPages={pages.length}
        onExportPdf={handleExportPdf}
        onPrint={handlePrint}
        onOpenSampleModal={() => setIsSampleDocsModalOpen(true)}
        onUploadNewPdf={(file) => {
          file.arrayBuffer().then((buf) => {
            loadPdfBuffer(new Uint8Array(buf), file.name);
          });
        }}
      />

      {/* 2. Tool Ribbon */}
      <ToolRibbon
        activeTool={activeTool}
        onSelectTool={setActiveTool}
        onOpenSignatureModal={() => setIsSignatureModalOpen(true)}
        onOpenStampModal={() => setIsStampModalOpen(true)}
        onOpenPageManagerModal={() => setIsPageManagerModalOpen(true)}
        onOpenWatermarkModal={() => setIsWatermarkModalOpen(true)}
        onOpenPageNumberModal={() => setIsPageNumberModalOpen(true)}
        onInsertImageFile={handleInsertImageFile}
      />

      {/* 3. Main Workspace Area: Sidebar + Canvas */}
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar
          pages={pages}
          currentPageIndex={currentPageIndex}
          thumbnails={thumbnails}
          annotations={annotations}
          selectedAnnotationId={selectedAnnotationId}
          onSelectPage={setCurrentPageIndex}
          onRotatePage={handleRotatePage}
          onDeletePage={handleDeletePage}
          onSelectAnnotation={(id) => {
            setSelectedAnnotationId(id);
            setActiveTool('select');
          }}
          onDeleteAnnotation={handleDeleteAnnotation}
          onAddBlankPage={() => handleInsertBlankPage(pages.length)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-neutral-100">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-neutral-600">Carregando páginas do PDF...</span>
          </div>
        ) : (
          <CanvasViewport
            pdfDoc={pdfDoc}
            pages={pages}
            currentPageIndex={currentPageIndex}
            annotations={annotations}
            activeTool={activeTool}
            zoom={zoom}
            watermark={watermark}
            pageNumbers={pageNumbers}
            selectedAnnotationId={selectedAnnotationId}
            onSelectAnnotation={setSelectedAnnotationId}
            onAddAnnotation={handleAddAnnotation}
            onUpdateAnnotation={handleUpdateAnnotation}
            onDeleteAnnotation={handleDeleteAnnotation}
            onPageVisible={setCurrentPageIndex}
          />
        )}

        {/* Floating properties toolbar when element is selected */}
        <PropertiesBar
          selectedAnnotation={selectedAnnotation}
          onUpdate={(props) => {
            if (selectedAnnotationId) {
              handleUpdateAnnotation(selectedAnnotationId, props);
            }
          }}
          onDelete={() => {
            if (selectedAnnotationId) {
              handleDeleteAnnotation(selectedAnnotationId);
            }
          }}
          onDuplicate={handleDuplicateAnnotation}
        />
      </div>

      {/* Modals */}
      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onInsertSignature={handleInsertSignature}
      />

      <StampPickerModal
        isOpen={isStampModalOpen}
        onClose={() => setIsStampModalOpen(false)}
        onSelectStamp={handleInsertStamp}
      />

      <PageManagerModal
        isOpen={isPageManagerModalOpen}
        onClose={() => setIsPageManagerModalOpen(false)}
        pages={pages}
        thumbnails={thumbnails}
        onReorderPages={handleReorderPages}
        onRotatePage={handleRotatePage}
        onDeletePage={handleDeletePage}
        onDuplicatePage={handleDuplicatePage}
        onInsertBlankPage={handleInsertBlankPage}
        onMergePdfFile={handleMergePdfFile}
        onExtractPage={handleExtractPage}
      />

      <WatermarkModal
        isOpen={isWatermarkModalOpen}
        onClose={() => setIsWatermarkModalOpen(false)}
        watermark={watermark}
        onSaveWatermark={setWatermark}
      />

      <PageNumberModal
        isOpen={isPageNumberModalOpen}
        onClose={() => setIsPageNumberModalOpen(false)}
        pageNumbers={pageNumbers}
        totalPages={pages.length}
        onSavePageNumbers={setPageNumbers}
      />

      <SampleDocsModal
        isOpen={isSampleDocsModalOpen}
        onClose={() => setIsSampleDocsModalOpen(false)}
        onSelectSample={async (tpl: SampleDoc) => {
          const bytes = await tpl.create();
          await loadPdfBuffer(bytes, `${tpl.title.replace(/\s+/g, '_')}.pdf`);
        }}
        onUploadCustomPdf={(file: File) => {
          file.arrayBuffer().then((buf) => {
            loadPdfBuffer(new Uint8Array(buf), file.name);
          });
        }}
      />
    </div>
  );
}
