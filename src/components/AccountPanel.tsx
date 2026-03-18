import { useState, useEffect } from "react";
import { X, User, ArrowRightLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getCanvasConfig, getCurrentUser, type CanvasUser } from "../utils/canvasAPI";
import { toast } from "sonner@2.0.3";

interface AccountPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onDisconnect: () => void;
}

export function AccountPanel({ isOpen, onClose, onDisconnect }: AccountPanelProps) {
  const [user, setUser] = useState<CanvasUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const config = getCanvasConfig();
  const canvasDomain = config?.domain;

  useEffect(() => {
    if (isOpen) {
      loadUserInfo();
    }
  }, [isOpen]);

  const loadUserInfo = async () => {
    try {
      const config = getCanvasConfig();
      if (!config) {
        setIsLoading(false);
        return;
      }

      const userData = await getCurrentUser(config);
      setUser(userData);
    } catch (error) {
      // Check if it's an auth error
      if (error instanceof Error && error.message.includes('Invalid or expired access token')) {
        // Don't log this as an error - it's expected when token is invalid
        toast.error("Session expired. Please reconnect to Canvas.");
        onClose();
        // Trigger a page reload to show the connection modal
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        console.error("Error loading user info:", error);
        toast.error("Failed to load user information");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchAccount = () => {
    if (confirm("Sign out and connect to a different Canvas account?")) {
      onClose();
      onDisconnect();
    }
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
            className="fixed inset-0 bg-black/20 z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed left-[86px] top-0 bottom-0 w-[372px] bg-white shadow-[4px_0_24px_-4px_rgba(0,0,0,0.1)] z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5E5]">
              <h2 className="text-[18px] font-medium text-[#2D3B45]">Account</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-[#F5F5F5] flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-[#6B7780]" strokeWidth={2} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="bg-white rounded-[12px] border border-[#E5E5E5] p-6">
                {/* User Profile Section - Centered */}
                <div className="flex flex-col items-center pb-5 border-b border-[#E5E5E5]">
                  {isLoading ? (
                    <div className="w-[60px] h-[60px] rounded-full bg-[#E5E5E5] animate-pulse mb-3" />
                  ) : (user?.avatar_url || user?.avatar_image_url) ? (
                    <img
                      src={user.avatar_url || user.avatar_image_url}
                      alt={user.name}
                      className="w-[60px] h-[60px] rounded-full bg-[#E5E5E5] object-cover mb-3"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  {(!user?.avatar_url && !user?.avatar_image_url) || !user ? (
                    <div className="w-[60px] h-[60px] rounded-full bg-[#D1D5DB] flex items-center justify-center mb-3">
                      <User className="w-7 h-7 text-[#9CA3AF]" strokeWidth={1.5} />
                    </div>
                  ) : (
                    <div className="w-[60px] h-[60px] rounded-full bg-[#D1D5DB] flex items-center justify-center mb-3 hidden">
                      <User className="w-7 h-7 text-[#9CA3AF]" strokeWidth={1.5} />
                    </div>
                  )}
                  {isLoading ? (
                    <div className="space-y-2 flex flex-col items-center">
                      <div className="h-6 w-40 bg-[#E5E5E5] rounded animate-pulse" />
                      <div className="h-4 w-52 bg-[#E5E5E5] rounded animate-pulse" />
                    </div>
                  ) : (
                    <>
                      <h2 className="text-[20px] font-normal text-[#2D3B45] mb-1">
                        {user?.name || "User"}
                      </h2>
                      <p className="text-[14px] text-[#6B7780]">
                        {canvasDomain || "canvas.instructure.com"}
                      </p>
                    </>
                  )}
                </div>

                {/* Connected Account Section */}
                <div className="mt-6">
                  <h3 className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wide mb-3 px-1">
                    Connected Account
                  </h3>
                  
                  {/* Connected Account Card */}
                  <div className="bg-[#F5F5F7] rounded-[10px] p-4 flex items-center gap-3 mb-3">
                    <div className="w-[40px] h-[40px] rounded-full bg-[#0084FF] flex items-center justify-center flex-shrink-0">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                        <rect x="6" y="4" width="12" height="16" rx="1" />
                        <path d="M9 8h6M9 11h6M9 14h4" stroke="white" strokeWidth="1.5" fill="none"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-[15px] font-medium text-[#2D3B45]">
                        {user?.name || "Canvas User"}
                      </p>
                      <p className="text-[13px] text-[#86868B]">
                        {canvasDomain || "canvas.instructure.com"}
                      </p>
                    </div>
                  </div>

                  {/* Switch Account Button */}
                  <button
                    onClick={handleSwitchAccount}
                    className="w-full bg-[#F5F5F7] hover:bg-[#E8E8EA] text-[#2D3B45] rounded-[10px] p-4 transition-colors flex items-center justify-center gap-2 mb-2"
                  >
                    <ArrowRightLeft className="w-[18px] h-[18px]" strokeWidth={2} />
                    <span className="text-[14px] font-medium">Switch Account</span>
                  </button>
                  <p className="text-[12px] text-[#86868B] text-center">
                    Sign out and connect to a different Canvas account
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}