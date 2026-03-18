import { useState, useEffect } from "react";
import { Home, BookOpen, Calendar, Inbox, Clock, Share2, HelpCircle, Menu, User, LogOut, Settings } from "lucide-react";
import { getCourses, getCanvasDomain, getCanvasConfig, type CanvasCourse } from "../utils/canvasAPI";
import helpIcon from "figma:asset/d07f021cf56a49fd244a8d3a944e94fda6686b15.png";
import accountIcon from "figma:asset/d4046272d9ea965eb9ae0692f77e53a3ce67f4b9.png";
import canvasLogoImg from "figma:asset/c14af7df2867895f96fc425a946d83333c495baa.png";

// Canvas Logo
function CanvasLogo() {
  return (
    <div className="overflow-hidden">
      <img src={canvasLogoImg} alt="Canvas" className="w-[62px] h-[62px] mb-[-8px]" />
    </div>
  );
}

// SIMPLIFY Shield Icon (for sidebar navigation)
function SimplifyIcon({ className }: { className?: string }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 3 L4 6 L4 11 C4 15.5 7 19 12 21 C17 19 20 15.5 20 11 L20 6 L12 3 Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M9 12 L11 14 L15 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

// Help Icon with question mark
function HelpIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <circle cx="13" cy="13" r="10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M10 10c0-1.657 1.343-3 3-3s3 1.343 3 3c0 1.5-1.2 2.2-2 2.8-.5.4-.8.8-.8 1.2" 
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <circle cx="13" cy="19" r="1" fill="currentColor"/>
    </svg>
  );
}

// Account Icon with user silhouette
function AccountIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
      <circle cx="15" cy="11" r="5" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M7 24c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

interface CanvasLayoutProps {
  children: React.ReactNode;
  userName: string;
  currentView: string;
  onViewChange: (view: string) => void;
  onSelectCourse?: (courseId: number, courseName: string) => void;
  selectedCourseId?: number | null;
  onDisconnect?: () => void;
  onAccountClick?: () => void;
}

export function CanvasLayout({ 
  children, 
  userName, 
  currentView, 
  onViewChange,
  onSelectCourse,
  selectedCourseId,
  onDisconnect,
  onAccountClick
}: CanvasLayoutProps) {
  const [courses, setCourses] = useState<CanvasCourse[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const canvasDomain = getCanvasDomain();

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const config = getCanvasConfig();
      if (!config) return;

      const canvasCourses = await getCourses(config);
      const activeCourses = canvasCourses.filter(
        course => course.workflow_state === 'available' || course.workflow_state === 'unpublished'
      );
      setCourses(activeCourses);
    } catch (err) {
      console.error("Error loading Canvas courses:", err);
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const handleDisconnect = () => {
    setShowAccountModal(false);
    if (onDisconnect) {
      onDisconnect();
    }
  };

  const handleAccountClick = () => {
    if (onAccountClick) {
      onAccountClick();
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex">
      {/* Skip to main content link — WCAG 2.4.1 Bypass Blocks */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-[96px] focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#0071e3] focus:text-white focus:rounded-lg focus:text-sm focus:font-medium focus:shadow-lg">
        Skip to main content
      </a>

      {/* Left Sidebar - Exact Canvas styling */}
      <aside className="w-[86px] bg-[#394B58] flex flex-col items-center py-2 fixed left-0 top-0 bottom-0 z-[60]" role="navigation" aria-label="Main navigation">{/* Increased z-index to be above AccountPanel backdrop */}
        {/* Canvas Logo */}
        <div className="mt-2">
          <CanvasLogo />
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 w-full flex flex-col items-center gap-0 mt-4">
          {/* Account - NOW ENABLED */}
          <SidebarButton
            icon={<AccountIcon />}
            label="Account"
            active={currentView === "account"}
            onClick={handleAccountClick}
          />

          {/* Dashboard - NOW ENABLED */}
          <SidebarButton
            icon={<Home className="w-[26px] h-[26px]" strokeWidth={1.5} />}
            label="Dashboard"
            active={currentView === "dashboard"}
            onClick={() => onViewChange("dashboard")}
          />

          {/* Courses - DISABLED (enter through Dashboard only) */}
          <SidebarButton
            icon={<BookOpen className="w-[26px] h-[26px]" strokeWidth={1.5} />}
            label="Courses"
            active={currentView === "courses"}
            onClick={() => {}}
            disabled
          />

          {/* Calendar - DISABLED */}
          <SidebarButton
            icon={<Calendar className="w-[26px] h-[26px]" strokeWidth={1.5} />}
            label="Calendar"
            active={false}
            onClick={() => {}}
            disabled
          />

          {/* Inbox - DISABLED */}
          <SidebarButton
            icon={<Inbox className="w-[26px] h-[26px]" strokeWidth={1.5} />}
            label="Inbox"
            active={false}
            onClick={() => {}}
            disabled
          />

          {/* SIMPLIFY - ENABLED */}
          <SidebarButton
            icon={<SimplifyIcon className="text-current" />}
            label="SIMPLIFY"
            active={currentView === "simplify"}
            onClick={() => onViewChange("simplify")}
            highlight
          />

          {/* History - DISABLED */}
          <SidebarButton
            icon={<Clock className="w-[26px] h-[26px]" strokeWidth={1.5} />}
            label="History"
            active={false}
            onClick={() => {}}
            disabled
          />

          {/* Commons - NOW DISABLED */}
          <SidebarButton
            icon={<Share2 className="w-[26px] h-[26px]" strokeWidth={1.5} />}
            label="Commons"
            active={false}
            onClick={() => {}}
            disabled
          />

          {/* Help - DISABLED */}
          <div className="relative w-full">
            <SidebarButton
              icon={<HelpIcon />}
              label="Help"
              active={false}
              onClick={() => {}}
              disabled
            />
            {/* Notification Badge - positioned at top-right edge, not overlapping */}
            <div className="absolute top-1.5 right-4 w-[18px] h-[18px] bg-[#9BA5AE] rounded-full flex items-center justify-center pointer-events-none">
              <span className="text-[11px] font-semibold text-[#394B58]">3</span>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 ml-[86px] relative" tabIndex={-1}>
        {children}
      </main>

      {/* Account Modal - Triggered from sidebar */}
      {showAccountModal && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 z-50" 
            onClick={() => setShowAccountModal(false)}
          />
          
          {/* Modal - Apple-inspired clean design */}
          <div className="fixed left-[110px] top-[80px] bg-white rounded-[16px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] w-[360px] z-50 overflow-hidden">
            {/* Header - Clean grayscale */}
            <div className="px-6 pt-6 pb-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#E5E5E5] to-[#D4D4D4] flex items-center justify-center text-[#6B7780] text-[20px] font-semibold">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-[#1D1D1F] truncate">{userName}</p>
                  <p className="text-[13px] text-[#86868B] truncate mt-0.5">{canvasDomain}</p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-[1px] bg-[#E5E5E5] mx-6" />

            {/* Content */}
            <div className="px-6 py-5">
              {/* Account Info */}
              <div className="mb-5">
                <h3 className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wide mb-3">
                  Connected Account
                </h3>
                <div className="flex items-center gap-3 bg-[#F5F5F7] rounded-[12px] p-3.5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0084ff] to-[#0066cc] flex items-center justify-center text-white text-[13px] font-semibold flex-shrink-0">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#1D1D1F] truncate">{userName}</p>
                    <p className="text-[12px] text-[#86868B] truncate mt-0.5">{canvasDomain}</p>
                  </div>
                </div>
              </div>

              {/* Switch Account Button - Apple style */}
              <button
                onClick={handleDisconnect}
                className="w-full px-4 py-3.5 flex items-center justify-center gap-2 bg-[#F5F5F7] rounded-[12px] hover:bg-[#E8E8ED] active:bg-[#D2D2D7] transition-all"
              >
                <LogOut className="w-[18px] h-[18px] text-[#86868B]" strokeWidth={2} />
                <span className="text-[14px] font-medium text-[#1D1D1F]">
                  Switch Account
                </span>
              </button>
              
              <p className="text-[11px] text-[#86868B] text-center mt-3">
                Sign out and connect to a different Canvas account
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface SidebarButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  highlight?: boolean;
  disabled?: boolean;
}

function SidebarButton({ icon, label, active, onClick, highlight, disabled }: SidebarButtonProps) {
  const handleClick = () => {
    if (disabled) return;
    onClick();
  };

  // Special styling for Account button when active
  const isAccountButton = label === "Account";

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        w-full flex flex-col items-center justify-center py-3 px-2 gap-1
        transition-colors relative group
        ${active && isAccountButton
          ? 'bg-white text-[#0084ff]'
          : active 
            ? 'bg-[#2a3942] text-white' 
            : highlight 
              ? 'text-[#00D084] hover:bg-[#2a3942]'
              : 'text-white/80 hover:bg-[#2a3942] hover:text-white'
        }
        ${disabled && !active ? 'text-[#546A76] cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {/* Active indicator - only for non-Account buttons */}
      {active && !isAccountButton && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0084ff]" />
      )}
      
      <div className="flex items-center justify-center">
        {icon}
      </div>
      <span className={`text-[11px] font-normal leading-none ${
        highlight ? 'font-semibold' : ''
      }`}>
        {label}
      </span>
    </button>
  );
}