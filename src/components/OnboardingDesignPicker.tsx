import { useState } from "react";
import { createPortal } from "react-dom";
import { X, Map, Compass, ChevronRight, HelpCircle, Sparkles, BookOpen, Bot, MessageCircle, Lightbulb, ArrowRight, Zap } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════
   10 Dropdown Menu Variations
   ═══════════════════════════════════════════════════════════════════════ */

/* 1 — Clean minimal with icons */
function Design1({ onClose }: { onClose: () => void }) {
  return (
    <Wrapper label="1: Minimal + Icons" desc="Clean menu with colored icons." onClose={onClose}>
      <div style={{ width: 220, backgroundColor: "#fff", borderRadius: 10, boxShadow: "0 8px 30px rgba(0,0,0,0.15)", border: "1px solid #e5e5ea", overflow: "hidden" }}>
        {[
          { icon: <Compass style={{ width: 16, height: 16, color: "#0071e3" }} />, label: "Take a Tour" },
          { icon: <BookOpen style={{ width: 16, height: 16, color: "#f5a623" }} />, label: "FAQ" },
          { icon: <Bot style={{ width: 16, height: 16, color: "#34c759" }} />, label: "Ask AI" },
        ].map((item, i) => (
          <div key={i} style={{ padding: "12px 16px", fontSize: 14, fontWeight: 500, color: "#1d1d1f", cursor: "pointer", borderBottom: i < 2 ? "1px solid #f2f2f7" : "none", display: "flex", alignItems: "center", gap: 10 }}>
            {item.icon} {item.label}
          </div>
        ))}
      </div>
    </Wrapper>
  );
}

/* 2 — Icons + descriptions, vertical list */
function Design2({ onClose }: { onClose: () => void }) {
  return (
    <Wrapper label="2: Icons + Descriptions" desc="Icon, label, and one-line description per item." onClose={onClose}>
      <div style={{ width: 260, backgroundColor: "#fff", borderRadius: 12, boxShadow: "0 8px 30px rgba(0,0,0,0.15)", border: "1px solid #e5e5ea", overflow: "hidden" }}>
        {[
          { icon: <Compass style={{ width: 16, height: 16, color: "#0071e3" }} />, label: "Take a Tour", desc: "Interactive walkthrough" },
          { icon: <HelpCircle style={{ width: 16, height: 16, color: "#f5a623" }} />, label: "FAQ", desc: "Common questions" },
          { icon: <Sparkles style={{ width: 16, height: 16, color: "#34c759" }} />, label: "Ask AI", desc: "Get instant answers" },
        ].map((item, i) => (
          <div key={i} style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, borderBottom: i < 2 ? "1px solid #f2f2f7" : "none", cursor: "pointer" }}>
            {item.icon}
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#1d1d1f" }}>{item.label}</div>
              <div style={{ fontSize: 12, color: "#636366" }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </Wrapper>
  );
}

/* 3 — Colored icon circles, chevrons */
function Design3({ onClose }: { onClose: () => void }) {
  return (
    <Wrapper label="3: Colored Circles" desc="Round colored icon badges with chevrons." onClose={onClose}>
      <div style={{ width: 270, backgroundColor: "#fff", borderRadius: 14, boxShadow: "0 8px 30px rgba(0,0,0,0.15)", border: "1px solid #e5e5ea", padding: 8 }}>
        {[
          { icon: <Compass style={{ width: 16, height: 16 }} />, bg: "#0071e3", label: "Take a Tour", desc: "Step-by-step guide" },
          { icon: <BookOpen style={{ width: 16, height: 16 }} />, bg: "#f5a623", label: "FAQ", desc: "Quick answers" },
          { icon: <Bot style={{ width: 16, height: 16 }} />, bg: "#34c759", label: "Ask AI", desc: "AI-powered help" },
        ].map((item, i) => (
          <div key={i} style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: 12, borderRadius: 10, cursor: "pointer" }}>
            <div style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: item.bg, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>{item.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#1d1d1f" }}>{item.label}</div>
              <div style={{ fontSize: 12, color: "#636366" }}>{item.desc}</div>
            </div>
            <ChevronRight style={{ width: 14, height: 14, color: "#c7c7cc" }} />
          </div>
        ))}
      </div>
    </Wrapper>
  );
}

/* 4 — Horizontal icon row (icon-only with labels below) */
function Design4({ onClose }: { onClose: () => void }) {
  return (
    <Wrapper label="4: Horizontal Icons" desc="Three icons side-by-side with labels underneath." onClose={onClose}>
      <div style={{ width: 280, backgroundColor: "#fff", borderRadius: 14, boxShadow: "0 8px 30px rgba(0,0,0,0.15)", border: "1px solid #e5e5ea", padding: "20px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          {[
            { icon: <Compass style={{ width: 22, height: 22 }} />, bg: "#0071e3", label: "Tour" },
            { icon: <BookOpen style={{ width: 22, height: 22 }} />, bg: "#f5a623", label: "FAQ" },
            { icon: <Sparkles style={{ width: 22, height: 22 }} />, bg: "#34c759", label: "AI Help" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: item.bg, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>{item.icon}</div>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#1d1d1f" }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </Wrapper>
  );
}

/* 5 — Card style with subtle backgrounds */
function Design5({ onClose }: { onClose: () => void }) {
  return (
    <Wrapper label="5: Tinted Cards" desc="Each option has a tinted background card." onClose={onClose}>
      <div style={{ width: 280, backgroundColor: "#fff", borderRadius: 14, boxShadow: "0 8px 30px rgba(0,0,0,0.15)", border: "1px solid #e5e5ea", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          { icon: <Compass style={{ width: 18, height: 18, color: "#0071e3" }} />, bg: "#0071e3", tint: "rgba(0,113,227,0.08)", label: "Take a Tour" },
          { icon: <BookOpen style={{ width: 18, height: 18, color: "#f5a623" }} />, bg: "#f5a623", tint: "rgba(245,166,35,0.08)", label: "FAQ" },
          { icon: <Sparkles style={{ width: 18, height: 18, color: "#34c759" }} />, bg: "#34c759", tint: "rgba(52,199,89,0.08)", label: "Ask AI" },
        ].map((item, i) => (
          <div key={i} style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, borderRadius: 10, backgroundColor: item.tint, cursor: "pointer" }}>
            {item.icon}
            <span style={{ fontSize: 14, fontWeight: 600, color: "#1d1d1f" }}>{item.label}</span>
            <ArrowRight style={{ width: 14, height: 14, color: "#c7c7cc", marginLeft: "auto" }} />
          </div>
        ))}
      </div>
    </Wrapper>
  );
}

/* 6 — Dark dropdown matching header */
function Design6({ onClose }: { onClose: () => void }) {
  return (
    <Wrapper label="6: Dark Theme" desc="Matches the dark header. Feels native to the app." onClose={onClose}>
      <div style={{ width: 240, backgroundColor: "#2c2c2e", borderRadius: 12, boxShadow: "0 8px 30px rgba(0,0,0,0.3)", overflow: "hidden" }}>
        {[
          { icon: <Compass style={{ width: 16, height: 16, color: "#0071e3" }} />, label: "Take a Tour" },
          { icon: <BookOpen style={{ width: 16, height: 16, color: "#f5a623" }} />, label: "FAQ" },
          { icon: <Sparkles style={{ width: 16, height: 16, color: "#34c759" }} />, label: "Ask AI" },
        ].map((item, i) => (
          <div key={i} style={{ padding: "13px 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.08)" : "none", cursor: "pointer" }}>
            {item.icon}
            <span style={{ fontSize: 14, fontWeight: 500, color: "#fff" }}>{item.label}</span>
          </div>
        ))}
      </div>
    </Wrapper>
  );
}

/* 7 — Grouped with section header */
function Design7({ onClose }: { onClose: () => void }) {
  return (
    <Wrapper label="7: Grouped Sections" desc="'Learn' and 'Get Help' groupings with a header." onClose={onClose}>
      <div style={{ width: 240, backgroundColor: "#fff", borderRadius: 12, boxShadow: "0 8px 30px rgba(0,0,0,0.15)", border: "1px solid #e5e5ea", overflow: "hidden" }}>
        <div style={{ padding: "10px 16px 4px" }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#636366", textTransform: "uppercase", letterSpacing: "0.05em" }}>Learn</span>
        </div>
        {[
          { icon: <Compass style={{ width: 15, height: 15, color: "#0071e3" }} />, label: "Take a Tour" },
          { icon: <BookOpen style={{ width: 15, height: 15, color: "#f5a623" }} />, label: "FAQ" },
        ].map((item, i) => (
          <div key={i} style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            {item.icon}
            <span style={{ fontSize: 14, fontWeight: 500, color: "#1d1d1f" }}>{item.label}</span>
          </div>
        ))}
        <div style={{ margin: "4px 16px", borderTop: "1px solid #e5e5ea" }} />
        <div style={{ padding: "8px 16px 4px" }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#636366", textTransform: "uppercase", letterSpacing: "0.05em" }}>Get Help</span>
        </div>
        <div style={{ padding: "10px 16px 14px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <Sparkles style={{ width: 15, height: 15, color: "#34c759" }} />
          <span style={{ fontSize: 14, fontWeight: 500, color: "#1d1d1f" }}>Ask AI</span>
        </div>
      </div>
    </Wrapper>
  );
}

/* 8 — Wide with inline AI input */
function Design8({ onClose }: { onClose: () => void }) {
  return (
    <Wrapper label="8: Wide + AI Input" desc="Tour and FAQ as buttons, AI input right there." onClose={onClose}>
      <div style={{ width: 320, backgroundColor: "#fff", borderRadius: 14, boxShadow: "0 8px 30px rgba(0,0,0,0.15)", border: "1px solid #e5e5ea", padding: 16 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 0", borderRadius: 10, border: "1px solid #d2d2d7", fontSize: 13, fontWeight: 600, color: "#1d1d1f", cursor: "pointer" }}>
            <Compass style={{ width: 14, height: 14, color: "#0071e3" }} /> Tour
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 0", borderRadius: 10, border: "1px solid #d2d2d7", fontSize: 13, fontWeight: 600, color: "#1d1d1f", cursor: "pointer" }}>
            <BookOpen style={{ width: 14, height: 14, color: "#f5a623" }} /> FAQ
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input type="text" placeholder="Ask AI anything..." style={{ flex: 1, padding: "9px 12px", borderRadius: 10, border: "1px solid #d2d2d7", fontSize: 13, outline: "none" }} />
          <button style={{ padding: "9px 12px", borderRadius: 10, backgroundColor: "#34c759", color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}>
            <Sparkles style={{ width: 14, height: 14 }} />
          </button>
        </div>
      </div>
    </Wrapper>
  );
}

/* 9 — Pill buttons row */
function Design9({ onClose }: { onClose: () => void }) {
  return (
    <Wrapper label="9: Pill Buttons" desc="Three pill-shaped buttons in a compact row." onClose={onClose}>
      <div style={{ width: 340, backgroundColor: "#fff", borderRadius: 14, boxShadow: "0 8px 30px rgba(0,0,0,0.15)", border: "1px solid #e5e5ea", padding: "16px 14px", display: "flex", gap: 8 }}>
        {[
          { icon: <Compass style={{ width: 14, height: 14 }} />, bg: "#0071e3", label: "Tour" },
          { icon: <BookOpen style={{ width: 14, height: 14 }} />, bg: "#f5a623", label: "FAQ" },
          { icon: <Sparkles style={{ width: 14, height: 14 }} />, bg: "#34c759", label: "Ask AI" },
        ].map((item, i) => (
          <div key={i} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 0", borderRadius: 999, backgroundColor: item.bg, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            {item.icon} {item.label}
          </div>
        ))}
      </div>
    </Wrapper>
  );
}

/* 10 — Compact with badges */
function Design10({ onClose }: { onClose: () => void }) {
  return (
    <Wrapper label="10: Compact + Badges" desc="Tight list with colored dot badges." onClose={onClose}>
      <div style={{ width: 210, backgroundColor: "#fff", borderRadius: 12, boxShadow: "0 8px 30px rgba(0,0,0,0.15)", border: "1px solid #e5e5ea", padding: "6px 0" }}>
        {[
          { color: "#0071e3", label: "Take a Tour", badge: null },
          { color: "#f5a623", label: "FAQ", badge: "5" },
          { color: "#34c759", label: "Ask AI", badge: "New" },
        ].map((item, i) => (
          <div key={i} style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.color, flexShrink: 0 }} />
            <span style={{ fontSize: 14, fontWeight: 500, color: "#1d1d1f", flex: 1 }}>{item.label}</span>
            {item.badge && (
              <span style={{ fontSize: 10, fontWeight: 600, color: "#fff", backgroundColor: item.color, borderRadius: 999, padding: "2px 7px" }}>{item.badge}</span>
            )}
          </div>
        ))}
      </div>
    </Wrapper>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Shared wrapper — shows Guide button with dropdown below
   ═══════════════════════════════════════════════════════════════════════ */
function Wrapper({ label, desc, onClose, children }: { label: string; desc: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="onboarding-dialog-title" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      {/* Title */}
      <div style={{ backgroundColor: "#fff", borderRadius: 10, padding: "8px 16px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <h2 id="onboarding-dialog-title" style={{ fontSize: 14, fontWeight: 700, color: "#1d1d1f", margin: 0 }}>{label}</h2>
        <span style={{ fontSize: 12, color: "#636366" }}>{desc}</span>
      </div>

      {/* Simulated header strip with button + dropdown */}
      <div style={{ backgroundColor: "#1c1917", borderRadius: 16, padding: "16px 32px 0", display: "flex", flexDirection: "column", alignItems: "flex-end", minWidth: 420 }}>
        {/* Fake Guide button */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.3)", color: "#fff", fontSize: 15, marginBottom: 8 }}>
          <Map style={{ width: 16, height: 16 }} />
          Guide
        </div>
        {/* Dropdown — positioned naturally below button */}
        <div style={{ marginBottom: -1, paddingBottom: 16 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Picker Shell
   ═══════════════════════════════════════════════════════════════════════ */
const DESIGNS = [
  { key: "1", Component: Design1 },
  { key: "2", Component: Design2 },
  { key: "3", Component: Design3 },
  { key: "4", Component: Design4 },
  { key: "5", Component: Design5 },
  { key: "6", Component: Design6 },
  { key: "7", Component: Design7 },
  { key: "8", Component: Design8 },
  { key: "9", Component: Design9 },
  { key: "10", Component: Design10 },
] as const;

interface OnboardingDesignPickerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingDesignPicker({ isOpen, onClose }: OnboardingDesignPickerProps) {
  const [activeDesign, setActiveDesign] = useState(0);

  if (!isOpen) return null;

  const { Component } = DESIGNS[activeDesign];

  return createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 60000, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)" }}>
      {/* Switcher bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16, padding: "8px 12px", backgroundColor: "#1c1917", borderRadius: 12, flexWrap: "wrap", justifyContent: "center" }}>
        {DESIGNS.map((d, i) => (
          <button
            key={d.key}
            onClick={() => setActiveDesign(i)}
            style={{ padding: "6px 12px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", backgroundColor: activeDesign === i ? "#0071e3" : "transparent", color: activeDesign === i ? "#fff" : "rgba(255,255,255,0.6)" }}
          >
            {d.key}
          </button>
        ))}
      </div>

      <Component onClose={onClose} />
    </div>,
    document.body
  );
}
