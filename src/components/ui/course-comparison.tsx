import { useState } from 'react';
import { ArrowLeftRight, X, Check, AlertCircle, TrendingUp, TrendingDown, ChevronDown, Download } from 'lucide-react';
import { Button } from './button';

interface CourseData {
  id: string;
  name: string;
  lastScanned?: Date;
  stats: {
    totalIssues: number;
    criticalIssues: number;
    highIssues: number;
    mediumIssues: number;
    lowIssues: number;
    fixedIssues: number;
    overallScore: number;
  };
  categories: {
    accessibility: number;
    usability: number;
    design: number;
    content: number;
    technical: number;
  };
  standards: {
    wcag: { score: number; issues: number };
    cvcOei: { score: number; issues: number };
    qualityMatters: { score: number; issues: number };
  };
  modules: Array<{
    name: string;
    issues: number;
    score: number;
  }>;
}

interface CourseComparisonProps {
  availableCourses: Array<{ id: string; name: string }>;
  onLoadCourse: (courseId: string) => Promise<CourseData>;
  onExport?: (courses: CourseData[]) => void;
}

export function CourseComparison({ 
  availableCourses, 
  onLoadCourse,
  onExport 
}: CourseComparisonProps) {
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [courseData, setCourseData] = useState<Map<string, CourseData>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [showSelector, setShowSelector] = useState(false);

  const handleAddCourse = async (courseId: string) => {
    if (selectedCourses.length >= 3) {
      alert('Maximum 3 courses can be compared');
      return;
    }

    if (selectedCourses.includes(courseId)) return;

    setIsLoading(true);
    try {
      const data = await onLoadCourse(courseId);
      setCourseData(prev => new Map(prev).set(courseId, data));
      setSelectedCourses(prev => [...prev, courseId]);
      setShowSelector(false);
    } catch (error) {
      console.error('Failed to load course:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCourse = (courseId: string) => {
    setSelectedCourses(prev => prev.filter(id => id !== courseId));
    setCourseData(prev => {
      const next = new Map(prev);
      next.delete(courseId);
      return next;
    });
  };

  const courses = selectedCourses.map(id => courseData.get(id)!).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[24px] font-semibold text-[#1d1d1f] tracking-tight">
            Course Comparison
          </h2>
          <p className="text-[14px] text-[#636366] mt-1">
            Compare accessibility metrics across courses
          </p>
        </div>

        <div className="flex items-center gap-3">
          {courses.length > 0 && onExport && (
            <Button
              onClick={() => onExport(courses)}
              className="h-10 px-4 rounded-lg border border-[#d2d2d7] bg-white text-[#1d1d1f] hover:bg-[#f5f5f7]"
            >
              <Download className="w-4 h-4 mr-2" strokeWidth={2} />
              Export
            </Button>
          )}

          {selectedCourses.length < 3 && (
            <Button
              onClick={() => setShowSelector(true)}
              className="h-10 px-4 rounded-lg bg-[#0071e3] hover:bg-[#0077ed] text-white"
            >
              <ArrowLeftRight className="w-4 h-4 mr-2" strokeWidth={2} />
              Add Course
            </Button>
          )}
        </div>
      </div>

      {/* Course Selector Modal */}
      {showSelector && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[16px] w-full max-w-[500px] shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-[#e5e5e7]">
              <h3 className="text-[18px] font-semibold text-[#1d1d1f]">Select Course</h3>
              <button
                onClick={() => setShowSelector(false)}
                className="w-8 h-8 rounded-full hover:bg-[#e5e5e7] flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-[#636366]" strokeWidth={2} />
              </button>
            </div>

            <div className="p-6 max-h-[400px] overflow-y-auto">
              <div className="space-y-2">
                {availableCourses
                  .filter(c => !selectedCourses.includes(c.id))
                  .map(course => (
                    <button
                      key={course.id}
                      onClick={() => handleAddCourse(course.id)}
                      disabled={isLoading}
                      className="w-full p-4 text-left rounded-lg border border-[#d2d2d7] hover:border-[#0071e3] hover:bg-[#0071e3]/5 transition-all disabled:opacity-50"
                    >
                      <p className="text-[15px] font-medium text-[#1d1d1f]">
                        {course.name}
                      </p>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {courses.length === 0 && (
        <div className="bg-white rounded-[16px] border border-[#d2d2d7] p-12 text-center">
          <ArrowLeftRight className="w-12 h-12 text-[#d2d2d7] mx-auto mb-4" strokeWidth={1.5} />
          <h3 className="text-[18px] font-semibold text-[#1d1d1f] mb-2">
            No courses selected
          </h3>
          <p className="text-[14px] text-[#636366] mb-6">
            Add 2-3 courses to compare their accessibility metrics side by side
          </p>
          <Button
            onClick={() => setShowSelector(true)}
            className="h-11 px-6 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white"
          >
            Add Your First Course
          </Button>
        </div>
      )}

      {/* Comparison Table */}
      {courses.length > 0 && (
        <div className="space-y-6">
          {/* Course Headers */}
          <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${courses.length}, 1fr)` }}>
            <div /> {/* Empty corner */}
            {courses.map(course => (
              <div 
                key={course.id}
                className="bg-white rounded-[12px] border border-[#d2d2d7] p-4"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="text-[15px] font-semibold text-[#1d1d1f] line-clamp-2">
                    {course.name}
                  </h3>
                  <button
                    onClick={() => handleRemoveCourse(course.id)}
                    className="flex-shrink-0 w-6 h-6 rounded-full hover:bg-[#e5e5e7] flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4 text-[#636366]" strokeWidth={2} />
                  </button>
                </div>
                {course.lastScanned && (
                  <p className="text-[12px] text-[#636366]">
                    Scanned {new Date(course.lastScanned).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Overall Scores */}
          <ComparisonSection title="Overall Score">
            {courses.map(course => (
              <ScoreCard
                key={course.id}
                score={course.stats.overallScore}
                total={100}
              />
            ))}
          </ComparisonSection>

          {/* Issue Summary */}
          <ComparisonSection title="Total Issues">
            {courses.map(course => (
              <MetricCard
                key={course.id}
                value={course.stats.totalIssues}
                label="issues"
                comparison={getBestValue(courses, c => c.stats.totalIssues, 'lower')}
                currentValue={course.stats.totalIssues}
              />
            ))}
          </ComparisonSection>

          {/* Issues by Severity */}
          <ComparisonSection title="Issues by Severity">
            {courses.map(course => (
              <div key={course.id} className="space-y-2">
                <SeverityRow label="Critical" value={course.stats.criticalIssues} color="red" />
                <SeverityRow label="High" value={course.stats.highIssues} color="orange" />
                <SeverityRow label="Medium" value={course.stats.mediumIssues} color="amber" />
                <SeverityRow label="Low" value={course.stats.lowIssues} color="blue" />
              </div>
            ))}
          </ComparisonSection>

          {/* Category Breakdown */}
          <ComparisonSection title="Issues by Category">
            {courses.map(course => (
              <div key={course.id} className="space-y-2">
                {Object.entries(course.categories).map(([cat, count]) => (
                  <CategoryRow 
                    key={cat} 
                    label={cat.charAt(0).toUpperCase() + cat.slice(1)} 
                    value={count} 
                  />
                ))}
              </div>
            ))}
          </ComparisonSection>

          {/* Standards Compliance */}
          <ComparisonSection title="Standards Compliance">
            {courses.map(course => (
              <div key={course.id} className="space-y-3">
                <StandardRow 
                  label="WCAG 2.2 AA" 
                  score={course.standards.wcag.score}
                  issues={course.standards.wcag.issues}
                />
                <StandardRow 
                  label="CVC-OEI" 
                  score={course.standards.cvcOei.score}
                  issues={course.standards.cvcOei.issues}
                />
                <StandardRow 
                  label="Quality Matters" 
                  score={course.standards.qualityMatters.score}
                  issues={course.standards.qualityMatters.issues}
                />
              </div>
            ))}
          </ComparisonSection>

          {/* Module Comparison */}
          <ComparisonSection title="Top Problematic Modules">
            {courses.map(course => (
              <div key={course.id} className="space-y-2">
                {course.modules
                  .sort((a, b) => b.issues - a.issues)
                  .slice(0, 5)
                  .map((module, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-[#EEECE8]"
                    >
                      <span className="text-[13px] text-[#1d1d1f] truncate flex-1">
                        {module.name}
                      </span>
                      <span className="text-[12px] font-semibold text-red-600 flex-shrink-0 ml-2">
                        {module.issues} issues
                      </span>
                    </div>
                  ))}
              </div>
            ))}
          </ComparisonSection>
        </div>
      )}
    </div>
  );
}

// Comparison Section
function ComparisonSection({ title, children }: { title: string; children: React.ReactNode }) {
  const childArray = Array.isArray(children) ? children : [children];
  
  return (
    <div className="bg-white rounded-[16px] border border-[#d2d2d7] overflow-hidden">
      <div className="p-4 border-b border-[#e5e5e7] bg-[#EEECE8]">
        <h4 className="text-[14px] font-semibold text-[#1d1d1f] uppercase tracking-wide">
          {title}
        </h4>
      </div>
      <div className="grid gap-4 p-4" style={{ gridTemplateColumns: `repeat(${childArray.length}, 1fr)` }}>
        {children}
      </div>
    </div>
  );
}

// Score Card
function ScoreCard({ score, total }: { score: number; total: number }) {
  const percentage = (score / total) * 100;
  const color = percentage >= 80 ? 'green' : percentage >= 60 ? 'amber' : 'red';
  
  const colors = {
    green: { bg: 'bg-green-50', text: 'text-green-600', fill: 'text-green-500' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', fill: 'text-amber-500' },
    red: { bg: 'bg-red-50', text: 'text-red-600', fill: 'text-red-500' }
  };

  const c = colors[color];

  return (
    <div className={`${c.bg} rounded-[12px] p-6 border border-${color}-200`}>
      <div className="text-center">
        <p className={`text-[48px] font-bold ${c.text} tracking-tight`}>
          {score}
        </p>
        <p className="text-[14px] text-[#636366]">out of {total}</p>
        <div className="mt-4 h-2 bg-white/50 rounded-full overflow-hidden">
          <div 
            className={`h-full ${c.fill} bg-current transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// Metric Card
function MetricCard({ value, label, comparison, currentValue }: {
  value: number;
  label: string;
  comparison: number;
  currentValue: number;
}) {
  const isBest = currentValue === comparison;

  return (
    <div className="p-4 rounded-[12px] border border-[#d2d2d7] relative">
      {isBest && (
        <div className="absolute top-2 right-2">
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
            <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
          </div>
        </div>
      )}
      <p className="text-[36px] font-semibold text-[#1d1d1f] tracking-tight">
        {value}
      </p>
      <p className="text-[13px] text-[#636366]">{label}</p>
    </div>
  );
}

// Severity Row
function SeverityRow({ label, value, color }: { label: string; value: number; color: string }) {
  const colors = {
    red: 'bg-red-100 text-red-700',
    orange: 'bg-orange-100 text-orange-700',
    amber: 'bg-amber-100 text-amber-700',
    blue: 'bg-blue-100 text-blue-700'
  };

  return (
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f5f5f7] transition-colors">
      <span className="text-[13px] text-[#636366]">{label}</span>
      <span className={`px-2 py-1 rounded text-[12px] font-semibold ${colors[color as keyof typeof colors]}`}>
        {value}
      </span>
    </div>
  );
}

// Category Row
function CategoryRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f5f5f7] transition-colors">
      <span className="text-[13px] text-[#1d1d1f]">{label}</span>
      <span className="text-[13px] font-semibold text-[#0071e3]">{value}</span>
    </div>
  );
}

// Standard Row
function StandardRow({ label, score, issues }: { label: string; score: number; issues: number }) {
  const percentage = score;
  const color = percentage >= 80 ? 'green' : percentage >= 60 ? 'amber' : 'red';
  
  const colors = {
    green: 'bg-green-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500'
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[13px] font-medium text-[#1d1d1f]">{label}</span>
        <span className="text-[13px] font-semibold text-[#636366]">
          {score}% ({issues} issues)
        </span>
      </div>
      <div className="h-2 bg-[#e5e5e7] rounded-full overflow-hidden">
        <div 
          className={`h-full ${colors[color]} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Helper function
function getBestValue<T>(items: T[], selector: (item: T) => number, mode: 'higher' | 'lower'): number {
  const values = items.map(selector);
  return mode === 'higher' ? Math.max(...values) : Math.min(...values);
}
