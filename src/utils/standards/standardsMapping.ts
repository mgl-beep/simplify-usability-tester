/**
 * Standards Mapping System
 * 
 * This file maps issue categories to specific rubric standards using standardized tag formats:
 * - CVC-OEI: cvc-oei:D# (e.g., cvc-oei:D3, cvc-oei:D4)
 * - Peralta: peralta:E# (e.g., peralta:E1, peralta:E4)
 * - Quality Matters: qm:#.# (e.g., qm:8.1, qm:8.3)
 * 
 * Quality Matters Higher Education Rubric, 7th Edition has 8 General Standards:
 * 1. Course Overview and Introduction (1.1-1.9)
 * 2. Learning Objectives/Competencies (2.1-2.5)
 * 3. Assessment and Measurement (3.1-3.5)
 * 4. Instructional Materials (4.1-4.5)
 * 5. Learning Activities and Learner Interaction (5.1-5.4)
 * 6. Course Technology (6.1-6.4)
 * 7. Learner Support (7.1-7.4)
 * 8. Accessibility and Usability (8.1-8.7)
 */

import type { ScanIssue } from '../../App';

/**
 * Standards tags mapping for each issue category
 * Every issue detected must be explicitly tied to at least one standard
 */
export const STANDARDS_MAPPING: Record<string, string[]> = {
  // Accessibility Issues
  'alt-text': [
    'cvc-oei:D3',      // CVC-OEI - Accessibility (Images)
    'qm:8.4',          // QM 8.4 - Images in the course are accessible
    'peralta:E4'       // Peralta - Universal Design for Learning
  ],
  
  'contrast': [
    'cvc-oei:D5',      // CVC-OEI D5 - Color Contrast
    'qm:8.2',          // QM 8.2 - The course design facilitates readability
    'qm:8.3',          // QM 8.3 - Text in the course is accessible
  ],

  'color-only': [
    'cvc-oei:D6',      // CVC-OEI D6 - Color as Sole Conveyor
    'qm:8.2',          // QM 8.2 - The course design facilitates readability
    'qm:8.3',          // QM 8.3 - Text in the course is accessible
    'peralta:E4'       // Peralta - Universal Design for Learning
  ],
  
  'inconsistent-heading': [
    'cvc-oei:D3',      // CVC-OEI - Accessibility
    'qm:8.1',          // QM 8.1 - Course navigation facilitates ease of use
    'qm:8.3',          // QM 8.3 - Text in the course is accessible
    'peralta:E4'       // Peralta - Universal Design for Learning
  ],
  
  'table-headers': [
    'cvc-oei:D3',      // CVC-OEI - Accessibility (Tables)
    'qm:8.3',          // QM 8.3 - Text in the course is accessible
    'peralta:E4'       // Peralta - Universal Design for Learning
  ],
  
  'table-caption': [
    'cvc-oei:D3',      // CVC-OEI - Accessibility
    'qm:8.3',          // QM 8.3 - Text in the course is accessible
  ],
  
  'layout-table': [
    'cvc-oei:D3',      // CVC-OEI - Accessibility
    'qm:8.3',          // QM 8.3 - Text in the course is accessible
    'peralta:E4'       // Peralta - Universal Design for Learning
  ],
  
  'broken-link': [
    'cvc-oei:D3',      // CVC-OEI - Accessibility
    'qm:8.1',          // QM 8.1 - Course navigation facilitates ease of use
    'qm:6.1',          // QM 6.1 - Tools support learning objectives
    'peralta:E1'       // Peralta - Equitable Access to Technology
  ],
  
  'long-url': [
    'cvc-oei:D3',      // CVC-OEI - Accessibility
    'qm:8.1',          // QM 8.1 - Course navigation facilitates ease of use
    'qm:8.3',          // QM 8.3 - Text in the course is accessible
    'peralta:E1'       // Peralta - Equitable Access (assistive tech barriers)
  ],
  
  'video-caption': [
    'cvc-oei:D4',      // CVC-OEI - Multimedia Content
    'qm:8.5',          // QM 8.5 - Video and audio content in the course is accessible
    'peralta:E4'       // Peralta - Universal Design for Learning
  ],

  'autoplay': [
    'cvc-oei:D16',     // CVC-OEI D16 - Auto-Play Media
    'qm:8.5',          // QM 8.5 - Video and audio content in the course is accessible
    'qm:8.6',          // QM 8.6 - Multimedia in the course is easy to use
    'peralta:E4'       // Peralta - Universal Design for Learning
  ],
  
  'pdf-tag': [
    'cvc-oei:D3',      // CVC-OEI - Document Accessibility
    'qm:4.3',          // QM 4.3 - Course materials model academic integrity
    'qm:8.3',          // QM 8.3 - Text in the course is accessible
    'peralta:E1'       // Peralta - Equitable Access to Technology
  ],
  
  // Usability Issues
  'readability': [
    'cvc-oei:D1',      // CVC-OEI - Content Readability/Chunking
    'qm:4.1',          // QM 4.1 - Instructional materials contribute to achievement of learning objectives
    'qm:8.2',          // QM 8.2 - The course design facilitates readability
    'peralta:E4'       // Peralta - Universal Design (multiple means of representation)
  ],
  
  'confusing-navigation': [
    'cvc-oei:D2',      // CVC-OEI - Course Instructions
    'qm:1.1',          // QM 1.1 - Instructions make clear how to get started
    'qm:8.1',          // QM 8.1 - Course navigation facilitates ease of use
    'peralta:E4'       // Peralta - Universal Design for Learning
  ],
  
  'deep-nav': [
    'cvc-oei:D2',      // CVC-OEI - Course Navigation
    'qm:1.2',          // QM 1.2 - Learners can identify the structure of the course
    'qm:8.1',          // QM 8.1 - Course navigation facilitates ease of use
    'peralta:E4'       // Peralta - Universal Design for Learning
  ],
  
  'formatting': [
    'cvc-oei:D1',      // CVC-OEI - Content Presentation
    'qm:8.2',          // QM 8.2 - The course design facilitates readability
    'peralta:E4'       // Peralta - Universal Design for Learning
  ],
  
  'deep-click-path': [
    'cvc-oei:D2',      // CVC-OEI - Course Navigation
    'qm:8.1',          // QM 8.1 - Course navigation facilitates ease of use
  ],
  
  // Course Design & Content Issues
  'missing-objectives': [
    'cvc-oei:A1',      // CVC-OEI - Learning Objectives
    'qm:2.1',          // QM 2.1 - Course-level learning objectives are measurable
    'qm:2.3',          // QM 2.3 - Learning objectives are clearly stated
    'peralta:E4'       // Peralta - Universal Design for Learning
  ],
  
  'unclear-grading': [
    'cvc-oei:C1',      // CVC-OEI - Assessment
    'qm:3.2',          // QM 3.2 - Course grading policy is stated clearly
    'peralta:E2'       // Peralta - Inclusive Content
  ],
  
  'multimedia-issues': [
    'cvc-oei:D4',      // CVC-OEI - Multimedia
    'qm:4.5',          // QM 4.5 - A variety of instructional materials is used
    'qm:8.6',          // QM 8.6 - Multimedia in the course is easy to use
    'peralta:E4'       // Peralta - Universal Design for Learning
  ],
  
  'interaction-missing': [
    'cvc-oei:B1',      // CVC-OEI - Interaction
    'qm:5.2',          // QM 5.2 - Learning activities support active learning
    'qm:5.3',          // QM 5.3 - Plan for regular interaction
    'peralta:E3'       // Peralta - Culturally Responsive Pedagogy
  ],
  
  'technology-support': [
    'qm:6.2',          // QM 6.2 - Tools promote learner engagement
    'qm:7.1',          // QM 7.1 - Course instructions articulate technical support
    'peralta:E1'       // Peralta - Equitable Access to Technology
  ],
  
  'accessibility-statement': [
    'qm:7.2',          // QM 7.2 - Accessibility policies and accommodation services
    'qm:8.7',          // QM 8.7 - Vendor accessibility statements provided
    'peralta:E1'       // Peralta - Equitable Access to Technology
  ],

  // Institutional Support (CVC-OEI Section A12-A14)
  'policies': [
    'cvc-oei:A12',     // CVC-OEI A12 - Course Policies Easy to Find
    'cvc-oei:A13',     // CVC-OEI A13 - Student Support Services
    'cvc-oei:A14',     // CVC-OEI A14 - Technology Support
    'peralta:E1',      // Peralta - Equitable Access to Technology
    'peralta:E5',      // Peralta - Institutional Support
    'qm:1.4',          // QM 1.4 - Institutional Policies
    'qm:7.1',          // QM 7.1 - Technical Support
    'qm:7.4'           // QM 7.4 - Student Services and Resources
  ],

  'audio-description': [
    'cvc-oei:D4',      // CVC-OEI D4 - Multimedia Content
    'qm:8.5',          // QM 8.5 - Video and audio content is accessible
    'peralta:E4'       // Peralta - Universal Design for Learning
  ],

  'link-accessibility': [
    'cvc-oei:D3',      // CVC-OEI D3 - Accessibility (Linked Resources)
    'qm:8.1',          // QM 8.1 - Course navigation facilitates ease of use
    'qm:4.4',          // QM 4.4 - Course materials are accessible
    'peralta:E1',      // Peralta - Equitable Access to Technology
    'peralta:E4'       // Peralta - Universal Design for Learning
  ],

  // RSI (Regular Substantive Interaction) Issues
  'communication-guidelines': [
    'cvc-oei:B2',      // CVC-OEI B2 - Instructor Response Times
    'cvc-oei:B3',      // CVC-OEI B3 - Communication Guidelines
    'qm:5.3'           // QM 5.3 - Plan for Regular Interaction
  ],

  'module-discussion': [
    'cvc-oei:B4',      // CVC-OEI B4 - Student-to-Student Interaction
    'cvc-oei:B5',      // CVC-OEI B5 - Interaction Quality
    'qm:3.2',          // QM 3.2 - Course Grading Policy
    'peralta:E2'       // Peralta - Inclusive Content
  ]
};

/**
 * Get standards tags for a given issue category
 * @param category - The issue category (e.g., 'alt-text', 'contrast')
 * @returns Array of standards tags (e.g., ['cvc-oei:D3', 'qm:8.1'])
 */
export function getStandardsTagsForIssue(category: string): string[] {
  return STANDARDS_MAPPING[category] || [];
}

/**
 * Check if an issue matches the enabled standards filter
 * An issue is shown if ANY of its standards tags match ANY enabled standard
 * 
 * @param standardsTags - Array of standards tags from the issue (e.g., ['cvc-oei:D3', 'qm:8.1'])
 * @param enabledStandards - Array of enabled standard IDs (e.g., ['cvc-oei', 'peralta', 'quality-matters'])
 * @returns true if the issue should be shown, false if it should be filtered out
 */
export function issueMatchesEnabledStandards(
  standardsTags: string[],
  enabledStandards: string[]
): boolean {
  // If no standards are enabled, hide all issues
  if (!enabledStandards || enabledStandards.length === 0) {
    return false;
  }
  
  // If the issue has no standards tags, hide it
  if (!standardsTags || standardsTags.length === 0) {
    return false;
  }
  
  // Normalize enabled standards to match tag prefixes
  // 'quality-matters' should match 'qm:' tags
  const normalizedStandards = enabledStandards.map(std => {
    if (std === 'quality-matters') return 'qm';
    return std;
  });
  
  // Check if any of the issue's standards tags match any enabled standard
  return standardsTags.some(tag => {
    // Extract the standard prefix from the tag (e.g., 'cvc-oei' from 'cvc-oei:D3', 'qm' from 'qm:8.1')
    const standardPrefix = tag.split(':')[0];
    
    // Check if this standard is enabled
    return normalizedStandards.includes(standardPrefix);
  });
}

/**
 * Get a human-readable description for a standards tag
 * @param tag - The standards tag (e.g., 'cvc-oei:D3')
 * @returns Human-readable description
 */
export function getStandardDescription(tag: string): string {
  const descriptions: Record<string, string> = {
    // CVC-OEI Standards
    'cvc-oei:A1': 'CVC-OEI A1 - Course Overview',
    'cvc-oei:B1': 'CVC-OEI B1 - Interaction & Collaboration',
    'cvc-oei:C1': 'CVC-OEI C1 - Assessment & Measurement',
    'cvc-oei:D1': 'CVC-OEI D1 - Content Presentation',
    'cvc-oei:D2': 'CVC-OEI D2 - Course Navigation',
    'cvc-oei:D3': 'CVC-OEI D3 - Accessibility',
    'cvc-oei:D4': 'CVC-OEI D4 - Multimedia',
    'cvc-oei:A12': 'CVC-OEI A12 - Course Policies Easy to Find',
    'cvc-oei:A13': 'CVC-OEI A13 - Student Support Services',
    'cvc-oei:A14': 'CVC-OEI A14 - Technology Support',
    'cvc-oei:B2': 'CVC-OEI B2 - Instructor Response Times',
    'cvc-oei:B3': 'CVC-OEI B3 - Communication Guidelines',
    'cvc-oei:B4': 'CVC-OEI B4 - Student-to-Student Interaction',
    'cvc-oei:B5': 'CVC-OEI B5 - Interaction Quality',
    'cvc-oei:D5': 'CVC-OEI D5 - Color Contrast',
    'cvc-oei:D6': 'CVC-OEI D6 - Use of Color',
    'cvc-oei:D16': 'CVC-OEI D16 - Auto-Play Media',
    
    // Peralta Standards
    'peralta:E1': 'Peralta E1 - Equitable Access to Technology',
    'peralta:E2': 'Peralta E2 - Inclusive Content',
    'peralta:E3': 'Peralta E3 - Culturally Responsive Pedagogy',
    'peralta:E4': 'Peralta E4 - Universal Design for Learning',
    'peralta:E5': 'Peralta E5 - Institutional Support',
    
    // Quality Matters Standard 1: Course Overview and Introduction
    'qm:1.1': 'QM 1.1 - Instructions Make Clear How to Get Started',
    'qm:1.2': 'QM 1.2 - Learners Can Identify Course Structure',
    'qm:1.3': 'QM 1.3 - Communication Guidelines Are Clearly Stated',
    'qm:1.4': 'QM 1.4 - Institutional Policies with Which Learner is Expected to Comply',
    'qm:1.5': 'QM 1.5 - Minimum Technology Requirements Clearly Stated',
    'qm:1.6': 'QM 1.6 - Technical Skills Expected of Learner Clearly Stated',
    'qm:1.7': 'QM 1.7 - Required Prior Knowledge in Discipline Clearly Stated',
    'qm:1.8': 'QM 1.8 - Self-Introduction by Instructor',
    'qm:1.9': 'QM 1.9 - Learners Have Opportunity to Introduce Themselves',
    
    // Quality Matters Standard 2: Learning Objectives (Competencies)
    'qm:2.1': 'QM 2.1 - Course-Level Learning Objectives Are Measurable',
    'qm:2.2': 'QM 2.2 - Module-Level Learning Objectives Are Measurable',
    'qm:2.3': 'QM 2.3 - Learning Objectives Are Clearly Stated',
    'qm:2.4': 'QM 2.4 - Relationship Between Learning Objectives and Activities',
    'qm:2.5': 'QM 2.5 - Learning Objectives Are Appropriately Leveled',
    
    // Quality Matters Standard 3: Assessment and Measurement
    'qm:3.1': 'QM 3.1 - Assessments Measure Achievement of Learning Objectives',
    'qm:3.2': 'QM 3.2 - Course Grading Policy Is Stated Clearly',
    'qm:3.3': 'QM 3.3 - Specific and Descriptive Criteria for Evaluation',
    'qm:3.4': 'QM 3.4 - Course Includes Sequenced and Varied Assessments',
    'qm:3.5': 'QM 3.5 - Multiple Opportunities to Track Learning Progress',
    'qm:3.6': 'QM 3.6 - Assessments Provide Guidance About Academic Integrity',
    
    // Quality Matters Standard 4: Instructional Materials
    'qm:4.1': 'QM 4.1 - Instructional Materials Contribute to Learning Objectives',
    'qm:4.2': 'QM 4.2 - Relationship Between Materials and Learning Activities',
    'qm:4.3': 'QM 4.3 - Course Materials Model Academic Integrity',
    'qm:4.4': 'QM 4.4 - Instructional Materials Are Up-to-Date',
    'qm:4.5': 'QM 4.5 - Variety of Instructional Materials',
    
    // Quality Matters Standard 5: Learning Activities and Learner Interaction
    'qm:5.1': 'QM 5.1 - Learning Activities Help Achieve Learning Objectives',
    'qm:5.2': 'QM 5.2 - Learning Activities Support Active Learning',
    'qm:5.3': 'QM 5.3 - Plan for Regular Interaction with Learners',
    'qm:5.4': 'QM 5.4 - Requirements for Learner Interaction Clearly Stated',
    
    // Quality Matters Standard 6: Course Technology
    'qm:6.1': 'QM 6.1 - Tools Support Learning Objectives',
    'qm:6.2': 'QM 6.2 - Tools Promote Learner Engagement',
    'qm:6.3': 'QM 6.3 - Variety of Technology Is Used',
    'qm:6.4': 'QM 6.4 - Course Provides Learner Privacy Information',
    
    // Quality Matters Standard 7: Learner Support
    'qm:7.1': 'QM 7.1 - Course Instructions Articulate Technical Support',
    'qm:7.2': 'QM 7.2 - Accessibility Policies and Accommodation Services',
    'qm:7.3': 'QM 7.3 - Academic Support Services and Resources',
    'qm:7.4': 'QM 7.4 - Student Services and Resources to Help Learners Succeed',
    
    // Quality Matters Standard 8: Accessibility and Usability
    'qm:8.1': 'QM 8.1 - Course Navigation Facilitates Ease of Use',
    'qm:8.2': 'QM 8.2 - Course Design Facilitates Readability',
    'qm:8.3': 'QM 8.3 - Text in the Course Is Accessible',
    'qm:8.4': 'QM 8.4 - Images in the Course Are Accessible',
    'qm:8.5': 'QM 8.5 - Video and Audio Content Is Accessible',
    'qm:8.6': 'QM 8.6 - Multimedia in the Course Is Easy to Use',
    'qm:8.7': 'QM 8.7 - Vendor Accessibility Statements Are Provided'
  };
  
  return descriptions[tag] || tag;
}

/**
 * Get all standards that apply to a specific issue
 * @param issue - The scan issue
 * @returns Array of human-readable standard descriptions
 */
export function getIssueStandards(issue: ScanIssue): string[] {
  if (!issue.standardsTags || issue.standardsTags.length === 0) {
    return issue.rubricStandard ? [issue.rubricStandard] : [];
  }
  
  return issue.standardsTags.map(tag => getStandardDescription(tag));
}