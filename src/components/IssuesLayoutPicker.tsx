import { useState } from "react";
import { AlertCircle, CheckCircle2, AlertTriangle, ChevronDown, Undo2 } from "lucide-react";

// Mock issues for preview — includes all action states
const mockIssues = [
  { id: '1', title: 'Missing Alt Text', severity: 'high' as const, category: 'alt-text', location: 'Module 1 › Welcome Page', status: 'pending', autoFix: true, description: 'Image lacks alternative text for screen readers' },
  { id: '2', title: 'Insufficient Color Contrast', severity: 'high' as const, category: 'contrast', location: 'Module 2 › Lecture Notes', status: 'staged', autoFix: true, description: 'Text contrast ratio is 2.8:1, needs 4.5:1' },
  { id: '3', title: 'Missing Alt Text', severity: 'high' as const, category: 'alt-text', location: 'Module 3 › Lab Instructions', status: 'pending', autoFix: true, description: 'Decorative image needs empty alt attribute' },
  { id: '4', title: 'Broken Link', severity: 'medium' as const, category: 'broken-link', location: 'Module 1 › Resources', status: 'pending', autoFix: false, description: 'Link returns 404 error' },
  { id: '5', title: 'No Rubric on Assignment', severity: 'medium' as const, category: 'formatting', location: 'Module 2 › Midterm', status: 'published', autoFix: false, description: 'Graded assignment missing rubric' },
  { id: '6', title: 'Long Paragraph', severity: 'low' as const, category: 'readability', location: 'Module 1 › Overview', status: 'pending', autoFix: true, description: '180 words without a break' },
  { id: '7', title: 'Missing Video Captions', severity: 'high' as const, category: 'video-caption', location: 'Module 3 › Video Lecture', status: 'published', autoFix: false, description: 'Embedded video has no captions' },
  { id: '8', title: 'Small Font Size', severity: 'low' as const, category: 'formatting', location: 'Module 2 › Syllabus', status: 'staged', autoFix: true, description: 'Text below 12px minimum' },
];

const sevColors = {
  high: { bg: '#ff3b30', text: 'white' },
  medium: { bg: '#ff9500', text: 'white' },
  low: { bg: '#ffcc00', text: '#1d1d1f' },
};

function SevBadge({ severity }: { severity: 'high' | 'medium' | 'low' }) {
  return (
    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium inline-block" style={{ background: sevColors[severity].bg, color: sevColors[severity].text }}>
      {severity}
    </span>
  );
}

function IssueIcon({ category }: { category: string }) {
  const Icon = category === 'alt-text' || category === 'video-caption' ? CheckCircle2
    : category === 'contrast' || category === 'broken-link' ? AlertTriangle
    : AlertCircle;
  return (
    <div className="w-7 h-7 rounded-lg bg-[#EEECE8] flex items-center justify-center flex-shrink-0">
      <Icon className="w-3.5 h-3.5 text-[#636366]" strokeWidth={1.5} />
    </div>
  );
}

/* Shared action buttons — used in all 10 designs */
function ActionButtons({ issue }: { issue: typeof mockIssues[0] }) {
  if (issue.status === 'pending') {
    return (
      <div className="flex items-center gap-2">
        <button className={`h-[28px] px-3 text-[12px] font-medium rounded-[6px] transition-colors ${issue.autoFix ? 'bg-[#0071e3] hover:bg-[#0077ed] text-white' : 'bg-[#f5f5f7] text-[#636366] hover:bg-[#e8e8ed]'}`}>
          Fix Now
        </button>
        <button className="h-[28px] px-3 border border-[#d2d2d7] hover:bg-[#f5f5f7] text-[#636366] text-[12px] font-medium rounded-[6px] transition-colors">
          Ignore
        </button>
      </div>
    );
  }
  if (issue.status === 'staged') {
    return (
      <div className="flex items-center gap-1.5 text-[12px] text-[#34c759] font-medium">
        <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
        <span>Staged for publish</span>
      </div>
    );
  }
  if (issue.status === 'ignored') {
    return (
      <div className="flex items-center gap-1.5 text-[12px] text-[#86868b] font-medium">
        <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
        <span>Ignored</span>
      </div>
    );
  }
  if (issue.status === 'published') {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-[12px] text-[#0071e3] font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
          <span>Published</span>
        </div>
        <button className="h-[28px] px-3 border border-[#ff9500] hover:bg-[#ff9500]/10 text-[#ff9500] text-[12px] font-medium rounded-[6px] transition-colors flex items-center gap-1">
          <Undo2 className="w-3 h-3" />
          Undo
        </button>
      </div>
    );
  }
  return null;
}

/* Shared accordion header */
function AccordionHeader({ g, isOpen, onClick }: { g: { key: string; label: string; count: number; color: string; pts: string }; isOpen: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#fafafa] transition-colors">
      <div className="flex items-center gap-2.5">
        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: g.color }} />
        <span className="text-[14px] font-semibold text-[#1d1d1f]">{g.label}</span>
        <span className="text-[11px] text-[#86868b] bg-[#f5f5f7] px-2 py-0.5 rounded-full">{g.count}</span>
        <span className="text-[11px] text-[#86868b]">{g.pts}</span>
      </div>
      <ChevronDown className={`w-4 h-4 text-[#86868b] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} strokeWidth={2} />
    </button>
  );
}

const groups = [
  { key: 'high', label: 'High Priority', count: mockIssues.filter(i => i.severity === 'high').length, color: '#ff3b30', pts: '−10 pts each' },
  { key: 'medium', label: 'Medium Priority', count: mockIssues.filter(i => i.severity === 'medium').length, color: '#ff9500', pts: '−5 pts each' },
  { key: 'low', label: 'Low Priority', count: mockIssues.filter(i => i.severity === 'low').length, color: '#ffcc00', pts: '−2 pts each' },
];

// ────────────────────────────────────────────
// 1: Compact Rows — No inner cards, divider lines, tighter spacing
// ────────────────────────────────────────────
function Design1() {
  const [openSev, setOpenSev] = useState<string | null>('high');
  return (
    <div className="space-y-2">
      {groups.map(g => {
        const isOpen = openSev === g.key;
        const items = mockIssues.filter(i => i.severity === g.key);
        return (
          <div key={g.key} className="bg-white border border-[#d2d2d7] rounded-[12px] overflow-hidden">
            <AccordionHeader g={g} isOpen={isOpen} onClick={() => setOpenSev(isOpen ? null : g.key)} />
            <div style={{ maxHeight: isOpen ? 600 : 0, overflow: 'hidden', transition: 'max-height 0.3s ease' }}>
              <div className="border-t border-[#f0f0f2]">
                {items.map((issue, idx) => (
                  <div key={issue.id} className={`flex items-center gap-3 px-4 py-3 hover:bg-[#fafafa] transition-colors ${idx > 0 ? 'border-t border-[#f0f0f2]' : ''}`}>
                    <IssueIcon category={issue.category} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[13px] text-[#1d1d1f] font-medium">{issue.title}</span>
                        <SevBadge severity={issue.severity} />
                        {issue.autoFix && <span className="text-[10px] text-[#0071e3] bg-[#0071e3]/10 px-1.5 py-0.5 rounded-full">auto-fix</span>}
                      </div>
                      <p className="text-[11px] text-[#86868b] mt-0.5">📍 {issue.location}</p>
                    </div>
                    <ActionButtons issue={issue} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ────────────────────────────────────────────
// 2: Padded Cards — More breathing room, inner cards with generous spacing
// ────────────────────────────────────────────
function Design2() {
  const [openSev, setOpenSev] = useState<string | null>('high');
  return (
    <div className="space-y-2">
      {groups.map(g => {
        const isOpen = openSev === g.key;
        const items = mockIssues.filter(i => i.severity === g.key);
        return (
          <div key={g.key} className="bg-white border border-[#d2d2d7] rounded-[12px] overflow-hidden">
            <AccordionHeader g={g} isOpen={isOpen} onClick={() => setOpenSev(isOpen ? null : g.key)} />
            <div style={{ maxHeight: isOpen ? 700 : 0, overflow: 'hidden', transition: 'max-height 0.3s ease' }}>
              <div className="px-4 pb-4 space-y-3">
                {items.map(issue => (
                  <div key={issue.id} className="border border-[#d2d2d7] rounded-[10px] p-4 hover:border-[#0071e3] transition-colors cursor-pointer">
                    <div className="flex items-start gap-3">
                      <IssueIcon category={issue.category} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[14px] text-[#1d1d1f] font-medium">{issue.title}</span>
                          <SevBadge severity={issue.severity} />
                          {issue.autoFix && <span className="text-[10px] text-[#0071e3] bg-[#0071e3]/10 px-1.5 py-0.5 rounded-full">auto-fix</span>}
                        </div>
                        <p className="text-[12px] text-[#636366] mt-1.5">{issue.description}</p>
                        <p className="text-[11px] text-[#86868b] mt-1">📍 {issue.location}</p>
                        <div className="mt-3">
                          <ActionButtons issue={issue} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ────────────────────────────────────────────
// 3: Color-Striped — Left border color accent, no inner cards
// ────────────────────────────────────────────
function Design3() {
  const [openSev, setOpenSev] = useState<string | null>('high');
  return (
    <div className="space-y-2">
      {groups.map(g => {
        const isOpen = openSev === g.key;
        const items = mockIssues.filter(i => i.severity === g.key);
        return (
          <div key={g.key} className="bg-white border border-[#d2d2d7] rounded-[12px] overflow-hidden">
            <AccordionHeader g={g} isOpen={isOpen} onClick={() => setOpenSev(isOpen ? null : g.key)} />
            <div style={{ maxHeight: isOpen ? 600 : 0, overflow: 'hidden', transition: 'max-height 0.3s ease' }}>
              <div className="px-4 pb-3 space-y-1.5">
                {items.map(issue => (
                  <div key={issue.id} className="flex items-start gap-3 rounded-[8px] p-3 hover:bg-[#fafafa] transition-colors cursor-pointer"
                    style={{ borderLeft: `3px solid ${sevColors[issue.severity].bg}` }}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[13px] text-[#1d1d1f] font-medium">{issue.title}</span>
                        <SevBadge severity={issue.severity} />
                        {issue.autoFix && <span className="text-[10px] text-[#0071e3] bg-[#0071e3]/10 px-1.5 py-0.5 rounded-full">auto-fix</span>}
                      </div>
                      <p className="text-[11px] text-[#86868b] mt-1">📍 {issue.location}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <ActionButtons issue={issue} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ────────────────────────────────────────────
// 4: Two-Line Dense — Title + actions on one line, location below
// ────────────────────────────────────────────
function Design4() {
  const [openSev, setOpenSev] = useState<string | null>('high');
  return (
    <div className="space-y-2">
      {groups.map(g => {
        const isOpen = openSev === g.key;
        const items = mockIssues.filter(i => i.severity === g.key);
        return (
          <div key={g.key} className="bg-white border border-[#d2d2d7] rounded-[12px] overflow-hidden">
            <AccordionHeader g={g} isOpen={isOpen} onClick={() => setOpenSev(isOpen ? null : g.key)} />
            <div style={{ maxHeight: isOpen ? 600 : 0, overflow: 'hidden', transition: 'max-height 0.3s ease' }}>
              <div className="border-t border-[#f0f0f2]">
                {items.map((issue, idx) => (
                  <div key={issue.id} className={`px-4 py-2.5 hover:bg-[#fafafa] transition-colors ${idx > 0 ? 'border-t border-[#f0f0f2]' : ''}`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <IssueIcon category={issue.category} />
                        <span className="text-[13px] text-[#1d1d1f] font-medium truncate">{issue.title}</span>
                        <SevBadge severity={issue.severity} />
                        {issue.autoFix && <span className="text-[10px] text-[#0071e3] bg-[#0071e3]/10 px-1.5 py-0.5 rounded-full flex-shrink-0">auto-fix</span>}
                      </div>
                      <div className="flex-shrink-0">
                        <ActionButtons issue={issue} />
                      </div>
                    </div>
                    <p className="text-[11px] text-[#86868b] mt-1 pl-10">📍 {issue.location} — {issue.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ────────────────────────────────────────────
// 5: Tinted Background — Severity-tinted cards inside accordion
// ────────────────────────────────────────────
function Design5() {
  const [openSev, setOpenSev] = useState<string | null>('high');
  const sevBg = { high: 'rgba(255,59,48,0.04)', medium: 'rgba(255,149,0,0.04)', low: 'rgba(255,204,0,0.04)' };
  return (
    <div className="space-y-2">
      {groups.map(g => {
        const isOpen = openSev === g.key;
        const items = mockIssues.filter(i => i.severity === g.key);
        return (
          <div key={g.key} className="bg-white border border-[#d2d2d7] rounded-[12px] overflow-hidden">
            <AccordionHeader g={g} isOpen={isOpen} onClick={() => setOpenSev(isOpen ? null : g.key)} />
            <div style={{ maxHeight: isOpen ? 700 : 0, overflow: 'hidden', transition: 'max-height 0.3s ease' }}>
              <div className="px-3 pb-3 space-y-2">
                {items.map(issue => (
                  <div key={issue.id} className="rounded-[10px] p-3 border border-[#e5e5e7] hover:border-[#0071e3] transition-colors cursor-pointer"
                    style={{ background: sevBg[issue.severity as keyof typeof sevBg] }}>
                    <div className="flex items-start gap-3">
                      <IssueIcon category={issue.category} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[13px] text-[#1d1d1f] font-medium">{issue.title}</span>
                          <SevBadge severity={issue.severity} />
                          {issue.autoFix && <span className="text-[10px] text-[#0071e3] bg-[#0071e3]/10 px-1.5 py-0.5 rounded-full">auto-fix</span>}
                        </div>
                        <p className="text-[11px] text-[#86868b] mt-1">📍 {issue.location}</p>
                      </div>
                    </div>
                    <div className="mt-2.5 pl-10">
                      <ActionButtons issue={issue} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ────────────────────────────────────────────
// 6: Split Actions — Description left, actions right-aligned
// ────────────────────────────────────────────
function Design6() {
  const [openSev, setOpenSev] = useState<string | null>('high');
  return (
    <div className="space-y-2">
      {groups.map(g => {
        const isOpen = openSev === g.key;
        const items = mockIssues.filter(i => i.severity === g.key);
        return (
          <div key={g.key} className="bg-white border border-[#d2d2d7] rounded-[12px] overflow-hidden">
            <AccordionHeader g={g} isOpen={isOpen} onClick={() => setOpenSev(isOpen ? null : g.key)} />
            <div style={{ maxHeight: isOpen ? 600 : 0, overflow: 'hidden', transition: 'max-height 0.3s ease' }}>
              <div className="px-4 pb-3">
                {items.map((issue, idx) => (
                  <div key={issue.id} className={`flex items-center gap-4 py-3 ${idx > 0 ? 'border-t border-[#f0f0f2]' : ''}`}>
                    <IssueIcon category={issue.category} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[13px] text-[#1d1d1f] font-medium">{issue.title}</span>
                        <SevBadge severity={issue.severity} />
                        {issue.autoFix && <span className="text-[10px] text-[#0071e3] bg-[#0071e3]/10 px-1.5 py-0.5 rounded-full">auto-fix</span>}
                      </div>
                      <p className="text-[11px] text-[#86868b] mt-0.5">{issue.description}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <ActionButtons issue={issue} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ────────────────────────────────────────────
// 7: Action Footer Bar — Issue info top, action bar bottom
// ────────────────────────────────────────────
function Design7() {
  const [openSev, setOpenSev] = useState<string | null>('high');
  return (
    <div className="space-y-2">
      {groups.map(g => {
        const isOpen = openSev === g.key;
        const items = mockIssues.filter(i => i.severity === g.key);
        return (
          <div key={g.key} className="bg-white border border-[#d2d2d7] rounded-[12px] overflow-hidden">
            <AccordionHeader g={g} isOpen={isOpen} onClick={() => setOpenSev(isOpen ? null : g.key)} />
            <div style={{ maxHeight: isOpen ? 700 : 0, overflow: 'hidden', transition: 'max-height 0.3s ease' }}>
              <div className="px-3 pb-3 space-y-2">
                {items.map(issue => (
                  <div key={issue.id} className="border border-[#d2d2d7] rounded-[10px] overflow-hidden hover:border-[#0071e3] transition-colors cursor-pointer">
                    {/* Info section */}
                    <div className="p-3 flex items-start gap-3">
                      <IssueIcon category={issue.category} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[13px] text-[#1d1d1f] font-medium">{issue.title}</span>
                          <SevBadge severity={issue.severity} />
                          {issue.autoFix && <span className="text-[10px] text-[#0071e3] bg-[#0071e3]/10 px-1.5 py-0.5 rounded-full">auto-fix</span>}
                        </div>
                        <p className="text-[11px] text-[#86868b] mt-1">📍 {issue.location}</p>
                      </div>
                    </div>
                    {/* Action footer */}
                    <div className="px-3 py-2 bg-[#fafafa] border-t border-[#f0f0f2]">
                      <ActionButtons issue={issue} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ────────────────────────────────────────────
// 8: Minimal Flat — Ultra-clean, no borders on items, just spacing
// ────────────────────────────────────────────
function Design8() {
  const [openSev, setOpenSev] = useState<string | null>('high');
  return (
    <div className="space-y-2">
      {groups.map(g => {
        const isOpen = openSev === g.key;
        const items = mockIssues.filter(i => i.severity === g.key);
        return (
          <div key={g.key} className="bg-white border border-[#d2d2d7] rounded-[12px] overflow-hidden">
            <AccordionHeader g={g} isOpen={isOpen} onClick={() => setOpenSev(isOpen ? null : g.key)} />
            <div style={{ maxHeight: isOpen ? 600 : 0, overflow: 'hidden', transition: 'max-height 0.3s ease' }}>
              <div className="px-4 pb-4 space-y-4">
                {items.map(issue => (
                  <div key={issue.id} className="cursor-pointer group">
                    <div className="flex items-start gap-3">
                      <IssueIcon category={issue.category} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="text-[13px] text-[#1d1d1f] font-medium group-hover:text-[#0071e3] transition-colors">{issue.title}</span>
                          <SevBadge severity={issue.severity} />
                          {issue.autoFix && <span className="text-[10px] text-[#0071e3] bg-[#0071e3]/10 px-1.5 py-0.5 rounded-full">auto-fix</span>}
                        </div>
                        <p className="text-[11px] text-[#86868b]">{issue.description} · {issue.location}</p>
                        <div className="mt-2">
                          <ActionButtons issue={issue} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ────────────────────────────────────────────
// 9: Sandstone Cards — Inner cards on sandstone bg
// ────────────────────────────────────────────
function Design9() {
  const [openSev, setOpenSev] = useState<string | null>('high');
  return (
    <div className="space-y-2">
      {groups.map(g => {
        const isOpen = openSev === g.key;
        const items = mockIssues.filter(i => i.severity === g.key);
        return (
          <div key={g.key} className="bg-white border border-[#d2d2d7] rounded-[12px] overflow-hidden">
            <AccordionHeader g={g} isOpen={isOpen} onClick={() => setOpenSev(isOpen ? null : g.key)} />
            <div style={{ maxHeight: isOpen ? 700 : 0, overflow: 'hidden', transition: 'max-height 0.3s ease' }}>
              <div className="p-3 space-y-2" style={{ background: '#EEECE8' }}>
                {items.map(issue => (
                  <div key={issue.id} className="bg-white rounded-[10px] p-3 border border-[#d2d2d7] hover:border-[#0071e3] transition-colors cursor-pointer">
                    <div className="flex items-start gap-3">
                      <IssueIcon category={issue.category} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[13px] text-[#1d1d1f] font-medium">{issue.title}</span>
                          <SevBadge severity={issue.severity} />
                          {issue.autoFix && <span className="text-[10px] text-[#0071e3] bg-[#0071e3]/10 px-1.5 py-0.5 rounded-full">auto-fix</span>}
                        </div>
                        <p className="text-[11px] text-[#86868b] mt-1">📍 {issue.location}</p>
                      </div>
                    </div>
                    <div className="mt-2.5 pl-10">
                      <ActionButtons issue={issue} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ────────────────────────────────────────────
// 10: Tight Grid — Two-column layout with actions below
// ────────────────────────────────────────────
function Design10() {
  const [openSev, setOpenSev] = useState<string | null>('high');
  return (
    <div className="space-y-2">
      {groups.map(g => {
        const isOpen = openSev === g.key;
        const items = mockIssues.filter(i => i.severity === g.key);
        return (
          <div key={g.key} className="bg-white border border-[#d2d2d7] rounded-[12px] overflow-hidden">
            <AccordionHeader g={g} isOpen={isOpen} onClick={() => setOpenSev(isOpen ? null : g.key)} />
            <div style={{ maxHeight: isOpen ? 700 : 0, overflow: 'hidden', transition: 'max-height 0.3s ease' }}>
              <div className="px-3 pb-3 grid grid-cols-2 gap-2">
                {items.map(issue => (
                  <div key={issue.id} className="border border-[#d2d2d7] rounded-[10px] p-3 hover:border-[#0071e3] transition-colors cursor-pointer flex flex-col">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <SevBadge severity={issue.severity} />
                      {issue.autoFix && <span className="text-[10px] text-[#0071e3] bg-[#0071e3]/10 px-1.5 py-0.5 rounded-full">auto-fix</span>}
                    </div>
                    <p className="text-[13px] text-[#1d1d1f] font-medium leading-tight">{issue.title}</p>
                    <p className="text-[10px] text-[#86868b] mt-1 mb-2">📍 {issue.location}</p>
                    <div className="mt-auto">
                      <ActionButtons issue={issue} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═════════════════════════════════════════════
// PICKER
// ═════════════════════════════════════════════
export function IssuesLayoutPicker({ onSelect }: { onSelect?: (design: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);

  const designs = [
    { key: '1', label: 'Compact Rows', desc: 'No inner cards — clean divider lines, actions right-aligned', component: <Design1 /> },
    { key: '2', label: 'Padded Cards', desc: 'Generous spacing, bordered inner cards, description visible', component: <Design2 /> },
    { key: '3', label: 'Color Striped', desc: 'Left border accent per severity, no inner card borders', component: <Design3 /> },
    { key: '4', label: 'Two-Line Dense', desc: 'Title + actions on one row, details below', component: <Design4 /> },
    { key: '5', label: 'Tinted Background', desc: 'Severity-tinted cards — subtle color fills', component: <Design5 /> },
    { key: '6', label: 'Split Actions', desc: 'Info left, actions right — balanced two-column feel', component: <Design6 /> },
    { key: '7', label: 'Action Footer', desc: 'Issue info top, action bar in gray footer strip', component: <Design7 /> },
    { key: '8', label: 'Minimal Flat', desc: 'Ultra-clean — no inner borders, just spacing and hover', component: <Design8 /> },
    { key: '9', label: 'Sandstone Cards', desc: 'White cards on sandstone background — app-consistent', component: <Design9 /> },
    { key: '10', label: 'Two-Column Grid', desc: 'Compact grid layout — 2 cards per row', component: <Design10 /> },
  ];

  return (
    <div className="min-h-screen bg-[#EEECE8] p-6">
      <div className="max-w-[520px] mx-auto">
        <h1 className="text-[24px] font-bold text-[#1d1d1f] mb-1">Issues Layout Options</h1>
        <p className="text-[14px] text-[#636366] mb-6">10 variations of the severity accordion — each with different spacing and visual balance. All use existing color scheme.</p>

        <div className="space-y-6">
          {designs.map(({ key, label, desc, component }) => (
            <div key={key}>
              <button
                onClick={() => { setSelected(key); onSelect?.(key); }}
                className={`w-full text-left transition-all rounded-xl ${selected === key ? 'ring-2 ring-[#0071e3] ring-offset-2 ring-offset-[#EEECE8]' : ''}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                    selected === key ? 'bg-[#0071e3] border-[#0071e3] text-white' : 'border-[#d2d2d7] text-[#636366]'
                  }`}>
                    {key}
                  </div>
                  <div>
                    <span className="text-[13px] font-semibold text-[#1d1d1f]">{label}</span>
                    <span className="text-[11px] text-[#86868b] ml-2">{desc}</span>
                  </div>
                </div>
                {component}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
