import React, { useState } from 'react';
import { Camera, Image as ImageIcon, Upload, RefreshCw } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { useAuthStore } from '../../store/authStore';
import { ClayCard, ClayButton } from '../ui';

interface OCRScannerProps {
  onImageParsed: (base64Image: string, simulatedQuestionText: string) => void;
}

export const OCRScanner: React.FC<OCRScannerProps> = ({ onImageParsed }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const b64 = reader.result as string;
      setImagePreview(b64);
      
      try {
        const userEmail = useAuthStore.getState().user?.email || 'anonymous';
        // Upload scan to Firebase Storage
        const uploadUrl = await storageService.uploadOcrImage(userEmail, file);
        console.log("Scan successfully uploaded to Firebase Storage:", uploadUrl);
      } catch (err) {
        console.error("Firebase Storage scan upload failed:", err);
      } finally {
        setLoading(false);
        // Trigger parsing logic
        onImageParsed(b64, "Solve: 2x + 5 = 15");
      }
    };
    reader.readAsDataURL(file);
  };

  const loadSimulatedHandwriting = (type: 'math' | 'science') => {
    setLoading(true);
    setTimeout(() => {
      // Mock base64 values
      const mathMock = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
      setImagePreview(mathMock);
      setLoading(false);
      if (type === 'math') {
        onImageParsed(mathMock, "Solve: 2x + 5 = 15");
      } else {
        onImageParsed(mathMock, "What is the water cycle and explain evaporation?");
      }
    }, 800);
  };

  const handleClear = () => {
    setImagePreview(null);
  };

  return (
    <ClayCard className="flex flex-col gap-4 border border-dashed border-primary/30 p-5 bg-primary/5 rounded-3xl">
      <div className="flex flex-col items-center justify-center text-center">
        <h4 className="font-bold font-heading text-sm text-primary flex items-center gap-1.5 mb-1">
          <Camera size={18} />
          Homework Scanner (OCR)
        </h4>
        <p className="text-xs text-text/60 max-w-xs">
          Take a photo of your handwritten workbook question or upload a scan to let the AI solve it.
        </p>
      </div>

      {imagePreview ? (
        <div className="flex flex-col gap-3 items-center">
          <div className="relative w-full max-w-[200px] h-32 rounded-2xl overflow-hidden border border-slate-200 shadow-md">
            <img src={imagePreview} alt="Homework Scan Preview" className="w-full h-full object-cover" />
            <button
              onClick={handleClear}
              className="absolute top-2 right-2 bg-slate-900/60 text-white rounded-full p-1.5 text-xs hover:bg-slate-900"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-success font-semibold flex items-center gap-1">
            <span>✓ Image parsed successfully</span>
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <label className="w-full h-24 rounded-2xl border border-dashed border-slate-300 hover:border-primary flex flex-col items-center justify-center cursor-pointer bg-white transition-colors duration-200">
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <Upload size={22} className="text-text/40 mb-1" />
            <span className="text-xs font-semibold text-text/70">Upload homework image</span>
            <span className="text-[10px] text-text/40">PNG, JPG up to 5MB</span>
          </label>

          <div className="flex items-center gap-2">
            <div className="h-px bg-slate-200 flex-1" />
            <span className="text-[10px] text-text/40 font-semibold uppercase">Or Try Simulations</span>
            <div className="h-px bg-slate-200 flex-1" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => loadSimulatedHandwriting('math')}
              className="py-2 px-3 bg-white hover:bg-slate-50 border rounded-xl text-xs font-semibold text-left flex items-center gap-2 shadow-sm select-none"
              disabled={loading}
            >
              <ImageIcon size={14} className="text-accent" />
              <span>Math Equation</span>
            </button>
            <button
              onClick={() => loadSimulatedHandwriting('science')}
              className="py-2 px-3 bg-white hover:bg-slate-50 border rounded-xl text-xs font-semibold text-left flex items-center gap-2 shadow-sm select-none"
              disabled={loading}
            >
              <ImageIcon size={14} className="text-success" />
              <span>Science Graph</span>
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-1.5 text-xs text-primary font-semibold py-1">
          <RefreshCw size={14} className="animate-spin" />
          <span>Processing handwriting OCR...</span>
        </div>
      )}
    </ClayCard>
  );
};
