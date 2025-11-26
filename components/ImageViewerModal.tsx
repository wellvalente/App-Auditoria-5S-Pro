import React from 'react';
import { X } from 'lucide-react';

interface ImageViewerModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

const ImageViewerModal: React.FC<ImageViewerModalProps> = ({ imageUrl, onClose }) => {
    if (!imageUrl) return null;
    return (
        <div className="fixed inset-0 z-[70] bg-black bg-opacity-90 flex flex-col items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="relative max-w-full max-h-full">
                <img src={imageUrl} alt="Evidência" className="max-w-full max-h-[80vh] object-contain rounded-lg" />
                <button onClick={onClose} className="absolute -top-10 right-0 text-white font-bold p-2">
                    <X size={24} />
                </button>
            </div>
            <p className="text-white text-sm mt-4">Toque em qualquer lugar para fechar</p>
        </div>
    );
};

export default ImageViewerModal;