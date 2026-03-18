/**
 * Quality Matters Higher Education Rubric - 7th Edition
 * Comprehensive standards for online course quality
 * Source: https://www.qualitymatters.org/
 */

export interface QMStandard {
  id: string;
  category: string;
  description: string;
  points: number;
  section: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  sectionName: string;
}

export const QM_STANDARDS: QMStandard[] = [
  // 1. Course Overview and Introduction
  {
    id: "QM 1.1",
    section: 1,
    sectionName: "Course Overview and Introduction",
    description: "Instructions make clear how to get started and where to find various course components.",
    points: 3
  },
  {
    id: "QM 1.2",
    section: 1,
    sectionName: "Course Overview and Introduction",
    description: "Learners are introduced to the purpose and structure of the course.",
    points: 3
  },
  {
    id: "QM 1.3",
    section: 1,
    sectionName: "Course Overview and Introduction",
    description: "Communication guidelines for the course are clearly stated.",
    points: 2
  },
  {
    id: "QM 1.4",
    section: 1,
    sectionName: "Course Overview and Introduction",
    description: "Course and institutional policies with which the learner is expected to comply are clearly stated within the course.",
    points: 2
  },
  {
    id: "QM 1.5",
    section: 1,
    sectionName: "Course Overview and Introduction",
    description: "Minimum technology requirements for the course are clearly stated, and information on how to obtain the technologies is provided.",
    points: 2
  },
  {
    id: "QM 1.6",
    section: 1,
    sectionName: "Course Overview and Introduction",
    description: "Technical skills and digital information literacy skills expected of the learner are clearly stated.",
    points: 1
  },
  {
    id: "QM 1.7",
    section: 1,
    sectionName: "Course Overview and Introduction",
    description: "Required prior knowledge in the discipline and/or any specific competencies are clearly stated in the course site.",
    points: 1
  },
  {
    id: "QM 1.8",
    section: 1,
    sectionName: "Course Overview and Introduction",
    description: "The self-introduction by the instructor is welcoming and is available in the course site.",
    points: 1
  },
  {
    id: "QM 1.9",
    section: 1,
    sectionName: "Course Overview and Introduction",
    description: "Learners have the opportunity to introduce themselves.",
    points: 1
  },

  // 2. Learning Objectives (Competencies)
  {
    id: "QM 2.1",
    section: 2,
    sectionName: "Learning Objectives (Competencies)",
    description: "The course-level learning objectives describe outcomes that are measurable.",
    points: 3
  },
  {
    id: "QM 2.2",
    section: 2,
    sectionName: "Learning Objectives (Competencies)",
    description: "The module/unit-level learning objectives describe outcomes that are measurable and consistent with the course-level objectives.",
    points: 3
  },
  {
    id: "QM 2.3",
    section: 2,
    sectionName: "Learning Objectives (Competencies)",
    description: "Learning objectives are clearly stated, are learner-centered, and are prominently located in the course.",
    points: 3
  },
  {
    id: "QM 2.4",
    section: 2,
    sectionName: "Learning Objectives (Competencies)",
    description: "The relationship between learning objectives, learning activities, and assessments is made clear.",
    points: 3
  },
  {
    id: "QM 2.5",
    section: 2,
    sectionName: "Learning Objectives (Competencies)",
    description: "The learning objectives are suited to the level of the course.",
    points: 3
  },

  // 3. Assessment and Measurement
  {
    id: "QM 3.1",
    section: 3,
    sectionName: "Assessment and Measurement",
    description: "The assessments measure the achievement of the stated learning objectives.",
    points: 3
  },
  {
    id: "QM 3.2",
    section: 3,
    sectionName: "Assessment and Measurement",
    description: "The course grading policy is stated clearly at the beginning of the course, and consistent throughout the course site.",
    points: 3
  },
  {
    id: "QM 3.3",
    section: 3,
    sectionName: "Assessment and Measurement",
    description: "Specific and descriptive criteria are provided for the evaluation of learners' work, and their connection to the course grading policy is clearly explained.",
    points: 3
  },
  {
    id: "QM 3.4",
    section: 3,
    sectionName: "Assessment and Measurement",
    description: "The course includes multiple types of assessments that are sequenced and suited to the level of the course.",
    points: 2
  },
  {
    id: "QM 3.5",
    section: 3,
    sectionName: "Assessment and Measurement",
    description: "The types and timing of assessments provide learners with multiple opportunities to track their learning progress with timely feedback.",
    points: 2
  },

  // 4. Instructional Materials
  {
    id: "QM 4.1",
    section: 4,
    sectionName: "Instructional Materials",
    description: "The instructional materials contribute to the achievement of the stated learning objectives.",
    points: 3
  },
  {
    id: "QM 4.2",
    section: 4,
    sectionName: "Instructional Materials",
    description: "The relationship between the use of instructional materials in the course and completion of learning activities and assessments is clearly explained.",
    points: 3
  },
  {
    id: "QM 4.3",
    section: 4,
    sectionName: "Instructional Materials",
    description: "The course models academic integrity expected of learners by providing both source references and permissions for use of instructional materials.",
    points: 2
  },
  {
    id: "QM 4.4",
    section: 4,
    sectionName: "Instructional Materials",
    description: "The instructional materials represent up-to-date theory and practice in the discipline.",
    points: 2
  },
  {
    id: "QM 4.5",
    section: 4,
    sectionName: "Instructional Materials",
    description: "A variety of instructional materials is used in the course.",
    points: 2
  },

  // 5. Learning Activities and Learner Interaction
  {
    id: "QM 5.1",
    section: 5,
    sectionName: "Learning Activities and Learner Interaction",
    description: "The learning activities help learners achieve the stated objectives.",
    points: 3
  },
  {
    id: "QM 5.2",
    section: 5,
    sectionName: "Learning Activities and Learner Interaction",
    description: "Learning activities provide opportunities for interaction that support active learning.",
    points: 3
  },
  {
    id: "QM 5.3",
    section: 5,
    sectionName: "Learning Activities and Learner Interaction",
    description: "The instructor's plan for regular interaction with learners in substantive ways during the course is clearly stated.",
    points: 3
  },
  {
    id: "QM 5.4",
    section: 5,
    sectionName: "Learning Activities and Learner Interaction",
    description: "The requirements for learner interaction are clearly stated.",
    points: 2
  },

  // 6. Course Technology
  {
    id: "QM 6.1",
    section: 6,
    sectionName: "Course Technology",
    description: "The tools used in the course support the learning objectives.",
    points: 3
  },
  {
    id: "QM 6.2",
    section: 6,
    sectionName: "Course Technology",
    description: "Course tools promote learner engagement and active learning.",
    points: 2
  },
  {
    id: "QM 6.3",
    section: 6,
    sectionName: "Course Technology",
    description: "A variety of technologies is used in the course.",
    points: 1
  },
  {
    id: "QM 6.4",
    section: 6,
    sectionName: "Course Technology",
    description: "The course provides learners with information on protecting their data and privacy.",
    points: 1
  },

  // 7. Learner Support
  {
    id: "QM 7.1",
    section: 7,
    sectionName: "Learner Support",
    description: "The course instructions articulate or link to a clear description of the technical support offered and how to obtain it.",
    points: 3
  },
  {
    id: "QM 7.2",
    section: 7,
    sectionName: "Learner Support",
    description: "Course instructions articulate or link to the institution's accessibility policies and accommodation services.",
    points: 3
  },
  {
    id: "QM 7.3",
    section: 7,
    sectionName: "Learner Support",
    description: "Course instructions articulate or link to the institution's academic support services and resources that can help learners succeed in the course.",
    points: 3
  },
  {
    id: "QM 7.4",
    section: 7,
    sectionName: "Learner Support",
    description: "Course instructions articulate or link to the institution's student services and resources that can help learners succeed.",
    points: 3
  },

  // 8. Accessibility and Usability
  {
    id: "QM 8.1",
    section: 8,
    sectionName: "Accessibility and Usability",
    description: "Course navigation facilitates ease of use.",
    points: 3
  },
  {
    id: "QM 8.2",
    section: 8,
    sectionName: "Accessibility and Usability",
    description: "The course design facilitates readability.",
    points: 3
  },
  {
    id: "QM 8.3",
    section: 8,
    sectionName: "Accessibility and Usability",
    description: "The course is accessible.",
    points: 3
  },
  {
    id: "QM 8.4",
    section: 8,
    sectionName: "Accessibility and Usability",
    description: "Images in the course are accessible.",
    points: 2
  },
  {
    id: "QM 8.5",
    section: 8,
    sectionName: "Accessibility and Usability",
    description: "Video and audio content in the course is accessible.",
    points: 2
  },
  {
    id: "QM 8.6",
    section: 8,
    sectionName: "Accessibility and Usability",
    description: "Multimedia in the course is easy to use.",
    points: 2
  },
  {
    id: "QM 8.7",
    section: 8,
    sectionName: "Accessibility and Usability",
    description: "Vendor accessibility statements are provided for the technologies used in the course.",
    points: 1
  }
];

/**
 * Get QM standard by ID
 */
export function getQMStandard(id: string): QMStandard | undefined {
  return QM_STANDARDS.find(s => s.id === id);
}

/**
 * Get all QM standards for a section
 */
export function getQMStandardsBySection(section: number): QMStandard[] {
  return QM_STANDARDS.filter(s => s.section === section);
}

/**
 * Calculate total possible QM points
 */
export function getTotalQMPoints(): number {
  return QM_STANDARDS.reduce((sum, std) => sum + std.points, 0);
}

/**
 * Map issue categories to QM standards
 * Updated to align with QM Higher Education Rubric 7th Edition
 */
export function mapIssueToQMStandards(
  issueCategory: string
): string[] {
  const mapping: Record<string, string[]> = {
    // Accessibility Issues
    'alt-text': ['QM 8.4'],  // Images in the course are accessible
    'contrast': ['QM 8.2'],  // The course design facilitates readability
    'inconsistent-heading': ['QM 8.1', 'QM 8.3'],  // Course navigation + Text is accessible
    'table-headers': ['QM 8.3'],  // Text in the course is accessible
    'table-caption': ['QM 8.3'],  // Text in the course is accessible
    'layout-table': ['QM 8.3'],  // Text in the course is accessible
    'broken-link': ['QM 8.1', 'QM 6.1'],  // Course navigation + Tools support objectives
    'long-url': ['QM 8.1', 'QM 8.3'],  // Course navigation + Text is accessible
    'video-caption': ['QM 8.5'],  // Video and audio content is accessible
    'pdf-tag': ['QM 4.3', 'QM 8.3'],  // Course materials model academic integrity + Text is accessible
    
    // Usability Issues
    'readability': ['QM 4.1', 'QM 8.2'],  // Instructional materials + Course design facilitates readability
    'confusing-navigation': ['QM 1.1', 'QM 8.1'],  // Clear instructions + Course navigation
    'deep-nav': ['QM 1.2', 'QM 8.1'],  // Learners can identify structure + Course navigation
    'formatting': ['QM 8.2'],  // The course design facilitates readability
    'deep-click-path': ['QM 8.1'],  // Course navigation facilitates ease of use
    
    // Course Design & Content Issues
    'missing-objectives': ['QM 2.1', 'QM 2.3'],  // Course-level objectives are measurable + clearly stated
    'unclear-grading': ['QM 3.2'],  // Course grading policy is stated clearly
    'multimedia-issues': ['QM 4.5', 'QM 8.6'],  // Variety of instructional materials + Multimedia is easy to use
    'interaction-missing': ['QM 5.2', 'QM 5.3'],  // Learning activities support active learning + Plan for regular interaction
    'technology-support': ['QM 6.2', 'QM 7.1'],  // Tools promote engagement + Technical support articulated
    'accessibility-statement': ['QM 7.2', 'QM 8.7']  // Accessibility policies + Vendor accessibility statements
  };

  return mapping[issueCategory] || [];
}