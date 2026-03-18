import { useState, useEffect } from "react";
import { X, ExternalLink, CheckCircle, AlertCircle, Loader2, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  saveCanvasAccessToken,
  saveCanvasDomain,
  getCurrentUser,
  initializeCanvas,
  isConnectedToCanvas,
} from "../utils/canvasAPI";
import { toast } from "sonner@2.0.3";
import { motion } from "motion/react";

// Simplify Icon Component
function SimplifyIcon({ className }: { className?: string }) {
  return (
    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" className={className}>
      {/* Shield outline */}
      <path d="M12 3 L4 6 L4 11 C4 15.5 7 19 12 21 C17 19 20 15.5 20 11 L20 6 L12 3 Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Checkmark inside */}
      <path d="M9 12 L11 14 L15 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

interface CanvasConnectionPromptProps {
  onConnected: () => void;
  showPrompt: boolean;
}

export function CanvasConnectionPrompt({ onConnected, showPrompt }: CanvasConnectionPromptProps) {
  // Debug: Log connection status
  
  // Auto-detect and populate Canvas domain on initialization
  const [domain, setDomain] = useState(() => {
    const currentHostname = window.location.hostname;
    
    // Check if we're on a Canvas domain
    if (currentHostname.includes('canvas') || currentHostname.includes('instructure')) {
      return currentHostname;
    }
    
    // Check referrer for embedded context
    try {
      const referrer = document.referrer;
      if (referrer) {
        const referrerUrl = new URL(referrer);
        const referrerHost = referrerUrl.hostname;
        if (referrerHost.includes('canvas') || referrerHost.includes('instructure')) {
          return referrerHost;
        }
      }
    } catch (err) {
      // Continue to default
    }
    
    // Default: Use common Canvas domain
    return 'canvas.instructure.com';
  });
  
  const [accessToken, setAccessToken] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    if (!domain || !accessToken) {
      setError("Please provide both Canvas domain and access token");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Strip https://, paths, and trailing slashes from domain
      const cleanDomain = domain
        .replace(/^https?:\/\//, '')  // Remove https://
        .split('/')[0]                // Take only domain, remove paths like /courses/...
        .replace(/\/$/, '')           // Remove trailing slash
        .trim();
      
      // Test connection by fetching user info
      const config = initializeCanvas(cleanDomain);
      config.accessToken = accessToken.trim();
      
      const user = await getCurrentUser(config);
      
      // Save credentials with clean domain
      saveCanvasDomain(cleanDomain);
      saveCanvasAccessToken(accessToken.trim());
      
      toast.success(`Welcome, ${user.name}! Connected to Canvas successfully.`);
      
      setTimeout(() => {
        onConnected();
      }, 1000);
    } catch (err) {
      // Log connection errors but not as console.error for expected auth failures
      const errorMessage = err instanceof Error ? err.message : "Failed to connect to Canvas";
      
      if (errorMessage.includes('Invalid or expired') || errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
      } else {
        console.error("Canvas connection error:", err);
      }
      
      // Provide more helpful error messages
      if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
        setError("Network error - Check if Canvas domain is correct and accessible");
      } else if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
        setError("Invalid access token - Please generate a new token in Canvas");
      } else if (errorMessage.includes('cors')) {
        setError("CORS error - This may be a browser security restriction");
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSkip = () => {
    // Allow users to skip and explore without Canvas
    toast.info("You can connect to Canvas anytime from the SIMPLIFY tab");
    onConnected();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EEECE8] via-[#EEECE8] to-[#E4E2DE] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[600px] bg-white rounded-[24px] shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-[#0071e3] to-[#0059b3] px-8 py-12 text-center">
          <div className="flex justify-center mb-4">
            <SimplifyIcon className="text-white" />
          </div>
          <h1 className="text-[42px] tracking-[0.02em] text-white font-[600] leading-none mb-2">
            SIMPLIFY
          </h1>
          <p className="text-[17px] text-white/90 max-w-[400px] mx-auto">
            Your intelligent LMS accessibility and course design assistant
          </p>
        </div>

        {/* Content */}
        <div className="px-8 py-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-[#0071e3]/10 px-4 py-2 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-[#0071e3]" strokeWidth={2} />
              <span className="text-[13px] font-semibold text-[#0071e3]">Connect to Canvas</span>
            </div>
            <h2 className="text-[28px] font-semibold text-[#1d1d1f] mb-2">
              Let's Get Started
            </h2>
            <p className="text-[15px] text-[#636366] max-w-[450px] mx-auto">
              Connect your Canvas account to scan courses, fix accessibility issues, and upload improved content directly.
            </p>
          </div>

          <div className="space-y-5">
            {/* Domain Input */}
            <div className="space-y-2">
              <Label htmlFor="canvas-domain" className="text-[14px] font-semibold text-[#1d1d1f]">
                Canvas Domain
              </Label>
              <Input
                id="canvas-domain"
                type="text"
                placeholder="canvas.instructure.com"
                value={domain}
                onChange={(e) => {
                  // Auto-strip https://, paths, and trailing slashes as user types
                  const cleaned = e.target.value
                    .replace(/^https?:\/\//, '')  // Remove https://
                    .split('/')[0]                // Take only domain, remove paths
                    .replace(/\/$/, '')           // Remove trailing slash
                    .trim();
                  setDomain(cleaned);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleConnect();
                  }
                }}
                className="h-[48px] rounded-[12px] border-[#d2d2d7] text-[15px]"
              />
              <p className="text-[12px] text-[#636366]">
                Just the domain name (e.g., <span className="font-mono text-[#1d1d1f]">canvas.instructure.com</span>)
              </p>
            </div>

            {/* Access Token Input */}
            <div className="space-y-2">
              <Label htmlFor="canvas-token" className="text-[14px] font-semibold text-[#1d1d1f]">
                Access Token
              </Label>
              <Input
                id="canvas-token"
                type="password"
                placeholder="1234~abcdefghijklmnopqrstuvwxyz"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleConnect();
                  }
                }}
                className="h-[48px] rounded-[12px] border-[#d2d2d7] text-[15px]"
              />
              <a
                href={`https://${domain || 'canvas.instructure.com'}/profile/settings`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[12px] text-[#0071e3] hover:underline"
              >
                <ExternalLink className="w-3 h-3" strokeWidth={2} />
                Generate access token in Canvas Settings
              </a>
            </div>

            {/* Instructions */}
            <div className="p-4 bg-[#f5f5f7] rounded-[12px] space-y-2">
              <p className="text-[13px] font-semibold text-[#1d1d1f]">
                Quick Setup Guide:
              </p>
              <ol className="text-[12px] text-[#636366] space-y-1 ml-4 list-decimal">
                <li>Log into your Canvas account</li>
                <li>Go to Account → Settings</li>
                <li>Scroll to "Approved Integrations"</li>
                <li>Click "+ New Access Token"</li>
                <li>Name it "SIMPLIFY" and generate</li>
                <li>Copy the token and paste above</li>
              </ol>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 p-4 bg-[#ff3b30]/10 border border-[#ff3b30]/20 rounded-[12px]"
              >
                <AlertCircle className="w-5 h-5 text-[#ff3b30] mt-0.5 flex-shrink-0" strokeWidth={2} />
                <p className="text-[13px] text-[#ff3b30]">{error}</p>
              </motion.div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleSkip}
                variant="outline"
                className="flex-1 h-[52px] rounded-[12px] border-[#d2d2d7] hover:bg-[#f5f5f7] text-[15px] font-semibold"
              >
                Skip for Now
              </Button>
              <Button
                onClick={handleConnect}
                disabled={isConnecting || !domain || !accessToken}
                className="flex-1 bg-[#0071e3] hover:bg-[#0077ed] text-white h-[52px] rounded-[12px] disabled:opacity-50 disabled:cursor-not-allowed text-[15px] font-semibold shadow-lg"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" strokeWidth={2} />
                    Connecting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" strokeWidth={2} />
                    Connect to Canvas
                  </>
                )}
              </Button>
            </div>

            {/* Info Note */}
            <div className="p-3 bg-[#0071e3]/10 border border-[#0071e3]/20 rounded-[10px]">
              <p className="text-[11px] text-[#1d1d1f] font-semibold mb-1">
                🔒 Your data is secure
              </p>
              <p className="text-[10px] text-[#636366]">
                Your Canvas credentials are stored locally in your browser and never sent to external servers.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}