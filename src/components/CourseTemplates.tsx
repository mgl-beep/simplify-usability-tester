import { FileText, Navigation, Download, Eye, BookOpen, FileCheck, GraduationCap } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { allTemplates, CourseTemplate } from "../utils/courseTemplates";
import { TemplatePreviewModal } from "./TemplatePreviewModal";

export function CourseTemplates() {
  const [previewTemplate, setPreviewTemplate] = useState<CourseTemplate | null>(null);

  const getTemplateIcon = (category: string) => {
    switch (category) {
      case 'full': return FileText;
      case 'page': return Navigation;
      case 'assignment': return FileCheck;
      case 'module': return BookOpen;
      case 'syllabus': return GraduationCap;
      default: return FileText;
    }
  };

  const getTemplateColor = (category: string) => {
    switch (category) {
      case 'full': return 'from-[#0066CC] to-[#0051a8]';
      case 'page': return 'from-[#28A745] to-[#218838]';
      case 'assignment': return 'from-[#FF9500] to-[#CC7700]';
      case 'module': return 'from-[#5856D6] to-[#4644AC]';
      case 'syllabus': return 'from-[#FF2D55] to-[#CC2444]';
      default: return 'from-[#0066CC] to-[#0051a8]';
    }
  };

  const handleDownload = (template: CourseTemplate) => {
    // Create downloadable HTML file
    let content = '';
    
    if (template.content.html) {
      content = template.content.html;
    } else if (template.content.modules) {
      // For full course template, create an index page
      content = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${template.name}</title>
</head>
<body>
  <h1>${template.name}</h1>
  <p>This template includes ${template.content.modules.length} modules.</p>
  <p>Import this into Canvas using the IMSCC format or use the individual module structures below.</p>
  <ul>
    ${template.content.modules.map(m => `<li><strong>${m.name}</strong>: ${m.description}</li>`).join('\n')}
  </ul>
</body>
</html>`;
    }

    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-[22px] font-semibold text-[#1d1d1f] tracking-tight">Course Templates</h2>
        <p className="text-[14px] text-[#636366] mt-1">
          Start with pre-built templates optimized for accessibility and usability
        </p>
      </div>

      <div className="flex flex-wrap gap-6">
        {allTemplates.map((template) => {
          const Icon = getTemplateIcon(template.category);
          
          return (
            <div
              key={template.id}
              className="bg-white rounded-[12px] border border-[#d2d2d7] overflow-hidden hover:shadow-lg hover:border-[#c7c7cc] transition-all duration-200 flex flex-col w-[280px]"
            >
              {/* Template Header with gradient */}
              <div className={`h-[80px] bg-gradient-to-br ${getTemplateColor(template.category)} flex items-center justify-center`}>
                <Icon className="w-10 h-10 text-white" strokeWidth={1.5} />
              </div>

              {/* Template Content */}
              <div className="p-4 flex flex-col flex-1">
                <h3 className="text-[15px] font-semibold text-[#1d1d1f] tracking-tight mb-1.5">
                  {template.name}
                </h3>
                <p className="text-[12px] text-[#636366] mb-3 leading-relaxed">
                  {template.description}
                </p>

                {/* Features List */}
                <ul className="space-y-1.5 mb-4 flex-1">
                  {template.features.slice(0, 4).map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-[11px] text-[#1d1d1f]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3] flex-shrink-0 mt-1.5"></span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    disabled
                    className="flex-1 h-[32px] rounded-full text-[12px] bg-[#e5e5e7] text-[#636366] cursor-not-allowed hover:bg-[#e5e5e7]"
                  >
                    Coming Soon
                  </Button>
                  <Button
                    disabled
                    variant="outline"
                    className="h-[32px] w-[32px] p-0 rounded-full border-[#d2d2d7] bg-[#f5f5f7] text-[#636366] cursor-not-allowed hover:bg-[#f5f5f7]"
                    title="Coming soon"
                  >
                    <Download className="w-3.5 h-3.5" strokeWidth={2} />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <TemplatePreviewModal
          template={previewTemplate}
          isOpen={!!previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onDownload={() => handleDownload(previewTemplate)}
        />
      )}
    </div>
  );
}