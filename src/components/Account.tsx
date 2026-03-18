import { useState, useEffect } from "react";
import { LogOut, User } from "lucide-react";
import { getCanvasConfig, getCurrentUser, type CanvasUser } from "../utils/canvasAPI";
import { toast } from "sonner@2.0.3";

interface AccountProps {
  onDisconnect: () => void;
}

export function Account({ onDisconnect }: AccountProps) {
  const [user, setUser] = useState<CanvasUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const config = getCanvasConfig();
  const canvasDomain = config?.domain;

  useEffect(() => {
    loadUserInfo();
  }, []);

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
      console.error("Error loading user info:", error);
      toast.error("Failed to load user information");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchAccount = () => {
    if (confirm("Sign out and connect to a different Canvas account?")) {
      onDisconnect();
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Main Content */}
      <div className="max-w-[600px] mx-auto px-6 py-6">
        <div className="bg-white rounded-[12px] shadow-sm p-6">
          {/* User Profile Section - Centered */}
          <div className="flex flex-col items-center pb-5 border-b border-[#E5E5E5]">
            {isLoading ? (
              <div className="w-[60px] h-[60px] rounded-full bg-[#E5E5E5] animate-pulse mb-3" />
            ) : user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-[60px] h-[60px] rounded-full bg-[#E5E5E5] object-cover mb-3"
              />
            ) : (
              <div className="w-[60px] h-[60px] rounded-full bg-[#D1D5DB] flex items-center justify-center mb-3">
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
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h-2M15 3v2M15 3l-3 3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 10v5a2 2 0 002 2h8a2 2 0 002-2v-2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 7a2 2 0 012-2h5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-[14px] font-medium">Switch Account</span>
            </button>
            <p className="text-[12px] text-[#86868B] text-center">
              Sign out and connect to a different Canvas account
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}