import { useState } from "react";
import { Settings, ExternalLink, CheckCircle, XCircle } from "lucide-react";
import { Button } from "./ui/button";
import { CanvasConnectModal } from "./CanvasConnectModal";
import { isConnectedToCanvas, getCanvasDomain, removeCanvasAccessToken } from "../utils/canvasAPI";
import { toast } from "sonner@2.0.3";

export function CanvasSettings() {
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [isConnected, setIsConnected] = useState(isConnectedToCanvas());

  const handleDisconnect = () => {
    removeCanvasAccessToken();
    setIsConnected(false);
    toast.success("Disconnected from Canvas - Reload to see connection prompt");
    
    // Trigger a storage event to notify other components
    window.dispatchEvent(new Event('storage'));
    
    // Optionally reload after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  return (
    <>
      <div className="bg-white rounded-[16px] border border-[#e5e5e7] p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#0071e3]/10 flex items-center justify-center">
            <Settings className="w-5 h-5 text-[#0071e3]" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-[17px] font-semibold text-[#1d1d1f] tracking-[-0.011em]">
              Canvas Integration
            </h3>
            <p className="text-[13px] text-[#636366]">
              Connect to upload courses directly
            </p>
          </div>
        </div>

        {isConnected ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-[#34c759]/10 border border-[#34c759]/20 rounded-[10px]">
              <CheckCircle className="w-4 h-4 text-[#34c759]" strokeWidth={2} />
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-[#1d1d1f]">Connected</p>
                <p className="text-[11px] text-[#636366]">{getCanvasDomain()}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleDisconnect}
                variant="outline"
                size="sm"
                className="flex-1 h-[36px] rounded-[8px] border-[#d2d2d7]"
              >
                Disconnect
              </Button>
              <Button
                onClick={() => window.open(`https://${getCanvasDomain()}`, '_blank')}
                variant="outline"
                size="sm"
                className="h-[36px] px-3 rounded-[8px] border-[#d2d2d7]"
              >
                <ExternalLink className="w-4 h-4" strokeWidth={2} />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-[#636366]/10 border border-[#636366]/20 rounded-[10px]">
              <XCircle className="w-4 h-4 text-[#636366]" strokeWidth={2} />
              <p className="text-[13px] text-[#636366]">Not connected to Canvas</p>
            </div>
            <Button
              onClick={() => setShowConnectModal(true)}
              className="w-full bg-[#0071e3] hover:bg-[#0077ed] text-white h-[40px] rounded-[10px]"
            >
              Connect to Canvas
            </Button>
          </div>
        )}
      </div>

      <CanvasConnectModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        onConnected={() => {
          setShowConnectModal(false);
          setIsConnected(true);
        }}
      />
    </>
  );
}