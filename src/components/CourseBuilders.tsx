import { useState } from "react";
import { ExternalLink, Sparkles, Loader2, Check } from "lucide-react";
import { Button } from "./ui/button";
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { getCanvasConfig } from '../utils/canvasAPI';
import { toast } from 'sonner';

interface CourseBuildersProps {
  courseName?: string;
  courseId?: string;
}

export function CourseBuilders({ courseName, courseId }: CourseBuildersProps) {
  // Welcome Announcement builder state
  const [showWelcomeForm, setShowWelcomeForm] = useState(false);
  const [welcomeTitle, setWelcomeTitle] = useState('');
  const [welcomeBody, setWelcomeBody] = useState('');
  const [isGeneratingWelcome, setIsGeneratingWelcome] = useState(false);
  const [isPostingWelcome, setIsPostingWelcome] = useState(false);

  // Discussion Board builder state
  const [showDiscussionForm, setShowDiscussionForm] = useState(false);
  const [discussionTitle, setDiscussionTitle] = useState('');
  const [discussionBody, setDiscussionBody] = useState('');
  const [isGeneratingDiscussion, setIsGeneratingDiscussion] = useState(false);
  const [isPostingDiscussion, setIsPostingDiscussion] = useState(false);

  const defaultWelcomeTitle = `Welcome to ${courseName || 'the Course'}!`;
  const defaultDiscussionTitle = `${courseName || 'Course'} — Peer Discussion`;

  async function generateWelcome() {
    setIsGeneratingWelcome(true);
    setWelcomeBody('');
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74508696/ai/generate-template`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ category: 'instructor-contact', context: { courseName: courseName || 'your course' } })
        }
      );
      const data = await response.json();
      setWelcomeBody(data.rewritten || data.content || '');
    } catch {
      toast.error('Could not generate — try writing your own above.');
    } finally {
      setIsGeneratingWelcome(false);
    }
  }

  async function generateDiscussion() {
    setIsGeneratingDiscussion(true);
    setDiscussionBody('');
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74508696/ai/generate-template`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ category: 'student-interaction', context: { courseName: courseName || 'your course' } })
        }
      );
      const data = await response.json();
      setDiscussionBody(data.rewritten || data.content || '');
    } catch {
      toast.error('Could not generate — try writing your own above.');
    } finally {
      setIsGeneratingDiscussion(false);
    }
  }

  async function postWelcomeAnnouncement() {
    if (!courseId) { toast.error('No course selected. Select a course first.'); return; }
    if (!welcomeBody.trim()) { toast.error('Please add a message first.'); return; }
    setIsPostingWelcome(true);
    try {
      const config = getCanvasConfig();
      if (!config) throw new Error('Canvas not configured');
      const title = welcomeTitle.trim() || defaultWelcomeTitle;
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74508696/canvas/create-announcement`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain: config.domain, accessToken: config.accessToken, courseId, title, message: welcomeBody.trim() })
        }
      );
      if (!response.ok) throw new Error('Failed to post');
      toast.success('Welcome announcement posted to Canvas!');
      setShowWelcomeForm(false);
      setWelcomeTitle('');
      setWelcomeBody('');
    } catch (e) {
      toast.error('Failed to post announcement. Try again.');
    } finally {
      setIsPostingWelcome(false);
    }
  }

  async function postDiscussion() {
    if (!courseId) { toast.error('No course selected. Select a course first.'); return; }
    if (!discussionBody.trim()) { toast.error('Please add a discussion prompt first.'); return; }
    setIsPostingDiscussion(true);
    try {
      const config = getCanvasConfig();
      if (!config) throw new Error('Canvas not configured');
      const title = discussionTitle.trim() || defaultDiscussionTitle;
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74508696/canvas/create-discussion`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain: config.domain, accessToken: config.accessToken, courseId, title, message: discussionBody.trim() })
        }
      );
      if (!response.ok) throw new Error('Failed to post');
      toast.success('Discussion board created in Canvas!');
      setShowDiscussionForm(false);
      setDiscussionTitle('');
      setDiscussionBody('');
    } catch (e) {
      toast.error('Failed to create discussion. Try again.');
    } finally {
      setIsPostingDiscussion(false);
    }
  }

  const builders = [
    {
      id: "ai-assignment",
      name: "AI Assignment Generator",
      fullDescription: "Create AI literacy assignments with interactive chatbot experiences.",
      features: ["AI literacy templates", "Prompt engineering exercises", "Interactive chatbot builder"],
      buttonText: "Open AI Generator",
      buttonAction: () => window.open('https://www.playlab.ai/project/cm5qzks0706qurr5pxgtuunjd', '_blank'),
      enabled: true,
      color: ["#7C4DC0", "#6B3CA8"]
    },
    {
      id: "syllabus-builder",
      name: "Syllabus Builder",
      fullDescription: "Create accessible syllabi with built-in templates and requirements.",
      features: ["Accessibility-compliant templates", "Auto-generated learning outcomes", "Policy and requirement checklist"],
      buttonText: "Coming Soon",
      buttonAction: null,
      enabled: false,
      color: ["#C8842A", "#B07020"]
    },
    {
      id: "course-builder",
      name: "Course Builder Template",
      fullDescription: "AI-powered course builder with automated accessibility checks.",
      features: ["Intelligent content organization", "Auto-generated navigation structure", "Optimized learning pathways"],
      buttonText: "Coming Soon",
      buttonAction: null,
      enabled: false,
      color: ["#4A48B0", "#3E3C98"]
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[22px] font-semibold text-[#1d1d1f] tracking-tight">Course Builders</h2>
        <p className="text-[15px] text-[#636366] mt-1">AI-powered tools to help you build and design course content</p>
      </div>

      <div className="grid grid-cols-3 gap-3 max-w-[840px]">
        {builders.map((builder) => (
          <div
            key={builder.id}
            className="bg-white/50 backdrop-blur-sm rounded-[12px] border border-[#d2d2d7] overflow-hidden hover:shadow-lg hover:border-[#c7c7cc] transition-all duration-200 flex flex-col"
          >
            <div className="h-[80px] flex-shrink-0" style={{ background: `linear-gradient(135deg, ${builder.color[0]}, ${builder.color[1]})` }} />
            <div className="p-5 flex flex-col flex-1">
              <h3 className="text-[15px] font-semibold text-[#1d1d1f] tracking-tight mb-2">{builder.name}</h3>
              <p className="text-[13px] text-[#636366] mb-4 leading-relaxed">{builder.fullDescription}</p>
              <ul className="space-y-2 mb-5 flex-1">
                {builder.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-[13px] text-[#1d1d1f]">
                    <span className="text-[#0071e3] text-[13px] leading-none">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-2 h-[36px] flex-shrink-0">
                <Button
                  onClick={builder.buttonAction || undefined}
                  disabled={!builder.enabled}
                  className="flex-1 h-full rounded-[8px] text-[13px] font-medium"
                  style={builder.enabled ? { backgroundColor: '#3b82f6', color: '#fff' } : { backgroundColor: '#b0b0b4', color: '#2c2c2e', cursor: 'not-allowed' }}
                >
                  {builder.buttonText}
                  {builder.enabled && <ExternalLink className="w-3 h-3 ml-1.5" strokeWidth={2} />}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Instructor Tools Section — hidden per request */}
      {false && <div className="grid grid-cols-2 gap-3 max-w-[560px]">

          {/* Welcome Announcement Card */}
          <div className="bg-white/50 backdrop-blur-sm rounded-[12px] border border-[#d2d2d7] overflow-hidden hover:shadow-lg hover:border-[#c7c7cc] transition-all duration-200 flex flex-col">
            <div className="h-[80px] bg-gradient-to-br from-[#059669] to-[#047857] flex-shrink-0" />
            <div className="p-5 flex flex-col flex-1">
              <h3 className="text-[15px] font-semibold text-[#1d1d1f] tracking-tight mb-2">Welcome Announcement</h3>
              <p className="text-[13px] text-[#636366] mb-4 leading-relaxed">Post a personalized welcome announcement to greet students at course start.</p>
              <ul className="space-y-2 mb-5 flex-1">
                {["AI-generated from your course", "Editable before posting", "Posts directly to Canvas"].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-[13px] text-[#1d1d1f]">
                    <span className="text-[#0071e3] text-[13px] leading-none">•</span><span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-2 h-[36px] flex-shrink-0">
                <Button
                  onClick={() => { setShowWelcomeForm(!showWelcomeForm); if (!showWelcomeForm) { setWelcomeTitle(defaultWelcomeTitle); generateWelcome(); } }}
                  className="flex-1 h-full rounded-[8px] text-[13px] font-medium bg-[#0071e3] hover:bg-[#0077ed] text-white"
                >
                  {showWelcomeForm ? 'Cancel' : 'Create Announcement'}
                </Button>
              </div>
            </div>

            {/* Inline form */}
            {showWelcomeForm && (
              <div className="px-5 pb-5 space-y-3 border-t border-[#e5e5e7] pt-4">
                <div>
                  <label className="text-[11px] font-semibold text-[#636366] uppercase tracking-wide mb-1 block">Title</label>
                  <input
                    type="text"
                    value={welcomeTitle || defaultWelcomeTitle}
                    onChange={(e) => setWelcomeTitle(e.target.value)}
                    className="w-full text-[13px] text-[#1d1d1f] bg-white border border-[#e5e5e7] rounded-[8px] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-[#636366] uppercase tracking-wide">Message</label>
                    {!isGeneratingWelcome && (
                      <button onClick={generateWelcome} className="text-[11px] text-[#0071e3] hover:text-[#0077ed] font-medium">
                        ↻ Regenerate
                      </button>
                    )}
                  </div>
                  {isGeneratingWelcome ? (
                    <div className="flex items-center gap-2 py-4 px-3 bg-[#EEECE8] border border-[#e5e5e7] rounded-[8px]" aria-live="polite">
                      <Loader2 className="w-4 h-4 text-[#0071e3] animate-spin flex-shrink-0" />
                      <span className="text-[12px] text-[#636366]">Generating from your course…</span>
                    </div>
                  ) : (
                    <textarea
                      value={welcomeBody}
                      onChange={(e) => setWelcomeBody(e.target.value)}
                      rows={5}
                      aria-label="Welcome message content"
                      className="w-full text-[13px] text-[#1d1d1f] bg-white border border-[#e5e5e7] rounded-[8px] p-3 resize-y leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
                      placeholder="Write your welcome message or use AI to generate one…"
                    />
                  )}
                </div>
                <Button
                  onClick={postWelcomeAnnouncement}
                  disabled={isPostingWelcome || isGeneratingWelcome || !welcomeBody.trim()}
                  className="w-full h-[36px] rounded-[8px] text-[13px] font-medium bg-[#34c759] hover:bg-[#2db44d] disabled:bg-[#34c759]/50 text-white flex items-center justify-center gap-2"
                >
                  {isPostingWelcome ? <><Loader2 className="w-3 h-3 animate-spin" /> Posting…</> : <><Check className="w-3 h-3" /> Post to Canvas</>}
                </Button>
              </div>
            )}
          </div>

          {/* Discussion Board Card */}
          <div className="bg-white/50 backdrop-blur-sm rounded-[12px] border border-[#d2d2d7] overflow-hidden hover:shadow-lg hover:border-[#c7c7cc] transition-all duration-200 flex flex-col">
            <div className="h-[80px] bg-gradient-to-br from-[#0891B2] to-[#0E7490] flex-shrink-0" />
            <div className="p-5 flex flex-col flex-1">
              <h3 className="text-[15px] font-semibold text-[#1d1d1f] tracking-tight mb-2">Discussion Board</h3>
              <p className="text-[13px] text-[#636366] mb-4 leading-relaxed">Create a peer interaction discussion to build community and collaborative learning.</p>
              <ul className="space-y-2 mb-5 flex-1">
                {["AI-generated discussion prompt", "Graded or ungraded options", "Posts directly to Canvas"].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-[13px] text-[#1d1d1f]">
                    <span className="text-[#0071e3] text-[13px] leading-none">•</span><span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-2 h-[36px] flex-shrink-0">
                <Button
                  onClick={() => { setShowDiscussionForm(!showDiscussionForm); if (!showDiscussionForm) { setDiscussionTitle(defaultDiscussionTitle); generateDiscussion(); } }}
                  className="flex-1 h-full rounded-[8px] text-[13px] font-medium bg-[#0071e3] hover:bg-[#0077ed] text-white"
                >
                  {showDiscussionForm ? 'Cancel' : 'Create Discussion'}
                </Button>
              </div>
            </div>

            {/* Inline form */}
            {showDiscussionForm && (
              <div className="px-5 pb-5 space-y-3 border-t border-[#e5e5e7] pt-4">
                <div>
                  <label className="text-[11px] font-semibold text-[#636366] uppercase tracking-wide mb-1 block">Title</label>
                  <input
                    type="text"
                    value={discussionTitle || defaultDiscussionTitle}
                    onChange={(e) => setDiscussionTitle(e.target.value)}
                    className="w-full text-[13px] text-[#1d1d1f] bg-white border border-[#e5e5e7] rounded-[8px] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-[#636366] uppercase tracking-wide">Discussion Prompt</label>
                    {!isGeneratingDiscussion && (
                      <button onClick={generateDiscussion} className="text-[11px] text-[#0071e3] hover:text-[#0077ed] font-medium">
                        ↻ Regenerate
                      </button>
                    )}
                  </div>
                  {isGeneratingDiscussion ? (
                    <div className="flex items-center gap-2 py-4 px-3 bg-[#EEECE8] border border-[#e5e5e7] rounded-[8px]" aria-live="polite">
                      <Loader2 className="w-4 h-4 text-[#0071e3] animate-spin flex-shrink-0" />
                      <span className="text-[12px] text-[#636366]">Generating from your course…</span>
                    </div>
                  ) : (
                    <textarea
                      value={discussionBody}
                      onChange={(e) => setDiscussionBody(e.target.value)}
                      rows={5}
                      aria-label="Discussion prompt content"
                      className="w-full text-[13px] text-[#1d1d1f] bg-white border border-[#e5e5e7] rounded-[8px] p-3 resize-y leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30"
                      placeholder="Write your discussion prompt or use AI to generate one…"
                    />
                  )}
                </div>
                <Button
                  onClick={postDiscussion}
                  disabled={isPostingDiscussion || isGeneratingDiscussion || !discussionBody.trim()}
                  className="w-full h-[36px] rounded-[8px] text-[13px] font-medium bg-[#34c759] hover:bg-[#2db44d] disabled:bg-[#34c759]/50 text-white flex items-center justify-center gap-2"
                >
                  {isPostingDiscussion ? <><Loader2 className="w-3 h-3 animate-spin" /> Posting…</> : <><Check className="w-3 h-3" /> Post to Canvas</>}
                </Button>
              </div>
            )}
          </div>

        </div>}
    </div>
  );
}
