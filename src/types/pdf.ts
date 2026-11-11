export type ToolType =
  | 'select'
  | 'text'
  | 'draw'
  | 'highlight'
  | 'eraser'
  | 'rectangle'
  | 'circle'
  | 'line'
  | 'arrow'
  | 'redact'
  | 'signature'
  | 'stamp'
  | 'image'
  | 'note';

export interface Point {
  x: number;
  y: number;
}

export type StampType =
  | 'APROVADO'
  | 'REJEITADO'
  | 'CONFIDENCIAL'
  | 'PAGO'
  | 'URGENTE'
  | 'RASCUNHO'
  | 'REVISADO'
  | 'CUSTOM';

export interface BaseAnnotation {
  id: string;
  pageIndex: number;
  type: ToolType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  opacity?: number;
}

export interface TextAnnotation extends BaseAnnotation {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  backgroundColor?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  textAlign?: 'left' | 'center' | 'right';
}

export interface DrawAnnotation extends BaseAnnotation {
  type: 'draw' | 'highlight';
  points: Point[];
  color: string;
  strokeWidth: number;
}

export interface ShapeAnnotation extends BaseAnnotation {
  type: 'rectangle' | 'circle' | 'line' | 'arrow';
  strokeColor: string;
  fillColor?: string;
  strokeWidth: number;
  points?: Point[]; // For line and arrow: [start, end]
}

export interface RedactAnnotation extends BaseAnnotation {
  type: 'redact';
  color: string; // usually #000000 or #FFFFFF
}

export interface SignatureAnnotation extends BaseAnnotation {
  type: 'signature';
  dataUrl: string; // PNG data URL
  signerName?: string;
  date?: string;
}

export interface StampAnnotation extends BaseAnnotation {
  type: 'stamp';
  stampType: StampType;
  label: string;
  subText?: string;
  color: string;
}

export interface ImageAnnotation extends BaseAnnotation {
  type: 'image';
  dataUrl: string;
  originalWidth: number;
  originalHeight: number;
}

export interface NoteAnnotation extends BaseAnnotation {
  type: 'note';
  text: string;
  color: string; // Post-it note color: yellow, pink, blue, green
  isOpen?: boolean;
}

export type Annotation =
  | TextAnnotation
  | DrawAnnotation
  | ShapeAnnotation
  | RedactAnnotation
  | SignatureAnnotation
  | StampAnnotation
  | ImageAnnotation
  | NoteAnnotation;

export interface PageInfo {
  pageNumber: number; // 1-based
  pageIndex: number;  // 0-based
  width: number;
  height: number;
  rotation: number; // 0, 90, 180, 270
}

export interface WatermarkConfig {
  enabled: boolean;
  text: string;
  fontSize: number;
  color: string;
  opacity: number;
  rotation: number;
  applyToAll: boolean;
}

export interface PageNumberConfig {
  enabled: boolean;
  format: 'number' | 'page_of_total' | 'fraction' | 'prefix_number';
  position: 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-right' | 'top-center';
  fontSize: number;
  color: string;
  startAt: number;
  skipFirstPage: boolean;
}

export interface DocumentState {
  title: string;
  pdfBytes: Uint8Array | null;
  numPages: number;
  pages: PageInfo[];
  annotations: Annotation[];
  watermark: WatermarkConfig;
  pageNumbers: PageNumberConfig;
}
