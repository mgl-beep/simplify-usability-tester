import { Eye, EyeOff } from "lucide-react";

const navItems = [
  { label: "Announcements", visible: true },
  { label: "Modules", visible: true },
  { label: "Syllabus", visible: true },
  { label: "Assignments", visible: true },
  { label: "Grades", visible: true },
  { label: "Discussions", visible: false },
  { label: "Quizzes", visible: false },
  { label: "Files", visible: false }
];

interface SecondaryNavProps {
  courseName?: string;
  selectedItem?: string;
  onSelectItem?: (item: string) => void;
}

export function SecondaryNav({ courseName = "Cats 101", selectedItem = "Modules", onSelectItem }: SecondaryNavProps) {
  return (
    <aside className="w-[240px] bg-white border-r border-[#e5e5e7] flex flex-col">
      {/* Course Name Header */}
      <div className="h-[104px] flex items-center px-6 border-b border-[#e5e5e7]">
        <div>
          <div className="text-[12px] font-semibold text-[#636366] mb-1 tracking-[-0.006em]">Home</div>
          <div className="text-[20px] font-semibold text-[#1d1d1f] tracking-[-0.022em]">{courseName}</div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-4 px-4 overflow-y-auto">
        {navItems.map((item) => {
          const isSelected = item.label === selectedItem;
          const isModules = item.label === "Modules";
          
          return (
            <div
              key={item.label}
              className={`group w-full flex items-center justify-between py-3 px-3 transition-colors ${
                isSelected
                  ? "bg-[#0071e3]/10 text-[#0071e3]"
                  : isModules ? "text-[#0071e3] hover:bg-[#e8e8ed] cursor-pointer" : "text-[#636366] cursor-not-allowed"
              }`}
              onClick={() => isModules && onSelectItem && onSelectItem(item.label)}
            >
              <span className="text-[15px] font-semibold tracking-[-0.011em]">{item.label}</span>
              
              {item.visible !== null && (
                <button 
                  className="p-1 hover:bg-black/5 rounded transition-colors flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  {item.visible ? (
                    <Eye className="w-4 h-4 text-[#636366]" strokeWidth={2.5} />
                  ) : (
                    <EyeOff className="w-4 h-4 text-[#636366]" strokeWidth={2.5} />
                  )}
                </button>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}