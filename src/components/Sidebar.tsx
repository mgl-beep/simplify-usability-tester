import { BookOpen, Grid3x3, Calendar, Inbox, Film, HelpCircle, User, Share2, Sparkles } from "lucide-react";
import logoImage from 'figma:asset/48cc1a49d8e878e186735fca835f978d01de1274.png';

// Custom Commons Icon Component
function CommonsIcon({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M12 8 L16 12 L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M16 12 L8 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Custom Simplify Icon Component  
function SimplifyIcon({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      {/* Shield outline */}
      <path d="M12 3 L4 6 L4 11 C4 15.5 7 19 12 21 C17 19 20 15.5 20 11 L20 6 L12 3 Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Checkmark inside */}
      <path d="M9 12 L11 14 L15 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

interface SidebarProps {
  currentView: "dashboard" | "courses" | "simplify" | "account";
  onNavigate: (view: "dashboard" | "courses" | "simplify" | "account") => void;
}

const navItems = [
  { icon: User, label: "Account", view: "account" as const },
  { icon: Grid3x3, label: "Dashboard", view: "dashboard" as const },
  { icon: BookOpen, label: "Courses", view: "courses" as const },
  { icon: Calendar, label: "Calendar", view: null },
  { icon: Inbox, label: "Inbox", view: null },
  { icon: CommonsIcon, label: "Commons", view: null },
  { icon: SimplifyIcon, label: "SIMPLIFY", view: "simplify" as const },
  { icon: HelpCircle, label: "Help", view: null }
];

export function Sidebar({ currentView, onNavigate }: SidebarProps) {
  return (
    <aside className="w-[80px] bg-[#4A2D8F] flex flex-col">
      {/* Logo */}
      <div className="h-[80px] flex items-center justify-center bg-[#4A2D8F]">
        <div className="w-16 h-16 relative flex items-center justify-center">
          <img 
            src={logoImage} 
            alt="SFSU Logo" 
            className="w-full h-full object-cover"
            style={{ mixBlendMode: 'normal' }}
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2">
        {navItems.map((item) => {
          const isActive = item.view === currentView;
          const Icon = item.icon;
          
          return (
            <button
              key={item.label}
              onClick={() => item.view && onNavigate(item.view)}
              disabled={item.label === "Dashboard"}
              className={`w-full flex flex-col items-center gap-1.5 py-3 px-1 transition-all duration-200 ${
                isActive
                  ? "bg-white"
                  : item.label === "Dashboard" 
                    ? "cursor-default opacity-60"
                    : "hover:bg-[#5A3BA8]"
              }`}
              title={item.label}
            >
              <Icon className={`w-6 h-6 ${isActive ? "text-[#FFB81C]" : "text-white"}`} strokeWidth={2} />
              <span className={`text-[11px] font-semibold leading-tight text-center tracking-tight ${isActive ? "text-[#FFB81C]" : "text-white"}`}>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}