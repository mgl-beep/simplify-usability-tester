import { useState } from 'react';
import { Sparkles, TrendingUp, Zap, Target, ChevronRight, ThumbsUp, ThumbsDown, X, Info } from 'lucide-react';
import { Button } from './button';

export interface Recommendation {
  id: string;
  type: 'quick-win' | 'high-impact' | 'best-practice' | 'optimization';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: {
    issuesFixed: number;
    timeEstimate: string;
    difficulty: 'easy' | 'medium' | 'hard';
  };
  reason: string;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }>;
  relatedIssues?: Array<{
    id: string;
    title: string;
  }>;
  beforeAfter?: {
    before: string;
    after: string;
  };
}

interface SmartRecommendationsProps {
  recommendations: Recommendation[];
  onDismiss?: (id: string) => void;
  onFeedback?: (id: string, helpful: boolean) => void;
  onApplyAll?: (ids: string[]) => void;
  showFeedback?: boolean;
}

export function SmartRecommendations({
  recommendations,
  onDismiss,
  onFeedback,
  onApplyAll,
  showFeedback = true
}: SmartRecommendationsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'quick-win' | 'high-impact'>('all');

  const filteredRecs = recommendations.filter(rec => {
    if (filter === 'all') return true;
    return rec.type === filter;
  });

  const quickWins = recommendations.filter(r => r.type === 'quick-win');
  const highImpact = recommendations.filter(r => r.type === 'high-impact');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0071e3] to-[#00d084] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-[20px] font-semibold text-[#1d1d1f] tracking-tight">
              Smart Recommendations
            </h2>
            <p className="text-[13px] text-[#636366]">
              AI-powered suggestions to improve your course
            </p>
          </div>
        </div>

        {onApplyAll && recommendations.length > 0 && (
          <Button
            onClick={() => onApplyAll(recommendations.map(r => r.id))}
            className="h-10 px-4 rounded-lg bg-[#0071e3] hover:bg-[#0077ed] text-white"
          >
            <Zap className="w-4 h-4 mr-2" strokeWidth={2} />
            Apply All Quick Fixes
          </Button>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-[12px] p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-5 h-5 text-blue-600" strokeWidth={2} />
            <span className="text-[24px] font-bold text-blue-700">{quickWins.length}</span>
          </div>
          <p className="text-[13px] font-medium text-blue-800">Quick Wins</p>
          <p className="text-[11px] text-blue-600">Easy fixes, big impact</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-[12px] p-4 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-purple-600" strokeWidth={2} />
            <span className="text-[24px] font-bold text-purple-700">{highImpact.length}</span>
          </div>
          <p className="text-[13px] font-medium text-purple-800">High Impact</p>
          <p className="text-[11px] text-purple-600">Worth the effort</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-[12px] p-4 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-5 h-5 text-green-600" strokeWidth={2} />
            <span className="text-[24px] font-bold text-green-700">
              {recommendations.reduce((sum, r) => sum + r.impact.issuesFixed, 0)}
            </span>
          </div>
          <p className="text-[13px] font-medium text-green-800">Issues Fixable</p>
          <p className="text-[11px] text-green-600">Across all recommendations</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {(['all', 'quick-win', 'high-impact'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-[14px] font-medium transition-all ${
              filter === f
                ? 'bg-[#0071e3] text-white'
                : 'bg-white border border-[#d2d2d7] text-[#1d1d1f] hover:border-[#636366]'
            }`}
          >
            {f === 'all' ? 'All Recommendations' : 
             f === 'quick-win' ? `Quick Wins (${quickWins.length})` :
             `High Impact (${highImpact.length})`}
          </button>
        ))}
      </div>

      {/* Recommendations List */}
      <div className="space-y-3">
        {filteredRecs.length === 0 ? (
          <div className="bg-white rounded-[12px] border border-[#d2d2d7] p-12 text-center">
            <Sparkles className="w-12 h-12 text-[#d2d2d7] mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-[15px] text-[#636366]">No recommendations available</p>
          </div>
        ) : (
          filteredRecs.map((rec) => (
            <RecommendationCard
              key={rec.id}
              recommendation={rec}
              isExpanded={expandedId === rec.id}
              onToggleExpand={() => setExpandedId(expandedId === rec.id ? null : rec.id)}
              onDismiss={onDismiss}
              onFeedback={onFeedback}
              showFeedback={showFeedback}
            />
          ))
        )}
      </div>
    </div>
  );
}

// Recommendation Card
interface RecommendationCardProps {
  recommendation: Recommendation;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onDismiss?: (id: string) => void;
  onFeedback?: (id: string, helpful: boolean) => void;
  showFeedback: boolean;
}

function RecommendationCard({
  recommendation,
  isExpanded,
  onToggleExpand,
  onDismiss,
  onFeedback,
  showFeedback
}: RecommendationCardProps) {
  const typeConfig = {
    'quick-win': {
      icon: Zap,
      color: 'blue',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      badge: 'Quick Win'
    },
    'high-impact': {
      icon: TrendingUp,
      color: 'purple',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-700',
      badge: 'High Impact'
    },
    'best-practice': {
      icon: Target,
      color: 'green',
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      badge: 'Best Practice'
    },
    'optimization': {
      icon: Sparkles,
      color: 'amber',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-700',
      badge: 'Optimization'
    }
  };

  const config = typeConfig[recommendation.type];
  const Icon = config.icon;

  const difficultyColors = {
    easy: 'bg-green-100 text-green-700',
    medium: 'bg-amber-100 text-amber-700',
    hard: 'bg-red-100 text-red-700'
  };

  const priorityColors = {
    high: 'bg-red-500',
    medium: 'bg-amber-500',
    low: 'bg-blue-500'
  };

  return (
    <div className={`bg-white rounded-[12px] border ${config.border} overflow-hidden hover:shadow-md transition-all`}>
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-full ${config.bg} border ${config.border} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-6 h-6 ${config.text}`} strokeWidth={2} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 ${config.bg} ${config.border} border rounded-full text-[11px] font-semibold ${config.text} uppercase tracking-wide`}>
                    {config.badge}
                  </span>
                  <div className={`w-2 h-2 rounded-full ${priorityColors[recommendation.priority]}`} />
                </div>
                <h3 className="text-[16px] font-semibold text-[#1d1d1f] mb-1">
                  {recommendation.title}
                </h3>
                <p className="text-[14px] text-[#636366] leading-relaxed">
                  {recommendation.description}
                </p>
              </div>

              {onDismiss && (
                <button
                  onClick={() => onDismiss(recommendation.id)}
                  className="w-6 h-6 rounded-full hover:bg-[#e5e5e7] flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4 text-[#636366]" strokeWidth={2} />
                </button>
              )}
            </div>

            {/* Impact Metrics */}
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] text-[#636366]">Fixes:</span>
                <span className="text-[12px] font-semibold text-[#0071e3]">
                  {recommendation.impact.issuesFixed} issues
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] text-[#636366]">Time:</span>
                <span className="text-[12px] font-semibold text-[#1d1d1f]">
                  {recommendation.impact.timeEstimate}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${difficultyColors[recommendation.impact.difficulty]}`}>
                  {recommendation.impact.difficulty}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {recommendation.actions?.map((action, idx) => (
                <Button
                  key={idx}
                  onClick={action.onClick}
                  className={`h-9 px-4 rounded-lg text-[13px] font-medium ${
                    action.variant === 'primary'
                      ? 'bg-[#0071e3] text-white hover:bg-[#0077ed]'
                      : 'bg-white border border-[#d2d2d7] text-[#1d1d1f] hover:bg-[#f5f5f7]'
                  }`}
                >
                  {action.label}
                </Button>
              ))}

              <button
                onClick={onToggleExpand}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] text-[#0071e3] hover:bg-[#0071e3]/5 font-medium transition-colors"
              >
                {isExpanded ? 'Hide Details' : 'Show Details'}
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-[#e5e5e7] bg-[#EEECE8]/50 p-4 space-y-4 animate-in slide-in-from-top-2 fade-in-0 duration-200">
          {/* Reason */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-[#636366]" strokeWidth={2} />
              <h4 className="text-[13px] font-semibold text-[#1d1d1f] uppercase tracking-wide">
                Why This Matters
              </h4>
            </div>
            <p className="text-[14px] text-[#636366] leading-relaxed">
              {recommendation.reason}
            </p>
          </div>

          {/* Related Issues */}
          {recommendation.relatedIssues && recommendation.relatedIssues.length > 0 && (
            <div>
              <h4 className="text-[13px] font-semibold text-[#1d1d1f] uppercase tracking-wide mb-2">
                Related Issues ({recommendation.relatedIssues.length})
              </h4>
              <div className="space-y-1">
                {recommendation.relatedIssues.map((issue) => (
                  <div 
                    key={issue.id}
                    className="p-2 bg-white rounded-lg text-[13px] text-[#1d1d1f] hover:bg-[#0071e3]/5 transition-colors cursor-pointer"
                  >
                    {issue.title}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Before/After */}
          {recommendation.beforeAfter && (
            <div>
              <h4 className="text-[13px] font-semibold text-[#1d1d1f] uppercase tracking-wide mb-3">
                Before & After
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] font-semibold text-[#636366] uppercase tracking-wide mb-2">
                    Before
                  </p>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <pre className="text-[12px] text-[#1d1d1f] font-mono whitespace-pre-wrap">
                      {recommendation.beforeAfter.before}
                    </pre>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#636366] uppercase tracking-wide mb-2">
                    After
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <pre className="text-[12px] text-[#1d1d1f] font-mono whitespace-pre-wrap">
                      {recommendation.beforeAfter.after}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Feedback */}
          {showFeedback && onFeedback && (
            <div className="pt-3 border-t border-[#d2d2d7]">
              <p className="text-[12px] text-[#636366] mb-2">Was this recommendation helpful?</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onFeedback(recommendation.id, true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#d2d2d7] hover:border-green-500 hover:bg-green-50 text-[13px] text-[#1d1d1f] hover:text-green-700 transition-all"
                >
                  <ThumbsUp className="w-3.5 h-3.5" strokeWidth={2} />
                  Helpful
                </button>
                <button
                  onClick={() => onFeedback(recommendation.id, false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#d2d2d7] hover:border-red-500 hover:bg-red-50 text-[13px] text-[#1d1d1f] hover:text-red-700 transition-all"
                >
                  <ThumbsDown className="w-3.5 h-3.5" strokeWidth={2} />
                  Not Helpful
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Recommendation Generator (AI-powered)
export function generateRecommendations(scanResults: any[]): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Example: Alt text quick wins
  const missingAltImages = scanResults.filter(r => r.category === 'accessibility' && r.title.includes('alt'));
  if (missingAltImages.length > 0) {
    recommendations.push({
      id: 'alt-text-batch',
      type: 'quick-win',
      priority: 'high',
      title: 'Add Alt Text to All Images',
      description: `Fix ${missingAltImages.length} images missing alt text in one click`,
      impact: {
        issuesFixed: missingAltImages.length,
        timeEstimate: '2-3 min',
        difficulty: 'easy'
      },
      reason: 'Screen readers need alt text to describe images to visually impaired users. This is a WCAG Level A requirement.',
      actions: [
        {
          label: 'Auto-Fix All',
          onClick: () => console.log('Fix all alt text'),
          variant: 'primary'
        }
      ],
      relatedIssues: missingAltImages.slice(0, 5).map(r => ({
        id: r.id,
        title: r.title
      })),
      beforeAfter: {
        before: '<img src="photo.jpg">',
        after: '<img src="photo.jpg" alt="Student studying in library">'
      }
    });
  }

  return recommendations;
}
