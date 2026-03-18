import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Loader2, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getCanvasConfig, getCourses } from '../utils/canvasAPI';

interface Course {
  id: number;
  name: string;
  course_code: string;
}

interface CourseDropdownProps {
  onSelectCourse: (courseId: string, courseName: string) => void;
  selectedCourseName?: string | null;
}

export function CourseDropdown({ onSelectCourse, selectedCourseName }: CourseDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Escape key closes dropdown
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  // Focus management: focus first option when opened, return focus to trigger when closed
  useEffect(() => {
    if (isOpen) {
      // Focus first option when dropdown opens
      requestAnimationFrame(() => {
        const firstOption = listboxRef.current?.querySelector('[role="option"]') as HTMLElement | null;
        firstOption?.focus();
      });
    }
  }, [isOpen]);

  // Arrow key navigation inside listbox
  const handleListboxKeyDown = (event: React.KeyboardEvent) => {
    const options = listboxRef.current?.querySelectorAll('[role="option"]') as NodeListOf<HTMLElement> | undefined;
    if (!options || options.length === 0) return;

    const currentIndex = Array.from(options).findIndex(opt => opt === document.activeElement);

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
        options[nextIndex].focus();
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
        options[prevIndex].focus();
        break;
      }
      case 'Home': {
        event.preventDefault();
        options[0].focus();
        break;
      }
      case 'End': {
        event.preventDefault();
        options[options.length - 1].focus();
        break;
      }
    }
  };

  const loadCourses = async () => {
    setLoading(true);
    try {
      const config = getCanvasConfig();
      if (!config) {
        console.error('Canvas not configured');
        return;
      }

      const fetchedCourses = await getCourses(config);

      // Also get imported courses from localStorage
      const importedCoursesJson = localStorage.getItem('imported_courses');
      const importedCourses = importedCoursesJson ? JSON.parse(importedCoursesJson) : [];

      // Combine and sort
      const allCourses = [...fetchedCourses, ...importedCourses].sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      setCourses(allCourses);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCourse = (course: Course) => {
    const courseIdString = course.id.toString();
    onSelectCourse(courseIdString, course.name);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={triggerRef}
        data-tour="scan-course"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="text-white h-[44px] px-7 rounded-full shadow-lg hover:shadow-xl transition-all text-[15px] font-semibold flex items-center gap-2 whitespace-nowrap shrink-0"
        style={{
          background: 'linear-gradient(135deg, #0071e3 0%, #00b4d8 100%)',
          ...(!localStorage.getItem('simplify_has_scanned') ? { animation: 'pulse-ring 2s ease-in-out 3', animationDelay: '1s' } : {}),
        }}
      >
        {loading ? (
          <>
            <Loader2 className="w-[18px] h-[18px] animate-spin" strokeWidth={2} aria-hidden="true" />
            Loading...
          </>
        ) : (
          <>
            Scan Course
            <ChevronDown className={`w-[16px] h-[16px] transition-transform ${isOpen ? 'rotate-180' : ''}`} strokeWidth={2} aria-hidden="true" />
          </>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, minWidth: 170, whiteSpace: "nowrap", backgroundColor: "#fff", borderRadius: 10, boxShadow: "0 8px 30px rgba(0,0,0,0.15)", border: "1px solid #e5e5ea", overflow: "hidden", zIndex: 100 }}
          >
            <div className="max-h-[400px] overflow-y-auto" ref={listboxRef} role="listbox" aria-label="Select a course to scan" onKeyDown={handleListboxKeyDown}>
              {courses.length === 0 ? (
                <div style={{ padding: "12px 16px", fontSize: 14, color: "#636366", textAlign: "center" }}>
                  No courses found
                </div>
              ) : (
                <>
                  {/* Scan All Courses */}
                  <div
                    onClick={() => { onSelectCourse('all', 'All Courses'); setIsOpen(false); }}
                    role="option"
                    aria-selected={selectedCourseName === 'All Courses'}
                    tabIndex={0}
                    style={{ padding: "12px 16px", fontSize: 14, fontWeight: 500, color: "#1d1d1f", cursor: "pointer", borderBottom: "1px solid #f2f2f7", display: "flex", alignItems: "center", gap: 10 }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(0,113,227,0.10)")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <Layers style={{ width: 16, height: 16, color: "#0071e3" }} aria-hidden="true" /> Scan All Courses
                  </div>

                  {/* Individual Courses */}
                  {courses.map((course, index) => {
                    const isLast = index === courses.length - 1;
                    return (
                      <div
                        key={course.id}
                        onClick={() => handleSelectCourse(course)}
                        role="option"
                        aria-selected={selectedCourseName === course.name}
                        tabIndex={0}
                        style={{ padding: "12px 16px 12px 42px", fontSize: 14, fontWeight: 500, color: "#1d1d1f", cursor: "pointer", borderBottom: isLast ? "none" : "1px solid #f2f2f7", display: "flex", alignItems: "center", gap: 10 }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(0,113,227,0.10)")}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        {course.name}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
