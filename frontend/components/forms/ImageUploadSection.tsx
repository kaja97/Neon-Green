"use client";

import { Upload, X, ImageIcon } from "lucide-react";

interface ImageUploadSectionProps {
  selectedImages: File[];
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
}

export function ImageUploadSection({ 
  selectedImages, 
  onImageChange, 
  onRemoveImage 
}: ImageUploadSectionProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
        Product Images <span className="text-slate-500 text-xs font-normal">(Max 5 images)</span>
      </label>
      
      <div className="flex flex-wrap gap-4">
        {selectedImages.map((file, idx) => (
          <div key={idx} className="relative w-24 h-24 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden group">
            {file.type.startsWith('image/') ? (
              <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-8 h-8 text-slate-500" />
            )}
            <button
              type="button"
              onClick={() => onRemoveImage(idx)}
              className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        
        {selectedImages.length < 5 && (
          <label className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center gap-1 text-slate-400 hover:border-neon-gold hover:text-neon-gold transition-colors cursor-pointer bg-slate-900/50">
            <Upload className="w-5 h-5" />
            <span className="text-xs font-medium">Add</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={onImageChange}
              className="hidden"
            />
          </label>
        )}
      </div>
    </div>
  );
}
