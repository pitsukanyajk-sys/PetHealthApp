import React, { useRef, useState } from 'react';
import { Camera, Upload, Trash2, Image as ImageIcon, Eye } from 'lucide-react';

interface ImageProofUploaderProps {
  value?: string;
  onChange: (base64Url: string | undefined) => void;
  label?: string;
  hint?: string;
}

export function compressImageFile(file: File, maxWidth = 1000, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => resolve(reader.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export default function ImageProofUploader({
  value,
  onChange,
  label = 'แนบหลักฐาน (ภาพถ่าย/ใบเสร็จ/สติ๊กเกอร์)',
  hint = 'รองรับไฟล์รูปภาพ JPG, PNG (ระบบจะปรับย่อขนาดรูปให้อัตโนมัติ)'
}: ImageProofUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์ภาพถ่ายเท่านั้นค่ะ 📷');
      return;
    }

    setLoading(true);
    try {
      const compressed = await compressImageFile(file, 1000, 0.85);
      onChange(compressed);
    } catch (err) {
      console.error('Error reading image', err);
      alert('เกิดข้อผิดพลาดในการโหลดรูปภาพ');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    onChange(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-stone-700">
        {label}
      </label>

      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-amber-200 bg-stone-900/5 p-2 flex items-center gap-3">
          <img
            src={value}
            alt="หลักฐาน"
            className="w-16 h-16 object-cover rounded-lg border border-amber-200 shrink-0 bg-white"
          />
          <div className="flex-1 min-w-0">
            <span className="text-xs font-medium text-emerald-800 flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
              แนบไฟล์ภาพหลักฐานแล้ว
            </span>
            <p className="text-[11px] text-stone-500 truncate mt-0.5">คลิกที่ปุ่มเพื่อดูรูปเต็มหรือเปลี่ยนรูป</p>
          </div>
          <div className="flex gap-1 shrink-0">
            <button
              type="button"
              onClick={handleClear}
              className="text-stone-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition cursor-pointer"
              title="ลบหลักฐานรูปภาพ"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-amber-200 hover:border-amber-400 bg-white/80 hover:bg-amber-50/30 rounded-xl p-3 text-center cursor-pointer transition flex flex-col items-center justify-center gap-1 group"
        >
          <div className="w-8 h-8 rounded-full bg-amber-100 group-hover:bg-amber-200 flex items-center justify-center text-amber-800 transition">
            <Camera className="w-4 h-4" />
          </div>
          <p className="text-xs font-semibold text-amber-950">
            {loading ? 'กำลังประมวลผลรูปภาพ...' : 'คลิกเพื่ออัปโหลดภาพถ่ายหลักฐาน'}
          </p>
          <p className="text-[10px] text-stone-400">{hint}</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
