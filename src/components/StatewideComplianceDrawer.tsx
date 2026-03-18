import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Download, ChevronDown, ChevronRight, CheckCircle2, Printer, FileText, FileSpreadsheet, Check, Clock, Info, ClipboardList } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ScanHistoryEntry {
  id: string;
  date: string;
  courseName: string;
  results: any[];
}

interface Acknowledgment {
  note: string;
  timestamp: string;
}

interface ReportInfo {
  instructorName: string;
  institution: string;
}

interface StatewideComplianceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  scanResults?: any[];
  selectedCourse?: { courseId: number; courseName: string } | null;
  lastScanTime?: Date;
}

// --- Issue Card ---
interface IssueCardProps {
  issue: any;
  ack: Acknowledgment | undefined;
  onAcknowledge: (issueId: string, note: string) => void;
}

function IssueCard({ issue, ack, onAcknowledge }: IssueCardProps) {
  const [showForm, setShowForm] = useState(false);
  const [noteText, setNoteText] = useState(ack?.note || "");

  const severityColor =
    issue.severity === "high" ? "#d97706" :
    issue.severity === "medium" ? "#ff9500" :
    "#636366";

  const primaryTag = issue.standardsTags?.find((t: string) => t.includes(":"));
  const tagCode = primaryTag ? primaryTag.split(":")[1] : null;

  const handleSave = () => {
    onAcknowledge(issue.id, noteText);
    setShowForm(false);
  };

  return (
    <div className={`py-2.5 border-b border-[#f0f0f0] last:border-0 ${ack ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-3">
        <div
          className="mt-1.5 w-2 h-2 rounded-full shrink-0"
          style={{ background: ack ? "#636366" : severityColor }}
        />
        <div className="flex-1 min-w-0">
          <p className={`text-[13px] font-medium leading-snug ${ack ? "text-[#636366] line-through" : "text-[#1d1d1f]"}`}>
            {issue.title}
          </p>
          <p className="text-[11px] text-[#636366] mt-0.5 flex items-center gap-1.5">
            {issue.location}
            {tagCode && (
              <span className="text-[10px] bg-[#EEECE8] text-[#6e6e73] px-1.5 py-0.5 rounded font-medium">
                {tagCode}
              </span>
            )}
          </p>
          {ack && (
            <p className="text-[11px] text-[#0071e3] mt-1">
              Acknowledged{ack.note ? `: "${ack.note}"` : ""}
            </p>
          )}
        </div>
        <button
          onClick={() => {
            if (ack) {
              onAcknowledge(issue.id, ""); // un-acknowledge
            } else {
              setShowForm(!showForm);
              setNoteText("");
            }
          }}
          title={ack ? "Remove acknowledgment" : "Acknowledge this issue"}
          className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors border ${
            ack
              ? "bg-[#0071e3] border-[#0071e3] text-white"
              : "border-[#d2d2d7] text-[#636366] hover:border-[#0071e3] hover:text-[#0071e3]"
          }`}
        >
          <Check className="w-3 h-3" strokeWidth={2.5} />
        </button>
      </div>

      {/* Inline ack form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="mt-2 ml-5 flex flex-col gap-1.5">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add a note (optional) — e.g. 'Will fix manually before April 1'"
                className="w-full text-[12px] text-[#1d1d1f] bg-[#EEECE8] border border-[#e5e5e7] rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-[#0071e3] placeholder-[#636366]"
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="text-[12px] font-medium text-white bg-[#0071e3] hover:bg-[#0077ed] px-3 py-1 rounded-md transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-[12px] font-medium text-[#636366] hover:text-[#1d1d1f] px-3 py-1 rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Standard Section ---
interface StandardSectionProps {
  title: string;
  issues: any[];
  expanded: boolean;
  onToggle: () => void;
  acknowledgments: Record<string, Acknowledgment>;
  onAcknowledge: (issueId: string, note: string) => void;
}

function StandardSection({ title, issues, expanded, onToggle, acknowledgments, onAcknowledge }: StandardSectionProps) {
  const unackedCount = issues.filter((i) => !acknowledgments[i.id]).length;

  const statusColor =
    unackedCount === 0 && issues.length === 0 ? { bg: "#d1f4e0", text: "#147d64" } :
    unackedCount === 0 ? { bg: "#d1f4e0", text: "#147d64" } :
    unackedCount <= 4 ? { bg: "#fef3c7", text: "#b45309" } :
    { bg: "#fef3c7", text: "#92400e" };

  const label = unackedCount === 0 && issues.length > 0
    ? "All acknowledged"
    : `${unackedCount} ${unackedCount === 1 ? "issue" : "issues"}`;

  return (
    <div className="bg-white rounded-xl border border-[#e5e5e7] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#f9f9fb] transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          {expanded
            ? <ChevronDown className="w-4 h-4 text-[#636366]" />
            : <ChevronRight className="w-4 h-4 text-[#636366]" />
          }
          <span className="text-[14px] font-semibold text-[#1d1d1f]">{title}</span>
        </div>
        <span
          className="text-[12px] font-semibold px-3 py-1 rounded-full"
          style={{ background: statusColor.bg, color: statusColor.text }}
        >
          {label}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-2">
              {issues.length === 0 ? (
                <p className="text-[13px] text-[#636366] py-2">No issues found for this standard.</p>
              ) : (
                issues.map((issue: any) => (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    ack={acknowledgments[issue.id]}
                    onAcknowledge={onAcknowledge}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Main Drawer ---
export function StatewideComplianceDrawer({
  isOpen,
  onClose,
  scanResults = [],
  selectedCourse,
  lastScanTime,
}: StatewideComplianceDrawerProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    cvcOei: false,
    qm: false,
    peralta: false,
    auditLog: false,
  });
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [showCourseMenu, setShowCourseMenu] = useState(false);
  const [showReportGuide, setShowReportGuide] = useState(false);
  const [showInfoPulse, setShowInfoPulse] = useState(() => !localStorage.getItem('simplify_seen_report_info'));
  const [showDropdownHint, setShowDropdownHint] = useState(() => !localStorage.getItem('simplify_seen_course_dropdown'));
  const [scanHistory, setScanHistory] = useState<ScanHistoryEntry[]>([]);
  const [activeHistoryIndex, setActiveHistoryIndex] = useState(0);
  const [activeCourseId, setActiveCourseId] = useState<string>("");
  const [scannedCourses, setScannedCourses] = useState<Array<{ courseId: string; courseName: string }>>([]);
  const [acknowledgments, setAcknowledgments] = useState<Record<string, Acknowledgment>>({});
  const [reportInfo, setReportInfo] = useState<ReportInfo>({ instructorName: "", institution: "" });
  const downloadRef = useRef<HTMLDivElement>(null);
  const courseMenuRef = useRef<HTMLDivElement>(null);

  // Load persisted data on open
  useEffect(() => {
    if (!isOpen) return;

    // Load report info
    const savedInfo = localStorage.getItem("simplify_report_info");
    if (savedInfo) setReportInfo(JSON.parse(savedInfo));

    // Load acknowledgments
    const savedAcks = localStorage.getItem("simplify_acknowledgments");
    if (savedAcks) setAcknowledgments(JSON.parse(savedAcks));

    // Load scan history for current course
    const currentId = selectedCourse?.courseId.toString() || "";
    setActiveCourseId(currentId);
    if (currentId) {
      const stored = localStorage.getItem(`simplify_scan_history_${currentId}`);
      setScanHistory(stored ? JSON.parse(stored) : []);
    }
    setActiveHistoryIndex(0);

    // Discover all previously scanned courses from localStorage
    const found: Array<{ courseId: string; courseName: string }> = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("simplify_scan_history_")) {
        const cId = key.replace("simplify_scan_history_", "");
        const history = JSON.parse(localStorage.getItem(key) || "[]");
        if (history.length > 0) {
          found.push({ courseId: cId, courseName: history[0].courseName });
        }
      }
    }
    setScannedCourses(found);
  }, [isOpen, selectedCourse?.courseId]);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (downloadRef.current && !downloadRef.current.contains(event.target as Node)) {
        setShowDownloadMenu(false);
      }
      if (courseMenuRef.current && !courseMenuRef.current.contains(event.target as Node)) {
        setShowCourseMenu(false);
      }
    }
    if (showDownloadMenu || showCourseMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDownloadMenu, showCourseMenu]);

  // No scroll lock — drawer is a side panel, page stays scrollable behind it

  // Switch to a different course
  const handleCourseSelect = (courseId: string) => {
    setActiveCourseId(courseId);
    setActiveHistoryIndex(0);
    setShowCourseMenu(false);
    const stored = localStorage.getItem(`simplify_scan_history_${courseId}`);
    setScanHistory(stored ? JSON.parse(stored) : []);
  };

  const isCurrentCourse = activeCourseId === selectedCourse?.courseId.toString();
  const activeCourseName = isCurrentCourse
    ? (selectedCourse?.courseName || "Course")
    : scannedCourses.find((c) => c.courseId === activeCourseId)?.courseName || "Course";

  // Active results: props for current course, history for others
  const activeResults: any[] = isCurrentCourse
    ? (activeHistoryIndex === 0 ? scanResults : scanHistory[activeHistoryIndex - 1]?.results ?? scanResults)
    : (scanHistory[activeHistoryIndex]?.results ?? scanHistory[0]?.results ?? []);

  const activeDate = isCurrentCourse
    ? (activeHistoryIndex === 0 ? lastScanTime : scanHistory[activeHistoryIndex - 1]?.date ? new Date(scanHistory[activeHistoryIndex - 1].date) : lastScanTime)
    : (scanHistory[activeHistoryIndex]?.date ? new Date(scanHistory[activeHistoryIndex].date) : undefined);

  // Derived metrics
  const totalIssues = activeResults.length;
  const highSeverity = activeResults.filter((i) => i.severity === "high").length;
  const mediumSeverity = activeResults.filter((i) => i.severity === "medium").length;
  const lowSeverity = activeResults.filter((i) => i.severity === "low").length;

  const cvcOeiIssues = activeResults.filter((i) =>
    i.standardsTags?.some((tag: string) => tag.startsWith("cvc-oei:"))
  );
  const qmIssues = activeResults.filter((i) =>
    i.standardsTags?.some((tag: string) => tag.startsWith("qm:"))
  );
  const peraltaIssues = activeResults.filter((i) =>
    i.standardsTags?.some((tag: string) => tag.startsWith("peralta:"))
  );
  const publishedIssues = activeResults.filter((i) => i.status === "published");
  const acknowledgedCount = activeResults.filter((i) => acknowledgments[i.id]).length;
  const openCount = totalIssues - acknowledgedCount;

  // Auto-generated summary sentence
  const standardsWithIssues = [cvcOeiIssues, qmIssues, peraltaIssues].filter((arr) => arr.length > 0).length;
  const summaryText = totalIssues === 0
    ? null
    : openCount === 0
      ? `All ${totalIssues} issues have been acknowledged. Download the evidence pack to document your remediation plan.`
      : acknowledgedCount > 0
        ? `This course has ${openCount} open ${openCount === 1 ? "issue" : "issues"} across ${standardsWithIssues} ${standardsWithIssues === 1 ? "standard" : "standards"}. ${acknowledgedCount} ${acknowledgedCount === 1 ? "has" : "have"} been acknowledged.`
        : `This course has ${totalIssues} ${totalIssues === 1 ? "issue" : "issues"} across ${standardsWithIssues} ${standardsWithIssues === 1 ? "standard" : "standards"}.${highSeverity > 0 ? ` ${highSeverity} ${highSeverity === 1 ? "requires" : "require"} immediate attention.` : ""}`;

  const complianceStatus =
    highSeverity === 0 && totalIssues < 10 ? "Meets Standards" :
    highSeverity < 3 && totalIssues < 30 ? "Partial Compliance" :
    "Needs Attention";

  const complianceColors =
    complianceStatus === "Meets Standards" ? { bg: "#d1f4e0", text: "#147d64" } :
    complianceStatus === "Partial Compliance" ? { bg: "#fef3c7", text: "#b45309" } :
    { bg: "#fef3c7", text: "#92400e" };

  const courseName = activeCourseName;
  const scanDateShort = activeDate
    ? activeDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const scanDateLong = activeDate
    ? activeDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const toggle = (key: string) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  // Acknowledge handler
  const handleAcknowledge = (issueId: string, note: string) => {
    const updated = { ...acknowledgments };
    if (note === "" && !updated[issueId]) return; // no-op
    if (note === "") {
      delete updated[issueId]; // un-acknowledge
    } else {
      updated[issueId] = { note, timestamp: new Date().toISOString() };
    }
    setAcknowledgments(updated);
    localStorage.setItem("simplify_acknowledgments", JSON.stringify(updated));
  };

  // Report info handler
  const handleReportInfoChange = (field: keyof ReportInfo, value: string) => {
    const updated = { ...reportInfo, [field]: value };
    setReportInfo(updated);
    localStorage.setItem("simplify_report_info", JSON.stringify(updated));
  };

  // --- Download: CSV ---
  const handleDownloadCSV = () => {
    const ackedIds = Object.keys(acknowledgments);
    const headers = ["Issue", "Location", "Severity", "Standards", "Status", "Acknowledged", "Note"];
    const rows = activeResults.map((issue) => {
      const ack = acknowledgments[issue.id];
      return [
        issue.title || "",
        issue.location || "",
        issue.severity || "",
        (issue.standardsTags || []).join("; "),
        issue.status === "published" ? "Fixed" : "Open",
        ack ? "Yes" : "No",
        ack?.note || "",
      ];
    });
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-${courseName.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setShowDownloadMenu(false);
  };

  // --- HTML Report Builder ---
  const buildHTMLReport = () => {
    const dotColor = (sev: string) =>
      sev === "high" ? "#d97706" : sev === "medium" ? "#ff9500" : "#636366";

    const issueRows = activeResults.map((issue) => {
      const ack = acknowledgments[issue.id];
      return `
      <tr style="${ack ? "opacity:0.6;" : ""}">
        <td style="padding:10px 12px;border-bottom:1px solid #e5e5e7;">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${dotColor(issue.severity)};margin-right:8px;vertical-align:middle;"></span>
          ${issue.title || ""}
          ${ack ? `<br><span style="font-size:11px;color:#0071e3;">Acknowledged${ack.note ? `: "${ack.note}"` : ""}</span>` : ""}
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e5e7;color:#636366;">${issue.location || "—"}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e5e7;color:#636366;">${(issue.standardsTags || []).join(", ") || "—"}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e5e7;">
          <span style="background:${issue.status === "published" ? "#d1f4e0" : ack ? "#f0f0f5" : "#f5f5f7"};color:${issue.status === "published" ? "#147d64" : ack ? "#0071e3" : "#636366"};padding:2px 8px;border-radius:20px;font-size:12px;font-weight:600;">
            ${issue.status === "published" ? "Fixed" : ack ? "Acknowledged" : "Open"}
          </span>
        </td>
      </tr>`;
    }).join("");

    const fixedRows = publishedIssues.map((issue) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e5e7;">${issue.title || ""}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e5e7;color:#636366;">${issue.location || "—"}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e5e7;color:#636366;">
          ${issue.stagedFix?.timestamp ? new Date(issue.stagedFix.timestamp).toLocaleDateString() : "—"}
        </td>
      </tr>`).join("");

    const ackedCount = activeResults.filter((i) => acknowledgments[i.id]).length;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Audit Report — ${courseName}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; color: #1d1d1f; margin: 0 auto; padding: 48px; max-width: 960px; line-height: 1.5; }
    h1 { font-size: 28px; font-weight: 700; margin: 0 0 4px; }
    .meta { color: #636366; font-size: 14px; margin-bottom: 8px; }
    .preparer { color: #1d1d1f; font-size: 14px; margin-bottom: 36px; }
    .section { margin-bottom: 36px; }
    h2 { font-size: 16px; font-weight: 600; margin: 0 0 16px; padding-bottom: 10px; border-bottom: 2px solid #e5e5e7; display: flex; align-items: center; gap: 10px; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .stats { display: flex; gap: 32px; margin-bottom: 8px; }
    .stat-num { font-size: 34px; font-weight: 700; line-height: 1; }
    .stat-label { font-size: 11px; color: #636366; text-transform: uppercase; letter-spacing: 0.6px; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th { text-align: left; padding: 10px 12px; background: #EEECE8; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #636366; font-weight: 600; }
    tr:last-child td { border-bottom: none !important; }
    .footer { margin-top: 56px; padding-top: 16px; border-top: 1px solid #e5e5e7; font-size: 12px; color: #636366; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <h1>Audit &amp; Evidence Report</h1>
  <div class="meta">${courseName} &nbsp;·&nbsp; Scan date: ${scanDateLong} &nbsp;·&nbsp; Generated by Simplify</div>
  ${reportInfo.instructorName || reportInfo.institution
    ? `<div class="preparer">
        ${reportInfo.instructorName ? `Instructor: <strong>${reportInfo.instructorName}</strong>` : ""}
        ${reportInfo.instructorName && reportInfo.institution ? " &nbsp;·&nbsp; " : ""}
        ${reportInfo.institution ? `Institution: <strong>${reportInfo.institution}</strong>` : ""}
       </div>`
    : ""}

  <div class="section">
    <h2>
      Compliance Status
      <span class="badge" style="background:${complianceColors.bg};color:${complianceColors.text};">${complianceStatus}</span>
    </h2>
    <div class="stats">
      <div><div class="stat-num">${totalIssues}</div><div class="stat-label">Total Issues</div></div>
      <div><div class="stat-num" style="color:#d97706">${highSeverity}</div><div class="stat-label">High</div></div>
      <div><div class="stat-num" style="color:#ff9500">${mediumSeverity}</div><div class="stat-label">Medium</div></div>
      <div><div class="stat-num" style="color:#636366">${lowSeverity}</div><div class="stat-label">Low</div></div>
      ${ackedCount > 0 ? `<div><div class="stat-num" style="color:#0071e3">${ackedCount}</div><div class="stat-label">Acknowledged</div></div>` : ""}
    </div>
  </div>

  <div class="section">
    <h2>Standards Alignment</h2>
    <div class="stats">
      <div><div class="stat-num">${cvcOeiIssues.length}</div><div class="stat-label">CVC-OEI</div></div>
      <div><div class="stat-num">${qmIssues.length}</div><div class="stat-label">Quality Matters</div></div>
      <div><div class="stat-num">${peraltaIssues.length}</div><div class="stat-label">Peralta</div></div>
    </div>
  </div>

  <div class="section">
    <h2>All Issues (${totalIssues})</h2>
    ${totalIssues === 0
      ? '<p style="color:#636366;font-size:14px;">No issues found.</p>'
      : `<table>
          <thead><tr><th>Issue</th><th>Location</th><th>Standards</th><th>Status</th></tr></thead>
          <tbody>${issueRows}</tbody>
        </table>`
    }
  </div>

  ${publishedIssues.length > 0 ? `
  <div class="section">
    <h2>Audit Log — Fixed Issues (${publishedIssues.length})</h2>
    <table>
      <thead><tr><th>Issue</th><th>Location</th><th>Fixed Date</th></tr></thead>
      <tbody>${fixedRows}</tbody>
    </table>
  </div>` : ""}

  <div class="footer">
    Generated by Simplify &nbsp;·&nbsp; ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} &nbsp;·&nbsp; For institutional compliance use
  </div>
</body>
</html>`;
  };

  const handleDownloadHTML = () => {
    const html = buildHTMLReport();
    const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-report-${courseName.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
    setShowDownloadMenu(false);
  };

  const handlePrint = () => {
    const html = buildHTMLReport();
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 500);
    }
    setShowDownloadMenu(false);
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop — no scroll lock, click to close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.2)', zIndex: 40 }}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full shadow-[0_8px_32px_rgba(0,0,0,0.12)] z-50 flex flex-col"
            style={{ width: '420px', background: '#EEECE8', borderTopLeftRadius: 16, borderBottomLeftRadius: 16, overflow: 'hidden' }}
          >
            {/* Header */}
            <div className="bg-white border-b border-[#e5e5e7] px-5 pt-4 pb-4 shrink-0 relative z-[100]">

              {/* Row 1: Title + Close */}
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-[20px] font-semibold text-[#1d1d1f] leading-tight">
                    Audit &amp; Evidence Report
                  </h2>
                  <button
                    onClick={() => { setShowReportGuide(!showReportGuide); setShowInfoPulse(false); localStorage.setItem('simplify_seen_report_info', '1'); }}
                    aria-label="How to use this report"
                    aria-expanded={showReportGuide}
                    title="How to use this report"
                    className={`relative w-5 h-5 flex items-center justify-center rounded-full hover:bg-[#f0f7ff] transition-colors shrink-0 group`}
                    style={showInfoPulse ? { animation: 'pulse-ring 2s ease-in-out 3' } : undefined}
                  >
                    <Info className="w-4 h-4 text-[#0071e3]" strokeWidth={1.5} />
                    {/* Tooltip */}
                    <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 px-2 py-1 rounded-md bg-[#1d1d1f] text-white text-[10px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                      How to use this report
                    </span>
                  </button>
                </div>
                <button
                  onClick={onClose}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#f5f5f7] transition-colors shrink-0"
                >
                  <X className="w-4 h-4 text-[#636366]" />
                </button>
              </div>

              {/* Row 2: Course selector */}
              <div className="mt-0.5 relative" ref={courseMenuRef}>
                <button
                  onClick={() => { setShowCourseMenu(!showCourseMenu); setShowDropdownHint(false); localStorage.setItem('simplify_seen_course_dropdown', '1'); }}
                  className="flex items-center gap-1 group max-w-full p-0"
                >
                  <span className="text-[15px] text-[#636366] shrink-0">{scanDateShort} ·</span>
                  <span className="text-[15px] text-[#1d1d1f] font-medium truncate max-w-[220px] group-hover:text-[#0071e3] transition-colors">
                    {activeCourseName}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#0071e3] shrink-0 transition-transform ${showCourseMenu ? "rotate-180" : ""}`} style={showDropdownHint ? { animation: 'bounce-hint 1.5s ease-in-out 3' } : undefined} />
                </button>
                <AnimatePresence>
                  {showCourseMenu && scannedCourses.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.97 }}
                      transition={{ duration: 0.12 }}
                      className="absolute top-[24px] left-0 bg-white rounded-xl border border-[#e5e5e7] shadow-xl overflow-hidden z-20 w-[220px]"
                    >
                      {scannedCourses.map((course) => (
                        <button
                          key={course.courseId}
                          onClick={() => handleCourseSelect(course.courseId)}
                          className={`w-full flex items-center justify-between px-4 py-2.5 hover:bg-[#f5f5f7] transition-colors text-left ${activeCourseId === course.courseId ? "bg-[#f0f7ff]" : ""}`}
                        >
                          <span className="text-[13px] text-[#1d1d1f] truncate">{course.courseName}</span>
                          {activeCourseId === course.courseId && (
                            <Check className="w-3.5 h-3.5 text-[#0071e3] shrink-0 ml-2" />
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-4 py-4 space-y-2">

                {/* How to Use This Report — inline guide */}
                <AnimatePresence>
                  {showReportGuide && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-white rounded-xl border border-[#e5e5e7] p-4 mb-1">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-[15px] font-semibold text-[#1d1d1f]">How to Use This Report</h3>
                          <button onClick={() => setShowReportGuide(false)} aria-label="Close guide" className="w-6 h-6 rounded-full hover:bg-[#f5f5f7] flex items-center justify-center text-[#636366] hover:text-[#1d1d1f] transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="space-y-2.5 text-[13px] leading-relaxed">
                          <div className="flex gap-3">
                            <span className="text-[16px] shrink-0 mt-0.5" aria-hidden="true">1</span>
                            <p className="text-[#636366]"><span className="font-semibold text-[#1d1d1f]">Review severity levels.</span> High issues block access and must be fixed first. Medium reduces usability. Low is best practice.</p>
                          </div>
                          <div className="flex gap-3">
                            <span className="text-[16px] shrink-0 mt-0.5" aria-hidden="true">2</span>
                            <p className="text-[#636366]"><span className="font-semibold text-[#1d1d1f]">Expand each standard</span> (CVC-OEI, Quality Matters, Peralta) to see issues grouped by rubric.</p>
                          </div>
                          <div className="flex gap-3">
                            <span className="text-[16px] shrink-0 mt-0.5" aria-hidden="true">3</span>
                            <p className="text-[#636366]"><span className="font-semibold text-[#1d1d1f]">Acknowledge issues</span> by clicking the checkmark. Add an optional note for your records.</p>
                          </div>
                          <div className="flex gap-3">
                            <span className="text-[16px] shrink-0 mt-0.5" aria-hidden="true">4</span>
                            <p className="text-[#636366]"><span className="font-semibold text-[#1d1d1f]">Download the evidence pack</span> — CSV for accreditation records, or HTML report to share with your dean.</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Report Details */}
                <div className="bg-white rounded-xl border border-[#e5e5e7] overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#f0f0f0] bg-[#fafafa]">
                    <ClipboardList className="w-4 h-4 text-[#636366]" />
                    <p className="text-[14px] text-[#1d1d1f] font-semibold">Report Details</p>
                  </div>
                  {summaryText && (
                    <div className="px-4 py-3">
                      <p className="text-[13px] text-[#1d1d1f] leading-relaxed">{summaryText}</p>
                    </div>
                  )}
                </div>

                {/* Download — full-width pill CTA */}
                <div className="relative" ref={downloadRef}>
                  <button
                    onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                    className="w-full flex items-center justify-center gap-2 bg-[#0071e3] hover:bg-[#0077ed] active:bg-[#006dda] text-white px-5 py-3 rounded-2xl text-[14px] font-medium transition-colors"
                  >
                    <Download className="w-4 h-4 shrink-0" />
                    <span>Download Evidence Pack</span>
                    <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${showDownloadMenu ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {showDownloadMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.97 }}
                        transition={{ duration: 0.12 }}
                        className="absolute bottom-full mb-1.5 right-0 bg-white rounded-xl border border-[#e5e5e7] shadow-xl overflow-hidden z-[200] w-[230px]"
                      >
                        <button
                          onClick={handleDownloadCSV}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#f5f5f7] transition-colors text-left"
                        >
                          <FileSpreadsheet className="w-4 h-4 text-[#0071e3] shrink-0" />
                          <div>
                            <p className="text-[13px] font-medium text-[#1d1d1f]">Issues Spreadsheet</p>
                            <p className="text-[11px] text-[#636366]">CSV · Opens in Excel</p>
                          </div>
                        </button>
                        <div className="h-px bg-[#f0f0f0] mx-3" />
                        <button
                          onClick={handleDownloadHTML}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#f5f5f7] transition-colors text-left"
                        >
                          <FileText className="w-4 h-4 text-[#0071e3] shrink-0" />
                          <div>
                            <p className="text-[13px] font-medium text-[#1d1d1f]">Audit Report</p>
                            <p className="text-[11px] text-[#636366]">HTML · Save as PDF</p>
                          </div>
                        </button>
                        <div className="h-px bg-[#f0f0f0] mx-3" />
                        <button
                          onClick={handlePrint}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#f5f5f7] transition-colors text-left"
                        >
                          <Printer className="w-4 h-4 text-[#636366] shrink-0" />
                          <div>
                            <p className="text-[13px] font-medium text-[#1d1d1f]">Print</p>
                            <p className="text-[11px] text-[#636366]">Send to printer or save as PDF</p>
                          </div>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* No scan state */}
                {totalIssues === 0 && activeHistoryIndex === 0 && (
                  <div className="bg-white rounded-xl border border-[#e5e5e7] p-6 text-center">
                    <p className="text-[14px] font-medium text-[#1d1d1f] mb-1">No scan data yet</p>
                    <p className="text-[12px] text-[#636366]">
                      Run a scan on a course to generate your audit report.
                    </p>
                  </div>
                )}

                {/* Compliance Status */}
                {totalIssues > 0 && (
                  <div
                    className="rounded-xl border border-[#e5e5e7] overflow-hidden"
                    style={{ display: 'flex', background: 'white' }}
                  >
                    {/* Stripe removed for cleaner look */}
                    <div className="px-4 py-3" style={{ flex: 1 }}>
                      {/* Number + badge row */}
                      <div className="flex items-start justify-between mb-2.5">
                        <div>
                          <div style={{ fontSize: '30px', fontWeight: 700, color: '#1d1d1f', lineHeight: 1 }}>{totalIssues}</div>
                          <div className="text-[14px] font-normal text-[#636366] mt-0.5">Issues to review</div>
                        </div>
                        <span
                          className="text-[12px] font-semibold px-3 py-1.5 rounded-full shrink-0"
                          style={{ background: complianceColors.bg, color: complianceColors.text }}
                        >
                          {complianceStatus}
                        </span>
                      </div>
                      {/* Severity chips */}
                      <div className="flex gap-2">
                        {[
                          { n: highSeverity, label: 'High', color: '#92400e', bg: '#ffedd5' },
                          { n: mediumSeverity, label: 'Medium', color: '#d97706', bg: '#fef3c7' },
                          { n: lowSeverity, label: 'Low', color: '#1e40af', bg: '#dbeafe' },
                        ].map(({ n, label, color, bg }) => (
                          <div key={label} className="flex items-center gap-1 px-2.5 py-1 rounded-lg" style={{ background: bg }}>
                            <span className="text-[14px] font-bold leading-none" style={{ color }}>{n}</span>
                            <span className="text-[12px] font-semibold" style={{ color }}>{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Data Visualization — Slope Chart */}
                {totalIssues > 0 && (() => {
                  // Compute per-standard scores: base 100, high=-10, medium=-5, low=-2
                  const computeScore = (issues: any[]) => {
                    let score = 100;
                    for (const issue of issues) {
                      if (issue.severity === 'high') score -= 10;
                      else if (issue.severity === 'medium') score -= 5;
                      else score -= 2;
                    }
                    return Math.max(0, score);
                  };
                  const computeAfterScore = (issues: any[]) => {
                    const open = issues.filter((i: any) => i.status !== 'published' && i.status !== 'resolved');
                    return computeScore(open);
                  };

                  const cvcBefore = computeScore(cvcOeiIssues);
                  const cvcAfter = computeAfterScore(cvcOeiIssues);
                  const qmBefore = computeScore(qmIssues);
                  const qmAfter = computeAfterScore(qmIssues);
                  const perBefore = computeScore(peraltaIssues);
                  const perAfter = computeAfterScore(peraltaIssues);
                  const target = 85;

                  const stds = [
                    { label: 'CVC-OEI', before: cvcBefore, after: cvcAfter, color: '#f97316' },
                    { label: 'QM', before: qmBefore, after: qmAfter, color: '#3b82f6' },
                    { label: 'Peralta', before: perBefore, after: perAfter, color: '#22c55e' },
                  ];

                  // All rendering inside one self-contained SVG — no overflow issues
                  const svgW = 360;
                  const svgH = 170;
                  const chartL = 50;   // left edge of slope lines
                  const chartR = 250;  // right edge of slope lines
                  const chartTop = 30;
                  const chartBot = 145;
                  const toY = (v: number) => chartTop + ((100 - v) / 100) * (chartBot - chartTop);

                  // Spread overlapping labels apart (min gap), clamped within chart bounds
                  const spreadLabels = (positions: { y: number; idx: number }[]) => {
                    const sorted = [...positions].sort((a, b) => a.y - b.y);
                    const minGap = 16;
                    // Push down
                    for (let i = 1; i < sorted.length; i++) {
                      if (sorted[i].y - sorted[i - 1].y < minGap) {
                        sorted[i].y = sorted[i - 1].y + minGap;
                      }
                    }
                    // If last label went past bottom, push everything up
                    const maxY = chartBot - 4;
                    if (sorted.length > 0 && sorted[sorted.length - 1].y > maxY) {
                      const overflow = sorted[sorted.length - 1].y - maxY;
                      for (const p of sorted) p.y -= overflow;
                    }
                    // Clamp top
                    for (const p of sorted) p.y = Math.max(chartTop, p.y);
                    return sorted;
                  };

                  const beforePositions = spreadLabels(stds.map((s, i) => ({ y: toY(s.before), idx: i })));
                  const afterPositions = spreadLabels(stds.map((s, i) => ({ y: toY(s.after), idx: i })));

                  return (
                    <div className="bg-white rounded-xl border border-[#e5e5e7] p-4">
                      <div className="text-[13px] font-semibold text-[#1d1d1f] mb-2">Score Movement by Standard</div>
                      <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`} style={{ display: 'block' }}>
                        {/* Gridlines */}
                        {[0, 25, 50, 75, 100].map(v => (
                          <line key={v} x1={chartL} x2={chartR} y1={toY(v)} y2={toY(v)} stroke="#f0f0f0" strokeWidth="0.75" />
                        ))}
                        {/* Target dashed line */}
                        <line x1={chartL} x2={chartR} y1={toY(target)} y2={toY(target)} stroke="#1d1d1f" strokeWidth="0.75" strokeDasharray="4 3" />
                        {/* Slope lines + dots */}
                        {stds.map(s => (
                          <g key={s.label}>
                            <line x1={chartL} y1={toY(s.before)} x2={chartR} y2={toY(s.after)} stroke={s.color} strokeWidth="2.5" strokeLinecap="round" />
                            <circle cx={chartL} cy={toY(s.before)} r="4.5" fill="white" stroke={s.color} strokeWidth="2" />
                            <circle cx={chartR} cy={toY(s.after)} r="5" fill={s.color} />
                          </g>
                        ))}
                        {/* Before labels (left side, spread to avoid overlap) */}
                        {beforePositions.map(pos => {
                          const s = stds[pos.idx];
                          return (
                            <text key={s.label} x={chartL - 8} y={pos.y + 4} textAnchor="end" fill={s.color} style={{ fontSize: '12px', fontWeight: 700 }}>{s.before}</text>
                          );
                        })}
                        {/* After labels (right side — score + standard name, spread) */}
                        {afterPositions.map(pos => {
                          const s = stds[pos.idx];
                          return (
                            <g key={s.label}>
                              <text x={chartR + 10} y={pos.y + 4} fill={s.color} style={{ fontSize: '12px', fontWeight: 700 }}>{s.after}</text>
                              <text x={chartR + 32} y={pos.y + 4} fill="#86868b" style={{ fontSize: '10px', fontWeight: 500 }}>{s.label}</text>
                            </g>
                          );
                        })}
                        {/* Axis labels */}
                        <text x={chartL} y={svgH - 4} textAnchor="middle" fill="#86868b" style={{ fontSize: '10px', fontWeight: 500 }}>Before</text>
                        <text x={(chartL + chartR) / 2} y={svgH - 4} textAnchor="middle" fill="#86868b" style={{ fontSize: '10px', fontWeight: 500 }}>--- Target ({target})</text>
                        <text x={chartR} y={svgH - 4} textAnchor="middle" fill="#86868b" style={{ fontSize: '10px', fontWeight: 500 }}>After</text>
                      </svg>
                    </div>
                  );
                })()}

                {/* Data Visualization — Top Issues by Frequency */}
                {totalIssues > 0 && (() => {
                  // Count issues by human-readable category
                  const categoryLabels: Record<string, string> = {
                    'alt-text': 'Missing Alt Text',
                    'color-contrast': 'Low Contrast',
                    'missing-rubric': 'No Rubric',
                    'rubric': 'No Rubric',
                    'objectives': 'Vague Objectives',
                    'long-paragraphs': 'Long Paragraphs',
                    'link-text': 'Link Text',
                    'headings': 'Heading Issues',
                    'tables': 'Table Issues',
                    'broken-link': 'Broken Links',
                    'captions': 'Missing Captions',
                    'link-accessibility': 'Link Accessibility',
                    'font-size': 'Font Size',
                    'font-variety': 'Too Many Fonts',
                    'policies': 'Policies',
                    'design-consistency': 'Design Issues',
                    'navigation': 'Navigation',
                    'audio-description': 'Audio Description',
                  };
                  const counts: Record<string, number> = {};
                  for (const issue of activeResults) {
                    const cat = issue.category || 'other';
                    const label = categoryLabels[cat] || cat.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
                    counts[label] = (counts[label] || 0) + 1;
                  }
                  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
                  if (sorted.length === 0) return null;

                  const severityForCount = (n: number) => n >= 5 ? '#c62828' : n >= 3 ? '#b36b00' : '#636366';

                  return (
                    <div className="bg-white rounded-xl border border-[#e5e5e7] px-5 pt-4 pb-4">
                      <div className="text-[13px] font-semibold text-[#1d1d1f] mb-3">Top Issues by Frequency</div>
                      <div className="space-y-2.5">
                        {sorted.map(([label, count]) => (
                          <div key={label} className="flex items-center gap-3">
                            <span className="text-[13px] text-[#636366] font-medium shrink-0">{label}</span>
                            <div className="flex-1 border-b border-dotted border-[#d2d2d7]" />
                            <span className="text-[15px] font-bold shrink-0" style={{ color: severityForCount(count) }}>{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Standards Sections */}
                <StandardSection
                  title="CVC-OEI"
                  issues={cvcOeiIssues}
                  expanded={expanded.cvcOei}
                  onToggle={() => toggle("cvcOei")}
                  acknowledgments={acknowledgments}
                  onAcknowledge={handleAcknowledge}
                />
                <StandardSection
                  title="Quality Matters"
                  issues={qmIssues}
                  expanded={expanded.qm}
                  onToggle={() => toggle("qm")}
                  acknowledgments={acknowledgments}
                  onAcknowledge={handleAcknowledge}
                />
                <StandardSection
                  title="Peralta"
                  issues={peraltaIssues}
                  expanded={expanded.peralta}
                  onToggle={() => toggle("peralta")}
                  acknowledgments={acknowledgments}
                  onAcknowledge={handleAcknowledge}
                />

                {/* Audit Log */}
                <div className="bg-white rounded-xl border border-[#e5e5e7] overflow-hidden">
                  <button
                    onClick={() => toggle("auditLog")}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#f9f9fb] transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      {expanded.auditLog
                        ? <ChevronDown className="w-4 h-4 text-[#636366]" />
                        : <ChevronRight className="w-4 h-4 text-[#636366]" />
                      }
                      <span className="text-[14px] font-semibold text-[#1d1d1f]">Audit Log</span>
                    </div>
                    <span className="text-[12px] text-[#636366] font-medium">
                      {publishedIssues.length} {publishedIssues.length === 1 ? "fix" : "fixes"} logged
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {expanded.auditLog && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-3">
                          {publishedIssues.length === 0 ? (
                            <p className="text-[13px] text-[#636366] py-2">
                              No fixes published yet. Fixes applied through Simplify will appear here.
                            </p>
                          ) : (
                            publishedIssues.map((issue: any) => (
                              <div
                                key={issue.id}
                                className="flex items-start gap-3 py-2.5 border-b border-[#f0f0f0] last:border-0"
                              >
                                <CheckCircle2 className="w-4 h-4 text-[#34c759] shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[13px] font-medium text-[#1d1d1f] leading-snug">
                                    {issue.title}
                                  </p>
                                  <p className="text-[11px] text-[#636366] mt-0.5">{issue.location}</p>
                                </div>
                                <div className="text-[11px] text-[#636366] shrink-0 text-right">
                                  {issue.stagedFix?.timestamp
                                    ? new Date(issue.stagedFix.timestamp).toLocaleDateString()
                                    : ""}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
