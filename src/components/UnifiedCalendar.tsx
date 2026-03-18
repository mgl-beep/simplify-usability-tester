import { ExternalLink, FileText, Upload, Sparkles, X } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

export function UnifiedCalendar() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedOption, setSelectedOption] = useState<'upload' | 'scratch' | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setSelectedOption('upload');
    }
  };

  const handleSubmit = () => {
    if (selectedOption) {
      window.open('https://www.playlab.ai/project/cm5qzks0706qurr5pxgtuunjd', '_blank');
    }
  };

  return (
    <div className="bg-white rounded-[16px] border border-[#d2d2d7]/50 shadow-sm overflow-hidden h-full flex flex-col">
      <div className="p-5 border-b border-[#d2d2d7] h-[88px] flex flex-col justify-center">
        <h2 className="text-[18px] tracking-tight text-[#1d1d1f] font-semibold">Course + Syllabus Generator</h2>
        <p className="text-[16px] text-[#636366] mt-0.5">Build complete Canvas-ready courses from scratch or from an existing syllabus.</p>
      </div>

      <div className="flex-1 flex flex-col justify-between p-5">
        <div>
          <p className="text-[18px] text-[#1d1d1f] mb-3">Choose one:</p>
          
          {/* Two Clickable Options */}
          <div className="grid grid-cols-2 gap-6">
            {/* Upload Syllabus */}
            <label 
              className={`border-2 border-dashed rounded-[12px] py-8 px-4 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer ${
                selectedOption === 'upload'
                  ? 'border-[#0071e3] bg-[#0071e3]/5'
                  : 'border-[#d2d2d7] hover:border-[#0071e3] hover:bg-[#0071e3]/5'
              }`}
            >
              <input 
                type="file" 
                accept="application/pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                selectedOption === 'upload'
                  ? 'bg-[#0071e3]/20'
                  : 'bg-[#0071e3]/10 group-hover:bg-[#0071e3]/20'
              }`}>
                <Upload className="w-6 h-6 text-[#0071e3]" strokeWidth={2} />
              </div>
              <p className="text-[14px] text-[#0071e3] text-center">Upload Syllabus</p>
            </label>

            {/* Start From Scratch */}
            <button
              onClick={() => setSelectedOption('scratch')}
              className={`border-2 rounded-[12px] py-8 px-4 flex flex-col items-center justify-center gap-3 transition-all ${
                selectedOption === 'scratch'
                  ? 'border-[#0071e3] bg-[#e8f0fb] translate-y-[2px] shadow-none'
                  : 'border-[#d2d2d7] hover:border-[#0071e3] hover:bg-[#f5f5f7] shadow-sm'
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                selectedOption === 'scratch'
                  ? 'bg-[#0071e3]/20'
                  : 'bg-[#0071e3]/10 group-hover:bg-[#0071e3]/20'
              }`}>
                <Sparkles className="w-6 h-6 text-[#0071e3]" strokeWidth={2} />
              </div>
              <p className="text-[16px] text-[#1d1d1f] text-center">Start From Scratch</p>
            </button>
          </div>
        </div>

        <div className="space-y-2.5 pt-3">
          {/* Output Info */}
          <div className="flex items-center gap-2 px-2 pb-1">
            <FileText className="w-4 h-4 text-[#28A745] flex-shrink-0" strokeWidth={2} />
            <p className="text-[16px] text-[#1d1d1f]">
              Exports clean, import-ready Canvas course package
            </p>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleSubmit}
            disabled={!selectedOption}
            className={`w-full h-[44px] rounded-[12px] text-[16px] gap-2 flex items-center justify-center transition-all duration-200 ease-out ${
              selectedOption
                ? 'bg-[#0071e3] hover:bg-[#0077ed] hover:scale-[1.02] hover:shadow-lg text-white cursor-pointer'
                : 'bg-[#d2d2d7] text-[#636366] cursor-not-allowed'
            }`}
          >
            Create My Course
            <ExternalLink className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}