import { useState } from "react";
import { X, ExternalLink, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  saveCanvasAccessToken,
  saveCanvasDomain,
  getCurrentUser,
  initializeCanvas,
  isConnectedToCanvas,
  removeCanvasAccessToken,
  getCanvasDomain
} from "../utils/canvasAPI";
import { toast } from "sonner@2.0.3";
import { AnimatePresence, motion } from "framer-motion";

interface CanvasConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected?: () => void;
}

export function CanvasConnectModal({ isOpen, onClose, onConnected }: CanvasConnectModalProps) {
  const [domain, setDomain] = useState(getCanvasDomain() || "");
  const [accessToken, setAccessToken] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(isConnectedToCanvas());

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
      
      setIsConnected(true);
      toast.success(`Connected to Canvas as ${user.name}!`);
      
      onConnected?.();
      
      setTimeout(() => {
        onClose();
      }, 1500);
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

  const handleDisconnect = () => {
    removeCanvasAccessToken();
    setIsConnected(false);
    setAccessToken("");
    toast.success("Disconnected from Canvas");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] max-w-[90vw] max-h-[85vh] bg-white rounded-[20px] shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-[#d2d2d7]">
              <div className="flex items-center justify-between">
                <h2 className="text-[22px] font-semibold tracking-tight text-[#1d1d1f]">
                  Connect to Canvas
                </h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full hover:bg-[#f5f5f7] flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-[#636366]" strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6 overflow-y-auto">
              {isConnected ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-[#34c759]/10 border border-[#34c759]/20 rounded-[12px]">
                    <CheckCircle className="w-5 h-5 text-[#34c759]" strokeWidth={2} />
                    <div className="flex-1">
                      <p className="text-[14px] font-semibold text-[#1d1d1f]">Connected to Canvas</p>
                      <p className="text-[12px] text-[#636366] mt-0.5">{domain}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[13px] text-[#636366]">
                      You can now upload corrected IMSCC files directly to your Canvas courses with one click!
                    </p>
                    <Button
                      onClick={handleDisconnect}
                      variant="outline"
                      className="w-full h-[40px] rounded-[10px] border-[#d2d2d7] hover:bg-[#f5f5f7]"
                    >
                      Disconnect from Canvas
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-[14px] text-[#636366]">
                    Connect SIMPLIFY to your Canvas account to enable one-click course uploads after fixing accessibility issues.
                  </p>

                  {/* Domain Input */}
                  <div className="space-y-2">
                    <Label htmlFor="canvas-domain" className="text-[13px] font-semibold text-[#1d1d1f]">
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
                      className="h-[40px] rounded-[10px] border-[#d2d2d7]"
                    />
                    <p className="text-[11px] text-[#636366]">
                      ⚠️ Just the domain name only (e.g., <span className="font-mono">canvas.instructure.com</span>)
                    </p>
                  </div>

                  {/* Access Token Input */}
                  <div className="space-y-2">
                    <Label htmlFor="canvas-token" className="text-[13px] font-semibold text-[#1d1d1f]">
                      Access Token
                    </Label>
                    <Input
                      id="canvas-token"
                      type="password"
                      placeholder="1234~abcdefghijklmnopqrstuvwxyz"
                      value={accessToken}
                      onChange={(e) => setAccessToken(e.target.value)}
                      className="h-[40px] rounded-[10px] border-[#d2d2d7]"
                    />
                    <a
                      href={`https://${domain || 'canvas.instructure.com'}/profile/settings`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[11px] text-[#0071e3] hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" strokeWidth={2} />
                      Generate access token in Canvas Settings
                    </a>
                  </div>

                  {/* Instructions */}
                  <div className="p-4 bg-[#EEECE8] rounded-[10px] space-y-2">
                    <p className="text-[12px] font-semibold text-[#1d1d1f]">
                      How to generate an access token:
                    </p>
                    <ol className="text-[11px] text-[#636366] space-y-1 ml-4 list-decimal">
                      <li>Log into your Canvas account</li>
                      <li>Go to Account → Settings</li>
                      <li>Scroll to "Approved Integrations"</li>
                      <li>Click "+ New Access Token"</li>
                      <li>Give it a name (e.g., "SIMPLIFY") and generate</li>
                      <li>Copy the token and paste it above</li>
                    </ol>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="flex items-start gap-2 p-3 bg-[#ff3b30]/10 border border-[#ff3b30]/20 rounded-[10px]">
                      <AlertCircle className="w-4 h-4 text-[#ff3b30] mt-0.5" strokeWidth={2} />
                      <p className="text-[12px] text-[#ff3b30]">{error}</p>
                    </div>
                  )}

                  {/* Connect Button */}
                  <Button
                    onClick={handleConnect}
                    disabled={isConnecting || !domain || !accessToken}
                    type="button"
                    className="w-full bg-[#0071e3] hover:bg-[#0077ed] text-white h-[44px] rounded-[10px] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" strokeWidth={2} />
                        Connecting...
                      </>
                    ) : (
                      "Connect to Canvas"
                    )}
                  </Button>

                  {/* Info Message */}
                  <div className="p-3 bg-[#0071e3]/10 border border-[#0071e3]/20 rounded-[10px]">
                    <p className="text-[11px] text-[#1d1d1f] font-semibold mb-1">
                      💡 Canvas connection is optional!
                    </p>
                    <p className="text-[10px] text-[#636366]">
                      If connection fails due to browser security restrictions, you can still export IMSCC files and manually upload them to Canvas.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}