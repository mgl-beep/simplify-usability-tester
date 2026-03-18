import { ScanSearch, Settings2, HelpCircle, Compass, BookOpen, MessageSquareMore, Shield } from "lucide-react";
import { Button } from "./ui/button";
import { UsabilityScorecard } from "./UsabilityScorecard";
import { UsabilityScorecardOptions } from "./UsabilityScorecardOptions";
import { UsabilityScorecardRingOptions } from "./UsabilityScorecardRingOptions";
import { UnifiedCalendar } from "./UnifiedCalendar";
import { QuickStats } from "./QuickStats";
import { HelpCenter } from "./HelpCenter";
import { AIHelpChat } from "./AIHelpChat";
import { PrivacyStatement } from "./PrivacyStatement";
import { FeedbackForm } from "./FeedbackForm";
import { OnboardingTour } from "./OnboardingTour";
import { OnboardingDesignPicker } from "./OnboardingDesignPicker";
import { useState, useEffect, useRef } from "react";
import { CourseTemplates } from "./CourseTemplates";
import { Analytics } from "./Analytics";
import { ComplianceReports } from "./ComplianceReports";
import { CourseBuilders } from "./CourseBuilders";
import { LiveScanView } from "./LiveScanView";
import { CourseDropdown } from "./CourseDropdown";
import type { ScanIssue } from '../App';

interface SimplifyDashboardProps {
  onScanCourse: (courseId: string, courseName: string) => void;
  onOpenStandards: () => void;
  onIssuesClick?: () => void;
  issuesCount?: number;
  selectedCourseName?: string | null;
  scanResults?: ScanIssue[];
  lastScanTime?: Date;
  isScanning?: boolean;
  onSelectIssue?: (issue: ScanIssue) => void;
  onBatchFixAll?: () => void;
  onPublishToCanvas?: () => void;
  onPublishSingleIssue?: (issue: ScanIssue) => void;
  handleRevertStagedFix?: (issue: ScanIssue) => void;
  onUndo?: (issue: ScanIssue) => void;
  enabledStandards?: string[];
  selectedCourse?: { courseId: number; courseName: string } | null;
  [key: string]: any; // Allow additional props from App.tsx
}

export function SimplifyDashboard({ onScanCourse, onOpenStandards, onIssuesClick, issuesCount, selectedCourseName, scanResults, lastScanTime, isScanning, onSelectIssue, onBatchFixAll, onPublishToCanvas, onPublishSingleIssue, handleRevertStagedFix, onUndo, enabledStandards, selectedCourse, ...rest }: SimplifyDashboardProps) {
  // Persist active tab across navigation - restore from localStorage or default to "overview"
  const [activeTab, setActiveTab] = useState<"overview" | "analytics" | "reports" | "builders">("overview");
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [showAIHelp, setShowAIHelp] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [showDesignPicker, setShowDesignPicker] = useState(false);
  const [showGuideDropdown, setShowGuideDropdown] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showStandardsDropdown, setShowStandardsDropdown] = useState(false);
  const [enabledStds, setEnabledStds] = useState<Record<string, boolean>>({ "cvc-oei": true, "peralta": true, "quality-matters": true });
  const guideRef = useRef<HTMLDivElement>(null);
  const standardsRef = useRef<HTMLDivElement>(null);

  // Auto-show tour for first-time users (but not if PilotWelcome is showing)
  useEffect(() => {
    const tourSeen = localStorage.getItem('simplify_onboarding_seen') === 'true';
    const pilotWelcomeSeen = localStorage.getItem('simplify_pilot_welcome_seen');
    // Don't show tour if PilotWelcome hasn't been dismissed yet — it will show instead
    if (!tourSeen && pilotWelcomeSeen) {
      setShowTour(true);
    }
  }, []);

  // Trigger tour after PilotWelcome is dismissed
  useEffect(() => {
    if (rest.triggerTour) {
      setTimeout(() => setShowTour(true), 300); // Brief delay for smooth transition
      rest.onTourTriggered?.();
    }
  }, [rest.triggerTour]);

  const handleTourClose = () => {
    setShowTour(false);
    localStorage.setItem('simplify_onboarding_seen', 'true');
  };

  // Close guide dropdown on outside click
  useEffect(() => {
    if (!showGuideDropdown) return;
    const handleClick = (e: MouseEvent) => {
      if (guideRef.current && !guideRef.current.contains(e.target as Node)) {
        setShowGuideDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showGuideDropdown]);

  // Close standards dropdown on outside click
  useEffect(() => {
    if (!showStandardsDropdown) return;
    const handleClick = (e: MouseEvent) => {
      if (standardsRef.current && !standardsRef.current.contains(e.target as Node)) {
        setShowStandardsDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showStandardsDropdown]);

  const standardsList = [
    { id: "cvc-oei", name: "CVC-OEI", fullName: "CVC-OEI Course Design Rubric", version: "2020", criteria: 52, subtitle: "CA online course design" },
    { id: "peralta", name: "Peralta", fullName: "Peralta Online Equity Rubric", version: "3.0", criteria: 38, subtitle: "Equity-focused design" },
    { id: "quality-matters", name: "Quality Matters", fullName: "Quality Matters HE Rubric", version: "7th Ed", criteria: 43, subtitle: "National quality assurance" },
  ];
  const toggleStd = (id: string) => setEnabledStds(prev => ({ ...prev, [id]: !prev[id] }));

  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('simplify_active_tab', activeTab);
  }, [activeTab]);

  // Automatically switch to Overview tab when a scan starts
  // This ensures users see scan progress and results immediately, regardless of which tab they're on
  useEffect(() => {
    if (isScanning) {
      setActiveTab("overview");
    }
  }, [isScanning]);

  // Also switch to Overview when a new course is selected for scanning (but only if actively scanning)
  useEffect(() => {
    if (selectedCourseName && isScanning) {
      setActiveTab("overview");
    }
  }, [selectedCourseName, isScanning]);

  return (
    <>
      <div className="min-h-screen" style={{ background: '#FFFFFF' }}>
        {/* Header - Refined Apple-style branding */}
        <header className="border-b border-white/10" style={{ backgroundColor: '#1c1917' }}>
          <div className="px-10 h-[100px] flex items-center justify-between" style={{ minWidth: 0 }}>
            <div className="flex flex-col gap-0 mt-[15px] shrink-0">
              <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: '40px', letterSpacing: '-0.02em', fontWeight: 600, lineHeight: 0.8, color: '#fff', margin: 0 }}>
                SIMPLIFY<span aria-hidden="true" style={{ display: 'inline-block', width: 6, height: 6, backgroundColor: '#f5a623', borderRadius: 0, verticalAlign: 'baseline', position: 'relative', top: -1, marginLeft: 0 }}></span>
              </h1>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 300, letterSpacing: '0.01em', fontSize: '14.5px', color: 'rgba(255,255,255,0.55)', margin: 0, marginTop: '2px' }}>
                Course Design & Accessibility
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* Guide dropdown — combines Tour, FAQ, AI Help */}
              <div ref={guideRef} style={{ position: "relative" }}>
                <Button
                  onClick={() => { setShowGuideDropdown(!showGuideDropdown); localStorage.setItem('simplify_seen_help', '1'); }}
                  aria-expanded={showGuideDropdown}
                  aria-haspopup="menu"
                  onKeyDown={(e) => {
                    if (e.key === 'Escape' && showGuideDropdown) { setShowGuideDropdown(false); }
                    if (e.key === 'ArrowDown' && showGuideDropdown) { e.preventDefault(); const first = e.currentTarget.parentElement?.querySelector('[role="menuitem"]') as HTMLElement; first?.focus(); }
                  }}
                  variant="outline"
                  className="h-[44px] px-6 rounded-full border border-white/30 bg-transparent hover:bg-white/15 text-white text-[15px] font-normal transition-all backdrop-blur-sm"
                  style={localStorage.getItem('simplify_has_scanned') && !localStorage.getItem('simplify_seen_help') ? { animation: 'pulse-ring 2s ease-in-out 3', animationDelay: '1.5s' } : undefined}
                >
                  <HelpCircle className="w-[18px] h-[18px] mr-2.5" strokeWidth={1.5} />
                  Help
                </Button>
                {showGuideDropdown && (
                  <div role="menu" aria-label="Help menu" style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, width: 170, backgroundColor: "#fff", borderRadius: 10, boxShadow: "0 8px 30px rgba(0,0,0,0.15)", border: "1px solid #e5e5ea", overflow: "hidden", zIndex: 100 }}>
                    <div
                      role="menuitem"
                      tabIndex={0}
                      onClick={() => { setShowGuideDropdown(false); setShowTour(true); }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowGuideDropdown(false); setShowTour(true); }
                        if (e.key === 'Escape') { setShowGuideDropdown(false); }
                        if (e.key === 'ArrowDown') { e.preventDefault(); (e.currentTarget.nextElementSibling as HTMLElement)?.focus(); }
                      }}
                      style={{ padding: "12px 16px", fontSize: 14, fontWeight: 500, color: "#1d1d1f", cursor: "pointer", borderBottom: "1px solid #f2f2f7", display: "flex", alignItems: "center", gap: 10 }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(0,113,227,0.10)")}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <Compass style={{ width: 16, height: 16, color: "#0071e3" }} /> Take a Tour
                    </div>
                    <div
                      role="menuitem"
                      tabIndex={0}
                      onClick={() => { setShowGuideDropdown(false); setShowHelpCenter(true); }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowGuideDropdown(false); setShowHelpCenter(true); }
                        if (e.key === 'Escape') { setShowGuideDropdown(false); }
                        if (e.key === 'ArrowDown') { e.preventDefault(); (e.currentTarget.nextElementSibling as HTMLElement)?.focus(); }
                        if (e.key === 'ArrowUp') { e.preventDefault(); (e.currentTarget.previousElementSibling as HTMLElement)?.focus(); }
                      }}
                      style={{ padding: "12px 16px", fontSize: 14, fontWeight: 500, color: "#1d1d1f", cursor: "pointer", borderBottom: "1px solid #f2f2f7", display: "flex", alignItems: "center", gap: 10 }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(0,113,227,0.10)")}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <BookOpen style={{ width: 16, height: 16, color: "#f5a623" }} /> Help Center
                    </div>
                    <div
                      role="menuitem"
                      tabIndex={0}
                      onClick={() => { setShowGuideDropdown(false); setShowAIHelp(true); }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowGuideDropdown(false); setShowAIHelp(true); }
                        if (e.key === 'Escape') { setShowGuideDropdown(false); }
                        if (e.key === 'ArrowDown') { e.preventDefault(); (e.currentTarget.nextElementSibling as HTMLElement)?.focus(); }
                        if (e.key === 'ArrowUp') { e.preventDefault(); (e.currentTarget.previousElementSibling as HTMLElement)?.focus(); }
                      }}
                      style={{ padding: "12px 16px", fontSize: 14, fontWeight: 500, color: "#1d1d1f", cursor: "pointer", borderBottom: "1px solid #f2f2f7", display: "flex", alignItems: "center", gap: 10 }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(0,113,227,0.10)")}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <MessageSquareMore style={{ width: 16, height: 16, color: "#34c759" }} /> Ask SIMPLIFY
                    </div>
                    <div
                      role="menuitem"
                      tabIndex={0}
                      onClick={() => { setShowGuideDropdown(false); setShowPrivacy(true); }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowGuideDropdown(false); setShowPrivacy(true); }
                        if (e.key === 'Escape') { setShowGuideDropdown(false); }
                        if (e.key === 'ArrowUp') { e.preventDefault(); (e.currentTarget.previousElementSibling as HTMLElement)?.focus(); }
                      }}
                      style={{ padding: "12px 16px", fontSize: 14, fontWeight: 500, color: "#1d1d1f", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(0,113,227,0.10)")}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <Shield style={{ width: 16, height: 16, color: "#8e8e93" }} /> Privacy & Data
                    </div>
                  </div>
                )}
              </div>
              <div ref={standardsRef} style={{ position: "relative" }}>
                <Button
                  onClick={() => setShowStandardsDropdown(!showStandardsDropdown)}
                  aria-expanded={showStandardsDropdown}
                  aria-haspopup="menu"
                  onKeyDown={(e) => {
                    if (e.key === 'Escape' && showStandardsDropdown) { setShowStandardsDropdown(false); }
                    if (e.key === 'ArrowDown' && showStandardsDropdown) { e.preventDefault(); const first = e.currentTarget.parentElement?.querySelector('[role="menuitemcheckbox"]') as HTMLElement; first?.focus(); }
                  }}
                  variant="outline"
                  className="h-[44px] px-6 rounded-full border border-white/30 bg-transparent hover:bg-white/15 text-white text-[15px] font-normal transition-all backdrop-blur-sm"
                >
                  <Settings2 className="w-[18px] h-[18px] mr-2.5" strokeWidth={1.5} />
                  Standards
                </Button>
                {showStandardsDropdown && (
                  <div role="menu" aria-label="Standards filter" style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, width: 240, backgroundColor: "#fff", borderRadius: 10, boxShadow: "0 8px 30px rgba(0,0,0,0.15)", border: "1px solid #e5e5ea", overflow: "hidden", zIndex: 100 }}>
                    {standardsList.map((s, i) => (
                      <div key={s.id}
                        role="menuitemcheckbox"
                        aria-checked={enabledStds[s.id]}
                        tabIndex={0}
                        onClick={() => toggleStd(s.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleStd(s.id); }
                          if (e.key === 'Escape') { setShowStandardsDropdown(false); }
                          if (e.key === 'ArrowDown') { e.preventDefault(); const next = e.currentTarget.nextElementSibling as HTMLElement; next?.focus(); }
                          if (e.key === 'ArrowUp') { e.preventDefault(); const prev = e.currentTarget.previousElementSibling as HTMLElement; prev?.focus(); }
                        }}
                        style={{ padding: "10px 16px", cursor: "pointer", borderBottom: i < 2 ? "1px solid #f2f2f7" : "none", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(0,113,227,0.10)")}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 500, color: "#1d1d1f" }}>{s.name}</div>
                          <div style={{ fontSize: 12.5, color: "#86868b", fontWeight: 400, marginTop: 1 }}>{s.subtitle}</div>
                        </div>
                        <div style={{ width: 36, height: 20, borderRadius: 10, background: enabledStds[s.id] ? "linear-gradient(135deg, #0071e3, #34c759)" : "#d2d2d7", position: "relative", transition: "background 0.2s", flexShrink: 0 }} aria-hidden="true">
                          <div style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: "#fff", position: "absolute", top: 2, left: enabledStds[s.id] ? 18 : 2, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <CourseDropdown
                onSelectCourse={onScanCourse}
                selectedCourseName={selectedCourseName}
              />
            </div>
          </div>
        </header>

        {/* Tabs — WAI-ARIA tablist pattern */}
        {(() => {
          const tabs: Array<{ key: "overview" | "analytics" | "builders"; label: string }> = [
            { key: "overview", label: "Overview" },
            { key: "analytics", label: "Analytics" },
            { key: "reports", label: "Reports" },
            { key: "builders", label: "Builders" },
          ];

          const st = { ac: '#0071e3', bc: '#0071e3', ic: '#636366', hc: '#1d1d1f', fs: '15px', fw: '500', gap: '24px', py: '12px', bw: '3px', bb: '#d2d2d7' };

          const handleTabKeyDown = (e: React.KeyboardEvent, index: number) => {
            let newIndex = index;
            if (e.key === 'ArrowRight') { newIndex = (index + 1) % tabs.length; e.preventDefault(); }
            else if (e.key === 'ArrowLeft') { newIndex = (index - 1 + tabs.length) % tabs.length; e.preventDefault(); }
            else if (e.key === 'Home') { newIndex = 0; e.preventDefault(); }
            else if (e.key === 'End') { newIndex = tabs.length - 1; e.preventDefault(); }
            else return;
            setActiveTab(tabs[newIndex].key);
            const tabEl = document.querySelector(`[data-tour="tab-${tabs[newIndex].key}"]`) as HTMLElement;
            tabEl?.focus();
          };

          return (
            <div style={{ borderBottom: `1px solid ${st.bb}`, backgroundColor: '#fff' }} className="px-10">
              <div data-tour="tab-bar" role="tablist" aria-label="Dashboard sections" className="flex items-center" style={{ gap: st.gap }}>
                {tabs.map((tab, index) => {
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      data-tour={`tab-${tab.key}`}
                      role="tab"
                      id={`tab-${tab.key}`}
                      aria-selected={isActive}
                      aria-controls={`tabpanel-${tab.key}`}
                      tabIndex={isActive ? 0 : -1}
                      onClick={() => setActiveTab(tab.key)}
                      onKeyDown={(e) => handleTabKeyDown(e, index)}
                      className="transition-colors"
                      style={{
                        padding: `${st.py} 0`,
                        fontSize: st.fs,
                        fontWeight: st.fw,
                        color: isActive ? st.ac : st.ic,
                        borderBottom: isActive ? `${st.bw} solid ${st.bc}` : `${st.bw} solid transparent`,
                        marginBottom: `-1px`,
                        outline: 'none',
                      }}
                      onFocus={(e) => { (e.target as HTMLElement).style.borderBottom = '3px solid #0071e3'; (e.target as HTMLElement).style.color = '#0071e3'; }}
                      onBlur={(e) => { if (!isActive) { (e.target as HTMLElement).style.borderBottom = '3px solid transparent'; (e.target as HTMLElement).style.color = st.ic; } }}
                      onMouseEnter={(e) => { if (!isActive) (e.target as HTMLElement).style.color = st.hc; }}
                      onMouseLeave={(e) => { if (!isActive) (e.target as HTMLElement).style.color = st.ic; }}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Content */}
        <main className="px-5 pt-2 pb-5">
          <div className="max-w-[1200px] mx-auto ml-0">{/* Widened from 1150px to 1200px (+0.5 inches) */}
            {activeTab === "overview" && (
              <div role="tabpanel" id="tabpanel-overview" aria-labelledby="tab-overview">
              <LiveScanView
                isScanning={isScanning || false}
                scanResults={scanResults || []}
                onSelectIssue={onSelectIssue || (() => {})}
                onBatchFixAll={onBatchFixAll}
                onPublishToCanvas={onPublishToCanvas}
                onPublishSingleIssue={onPublishSingleIssue}
                handleRevertStagedFix={handleRevertStagedFix}
                onUndo={onUndo}
                courseName={selectedCourseName || undefined}
                courseId={selectedCourse?.courseId?.toString()}
                lastScanTime={lastScanTime}
                enabledStandards={enabledStandards}
                onRescan={rest.onRescan}
                scanError={rest.scanError}
                onRetryScan={rest.onRetryScan}
                onDismissScanError={rest.onDismissScanError}
              />
              </div>
            )}

            {activeTab === "analytics" && (
              <div role="tabpanel" id="tabpanel-analytics" aria-labelledby="tab-analytics">
                {/* Analytics component first */}
                <div className="mb-2">
                  <Analytics scanResults={scanResults} selectedCourse={selectedCourse} lastScanTime={lastScanTime} />
                </div>
                {/* Usability Scorecard below */}
                <UsabilityScorecard scanResults={scanResults} lastScanTime={lastScanTime} />
              </div>
            )}

            {activeTab === "reports" && (
              <div role="tabpanel" id="tabpanel-reports" aria-labelledby="tab-reports">
                <ComplianceReports
                  scanResults={scanResults}
                  selectedCourseName={selectedCourseName}
                  lastScanTime={lastScanTime}
                  courseId={selectedCourse?.courseId?.toString()}
                />
              </div>
            )}

            {activeTab === "builders" && (
              <div role="tabpanel" id="tabpanel-builders" aria-labelledby="tab-builders">
              <CourseBuilders
                courseName={selectedCourse?.courseName}
                courseId={selectedCourse?.courseId?.toString()}
              />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Help Center (merged FAQ + Support) */}
      <HelpCenter isOpen={showHelpCenter} onClose={() => setShowHelpCenter(false)} onOpenFeedback={() => setShowFeedback(true)} onOpenAIHelp={() => setShowAIHelp(true)} />
      <PrivacyStatement isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
      <FeedbackForm isOpen={showFeedback} onClose={() => setShowFeedback(false)} />

      {/* AI Help Chat */}
      <AIHelpChat isOpen={showAIHelp} onClose={() => setShowAIHelp(false)} />

      {/* Onboarding Tour */}
      <OnboardingTour isOpen={showTour} onClose={handleTourClose} />

      {/* Design Picker (temporary) */}
      <OnboardingDesignPicker isOpen={showDesignPicker} onClose={() => setShowDesignPicker(false)} />
    </>
  );
}