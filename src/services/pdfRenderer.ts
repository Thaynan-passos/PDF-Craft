import * as pdfjsLib from 'pdfjs-dist';
import { PageInfo } from '../types/pdf';

// Configure worker safely with local URL fallback
try {
  if (typeof window !== 'undefined') {
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url
      ).toString();
    } catch {
      const version = pdfjsLib.version || '4.0.379';
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
    }
  }
} catch (e) {
  console.warn('Aviso de inicialização do worker PDF.js:', e);
}

export interface RenderResult {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
}

export class PdfRendererService {
  private static pdfDocCache = new Map<string, pdfjsLib.PDFDocumentProxy>();
  private static activeRenderTasks = new WeakMap<HTMLCanvasElement, { cancel: () => void }>();

  /**
   * Loads a PDF document from Uint8Array
   */
  public static async loadDocument(data: Uint8Array): Promise<pdfjsLib.PDFDocumentProxy> {
    const loadingTask = pdfjsLib.getDocument({
      data: data.slice(0),
      cMapUrl: 'https://unpkg.com/pdfjs-dist@4.0.379/cmaps/',
      cMapPacked: true,
      standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@4.0.379/standard_fonts/',
    });
    return await loadingTask.promise;
  }

  /**
   * Extract basic page info for all pages
   */
  public static async getPagesInfo(pdfDoc: pdfjsLib.PDFDocumentProxy): Promise<PageInfo[]> {
    const pages: PageInfo[] = [];
    const numPages = pdfDoc.numPages;

    for (let i = 1; i <= numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale: 1 });
      pages.push({
        pageNumber: i,
        pageIndex: i - 1,
        width: viewport.width,
        height: viewport.height,
        rotation: page.rotate,
      });
    }

    return pages;
  }

  /**
   * Renders a specific page to an HTML5 canvas at given scale
   */
  public static async renderPageToCanvas(
    pdfDoc: pdfjsLib.PDFDocumentProxy,
    pageIndex: number,
    canvas: HTMLCanvasElement,
    scale: number = 1.5,
    userRotation: number = 0
  ): Promise<{ width: number; height: number }> {
    // Cancel any ongoing render task on this canvas
    const ongoingTask = this.activeRenderTasks.get(canvas);
    if (ongoingTask) {
      try {
        ongoingTask.cancel();
      } catch {
        // Ignored if already completed
      }
      this.activeRenderTasks.delete(canvas);
    }

    const pageNumber = pageIndex + 1;
    const page = await pdfDoc.getPage(pageNumber);

    // userRotation represents the exact absolute rotation desired for the page
    const totalRotation = userRotation % 360;
    const viewport = page.getViewport({ scale, rotation: totalRotation });

    // Ensure crisp rendering on HiDPI displays
    const outputScale = window.devicePixelRatio || 1;
    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);
    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) {
      throw new Error('Canvas 2D context could not be created');
    }

    ctx.save();
    ctx.scale(outputScale, outputScale);

    const renderContext = {
      canvasContext: ctx,
      canvas: canvas,
      viewport: viewport,
      enableWebGL: false,
    };

    const renderTask = page.render(renderContext);
    this.activeRenderTasks.set(canvas, renderTask);

    try {
      // Wait for render task to complete
      await renderTask.promise;
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'name' in err && err.name === 'RenderingCancelledException') {
        // Cancelamento esperado ao mudar zoom ou página rapidamente
        return { width: viewport.width, height: viewport.height };
      }
      throw err;
    } finally {
      ctx.restore();
      if (this.activeRenderTasks.get(canvas) === renderTask) {
        this.activeRenderTasks.delete(canvas);
      }
    }

    return {
      width: viewport.width,
      height: viewport.height,
    };
  }

  /**
   * Generates a thumbnail image data URL for a page
   */
  public static async renderThumbnail(
    pdfDoc: pdfjsLib.PDFDocumentProxy,
    pageIndex: number,
    targetWidth: number = 150
  ): Promise<string> {
    const page = await pdfDoc.getPage(pageIndex + 1);
    const unscaledViewport = page.getViewport({ scale: 1 });
    const scale = targetWidth / unscaledViewport.width;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    await page.render({
      canvasContext: ctx,
      canvas: canvas,
      viewport,
    }).promise;

    return canvas.toDataURL('image/jpeg', 0.8);
  }
}
