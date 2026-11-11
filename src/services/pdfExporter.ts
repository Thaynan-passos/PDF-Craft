import {
  PDFDocument,
  rgb,
  StandardFonts,
  degrees,
  PDFPage,
} from 'pdf-lib';
import {
  Annotation,
  PageInfo,
  WatermarkConfig,
  PageNumberConfig,
} from '../types/pdf';

// Convert hex color (#RRGGBB) to pdf-lib rgb(r, g, b)
export function hexToRgb(hex: string) {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) return rgb(0, 0, 0);
  const r = ((num >> 16) & 255) / 255;
  const g = ((num >> 8) & 255) / 255;
  const b = (num & 255) / 255;
  return rgb(r, g, b);
}

export class PdfExporterService {
  /**
   * Exports an edited PDF with all annotations, watermarks, numbering, and page modifications
   */
  public static async exportPdf(
    sourcePdfBytes: Uint8Array,
    pagesInfo: PageInfo[],
    annotations: Annotation[],
    watermark: WatermarkConfig,
    pageNumbers: PageNumberConfig
  ): Promise<Uint8Array> {
    // 1. Load source document
    const pdfDoc = await PDFDocument.load(sourcePdfBytes);
    const standardFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const standardBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // 2. Apply page rotations
    const pdfPages = pdfDoc.getPages();
    pagesInfo.forEach((pageMeta, idx) => {
      if (idx < pdfPages.length) {
        const page = pdfPages[idx];
        if (pageMeta.rotation !== 0) {
          const currentRotation = page.getRotation().angle;
          page.setRotation(degrees((currentRotation + pageMeta.rotation) % 360));
        }
      }
    });

    // 3. Render annotations per page
    for (let pageIdx = 0; pageIdx < pdfPages.length; pageIdx++) {
      const page = pdfPages[pageIdx];
      const pageHeight = page.getHeight();
      const pageWidth = page.getWidth();

      // Find annotations belonging to this page
      const pageAnnotations = annotations.filter((a) => a.pageIndex === pageIdx);

      for (const ann of pageAnnotations) {
        // Convert top-left coordinates to PDF bottom-left coordinates
        const pdfX = ann.x;
        const pdfY = pageHeight - ann.y - ann.height;

        switch (ann.type) {
          case 'text': {
            const font = ann.bold ? standardBold : standardFont;
            const textColor = hexToRgb(ann.color || '#000000');
            const lines = (ann.text || '').split('\n');
            const fontSize = ann.fontSize || 14;
            const lineHeight = fontSize * 1.25;

            // Optional background box
            if (ann.backgroundColor && ann.backgroundColor !== 'transparent') {
              page.drawRectangle({
                x: pdfX,
                y: pdfY,
                width: ann.width,
                height: ann.height,
                color: hexToRgb(ann.backgroundColor),
                opacity: 0.85,
              });
            }

            lines.forEach((line, lineIdx) => {
              const lineY = pageHeight - ann.y - (lineIdx + 1) * lineHeight;
              page.drawText(line, {
                x: pdfX + 4,
                y: lineY,
                size: fontSize,
                font,
                color: textColor,
              });
            });
            break;
          }

          case 'redact': {
            // Draw solid opaque rectangle
            page.drawRectangle({
              x: pdfX,
              y: pdfY,
              width: ann.width,
              height: ann.height,
              color: hexToRgb(ann.color || '#000000'),
              opacity: 1,
            });
            break;
          }

          case 'rectangle': {
            const strokeColor = hexToRgb(ann.strokeColor || '#2563eb');
            const hasFill = ann.fillColor && ann.fillColor !== 'transparent';
            page.drawRectangle({
              x: pdfX,
              y: pdfY,
              width: ann.width,
              height: ann.height,
              borderColor: strokeColor,
              borderWidth: ann.strokeWidth || 2,
              color: hasFill ? hexToRgb(ann.fillColor!) : undefined,
              opacity: ann.opacity ?? 1,
            });
            break;
          }

          case 'circle': {
            const strokeColor = hexToRgb(ann.strokeColor || '#2563eb');
            const xRadius = ann.width / 2;
            const yRadius = ann.height / 2;
            const centerX = pdfX + xRadius;
            const centerY = pdfY + yRadius;
            const hasFill = ann.fillColor && ann.fillColor !== 'transparent';

            page.drawEllipse({
              x: centerX,
              y: centerY,
              xScale: xRadius,
              yScale: yRadius,
              borderColor: strokeColor,
              borderWidth: ann.strokeWidth || 2,
              color: hasFill ? hexToRgb(ann.fillColor!) : undefined,
              opacity: ann.opacity ?? 1,
            });
            break;
          }

          case 'line':
          case 'arrow': {
            if (ann.points && ann.points.length >= 2) {
              const start = ann.points[0];
              const end = ann.points[1];
              const startX = start.x;
              const startY = pageHeight - start.y;
              const endX = end.x;
              const endY = pageHeight - end.y;
              const color = hexToRgb(ann.strokeColor || '#2563eb');

              page.drawLine({
                start: { x: startX, y: startY },
                end: { x: endX, y: endY },
                thickness: ann.strokeWidth || 2,
                color,
              });

              // Arrowhead
              if (ann.type === 'arrow') {
                const angle = Math.atan2(endY - startY, endX - startX);
                const headLen = 12;
                page.drawLine({
                  start: { x: endX, y: endY },
                  end: {
                    x: endX - headLen * Math.cos(angle - Math.PI / 6),
                    y: endY - headLen * Math.sin(angle - Math.PI / 6),
                  },
                  thickness: ann.strokeWidth || 2,
                  color,
                });
                page.drawLine({
                  start: { x: endX, y: endY },
                  end: {
                    x: endX - headLen * Math.cos(angle + Math.PI / 6),
                    y: endY - headLen * Math.sin(angle + Math.PI / 6),
                  },
                  thickness: ann.strokeWidth || 2,
                  color,
                });
              }
            }
            break;
          }

          case 'draw':
          case 'highlight': {
            if (ann.points && ann.points.length > 1) {
              const color = hexToRgb(ann.color || '#eab308');
              const opacity = ann.type === 'highlight' ? 0.35 : (ann.opacity ?? 1);
              const thickness = ann.strokeWidth || (ann.type === 'highlight' ? 14 : 2);

              for (let i = 0; i < ann.points.length - 1; i++) {
                const p1 = ann.points[i];
                const p2 = ann.points[i + 1];
                page.drawLine({
                  start: { x: p1.x, y: pageHeight - p1.y },
                  end: { x: p2.x, y: pageHeight - p2.y },
                  thickness,
                  color,
                  opacity,
                });
              }
            }
            break;
          }

          case 'signature':
          case 'image': {
            try {
              if (ann.dataUrl && ann.dataUrl.startsWith('data:image/')) {
                const base64Data = ann.dataUrl.split(',')[1];
                const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

                const isPng = ann.dataUrl.startsWith('data:image/png');
                const embeddedImage = isPng
                  ? await pdfDoc.embedPng(imageBytes)
                  : await pdfDoc.embedJpg(imageBytes);

                page.drawImage(embeddedImage, {
                  x: pdfX,
                  y: pdfY,
                  width: ann.width,
                  height: ann.height,
                  opacity: ann.opacity ?? 1,
                });
              }
            } catch (err) {
              console.warn('Could not embed image/signature in PDF export:', err);
            }
            break;
          }

          case 'stamp': {
            // High-impact official stamp box with double borders and bold uppercase text
            const stampColor = hexToRgb(ann.color || '#dc2626');
            page.drawRectangle({
              x: pdfX,
              y: pdfY,
              width: ann.width,
              height: ann.height,
              borderColor: stampColor,
              borderWidth: 2.5,
              opacity: 0.9,
            });

            // Inner border
            page.drawRectangle({
              x: pdfX + 3,
              y: pdfY + 3,
              width: ann.width - 6,
              height: ann.height - 6,
              borderColor: stampColor,
              borderWidth: 0.8,
              opacity: 0.7,
            });

            // Text
            const fontSize = Math.min(16, ann.height * 0.35);
            page.drawText(ann.label, {
              x: pdfX + 10,
              y: pdfY + ann.height / 2 - (ann.subText ? 2 : fontSize / 3),
              size: fontSize,
              font: standardBold,
              color: stampColor,
            });

            if (ann.subText) {
              page.drawText(ann.subText, {
                x: pdfX + 10,
                y: pdfY + 8,
                size: 7,
                font: standardFont,
                color: stampColor,
              });
            }
            break;
          }

          case 'note': {
            // Post-it note box
            const noteColor = hexToRgb(ann.color || '#fef08a');
            page.drawRectangle({
              x: pdfX,
              y: pdfY,
              width: ann.width,
              height: ann.height,
              color: noteColor,
              borderColor: rgb(0.8, 0.8, 0.5),
              borderWidth: 1,
            });

            page.drawText(ann.text || 'Nota', {
              x: pdfX + 6,
              y: pdfY + ann.height - 14,
              size: 8.5,
              font: standardFont,
              color: rgb(0.2, 0.2, 0.2),
              maxWidth: ann.width - 12,
              lineHeight: 11,
            });
            break;
          }
        }
      }

      // 4. Apply Watermark
      if (watermark.enabled && watermark.text.trim()) {
        const wmColor = hexToRgb(watermark.color || '#94a3b8');
        const centerX = pageWidth / 2;
        const centerY = pageHeight / 2;

        page.drawText(watermark.text, {
          x: centerX - (watermark.text.length * watermark.fontSize * 0.28),
          y: centerY,
          size: watermark.fontSize || 48,
          font: standardBold,
          color: wmColor,
          opacity: watermark.opacity || 0.2,
          rotate: degrees(watermark.rotation || 45),
        });
      }

      // 5. Apply Page Numbers
      if (pageNumbers.enabled) {
        if (!pageNumbers.skipFirstPage || pageIdx > 0) {
          const totalPages = pdfPages.length;
          const currentNum = pageIdx + pageNumbers.startAt;

          let numText = `${currentNum}`;
          if (pageNumbers.format === 'page_of_total') {
            numText = `Página ${currentNum} de ${totalPages}`;
          } else if (pageNumbers.format === 'fraction') {
            numText = `${currentNum} / ${totalPages}`;
          } else if (pageNumbers.format === 'prefix_number') {
            numText = `Pág. ${currentNum}`;
          }

          const numColor = hexToRgb(pageNumbers.color || '#64748b');
          const margin = 30;
          let numX = pageWidth / 2 - 30;
          let numY = margin;

          if (pageNumbers.position === 'bottom-center') {
            numX = pageWidth / 2 - (numText.length * pageNumbers.fontSize * 0.25);
            numY = margin;
          } else if (pageNumbers.position === 'bottom-right') {
            numX = pageWidth - margin - (numText.length * pageNumbers.fontSize * 0.55);
            numY = margin;
          } else if (pageNumbers.position === 'bottom-left') {
            numX = margin;
            numY = margin;
          } else if (pageNumbers.position === 'top-right') {
            numX = pageWidth - margin - (numText.length * pageNumbers.fontSize * 0.55);
            numY = pageHeight - margin;
          } else if (pageNumbers.position === 'top-center') {
            numX = pageWidth / 2 - (numText.length * pageNumbers.fontSize * 0.25);
            numY = pageHeight - margin;
          }

          page.drawText(numText, {
            x: numX,
            y: numY,
            size: pageNumbers.fontSize || 10,
            font: standardFont,
            color: numColor,
          });
        }
      }
    }

    return await pdfDoc.save();
  }

  /**
   * Triggers browser download of a PDF buffer
   */
  public static downloadBlob(pdfBytes: Uint8Array, fileName: string) {
    const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
