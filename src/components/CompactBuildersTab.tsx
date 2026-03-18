import { Sparkles, FileText, BookOpen, Rocket, ChevronRight } from 'lucide-react';
import { UnifiedPageTemplate, UnifiedGrid, UnifiedCard, UnifiedSectionHeader } from './ui/unified-page-template';
import { Button } from './ui/button';

interface CompactBuildersTabProps {
  onOpenAssignmentGenerator: () => void;
  onOpenSyllabusBuilder: () => void;
  onOpenCourseTemplate: () => void;
  onOpenCourseGenerator: () => void;
}

export function CompactBuildersTab({
  onOpenAssignmentGenerator,
  onOpenSyllabusBuilder,
  onOpenCourseTemplate,
  onOpenCourseGenerator
}: CompactBuildersTabProps) {
  return (
    <UnifiedPageTemplate
      title="Course Builders"
      subtitle="AI-powered tools to create accessible course content"
      primaryContent={
        <div className="p-6">
          <UnifiedSectionHeader
            title="Quick Builders"
            subtitle="Generate course content in seconds"
          />

          <div className="grid grid-cols-3 gap-4">
            {/* AI Assignment Generator */}
            <BuilderCard
              icon={<Sparkles className="w-6 h-6" strokeWidth={2} />}
              title="AI Assignment Generator"
              description="Create accessible assignments with AI assistance"
              gradient="from-purple-500 to-purple-600"
              stats={[
                { label: 'Time saved', value: '~15 min' },
                { label: 'WCAG compliant', value: '✓' }
              ]}
              onClick={onOpenAssignmentGenerator}
            />

            {/* Syllabus Builder */}
            <BuilderCard
              icon={<FileText className="w-6 h-6" strokeWidth={2} />}
              title="Syllabus Builder"
              description="Build comprehensive, accessible syllabi"
              gradient="from-blue-500 to-blue-600"
              stats={[
                { label: 'Templates', value: '12+' },
                { label: 'Auto-format', value: '✓' }
              ]}
              onClick={onOpenSyllabusBuilder}
            />

            {/* Course Template */}
            <BuilderCard
              icon={<BookOpen className="w-6 h-6" strokeWidth={2} />}
              title="Course Builder Template"
              description="Start with pre-built course structures"
              gradient="from-green-500 to-green-600"
              stats={[
                { label: 'Templates', value: '8+' },
                { label: 'Customizable', value: '✓' }
              ]}
              onClick={onOpenCourseTemplate}
            />
          </div>
        </div>
      }
      secondaryContent={
        <div className="space-y-6">
          <UnifiedSectionHeader
            title="Advanced Generator"
            subtitle="Create complete courses from scratch"
          />

          {/* Course + Syllabus Generator */}
          <div className="bg-gradient-to-br from-[#0071e3] to-[#00d084] rounded-[12px] p-6 text-white">
            <div className="flex items-start gap-6">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <Rocket className="w-7 h-7 text-white" strokeWidth={2} />
              </div>

              <div className="flex-1">
                <h3 className="text-[20px] font-semibold mb-2">
                  Course + Syllabus Generator
                </h3>
                <p className="text-[14px] text-white/90 mb-4 leading-relaxed">
                  Generate an entire course structure with syllabus, modules, assignments, and quizzes. 
                  Fully accessible and aligned to learning objectives.
                </p>

                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div>
                    <p className="text-[11px] text-white/70 uppercase tracking-wide mb-1">Modules</p>
                    <p className="text-[24px] font-bold">8-12</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-white/70 uppercase tracking-wide mb-1">Assignments</p>
                    <p className="text-[24px] font-bold">15+</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-white/70 uppercase tracking-wide mb-1">Quizzes</p>
                    <p className="text-[24px] font-bold">12+</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-white/70 uppercase tracking-wide mb-1">Time</p>
                    <p className="text-[24px] font-bold">~1 hr</p>
                  </div>
                </div>

                <Button
                  onClick={onOpenCourseGenerator}
                  className="h-11 px-6 rounded-full bg-white text-[#0071e3] hover:bg-white/90 font-semibold"
                >
                  Generate Course <ChevronRight className="w-4 h-4 ml-2" strokeWidth={2.5} />
                </Button>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <UnifiedGrid columns={2} gap={4}>
            <FeatureCard
              title="AI-Powered Content"
              description="Leverages GPT-4 to generate contextual, relevant course materials"
              icon="🤖"
            />
            <FeatureCard
              title="WCAG 2.2 AA Compliant"
              description="All generated content meets accessibility standards by default"
              icon="♿"
            />
            <FeatureCard
              title="Canvas Integration"
              description="Directly publish to Canvas with one click"
              icon="📤"
            />
            <FeatureCard
              title="Customizable Templates"
              description="Adjust templates to match your institution's style"
              icon="🎨"
            />
          </UnifiedGrid>
        </div>
      }
      secondaryTitle="Full Course Generator"
      defaultExpanded={false}
    />
  );
}

// Builder Card
interface BuilderCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  stats: Array<{ label: string; value: string }>;
  onClick: () => void;
}

function BuilderCard({ icon, title, description, gradient, stats, onClick }: BuilderCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-[calc(100%+48px)] text-left bg-white rounded-[12px] border border-[#d2d2d7] overflow-hidden hover:shadow-lg hover:border-[#0071e3] transition-all group"
    >
      {/* Gradient Header */}
      <div className={`h-24 bg-gradient-to-br ${gradient} p-4 flex items-center justify-center relative overflow-hidden`}>
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
        <div className="relative text-white">
          {icon}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-[15px] font-semibold text-[#1d1d1f] mb-2 group-hover:text-[#0071e3] transition-colors">
          {title}
        </h3>
        <p className="text-[13px] text-[#636366] leading-relaxed mb-4">
          {description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 pt-3 border-t border-[#e5e5e7]">
          {stats.map((stat, index) => (
            <div key={index}>
              <p className="text-[11px] text-[#636366] uppercase tracking-wide">{stat.label}</p>
              <p className="text-[13px] font-semibold text-[#1d1d1f]">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </button>
  );
}

// Feature Card
function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="p-4 rounded-lg border border-[#d2d2d7] bg-white">
      <div className="flex items-start gap-3">
        <div className="text-[28px] flex-shrink-0">{icon}</div>
        <div>
          <h4 className="text-[14px] font-semibold text-[#1d1d1f] mb-1">
            {title}
          </h4>
          <p className="text-[13px] text-[#636366] leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}