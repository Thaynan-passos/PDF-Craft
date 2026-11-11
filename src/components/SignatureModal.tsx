import React, { useRef, useState, useEffect } from 'react';
import { PenTool, Type, Image as ImageIcon, Check, RotateCcw, X, Trash2 } from 'lucide-react';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertSignature: (dataUrl: string, name?: string) => void;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  onClose,
  onInsertSignature,
}) => {
  const [activeTab, setActiveTab] = useState<'draw' | 'type' | 'upload'>('draw');

  // Drawing state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [inkColor, setInkColor] = useState('#0f172a'); // default black/dark
  const [strokeWidth, setStrokeWidth] = useState(2.5);

  // Type state
  const [typedName, setTypedName] = useState('Carlos Silva');
  const [selectedFont, setSelectedFont] = useState<'font-signature-1' | 'font-signature-2' | 'italic'>('font-signature-1');
  const [typeColor, setTypeColor] = useState('#1e3a8a'); // navy blue

  // Upload state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [removeBackground, setRemoveBackground] = useState(true);

  // Saved signatures in local state
  const [savedSignatures, setSavedSignatures] = useState<string[]>([]);

  // Initialize canvas drawing
  useEffect(() => {
    if (activeTab === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [activeTab, isOpen]);

  if (!isOpen) return null;

  // Drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.strokeStyle = inkColor;
    ctx.lineWidth = strokeWidth;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  // Convert typed text to canvas data URL
  const generateTypedSignatureDataUrl = (): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.fillStyle = typeColor;
    let fontStr = "64px 'Dancing Script', cursive";
    if (selectedFont === 'font-signature-2') {
      fontStr = "64px 'Caveat', cursive";
    } else if (selectedFont === 'italic') {
      fontStr = "italic 52px serif";
    }

    ctx.font = fontStr;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(typedName || 'Assinatura', 300, 100);

    return canvas.toDataURL('image/png');
  };

  const handleInsert = () => {
    let finalDataUrl = '';

    if (activeTab === 'draw') {
      if (!canvasRef.current || !hasDrawn) return;
      finalDataUrl = canvasRef.current.toDataURL('image/png');
    } else if (activeTab === 'type') {
      finalDataUrl = generateTypedSignatureDataUrl();
    } else if (activeTab === 'upload') {
      if (!uploadedImage) return;
      finalDataUrl = uploadedImage;
    }

    if (finalDataUrl) {
      // Add to recent saved signatures
      if (!savedSignatures.includes(finalDataUrl)) {
        setSavedSignatures((prev) => [finalDataUrl, ...prev.slice(0, 3)]);
      }
      onInsertSignature(finalDataUrl, activeTab === 'type' ? typedName : undefined);
      onClose();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (removeBackground) {
        // Simple client-side white removal
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            // If near white, make transparent
            if (r > 220 && g > 220 && b > 220) {
              data[i + 3] = 0;
            }
          }
          ctx.putImageData(imgData, 0, 0);
          setUploadedImage(canvas.toDataURL('image/png'));
        };
        img.src = dataUrl;
      } else {
        setUploadedImage(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div>
            <h2 className="text-base font-semibold text-neutral-900">Criar Assinatura Digital</h2>
            <p className="text-xs text-neutral-500">Desenhe, digite ou carregue sua rubrica ou assinatura</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-200 bg-neutral-50 px-6 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('draw')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-colors ${
              activeTab === 'draw'
                ? 'border-indigo-600 bg-white text-indigo-600 shadow-xs'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            Desenhar
          </button>
          <button
            onClick={() => setActiveTab('type')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-colors ${
              activeTab === 'type'
                ? 'border-indigo-600 bg-white text-indigo-600 shadow-xs'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            Digitar Nome
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-colors ${
              activeTab === 'upload'
                ? 'border-indigo-600 bg-white text-indigo-600 shadow-xs'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Carregar Imagem
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6">
          {activeTab === 'draw' && (
            <div className="flex flex-col gap-4">
              <div className="relative border-2 border-dashed border-neutral-300 rounded-lg bg-neutral-50/50 overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={520}
                  height={190}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-48 cursor-crosshair touch-none bg-white"
                />
                {!hasDrawn && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-neutral-400 text-xs">
                    Desenhe sua assinatura com o mouse ou caneta aqui...
                  </div>
                )}
                <div className="absolute bottom-2 left-4 right-4 border-b border-neutral-200 pointer-events-none" />
                <div className="absolute bottom-2 right-4 text-[10px] text-neutral-400 font-mono pointer-events-none">
                  X ____________________
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-neutral-500 font-medium">Cor:</span>
                  <div className="flex items-center gap-1.5">
                    {[
                      { color: '#0f172a', label: 'Preto' },
                      { color: '#1e3a8a', label: 'Azul Caneta' },
                      { color: '#1e40af', label: 'Azul Escuro' },
                    ].map((c) => (
                      <button
                        key={c.color}
                        onClick={() => setInkColor(c.color)}
                        className={`w-6 h-6 rounded-full border-2 transition-transform ${
                          inkColor === c.color ? 'scale-110 border-indigo-600 ring-2 ring-indigo-200' : 'border-white'
                        }`}
                        style={{ backgroundColor: c.color }}
                        title={c.label}
                      />
                    ))}
                  </div>

                  <span className="text-neutral-300 mx-1">|</span>

                  <span className="text-xs text-neutral-500 font-medium">Espessura:</span>
                  <div className="flex items-center gap-1">
                    {[1.5, 2.5, 4].map((width) => (
                      <button
                        key={width}
                        onClick={() => setStrokeWidth(width)}
                        className={`px-2 py-0.5 text-xs rounded border ${
                          strokeWidth === width
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold'
                            : 'border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                        }`}
                      >
                        {width === 1.5 ? 'Fino' : width === 2.5 ? 'Médio' : 'Grosso'}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={clearCanvas}
                  className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1 rounded hover:bg-rose-50 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Limpar
                </button>
              </div>
            </div>
          )}

          {activeTab === 'type' && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Digite seu nome completo ou rubrica:
                </label>
                <input
                  type="text"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder="Ex: Carlos Eduardo da Silva"
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Styles */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-neutral-600">Escolha o estilo caligráfico:</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setSelectedFont('font-signature-1')}
                    className={`p-3 border rounded-lg text-left transition-all ${
                      selectedFont === 'font-signature-1'
                        ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <span className="font-signature-1 text-2xl text-slate-800 block truncate">
                      {typedName || 'Assinatura'}
                    </span>
                    <span className="text-[10px] text-neutral-400 mt-1 block">Elegante Cursiva</span>
                  </button>

                  <button
                    onClick={() => setSelectedFont('font-signature-2')}
                    className={`p-3 border rounded-lg text-left transition-all ${
                      selectedFont === 'font-signature-2'
                        ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <span className="font-signature-2 text-2xl text-slate-800 block truncate">
                      {typedName || 'Assinatura'}
                    </span>
                    <span className="text-[10px] text-neutral-400 mt-1 block">Espontânea Caneta</span>
                  </button>

                  <button
                    onClick={() => setSelectedFont('italic')}
                    className={`p-3 border rounded-lg text-left transition-all ${
                      selectedFont === 'italic'
                        ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <span className="font-serif italic text-xl text-slate-800 block truncate">
                      {typedName || 'Assinatura'}
                    </span>
                    <span className="text-[10px] text-neutral-400 mt-1 block">Clássica Formal</span>
                  </button>
                </div>
              </div>

              {/* Color */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-neutral-500 font-medium">Cor da Tinta:</span>
                <div className="flex items-center gap-2">
                  {[
                    { color: '#0f172a', label: 'Preto Grafite' },
                    { color: '#1e3a8a', label: 'Azul Real' },
                    { color: '#0369a1', label: 'Azul Turquesa' },
                  ].map((c) => (
                    <button
                      key={c.color}
                      onClick={() => setTypeColor(c.color)}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${
                        typeColor === c.color ? 'scale-110 border-indigo-600 ring-2 ring-indigo-200' : 'border-white'
                      }`}
                      style={{ backgroundColor: c.color }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="flex flex-col gap-4">
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-neutral-300 rounded-lg cursor-pointer hover:bg-neutral-50 hover:border-indigo-400 transition-colors">
                <ImageIcon className="w-8 h-8 text-neutral-400 mb-2" />
                <span className="text-xs font-semibold text-neutral-700">Selecione uma imagem de assinatura</span>
                <span className="text-[11px] text-neutral-400 mt-0.5">Formatos suportados: PNG, JPG ou JPEG</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {uploadedImage && (
                <div className="flex flex-col gap-2 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-700">Prévia da imagem carregada:</span>
                    <label className="flex items-center gap-1.5 text-xs text-neutral-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={removeBackground}
                        onChange={(e) => setRemoveBackground(e.target.checked)}
                        className="rounded text-indigo-600"
                      />
                      Remover fundo branco
                    </label>
                  </div>
                  <div className="h-28 flex items-center justify-center bg-white border border-neutral-200 rounded p-2 checkerboard-bg">
                    <img src={uploadedImage} alt="Prévia" className="max-h-full object-contain" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-neutral-50 border-t border-neutral-200">
          <p className="text-[11px] text-neutral-500">
            A assinatura será posicionada na página ativa e poderá ser redimensionada.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleInsert}
              disabled={
                (activeTab === 'draw' && !hasDrawn) ||
                (activeTab === 'type' && !typedName.trim()) ||
                (activeTab === 'upload' && !uploadedImage)
              }
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Inserir Assinatura
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
