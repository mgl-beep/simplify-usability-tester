import { useState, useEffect } from "react";
import { X, ExternalLink, CheckCircle, AlertCircle, Loader2, Sparkles, Shield } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  saveCanvasAccessToken,
  saveCanvasDomain,
  getCurrentUser,
  initializeCanvas,
} from "../utils/canvasAPI";
import { toast } from "sonner@2.0.3";
import { motion, AnimatePresence } from "motion/react";

interface CanvasConnectionModalProps {
  isOpen: boolean;
  onConnected: (userName: string) => void;
  onOpenPrivacy?: () => void;
}

export function CanvasConnectionModal({ isOpen, onConnected, onOpenPrivacy }: CanvasConnectionModalProps) {
  // Auto-populate Canvas domain on initialization
  const [domain, setDomain] = useState(() => {
    const currentHostname = window.location.hostname;
    
    // Check if on Canvas domain
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
      // Clean domain
      const cleanDomain = domain
        .replace(/^https?:\/\//, '')
        .split('/')[0]
        .replace(/\/$/, '')
        .trim();
      
      // Test connection
      const config = initializeCanvas(cleanDomain);
      config.accessToken = accessToken.trim();
      
      const user = await getCurrentUser(config);
      
      // Save credentials
      saveCanvasDomain(cleanDomain);
      saveCanvasAccessToken(accessToken.trim());
      
      toast.success(`Welcome, ${user.name}! SIMPLIFY is now connected.`);
      
      setTimeout(() => {
        onConnected(user.name);
      }, 800);
    } catch (err) {
      // Log connection errors but not as console.error for expected auth failures
      const errorMessage = err instanceof Error ? err.message : "Failed to connect to Canvas";
      
      if (errorMessage.includes('Invalid or expired') || errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
      } else {
        console.error("Canvas connection error:", err);
      }
      
      if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
        setError("Network error - Check if Canvas domain is correct");
      } else if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
        setError("Invalid access token - Generate a new token in Canvas");
      } else if (errorMessage.includes('Invalid or expired access token')) {
        setError("Unable to connect - Please check your Canvas domain and access token. Make sure you're using YOUR institution's Canvas domain (e.g., your-school.instructure.com), not the generic canvas.instructure.com");
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-[500px] bg-white rounded-[20px] shadow-2xl overflow-hidden"
        >
          {/* Header - Option 1: Subtle Gradient Band */}
          <div className="bg-gradient-to-r from-[#0071e3] via-[#0088cc] to-[#00a0b0] px-8 py-6 text-center">
            <h1 style={{ fontSize: 40, letterSpacing: '-0.02em', color: '#fff', fontWeight: 600, lineHeight: 1, margin: 0, marginBottom: -2 }}>
              SIMPLIFY<span style={{ display: 'inline-block', width: 6, height: 6, backgroundColor: '#fff', borderRadius: 0, verticalAlign: 'baseline', position: 'relative', top: -1, marginLeft: 0 }}></span>
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', margin: 0 }}>
              Connect to your Canvas account
            </p>
          </div>

          {/* Content */}
          <div className="px-8 py-6">
            <div className="text-center mb-5">
              <h2 className="text-[20px] font-semibold text-[#1d1d1f]" style={{ lineHeight: 1, marginBottom: 2 }}>
                Get Started
              </h2>
              <p className="text-[14px] text-[#636366]" style={{ marginTop: 0 }}>
                SIMPLIFY will integrate with your Canvas LMS
              </p>
            </div>

            <div className="space-y-4">
              {/* Domain Input */}
              <div className="space-y-1.5">
                <Label htmlFor="canvas-domain" className="text-[14px] font-semibold text-[#1d1d1f]">
                  Canvas Domain
                </Label>
                <Input
                  id="canvas-domain"
                  type="text"
                  placeholder="your-school.instructure.com"
                  value={domain}
                  onChange={(e) => {
                    const cleaned = e.target.value
                      .replace(/^https?:\/\//, '')
                      .split('/')[0]
                      .replace(/\/$/, '')
                      .trim();
                    setDomain(cleaned);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                  className="h-[44px] rounded-[10px] border-[#d2d2d7] text-[14px]"
                />
                <p className="text-[11px] text-[#636366]">
                  e.g., <span className="font-mono text-[#1d1d1f]">myschool.instructure.com</span>
                </p>
              </div>

              {/* Access Token Input */}
              <div className="space-y-1.5">
                <Label htmlFor="canvas-token" className="text-[14px] font-semibold text-[#1d1d1f]">
                  Access Token
                </Label>
                <Input
                  id="canvas-token"
                  type="password"
                  placeholder="1234~abcdefghijklmnopqrstuvwxyz"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                  className="h-[44px] rounded-[10px] border-[#d2d2d7] text-[14px]"
                />
                <a
                  href={`https://${domain || 'canvas.instructure.com'}/profile/settings`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] text-[#0071e3] hover:underline"
                >
                  <ExternalLink className="w-3 h-3" strokeWidth={2} />
                  Generate token in Canvas Settings
                </a>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2 p-3 bg-[#ff3b30]/10 border border-[#ff3b30]/20 rounded-[10px]"
                >
                  <AlertCircle className="w-4 h-4 text-[#ff3b30] mt-0.5 flex-shrink-0" strokeWidth={2} />
                  <p className="text-[12px] text-[#ff3b30]">{error}</p>
                </motion.div>
              )}

              {/* Connect Button */}
              <Button
                onClick={handleConnect}
                disabled={isConnecting || !domain || !accessToken}
                className="w-full bg-[#0071e3] hover:bg-[#0077ed] text-white h-[48px] rounded-[10px] disabled:opacity-50 disabled:cursor-not-allowed text-[15px] font-semibold shadow-lg"
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

              {/* Info Note */}
              <div className="p-3 bg-[#EEECE8] rounded-[10px] border border-[#e5e5e7]">
                <div className="flex items-center justify-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#34c759]" strokeWidth={2} />
                  <p className="text-[12px] text-[#636366]">
                    Your credentials are stored locally and never shared.
                    {onOpenPrivacy && (
                      <>
                        {" "}
                        <button onClick={onOpenPrivacy} className="text-[#0071e3] font-medium hover:underline">
                          Privacy & Data
                        </button>
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}