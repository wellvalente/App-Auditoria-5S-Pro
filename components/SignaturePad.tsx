import React, { useState, useRef, useEffect } from 'react';
import { RotateCw, Eraser, Check } from 'lucide-react';

interface SignaturePadProps {
  title: string;
  assigneeName: string;
  onSave: (dataUrl: string) => void;
  onBack?: () => void;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ title, assigneeName, onSave, onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        const rect = container.getBoundingClientRect();
        if (canvas.width !== rect.width || canvas.height !== rect.height) {
          canvas.width = rect.width;
          canvas.height = rect.height;
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#000000'; 
          }
        }
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    const timeoutId = setTimeout(updateCanvasSize, 100);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      clearTimeout(timeoutId);
    };
  }, []);

  const getCoordinates = (event: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in event && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else if ('clientX' in event) {
      clientX = (event as React.MouseEvent).clientX;
      clientY = (event as React.MouseEvent).clientY;
    } else {
      return { x: 0, y: 0 };
    }
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    setHasSignature(true);
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      setHasSignature(false);
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      onSave(canvas.toDataURL('image/png'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col animate-fade-in">
      <div className="bg-yellow-50 text-yellow-800 p-2 text-xs text-center flex items-center justify-center gap-2">
        <RotateCw size={14} /> Gire o celular para ter mais espaço
      </div>
      <header className="px-4 py-2 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <div>
          <h1 className="text-lg font-bold text-gray-800">{title}</h1>
          <p className="text-xs text-gray-500">Assinatura de: <span className="font-bold">{assigneeName}</span></p>
        </div>
        {onBack && <button onClick={onBack} className="text-gray-500 text-sm font-medium">Cancelar</button>}
      </header>
      <div className="flex-1 bg-gray-100 p-2 relative touch-none flex items-center justify-center">
        <div ref={containerRef} className="w-full h-full bg-white border-2 border-dashed border-gray-300 rounded-lg shadow-inner relative overflow-hidden">
          <canvas
            ref={canvasRef}
            className="block touch-none cursor-crosshair"
            style={{ width: '100%', height: '100%' }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
          {!hasSignature && (
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
               <span className="text-4xl font-serif italic text-gray-400">Assine Aqui</span>
             </div>
          )}
        </div>
      </div>
      <div className="p-4 border-t border-gray-200 bg-white flex gap-3">
        <button onClick={clearCanvas} className="px-4 py-3 rounded-xl border border-gray-300 text-gray-600 font-semibold flex items-center gap-2">
          <Eraser size={20} />
        </button>
        <button disabled={!hasSignature} onClick={handleSave} className={`flex-1 py-3 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all ${hasSignature ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-95' : 'bg-gray-300 cursor-not-allowed'}`}>
          <Check size={20} /> Confirmar
        </button>
      </div>
    </div>
  );
};

export default SignaturePad;