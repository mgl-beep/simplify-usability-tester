import { useEffect, useState } from "react";
import { getCanvasDomain, getCanvasAccessToken } from "../utils/canvasAPI";
import { ExternalLink, Search, TrendingUp, Award, BookOpen } from "lucide-react";

export function CanvasCommons() {
  const [canvasDomain, setCanvasDomain] = useState<string | null>(null);
  const [commonsUrl, setCommonsUrl] = useState<string>("");

  useEffect(() => {
    const domain = getCanvasDomain();
    if (domain) {
      setCanvasDomain(domain);
      // Canvas Commons URL - typically at /accounts/[account_id]/commons or /commons
      const url = `https://${domain}/accounts/self/external_tools`;
      setCommonsUrl(url);
    }
  }, []);

  const openCommonsInNewTab = () => {
    if (canvasDomain) {
      // Open Canvas Commons in a new tab with full authentication
      const commonsUrl = `https://${canvasDomain}/accounts/self`;
      window.open(commonsUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-[#C7CDD1] bg-white px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[23px] font-light text-[#2D3B45] mb-1">Commons</h1>
            <p className="text-[14px] text-[#6B7780]">
              Discover and share Open Educational Resources
            </p>
          </div>
          <button
            onClick={openCommonsInNewTab}
            className="flex items-center gap-2 bg-[#0084ff] hover:bg-[#0077ed] text-white px-4 py-2 rounded-md text-[14px] transition-colors"
          >
            <ExternalLink className="w-4 h-4" strokeWidth={2} />
            Open Full Commons
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        {/* Info Card */}
        <div className="bg-[#F5F5F5] border border-[#C7CDD1] rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-[#0084ff] rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            <div className="flex-1">
              <h2 className="text-[18px] font-semibold text-[#2D3B45] mb-2">
                Canvas Commons Integration
              </h2>
              <p className="text-[14px] text-[#6B7780] mb-4">
                Canvas Commons is a learning object repository that allows you to find, import, and share resources. 
                Access thousands of openly licensed, educational resources shared by educators worldwide.
              </p>
              <button
                onClick={openCommonsInNewTab}
                className="text-[14px] text-[#0084ff] hover:text-[#0077ed] font-medium flex items-center gap-2"
              >
                Access Canvas Commons
                <ExternalLink className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <FeatureCard
            icon={<Search className="w-6 h-6 text-[#0084ff]" strokeWidth={2} />}
            title="Search Resources"
            description="Browse thousands of courses, modules, and learning materials from the Canvas community."
          />
          <FeatureCard
            icon={<TrendingUp className="w-6 h-6 text-[#0084ff]" strokeWidth={2} />}
            title="Import Content"
            description="Import high-quality resources directly into your courses with one click."
          />
          <FeatureCard
            icon={<Award className="w-6 h-6 text-[#0084ff]" strokeWidth={2} />}
            title="Share Your Work"
            description="Contribute your own courses and resources to help educators worldwide."
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-[#C7CDD1] rounded-lg p-6">
          <h3 className="text-[16px] font-semibold text-[#2D3B45] mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <QuickActionButton
              label="Browse Commons"
              description="Explore available resources in Canvas Commons"
              onClick={openCommonsInNewTab}
            />
            <QuickActionButton
              label="Import from Commons"
              description="Find and import content into your courses"
              onClick={openCommonsInNewTab}
            />
            <QuickActionButton
              label="Share to Commons"
              description="Share your course content with the community"
              onClick={openCommonsInNewTab}
            />
          </div>
        </div>

        {/* Note */}
        <div className="mt-8 p-4 bg-[#FFF9E6] border border-[#FFDB4D] rounded-lg">
          <p className="text-[13px] text-[#6B7780]">
            <strong className="text-[#2D3B45]">Note:</strong> Canvas Commons requires your Canvas account authentication. 
            Click "Open Full Commons" to access Commons with your logged-in Canvas session.
          </p>
        </div>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-white border border-[#C7CDD1] rounded-lg p-5 hover:border-[#0084ff] transition-colors">
      <div className="mb-3">{icon}</div>
      <h4 className="text-[15px] font-semibold text-[#2D3B45] mb-2">{title}</h4>
      <p className="text-[13px] text-[#6B7780] leading-relaxed">{description}</p>
    </div>
  );
}

interface QuickActionButtonProps {
  label: string;
  description: string;
  onClick: () => void;
}

function QuickActionButton({ label, description, onClick }: QuickActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 bg-[#F5F5F5] hover:bg-[#E5E5E5] rounded-md transition-colors group"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h5 className="text-[14px] font-semibold text-[#2D3B45] mb-1">{label}</h5>
          <p className="text-[12px] text-[#6B7780]">{description}</p>
        </div>
        <ExternalLink className="w-4 h-4 text-[#6B7780] group-hover:text-[#0084ff] transition-colors" strokeWidth={2} />
      </div>
    </button>
  );
}
