import { useState } from "react";

// ─────────────────────────────────────────────────────────────
// 10 Analytics Tab Design Directions
// Solving: identity colors vs score colors clash
// ─────────────────────────────────────────────────────────────

// Sample data
const standards = [
  { name: "CVC-OEI", score: 50, color: "#F97316", bgColor: "rgba(249,115,22,0.12)", borderColor: "rgba(249,115,22,0.35)" },
  { name: "Peralta", score: 60, color: "#22C55E", bgColor: "rgba(34,197,94,0.12)", borderColor: "rgba(34,197,94,0.4)" },
  { name: "QM", score: 60, color: "#3B82F6", bgColor: "rgba(59,130,246,0.12)", borderColor: "rgba(59,130,246,0.4)" },
];

const gauges = [
  { label: "Statewide Compliance", score: 90, issues: 5 },
  { label: "Accessibility", score: 80, issues: 2 },
  { label: "Usability", score: 100, issues: 0 },
];

// Score quality helpers
const getScoreLabel = (s: number) => s >= 85 ? "Good" : s >= 60 ? "Needs Work" : "Critical";
const getScoreIcon = (s: number) => s >= 85 ? "✓" : s >= 60 ? "⚠" : "✕";
const getScoreColor = (s: number) => s >= 85 ? "#22C55E" : s >= 60 ? "#F59E0B" : "#EF4444";
const getLetterGrade = (s: number) => s >= 90 ? "A" : s >= 80 ? "B" : s >= 70 ? "C" : s >= 60 ? "D" : "F";

// ─── Shared gauge SVG ───
function SemiGauge({ score, color, size = 140 }: { score: number; color: string; size?: number }) {
  const w = size;
  const h = size * 0.62;
  const cx = w / 2;
  const cy = h - 8;
  const r = (w / 2) - 20;
  const arcLen = Math.PI * r;
  const offset = arcLen - (arcLen * score) / 100;
  return (
    <div style={{ position: "relative", width: w, height: h }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} stroke="#EEECE8" strokeWidth={20} fill="none" strokeLinecap="butt" />
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} stroke={color} strokeWidth={20} fill="none" strokeLinecap="butt"
          strokeDasharray={arcLen} strokeDashoffset={offset} />
      </svg>
      <div style={{ position: "absolute", bottom: 4, left: 0, right: 0, textAlign: "center" }}>
        <span style={{ fontSize: 32, fontWeight: 600, color: "#1d1d1f" }}>{score}</span>
      </div>
    </div>
  );
}

// ─── Horizontal bar ───
function HBar({ score, color, height = 8 }: { score: number; color: string; height?: number }) {
  return (
    <div style={{ width: "100%", height, backgroundColor: "#EEECE8", borderRadius: height / 2, overflow: "hidden" }}>
      <div style={{ width: `${score}%`, height: "100%", backgroundColor: color, borderRadius: height / 2 }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DESIGN 1: Icon Indicators + Monochrome Gauges
// Pills keep identity colors, score quality shown via icon (✓/⚠/✕)
// All gauges use single blue color
// ═══════════════════════════════════════════════════════════════
function Design1() {
  return (
    <div style={{ maxWidth: 778 }}>
      {/* Standards */}
      <div style={{ background: "#fff", border: "1px solid #d2d2d7", borderRadius: 16, padding: "16px 24px", display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
        <span style={{ fontSize: 15, fontWeight: 500, color: "#1d1d1f" }}>Standards Met:</span>
        {standards.map((s) => (
          <div key={s.name} style={{ padding: "6px 14px", borderRadius: 20, backgroundColor: s.bgColor, border: `1px solid ${s.borderColor}`, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#1d1d1f" }}>{s.name}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#1d1d1f" }}>{s.score}%</span>
            <span style={{ fontSize: 14, color: getScoreColor(s.score) }}>{getScoreIcon(s.score)}</span>
          </div>
        ))}
      </div>
      {/* Gauges — all blue */}
      <div style={{ background: "#fff", border: "1px solid #d2d2d7", borderRadius: 16, padding: 24 }}>
        <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Usability Scorecard</h3>
        <p style={{ fontSize: 14, color: "#636366", marginBottom: 16 }}>Based on 5 issues found</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, textAlign: "center" }}>
          {gauges.map((g) => (
            <div key={g.label}>
              <SemiGauge score={g.score} color="#3b82f6" />
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{g.label}</div>
              <div style={{ fontSize: 13, color: "#636366" }}>{g.issues} issues</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DESIGN 2: Score-Colored Gauges + Plain Score Text on Pills
// Gauges change color based on score (good=green, ok=amber, bad=red)
// Pills show score as neutral dark text — identity color only on pill bg
// ═══════════════════════════════════════════════════════════════
function Design2() {
  return (
    <div style={{ maxWidth: 778 }}>
      <div style={{ background: "#fff", border: "1px solid #d2d2d7", borderRadius: 16, padding: "16px 24px", display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
        <span style={{ fontSize: 15, fontWeight: 500, color: "#1d1d1f" }}>Standards Met:</span>
        {standards.map((s) => (
          <div key={s.name} style={{ padding: "6px 14px", borderRadius: 20, backgroundColor: s.bgColor, border: `1px solid ${s.borderColor}`, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#1d1d1f" }}>{s.name}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#1d1d1f" }}>{s.score}%</span>
          </div>
        ))}
      </div>
      <div style={{ background: "#fff", border: "1px solid #d2d2d7", borderRadius: 16, padding: 24 }}>
        <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Usability Scorecard</h3>
        <p style={{ fontSize: 14, color: "#636366", marginBottom: 16 }}>Based on 5 issues found</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, textAlign: "center" }}>
          {gauges.map((g) => (
            <div key={g.label}>
              <SemiGauge score={g.score} color={getScoreColor(g.score)} />
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{g.label}</div>
              <div style={{ fontSize: 13, color: "#636366" }}>{g.issues} issues</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DESIGN 3: Progress Bar Pills + Slate Gauges
// Pills have mini progress bars inside, identity color fills the bar
// Gauges are all slate gray — clean and neutral
// ═══════════════════════════════════════════════════════════════
function Design3() {
  return (
    <div style={{ maxWidth: 778 }}>
      <div style={{ background: "#fff", border: "1px solid #d2d2d7", borderRadius: 16, padding: "16px 24px", display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
        <span style={{ fontSize: 15, fontWeight: 500, color: "#1d1d1f" }}>Standards Met:</span>
        {standards.map((s) => (
          <div key={s.name} style={{ padding: "8px 14px", borderRadius: 12, backgroundColor: "#EEECE8", border: "1px solid #e5e5e7", minWidth: 120 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#1d1d1f" }}>{s.name}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#1d1d1f" }}>{s.score}%</span>
            </div>
            <HBar score={s.score} color={s.color} height={6} />
          </div>
        ))}
      </div>
      <div style={{ background: "#fff", border: "1px solid #d2d2d7", borderRadius: 16, padding: 24 }}>
        <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Usability Scorecard</h3>
        <p style={{ fontSize: 14, color: "#636366", marginBottom: 16 }}>Based on 5 issues found</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, textAlign: "center" }}>
          {gauges.map((g) => (
            <div key={g.label}>
              <SemiGauge score={g.score} color="#64748B" />
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{g.label}</div>
              <div style={{ fontSize: 13, color: "#636366" }}>{g.issues} issues</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DESIGN 4: Opacity Fill Pills + Score-Tinted Gauges
// Pills use identity color at varying opacity based on score
// Higher score = more filled/opaque. Gauges tinted by score color
// ═══════════════════════════════════════════════════════════════
function Design4() {
  return (
    <div style={{ maxWidth: 778 }}>
      <div style={{ background: "#fff", border: "1px solid #d2d2d7", borderRadius: 16, padding: "16px 24px", display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
        <span style={{ fontSize: 15, fontWeight: 500, color: "#1d1d1f" }}>Standards Met:</span>
        {standards.map((s) => {
          const opacity = 0.15 + (s.score / 100) * 0.45;
          return (
            <div key={s.name} style={{ padding: "6px 14px", borderRadius: 20, position: "relative", overflow: "hidden", border: `1px solid ${s.borderColor}` }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${s.score}%`, backgroundColor: s.color, opacity }} />
              <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#1d1d1f" }}>{s.name}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#1d1d1f" }}>{s.score}%</span>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ background: "#fff", border: "1px solid #d2d2d7", borderRadius: 16, padding: 24 }}>
        <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Usability Scorecard</h3>
        <p style={{ fontSize: 14, color: "#636366", marginBottom: 16 }}>Based on 5 issues found</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, textAlign: "center" }}>
          {gauges.map((g) => (
            <div key={g.label}>
              <SemiGauge score={g.score} color={getScoreColor(g.score)} />
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{g.label}</div>
              <div style={{ fontSize: 12, color: getScoreColor(g.score), fontWeight: 600 }}>{getScoreLabel(g.score)}</div>
              <div style={{ fontSize: 13, color: "#636366" }}>{g.issues} issues</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DESIGN 5: Dot Indicator + Horizontal Bar Gauges
// Pills keep identity colors, small colored dot shows score quality
// Gauges replaced with clean horizontal bars — score colors the bar
// ═══════════════════════════════════════════════════════════════
function Design5() {
  return (
    <div style={{ maxWidth: 778 }}>
      <div style={{ background: "#fff", border: "1px solid #d2d2d7", borderRadius: 16, padding: "16px 24px", display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
        <span style={{ fontSize: 15, fontWeight: 500, color: "#1d1d1f" }}>Standards Met:</span>
        {standards.map((s) => (
          <div key={s.name} style={{ padding: "6px 14px", borderRadius: 20, backgroundColor: s.bgColor, border: `1px solid ${s.borderColor}`, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: getScoreColor(s.score), flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 500, color: "#1d1d1f" }}>{s.name}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#1d1d1f" }}>{s.score}%</span>
          </div>
        ))}
      </div>
      <div style={{ background: "#fff", border: "1px solid #d2d2d7", borderRadius: 16, padding: 24 }}>
        <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Usability Scorecard</h3>
        <p style={{ fontSize: 14, color: "#636366", marginBottom: 20 }}>Based on 5 issues found</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {gauges.map((g) => (
            <div key={g.label}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#1d1d1f" }}>{g.label}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#1d1d1f" }}>{g.score}</span>
                  <span style={{ fontSize: 12, color: "#636366" }}>{g.issues} issues</span>
                </div>
              </div>
              <HBar score={g.score} color={getScoreColor(g.score)} height={10} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DESIGN 6: Letter Grades + Ring Gauges
// Pills show letter grade instead of colored %, neutral text
// Gauges are circular rings, all using score-based color
// ═══════════════════════════════════════════════════════════════
function RingGauge({ score, size = 110 }: { score: number; size?: number }) {
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (circ * score) / 100;
  const color = getScoreColor(score);
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#EEECE8" strokeWidth={10} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={10}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: "#1d1d1f" }}>{score}</span>
      </div>
    </div>
  );
}

function Design6() {
  return (
    <div style={{ maxWidth: 778 }}>
      <div style={{ background: "#fff", border: "1px solid #d2d2d7", borderRadius: 16, padding: "16px 24px", display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
        <span style={{ fontSize: 15, fontWeight: 500, color: "#1d1d1f" }}>Standards Met:</span>
        {standards.map((s) => (
          <div key={s.name} style={{ padding: "6px 14px", borderRadius: 20, backgroundColor: s.bgColor, border: `1px solid ${s.borderColor}`, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#1d1d1f" }}>{s.name}</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#1d1d1f" }}>{getLetterGrade(s.score)}</span>
          </div>
        ))}
      </div>
      <div style={{ background: "#fff", border: "1px solid #d2d2d7", borderRadius: 16, padding: 24 }}>
        <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Usability Scorecard</h3>
        <p style={{ fontSize: 14, color: "#636366", marginBottom: 16 }}>Based on 5 issues found</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, textAlign: "center" }}>
          {gauges.map((g) => (
            <div key={g.label} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <RingGauge score={g.score} />
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 8 }}>{g.label}</div>
              <div style={{ fontSize: 13, color: "#636366" }}>{g.issues} issues</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DESIGN 7: Compact Stat Cards
// No pills — each standard gets its own mini card with identity color accent
// Score shown large, quality shown via subtle background tint
// Gauges also become stat cards — minimal, scannable
// ═══════════════════════════════════════════════════════════════
function Design7() {
  return (
    <div style={{ maxWidth: 778 }}>
      <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Standards Met</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
        {standards.map((s) => (
          <div key={s.name} style={{ background: "#fff", border: "1px solid #d2d2d7", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ height: 4, backgroundColor: s.color }} />
            <div style={{ padding: "14px 16px" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#636366", marginBottom: 4 }}>{s.name}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontSize: 32, fontWeight: 700, color: "#1d1d1f" }}>{s.score}%</span>
                <span style={{ fontSize: 12, color: getScoreColor(s.score), fontWeight: 600 }}>{getScoreLabel(s.score)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Usability Scorecard</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {gauges.map((g) => (
          <div key={g.label} style={{ background: "#fff", border: "1px solid #d2d2d7", borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#636366", marginBottom: 4 }}>{g.label}</div>
            <div style={{ fontSize: 36, fontWeight: 700, color: "#1d1d1f", marginBottom: 2 }}>{g.score}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <HBar score={g.score} color={getScoreColor(g.score)} height={6} />
              <span style={{ fontSize: 11, color: "#636366", whiteSpace: "nowrap" }}>{g.issues} issues</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DESIGN 8: Border-Left Accent + Unified Score Bars
// Pills replaced by rows with left border in identity color
// All scores shown as horizontal bars with score-based coloring
// Everything is a list — very scannable
// ═══════════════════════════════════════════════════════════════
function Design8() {
  const allItems = [
    ...standards.map(s => ({ label: s.name, score: s.score, accent: s.color, issues: null as number | null, section: "standards" })),
    ...gauges.map(g => ({ label: g.label, score: g.score, accent: "#64748B", issues: g.issues, section: "scorecard" })),
  ];
  return (
    <div style={{ maxWidth: 778 }}>
      <div style={{ background: "#fff", border: "1px solid #d2d2d7", borderRadius: 16, padding: 24, marginBottom: 16 }}>
        <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Standards Met</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {allItems.filter(i => i.section === "standards").map((item) => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 16, borderLeft: `4px solid ${item.accent}`, paddingLeft: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#1d1d1f", width: 80 }}>{item.label}</span>
              <div style={{ flex: 1 }}><HBar score={item.score} color={getScoreColor(item.score)} height={10} /></div>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#1d1d1f", width: 40, textAlign: "right" }}>{item.score}%</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: "#fff", border: "1px solid #d2d2d7", borderRadius: 16, padding: 24 }}>
        <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Usability Scorecard</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {allItems.filter(i => i.section === "scorecard").map((item) => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#1d1d1f", width: 160 }}>{item.label}</span>
              <div style={{ flex: 1 }}><HBar score={item.score} color={getScoreColor(item.score)} height={10} /></div>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#1d1d1f", width: 30, textAlign: "right" }}>{item.score}</span>
              <span style={{ fontSize: 12, color: "#636366", width: 60 }}>{item.issues} issues</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DESIGN 9: Pill + Separate Score Dot + All-Blue Gauges
// Identity pills are just labels (no score color). Small score dot below.
// Gauges all use tab blue — category doesn't get a color, only score does
// ═══════════════════════════════════════════════════════════════
function Design9() {
  return (
    <div style={{ maxWidth: 778 }}>
      <div style={{ background: "#fff", border: "1px solid #d2d2d7", borderRadius: 16, padding: "16px 24px", display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
        <span style={{ fontSize: 15, fontWeight: 500, color: "#1d1d1f" }}>Standards Met:</span>
        {standards.map((s) => (
          <div key={s.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ padding: "6px 14px", borderRadius: 20, backgroundColor: s.bgColor, border: `1px solid ${s.borderColor}` }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#1d1d1f" }}>{s.name}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: getScoreColor(s.score) }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: "#636366" }}>{s.score}%</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ background: "#fff", border: "1px solid #d2d2d7", borderRadius: 16, padding: 24 }}>
        <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Usability Scorecard</h3>
        <p style={{ fontSize: 14, color: "#636366", marginBottom: 16 }}>Based on 5 issues found</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, textAlign: "center" }}>
          {gauges.map((g) => (
            <div key={g.label}>
              <SemiGauge score={g.score} color="#3b82f6" />
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{g.label}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 2 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: getScoreColor(g.score) }} />
                <span style={{ fontSize: 12, color: getScoreColor(g.score), fontWeight: 600 }}>{getScoreLabel(g.score)}</span>
              </div>
              <div style={{ fontSize: 13, color: "#636366" }}>{g.issues} issues</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DESIGN 10: Everything Unified
// Single container. Standards as mini bars at top.
// Gauges below as score-colored rings. Minimal, cohesive.
// ═══════════════════════════════════════════════════════════════
function Design10() {
  return (
    <div style={{ maxWidth: 778, background: "#fff", border: "1px solid #d2d2d7", borderRadius: 16, padding: 24 }}>
      {/* Standards section */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#636366", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Standards Met</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {standards.map((s) => (
            <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 4, height: 32, backgroundColor: s.color, borderRadius: 2 }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{s.score}%</span>
                </div>
                <HBar score={s.score} color={getScoreColor(s.score)} height={5} />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Divider */}
      <div style={{ borderTop: "1px solid #e5e5e7", marginBottom: 24 }} />
      {/* Scorecard */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#636366", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>Usability Scorecard</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, textAlign: "center" }}>
          {gauges.map((g) => (
            <div key={g.label} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <RingGauge score={g.score} size={100} />
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 6 }}>{g.label}</div>
              <div style={{ fontSize: 12, color: "#636366" }}>{g.issues} issues</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN SWITCHER
// ═══════════════════════════════════════════════════════════════
const designs = [
  { name: "1 — Icon Indicators + Mono Gauges", desc: "Pills keep identity colors. ✓/⚠/✕ icons show score quality. All gauges blue.", component: Design1 },
  { name: "2 — Score-Colored Gauges + Neutral Pills", desc: "Gauge color = score quality. Pill scores in neutral dark text.", component: Design2 },
  { name: "3 — Progress Bar Pills + Slate Gauges", desc: "Pills become mini cards with progress bars. Identity colors fill bars. Gauges all slate.", component: Design3 },
  { name: "4 — Opacity Fill + Score Labels", desc: "Pill fill level = score. Identity color at variable opacity. Score quality labels on gauges.", component: Design4 },
  { name: "5 — Dot Indicator + Horizontal Bars", desc: "Small colored dot on pills shows quality. Gauges replaced with horizontal score bars.", component: Design5 },
  { name: "6 — Letter Grades + Ring Gauges", desc: "A/B/C/D grades replace %. Circular ring gauges colored by score.", component: Design6 },
  { name: "7 — Compact Stat Cards", desc: "Everything becomes clean stat cards. Top accent bar = identity. Score bars colored by quality.", component: Design7 },
  { name: "8 — Left Border Accent + Score Bars", desc: "List layout. Left border = identity color. Horizontal bars = score quality.", component: Design8 },
  { name: "9 — Separated Score Dot", desc: "Pills = identity only (no score color). Score + dot below pill. All gauges blue + quality dot.", component: Design9 },
  { name: "10 — Everything Unified", desc: "Single container. Standards as mini progress bars. Ring gauges below. Minimal and cohesive.", component: Design10 },
];

export default function StatusBarVariations() {
  const [selected, setSelected] = useState(0);
  const Design = designs[selected].component;

  return (
    <div style={{ minHeight: "100vh", background: "#EEECE8", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Preview */}
      <div style={{ padding: "24px 40px 20px", background: "#fff", borderBottom: "1px solid #e5e5e7" }}>
        <div style={{ fontSize: 11, color: "#636366", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
          Design {selected + 1} of {designs.length}
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#1d1d1f", marginBottom: 2 }}>{designs[selected].name}</div>
        <div style={{ fontSize: 13, color: "#636366", marginBottom: 20 }}>{designs[selected].desc}</div>
        <Design />
      </div>

      {/* Selector */}
      <div style={{ padding: "20px 40px 60px" }}>
        <div style={{ fontSize: 11, color: "#636366", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          Choose a design direction
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, maxWidth: 900 }}>
          {designs.map((d, i) => (
            <button key={i} onClick={() => { setSelected(i); window.scrollTo({ top: 0, behavior: "smooth" }); }} style={{
              padding: 14, borderRadius: 10, cursor: "pointer", textAlign: "left",
              border: selected === i ? "2px solid #3b82f6" : "1px solid #E8E8EC",
              background: selected === i ? "#EFF6FF" : "#fff",
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1d1d1f", marginBottom: 4 }}>{d.name}</div>
              <div style={{ fontSize: 11, color: "#636366", lineHeight: 1.4 }}>{d.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
