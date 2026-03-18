"use client";
import DashboardMockup from "@/components/mockups/DashboardMockup";

/* ─── Accurate App Mockup matching real SIMPLIFY app ─── */
function AppMockup({ wide = false }: { wide?: boolean }) {
  return (
    <div className={`rounded-xl border overflow-hidden shadow-lg ${wide ? "" : "max-w-lg mx-auto"}`} style={{ borderColor: "#d2d2d7" }}>
      {/* Browser chrome */}
      <div className="bg-[#f5f5f7] px-3.5 py-2 flex items-center gap-1.5 border-b" style={{ borderColor: "#d2d2d7" }}>
        <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-2 text-[11px] text-[#86868b] bg-white rounded px-3 py-0.5 flex-1 text-center border" style={{ borderColor: "#d2d2d7" }}>
          simplifylti.com/course/bio-101
        </span>
      </div>
      {/* App header — exact match */}
      <div className="px-4 py-2.5 flex items-center justify-between" style={{ backgroundColor: "#1c1917" }}>
        <div className="flex items-center gap-0">
          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 16, fontWeight: 600, letterSpacing: "-0.02em", color: "#fff" }}>
            SIMPLIFY
          </span>
          <span style={{ display: "inline-block", width: 4, height: 4, backgroundColor: "#f5a623", borderRadius: 0, marginLeft: 0.5, position: "relative", top: -1 }} />
          <span className="ml-2 text-[11px]" style={{ color: "rgba(255,255,255,0.55)" }}>|</span>
          <span className="ml-2 text-[11px]" style={{ color: "rgba(255,255,255,0.55)", fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 300 }}>
            BIO 101 — Intro to Biology
          </span>
        </div>
        <div className="flex gap-0.5">
          {["Overview","Analytics","Builders"].map((t,i) => (
            <span key={t} className="text-[11px] px-2.5 py-1" style={{
              fontWeight: 500,
              color: i===0 ? "#3b82f6" : "#86868b",
              borderBottom: i===0 ? "2px solid #3b82f6" : "2px solid transparent",
            }}>{t}</span>
          ))}
        </div>
      </div>
      {/* Score area on warm gray bg */}
      <div className="p-4" style={{ backgroundColor: "#EEECE8" }}>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[{l:"Score",v:"87",s:"/100"},{l:"Issues Found",v:"14",s:""},{l:"Auto-Fixable",v:"9",s:""},{l:"Published",v:"3",s:""}].map(c=>(
            <div key={c.l} className="bg-white rounded-lg px-2.5 py-2 text-center border" style={{ borderColor: "#d2d2d7" }}>
              <div className="text-[9px] uppercase tracking-wider" style={{ color: "#86868b" }}>{c.l}</div>
              <div className="text-base font-semibold" style={{ color: "#1d1d1f" }}>{c.v}<span className="text-[10px] font-normal" style={{ color: "#86868b" }}>{c.s}</span></div>
            </div>
          ))}
        </div>
        {/* Standards pills — exact app colors */}
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] uppercase tracking-wider mr-0.5" style={{ color: "#86868b" }}>Standards</span>
          {[{l:"CVC-OEI 78%",bg:"rgba(249,115,22,0.12)",bc:"rgba(249,115,22,0.35)"},{l:"QM 82%",bg:"rgba(59,130,246,0.12)",bc:"rgba(59,130,246,0.4)"},{l:"Peralta 71%",bg:"rgba(34,197,94,0.12)",bc:"rgba(34,197,94,0.4)"}].map(p=>(
            <span key={p.l} className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: p.bg, border: `1px solid ${p.bc}`, color: "#1d1d1f" }}>{p.l}</span>
          ))}
        </div>
      </div>
      {/* Issues list — exact severity colors */}
      <div className="px-4 py-2.5 border-t" style={{ borderColor: "#d2d2d7" }}>
        {[{t:"Missing Alt Text",s:"High",bg:"#FCEEED",c:"#C4342A"},{t:"Low Color Contrast",s:"Medium",bg:"#FDF4E4",c:"#A06820"},{t:"Missing Learning Objectives",s:"Low",bg:"#EEEFF2",c:"#626870"}].map(i=>(
          <div key={i.t} className="flex items-center justify-between py-1.5 border-b last:border-0" style={{ borderColor: "#d2d2d7" }}>
            <span className="text-[12px]" style={{ color: "#1d1d1f" }}>{i.t}</span>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: i.bg, color: i.c }}>{i.s}</span>
          </div>
        ))}
      </div>
      {/* Actions */}
      <div className="px-4 py-2.5 flex gap-2 border-t" style={{ borderColor: "#d2d2d7" }}>
        <span className="text-[11px] font-semibold text-white px-3.5 py-1.5 rounded-[8px]" style={{ backgroundColor: "#0071e3" }}>Fix All (9)</span>
        <span className="text-[11px] font-medium px-3.5 py-1.5 rounded-[8px] border" style={{ color: "#1d1d1f", borderColor: "#d2d2d7" }}>Export PDF</span>
      </div>
    </div>
  );
}

/* ─── Shared: SIMPLIFY logo for navbars ─── */
function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="inline-flex items-baseline" style={{ fontFamily: "'Inter',sans-serif", fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", color: light ? "#fff" : "#1d1d1f" }}>
      SIMPLIFY
      <span style={{ display: "inline-block", width: 5, height: 5, backgroundColor: "#f5a623", borderRadius: 0, marginLeft: 0.5, position: "relative", top: -1 }} />
    </span>
  );
}

/* ─── Shared button classes ─── */
const btn = "inline-flex items-center justify-center font-semibold text-sm px-6 py-2.5 rounded-[10px] transition-all";

/* ═══════════════════════════════════════════════════════
   ORIGINAL THREE DESIGNS (A, B, C)
   ═══════════════════════════════════════════════════════ */

function DesignA() {
  return (
    <section className="min-h-screen flex items-center py-20 overflow-hidden bg-[#0F172A] relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-20" style={{ background: "radial-gradient(circle, #2563EB 0%, transparent 70%)" }} />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center">
        <div>
          <span className="inline-block text-simplify-blue font-semibold text-sm uppercase tracking-[0.15em] mb-4 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10">Canvas LTI Plug-in</span>
          <h1 className="font-[family-name:var(--font-plus-jakarta)] font-extrabold text-4xl md:text-5xl lg:text-[3.5rem] text-white leading-[1.08] mb-6">Your courses, <br /><span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">accessible in minutes.</span></h1>
          <p className="text-slate-400 text-lg md:text-xl leading-relaxed mb-8 max-w-xl">SIMPLIFY scans your Canvas courses against CVC-OEI, Quality Matters, and Peralta Equity rubrics — then auto-fixes issues so you can focus on teaching.</p>
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <a href="#" className="inline-flex items-center justify-center font-semibold text-white bg-simplify-blue px-8 py-3.5 rounded-lg hover:bg-simplify-blue-dark transition-colors shadow-[0_0_24px_rgba(37,99,235,0.4)] text-base">Start Free Pilot&nbsp;&rarr;</a>
            <a href="#" className="inline-flex items-center justify-center font-semibold text-slate-300 hover:text-white border border-slate-600 hover:border-slate-400 px-8 py-3.5 rounded-lg transition-colors text-base">Watch Demo</a>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">{["#3B82F6","#10B981","#F59E0B","#EC4899"].map((c,i)=>(<div key={i} className="w-8 h-8 rounded-full border-2 border-[#0F172A]" style={{ backgroundColor: c }} />))}</div>
            <span className="text-sm text-slate-500">Trusted by 200+ faculty across California</span>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-4 bg-blue-500/10 rounded-2xl blur-xl" />
          <div className="relative"><AppMockup /></div>
        </div>
      </div>
    </section>
  );
}

function DesignB() {
  return (
    <section className="min-h-screen flex items-stretch overflow-hidden">
      <div className="hidden lg:flex lg:w-[48%] bg-gradient-to-br from-simplify-blue via-blue-600 to-indigo-700 relative items-center justify-center px-12">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="relative max-w-md">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6"><span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /><span className="text-white/90 text-xs font-medium">Free 60-day pilot</span></div>
          <h1 className="font-[family-name:var(--font-plus-jakarta)] font-extrabold text-4xl lg:text-5xl text-white leading-[1.1] mb-6">Fix accessibility issues before they become audit findings.</h1>
          <p className="text-blue-100 text-lg leading-relaxed mb-8">One plug-in that scans, reports against CVC-OEI, QM, and Peralta rubrics, and fixes — right inside Canvas.</p>
          <a href="#" className="inline-flex items-center justify-center font-semibold text-simplify-blue bg-white px-8 py-3.5 rounded-lg hover:bg-blue-50 transition-colors shadow-lg text-base">Request a Pilot&nbsp;&rarr;</a>
          <div className="mt-12 grid grid-cols-3 gap-6">
            {[{v:"47",l:"Issues auto-fixed per course"},{v:"3min",l:"Average scan time"},{v:"98%",l:"Faculty satisfaction"}].map(s=>(<div key={s.l}><div className="text-2xl font-bold text-white">{s.v}</div><div className="text-xs text-blue-200 leading-tight mt-1">{s.l}</div></div>))}
          </div>
        </div>
      </div>
      <div className="flex-1 bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-6 lg:px-12 py-20">
        <div className="w-full max-w-lg">
          <div className="lg:hidden mb-8">
            <h1 className="font-[family-name:var(--font-plus-jakarta)] font-extrabold text-3xl text-slate-900 leading-[1.1] mb-4">Fix accessibility issues <span className="text-simplify-blue">before they become audit findings.</span></h1>
            <a href="#" className="inline-flex items-center font-semibold text-white bg-simplify-blue px-6 py-3 rounded-lg text-sm">Request a Pilot&nbsp;&rarr;</a>
          </div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-3 text-center">Live Dashboard Preview</p>
          <AppMockup />
        </div>
      </div>
    </section>
  );
}

function DesignC() {
  return (
    <section className="min-h-screen pt-24 pb-16 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-simplify-blue via-cyan-400 to-simplify-green" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-simplify-blue-light text-simplify-blue rounded-full px-4 py-1.5 text-xs font-semibold mb-6">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Canvas LTI Plug-in for Higher Education
        </div>
        <h1 className="font-[family-name:var(--font-plus-jakarta)] font-extrabold text-4xl md:text-5xl lg:text-6xl text-slate-900 leading-[1.05] mb-6 max-w-4xl mx-auto">Scan. Fix. Comply. <span className="text-simplify-blue">All inside Canvas.</span></h1>
        <p className="text-slate-500 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-8">SIMPLIFY checks every page, assignment, and file against CVC-OEI, Quality Matters, and Peralta rubrics — then auto-fixes what it finds.</p>
        <div className="flex gap-4 justify-center">
          <a href="#" className={`${btn} text-white shadow-md`} style={{ backgroundColor: "#0071e3" }}>Start Free Pilot&nbsp;&rarr;</a>
          <a href="#" className={`${btn} border`} style={{ color: "#1d1d1f", borderColor: "#d2d2d7" }}>See How It Works</a>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6"><AppMockup wide /></div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   15 NEW DESIGNS
   ═══════════════════════════════════════════════════════ */

/* 1 — Minimal White */
function D1() {
  return (
    <section className="min-h-screen flex items-center py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <Logo /><p className="text-[13px] mt-1 mb-6" style={{ color: "#86868b", fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 300 }}>Course Design & Accessibility</p>
          <h1 className="font-[family-name:var(--font-plus-jakarta)] font-extrabold text-4xl md:text-5xl leading-[1.08] tracking-tight mb-4" style={{ color: "#1d1d1f" }}>Make every course accessible.</h1>
          <p className="text-base leading-relaxed mb-6 max-w-md" style={{ color: "#86868b" }}>Scan your Canvas courses against CVC-OEI, Quality Matters, and Peralta rubrics — then fix issues with one click.</p>
          <div className="flex gap-3">
            <a href="#" className={`${btn} text-white`} style={{ backgroundColor: "#0071e3" }}>Start Free Pilot</a>
            <a href="#" className={`${btn} border`} style={{ color: "#1d1d1f", borderColor: "#d2d2d7" }}>Watch Demo</a>
          </div>
        </div>
        <AppMockup />
      </div>
    </section>
  );
}

/* 2 — Warm Gray Background */
function D2() {
  return (
    <section className="min-h-screen flex items-center py-16" style={{ backgroundColor: "#EEECE8" }}>
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <Logo /><p className="text-[13px] mt-1 mb-6" style={{ color: "#86868b" }}>Canvas LTI Plug-in for Higher Education</p>
          <h1 className="font-[family-name:var(--font-plus-jakarta)] font-extrabold text-4xl md:text-5xl leading-[1.08] tracking-tight mb-4" style={{ color: "#1d1d1f" }}>Your accessibility compliance problem, <span style={{ color: "#0071e3" }}>solved.</span></h1>
          <p className="text-base leading-relaxed mb-6 max-w-md" style={{ color: "#626870" }}>SIMPLIFY scans every page and file, maps issues to CVC-OEI, Quality Matters, and Peralta rubrics, and auto-fixes them — all inside Canvas.</p>
          <div className="flex gap-3 mb-8">
            <a href="#" className={`${btn} text-white`} style={{ backgroundColor: "#1c1917" }}>Request a Pilot&nbsp;&rarr;</a>
            <a href="#" className={`${btn}`} style={{ color: "#0071e3" }}>See How It Works</a>
          </div>
          <div className="flex gap-6 pt-5 border-t" style={{ borderColor: "#d2d2d7" }}>
            {[{v:"47",l:"avg fixes/course"},{v:"3 min",l:"scan time"},{v:"200+",l:"faculty users"}].map(s=>(
              <div key={s.l}><div className="text-lg font-bold" style={{ color: "#1d1d1f" }}>{s.v}</div><div className="text-[11px]" style={{ color: "#86868b" }}>{s.l}</div></div>
            ))}
          </div>
        </div>
        <AppMockup />
      </div>
    </section>
  );
}

/* 3 — Dark Header Centered */
function D3() {
  return (
    <section className="min-h-screen overflow-hidden bg-white">
      <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: "#1c1917" }}>
        <Logo light /><div className="flex gap-5 text-[13px]" style={{ color: "#86868b" }}>{["Features","How It Works","Pricing","FAQ"].map(i=><a key={i} href="#" className="hover:text-white transition-colors">{i}</a>)}</div>
        <a href="#" className={`${btn} text-white text-xs px-4 py-2`} style={{ backgroundColor: "#0071e3" }}>Start Free Pilot</a>
      </div>
      <div className="max-w-3xl mx-auto px-6 pt-16 pb-8 text-center">
        <h1 className="font-[family-name:var(--font-plus-jakarta)] font-extrabold text-4xl md:text-5xl leading-[1.08] tracking-tight mb-4" style={{ color: "#1d1d1f" }}>The all-in-one Canvas<br />accessibility plug-in.</h1>
        <p className="text-base leading-relaxed max-w-lg mx-auto mb-6" style={{ color: "#86868b" }}>Scan every page and file. Map issues to CVC-OEI, QM, and Peralta rubrics. Auto-fix with one click.</p>
        <div className="flex gap-3 justify-center mb-12">
          <a href="#" className={`${btn} text-white`} style={{ backgroundColor: "#0071e3" }}>Request a Pilot&nbsp;&rarr;</a>
          <a href="#" className={`${btn} border`} style={{ color: "#1d1d1f", borderColor: "#d2d2d7" }}>Watch Demo</a>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 pb-16"><AppMockup wide /></div>
    </section>
  );
}

/* 4 — Blue Banner Overlap */
function D4() {
  return (
    <section className="min-h-screen overflow-hidden">
      <div style={{ backgroundColor: "#0071e3" }} className="pt-8 pb-36 px-6">
        <nav className="max-w-5xl mx-auto flex items-center justify-between mb-16"><Logo light /><a href="#" className={`${btn} text-xs px-4 py-2`} style={{ backgroundColor: "#fff", color: "#0071e3" }}>Get Started</a></nav>
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="font-[family-name:var(--font-plus-jakarta)] font-extrabold text-4xl md:text-5xl text-white leading-[1.08] tracking-tight mb-4">Accessible courses, zero guesswork.</h1>
          <p className="text-blue-100 text-base leading-relaxed max-w-lg mx-auto mb-6">SIMPLIFY scans, reports, and fixes accessibility issues across your Canvas course — mapped to CVC-OEI, QM, and Peralta rubrics.</p>
          <div className="flex gap-3 justify-center">
            <a href="#" className={`${btn}`} style={{ backgroundColor: "#fff", color: "#0071e3" }}>Request a Pilot&nbsp;&rarr;</a>
            <a href="#" className={`${btn} border border-white/30 text-white hover:bg-white/10`}>Watch Demo</a>
          </div>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-6 -mt-20"><AppMockup /></div>
    </section>
  );
}

/* 5 — Split: Dark Left / Mockup Right */
function D5() {
  return (
    <section className="min-h-screen flex flex-col lg:flex-row">
      <div className="lg:w-1/2 flex items-center justify-center px-8 lg:px-14 py-16" style={{ backgroundColor: "#1c1917" }}>
        <div className="max-w-sm">
          <Logo light /><p className="text-[13px] mt-1 mb-8" style={{ color: "rgba(255,255,255,0.55)", fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 300 }}>Course Design & Accessibility</p>
          <h1 className="font-[family-name:var(--font-plus-jakarta)] font-extrabold text-3xl lg:text-4xl text-white leading-[1.1] mb-4">Course compliance, <span style={{ color: "#3b82f6" }}>fully automated.</span></h1>
          <p className="text-sm leading-relaxed mb-6" style={{ color: "#86868b" }}>Scan against CVC-OEI, Quality Matters, and Peralta rubrics. Auto-fix with one click. All inside Canvas.</p>
          <div className="flex gap-3 mb-8">
            <a href="#" className={`${btn} text-white`} style={{ backgroundColor: "#0071e3" }}>Start Free Pilot&nbsp;&rarr;</a>
            <a href="#" className={`${btn} border text-white/70`} style={{ borderColor: "rgba(255,255,255,0.2)" }}>Learn More</a>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-6 border-t" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
            {[{v:"47",l:"Avg fixes/course"},{v:"3 min",l:"Scan time"},{v:"98%",l:"Satisfaction"}].map(s=>(
              <div key={s.l}><div className="text-lg font-bold text-white">{s.v}</div><div className="text-[11px] mt-0.5" style={{ color: "#86868b" }}>{s.l}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="lg:w-1/2 flex items-center justify-center px-8 lg:px-10 py-16" style={{ backgroundColor: "#EEECE8" }}>
        <div className="w-full max-w-md"><AppMockup /></div>
      </div>
    </section>
  );
}

/* 6 — Soft Gradient Centered */
function D6() {
  return (
    <section className="min-h-screen overflow-hidden" style={{ background: "linear-gradient(180deg, #EFF6FF 0%, #FFFFFF 55%)" }}>
      <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between"><Logo /><a href="#" className={`${btn} text-white text-xs px-4 py-2`} style={{ backgroundColor: "#0071e3" }}>Get Started</a></nav>
      <div className="max-w-3xl mx-auto px-6 pt-12 pb-8 text-center">
        <div className="inline-flex items-center gap-1.5 bg-white border rounded-full px-3 py-1 text-[11px] font-medium shadow-sm mb-6" style={{ color: "#0071e3", borderColor: "#93C5FD" }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#0071e3" }} /> Canvas LTI Plug-in
        </div>
        <h1 className="font-[family-name:var(--font-plus-jakarta)] font-extrabold text-4xl md:text-5xl leading-[1.08] tracking-tight mb-4" style={{ color: "#1d1d1f" }}>Stop juggling tools.<br /><span style={{ color: "#0071e3" }}>Start fixing courses.</span></h1>
        <p className="text-base leading-relaxed max-w-lg mx-auto mb-6" style={{ color: "#86868b" }}>One plug-in that scans, maps to your rubrics, and auto-fixes — right inside Canvas.</p>
        <div className="flex gap-3 justify-center mb-12">
          <a href="#" className={`${btn} text-white shadow-md`} style={{ backgroundColor: "#0071e3" }}>Request a Pilot&nbsp;&rarr;</a>
          <a href="#" className={`${btn} border`} style={{ color: "#1d1d1f", borderColor: "#d2d2d7" }}>See How It Works</a>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-6"><AppMockup /></div>
    </section>
  );
}

/* 7 — Editorial with Stats */
function D7() {
  return (
    <section className="min-h-screen flex items-center py-16" style={{ backgroundColor: "#FAFAF8" }}>
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-[1.15fr_0.85fr] gap-14 items-center">
        <div>
          <div className="flex items-center gap-3 mb-6"><Logo /><span className="h-5 w-px" style={{ backgroundColor: "#d2d2d7" }} /><span className="text-[11px] uppercase tracking-wider" style={{ color: "#86868b" }}>Canvas Plug-in</span></div>
          <h1 className="font-[family-name:var(--font-plus-jakarta)] font-extrabold text-4xl lg:text-5xl leading-[1.08] tracking-tight mb-3" style={{ color: "#1d1d1f" }}>Your accessibility compliance problem, solved.</h1>
          <div className="h-0.5 w-12 rounded-full mb-4" style={{ backgroundColor: "#f5a623" }} />
          <p className="text-sm leading-relaxed mb-5 max-w-lg" style={{ color: "#626870" }}>Faculty spend hours manually checking courses. SIMPLIFY does it in minutes — scanning against CVC-OEI, Quality Matters, and Peralta rubrics, then auto-fixing what it finds.</p>
          <div className="grid grid-cols-3 gap-4 py-4 border-y mb-6" style={{ borderColor: "#d2d2d7" }}>
            {[{v:"87%",l:"Compliance after fix"},{v:"14",l:"Issues caught per course"},{v:"< 3 min",l:"Full scan time"}].map(s=>(
              <div key={s.l}><div className="text-xl font-bold" style={{ color: "#1d1d1f" }}>{s.v}</div><div className="text-[11px] mt-0.5" style={{ color: "#86868b" }}>{s.l}</div></div>
            ))}
          </div>
          <a href="#" className={`${btn} text-white`} style={{ backgroundColor: "#1c1917" }}>Request a Pilot&nbsp;&rarr;</a>
        </div>
        <AppMockup />
      </div>
    </section>
  );
}

/* 8 — Dark Premium Glow */
function D8() {
  return (
    <section className="min-h-screen flex items-center py-16 overflow-hidden relative" style={{ backgroundColor: "#0B1120" }}>
      <div className="absolute top-1/3 left-1/2 -translate-x-1/4 w-[500px] h-[500px] rounded-full blur-[120px]" style={{ backgroundColor: "rgba(0,113,227,0.15)" }} />
      <div className="relative max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <Logo light /><p className="text-[13px] mt-1 mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>Canvas LTI Plug-in</p>
          <h1 className="font-[family-name:var(--font-plus-jakarta)] font-extrabold text-4xl md:text-5xl text-white leading-[1.08] tracking-tight mb-4">Course accessibility, <span style={{ color: "#3b82f6" }}>automated.</span></h1>
          <p className="text-base leading-relaxed mb-6 max-w-md" style={{ color: "#86868b" }}>Scan every page and file against CVC-OEI, Quality Matters, and Peralta rubrics. Fix issues with one click.</p>
          <div className="flex gap-3 mb-8">
            <a href="#" className={`${btn} text-white shadow-lg`} style={{ backgroundColor: "#0071e3", boxShadow: "0 0 24px rgba(0,113,227,0.35)" }}>Start Free Pilot&nbsp;&rarr;</a>
            <a href="#" className={`${btn} border`} style={{ color: "#86868b", borderColor: "rgba(255,255,255,0.15)" }}>Watch Demo</a>
          </div>
          <div className="flex gap-6">
            {[{v:"47",l:"Avg fixes/course"},{v:"3 min",l:"Scan time"},{v:"200+",l:"Faculty"}].map(s=>(
              <div key={s.l}><div className="text-lg font-bold text-white">{s.v}</div><div className="text-[11px]" style={{ color: "#86868b" }}>{s.l}</div></div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-3 rounded-2xl blur-xl" style={{ backgroundColor: "rgba(0,113,227,0.08)" }} />
          <div className="relative"><AppMockup /></div>
        </div>
      </div>
    </section>
  );
}

/* 9 — Orange Accent */
function D9() {
  return (
    <section className="min-h-screen flex items-center py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <Logo /><div className="mt-2 mb-6 flex gap-2">
            {[{l:"CVC-OEI",c:"#ff9500"},{l:"Quality Matters",c:"#0071e3"},{l:"Peralta",c:"#22c55e"}].map(s=>(
              <span key={s.l} className="text-[10px] font-bold text-white px-2 py-0.5 rounded" style={{ backgroundColor: s.c }}>{s.l}</span>
            ))}
          </div>
          <h1 className="font-[family-name:var(--font-plus-jakarta)] font-extrabold text-4xl md:text-5xl leading-[1.08] tracking-tight mb-4" style={{ color: "#1d1d1f" }}>Three rubrics.<br />One plug-in. <span style={{ color: "#ff9500" }}>Zero hassle.</span></h1>
          <p className="text-base leading-relaxed mb-6 max-w-md" style={{ color: "#626870" }}>SIMPLIFY scans your Canvas courses and auto-fixes accessibility issues — aligned to every rubric you use.</p>
          <div className="flex gap-3">
            <a href="#" className={`${btn} text-white`} style={{ backgroundColor: "#ff9500" }}>Request a Pilot&nbsp;&rarr;</a>
            <a href="#" className={`${btn} border`} style={{ color: "#1d1d1f", borderColor: "#d2d2d7" }}>Watch Demo</a>
          </div>
        </div>
        <AppMockup />
      </div>
    </section>
  );
}

/* 10 — Full-width Hero Image */
function D10() {
  return (
    <section className="min-h-screen overflow-hidden" style={{ backgroundColor: "#1c1917" }}>
      <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between"><Logo light /><a href="#" className={`${btn} text-xs px-4 py-2`} style={{ backgroundColor: "#0071e3", color: "#fff" }}>Start Free Pilot</a></nav>
      <div className="max-w-3xl mx-auto px-6 pt-14 pb-8 text-center">
        <h1 className="font-[family-name:var(--font-plus-jakarta)] font-extrabold text-4xl md:text-5xl text-white leading-[1.08] tracking-tight mb-4">Scan. Fix. Comply.<br /><span style={{ color: "#3b82f6" }}>All inside Canvas.</span></h1>
        <p className="text-base leading-relaxed max-w-lg mx-auto mb-6" style={{ color: "#86868b" }}>One plug-in for CVC-OEI, Quality Matters, and Peralta rubrics — with one-click auto-fix.</p>
        <div className="flex gap-3 justify-center mb-12">
          <a href="#" className={`${btn} text-white shadow-lg`} style={{ backgroundColor: "#0071e3", boxShadow: "0 0 20px rgba(0,113,227,0.3)" }}>Request a Pilot&nbsp;&rarr;</a>
          <a href="#" className={`${btn} border text-white/70`} style={{ borderColor: "rgba(255,255,255,0.15)" }}>Watch Demo</a>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 pb-8"><AppMockup wide /></div>
    </section>
  );
}

/* 11 — Split: Blue Left / White Right */
function D11() {
  return (
    <section className="min-h-screen flex flex-col lg:flex-row">
      <div className="lg:w-1/2 flex items-center justify-center px-8 lg:px-14 py-16" style={{ backgroundColor: "#0071e3" }}>
        <div className="max-w-sm">
          <Logo light />
          <p className="text-[13px] mt-1 mb-8 text-blue-100" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 300 }}>Course Design & Accessibility</p>
          <h1 className="font-[family-name:var(--font-plus-jakarta)] font-extrabold text-3xl lg:text-4xl text-white leading-[1.1] mb-4">Fix accessibility issues before they become audit findings.</h1>
          <p className="text-sm leading-relaxed mb-6 text-blue-100">One Canvas plug-in. Three rubrics. One-click fixes.</p>
          <a href="#" className={`${btn}`} style={{ backgroundColor: "#fff", color: "#0071e3" }}>Request a Pilot&nbsp;&rarr;</a>
        </div>
      </div>
      <div className="lg:w-1/2 bg-white flex items-center justify-center px-8 lg:px-10 py-16">
        <div className="w-full max-w-md"><AppMockup /></div>
      </div>
    </section>
  );
}

/* 12 — Gradient Mesh Dark */
function D12() {
  return (
    <section className="min-h-screen overflow-hidden relative" style={{ backgroundColor: "#070B18" }}>
      <div className="absolute top-[-10%] left-[10%] w-[350px] h-[350px] rounded-full blur-[100px]" style={{ backgroundColor: "rgba(0,113,227,0.2)" }} />
      <div className="absolute bottom-[10%] right-[5%] w-[250px] h-[250px] rounded-full blur-[80px]" style={{ backgroundColor: "rgba(59,130,246,0.15)" }} />
      <div className="relative max-w-3xl mx-auto px-6 pt-24 pb-8 text-center">
        <Logo light />
        <h1 className="font-[family-name:var(--font-plus-jakarta)] font-extrabold text-4xl md:text-5xl text-white leading-[1.08] tracking-tight mt-6 mb-4">Course compliance,<br /><span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">fully automated.</span></h1>
        <p className="text-base leading-relaxed max-w-lg mx-auto mb-6" style={{ color: "#86868b" }}>Scan against CVC-OEI, Quality Matters, and Peralta rubrics. Auto-fix with one click.</p>
        <div className="flex gap-3 justify-center mb-12">
          <a href="#" className={`${btn} text-white shadow-lg`} style={{ backgroundColor: "#0071e3", boxShadow: "0 0 24px rgba(0,113,227,0.3)" }}>Start Free Pilot&nbsp;&rarr;</a>
          <a href="#" className={`${btn} border`} style={{ color: "#86868b", borderColor: "rgba(255,255,255,0.12)" }}>Watch Demo</a>
        </div>
      </div>
      <div className="relative max-w-3xl mx-auto px-6"><AppMockup /></div>
    </section>
  );
}

/* 13 — Warm Corporate Underline */
function D13() {
  return (
    <section className="min-h-screen flex items-center py-16" style={{ backgroundColor: "#FAFAF7" }}>
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <Logo /><p className="text-[13px] mt-1 mb-6" style={{ color: "#86868b" }}>Canvas LTI Plug-in</p>
          <h1 className="font-[family-name:var(--font-plus-jakarta)] font-extrabold text-4xl lg:text-5xl leading-[1.08] tracking-tight mb-4" style={{ color: "#1d1d1f" }}>
            The fastest path to <span className="underline decoration-2 underline-offset-4" style={{ textDecorationColor: "#0071e3" }}>accessible</span> courses.
          </h1>
          <p className="text-base leading-relaxed mb-6 max-w-md" style={{ color: "#626870" }}>No more manual audits. No more spreadsheets. Scan, fix, and comply — all inside Canvas.</p>
          <div className="flex gap-3 mb-8">
            <a href="#" className={`${btn} text-white`} style={{ backgroundColor: "#1c1917" }}>Request a Pilot&nbsp;&rarr;</a>
            <a href="#" className={`${btn}`} style={{ color: "#0071e3" }}>Watch Demo</a>
          </div>
          <div className="flex items-center gap-5 pt-5 border-t" style={{ borderColor: "#d2d2d7" }}>
            {[{v:"47",l:"avg fixes/course"},{v:"3 min",l:"scan time"},{v:"200+",l:"faculty users"}].map(s=>(
              <div key={s.l} className="pr-5 border-r last:border-0 last:pr-0" style={{ borderColor: "#d2d2d7" }}>
                <div className="text-base font-bold" style={{ color: "#1d1d1f" }}>{s.v}</div><div className="text-[11px]" style={{ color: "#86868b" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        <AppMockup />
      </div>
    </section>
  );
}

/* 14 — Dark Overlap */
function D14() {
  return (
    <section className="min-h-screen overflow-hidden bg-white relative">
      <div className="absolute top-0 left-0 right-0 h-[55%]" style={{ backgroundColor: "#1c1917" }} />
      <div className="relative max-w-6xl mx-auto px-6 pt-8">
        <nav className="flex items-center justify-between mb-14"><Logo light /><a href="#" className={`${btn} text-white text-xs px-4 py-2`} style={{ backgroundColor: "#0071e3" }}>Start Free</a></nav>
        <div className="max-w-xl mb-10">
          <h1 className="font-[family-name:var(--font-plus-jakarta)] font-extrabold text-4xl md:text-5xl text-white leading-[1.08] tracking-tight mb-4">Make every Canvas course <span style={{ color: "#3b82f6" }}>compliant.</span></h1>
          <p className="text-base leading-relaxed mb-6 max-w-lg" style={{ color: "#86868b" }}>One plug-in for CVC-OEI, Quality Matters, and Peralta rubrics — with one-click auto-fix.</p>
          <div className="flex gap-3">
            <a href="#" className={`${btn} text-white shadow-lg`} style={{ backgroundColor: "#0071e3", boxShadow: "0 0 20px rgba(0,113,227,0.3)" }}>Request a Pilot&nbsp;&rarr;</a>
            <a href="#" className={`${btn} border text-white/70`} style={{ borderColor: "rgba(255,255,255,0.2)" }}>Watch Demo</a>
          </div>
        </div>
        <div className="max-w-4xl mx-auto"><AppMockup wide /></div>
      </div>
    </section>
  );
}

/* 15 — Green Accent / Compliance Focus */
function D15() {
  return (
    <section className="min-h-screen flex items-center py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <Logo />
          <div className="inline-flex items-center gap-1.5 mt-3 mb-6 rounded-full px-3 py-1 text-[11px] font-semibold" style={{ backgroundColor: "rgba(34,197,94,0.12)", color: "#16a34a", border: "1px solid rgba(34,197,94,0.3)" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#22c55e" }} /> Free 60-day pilot — no credit card
          </div>
          <h1 className="font-[family-name:var(--font-plus-jakarta)] font-extrabold text-4xl md:text-5xl leading-[1.08] tracking-tight mb-4" style={{ color: "#1d1d1f" }}>Pass your next<br />accessibility review. <span style={{ color: "#22c55e" }}>Guaranteed.</span></h1>
          <p className="text-base leading-relaxed mb-6 max-w-md" style={{ color: "#626870" }}>SIMPLIFY scans your Canvas courses against CVC-OEI, QM, and Peralta rubrics — then auto-fixes every issue it finds.</p>
          <div className="flex gap-3">
            <a href="#" className={`${btn} text-white`} style={{ backgroundColor: "#16a34a" }}>Start Free Pilot&nbsp;&rarr;</a>
            <a href="#" className={`${btn} border`} style={{ color: "#1d1d1f", borderColor: "#d2d2d7" }}>Watch Demo</a>
          </div>
        </div>
        <AppMockup />
      </div>
    </section>
  );
}

/* ─── Page ─── */
export default function DesignsPage() {
  const designs = [
    { id:"A", label:"Dark Hero", C: DesignA, bar:"bg-[#0F172A] text-blue-400" },
    { id:"B", label:"Split Gradient", C: DesignB, bar:"bg-simplify-blue text-white" },
    { id:"C", label:"Centered Analytics", C: DesignC, bar:"bg-slate-700 text-white" },
    { id:"1", label:"Minimal White", C: D1, bar:"bg-white text-slate-600 border-b border-slate-200" },
    { id:"2", label:"Warm Gray", C: D2, bar:"bg-[#EEECE8] text-[#1d1d1f] border-b border-[#d2d2d7]" },
    { id:"3", label:"Dark Nav Centered", C: D3, bar:"bg-[#1c1917] text-white" },
    { id:"4", label:"Blue Banner Overlap", C: D4, bar:"bg-[#0071e3] text-white" },
    { id:"5", label:"Dark Split", C: D5, bar:"bg-[#1c1917] text-[#3b82f6]" },
    { id:"6", label:"Soft Blue Gradient", C: D6, bar:"bg-blue-50 text-[#0071e3]" },
    { id:"7", label:"Editorial + Stats", C: D7, bar:"bg-[#FAFAF8] text-[#1d1d1f] border-b border-[#d2d2d7]" },
    { id:"8", label:"Dark Premium Glow", C: D8, bar:"bg-[#0B1120] text-[#3b82f6]" },
    { id:"9", label:"Orange Accent", C: D9, bar:"bg-white text-[#ff9500] border-b border-[#d2d2d7]" },
    { id:"10", label:"Full Dark", C: D10, bar:"bg-[#1c1917] text-white" },
    { id:"11", label:"Blue Split", C: D11, bar:"bg-[#0071e3] text-white" },
    { id:"12", label:"Gradient Mesh", C: D12, bar:"bg-[#070B18] text-cyan-400" },
    { id:"13", label:"Warm Corporate", C: D13, bar:"bg-[#FAFAF7] text-[#1d1d1f] border-b border-[#d2d2d7]" },
    { id:"14", label:"Dark Overlap", C: D14, bar:"bg-[#1c1917] text-[#3b82f6]" },
    { id:"15", label:"Green Compliance", C: D15, bar:"bg-white text-[#16a34a] border-b border-[#d2d2d7]" },
  ];

  return (
    <div>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b px-3 py-2 flex items-center gap-1 overflow-x-auto" style={{ borderColor: "#d2d2d7" }}>
        <span className="font-bold text-xs mr-2 shrink-0" style={{ color: "#1d1d1f", fontFamily: "'Inter',sans-serif" }}>Designs</span>
        {designs.map(d=>(
          <a key={d.id} href={`#d-${d.id}`} className="text-[11px] whitespace-nowrap px-1.5 py-1 rounded hover:bg-slate-50 transition-colors" style={{ color: "#86868b" }}>{d.id}</a>
        ))}
      </nav>
      <div className="pt-9">
        {designs.map(d=>(
          <div key={d.id} id={`d-${d.id}`}>
            <div className={`text-center py-2 text-[11px] font-semibold uppercase tracking-widest ${d.bar}`}>{d.id}. {d.label}</div>
            <d.C />
          </div>
        ))}
      </div>
    </div>
  );
}
