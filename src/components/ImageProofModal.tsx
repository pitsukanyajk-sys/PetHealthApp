import React from 'react';
import { X, ExternalLink, Image as ImageIcon } from 'lucide-react';

interface ImageProofModalProps {
  imageUrl: string | null;
  title?: string;
  onClose: () => void;
}

export default function ImageProofModal({ imageUrl, title = 'หลักฐานภาพถ่าย', onClose }: ImageProofModalProps) {
  if (!imageUrl) return null;

  return (
    <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-[200] overflow-y-auto animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[88vh] shadow-2xl border border-stone-200 overflow-hidden flex flex-col animate-scale-up my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-stone-900 text-white px-5 py-3.5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-amber-400" />
            <h4 className="font-bold text-sm font-display">{title}</h4>
          </div>
          <div className="flex items-center gap-2">
            <a 
              href={imageUrl} 
              target="_blank" 
              rel="noreferrer"
              className="text-stone-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition text-xs flex items-center gap-1"
              title="เปิดรูปในหน้าต่างใหม่"
            >
              <ExternalLink className="w-4 h-4" />
              <span>เปิดรูปเต็ม</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="text-stone-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              title="ปิด"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Display */}
        <div className="p-4 bg-stone-950/90 flex-1 overflow-auto flex items-center justify-center min-h-[300px]">
          <img
            src={imageUrl}
            alt={title}
            className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-md border border-stone-800"
          />
        </div>

        {/* Footer */}
        <div className="bg-stone-50 px-5 py-3 border-t border-stone-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="bg-stone-800 hover:bg-stone-900 text-white text-xs px-4 py-2 rounded-xl font-medium transition cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}
