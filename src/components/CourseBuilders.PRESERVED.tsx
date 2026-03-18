/**
 * PRESERVED FOR FUTURE RESTORATION
 * 
 * This component contains the Course + Syllabus Generator features.
 * To restore: rename to CourseBuilders.tsx and uncomment the import in SimplifyDashboard.tsx
 */

import { ExternalLink } from "lucide-react";
import { Button } from "./ui/button";

export function CourseBuilders() {
  const builders = [
    {
      id: "ai-assignment",
      name: "AI Assignment Generator",
      description: "Create AI digital literacy assignments",
      fullDescription: "Generate engaging assignments that teach students about AI, prompt engineering, and digital literacy using our interactive AI chatbot builder.",
      features: [
        "Pre-built AI literacy templates",
        "Prompt engineering exercises",
        "Interactive chatbot experiences"
      ],
      buttonText: "Open AI Generator",
      buttonAction: () => window.open('https://www.playlab.ai/project/cm5qzks0706qurr5pxgtuunjd', '_blank'),
      enabled: true,
      color: "from-[#9333EA] to-[#7E22CE]"
    },
    {
      id: "syllabus-builder",
      name: "Syllabus Builder",
      description: "Build comprehensive course syllabi",
      fullDescription: "Create professional, accessible syllabi with built-in templates that ensure you include all required information and accessibility guidelines.",
      features: [
        "Accessibility-compliant templates",
        "Auto-generated learning outcomes",
        "Policy and requirement checklist"
      ],
      buttonText: "Coming Soon",
      buttonAction: null,
      enabled: false,
      color: "from-[#E68A00] to-[#CC7A00]"
    },
    {
      id: "course-builder",
      name: "Course Builder Template",
      description: "AI-powered course construction tool",
      fullDescription: "AI-powered course construction with automated accessibility checks and usability optimization.",
      features: [
        "Intelligent content organization",
        "Real-time accessibility scanning",
        "Auto-generated navigation structure",
        "Optimized learning pathways"
      ],
      buttonText: "Coming Soon",
      buttonAction: null,
      enabled: false,
      color: "from-[#4338CA] to-[#3730A3]"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[22px] tracking-tight text-[#1d1d1f] mb-2">Course Builders</h2>
        <p className="text-[15px] text-[#636366]\">AI-powered tools to help you build and design course content</p>
      </div>

      <div className="flex gap-6">
        {builders.map((builder) => (
          <div
            key={builder.id}
            className="bg-white rounded-[12px] border border-[#d2d2d7] overflow-hidden hover:shadow-lg hover:border-[#c7c7cc] transition-all duration-200 w-[280px]"
          >
            {/* Builder Header with gradient */}
            <div className={`h-[80px] bg-gradient-to-br ${builder.color}`} />

            {/* Builder Content */}
            <div className="p-4">
              <h3 className="text-[15px] font-semibold text-[#1d1d1f] tracking-tight mb-1.5">
                {builder.name}
              </h3>
              <p className="text-[12px] text-[#636366] mb-3 leading-relaxed">
                {builder.fullDescription}
              </p>

              {/* Features List */}
              <ul className="space-y-1.5 mb-4">
                {builder.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-1.5 text-[11px] text-[#1d1d1f]">
                    <span className="text-[#0071e3] mt-0.5">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={builder.buttonAction || undefined}
                  disabled={!builder.enabled}
                  className={`flex-1 h-[32px] rounded-full text-[12px] ${
                    builder.enabled
                      ? 'bg-[#0071e3] hover:bg-[#0077ed] text-white'
                      : 'bg-[#d2d2d7] text-[#636366] cursor-not-allowed'
                  }`}
                >
                  {builder.buttonText}
                  {builder.enabled && <ExternalLink className="w-3 h-3 ml-1.5" strokeWidth={2} />}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
