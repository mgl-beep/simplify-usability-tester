import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "npm:@supabase/supabase-js@2";
import { generateAltTextSuggestions } from "./alt-text-generator.ts";
import { generateTableCaptionSuggestions } from "./table-caption-generator.ts";
import { generateLearningObjectives, formatObjectivesForCanvas } from "./ai_objectives_generator.tsx";
import { rewriteContent } from "./content-rewriter.ts";
import { generateContentTemplate } from "./content-template-generator.ts";
import { convertPdfToAccessibleHtml, convertPdfBytesToAccessibleHtml } from "./pdf-to-html-converter.ts";

const app = new Hono();

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Helper function to validate and sanitize access token
function validateAndSanitizeToken(accessToken: any): { valid: boolean; token?: string; error?: string } {
  if (!accessToken) {
    return { valid: false, error: "Access token is required" };
  }
  
  if (typeof accessToken !== 'string' || accessToken.trim() === '') {
    return { valid: false, error: "Invalid access token format" };
  }
  
  // Remove any non-ASCII characters
  const sanitized = accessToken.trim().replace(/[^\x00-\x7F]/g, '');
  
  if (sanitized === '') {
    return { valid: false, error: "Access token contains invalid characters" };
  }
  
  return { valid: true, token: sanitized };
}

// CRITICAL: Enable CORS BEFORE logger to ensure preflight requests are handled properly
app.use(
  "*",
  cors({
    origin: ["https://simplify-lti.vercel.app", "http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    allowHeaders: ["Content-Type", "Authorization", "Cache-Control", "Pragma"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: false,
  }),
);

// Enable logger after CORS
app.use('*', logger(console.log));

// ── Rate Limiting (in-memory, per IP) ──────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 100;      // requests per window
const RATE_LIMIT_WINDOW = 60000; // 1 minute

app.use('*', async (c, next) => {
  // Skip rate limiting for health checks and OPTIONS
  if (c.req.method === 'OPTIONS' || c.req.path.endsWith('/health')) {
    return next();
  }

  const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim()
           || c.req.header('cf-connecting-ip')
           || 'unknown';
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
  } else {
    entry.count++;
    if (entry.count > RATE_LIMIT_MAX) {
      return c.json({ error: 'Rate limit exceeded. Please try again in a minute.' }, 429);
    }
  }

  // Clean up stale entries periodically (every ~500 requests)
  if (Math.random() < 0.002) {
    for (const [key, val] of rateLimitMap) {
      if (now > val.resetAt) rateLimitMap.delete(key);
    }
  }

  return next();
});

// Health check endpoint
app.get("/make-server-74508696/health", (c) => {
  return c.json({ status: "ok" });
});

// Save uploaded course with scan results
app.post("/make-server-74508696/courses", async (c) => {
  try {
    const body = await c.req.json();
    const { courseId, courseName, courseData, scanResults, metadata } = body;

    if (!courseId || !courseName) {
      return c.json({ error: "courseId and courseName are required" }, 400);
    }

    // Store course data
    await kv.set(`course:${courseId}`, {
      courseId,
      courseName,
      courseData, // Full IMSCC parsed data
      metadata: metadata || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Store initial scan results
    if (scanResults && scanResults.length > 0) {
      await kv.set(`scan:${courseId}:latest`, {
        courseId,
        scanResults,
        scannedAt: new Date().toISOString(),
      });
    }

    return c.json({ success: true, courseId });
  } catch (error) {
    console.error("Error saving course:", error);
    return c.json({ error: `Failed to save course: ${error.message}` }, 500);
  }
});

// Get all courses
app.get("/make-server-74508696/courses", async (c) => {
  try {
    const courses = await kv.getByPrefix("course:");
    
    const coursesWithScans = await Promise.all(
      courses.map(async (course) => {
        const scanData = await kv.get(`scan:${course.courseId}:latest`);
        return {
          ...course,
          lastScan: scanData?.scannedAt || null,
          issueCount: scanData?.scanResults?.length || 0,
        };
      })
    );

    return c.json({ courses: coursesWithScans });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return c.json({ error: `Failed to fetch courses: ${error.message}` }, 500);
  }
});

// Get a specific course
app.get("/make-server-74508696/courses/:courseId", async (c) => {
  try {
    const courseId = c.req.param("courseId");
    const course = await kv.get(`course:${courseId}`);

    if (!course) {
      return c.json({ error: "Course not found" }, 404);
    }

    const scanData = await kv.get(`scan:${courseId}:latest`);
    
    return c.json({
      course,
      scanResults: scanData?.scanResults || [],
      lastScan: scanData?.scannedAt || null,
    });
  } catch (error) {
    console.error("Error fetching course:", error);
    return c.json({ error: `Failed to fetch course: ${error.message}` }, 500);
  }
});

// Update scan results for a course
app.post("/make-server-74508696/courses/:courseId/scan", async (c) => {
  try {
    const courseId = c.req.param("courseId");
    const body = await c.req.json();
    const { scanResults } = body;

    if (!scanResults) {
      return c.json({ error: "scanResults are required" }, 400);
    }

    // Archive the previous scan
    const previousScan = await kv.get(`scan:${courseId}:latest`);
    if (previousScan) {
      const archiveKey = `scan:${courseId}:${previousScan.scannedAt}`;
      await kv.set(archiveKey, previousScan);
    }

    // Save new scan results
    await kv.set(`scan:${courseId}:latest`, {
      courseId,
      scanResults,
      scannedAt: new Date().toISOString(),
    });

    // Update course updatedAt timestamp
    const course = await kv.get(`course:${courseId}`);
    if (course) {
      await kv.set(`course:${courseId}`, {
        ...course,
        updatedAt: new Date().toISOString(),
      });
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Error updating scan:", error);
    return c.json({ error: `Failed to update scan: ${error.message}` }, 500);
  }
});

// Apply fixes to course content
app.post("/make-server-74508696/courses/:courseId/fix", async (c) => {
  try {
    const courseId = c.req.param("courseId");
    const body = await c.req.json();
    const { issueIds, fixType } = body;

    if (!issueIds || !Array.isArray(issueIds)) {
      return c.json({ error: "issueIds array is required" }, 400);
    }

    const course = await kv.get(`course:${courseId}`);
    if (!course) {
      return c.json({ error: "Course not found" }, 404);
    }

    const scanData = await kv.get(`scan:${courseId}:latest`);
    if (!scanData) {
      return c.json({ error: "No scan results found" }, 404);
    }

    // Mark issues as fixed
    const updatedScanResults = scanData.scanResults.map((issue: any) => {
      if (issueIds.includes(issue.id)) {
        return { ...issue, status: "fixed" };
      }
      return issue;
    });

    // Save updated scan results
    await kv.set(`scan:${courseId}:latest`, {
      ...scanData,
      scanResults: updatedScanResults,
      lastFixedAt: new Date().toISOString(),
    });

    // Log the fix action
    const fixLog = await kv.get(`fixes:${courseId}`) || { fixes: [] };
    fixLog.fixes.push({
      issueIds,
      fixType,
      appliedAt: new Date().toISOString(),
    });
    await kv.set(`fixes:${courseId}`, fixLog);

    return c.json({ success: true, fixedCount: issueIds.length });
  } catch (error) {
    console.error("Error applying fixes:", error);
    return c.json({ error: `Failed to apply fixes: ${error.message}` }, 500);
  }
});

// Delete a course
app.delete("/make-server-74508696/courses/:courseId", async (c) => {
  try {
    const courseId = c.req.param("courseId");
    
    // Delete course data
    await kv.del(`course:${courseId}`);
    
    // Delete scan data
    await kv.del(`scan:${courseId}:latest`);
    
    // Delete fix logs
    await kv.del(`fixes:${courseId}`);
    
    // Delete archived scans
    const archivedScans = await kv.getByPrefix(`scan:${courseId}:`);
    for (const scan of archivedScans) {
      if (scan.courseId) {
        await kv.del(`scan:${scan.courseId}:${scan.scannedAt}`);
      }
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting course:", error);
    return c.json({ error: `Failed to delete course: ${error.message}` }, 500);
  }
});

// Update course data (for applying fixes to imported courses)
app.put("/make-server-74508696/courses/:courseId", async (c) => {
  try {
    const courseId = c.req.param("courseId");
    const body = await c.req.json();
    const { courseData } = body;

    if (!courseData) {
      return c.json({ error: "courseData is required" }, 400);
    }

    // Get existing course
    const existingCourse = await kv.get(`course:${courseId}`);

    if (!existingCourse) {
      return c.json({ error: "Course not found" }, 404);
    }

    // Update course data (preserve other fields)
    await kv.set(`course:${courseId}`, {
      ...existingCourse,
      courseData,
      updatedAt: new Date().toISOString(),
    });

    return c.json({ success: true });
  } catch (error) {
    console.error("Error updating course:", error);
    return c.json({ error: `Failed to update course: ${error.message}` }, 500);
  }
});

// Canvas API Proxy - Test connection and get user info
app.post("/make-server-74508696/canvas/test", async (c) => {
  try {
    const body = await c.req.json();
    const { domain, accessToken } = body;

    if (!domain || !accessToken) {
      return c.json({ error: "Domain and access token are required" }, 400);
    }

    const tokenValidation = validateAndSanitizeToken(accessToken);
    if (!tokenValidation.valid) {
      return c.json({ error: tokenValidation.error }, 400);
    }

    // Make request to Canvas API with cache-busting
    const response = await fetch(`https://${domain}/api/v1/users/self`, {
      headers: {
        'Authorization': `Bearer ${tokenValidation.token}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Don't log 401, 403, or 404 errors - they're expected when tokens are invalid, users lack permissions, or resources don't exist
      if (response.status !== 401 && response.status !== 403 && response.status !== 404) {
        console.error(`Canvas API error: ${response.status} - ${errorText}`);
      }
      return c.json({ error: `Canvas API error: ${response.statusText}` }, response.status);
    }

    const userData = await response.json();
    
    // Canvas sometimes returns avatar_url directly, sometimes in avatars object
    const avatarUrl = userData.avatar_url || userData.avatar_image_url || userData.avatars?.medium || userData.image_url;
    
    // Ensure we return the avatar URL in a consistent format
    return c.json({ 
      user: {
        ...userData,
        avatar_url: avatarUrl,
        avatar_image_url: avatarUrl,
      }
    });
  } catch (error) {
    console.error("Canvas test connection error:", error);
    return c.json({ error: `Failed to connect to Canvas: ${error.message}` }, 500);
  }
});

// Canvas API Proxy - Get user's courses
app.post("/make-server-74508696/canvas/courses", async (c) => {
  try {
    const body = await c.req.json();
    const { domain, accessToken } = body;

    if (!domain || !accessToken) {
      return c.json({ error: "Domain and access token are required" }, 400);
    }

    const tokenValidation = validateAndSanitizeToken(accessToken);
    if (!tokenValidation.valid) {
      return c.json({ error: tokenValidation.error }, 400);
    }

    // Make request to Canvas API with cache-busting for fresh course list
    const response = await fetch(`https://${domain}/api/v1/courses?per_page=100&include[]=course_image`, {
      headers: {
        'Authorization': `Bearer ${tokenValidation.token}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Don't log 401, 403, or 404 errors - they're expected when tokens are invalid, users lack permissions, or resources don't exist
      if (response.status !== 401 && response.status !== 403 && response.status !== 404) {
        console.error(`Canvas API error: ${response.status} - ${errorText}`);
      }
      return c.json({ error: `Canvas API error: ${response.statusText}` }, response.status);
    }

    const coursesData = await response.json();
    return c.json({ courses: coursesData });
  } catch (error) {
    console.error("Canvas courses fetch error:", error);
    return c.json({ error: `Failed to fetch Canvas courses: ${error.message}` }, 500);
  }
});

// Canvas API Proxy - Get course modules
app.post("/make-server-74508696/canvas/modules", async (c) => {
  try {
    const body = await c.req.json();
    const { domain, accessToken, courseId } = body;

    if (!domain || !accessToken || !courseId) {
      console.error("Missing required parameters:", { domain: !!domain, accessToken: !!accessToken, courseId: !!courseId });
      return c.json({ error: "Domain, access token, and courseId are required" }, 400);
    }

    // CRITICAL: Validate that courseId is a reasonable Canvas ID
    // Canvas course IDs are typically 1-8 digits (e.g., 123, 54321, 12345678)
    // Imported course IDs are timestamps (13+ digits like 1736364793245)
    const courseIdNum = parseInt(courseId);
    if (courseIdNum > 99999999) {
      console.warn(`🛑 REJECTED: Course ID ${courseId} is too large - likely an imported course, not a Canvas course`);
      return c.json({ 
        error: "Invalid course ID - this appears to be an imported course, not a Canvas course",
        isImportedCourse: true 
      }, 400);
    }

    const tokenValidation = validateAndSanitizeToken(accessToken);
    if (!tokenValidation.valid) {
      console.error("Invalid token:", tokenValidation.error);
      return c.json({ error: tokenValidation.error }, 400);
    }

    const url = `https://${domain}/api/v1/courses/${courseId}/modules?include[]=items&per_page=100`;

    // Make request to Canvas API with cache-busting headers for fresh data
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${tokenValidation.token}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Canvas modules API error: ${response.status} - ${errorText}`);
      // Don't log 401, 403, or 404 errors - they're expected when tokens are invalid, users lack permissions, or resources don't exist
      if (response.status !== 401 && response.status !== 403 && response.status !== 404) {
        console.error(`Canvas API error: ${response.status} - ${errorText}`);
      }
      return c.json({ error: `Canvas API error: ${response.statusText}` }, response.status);
    }

    const modulesData = await response.json();
    
    // Fetch page content for all Page items in modules
    for (const module of modulesData) {
      if (module.items && module.items.length > 0) {
        for (const item of module.items) {
          if (item.type === 'Page' && item.page_url) {
            try {
              const pageUrl = `https://${domain}/api/v1/courses/${courseId}/pages/${item.page_url}`;
              const pageResponse = await fetch(pageUrl, {
                headers: {
                  'Authorization': `Bearer ${tokenValidation.token}`,
                  'Content-Type': 'application/json',
                  'Cache-Control': 'no-cache, no-store, must-revalidate',
                  'Pragma': 'no-cache',
                },
              });
              
              if (pageResponse.ok) {
                const pageData = await pageResponse.json();
                // Add page content to the item
                item.content = pageData.body;
                item.body = pageData.body;
              }
            } catch (pageError) {
              console.error(`⚠️ Failed to fetch page ${item.page_url}:`, pageError);
              // Continue with other pages
            }
          }
        }
      }
    }
    
    return c.json({ modules: modulesData });
  } catch (error) {
    console.error("Canvas modules fetch error:", error);
    return c.json({ error: `Failed to fetch Canvas modules: ${error.message}` }, 500);
  }
});

// Canvas API Proxy - Get course assignments
app.post("/make-server-74508696/canvas/assignments", async (c) => {
  try {
    const body = await c.req.json();
    const { domain, accessToken, courseId } = body;

    if (!domain || !accessToken || !courseId) {
      return c.json({ error: "Domain, access token, and courseId are required" }, 400);
    }

    // CRITICAL: Validate that courseId is a reasonable Canvas ID
    const courseIdNum = parseInt(courseId);
    if (courseIdNum > 99999999) {
      console.warn(`🛑 REJECTED: Course ID ${courseId} is too large - likely an imported course, not a Canvas course`);
      return c.json({ 
        error: "Invalid course ID - this appears to be an imported course, not a Canvas course",
        isImportedCourse: true 
      }, 400);
    }

    const tokenValidation = validateAndSanitizeToken(accessToken);
    if (!tokenValidation.valid) {
      return c.json({ error: tokenValidation.error }, 400);
    }

    // Make request to Canvas API with cache-busting headers for fresh data
    const response = await fetch(`https://${domain}/api/v1/courses/${courseId}/assignments?per_page=100`, {
      headers: {
        'Authorization': `Bearer ${tokenValidation.token}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Don't log 401, 403, or 404 errors - they're expected when tokens are invalid, users lack permissions, or resources don't exist
      if (response.status !== 401 && response.status !== 403 && response.status !== 404) {
        console.error(`Canvas API error: ${response.status} - ${errorText}`);
      }
      return c.json({ error: `Canvas API error: ${response.statusText}` }, response.status);
    }

    const assignmentsData = await response.json();
    return c.json({ assignments: assignmentsData });
  } catch (error) {
    console.error("Canvas assignments fetch error:", error);
    return c.json({ error: `Failed to fetch Canvas assignments: ${error.message}` }, 500);
  }
});

// Canvas API Proxy - Get course front page
app.post("/make-server-74508696/canvas/front-page", async (c) => {
  try {
    const body = await c.req.json();
    const { domain, accessToken, courseId } = body;

    if (!domain || !accessToken || !courseId) {
      return c.json({ error: "Domain, access token, and courseId are required" }, 400);
    }

    // CRITICAL: Validate that courseId is a reasonable Canvas ID
    const courseIdNum = parseInt(courseId);
    if (courseIdNum > 99999999) {
      console.warn(`🛑 REJECTED: Course ID ${courseId} is too large - likely an imported course, not a Canvas course`);
      return c.json({ 
        error: "Invalid course ID - this appears to be an imported course, not a Canvas course",
        isImportedCourse: true 
      }, 400);
    }

    const tokenValidation = validateAndSanitizeToken(accessToken);
    if (!tokenValidation.valid) {
      return c.json({ error: tokenValidation.error }, 400);
    }

    // Make request to Canvas API with cache-busting to ensure fresh content
    const response = await fetch(`https://${domain}/api/v1/courses/${courseId}/front_page`, {
      headers: {
        'Authorization': `Bearer ${tokenValidation.token}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Don't log 401, 403, or 404 errors - they're expected when tokens are invalid, users lack permissions, or resources don't exist
      if (response.status !== 401 && response.status !== 403 && response.status !== 404) {
        console.error(`Canvas API error: ${response.status} - ${errorText}`);
      }
      return c.json({ error: `Canvas API error: ${response.statusText}` }, response.status);
    }

    const pageData = await response.json();
    return c.json({ page: pageData });
  } catch (error) {
    console.error("Canvas front page fetch error:", error);
    return c.json({ error: `Failed to fetch Canvas front page: ${error.message}` }, 500);
  }
});

// Canvas API Proxy - Get upcoming assignments across all courses
app.post("/make-server-74508696/canvas/upcoming-assignments", async (c) => {
  try {
    const body = await c.req.json();
    const { domain, accessToken } = body;

    if (!domain || !accessToken) {
      return c.json({ error: "Domain and access token are required" }, 400);
    }

    const tokenValidation = validateAndSanitizeToken(accessToken);
    if (!tokenValidation.valid) {
      return c.json({ error: tokenValidation.error }, 400);
    }

    // Make request to Canvas API for upcoming assignments with cache-busting
    const response = await fetch(
      `https://${domain}/api/v1/users/self/upcoming_events?per_page=10`,
      {
        headers: {
          'Authorization': `Bearer ${tokenValidation.token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      // Don't log 401, 403, or 404 errors - they're expected when tokens are invalid, users lack permissions, or resources don't exist
      if (response.status !== 401 && response.status !== 403 && response.status !== 404) {
        console.error(`Canvas API error: ${response.status} - ${errorText}`);
      }
      return c.json({ error: `Canvas API error: ${response.statusText}` }, response.status);
    }

    const eventsData = await response.json();
    return c.json({ events: eventsData });
  } catch (error) {
    console.error("Canvas upcoming assignments fetch error:", error);
    return c.json({ error: `Failed to fetch upcoming assignments: ${error.message}` }, 500);
  }
});

// Canvas API Proxy - Get announcements across all courses
app.post("/make-server-74508696/canvas/announcements", async (c) => {
  try {
    const body = await c.req.json();
    const { domain, accessToken, courseId } = body;

    if (!domain || !accessToken) {
      return c.json({ error: "Domain and access token are required" }, 400);
    }

    const tokenValidation = validateAndSanitizeToken(accessToken);
    if (!tokenValidation.valid) {
      return c.json({ error: tokenValidation.error }, 400);
    }

    // Validate courseId if provided
    let validCourseId: number | null = null;
    if (courseId !== undefined && courseId !== null) {
      const parsedId = typeof courseId === 'number' ? courseId : parseInt(courseId);
      if (isNaN(parsedId) || parsedId <= 0) {
        console.error(`❌ Invalid courseId for announcements: ${courseId}`);
        return c.json({ error: `Invalid courseId: ${courseId}` }, 400);
      }
      validCourseId = parsedId;
    }

    // If courseId is provided, get announcements for that course; otherwise get all
    const url = validCourseId
      ? `https://${domain}/api/v1/announcements?context_codes[]=course_${validCourseId}&per_page=10&active_only=true`
      : `https://${domain}/api/v1/announcements?per_page=10&active_only=true`;

    // Make request to Canvas API for recent announcements with cache-busting
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${tokenValidation.token}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Don't log 401, 403, or 404 errors - they're expected when tokens are invalid, users lack permissions, or resources don't exist
      if (response.status !== 401 && response.status !== 403 && response.status !== 404) {
        console.error(`Canvas API error: ${response.status} - ${errorText}`);
      }
      return c.json({ error: `Canvas API error: ${response.statusText}` }, response.status);
    }

    const announcementsData = await response.json();
    return c.json({ announcements: announcementsData });
  } catch (error) {
    console.error("Canvas announcements fetch error:", error);
    return c.json({ error: `Failed to fetch announcements: ${error.message}` }, 500);
  }
});

// Canvas API Proxy - Get course discussions
app.post("/make-server-74508696/canvas/discussions", async (c) => {
  try {
    const body = await c.req.json();
    const { domain, accessToken, courseId } = body;

    if (!domain || !accessToken || !courseId) {
      return c.json({ error: "Domain, access token, and courseId are required" }, 400);
    }

    const tokenValidation = validateAndSanitizeToken(accessToken);
    if (!tokenValidation.valid) {
      return c.json({ error: tokenValidation.error }, 400);
    }

    // Validate courseId
    const courseIdNum = parseInt(courseId);
    if (isNaN(courseIdNum) || courseIdNum > 99999999) {
      console.warn(`🛑 REJECTED: Course ID ${courseId} is invalid`);
      return c.json({ error: "Invalid course ID" }, 400);
    }

    // Fetch discussion topics for the course with cache-busting
    const response = await fetch(
      `https://${domain}/api/v1/courses/${courseId}/discussion_topics`,
      {
        headers: {
          'Authorization': `Bearer ${tokenValidation.token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status !== 401 && response.status !== 403 && response.status !== 404) {
        console.error(`Canvas API error: ${response.status} - ${errorText}`);
      }
      return c.json({ error: `Canvas API error: ${response.statusText}` }, response.status);
    }

    const discussionsData = await response.json();
    return c.json({ discussions: discussionsData });
  } catch (error) {
    console.error("Canvas discussions fetch error:", error);
    return c.json({ error: `Failed to fetch discussions: ${error.message}` }, 500);
  }
});

// Canvas API Proxy - Get course quizzes
app.post("/make-server-74508696/canvas/quizzes", async (c) => {
  try {
    const body = await c.req.json();
    const { domain, accessToken, courseId } = body;

    if (!domain || !accessToken || !courseId) {
      return c.json({ error: "Domain, access token, and courseId are required" }, 400);
    }

    const tokenValidation = validateAndSanitizeToken(accessToken);
    if (!tokenValidation.valid) {
      return c.json({ error: tokenValidation.error }, 400);
    }

    // Validate courseId
    const courseIdNum = parseInt(courseId);
    if (isNaN(courseIdNum) || courseIdNum > 99999999) {
      console.warn(`🛑 REJECTED: Course ID ${courseId} is invalid`);
      return c.json({ error: "Invalid course ID" }, 400);
    }

    // Fetch quizzes for the course with cache-busting
    const response = await fetch(
      `https://${domain}/api/v1/courses/${courseId}/quizzes`,
      {
        headers: {
          'Authorization': `Bearer ${tokenValidation.token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status !== 401 && response.status !== 403 && response.status !== 404) {
        console.error(`Canvas API error: ${response.status} - ${errorText}`);
      }
      return c.json({ error: `Canvas API error: ${response.statusText}` }, response.status);
    }

    const quizzesData = await response.json();
    return c.json({ quizzes: quizzesData });
  } catch (error) {
    console.error("Canvas quizzes fetch error:", error);
    return c.json({ error: `Failed to fetch quizzes: ${error.message}` }, 500);
  }
});

// Canvas API Proxy - Get a specific assignment by ID
app.post("/make-server-74508696/canvas/assignment", async (c) => {
  try {
    const body = await c.req.json();
    const { domain, accessToken, courseId, assignmentId } = body;

    if (!domain || !accessToken || !courseId || !assignmentId) {
      return c.json({ error: "Domain, access token, courseId, and assignmentId are required" }, 400);
    }

    // CRITICAL: Validate that courseId is a reasonable Canvas ID
    const courseIdNum = parseInt(courseId);
    if (courseIdNum > 99999999) {
      console.warn(`🛑 REJECTED: Course ID ${courseId} is too large - likely an imported course, not a Canvas course`);
      return c.json({ 
        error: "Invalid course ID - this appears to be an imported course, not a Canvas course",
        isImportedCourse: true 
      }, 400);
    }

    const tokenValidation = validateAndSanitizeToken(accessToken);
    if (!tokenValidation.valid) {
      return c.json({ error: tokenValidation.error }, 400);
    }

    // Make request to Canvas API for assignment details
    const response = await fetch(
      `https://${domain}/api/v1/courses/${courseId}/assignments/${assignmentId}`,
      {
        headers: {
          'Authorization': `Bearer ${tokenValidation.token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      // Don't log 401, 403, or 404 errors - they're expected when tokens are invalid, users lack permissions, or resources don't exist
      if (response.status !== 401 && response.status !== 403 && response.status !== 404) {
        console.error(`Canvas API error: ${response.status} - ${errorText}`);
      }
      return c.json({ error: `Canvas API error: ${response.statusText}` }, response.status);
    }

    const assignmentData = await response.json();
    return c.json({ assignment: assignmentData });
  } catch (error) {
    console.error("Canvas assignment fetch error:", error);
    return c.json({ error: `Failed to fetch assignment: ${error.message}` }, 500);
  }
});

// Canvas API Proxy - Get a specific page by URL
app.post("/make-server-74508696/canvas/page", async (c) => {
  try {
    const body = await c.req.json();
    const { domain, accessToken, courseId, pageUrl } = body;

    if (!domain || !accessToken || !courseId || !pageUrl) {
      return c.json({ error: "Domain, access token, courseId, and pageUrl are required" }, 400);
    }

    // CRITICAL: Validate that courseId is a reasonable Canvas ID
    const courseIdNum = parseInt(courseId);
    if (courseIdNum > 99999999) {
      console.warn(`🛑 REJECTED: Course ID ${courseId} is too large - likely an imported course, not a Canvas course`);
      return c.json({ 
        error: "Invalid course ID - this appears to be an imported course, not a Canvas course",
        isImportedCourse: true 
      }, 400);
    }

    const tokenValidation = validateAndSanitizeToken(accessToken);
    if (!tokenValidation.valid) {
      return c.json({ error: tokenValidation.error }, 400);
    }

    // Make request to Canvas API for page details
    const response = await fetch(
      `https://${domain}/api/v1/courses/${courseId}/pages/${pageUrl}`,
      {
        headers: {
          'Authorization': `Bearer ${tokenValidation.token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      // Don't log 401, 403, or 404 errors - they're expected when tokens are invalid, users lack permissions, or resources don't exist
      if (response.status !== 401 && response.status !== 403 && response.status !== 404) {
        console.error(`Canvas API error: ${response.status} - ${errorText}`);
      }
      return c.json({ error: `Canvas API error: ${response.statusText}` }, response.status);
    }

    const pageData = await response.json();
    return c.json({ page: pageData });
  } catch (error) {
    console.error("Canvas page fetch error:", error);
    return c.json({ error: `Failed to fetch page: ${error.message}` }, 500);
  }
});

// Canvas API Proxy - Get file image data as base64
app.post("/make-server-74508696/canvas/file", async (c) => {
  try {
    const body = await c.req.json();
    const { domain, accessToken, fileId, courseId, imageUrl } = body;

    if (!domain || !accessToken) {
      return c.json({ error: "Domain and access token are required" }, 400);
    }

    const tokenValidation = validateAndSanitizeToken(accessToken);
    if (!tokenValidation.valid) {
      return c.json({ error: tokenValidation.error }, 400);
    }

    // Strategy 1: Try the Files API first
    if (fileId) {
      const endpoints = [
        courseId ? `https://${domain}/api/v1/courses/${courseId}/files/${fileId}` : null,
        `https://${domain}/api/v1/files/${fileId}`,
      ].filter(Boolean);

      for (const endpoint of endpoints) {
        try {
          const metaResponse = await fetch(endpoint!, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${tokenValidation.token}` },
          });
          if (metaResponse.ok) {
            const fileData = await metaResponse.json();
            if (fileData.url) {
              return c.json({ file: fileData });
            }
          }
        } catch { /* try next */ }
      }
    }

    // Strategy 2: Try multiple Canvas URL patterns to fetch the image directly
    const urlsToTry = [
      // API file endpoint with include
      fileId ? `https://${domain}/api/v1/files/${fileId}?include[]=url` : null,
      // Course-scoped download
      courseId && fileId ? `https://${domain}/courses/${courseId}/files/${fileId}/download?download_frd=1` : null,
      // Global download
      fileId ? `https://${domain}/files/${fileId}/download?download_frd=1` : null,
      // Original URL from the page
      imageUrl,
    ].filter(Boolean) as string[];

    for (const tryUrl of urlsToTry) {
      try {
        const imgResponse = await fetch(tryUrl, {
          headers: {
            'Authorization': `Bearer ${tokenValidation.token}`,
          },
          redirect: 'follow',
        });

        if (!imgResponse.ok) continue;

        const contentType = imgResponse.headers.get('content-type') || '';

        // If we got JSON back (from API endpoint), extract the URL
        if (contentType.includes('application/json')) {
          const jsonData = await imgResponse.json();
          if (jsonData.url) {
            return c.json({ file: { url: jsonData.url } });
          }
          continue;
        }

        // If we got actual image data, convert to base64
        if (contentType.startsWith('image/')) {
          const arrayBuffer = await imgResponse.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          let binary = '';
          for (let i = 0; i < uint8Array.length; i++) {
            binary += String.fromCharCode(uint8Array[i]);
          }
          const base64 = btoa(binary);
          return c.json({ file: { url: `data:${contentType};base64,${base64}` } });
        }
      } catch { /* try next URL */ }
    }

    return c.json({ error: "Could not load image from Canvas" }, 404);
  } catch (error) {
    console.error("Canvas file fetch error:", error);
    return c.json({ error: `Failed to fetch file: ${error.message}` }, 500);
  }
});

// Canvas API Proxy - Get discussion topic
app.post("/make-server-74508696/canvas/discussion", async (c) => {
  try {
    const body = await c.req.json();
    const { domain, accessToken, courseId, topicId } = body;

    if (!domain || !accessToken || !courseId || !topicId) {
      return c.json({ error: "Domain, access token, courseId, and topicId are required" }, 400);
    }

    const tokenValidation = validateAndSanitizeToken(accessToken);
    if (!tokenValidation.valid) {
      return c.json({ error: tokenValidation.error }, 400);
    }

    // Validate courseId
    const courseIdNum = parseInt(courseId);
    if (isNaN(courseIdNum) || courseIdNum <= 0 || courseIdNum > 999999999) {
      return c.json({ error: "Invalid courseId format" }, 400);
    }

    // Get discussion from Canvas
    const response = await fetch(
      `https://${domain}/api/v1/courses/${courseId}/discussion_topics/${topicId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenValidation.token}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Canvas discussion fetch error: ${response.status} - ${errorText}`);
      return c.json({ error: `Canvas API error: ${response.status}` }, response.status);
    }

    const discussionData = await response.json();
    return c.json({ discussion: discussionData, topic: discussionData });
  } catch (error) {
    console.error("Canvas discussion fetch error:", error);
    return c.json({ error: `Failed to fetch discussion: ${error.message}` }, 500);
  }
});

// Canvas API Proxy - Upload IMSCC (Step 1: Initiate with pre_attachment)
app.post("/make-server-74508696/canvas/upload-imscc-init", async (c) => {
  try {
    const body = await c.req.json();
    const { domain, accessToken, courseId, fileName, fileSize } = body;

    if (!domain || !accessToken || !courseId || !fileName || !fileSize) {
      return c.json({ 
        error: "Domain, access token, courseId, fileName, and fileSize are required" 
      }, 400);
    }

    const tokenValidation = validateAndSanitizeToken(accessToken);
    if (!tokenValidation.valid) {
      return c.json({ error: tokenValidation.error }, 400);
    }

    // Step 1: Create migration with pre_attachment
    const response = await fetch(
      `https://${domain}/api/v1/courses/${courseId}/content_migrations`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenValidation.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          migration_type: 'common_cartridge_importer',
          pre_attachment: {
            name: fileName,
            size: fileSize,
            content_type: 'application/zip'
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Canvas migration init error: ${response.status} - ${errorText}`);
      return c.json({ 
        error: `Failed to initiate migration: ${errorText}` 
      }, response.status);
    }

    const data = await response.json();
    return c.json(data);
  } catch (error) {
    console.error("Canvas IMSCC upload init error:", error);
    return c.json({ error: `Failed to initiate IMSCC upload: ${error.message}` }, 500);
  }
});

// Canvas API Proxy - Check migration status
app.post("/make-server-74508696/canvas/migration-status", async (c) => {
  try {
    const body = await c.req.json();
    const { domain, accessToken, courseId, migrationId } = body;

    if (!domain || !accessToken || !courseId || !migrationId) {
      return c.json({ 
        error: "Domain, access token, courseId, and migrationId are required" 
      }, 400);
    }

    const tokenValidation = validateAndSanitizeToken(accessToken);
    if (!tokenValidation.valid) {
      return c.json({ error: tokenValidation.error }, 400);
    }

    const response = await fetch(
      `https://${domain}/api/v1/courses/${courseId}/content_migrations/${migrationId}`,
      {
        headers: {
          'Authorization': `Bearer ${tokenValidation.token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Canvas migration status error: ${response.status} - ${errorText}`);
      return c.json({ 
        error: `Failed to get migration status: ${errorText}` 
      }, response.status);
    }

    const data = await response.json();
    return c.json(data);
  } catch (error) {
    console.error("Canvas migration status error:", error);
    return c.json({ error: `Failed to get migration status: ${error.message}` }, 500);
  }
});

// Canvas API Proxy - Upload IMSCC
app.post("/make-server-74508696/canvas/upload", async (c) => {
  try {
    const body = await c.req.json();
    const { domain, accessToken, courseId, fileName, fileData } = body;

    if (!domain || !accessToken || !courseId || !fileName || !fileData) {
      return c.json({ 
        error: "Domain, access token, courseId, fileName, and fileData are required" 
      }, 400);
    }

    // Decode base64 file data
    const fileBytes = Uint8Array.from(atob(fileData), c => c.charCodeAt(0));

    // Step 1: Initiate migration
    const migrationResponse = await fetch(
      `https://${domain}/api/v1/courses/${courseId}/content_migrations`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          migration_type: 'common_cartridge_importer',
          settings: {
            file_url: '',
          },
        }),
      }
    );

    if (!migrationResponse.ok) {
      const errorText = await migrationResponse.text();
      console.error(`Migration init error: ${migrationResponse.status} - ${errorText}`);
      return c.json({ 
        error: `Failed to initiate migration: ${migrationResponse.statusText}` 
      }, migrationResponse.status);
    }

    const migration = await migrationResponse.json();

    // Step 2: Request file upload
    const formData = new FormData();
    formData.append('name', fileName);
    formData.append('size', fileBytes.length.toString());
    formData.append('content_type', 'application/zip');

    const fileUploadResponse = await fetch(
      `https://${domain}/api/v1/courses/${courseId}/files`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      }
    );

    if (!fileUploadResponse.ok) {
      const errorText = await fileUploadResponse.text();
      console.error(`File upload init error: ${fileUploadResponse.status} - ${errorText}`);
      return c.json({ 
        error: `Failed to upload file: ${fileUploadResponse.statusText}` 
      }, fileUploadResponse.status);
    }

    const fileData2 = await fileUploadResponse.json();

    // Step 3: Upload file content
    const uploadFormData = new FormData();
    Object.entries(fileData2.upload_params).forEach(([key, value]) => {
      uploadFormData.append(key, value as string);
    });
    uploadFormData.append('file', new Blob([fileBytes]), fileName);

    const uploadResponse = await fetch(fileData2.upload_url, {
      method: 'POST',
      body: uploadFormData,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error(`File upload error: ${uploadResponse.status} - ${errorText}`);
      return c.json({ 
        error: `Failed to upload file content: ${uploadResponse.statusText}` 
      }, uploadResponse.status);
    }

    // Step 4: Update migration with file
    const updateResponse = await fetch(
      `https://${domain}/api/v1/courses/${courseId}/content_migrations/${migration.id}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          settings: {
            file_url: fileData2.url,
          },
        }),
      }
    );

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error(`Migration update error: ${updateResponse.status} - ${errorText}`);
      return c.json({ 
        error: `Failed to start migration: ${updateResponse.statusText}` 
      }, updateResponse.status);
    }

    const finalMigration = await updateResponse.json();
    
    return c.json({ success: true, migration: finalMigration });
  } catch (error) {
    console.error("Canvas upload error:", error);
    return c.json({ 
      error: `Failed to upload to Canvas: ${error.message}` 
    }, 500);
  }
});

// Canvas API Proxy - Create a new course
app.post("/make-server-74508696/canvas/create-course", async (c) => {
  try {
    const body = await c.req.json();
    const { domain, accessToken, courseName, courseCode } = body;

    if (!domain || !accessToken || !courseName || !courseCode) {
      return c.json({ error: "Domain, access token, course name, and course code are required" }, 400);
    }

    const tokenValidation = validateAndSanitizeToken(accessToken);
    if (!tokenValidation.valid) {
      return c.json({ error: tokenValidation.error }, 400);
    }

    // Make request to Canvas API to create course
    const response = await fetch(
      `https://${domain}/api/v1/accounts/self/courses`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenValidation.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          course: {
            name: courseName,
            course_code: courseCode,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      // Don't log 401, 403, or 404 errors - they're expected when tokens are invalid, users lack permissions, or resources don't exist
      if (response.status !== 401 && response.status !== 403 && response.status !== 404) {
        console.error(`Canvas API error: ${response.status} - ${errorText}`);
      }
      return c.json({ error: `Canvas API error: ${response.statusText}` }, response.status);
    }

    const courseData = await response.json();
    return c.json({ course: courseData });
  } catch (error) {
    console.error("Canvas create course error:", error);
    return c.json({ error: `Failed to create course: ${error.message}` }, 500);
  }
});

// Canvas API Proxy - Get course pages
app.post("/make-server-74508696/canvas/pages", async (c) => {
  try {
    const body = await c.req.json();
    const { domain, accessToken, courseId } = body;

    if (!domain || !accessToken || !courseId) {
      return c.json({ error: "Domain, access token, and courseId are required" }, 400);
    }

    // CRITICAL: Validate that courseId is a reasonable Canvas ID
    const courseIdNum = parseInt(courseId);
    if (courseIdNum > 99999999) {
      console.warn(`🛑 REJECTED: Course ID ${courseId} is too large - likely an imported course, not a Canvas course`);
      return c.json({ 
        error: "Invalid course ID - this appears to be an imported course, not a Canvas course",
        isImportedCourse: true 
      }, 400);
    }

    const tokenValidation = validateAndSanitizeToken(accessToken);
    if (!tokenValidation.valid) {
      return c.json({ error: tokenValidation.error }, 400);
    }

    // Make request to Canvas API with cache-busting
    // include[]=body ensures page HTML content is returned (not just metadata)
    const response = await fetch(`https://${domain}/api/v1/courses/${courseId}/pages?per_page=100&include[]=body`, {
      headers: {
        'Authorization': `Bearer ${tokenValidation.token}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Don't log 401, 403, or 404 errors - they're expected when tokens are invalid, users lack permissions, or resources don't exist
      if (response.status !== 401 && response.status !== 403 && response.status !== 404) {
        console.error(`Canvas API error: ${response.status} - ${errorText}`);
      }
      return c.json({ error: `Canvas API error: ${response.statusText}` }, response.status);
    }

    const pagesData = await response.json();
    return c.json({ pages: pagesData });
  } catch (error) {
    console.error("Canvas pages fetch error:", error);
    return c.json({ error: `Failed to fetch Canvas pages: ${error.message}` }, 500);
  }
});

// Canvas API Proxy - Update page content (for auto-fix)
app.post("/make-server-74508696/canvas/update-page", async (c) => {
  try {
    const body = await c.req.json();
    const { domain, accessToken, courseId, pageUrl, content } = body;

    if (!domain || !accessToken || !courseId || !pageUrl || content === undefined) {
      return c.json({ error: "Domain, access token, courseId, pageUrl, and content are required" }, 400);
    }

    const tokenValidation = validateAndSanitizeToken(accessToken);
    if (!tokenValidation.valid) {
      return c.json({ error: tokenValidation.error }, 400);
    }

    // Make request to Canvas API to update page
    const response = await fetch(
      `https://${domain}/api/v1/courses/${courseId}/pages/${pageUrl}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${tokenValidation.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wiki_page: {
            body: content
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Canvas page update error: ${response.status} - ${errorText}`);
      return c.json({ error: `Failed to update page: ${response.statusText}` }, response.status);
    }

    const pageData = await response.json();
    return c.json({ success: true, page: pageData });
  } catch (error) {
    console.error("Canvas page update error:", error);
    return c.json({ error: `Failed to update page: ${error.message}` }, 500);
  }
});

// Canvas API Proxy - Update assignment content (for auto-fix)
app.post("/make-server-74508696/canvas/update-assignment", async (c) => {
  try {
    const body = await c.req.json();
    const { domain, accessToken, courseId, assignmentId, description } = body;

    if (!domain || !accessToken || !courseId || !assignmentId || description === undefined) {
      return c.json({ error: "Domain, access token, courseId, assignmentId, and description are required" }, 400);
    }

    const tokenValidation = validateAndSanitizeToken(accessToken);
    if (!tokenValidation.valid) {
      return c.json({ error: tokenValidation.error }, 400);
    }

    // Make request to Canvas API to update assignment
    const response = await fetch(
      `https://${domain}/api/v1/courses/${courseId}/assignments/${assignmentId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${tokenValidation.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignment: {
            description: description
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Canvas assignment update error: ${response.status} - ${errorText}`);
      return c.json({ error: `Failed to update assignment: ${response.statusText}` }, response.status);
    }

    const assignmentData = await response.json();
    return c.json({ success: true, assignment: assignmentData });
  } catch (error) {
    console.error("Canvas assignment update error:", error);
    return c.json({ error: `Failed to update assignment: ${error.message}` }, 500);
  }
});

// Canvas API Proxy - Get a specific discussion topic (announcement) by ID
app.post("/make-server-74508696/canvas/discussion", async (c) => {
  try {
    const body = await c.req.json();
    const { domain, accessToken, courseId, topicId } = body;

    if (!domain || !accessToken || !courseId || !topicId) {
      return c.json({ error: "Domain, access token, courseId, and topicId are required" }, 400);
    }

    const tokenValidation = validateAndSanitizeToken(accessToken);
    if (!tokenValidation.valid) {
      return c.json({ error: tokenValidation.error }, 400);
    }

    const response = await fetch(
      `https://${domain}/api/v1/courses/${courseId}/discussion_topics/${topicId}`,
      {
        headers: {
          'Authorization': `Bearer ${tokenValidation.token}`,
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Canvas API error: ${response.status} - ${errorText}`);
      return c.json({ error: `Canvas API error: ${response.statusText}` }, response.status);
    }

    const topicData = await response.json();
    return c.json({ topic: topicData });
  } catch (error) {
    console.error("Canvas discussion fetch error:", error);
    return c.json({ error: `Failed to fetch discussion topic: ${error.message}` }, 500);
  }
});

// Canvas API Proxy - Update discussion topic (announcement) content
app.post("/make-server-74508696/canvas/update-discussion", async (c) => {
  try {
    const body = await c.req.json();
    const { domain, accessToken, courseId, topicId, message } = body;

    if (!domain || !accessToken || !courseId || !topicId || message === undefined) {
      return c.json({ error: "Domain, access token, courseId, topicId, and message are required" }, 400);
    }

    const tokenValidation = validateAndSanitizeToken(accessToken);
    if (!tokenValidation.valid) {
      return c.json({ error: tokenValidation.error }, 400);
    }

    const response = await fetch(
      `https://${domain}/api/v1/courses/${courseId}/discussion_topics/${topicId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${tokenValidation.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Canvas discussion update error: ${response.status} - ${errorText}`);
      return c.json({ error: `Failed to update discussion topic: ${response.statusText}` }, response.status);
    }

    const topicData = await response.json();
    return c.json({ success: true, topic: topicData });
  } catch (error) {
    console.error("Canvas discussion update error:", error);
    return c.json({ error: `Failed to update discussion topic: ${error.message}` }, 500);
  }
});

// Canvas API Proxy - Add learning objectives to module
app.post("/make-server-74508696/canvas/add-objectives-to-module", async (c) => {
  try {
    const body = await c.req.json();
    const { domain, accessToken, courseId, moduleId, objectivesHtml } = body;

    if (!domain || !accessToken || !courseId || !moduleId || !objectivesHtml) {
      return c.json({ error: "Domain, access token, courseId, moduleId, and objectivesHtml are required" }, 400);
    }

    const tokenValidation = validateAndSanitizeToken(accessToken);
    if (!tokenValidation.valid) {
      return c.json({ error: tokenValidation.error }, 400);
    }

    // First, fetch the module's current settings
    const fetchResponse = await fetch(
      `https://${domain}/api/v1/courses/${courseId}/modules/${moduleId}`,
      {
        headers: {
          'Authorization': `Bearer ${tokenValidation.token}`,
        }
      }
    );

    if (!fetchResponse.ok) {
      const errorText = await fetchResponse.text();
      console.error(`Canvas API error fetching module: ${fetchResponse.status} - ${errorText}`);
      return c.json({ error: `Failed to fetch module: ${fetchResponse.statusText}` }, fetchResponse.status);
    }

    const moduleData = await fetchResponse.json();
    
    // Canvas modules don't have a description field in the API
    // Strategy: Find or create a "Module Overview" page as the first item
    const moduleName = moduleData.name || 'Module';
    
    // Fetch module items to see if there's already an overview page
    const itemsResponse = await fetch(
      `https://${domain}/api/v1/courses/${courseId}/modules/${moduleId}/items`,
      {
        headers: {
          'Authorization': `Bearer ${tokenValidation.token}`,
        }
      }
    );

    let overviewPage = null;
    if (itemsResponse.ok) {
      const items = await itemsResponse.json();
      // Look for an existing overview page (first page item, or one with "overview" in title)
      overviewPage = items.find((item: any) => 
        item.type === 'Page' && 
        (item.title?.toLowerCase().includes('overview') || item.position === 1)
      );
    }

    let pageUrl = overviewPage?.page_url;
    let pageTitle = overviewPage?.title || `${moduleName} Overview`;

    // If no overview page exists, create one
    if (!overviewPage) {
      
      // Create the page first
      const createPageResponse = await fetch(
        `https://${domain}/api/v1/courses/${courseId}/pages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${tokenValidation.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            wiki_page: {
              title: pageTitle,
              body: objectivesHtml,
              published: true
            }
          })
        }
      );

      if (!createPageResponse.ok) {
        const errorText = await createPageResponse.text();
        console.error(`Failed to create page: ${createPageResponse.status} - ${errorText}`);
        return c.json({ error: `Failed to create overview page: ${createPageResponse.statusText}` }, createPageResponse.status);
      }

      const newPage = await createPageResponse.json();
      pageUrl = newPage.url;

      // Add the page to the module as the first item
      const addItemResponse = await fetch(
        `https://${domain}/api/v1/courses/${courseId}/modules/${moduleId}/items`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${tokenValidation.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            module_item: {
              type: 'Page',
              page_url: pageUrl,
              title: pageTitle,
              position: 1,
              indent: 0
            }
          })
        }
      );

      if (!addItemResponse.ok) {
        const errorText = await addItemResponse.text();
        console.error(`Failed to add item to module: ${addItemResponse.status} - ${errorText}`);
        // Continue anyway - page was created successfully
      }

      return c.json({ success: true, pageUrl, pageTitle, created: true });
    }

    // Update existing overview page
    
    // Fetch current page content
    const pageResponse = await fetch(
      `https://${domain}/api/v1/courses/${courseId}/pages/${pageUrl}`,
      {
        headers: {
          'Authorization': `Bearer ${tokenValidation.token}`,
        }
      }
    );

    let currentBody = '';
    if (pageResponse.ok) {
      const pageData = await pageResponse.json();
      currentBody = pageData.body || '';
    }

    // Check if objectives already exist (to avoid duplicates)
    const hasObjectives = currentBody.includes('<h3>Learning Outcomes</h3>') || 
                         currentBody.includes('<h2>Learning Outcomes</h2>') ||
                         currentBody.includes('<h3>Learning Objectives</h3>') || 
                         currentBody.includes('<h2>Learning Objectives</h2>');

    let newBody;
    if (hasObjectives) {
      // Replace existing objectives/outcomes section
      newBody = currentBody.replace(
        /<h[23]>Learning (Outcomes|Objectives)<\/h[23]>.*?<\/(ol|ul)>/is,
        objectivesHtml
      );
    } else {
      // Prepend objectives to existing content (INSERT AT TOP)
      newBody = objectivesHtml + (currentBody ? '\n\n' + currentBody : '');
    }

    // Update the page
    const updateResponse = await fetch(
      `https://${domain}/api/v1/courses/${courseId}/pages/${pageUrl}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${tokenValidation.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            wiki_page: {
              body: newBody
            }
          })
        }
      );

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error(`Canvas API error updating page: ${updateResponse.status} - ${errorText}`);
        return c.json({ error: `Failed to update page: ${updateResponse.statusText}` }, updateResponse.status);
      }

      const updatedPage = await updateResponse.json();
      return c.json({ success: true, pageUrl, pageTitle, created: false, previousContent: currentBody });
    } catch (error) {
      console.error("Canvas add objectives error:", error);
      return c.json({ error: `Failed to add objectives: ${error.message}` }, 500);
    }
  });

// AI Alt Text Generator - Generate 3 levels of alt text suggestions
app.post("/make-server-74508696/generate-alt-text", async (c) => {
  try {
    
    const body = await c.req.json();
    const { imageUrl, context } = body;

    if (!imageUrl) {
      console.error('❌ Missing imageUrl in request');
      return c.json({ error: "imageUrl is required" }, 400);
    }

    // Call the AI generator (now returns { suggestions, is_complex, caption })
    const result = await generateAltTextSuggestions(imageUrl, context);

    return c.json({
      success: true,
      suggestions: result.suggestions,
      is_complex: result.is_complex,
      caption: result.caption
    });
  } catch (error) {
    // Handle quota exceeded errors specially
    if (error?.message === 'AI_QUOTA_EXCEEDED') {
      console.warn('⚠️ OpenAI quota exceeded - returning graceful error');
      return c.json({ 
        success: false,
        aiUnavailable: true,
        error: "AI is temporarily unavailable (quota exceeded). You can still enter alt text manually.",
        details: "OpenAI quota limit reached"
      }, 200); // Return 200 so frontend can handle gracefully
    }
    
    // Log unexpected errors
    console.error('❌ UNEXPECTED ERROR:');
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    
    // Return user-friendly error messages
    return c.json({ 
      error: error?.message || "Failed to generate alt text suggestions. Please try again.",
      details: error?.toString() || 'Unknown error'
    }, 500);
  }
});

// AI Table Caption Generator - Generate 3 levels of table caption suggestions
app.post("/make-server-74508696/generate-table-caption", async (c) => {
  try {
    
    const body = await c.req.json();
    const { tableHtml, context } = body;

    if (!tableHtml) {
      console.error('❌ Missing tableHtml in request');
      return c.json({ error: "tableHtml is required" }, 400);
    }

    // Call the AI generator
    const suggestions = await generateTableCaptionSuggestions(tableHtml, context);

    return c.json({ 
      success: true,
      suggestions: suggestions 
    });
  } catch (error) {
    // Handle quota exceeded errors specially
    if (error?.message === 'AI_QUOTA_EXCEEDED') {
      console.warn('⚠️ OpenAI quota exceeded - returning graceful error');
      return c.json({ 
        success: false,
        aiUnavailable: true,
        error: "AI is temporarily unavailable (quota exceeded). You can still enter caption manually.",
        details: "OpenAI quota limit reached"
      }, 200); // Return 200 so frontend can handle gracefully
    }
    
    // Log unexpected errors
    console.error('❌ UNEXPECTED ERROR:');
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    
    // Return user-friendly error messages
    return c.json({ 
      error: error?.message || "Failed to generate table caption suggestions. Please try again.",
      details: error?.toString() || 'Unknown error'
    }, 500);
  }
});

// AI Learning Objectives Generator - Generate measurable objectives with Bloom's Taxonomy
app.post("/make-server-74508696/generate-learning-objectives", async (c) => {
  try {
    
    const body = await c.req.json();
    const { moduleContent, courseName } = body;

    if (!moduleContent) {
      console.error('❌ Missing moduleContent in request');
      return c.json({ error: "moduleContent is required" }, 400);
    }

    // Parse module content to extract module title and items
    const moduleName = moduleContent.match(/MODULE:\s*([^\n]+)/)?.[1] || 'Module';
    const items = moduleContent.split(/ITEM:\s*/g).filter(item => item.trim()).map(item => {
      // Extract just the title (first line)
      return item.split('\n')[0].trim();
    }).filter(title => title.length > 0);

    // Call AI generator function
    const objectives = await generateLearningObjectives({
      moduleTitle: moduleName,
      moduleItems: items,
      courseName: courseName
    });
    
    return c.json({
      success: true,
      objectives: objectives,
      htmlPreview: formatObjectivesForCanvas(objectives)
    });
    
  } catch (error: any) {
    console.error('❌ Error generating learning objectives:', error);
    
    // Check for quota/rate limit errors
    if (error?.message === 'AI_QUOTA_EXCEEDED') {
      console.warn('⚠️ OpenAI quota exceeded - returning graceful error');
      return c.json({ 
        success: false,
        aiUnavailable: true,
        error: "AI is temporarily unavailable (quota exceeded). Try again later.",
        details: "OpenAI quota limit reached"
      }, 200);
    }
    
    console.error('❌ UNEXPECTED ERROR:', error?.message, error?.stack);
    
    return c.json({ 
      error: error?.message || "Failed to generate learning objectives. Please try again.",
      details: error?.toString() || 'Unknown error'
    }, 500);
  }
});

// AI Link Text Generator - Generate 3 levels of link text suggestions based on URL
app.post("/make-server-74508696/generate-link-text", async (c) => {
  try {
    
    const body = await c.req.json();
    const { url, context } = body;

    if (!url) {
      console.error('❌ Missing url in request');
      return c.json({ error: "url is required" }, 400);
    }

    // STEP 1: Fetch the actual destination page to get title and content
    let pageTitle = '';
    let metaDescription = '';
    let mainHeadings: string[] = [];
    let fetchError = null;
    
    try {
      const pageResponse = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SIMPLIFY-LMS-Scanner/1.0; +https://simplify.com)'
        },
        // Timeout after 5 seconds
        signal: AbortSignal.timeout(5000)
      });
      
      if (pageResponse.ok) {
        const html = await pageResponse.text();
        
        // Parse HTML to extract title and headings
        // Simple regex-based parsing (good enough for most pages)
        
        // Extract <title>
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        pageTitle = titleMatch ? titleMatch[1].trim() : '';
        
        // Extract meta description
        const metaMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
        metaDescription = metaMatch ? metaMatch[1].trim() : '';
        
        // Extract h1 and h2 headings (first 3 of each)
        const h1Matches = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi);
        const h2Matches = html.match(/<h2[^>]*>([^<]+)<\/h2>/gi);
        
        if (h1Matches) {
          mainHeadings.push(...h1Matches.slice(0, 3).map(h => h.replace(/<[^>]+>/g, '').trim()));
        }
        if (h2Matches) {
          mainHeadings.push(...h2Matches.slice(0, 3).map(h => h.replace(/<[^>]+>/g, '').trim()));
        }
        
      } else {
        console.warn(`⚠️ Could not fetch page (status ${pageResponse.status})`);
        fetchError = `HTTP ${pageResponse.status}`;
      }
    } catch (error) {
      console.warn(`⚠️ Could not fetch destination page:`, error.message);
      fetchError = error.message;
    }
    
    // STEP 2: Call OpenAI with the actual page content
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const prompt = `You are an accessibility expert helping improve link text for educational content. 

URL: ${url}
${pageTitle ? `ACTUAL PAGE TITLE: "${pageTitle}"` : ''}
${metaDescription ? `META DESCRIPTION: "${metaDescription}"` : ''}
${mainHeadings.length > 0 ? `MAIN HEADINGS: ${mainHeadings.join(', ')}` : ''}
${fetchError ? `(Note: Could not fetch page content - ${fetchError})` : ''}

Context: Page in course "${context?.courseSubject || 'Unknown'}", assignment "${context?.pageTitle || 'Unknown'}"

Generate 3 link text suggestions based on ACTUAL page content (if available) or URL analysis:
1. Brief (2-4 words) - Short and punchy
2. Moderate (4-8 words) - Balanced and descriptive (RECOMMENDED)
3. Detailed (8-12 words) - Comprehensive and informative

CRITICAL GUIDELINES:
- Use the ACTUAL PAGE TITLE if available - don't make up content!
- Describe the DESTINATION or PURPOSE accurately
- Make it meaningful without surrounding context
- Avoid "Click here", "Read more", "View", or generic phrases
- Keep it concise and clear
- For PDFs, include "PDF" in the text
- For videos, include "video" or "tutorial"
- Match the rubric standards: WCAG 2.4.4, CVC-OEI, Peralta, Quality Matters 8.2

Examples:
❌ BAD: "Click here", "Read more", "https://example.com/page"
✅ GOOD: "APA Citation Guide", "Purdue OWL Writing Resources", "Assignment Rubric (PDF)"

Return ONLY valid JSON in this exact format:
{
  "suggestions": [
    { "level": "brief", "text": "..." },
    { "level": "moderate", "text": "..." },
    { "level": "detailed", "text": "..." }
  ]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an accessibility expert that generates descriptive link text based on actual page content. Always respond with valid JSON only. Be accurate and truthful - use the actual page title when provided.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ OpenAI API error:', errorData);
      
      if (response.status === 429) {
        throw new Error('AI_QUOTA_EXCEEDED');
      }
      
      throw new Error(errorData.error?.message || 'OpenAI API request failed');
    }

    const data = await response.json();
    
    const content = data.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    // Parse the JSON response
    const parsed = JSON.parse(content);
    const suggestions = parsed.suggestions;

    if (!suggestions || suggestions.length !== 3) {
      throw new Error('Invalid suggestions format from AI');
    }

    return c.json({ 
      success: true,
      suggestions: suggestions,
      pageInfo: {
        title: pageTitle,
        description: metaDescription,
        headings: mainHeadings,
        fetched: !fetchError
      }
    });
  } catch (error) {
    // Handle quota exceeded errors specially
    if (error?.message === 'AI_QUOTA_EXCEEDED') {
      console.warn('⚠️ OpenAI quota exceeded - returning graceful error');
      return c.json({ 
        success: false,
        aiUnavailable: true,
        error: "AI is temporarily unavailable (quota exceeded). You can still enter link text manually.",
        details: "OpenAI quota limit reached"
      }, 200); // Return 200 so frontend can handle gracefully
    }
    
    // Log unexpected errors
    console.error('❌ UNEXPECTED ERROR:');
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    
    // Return user-friendly error messages
    return c.json({ 
      error: error?.message || "Failed to generate link text suggestions. Please try again.",
      details: error?.toString() || 'Unknown error'
    }, 500);
  }
});

// AI-powered module organization endpoint
app.post("/make-server-74508696/ai-organize-modules", async (c) => {
  try {
    const body = await c.req.json();
    const { domain, accessToken, courseId } = body;

    if (!domain || !accessToken || !courseId) {
      return c.json({ error: "Domain, access token, and courseId are required" }, 400);
    }

    const tokenValidation = validateAndSanitizeToken(accessToken);
    if (!tokenValidation.valid) {
      return c.json({ error: tokenValidation.error }, 400);
    }

    const courseIdNum = parseInt(courseId);
    if (courseIdNum > 99999999) {
      return c.json({ error: "Invalid course ID" }, 400);
    }

    // Fetch all course content in parallel
    const [pagesRes, assignmentsRes, quizzesRes, discussionsRes] = await Promise.all([
      fetch(`https://${domain}/api/v1/courses/${courseId}/pages?per_page=100`, {
        headers: { 'Authorization': `Bearer ${tokenValidation.token}` }
      }),
      fetch(`https://${domain}/api/v1/courses/${courseId}/assignments?per_page=100`, {
        headers: { 'Authorization': `Bearer ${tokenValidation.token}` }
      }),
      fetch(`https://${domain}/api/v1/courses/${courseId}/quizzes?per_page=100`, {
        headers: { 'Authorization': `Bearer ${tokenValidation.token}` }
      }),
      fetch(`https://${domain}/api/v1/courses/${courseId}/discussion_topics?per_page=100`, {
        headers: { 'Authorization': `Bearer ${tokenValidation.token}` }
      })
    ]);

    const pages = pagesRes.ok ? await pagesRes.json() : [];
    const assignments = assignmentsRes.ok ? await assignmentsRes.json() : [];
    const quizzes = quizzesRes.ok ? await quizzesRes.json() : [];
    const discussions = discussionsRes.ok ? await discussionsRes.json() : [];

    if (pages.length === 0 && assignments.length === 0 && quizzes.length === 0 && discussions.length === 0) {
      return c.json({ error: "No content found to organize" }, 400);
    }

    // Prepare content summary for AI
    const contentSummary = {
      pages: pages.map(p => ({ title: p.title, created_at: p.created_at })),
      assignments: assignments.map(a => ({ name: a.name, due_at: a.due_at, points_possible: a.points_possible })),
      quizzes: quizzes.map(q => ({ title: q.title, due_at: q.due_at })),
      discussions: discussions.map(d => ({ title: d.title, posted_at: d.posted_at }))
    };

    // Call OpenAI to analyze and suggest module organization
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return c.json({ error: "OpenAI API key not configured" }, 500);
    }

    const prompt = `Analyze this course content and suggest an organized module structure. Return ONLY valid JSON (no markdown, no explanation).

Content:
${JSON.stringify(contentSummary, null, 2)}

Create a logical module structure with:
1. Clear module names (e.g., "Week 1: Introduction", "Module 2: Core Concepts")
2. Group related content items by topic, week, or theme
3. Maximum 8 modules
4. Each module should have 3-8 items

Return JSON in this exact format:
{
  "modules": [
    {
      "name": "Week 1: Introduction",
      "items": [
        { "type": "Page", "title": "Course Overview" },
        { "type": "Assignment", "title": "Welcome Assignment" }
      ]
    }
  ]
}`;

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      })
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error(`OpenAI API error: ${openaiResponse.status} - ${errorText}`);
      return c.json({ error: "Failed to generate module suggestions" }, 500);
    }

    const openaiData = await openaiResponse.json();
    const aiSuggestion = openaiData.choices[0].message.content.trim();
    
    // Parse AI response (remove markdown code blocks if present)
    const jsonMatch = aiSuggestion.match(/\{[\s\S]*\}/);
    const suggestedStructure = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(aiSuggestion);

    // Map suggested items to actual Canvas IDs
    const modulesWithIds = suggestedStructure.modules.map(module => {
      const itemsWithIds = module.items.map(item => {
        let contentId = null;
        let contentType = null;

        if (item.type === 'Page') {
          const page = pages.find(p => p.title === item.title);
          if (page) {
            contentId = page.page_id || page.url;
            contentType = 'Page';
          }
        } else if (item.type === 'Assignment') {
          const assignment = assignments.find(a => a.name === item.title);
          if (assignment) {
            contentId = assignment.id;
            contentType = 'Assignment';
          }
        } else if (item.type === 'Quiz') {
          const quiz = quizzes.find(q => q.title === item.title);
          if (quiz) {
            contentId = quiz.id;
            contentType = 'Quiz';
          }
        } else if (item.type === 'Discussion') {
          const discussion = discussions.find(d => d.title === item.title);
          if (discussion) {
            contentId = discussion.id;
            contentType = 'Discussion';
          }
        }

        return contentId ? { ...item, contentId, contentType } : null;
      }).filter(Boolean);

      return { ...module, items: itemsWithIds };
    });

    return c.json({ 
      success: true, 
      modules: modulesWithIds,
      summary: {
        totalModules: modulesWithIds.length,
        totalItems: modulesWithIds.reduce((sum, m) => sum + m.items.length, 0)
      }
    });
  } catch (error) {
    console.error("AI module organization error:", error);
    return c.json({ error: `Failed to organize modules: ${error.message}` }, 500);
  }
});

// Apply AI-suggested module organization to Canvas
app.post("/make-server-74508696/apply-module-organization", async (c) => {
  try {
    const body = await c.req.json();
    const { domain, accessToken, courseId, modules } = body;

    if (!domain || !accessToken || !courseId || !modules) {
      return c.json({ error: "Domain, access token, courseId, and modules are required" }, 400);
    }

    const tokenValidation = validateAndSanitizeToken(accessToken);
    if (!tokenValidation.valid) {
      return c.json({ error: tokenValidation.error }, 400);
    }

    const courseIdNum = parseInt(courseId);
    if (courseIdNum > 99999999) {
      return c.json({ error: "Invalid course ID" }, 400);
    }

    const createdModules = [];

    for (let i = 0; i < modules.length; i++) {
      const module = modules[i];
      
      // Create module
      const moduleResponse = await fetch(
        `https://${domain}/api/v1/courses/${courseId}/modules`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${tokenValidation.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            module: {
              name: module.name,
              position: i + 1,
              published: true
            }
          })
        }
      );

      if (!moduleResponse.ok) {
        const errorText = await moduleResponse.text();
        console.error(`Failed to create module "${module.name}": ${errorText}`);
        continue;
      }

      const createdModule = await moduleResponse.json();

      // Add items to module
      for (let j = 0; j < module.items.length; j++) {
        const item = module.items[j];
        
        if (!item.contentId || !item.contentType) continue;

        const itemResponse = await fetch(
          `https://${domain}/api/v1/courses/${courseId}/modules/${createdModule.id}/items`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${tokenValidation.token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              module_item: {
                title: item.title,
                type: item.contentType,
                content_id: item.contentId,
                position: j + 1
              }
            })
          }
        );

        if (!itemResponse.ok) {
          const errorText = await itemResponse.text();
          console.error(`Failed to add item "${item.title}" to module: ${errorText}`);
        } else {
        }
      }

      createdModules.push(createdModule);
    }

    return c.json({ 
      success: true, 
      modulesCreated: createdModules.length,
      modules: createdModules
    });
  } catch (error) {
    console.error("Apply module organization error:", error);
    return c.json({ error: `Failed to apply modules: ${error.message}` }, 500);
  }
});

// AI Learning Objectives Generator
app.post("/make-server-74508696/ai/generate-objectives", async (c) => {
  try {
    const body = await c.req.json();
    const { moduleTitle, moduleItems, courseName, courseLevel, moduleContent, moduleName, existingObjectives } = body;

    // Support both old format (moduleTitle + moduleItems) and new format (moduleContent + moduleName)
    const title = moduleTitle || moduleName;
    let items = moduleItems;
    
    // If moduleContent is provided, parse it to extract items
    if (moduleContent && !moduleItems) {
      items = moduleContent.split(/ITEM:\s*/g)
        .filter((item: string) => item.trim())
        .map((item: string) => item.split('\n')[0].trim());
    }

    if (!title || !items) {
      return c.json({ error: "moduleTitle/moduleName and moduleItems/moduleContent are required" }, 400);
    }

    if (existingObjectives && existingObjectives.length > 0) {
    }

    // Check if there's enough content to generate objectives
    if (!items || items.length === 0) {
      return c.json({ 
        error: 'Cannot generate learning outcomes for a module with no content. Please add assignments, pages, or other instructional materials first.',
        isEmpty: true
      }, 400);
    }

    // Generate objectives using AI
    const objectives = await generateLearningObjectives({
      moduleTitle: title,
      moduleItems: items,
      courseName,
      courseLevel,
      existingObjectives
    });

    // Format for Canvas
    const htmlContent = formatObjectivesForCanvas(objectives);

    return c.json({ 
      success: true,
      objectives: objectives.map(obj => obj.text),
      structuredObjectives: objectives,
      htmlContent
    });
  } catch (error) {
    console.error("AI objectives generation error:", error);
    return c.json({ error: `Failed to generate objectives: ${error.message}` }, 500);
  }
});

// AI Content Rewriter - Rewrites plain-language, instructions, readability, assessment-guidance
app.post("/make-server-74508696/rewrite-content", async (c) => {
  try {

    const body = await c.req.json();
    const { content, category, context } = body;

    if (!content || !category) {
      return c.json({ error: "content and category are required" }, 400);
    }

    const validCategories = ['plain-language', 'instructions', 'readability', 'assessment-guidance'];
    if (!validCategories.includes(category)) {
      return c.json({ error: `Invalid category. Must be one of: ${validCategories.join(', ')}` }, 400);
    }

    const result = await rewriteContent(content, category, context);

    return c.json({ success: true, rewritten: result.rewritten });
  } catch (error) {
    if (error?.message === 'AI_QUOTA_EXCEEDED') {
      return c.json({
        success: false,
        aiUnavailable: true,
        error: "AI is temporarily unavailable (quota exceeded). Please edit the content manually.",
      }, 200);
    }
    console.error('❌ Content rewrite error:', error?.message);
    return c.json({
      error: error?.message || "Failed to rewrite content. Please try again.",
    }, 500);
  }
});

// AI Content Template Generator - Generates new content for structural course flags
app.post("/make-server-74508696/generate-template", async (c) => {
  try {

    const body = await c.req.json();
    const { category, context } = body;

    if (!category) {
      return c.json({ success: false, error: "Category is required" }, 400);
    }

    const result = await generateContentTemplate(category, context || {});

    return c.json({ success: true, rewritten: result.template });
  } catch (error: any) {
    console.error('❌ Template generation error:', error);

    if (error?.message === 'AI_QUOTA_EXCEEDED') {
      return c.json({
        success: false,
        aiUnavailable: true,
        error: "AI service is temporarily unavailable due to quota limits.",
      }, 503);
    }

    return c.json({
      success: false,
      error: error?.message || "Failed to generate template. Please try again.",
    }, 500);
  }
});

// Canvas API Proxy - Create a new announcement
app.post("/make-server-74508696/canvas/create-announcement", async (c) => {
  try {
    const body = await c.req.json();
    const { domain, accessToken, courseId, title, message } = body;

    if (!domain || !accessToken || !courseId || !title || !message) {
      return c.json({ error: "Domain, accessToken, courseId, title, and message are required" }, 400);
    }

    const tokenValidation = validateAndSanitizeToken(accessToken);
    if (!tokenValidation.valid) {
      return c.json({ error: tokenValidation.error }, 400);
    }

    // Use URL-encoded form data — more compatible with all Canvas LMS versions
    // (Canvas was originally designed for form params; JSON works but can fail validation on some instances)
    const formData = new URLSearchParams();
    formData.append('title', String(title));
    formData.append('message', String(message));
    formData.append('is_announcement', '1');
    formData.append('published', '1');

    const response = await fetch(
      `https://${domain}/api/v1/courses/${courseId}/discussion_topics`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenValidation.token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Canvas create announcement error: ${response.status} - ${errorText}`);
      // Return the actual Canvas error body for better debugging
      let errorMsg = response.statusText;
      try {
        const parsed = JSON.parse(errorText);
        if (parsed.errors) {
          const firstKey = Object.keys(parsed.errors)[0];
          const firstError = parsed.errors[firstKey];
          errorMsg = Array.isArray(firstError)
            ? (firstError[0]?.message || firstError[0]?.type || JSON.stringify(firstError[0]))
            : (firstError?.message || firstError?.type || JSON.stringify(firstError));
        } else if (parsed.message) {
          errorMsg = parsed.message;
        } else {
          errorMsg = errorText;
        }
      } catch {
        errorMsg = errorText || response.statusText;
      }
      return c.json({ error: errorMsg }, response.status);
    }

    const announcementData = await response.json();
    return c.json({ success: true, id: announcementData.id, url: announcementData.html_url });
  } catch (error: any) {
    console.error("Canvas create announcement error:", error);
    return c.json({ error: `Failed to create announcement: ${error.message}` }, 500);
  }
});

// Canvas API Proxy - Create a new discussion topic
app.post("/make-server-74508696/canvas/create-discussion", async (c) => {
  try {
    const body = await c.req.json();
    const { domain, accessToken, courseId, title, message } = body;

    if (!domain || !accessToken || !courseId || !title || !message) {
      return c.json({ error: "Domain, accessToken, courseId, title, and message are required" }, 400);
    }

    const tokenValidation = validateAndSanitizeToken(accessToken);
    if (!tokenValidation.valid) {
      return c.json({ error: tokenValidation.error }, 400);
    }

    // Use URL-encoded form data for maximum Canvas compatibility
    const formData = new URLSearchParams();
    formData.append('title', String(title));
    formData.append('message', String(message));
    formData.append('discussion_type', 'threaded');
    // published=0 means draft — instructor publishes when ready

    const response = await fetch(
      `https://${domain}/api/v1/courses/${courseId}/discussion_topics`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenValidation.token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Canvas create discussion error: ${response.status} - ${errorText}`);
      let errorMsg = response.statusText;
      try {
        const parsed = JSON.parse(errorText);
        if (parsed.errors) {
          const firstKey = Object.keys(parsed.errors)[0];
          const firstError = parsed.errors[firstKey];
          errorMsg = Array.isArray(firstError)
            ? (firstError[0]?.message || firstError[0]?.type || JSON.stringify(firstError[0]))
            : (firstError?.message || firstError?.type || JSON.stringify(firstError));
        } else if (parsed.message) {
          errorMsg = parsed.message;
        } else {
          errorMsg = errorText;
        }
      } catch {
        errorMsg = errorText || response.statusText;
      }
      return c.json({ error: errorMsg }, response.status);
    }

    const discussionData = await response.json();
    return c.json({ success: true, id: discussionData.id, url: discussionData.html_url });
  } catch (error: any) {
    console.error("Canvas create discussion error:", error);
    return c.json({ error: `Failed to create discussion: ${error.message}` }, 500);
  }
});

// Canvas API Proxy - Append HTML to course syllabus
app.post("/make-server-74508696/canvas/append-to-syllabus", async (c) => {
  try {
    const body = await c.req.json();
    const { domain, accessToken, courseId, appendHtml } = body;

    if (!domain || !accessToken || !courseId || !appendHtml) {
      return c.json({ error: "Domain, accessToken, courseId, and appendHtml are required" }, 400);
    }

    const tokenValidation = validateAndSanitizeToken(accessToken);
    if (!tokenValidation.valid) {
      return c.json({ error: tokenValidation.error }, 400);
    }

    // Fetch the current syllabus body
    const fetchResponse = await fetch(
      `https://${domain}/api/v1/courses/${courseId}?include[]=syllabus_body`,
      {
        headers: {
          'Authorization': `Bearer ${tokenValidation.token}`,
        },
      }
    );

    if (!fetchResponse.ok) {
      const errorText = await fetchResponse.text();
      console.error(`Canvas fetch syllabus error: ${fetchResponse.status} - ${errorText}`);
      return c.json({ error: `Failed to fetch syllabus: ${fetchResponse.statusText}` }, fetchResponse.status);
    }

    const courseData = await fetchResponse.json();
    const currentSyllabus = courseData.syllabus_body || '';
    const newSyllabus = currentSyllabus
      ? `${currentSyllabus}\n\n<hr/>\n${appendHtml}`
      : appendHtml;

    // Update the syllabus
    const updateResponse = await fetch(
      `https://${domain}/api/v1/courses/${courseId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${tokenValidation.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          course: {
            syllabus_body: newSyllabus,
          },
        }),
      }
    );

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error(`Canvas update syllabus error: ${updateResponse.status} - ${errorText}`);
      return c.json({ error: `Failed to update syllabus: ${updateResponse.statusText}` }, updateResponse.status);
    }

    return c.json({ success: true, previousContent: currentSyllabus });
  } catch (error: any) {
    console.error("Canvas append-to-syllabus error:", error);
    return c.json({ error: `Failed to update syllabus: ${error.message}` }, 500);
  }
});

// ─── PDF Conversion Endpoints ────────────────────────────────────────────────

// Download a PDF file from Canvas and return as base64
app.post("/make-server-74508696/canvas/download-file", async (c) => {
  try {
    const body = await c.req.json();
    const { domain, accessToken, fileId } = body;

    if (!domain || !accessToken || !fileId) {
      return c.json({ error: "Domain, access token, and fileId are required" }, 400);
    }

    const tokenValidation = validateAndSanitizeToken(accessToken);
    if (!tokenValidation.valid) {
      return c.json({ error: tokenValidation.error }, 400);
    }

    // 1. Get file metadata from Canvas
    const metaResponse = await fetch(
      `https://${domain}/api/v1/files/${fileId}`,
      {
        headers: {
          'Authorization': `Bearer ${tokenValidation.token}`,
        },
      }
    );

    if (!metaResponse.ok) {
      const errorText = await metaResponse.text();
      console.error(`Canvas file metadata error: ${metaResponse.status} - ${errorText}`);
      return c.json({ error: `Failed to get file info: ${metaResponse.statusText}` }, metaResponse.status);
    }

    const fileMeta = await metaResponse.json();

    // Guard: PDF only
    if (!fileMeta.content_type?.includes('pdf') && !fileMeta.filename?.toLowerCase().endsWith('.pdf')) {
      return c.json({ error: "Only PDF files are supported for conversion" }, 400);
    }

    // Guard: 25MB size limit
    if (fileMeta.size > 25 * 1024 * 1024) {
      return c.json({ error: "PDF is too large (max 25MB)" }, 400);
    }

    // 2. Download the binary content
    const downloadUrl = fileMeta.url;
    if (!downloadUrl) {
      return c.json({ error: "No download URL available for this file" }, 400);
    }

    const fileResponse = await fetch(downloadUrl);
    if (!fileResponse.ok) {
      return c.json({ error: `Failed to download file: ${fileResponse.statusText}` }, fileResponse.status);
    }

    const arrayBuffer = await fileResponse.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Convert to base64 (chunked to avoid O(n²) string concat)
    const CHUNK_SIZE = 0x8000;
    const chunks: string[] = [];
    for (let i = 0; i < uint8Array.length; i += CHUNK_SIZE) {
      chunks.push(String.fromCharCode.apply(null, [...uint8Array.subarray(i, i + CHUNK_SIZE)]));
    }
    const base64 = btoa(chunks.join(''));

    return c.json({
      base64,
      filename: fileMeta.filename || fileMeta.display_name || 'document.pdf',
      size: fileMeta.size
    });
  } catch (error: any) {
    console.error("Canvas download-file error:", error);
    return c.json({ error: `Failed to download file: ${error.message}` }, 500);
  }
});

// Convert a PDF (base64) to accessible HTML using AI
app.post("/make-server-74508696/convert-pdf-to-html", async (c) => {
  try {
    const body = await c.req.json();
    const { pdfBase64, pdfFilename, context } = body;

    if (!pdfBase64 || !pdfFilename) {
      return c.json({ error: "pdfBase64 and pdfFilename are required" }, 400);
    }

    const result = await convertPdfToAccessibleHtml(pdfBase64, pdfFilename, context);

    return c.json({
      success: true,
      html: result.html
    });
  } catch (error: any) {
    console.error("PDF-to-HTML conversion error:", error);

    if (error.message === 'AI_QUOTA_EXCEEDED') {
      return c.json({ error: "AI quota exceeded. Please try again later." }, 429);
    }

    return c.json({ error: `PDF conversion failed: ${error.message}` }, 500);
  }
});

// Combined: Download PDF from Canvas + Convert to HTML in one call (no round-trip through browser)
app.post("/make-server-74508696/convert-pdf-from-canvas", async (c) => {
  try {
    const body = await c.req.json();
    const { domain, accessToken, fileId, courseId, pdfFilename: searchFilename, context } = body;

    if (!domain || !accessToken) {
      return c.json({ error: "domain and accessToken are required" }, 400);
    }

    if (!fileId && !searchFilename) {
      return c.json({ error: "fileId or pdfFilename is required" }, 400);
    }

    const tokenValidation = validateAndSanitizeToken(accessToken);
    if (!tokenValidation.valid) {
      return c.json({ error: tokenValidation.error }, 400);
    }

    // Step 1: Get file metadata from Canvas (try by ID first, then search by name)
    let fileMeta: any = null;

    if (fileId) {
      const metaResponse = await fetch(
        `https://${domain}/api/v1/files/${fileId}`,
        { headers: { 'Authorization': `Bearer ${tokenValidation.token}` } }
      );
      if (metaResponse.ok) {
        fileMeta = await metaResponse.json();
      }
    }

    // Fallback: search for the file by name in the course
    if (!fileMeta && searchFilename && courseId) {
      console.log(`File ID lookup failed, searching for "${searchFilename}" in course ${courseId}`);
      const searchResponse = await fetch(
        `https://${domain}/api/v1/courses/${courseId}/files?search_term=${encodeURIComponent(searchFilename)}&per_page=5`,
        { headers: { 'Authorization': `Bearer ${tokenValidation.token}` } }
      );
      if (searchResponse.ok) {
        const files = await searchResponse.json();
        // Find exact or close match
        fileMeta = files.find((f: any) => f.filename === searchFilename || f.display_name === searchFilename)
          || files.find((f: any) => f.filename?.toLowerCase().includes(searchFilename.toLowerCase().replace('.pdf', '')))
          || (files.length > 0 ? files[0] : null);
      }
    }

    if (!fileMeta) {
      return c.json({ error: "Could not find the PDF file in Canvas. It may have been moved or deleted." }, 404);
    }

    if (!fileMeta.content_type?.includes('pdf') && !fileMeta.filename?.toLowerCase().endsWith('.pdf')) {
      return c.json({ error: "Only PDF files are supported for conversion" }, 400);
    }

    if (fileMeta.size > 25 * 1024 * 1024) {
      return c.json({ error: "PDF is too large (max 25MB)" }, 400);
    }

    const downloadUrl = fileMeta.url;
    if (!downloadUrl) {
      return c.json({ error: "No download URL available for this file" }, 400);
    }

    // Step 2: Download the PDF binary
    const fileResponse = await fetch(downloadUrl);
    if (!fileResponse.ok) {
      return c.json({ error: `Failed to download file: ${fileResponse.statusText}` }, fileResponse.status);
    }

    const arrayBuffer = await fileResponse.arrayBuffer();
    const pdfBytes = new Uint8Array(arrayBuffer);
    const pdfFilename = fileMeta.filename || fileMeta.display_name || 'document.pdf';

    // Step 3: Convert PDF to accessible HTML via AI (raw bytes, no base64 overhead)
    const result = await convertPdfBytesToAccessibleHtml(pdfBytes, pdfFilename, context);

    return c.json({ success: true, html: result.html });
  } catch (error: any) {
    console.error("PDF convert-from-canvas error:", error);

    if (error.message === 'AI_QUOTA_EXCEEDED') {
      return c.json({ error: "AI quota exceeded. Please try again later." }, 429);
    }

    return c.json({ error: `PDF conversion failed: ${error.message}` }, 500);
  }
});

// Create a new Canvas page and add it to a module
app.post("/make-server-74508696/canvas/create-page-in-module", async (c) => {
  try {
    const body = await c.req.json();
    const { domain, accessToken, courseId, moduleId, pageTitle, pageBody } = body;

    if (!domain || !accessToken || !courseId || !moduleId || !pageTitle || !pageBody) {
      return c.json({ error: "domain, accessToken, courseId, moduleId, pageTitle, and pageBody are required" }, 400);
    }

    const tokenValidation = validateAndSanitizeToken(accessToken);
    if (!tokenValidation.valid) {
      return c.json({ error: tokenValidation.error }, 400);
    }

    // 1. Create the page
    const createPageResponse = await fetch(
      `https://${domain}/api/v1/courses/${courseId}/pages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenValidation.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wiki_page: {
            title: pageTitle,
            body: pageBody,
            published: true
          }
        })
      }
    );

    if (!createPageResponse.ok) {
      const errorText = await createPageResponse.text();
      console.error(`Failed to create page: ${createPageResponse.status} - ${errorText}`);
      return c.json({ error: `Failed to create page: ${createPageResponse.statusText}` }, createPageResponse.status);
    }

    const newPage = await createPageResponse.json();

    // 2. Add the page to the module
    const addItemResponse = await fetch(
      `https://${domain}/api/v1/courses/${courseId}/modules/${moduleId}/items`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenValidation.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          module_item: {
            type: 'Page',
            page_url: newPage.url,
            title: pageTitle,
            indent: 0
          }
        })
      }
    );

    if (!addItemResponse.ok) {
      const errorText = await addItemResponse.text();
      console.error(`Failed to add page to module: ${addItemResponse.status} - ${errorText}`);
      // Page was created — return success with a note
    }

    return c.json({
      success: true,
      pageUrl: newPage.url,
      pageId: newPage.page_id,
      pageTitle: newPage.title
    });
  } catch (error: any) {
    console.error("Canvas create-page-in-module error:", error);
    return c.json({ error: `Failed to create page: ${error.message}` }, 500);
  }
});

// ============ Upload Image to Canvas Course Files ============
app.post("/make-server-74508696/canvas/upload-image", async (c) => {
  try {
    const body = await c.req.json();
    const { domain, accessToken, courseId, fileName, fileData, contentType } = body;

    if (!domain || !accessToken || !courseId || !fileName || !fileData) {
      return c.json({ error: "domain, accessToken, courseId, fileName, and fileData are required" }, 400);
    }

    const tokenValidation = validateAndSanitizeToken(accessToken);
    if (!tokenValidation.valid) {
      return c.json({ error: tokenValidation.error }, 400);
    }

    const courseIdNum = parseInt(courseId);
    if (courseIdNum > 99999999) {
      return c.json({ error: "Invalid course ID" }, 400);
    }

    // Decode base64 file data
    const fileBytes = Uint8Array.from(atob(fileData), c => c.charCodeAt(0));
    const mimeType = contentType || 'image/png';

    // Step 1: Request file upload slot from Canvas
    const initResponse = await fetch(
      `https://${domain}/api/v1/courses/${courseId}/files`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenValidation.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: fileName,
          size: fileBytes.length,
          content_type: mimeType,
          parent_folder_path: 'uploaded_images',
        }),
      }
    );

    if (!initResponse.ok) {
      const errorText = await initResponse.text();
      console.error(`Canvas file upload init error: ${initResponse.status} - ${errorText}`);
      return c.json({ error: `Failed to initiate file upload: ${initResponse.statusText}` }, initResponse.status);
    }

    const uploadSlot = await initResponse.json();

    if (!uploadSlot.upload_url || !uploadSlot.upload_params) {
      return c.json({ error: "Canvas did not provide upload URL" }, 500);
    }

    // Step 2: Upload file content to the provided upload URL
    const uploadFormData = new FormData();
    Object.entries(uploadSlot.upload_params).forEach(([key, value]) => {
      uploadFormData.append(key, value as string);
    });
    uploadFormData.append('file', new Blob([fileBytes], { type: mimeType }), fileName);

    const uploadResponse = await fetch(uploadSlot.upload_url, {
      method: 'POST',
      body: uploadFormData,
      redirect: 'follow',
    });

    // Canvas may return 3xx redirect to the file object, or 200/201 with file data
    if (!uploadResponse.ok && uploadResponse.status !== 301 && uploadResponse.status !== 302) {
      const errorText = await uploadResponse.text();
      console.error(`Canvas file upload error: ${uploadResponse.status} - ${errorText}`);
      return c.json({ error: `Failed to upload file: ${uploadResponse.statusText}` }, uploadResponse.status);
    }

    // Step 3: Get the file info — response may be the file object or a redirect
    let fileInfo;
    const responseContentType = uploadResponse.headers.get('content-type') || '';
    if (responseContentType.includes('application/json')) {
      fileInfo = await uploadResponse.json();
    } else {
      // If redirect was followed, the final response might have the file data
      // Try to confirm the upload by fetching the file object
      const confirmUrl = uploadResponse.url || uploadSlot.upload_url;
      // Try parsing the response URL for a file ID
      const fileIdMatch = confirmUrl.match(/\/files\/(\d+)/);
      if (fileIdMatch) {
        const confirmResponse = await fetch(
          `https://${domain}/api/v1/files/${fileIdMatch[1]}`,
          {
            headers: { 'Authorization': `Bearer ${tokenValidation.token}` },
          }
        );
        if (confirmResponse.ok) {
          fileInfo = await confirmResponse.json();
        }
      }
    }

    if (!fileInfo || !fileInfo.url) {
      // Fallback: try the location header
      const location = uploadResponse.headers.get('location');
      if (location) {
        const fileIdMatch = location.match(/\/files\/(\d+)/);
        if (fileIdMatch) {
          const confirmResponse = await fetch(
            `https://${domain}/api/v1/files/${fileIdMatch[1]}`,
            {
              headers: { 'Authorization': `Bearer ${tokenValidation.token}` },
            }
          );
          if (confirmResponse.ok) {
            fileInfo = await confirmResponse.json();
          }
        }
      }
    }

    if (!fileInfo || !fileInfo.url) {
      return c.json({ error: "File uploaded but could not retrieve file URL" }, 500);
    }

    return c.json({
      success: true,
      url: fileInfo.url,
      fileId: fileInfo.id,
      fileName: fileInfo.display_name || fileInfo.filename,
    });
  } catch (error: any) {
    console.error("Canvas upload-image error:", error);
    return c.json({ error: `Failed to upload image: ${error.message}` }, 500);
  }
});

// AI Help Chat — answers user questions about SIMPLIFY
app.post("/make-server-74508696/ai/help-chat", async (c) => {
  try {
    const body = await c.req.json();
    const { question } = body;

    if (!question) {
      return c.json({ error: "question is required" }, 400);
    }

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are SIMPLIFY's in-app help assistant. Your ONLY job is to help users navigate and use the SIMPLIFY tool itself. Do NOT explain how to do things directly in Canvas — always explain how to do it through SIMPLIFY.

Here is how SIMPLIFY works:
- CONNECT: Users connect their Canvas account by entering their Canvas URL and API token in the connection modal.
- SCAN: Click "Scan Course" in the top bar, pick a course from the dropdown, and SIMPLIFY scans it against CVC-OEI, Quality Matters, and Peralta Equity rubrics.
- REVIEW: After scanning, issues appear in the Issues tab sorted by severity (high/medium/low). Click any issue to see details and an AI-suggested fix.
- FIX: In the issue detail modal, review the suggested fix, click "Stage Fix" to queue it, then "Publish" to push the fix back to Canvas.
- ANALYTICS: The Analytics tab shows compliance scores, a pie chart breakdown, and per-standard pass rates.
- STANDARDS: Click "Standards" in the header to choose which rubrics to scan against (CVC-OEI, Quality Matters, Peralta Equity).
- ALT TEXT: SIMPLIFY detects missing alt text and generates AI suggestions. Click the issue, review the suggestion, and stage/publish.
- CONTRAST: Color contrast issues show the current vs suggested colors. Stage the fix to apply the new colors.
- FAQ: The FAQ panel (under Guide > FAQ) answers common questions about the tool.

Keep answers to 2-3 sentences. Always frame answers in terms of what to click or where to look in SIMPLIFY's interface.`
          },
          {
            role: 'user',
            content: question
          }
        ],
        max_tokens: 500,
        temperature: 0.5
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 429 || errorData.error?.code === 'insufficient_quota') {
        throw new Error('AI_QUOTA_EXCEEDED');
      }
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const answer = data.choices[0]?.message?.content?.trim() || '';

    if (!answer) {
      throw new Error('No answer returned from AI');
    }

    return c.json({ success: true, answer });
  } catch (error: any) {
    if (error?.message === 'AI_QUOTA_EXCEEDED') {
      return c.json({
        success: false,
        aiUnavailable: true,
        error: "AI is temporarily unavailable (quota exceeded). Please try again later.",
      }, 200);
    }
    console.error('❌ AI help chat error:', error?.message);
    return c.json({
      error: error?.message || "Failed to get AI response. Please try again.",
    }, 500);
  }
});

// ==========================================
// Audio Description Generator (WCAG 1.2.5)
// ==========================================
app.post("/make-server-74508696/generate-audio-description", async (c) => {
  try {
    const body = await c.req.json();
    const { videoUrl, transcript, pageContent, pageTitle, courseSubject } = body;

    if (!videoUrl) {
      return c.json({ error: "videoUrl is required" }, 400);
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const prompt = `You are an accessibility expert specializing in audio descriptions for educational video content (WCAG 2.1 SC 1.2.5).

VIDEO URL: ${videoUrl}
${pageTitle ? `PAGE TITLE: "${pageTitle}"` : ''}
${courseSubject ? `COURSE SUBJECT: "${courseSubject}"` : ''}
${transcript ? `TRANSCRIPT/CAPTIONS:\n${transcript}\n` : ''}
${pageContent ? `SURROUNDING PAGE CONTENT (first 500 chars):\n${pageContent.substring(0, 500)}\n` : ''}

Generate a timestamped audio description script for this educational video. Audio descriptions narrate important visual content (demonstrations, diagrams, on-screen text, physical actions) during natural pauses in dialogue.

GUIDELINES:
- Focus on visual information essential for understanding (not decorative details)
- Describe actions, demonstrations, diagrams, equations, on-screen text
- Keep descriptions concise — they must fit in natural pauses
- Use present tense ("The instructor points to..." not "The instructor pointed to...")
- For lab/demo videos: describe equipment setup, physical procedures, visual results
- For art/PE: describe movements, techniques, visual compositions
- If a transcript is provided, identify pauses between dialogue for description placement
- If no transcript, create reasonable timestamps based on typical educational video pacing
- Generate 5-10 description entries for a typical 5-15 minute video

Return ONLY valid JSON in this exact format:
{
  "entries": [
    { "startTime": "00:00:15", "endTime": "00:00:20", "description": "..." },
    { "startTime": "00:01:30", "endTime": "00:01:35", "description": "..." }
  ],
  "summary": "Brief 1-sentence summary of what this video demonstrates"
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an accessibility expert that generates audio description scripts for educational videos. Always respond with valid JSON only.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 429) {
        throw new Error('AI_QUOTA_EXCEEDED');
      }
      throw new Error(errorData.error?.message || 'OpenAI API request failed');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    // Strip markdown code fences if present
    const cleanContent = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(cleanContent);

    if (!parsed.entries || !Array.isArray(parsed.entries)) {
      throw new Error('Invalid audio description format from AI');
    }

    return c.json({
      success: true,
      entries: parsed.entries,
      summary: parsed.summary || ''
    });
  } catch (error: any) {
    if (error?.message === 'AI_QUOTA_EXCEEDED') {
      return c.json({
        success: false,
        aiUnavailable: true,
        error: "AI is temporarily unavailable (quota exceeded). Please try again later.",
      }, 200);
    }
    console.error('❌ Audio description generation error:', error?.message);
    return c.json({
      error: error?.message || "Failed to generate audio description.",
    }, 500);
  }
});

// === Link Accessibility Audit ===
// Fetches external pages and checks basic WCAG signals
app.post("/make-server-74508696/audit-link-accessibility", async (c) => {
  try {
    const body = await c.req.json();
    const { urls } = body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return c.json({ error: "urls array is required" }, 400);
    }

    // Limit to 20 URLs max to keep response times reasonable
    const limitedUrls = urls.slice(0, 20);

    const auditUrl = async (url: string) => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'SIMPLIFY-A11y-Checker/1.0 (accessibility audit)',
            'Accept': 'text/html',
          },
        });
        clearTimeout(timeout);

        if (!response.ok) {
          return { url, score: 0, checks: { hasLang: false, hasViewport: false, hasTitle: false, hasHeadings: false, imagesWithoutAlt: 0, totalImages: 0 }, error: `HTTP ${response.status}` };
        }

        const html = await response.text();
        // Only check the first 100KB to avoid memory issues
        const truncated = html.slice(0, 100_000);

        // Check WCAG signals
        const hasLang = /<html[^>]+lang\s*=/i.test(truncated);
        const hasViewport = /<meta[^>]+name\s*=\s*["']viewport["']/i.test(truncated);
        const hasTitle = /<title[^>]*>[^<]+<\/title>/i.test(truncated);
        const hasHeadings = /<h[1-6][^>]*>/i.test(truncated);

        // Count images and images without alt
        const imgMatches = truncated.match(/<img[^>]*>/gi) || [];
        const totalImages = imgMatches.length;
        let imagesWithoutAlt = 0;
        for (const img of imgMatches) {
          if (!/alt\s*=/i.test(img)) {
            imagesWithoutAlt++;
          } else {
            // Check for empty alt (which is valid for decorative, but we flag it)
            const altMatch = img.match(/alt\s*=\s*["']([^"']*)["']/i);
            // Empty alt is acceptable (decorative), don't count
          }
        }

        // Calculate score (each check is worth ~20 points)
        let score = 0;
        if (hasLang) score += 20;
        if (hasViewport) score += 15;
        if (hasTitle) score += 20;
        if (hasHeadings) score += 20;
        // Image accessibility: full 25 points if no images or all have alt
        if (totalImages === 0) {
          score += 25;
        } else {
          const altRatio = (totalImages - imagesWithoutAlt) / totalImages;
          score += Math.round(25 * altRatio);
        }

        return {
          url,
          score: Math.min(100, score),
          checks: { hasLang, hasViewport, hasTitle, hasHeadings, imagesWithoutAlt, totalImages },
        };
      } catch (err: any) {
        return {
          url,
          score: 0,
          checks: { hasLang: false, hasViewport: false, hasTitle: false, hasHeadings: false, imagesWithoutAlt: 0, totalImages: 0 },
          error: err?.name === 'AbortError' ? 'Timeout' : (err?.message || 'Fetch failed'),
        };
      }
    };

    // Audit all URLs in parallel (with concurrency limit of 5)
    const results = [];
    for (let i = 0; i < limitedUrls.length; i += 5) {
      const batch = limitedUrls.slice(i, i + 5);
      const batchResults = await Promise.all(batch.map(auditUrl));
      results.push(...batchResults);
    }

    return c.json({ success: true, results });
  } catch (error: any) {
    console.error('❌ Link accessibility audit error:', error?.message);
    return c.json({ error: error?.message || "Failed to audit links." }, 500);
  }
});

// ── Pilot Feedback Submission ─────────────────────────────────
app.post("/make-server-74508696/submit-feedback", async (c) => {
  try {
    const body = await c.req.json();
    const { category, message, userAgent, pageUrl, canvasDomain } = body;

    if (!message || !message.trim()) {
      return c.json({ error: "Message is required" }, 400);
    }

    // Store in Supabase KV
    const feedbackId = `feedback_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await kv.set(feedbackId, {
      category: category || 'general',
      message: message.trim(),
      canvasDomain: canvasDomain || 'unknown',
      userAgent: userAgent || '',
      pageUrl: pageUrl || '',
      timestamp: new Date().toISOString(),
    });

    return c.json({ success: true, id: feedbackId });
  } catch (error: any) {
    console.error("Feedback submission error:", error);
    return c.json({ error: "Failed to submit feedback" }, 500);
  }
});

// ── Error Logging (for monitoring pilot user issues) ─────────
app.post("/make-server-74508696/log-error", async (c) => {
  try {
    const body = await c.req.json();
    const { message, stack, pageUrl, userAgent, componentStack } = body;

    if (!message) {
      return c.json({ error: "Message is required" }, 400);
    }

    const errorId = `error_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await kv.set(errorId, {
      message: (message || '').substring(0, 500),
      stack: (stack || '').substring(0, 2000),
      componentStack: (componentStack || '').substring(0, 1000),
      pageUrl: pageUrl || '',
      userAgent: (userAgent || '').substring(0, 200),
      timestamp: new Date().toISOString(),
    });

    return c.json({ success: true });
  } catch (error: any) {
    console.error("Error logging failed:", error);
    return c.json({ success: true });
  }
});

Deno.serve(app.fetch);