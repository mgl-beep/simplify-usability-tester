import { useState, useRef, useEffect } from "react";
import { X, Send, MessageSquareMore } from "lucide-react";
import { createPortal } from "react-dom";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface AIHelpChatProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

const INITIAL_MESSAGE = "Hi! I'm SIMPLIFY's AI assistant. Ask me anything about scanning courses, fixing issues, or accessibility standards.";

const QUICK_PROMPTS = [
  "How do I scan?",
  "How to fix alt text?",
  "What does my score mean?",
];

export function AIHelpChat({ isOpen, onClose }: AIHelpChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", text: INITIAL_MESSAGE }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Reset messages when panel opens
  useEffect(() => {
    if (isOpen) {
      setMessages([{ role: "assistant", text: INITIAL_MESSAGE }]);
      setInput("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Escape closes
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: ChatMessage = { role: "user", text: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-74508696/ai/help-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ question: text.trim() })
        }
      );
      const data = await response.json();
      if (data.success && data.answer) {
        setMessages(prev => [...prev, { role: "assistant", text: data.answer }]);
      } else if (data.aiUnavailable) {
        setMessages(prev => [...prev, { role: "assistant", text: "AI is temporarily unavailable. Please try again later." }]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", text: "Sorry, I couldn't get an answer. Please try again." }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", text: "Something went wrong. Please check your connection and try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/50"
      onClick={handleBackdropClick}
    >
      <div
        className="flex flex-col bg-white border border-[#d2d2d7] overflow-hidden shadow-2xl"
        style={{
          position: 'fixed',
          width: 320,
          height: '62vh',
          borderRadius: 20,
          bottom: 24,
          right: 24,
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Ask SIMPLIFY Chat"
      >
        {/* Header — sandstone */}
        <div className="px-5 py-4 border-b border-[#d2d2d7] bg-[#EEECE8] flex items-center justify-between shrink-0" style={{ borderRadius: '20px 20px 0 0' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#34c759]/15 flex items-center justify-center">
              <MessageSquareMore className="w-[22px] h-[22px] text-[#34c759]" strokeWidth={2} />
            </div>
            <h2 className="text-[17px] font-semibold text-[#1d1d1f]" style={{ marginLeft: -5 }}>Ask SIMPLIFY</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close AI help"
            className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-[#636366]" strokeWidth={2} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 min-h-0 overflow-y-auto" ref={scrollRef}>
          <div className="px-5 py-5 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] px-3.5 py-2 text-[14px] leading-relaxed ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-[#0071e3] to-[#34c759] text-white rounded-[16px]"
                      : "bg-[#f2f2f7] text-[#1d1d1f] rounded-[16px]"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Quick prompts */}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    className="px-3.5 py-[7px] text-[13px] font-medium bg-gradient-to-r from-[#0071e3]/10 to-[#34c759]/10 text-[#0071e3] rounded-full transition-all hover:scale-[1.03]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#f2f2f7] px-5 py-3 rounded-full">
                  <span className="inline-flex gap-[3px] items-center h-[18px]">
                    <span className="w-[6px] h-[6px] rounded-full bg-[#86868b] animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-[6px] h-[6px] rounded-full bg-[#86868b] animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-[6px] h-[6px] rounded-full bg-[#86868b] animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input — sandstone footer */}
        <div className="px-5 pt-3 pb-5 border-t border-[#d2d2d7] bg-[#EEECE8] shrink-0" style={{ borderRadius: '0 0 20px 20px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question..."
              disabled={isLoading}
              style={{ width: '100%', height: 42, borderRadius: 9999, border: '1px solid #e5e5ea', backgroundColor: '#fff', paddingLeft: 16, paddingRight: 40, fontSize: 14, color: '#1d1d1f', outline: 'none' }}
            />
            <button
              type="button"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, opacity: !input.trim() || isLoading ? 0.3 : 1 }}
            >
              <Send className="w-[16px] h-[16px] text-[#86868b]" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
