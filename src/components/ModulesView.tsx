import { ChevronRight, ScanEye } from "lucide-react";
import { useState } from "react";

const creativeWritingModules = [
  {
    id: "1",
    title: "Week 1: Orientation and Introductions"
  },
  {
    id: "2",
    title: "Week 2: AI Activities and Intro to Memoir"
  },
  {
    id: "3",
    title: "Week 3: Memoir"
  },
  {
    id: "4",
    title: "Week 4: Memoir"
  },
  {
    id: "5",
    title: "Week 5: Memoir"
  },
  {
    id: "6",
    title: "Week 6: Memoir Wrap-Up and Intro to Profile"
  },
  {
    id: "7",
    title: "Week 7: Profile"
  },
  {
    id: "8",
    title: "Week 8: Profile"
  },
  {
    id: "9",
    title: "Week 9: Profile"
  },
  {
    id: "10",
    title: "Week 10: Profile Wrap-up and Intro to Project 3"
  },
  {
    id: "11",
    title: "Week 11: White Album"
  },
  {
    id: "12",
    title: "Week 12: White Album"
  },
  {
    id: "13",
    title: "Week 13: White Album and Intro to Publishing"
  },
  {
    id: "14",
    title: "Week 14: Submission and Reading (Final)"
  }
];

const cats101Modules = [
  {
    id: "1",
    title: "Week 1: Introduction to Feline Biology"
  },
  {
    id: "2",
    title: "Week 2: Cat Behavior and Communication"
  },
  {
    id: "3",
    title: "Week 3: Feline Nutrition and Diet"
  },
  {
    id: "4",
    title: "Week 4: Cat Breeds and Genetics"
  },
  {
    id: "5",
    title: "Week 5: Kitten Development and Care"
  },
  {
    id: "6",
    title: "Week 6: Cat Health and Veterinary Care"
  },
  {
    id: "7",
    title: "Week 7: Indoor vs Outdoor Cat Management"
  },
  {
    id: "8",
    title: "Week 8: Cat Training and Enrichment"
  },
  {
    id: "9",
    title: "Week 9: Understanding Cat Body Language"
  },
  {
    id: "10",
    title: "Week 10: Common Feline Diseases and Prevention"
  },
  {
    id: "11",
    title: "Week 11: Senior Cat Care"
  },
  {
    id: "12",
    title: "Week 12: Multi-Cat Households"
  },
  {
    id: "13",
    title: "Week 13: Cat Grooming and Hygiene"
  },
  {
    id: "14",
    title: "Week 14: Final Project - Cat Care Plan"
  }
];

interface ModulesViewProps {
  courseName: string;
  courseCode: string;
  onBackToCourses?: () => void;
  onScanCourse?: () => void;
}

export function ModulesView({ courseName, courseCode, onBackToCourses, onScanCourse }: ModulesViewProps) {
  const [openModules, setOpenModules] = useState<Set<string>>(new Set());

  // Select modules based on course name
  const courseModules = courseName === "Cats 101" ? cats101Modules : creativeWritingModules;

  const toggleModule = (moduleId: string) => {
    const newOpenModules = new Set(openModules);
    if (newOpenModules.has(moduleId)) {
      newOpenModules.delete(moduleId);
    } else {
      newOpenModules.add(moduleId);
    }
    setOpenModules(newOpenModules);
  };

  return (
    <div className="flex-1 min-h-full bg-white">
      {/* Header */}
      <header className="border-b border-[#e5e5e7] bg-white">
        <div className="px-12 py-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-3">
            <button 
              onClick={onBackToCourses}
              className="text-[14px] text-[#0071e3] hover:underline tracking-[-0.006em]"
            >
              Courses
            </button>
            <ChevronRight className="w-4 h-4 text-[#636366]" strokeWidth={2} />
            <span className="text-[14px] text-[#636366] tracking-[-0.006em]">{courseName}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[40px] font-semibold tracking-[-0.022em] text-[#1d1d1f] mb-2">
                {courseName}
              </h1>
              <p className="text-[17px] text-[#636366] tracking-[-0.011em]">{courseCode}</p>
            </div>
            
            {onScanCourse && (
              <button
                onClick={onScanCourse}
                className="flex items-center gap-2 px-5 h-[44px] bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-[12px] transition-colors"
              >
                <ScanEye className="w-5 h-5" strokeWidth={1.5} />
                <span className="text-[15px]">Scan Course</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Modules List */}
      <div className="px-12 py-8 bg-white min-h-screen">
        <div className="space-y-2">
          {courseModules.map((module) => {
            const isOpen = openModules.has(module.id);
            
            return (
              <div key={module.id} className="border-b border-[#e5e5e7]">
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full flex items-center gap-3 py-4 px-4 bg-[#EEECE8] hover:bg-[#e8e8ed] transition-colors rounded-t-[8px]"
                >
                  <ChevronRight 
                    className={`w-4 h-4 text-[#1d1d1f] transition-transform flex-shrink-0 ${
                      isOpen ? 'rotate-90' : ''
                    }`}
                    strokeWidth={2.5}
                  />
                  <span className="text-[15px] font-semibold text-[#1d1d1f] text-left tracking-[-0.011em]">
                    {module.title}
                  </span>
                </button>
                
                {isOpen && (
                  <div className="bg-white py-4 px-12">
                    <p className="text-[14px] text-[#636366]">
                      Module content will appear here...
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}