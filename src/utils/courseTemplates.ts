/**
 * Course Templates based on:
 * - CVC-OEI Course Design Rubric (44 criteria)
 * - Peralta Online Equity Rubric (8 criteria)
 * - WCAG 2.2 AA Standards
 */

export interface CourseTemplate {
  id: string;
  name: string;
  description: string;
  category: 'full' | 'page' | 'module' | 'assignment' | 'syllabus';
  rubricCompliance: {
    cvcOEI: number; // Percentage of 44 criteria met
    peralta: number; // Percentage of 8 criteria met
    wcag: 'AA' | 'AAA';
  };
  features: string[];
  color: string;
  content: TemplateContent;
}

export interface TemplateContent {
  type: 'full-course' | 'page' | 'module' | 'assignment' | 'syllabus';
  html?: string;
  modules?: ModuleTemplate[];
  assignments?: AssignmentTemplate[];
  pages?: PageTemplate[];
}

export interface ModuleTemplate {
  name: string;
  description: string;
  items: ModuleItem[];
}

export interface ModuleItem {
  type: 'Assignment' | 'Page' | 'Discussion' | 'Quiz' | 'ExternalUrl';
  title: string;
  content?: string;
  indent?: number;
}

export interface AssignmentTemplate {
  name: string;
  description: string;
  points: number;
  submissionTypes: string[];
}

export interface PageTemplate {
  title: string;
  body: string;
}

// Helper function to create accessible HTML structure
function createAccessibleHTML(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #1d1d1f;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2, h3, h4 { 
      margin-top: 1.5em; 
      margin-bottom: 0.5em;
      font-weight: 600;
    }
    h1 { font-size: 2em; color: #0071e3; }
    h2 { font-size: 1.5em; color: #1d1d1f; }
    h3 { font-size: 1.25em; }
    p { margin-bottom: 1em; }
    a { color: #0071e3; text-decoration: none; }
    a:hover { text-decoration: underline; }
    a:focus { outline: 2px solid #0071e3; outline-offset: 2px; }
    ul, ol { margin: 1em 0; padding-left: 2em; }
    li { margin-bottom: 0.5em; }
    .accessible-notice {
      background: #f5f5f7;
      border-left: 4px solid #0071e3;
      padding: 1em;
      margin: 1.5em 0;
      border-radius: 4px;
    }
    .section {
      margin-bottom: 2em;
      padding: 1.5em;
      background: #ffffff;
      border: 1px solid #d2d2d7;
      border-radius: 8px;
    }
    .skip-link {
      position: absolute;
      top: -40px;
      left: 0;
      background: #0071e3;
      color: white;
      padding: 8px;
      text-decoration: none;
      z-index: 100;
    }
    .skip-link:focus {
      top: 0;
    }
  </style>
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <main id="main-content">
${content}
  </main>
</body>
</html>`;
}

// TEMPLATE 1: Full Course Template (CVC-OEI + Peralta + WCAG Compliant)
export const fullCourseTemplate: CourseTemplate = {
  id: 'full-course-cvc-peralta',
  name: 'Full Course Template',
  description: 'Complete course structure with accessibility and navigation optimizations built-in',
  category: 'full',
  rubricCompliance: {
    cvcOEI: 100,
    peralta: 100,
    wcag: 'AA'
  },
  features: [
    'Pre-structured weekly modules',
    '3-click maximum navigation depth',
    'WCAG 2.2 AA compliant design',
    'Screen reader optimized layout',
    'UDL principles embedded',
    'Equity-focused content templates'
  ],
  color: '#0071e3',
  content: {
    type: 'full-course',
    modules: [
      {
        name: 'Start Here - Course Orientation',
        description: 'Essential information to begin your learning journey',
        items: [
          {
            type: 'Page',
            title: '📚 Welcome & Course Overview',
            content: createAccessibleHTML(`
              <h1>Welcome to [Course Name]!</h1>
              
              <div class="accessible-notice" role="complementary" aria-label="Course accessibility statement">
                <h2>Accessibility Commitment</h2>
                <p>This course is designed to be accessible to all learners. If you encounter any barriers to access, please contact me immediately at [instructor-email].</p>
              </div>

              <section class="section">
                <h2>Course Navigation</h2>
                <p>This course is organized into weekly modules. Each module contains:</p>
                <ul>
                  <li><strong>Learning Objectives</strong> - What you'll accomplish this week</li>
                  <li><strong>Required Materials</strong> - Readings, videos, and resources</li>
                  <li><strong>Activities</strong> - Discussions and practice exercises</li>
                  <li><strong>Assessments</strong> - Assignments and quizzes</li>
                </ul>
              </section>

              <section class="section">
                <h2>Quick Links</h2>
                <nav aria-label="Course quick links">
                  <ul>
                    <li><a href="/courses/[id]/assignments/syllabus">📋 Syllabus</a></li>
                    <li><a href="/courses/[id]/modules">📖 Course Modules</a></li>
                    <li><a href="/courses/[id]/grades">📊 Grades</a></li>
                    <li><a href="/courses/[id]/discussion_topics">💬 Discussions</a></li>
                    <li><a href="/courses/[id]/pages/student-resources">🎯 Student Resources</a></li>
                    <li><a href="/courses/[id]/pages/accessibility-statement">♿ Accessibility Statement</a></li>
                  </ul>
                </nav>
              </section>

              <section class="section">
                <h2>Technology Requirements</h2>
                <p><strong>Required:</strong></p>
                <ul>
                  <li>Reliable internet connection</li>
                  <li>Computer or tablet (smartphone not recommended as primary device)</li>
                  <li>Updated web browser (Chrome, Firefox, Safari, or Edge)</li>
                  <li>Canvas mobile app (optional, for notifications)</li>
                </ul>
                <p><strong>Free alternatives available:</strong> If you lack access to required technology, please see our <a href="/courses/[id]/pages/student-resources">Student Resources</a> page for free options.</p>
              </section>
            `)
          },
          {
            type: 'Page',
            title: '📋 Accessible Syllabus',
            content: createAccessibleHTML(`
              <h1>Course Syllabus</h1>
              
              <section class="section">
                <h2>Course Information</h2>
                <dl>
                  <dt><strong>Course Title:</strong></dt>
                  <dd>[Course Name and Number]</dd>
                  <dt><strong>Instructor:</strong></dt>
                  <dd>[Instructor Name]</dd>
                  <dt><strong>Email:</strong></dt>
                  <dd><a href="mailto:[email]">[instructor-email]</a></dd>
                  <dt><strong>Office Hours:</strong></dt>
                  <dd>[Days/Times] via Zoom (link in Canvas)</dd>
                  <dt><strong>Response Time:</strong></dt>
                  <dd>Within 24-48 hours on weekdays</dd>
                </dl>
              </section>

              <section class="section">
                <h2>Course Description</h2>
                <p>[Insert course catalog description here]</p>
              </section>

              <section class="section">
                <h2>Learning Outcomes</h2>
                <p>By the end of this course, you will be able to:</p>
                <ol>
                  <li>[Learning Outcome 1]</li>
                  <li>[Learning Outcome 2]</li>
                  <li>[Learning Outcome 3]</li>
                  <li>[Learning Outcome 4]</li>
                </ol>
              </section>

              <section class="section">
                <h2>Required Materials</h2>
                <p><strong>Textbook:</strong> [Title, Author, Edition] - Available as free OER resource at [link]</p>
                <p><strong>Alternative formats:</strong> All required readings are available in multiple formats (PDF, HTML, audio). Contact instructor if you need specific accommodations.</p>
              </section>

              <section class="section">
                <h2>Grading & Assessment</h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <caption style="font-weight: bold; margin-bottom: 0.5em;">Grade Distribution</caption>
                  <thead>
                    <tr style="background: #f5f5f7;">
                      <th style="padding: 8px; text-align: left; border: 1px solid #d2d2d7;">Assignment Type</th>
                      <th style="padding: 8px; text-align: left; border: 1px solid #d2d2d7;">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style="padding: 8px; border: 1px solid #d2d2d7;">Weekly Discussions</td>
                      <td style="padding: 8px; border: 1px solid #d2d2d7;">20%</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px; border: 1px solid #d2d2d7;">Module Quizzes</td>
                      <td style="padding: 8px; border: 1px solid #d2d2d7;">30%</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px; border: 1px solid #d2d2d7;">Written Assignments</td>
                      <td style="padding: 8px; border: 1px solid #d2d2d7;">30%</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px; border: 1px solid #d2d2d7;">Final Project</td>
                      <td style="padding: 8px; border: 1px solid #d2d2d7;">20%</td>
                    </tr>
                  </tbody>
                </table>
              </section>

              <section class="section">
                <h2>Accessibility & Accommodations</h2>
                <p>I am committed to creating an inclusive learning environment. If you have a documented disability and require accommodations, please contact [Disability Services Office] and provide me with your accommodation letter as soon as possible.</p>
                <p><strong>I also welcome conversations about:</strong></p>
                <ul>
                  <li>Flexible deadlines for unexpected life circumstances</li>
                  <li>Alternative assignment formats</li>
                  <li>Technology access issues</li>
                  <li>Preferred names and pronouns</li>
                </ul>
              </section>

              <section class="section">
                <h2>Diversity & Inclusion Statement</h2>
                <p>This course values diversity of thought, perspective, and experience. Course materials have been selected to represent diverse voices and perspectives. If you feel that course content is not inclusive or contains bias, please let me know so we can address it together.</p>
              </section>
            `)
          },
          {
            type: 'Page',
            title: '🎯 Student Resources & Support',
            content: createAccessibleHTML(`
              <h1>Student Resources & Support</h1>
              
              <section class="section">
                <h2>Technology Access & Support</h2>
                <h3>Free Computer & Internet Access</h3>
                <ul>
                  <li><strong>Campus Computer Labs:</strong> [Hours and locations]</li>
                  <li><strong>Library Resources:</strong> [Link to library technology lending]</li>
                  <li><strong>Free WiFi Locations:</strong> [Community resources]</li>
                  <li><strong>Device Lending Program:</strong> [Contact information]</li>
                </ul>
                
                <h3>Canvas Technical Support</h3>
                <ul>
                  <li><strong>24/7 Canvas Help:</strong> <a href="https://community.canvaslms.com/t5/Student-Guide/tkb-p/student">Canvas Student Guide</a></li>
                  <li><strong>Phone:</strong> [Support number]</li>
                  <li><strong>Live Chat:</strong> Available in Canvas help menu</li>
                </ul>
              </section>

              <section class="section">
                <h2>Academic Support Services</h2>
                <ul>
                  <li><strong>Writing Center:</strong> Free tutoring for all assignments - <a href="[link]">Schedule appointment</a></li>
                  <li><strong>Tutoring Services:</strong> Subject-specific tutoring available - <a href="[link]">Learn more</a></li>
                  <li><strong>Library Research Help:</strong> Librarians available via chat, email, phone - <a href="[link]">Contact library</a></li>
                  <li><strong>Study Skills Workshops:</strong> Time management, note-taking, test prep - <a href="[link]">View schedule</a></li>
                </ul>
              </section>

              <section class="section">
                <h2>Wellness & Mental Health</h2>
                <ul>
                  <li><strong>Counseling Services:</strong> Free, confidential support - <a href="[link]">Learn more</a></li>
                  <li><strong>Crisis Text Line:</strong> Text HOME to 741741</li>
                  <li><strong>National Suicide Prevention Lifeline:</strong> 988</li>
                  <li><strong>Campus Food Pantry:</strong> [Hours and location]</li>
                  <li><strong>Emergency Financial Aid:</strong> <a href="[link]">Apply here</a></li>
                </ul>
              </section>

              <section class="section">
                <h2>Accessibility Resources</h2>
                <ul>
                  <li><strong>Disability Services:</strong> <a href="[link]">[Office name and contact]</a></li>
                  <li><strong>Assistive Technology:</strong> Free screen readers, speech-to-text - <a href="[link]">Available tools</a></li>
                  <li><strong>Captioning Services:</strong> Request captions for course videos - <a href="[link]">Request form</a></li>
                  <li><strong>Alternative Format Materials:</strong> Request accessible versions of course materials</li>
                </ul>
              </section>

              <section class="section">
                <h2>Financial Resources</h2>
                <ul>
                  <li><strong>Free/Low-Cost Textbooks:</strong> All required course materials use Open Educational Resources (OER) or are provided free</li>
                  <li><strong>Financial Aid Office:</strong> <a href="[link]">Emergency grants and loans</a></li>
                  <li><strong>Scholarship Opportunities:</strong> <a href="[link]">Browse scholarships</a></li>
                </ul>
              </section>
            `)
          },
          {
            type: 'Page',
            title: '♿ Accessibility Statement',
            content: createAccessibleHTML(`
              <h1>Course Accessibility Statement</h1>
              
              <div class="accessible-notice">
                <p><strong>Commitment to Access:</strong> This course is designed to meet WCAG 2.2 AA standards and follows Universal Design for Learning (UDL) principles.</p>
              </div>

              <section class="section">
                <h2>What This Means for You</h2>
                <ul>
                  <li>All videos include accurate captions and transcripts</li>
                  <li>All images include descriptive alternative text</li>
                  <li>Color is never the only means of conveying information</li>
                  <li>Text meets minimum contrast ratios for readability</li>
                  <li>All content is keyboard-navigable</li>
                  <li>Documents are provided in accessible formats (screen reader compatible)</li>
                  <li>Navigation is consistent and predictable throughout the course</li>
                </ul>
              </section>

              <section class="section">
                <h2>Multiple Means of Engagement</h2>
                <p>You can engage with course content in multiple ways:</p>
                <ul>
                  <li><strong>Reading:</strong> Text-based materials with adjustable font sizes</li>
                  <li><strong>Listening:</strong> Audio versions and video lectures with captions</li>
                  <li><strong>Watching:</strong> Visual demonstrations and infographics</li>
                  <li><strong>Doing:</strong> Interactive activities and hands-on projects</li>
                </ul>
              </section>

              <section class="section">
                <h2>Flexible Assessment Options</h2>
                <p>Many assignments offer choice in how you demonstrate learning:</p>
                <ul>
                  <li>Written papers OR recorded presentations</li>
                  <li>Individual work OR collaborative projects</li>
                  <li>Traditional tests OR portfolio assessments</li>
                </ul>
              </section>

              <section class="section">
                <h2>Report an Accessibility Issue</h2>
                <p>If you encounter any accessibility barriers in this course:</p>
                <ol>
                  <li><strong>Email me immediately:</strong> <a href="mailto:[email]">[instructor-email]</a></li>
                  <li><strong>Include:</strong> Specific location of the barrier (which page, document, or video)</li>
                  <li><strong>Expected response:</strong> I will respond within 24 hours with a solution or timeline</li>
                </ol>
                <p>You can also contact <a href="[link]">Disability Services</a> for additional support.</p>
              </section>

              <section class="section">
                <h2>Assistive Technology Compatibility</h2>
                <p>This course has been tested with:</p>
                <ul>
                  <li>JAWS screen reader</li>
                  <li>NVDA screen reader</li>
                  <li>VoiceOver (Mac/iOS)</li>
                  <li>TalkBack (Android)</li>
                  <li>Dragon NaturallySpeaking (speech recognition)</li>
                  <li>ZoomText (screen magnification)</li>
                </ul>
              </section>
            `)
          }
        ]
      },
      {
        name: 'Week 1: [Module Topic]',
        description: 'Introduction and foundational concepts',
        items: [
          {
            type: 'Page',
            title: '📍 Module Overview & Learning Objectives',
            content: createAccessibleHTML(`
              <h1>Week 1: [Module Topic]</h1>
              
              <section class="section">
                <h2>Learning Objectives</h2>
                <p>By the end of this module, you will be able to:</p>
                <ol>
                  <li>[Specific, measurable objective 1]</li>
                  <li>[Specific, measurable objective 2]</li>
                  <li>[Specific, measurable objective 3]</li>
                </ol>
              </section>

              <section class="section">
                <h2>Module Roadmap</h2>
                <p><strong>Estimated time to complete:</strong> 4-6 hours</p>
                
                <h3>Step 1: Learn (2-3 hours)</h3>
                <ul>
                  <li>📖 Read Chapter 1 (30 min)</li>
                  <li>🎥 Watch Video Lecture (45 min)</li>
                  <li>📊 Review Infographic (15 min)</li>
                </ul>

                <h3>Step 2: Practice (1-2 hours)</h3>
                <ul>
                  <li>✏️ Complete Practice Quiz (30 min)</li>
                  <li>💬 Participate in Discussion (60 min)</li>
                </ul>

                <h3>Step 3: Apply (1-2 hours)</h3>
                <ul>
                  <li>📝 Submit Written Reflection (60 min)</li>
                </ul>
              </section>

              <section class="section">
                <h2>Due Dates</h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <caption style="font-weight: bold; margin-bottom: 0.5em;">Assignment Deadlines</caption>
                  <thead>
                    <tr style="background: #f5f5f7;">
                      <th style="padding: 8px; text-align: left; border: 1px solid #d2d2d7;">Assignment</th>
                      <th style="padding: 8px; text-align: left; border: 1px solid #d2d2d7;">Due Date</th>
                      <th style="padding: 8px; text-align: left; border: 1px solid #d2d2d7;">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style="padding: 8px; border: 1px solid #d2d2d7;">Discussion Post</td>
                      <td style="padding: 8px; border: 1px solid #d2d2d7;">[Date] 11:59 PM</td>
                      <td style="padding: 8px; border: 1px solid #d2d2d7;">10 points</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px; border: 1px solid #d2d2d7;">Practice Quiz</td>
                      <td style="padding: 8px; border: 1px solid #d2d2d7;">[Date] 11:59 PM</td>
                      <td style="padding: 8px; border: 1px solid #d2d2d7;">15 points</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px; border: 1px solid #d2d2d7;">Written Reflection</td>
                      <td style="padding: 8px; border: 1px solid #d2d2d7;">[Date] 11:59 PM</td>
                      <td style="padding: 8px; border: 1px solid #d2d2d7;">25 points</td>
                    </tr>
                  </tbody>
                </table>
              </section>
            `)
          },
          {
            type: 'Page',
            title: '📖 Required Reading',
            indent: 1
          },
          {
            type: 'Page',
            title: '🎥 Video Lecture (with captions & transcript)',
            indent: 1
          },
          {
            type: 'Discussion',
            title: '💬 Discussion: [Topic]',
            indent: 1
          },
          {
            type: 'Assignment',
            title: '📝 Assignment: [Name]',
            indent: 1
          },
          {
            type: 'Quiz',
            title: '✅ Knowledge Check Quiz',
            indent: 1
          }
        ]
      },
      {
        name: 'Week 2-14: [Repeat Module Structure]',
        description: 'Each week follows the same accessible pattern',
        items: [
          {
            type: 'Page',
            title: '📍 Module Overview & Learning Objectives'
          }
        ]
      },
      {
        name: 'Final Assessment',
        description: 'Demonstrate cumulative learning',
        items: [
          {
            type: 'Assignment',
            title: '🎯 Final Project Instructions',
            content: createAccessibleHTML(`
              <h1>Final Project</h1>
              
              <section class="section">
                <h2>Project Overview</h2>
                <p>[Description of final project that synthesizes course learning]</p>
              </section>

              <section class="section">
                <h2>Choice of Format</h2>
                <p>You may submit your final project in ANY of these formats:</p>
                <ul>
                  <li><strong>Written Paper:</strong> 8-10 pages, APA format</li>
                  <li><strong>Video Presentation:</strong> 10-15 minutes with captions</li>
                  <li><strong>Podcast:</strong> 15-20 minutes with transcript</li>
                  <li><strong>Infographic + Explanation:</strong> Visual + 3-4 page written explanation</li>
                  <li><strong>Website/Portfolio:</strong> Multi-page accessible website</li>
                </ul>
                <p><em>Other formats? Propose your idea to me for approval!</em></p>
              </section>

              <section class="section">
                <h2>Grading Rubric</h2>
                <p>Your project will be evaluated on:</p>
                <ul>
                  <li><strong>Content (40%):</strong> Demonstrates mastery of learning objectives</li>
                  <li><strong>Critical Thinking (30%):</strong> Analysis, synthesis, and original insights</li>
                  <li><strong>Communication (20%):</strong> Clear, organized, professional presentation</li>
                  <li><strong>Sources (10%):</strong> Appropriate use of credible sources</li>
                </ul>
                <p><a href="[rubric-link]">View detailed rubric</a></p>
              </section>
            `)
          }
        ]
      }
    ]
  }
};

// TEMPLATE 2: Home Page Template
export const homePageTemplate: CourseTemplate = {
  id: 'homepage-accessible',
  name: 'Home Page Template',
  description: 'Accessible course homepage with clear navigation and student-friendly information hierarchy',
  category: 'page',
  rubricCompliance: {
    cvcOEI: 85,
    peralta: 100,
    wcag: 'AA'
  },
  features: [
    'Quick links to key sections',
    'High contrast welcome banner',
    'Accessible module navigation',
    'Clear assignment overview',
    'Responsive design',
    'Screen reader optimized'
  ],
  color: '#34c759',
  content: {
    type: 'page',
    html: createAccessibleHTML(`
      <h1>Welcome to [Course Name]!</h1>
      
      <div class="accessible-notice" role="banner">
        <h2>🎯 Quick Start Guide</h2>
        <p><strong>New to the course?</strong> Start with the <a href="/courses/[id]/modules/items/first">Course Orientation</a> module.</p>
        <p><strong>Returning student?</strong> Check <a href="/courses/[id]/assignments">upcoming assignments</a> and this week's module below.</p>
      </div>

      <section class="section">
        <h2>📅 This Week at a Glance</h2>
        <h3>Week [X]: [Topic]</h3>
        <p><strong>Key Tasks This Week:</strong></p>
        <ul>
          <li>📖 Complete required readings by [day]</li>
          <li>💬 Participate in discussion by [day]</li>
          <li>📝 Submit assignment by [day]</li>
        </ul>
        <p><a href="/courses/[id]/modules/[current]" style="display: inline-block; background: #0071e3; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; margin-top: 10px;">Go to This Week's Module</a></p>
      </section>

      <section class="section">
        <h2>🔗 Quick Navigation</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
          <div style="border: 2px solid #0071e3; border-radius: 8px; padding: 15px; text-align: center;">
            <h3 style="margin-top: 0; font-size: 1.1em;">📋 Syllabus</h3>
            <p style="font-size: 0.9em; color: #636366;">Course policies & schedule</p>
            <a href="/courses/[id]/assignments/syllabus">View Syllabus</a>
          </div>
          <div style="border: 2px solid #34c759; border-radius: 8px; padding: 15px; text-align: center;">
            <h3 style="margin-top: 0; font-size: 1.1em;">📖 Modules</h3>
            <p style="font-size: 0.9em; color: #636366;">Weekly lessons & materials</p>
            <a href="/courses/[id]/modules">View Modules</a>
          </div>
          <div style="border: 2px solid #ff9500; border-radius: 8px; padding: 15px; text-align: center;">
            <h3 style="margin-top: 0; font-size: 1.1em;">📝 Assignments</h3>
            <p style="font-size: 0.9em; color: #636366;">All course assignments</p>
            <a href="/courses/[id]/assignments">View Assignments</a>
          </div>
          <div style="border: 2px solid #af52de; border-radius: 8px; padding: 15px; text-align: center;">
            <h3 style="margin-top: 0; font-size: 1.1em;">📊 Grades</h3>
            <p style="font-size: 0.9em; color: #636366;">Check your progress</p>
            <a href="/courses/[id]/grades">View Grades</a>
          </div>
        </div>
      </section>

      <section class="section">
        <h2>💬 Instructor Contact</h2>
        <p><strong>Instructor:</strong> [Name]</p>
        <p><strong>Email:</strong> <a href="mailto:[email]">[email]</a></p>
        <p><strong>Office Hours:</strong> [Times] via Zoom (<a href="[zoom-link]">Join here</a>)</p>
        <p><strong>Response Time:</strong> Within 24-48 hours on weekdays</p>
      </section>

      <section class="section">
        <h2>🎯 Student Support Resources</h2>
        <ul>
          <li><a href="/courses/[id]/pages/student-resources">📚 Academic Support Services</a></li>
          <li><a href="/courses/[id]/pages/accessibility-statement">♿ Accessibility Resources</a></li>
          <li><a href="https://community.canvaslms.com/t5/Student-Guide/tkb-p/student">💻 Canvas Help & Tutorials</a></li>
          <li><a href="/courses/[id]/pages/technical-requirements">🔧 Technology Requirements</a></li>
        </ul>
      </section>

      <section class="section">
        <h2>🌟 Course Announcements</h2>
        <p><em>Recent announcements will appear here. Check back regularly for updates!</em></p>
        <p><a href="/courses/[id]/announcements">View all announcements</a></p>
      </section>
    `)
  }
};

// TEMPLATE 3: Module Template
export const moduleTemplate: CourseTemplate = {
  id: 'module-weekly',
  name: 'Weekly Module Template',
  description: 'Structured weekly module following UDL principles with multiple means of engagement',
  category: 'module',
  rubricCompliance: {
    cvcOEI: 95,
    peralta: 100,
    wcag: 'AA'
  },
  features: [
    'Clear learning path',
    'Multiple content formats',
    'Consistent structure',
    'Progress tracking',
    'Estimated time indicators'
  ],
  color: '#5856d6',
  content: {
    type: 'module',
    modules: [
      {
        name: 'Week [X]: [Module Topic]',
        description: '[Brief description of this week\'s focus]',
        items: [
          {
            type: 'Page',
            title: '🎯 START HERE: Module Overview',
            content: 'Learning objectives, roadmap, and due dates'
          },
          {
            type: 'Page',
            title: '📖 Reading: [Topic] (Text)',
            indent: 1
          },
          {
            type: 'Page',
            title: '🎥 Video Lecture: [Topic] (Captioned)',
            indent: 1
          },
          {
            type: 'Page',
            title: '🎧 Audio Summary: [Topic] (with transcript)',
            indent: 1
          },
          {
            type: 'Discussion',
            title: '💬 Discussion: [Topic]',
            indent: 1
          },
          {
            type: 'Assignment',
            title: '✏️ Practice Activity: [Topic]',
            indent: 1
          },
          {
            type: 'Quiz',
            title: '✅ Knowledge Check Quiz',
            indent: 1
          }
        ]
      }
    ]
  }
};

export const allTemplates: CourseTemplate[] = [
  fullCourseTemplate,
  homePageTemplate,
  moduleTemplate
];

export function getTemplateById(id: string): CourseTemplate | undefined {
  return allTemplates.find(t => t.id === id);
}

export function getTemplatesByCategory(category: CourseTemplate['category']): CourseTemplate[] {
  return allTemplates.filter(t => t.category === category);
}