// Canvas LMS API Integration
// Handles authentication and course import/export

import { projectId, publicAnonKey } from './supabase/info';

const SUPABASE_URL = `https://${projectId}.supabase.co/functions/v1`;

export interface CanvasConfig {
  domain: string; // e.g., "canvas.instructure.com" or "your-school.instructure.com"
  accessToken?: string;
}

export interface CanvasUser {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
  avatar_image_url?: string;
  login_id?: string;
}

export interface CanvasCourse {
  id: number;
  name: string;
  course_code: string;
  workflow_state: string;
  created_at: string;
  uuid?: string;
  enrollment_term_id?: number;
  term?: { name: string };
  enrollments?: Array<{
    type: string;
    role: string;
  }>;
  account_id?: number;
  start_at?: string | null;
  end_at?: string | null;
  image_download_url?: string; // Course banner image
  // For imported courses, store the original string courseId
  originalCourseId?: string;
}

export interface CanvasAssignment {
  id: number;
  name: string;
  description: string;
  due_at: string | null;
  points_possible: number;
  course_id: number;
  html_url?: string;
  submission_types?: string[];
  grading_type?: string;
  published?: boolean;
  unlock_at?: string | null;
  lock_at?: string | null;
  has_submitted_submissions?: boolean;
  rubric?: any[];
  rubric_settings?: any;
}

export interface CanvasAnnouncement {
  id: number;
  title: string;
  message: string;
  posted_at: string;
  author?: {
    display_name: string;
    avatar_image_url?: string;
  };
}

export interface CanvasPage {
  page_id: number;
  url: string;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
  published?: boolean;
  html_url?: string;
}

export interface ContentMigration {
  id: number;
  migration_type: string;
  workflow_state: 'queued' | 'running' | 'completed' | 'failed';
  progress_url: string;
  started_at?: string;
  finished_at?: string;
}

export interface CanvasModuleItem {
  id: number;
  title: string;
  type: string;
  content_id: number;
  html_url: string;
  url?: string;
  page_url?: string;
  external_url?: string;
  position: number;
  indent: number;
  module_id: number;
}

export interface CanvasModule {
  id: number;
  name: string;
  position: number;
  unlock_at?: string;
  require_sequential_progress: boolean;
  publish_final_grade?: boolean;
  prerequisite_module_ids: number[];
  state: string;
  completed_at?: string;
  items_count: number;
  items_url: string;
  items?: CanvasModuleItem[];
}

/**
 * Initialize Canvas connection with domain
 */
export function initializeCanvas(domain: string): CanvasConfig {
  return {
    domain: domain.replace(/^https?:\/\//, '').replace(/\/$/, '')
  };
}

/**
 * Get Canvas access token from storage or prompt user
 */
export function getCanvasAccessToken(): string | null {
  return sessionStorage.getItem('canvas_access_token');
}

/**
 * Save Canvas access token
 */
export function saveCanvasAccessToken(token: string): void {
  sessionStorage.setItem('canvas_access_token', token);
}

/**
 * Remove Canvas access token (logout)
 */
export function removeCanvasAccessToken(): void {
  sessionStorage.removeItem('canvas_access_token');
  localStorage.removeItem('canvas_domain');
}

/**
 * Check if user is connected to Canvas
 */
export function isConnectedToCanvas(): boolean {
  return !!getCanvasAccessToken() && !!getCanvasDomain();
}

/**
 * Get Canvas domain from storage
 */
export function getCanvasDomain(): string | null {
  return localStorage.getItem('canvas_domain');
}

/**
 * Save Canvas domain
 */
export function saveCanvasDomain(domain: string): void {
  localStorage.setItem('canvas_domain', domain);
}

/**
 * Get current Canvas configuration
 */
export function getCanvasConfig(): CanvasConfig | null {
  const domain = getCanvasDomain();
  const token = getCanvasAccessToken();
  
  if (!domain) {
    return null;
  }
  
  return {
    domain,
    accessToken: token || undefined,
  };
}

/**
 * Make authenticated request to Canvas API
 */
async function canvasRequest<T>(
  endpoint: string,
  config: CanvasConfig,
  options: RequestInit = {}
): Promise<T> {
  const token = config.accessToken || getCanvasAccessToken();
  
  if (!token) {
    throw new Error('Canvas access token not found. Please connect to Canvas first.');
  }

  const url = `https://${config.domain}/api/v1${endpoint}`;
  
  // Add cache-busting headers to force fresh data from Canvas
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.errors?.[0]?.message || error.error || `Canvas API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get current Canvas user info
 */
export async function getCurrentUser(config: CanvasConfig): Promise<CanvasUser> {
  const token = config.accessToken || getCanvasAccessToken();
  
  if (!token) {
    throw new Error('Canvas access token not found. Please connect to Canvas first.');
  }

  // Use proxy server to avoid CORS issues
  // CRITICAL: Use cache: 'no-store' to bypass browser cache entirely
  const response = await fetch(`${SUPABASE_URL}/make-server-74508696/canvas/test`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    },
    cache: 'no-store',
    body: JSON.stringify({
      domain: config.domain,
      accessToken: token,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    
    // If token is invalid (401), clear it from storage
    if (response.status === 401) {
      removeCanvasAccessToken();
      throw new Error('Invalid or expired access token. Please reconnect to Canvas.');
    }
    
    throw new Error(error.error || `Canvas API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.user;
}

/**
 * Get list of user's courses
 */
export async function getCourses(config: CanvasConfig): Promise<CanvasCourse[]> {
  const token = config.accessToken || getCanvasAccessToken();
  const domain = config.domain || getCanvasDomain();
  
  if (!token) {
    throw new Error('Canvas access token not found. Please connect to Canvas first.');
  }
  
  if (!domain) {
    throw new Error('Canvas domain not found. Please connect to Canvas first.');
  }

  try {
    // Use proxy server to avoid CORS issues
    // CRITICAL: Use cache: 'no-store' + timestamp to force fresh data on every request
    const response = await fetch(`${SUPABASE_URL}/make-server-74508696/canvas/courses?t=${Date.now()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      cache: 'no-store',
      body: JSON.stringify({
        domain: domain,
        accessToken: token,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      
      // If token is invalid (401), clear it from storage
      if (response.status === 401) {
        removeCanvasAccessToken();
        throw new Error('Invalid or expired access token. Please reconnect to Canvas.');
      }
      
      throw new Error(error.error || `Canvas API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.courses;
  } catch (error) {
    // Handle network errors more gracefully
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Unable to connect to Canvas API. Please check your internet connection and try again.');
    }
    throw error;
  }
}

/**
 * Create a new course in Canvas
 */
export async function createCourse(
  config: CanvasConfig,
  accountId: number,
  courseName: string,
  courseCode: string
): Promise<CanvasCourse> {
  return canvasRequest<CanvasCourse>(`/accounts/${accountId}/courses`, config, {
    method: 'POST',
    body: JSON.stringify({
      course: {
        name: courseName,
        course_code: courseCode,
      },
    }),
  });
}

/**
 * Upload IMSCC file to Canvas for import
 */
export async function uploadIMSCCToCanvas(
  config: CanvasConfig,
  courseId: number,
  imsccBlob: Blob,
  fileName: string
): Promise<ContentMigration> {
  const token = config.accessToken || getCanvasAccessToken();
  
  if (!token) {
    throw new Error('Canvas access token not found.');
  }

  try {
    // Step 1: Initiate migration with pre_attachment via server proxy
    const initResponse = await fetch(
      `${SUPABASE_URL}/make-server-74508696/canvas/upload-imscc-init`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: config.domain,
          accessToken: token,
          courseId: courseId,
          fileName: fileName,
          fileSize: imsccBlob.size,
        }),
      }
    );

    if (!initResponse.ok) {
      const error = await initResponse.json().catch(() => ({ error: 'Unknown error' }));
      console.error('IMSCC init error:', error);
      throw new Error(error.error || `Failed to initiate Canvas migration`);
    }

    const migrationData = await initResponse.json();

    // Check if we have pre_attachment upload params
    if (!migrationData.pre_attachment || !migrationData.pre_attachment.upload_url) {
      throw new Error('Canvas did not provide upload URL');
    }

    const uploadParams = migrationData.pre_attachment.upload_params;
    const uploadUrl = migrationData.pre_attachment.upload_url;

    // Step 2: Upload file to the provided upload URL
    const uploadFormData = new FormData();
    
    // Add all upload params
    Object.entries(uploadParams).forEach(([key, value]) => {
      uploadFormData.append(key, value as string);
    });
    
    // Add the file last
    uploadFormData.append('file', imsccBlob, fileName);

    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      body: uploadFormData,
    });

    if (!uploadResponse.ok) {
      const error = await uploadResponse.text();
      console.error('File upload error:', error);
      throw new Error(`Failed to upload file: ${error}`);
    }

    // Return the migration object
    return migrationData;
  } catch (error) {
    console.error('Upload IMSCC error:', error);
    throw error;
  }
}

/**
 * Upload an image to Canvas course files and return the new Canvas URL.
 * Used when fixing "Image Not Found" alt text issues with a user-uploaded replacement image.
 */
export async function uploadImageToCanvas(
  courseId: string,
  dataUrl: string,
  fileName: string
): Promise<{ url: string; fileId: number }> {
  const token = getCanvasAccessToken();
  const domain = getCanvasDomain();

  if (!token || !domain) {
    throw new Error('Canvas connection required to upload image.');
  }

  // Extract base64 data and content type from data URL
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    throw new Error('Invalid image data URL format.');
  }
  const contentType = match[1];
  const fileData = match[2];

  const response = await fetch(
    `${SUPABASE_URL}/make-server-74508696/canvas/upload-image?t=${Date.now()}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      cache: 'no-store',
      body: JSON.stringify({
        domain,
        accessToken: token,
        courseId,
        fileName,
        fileData,
        contentType,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'Failed to upload image to Canvas');
  }

  const data = await response.json();
  return { url: data.url, fileId: data.fileId };
}

/**
 * Check migration status
 */
export async function getMigrationStatus(
  config: CanvasConfig,
  courseId: number,
  migrationId: number
): Promise<ContentMigration> {
  const token = config.accessToken || getCanvasAccessToken();
  
  if (!token) {
    throw new Error('Canvas access token not found.');
  }

  // Use proxy server to avoid CORS issues
  // CRITICAL: Use cache: 'no-store' to bypass browser cache entirely
  const response = await fetch(`${SUPABASE_URL}/make-server-74508696/canvas/migration-status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    },
    cache: 'no-store',
    body: JSON.stringify({
      domain: config.domain,
      accessToken: token,
      courseId: courseId,
      migrationId: migrationId,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `Failed to get migration status`);
  }

  return response.json();
}

/**
 * Poll migration status until complete
 */
export async function waitForMigrationComplete(
  config: CanvasConfig,
  courseId: number,
  migrationId: number,
  onProgress?: (status: string) => void
): Promise<ContentMigration> {
  let attempts = 0;
  const maxAttempts = 60; // 5 minutes max

  while (attempts < maxAttempts) {
    const status = await getMigrationStatus(config, courseId, migrationId);
    
    onProgress?.(status.workflow_state);

    if (status.workflow_state === 'completed') {
      return status;
    }

    if (status.workflow_state === 'failed') {
      throw new Error('Canvas migration failed');
    }

    // Wait 5 seconds before checking again
    await new Promise(resolve => setTimeout(resolve, 5000));
    attempts++;
  }

  throw new Error('Migration timeout - check Canvas for status');
}

/**
 * Complete workflow: Upload corrected IMSCC to Canvas course
 */
export async function uploadCorrectedCourseToCanvas(
  courseId: number,
  imsccBlob: Blob,
  fileName: string,
  onProgress?: (message: string) => void
): Promise<void> {
  const domain = getCanvasDomain();
  if (!domain) {
    throw new Error('Canvas domain not configured');
  }

  const config = initializeCanvas(domain);

  onProgress?.('Uploading to Canvas...');
  const migration = await uploadIMSCCToCanvas(config, courseId, imsccBlob, fileName);

  onProgress?.('Processing import...');
  await waitForMigrationComplete(config, courseId, migration.id, (status) => {
    onProgress?.(`Import status: ${status}`);
  });

  onProgress?.('Import complete!');
}

/**
 * Get course modules
 */
export async function getCourseModules(
  config: CanvasConfig,
  courseId: number
): Promise<CanvasModule[]> {
  const token = config.accessToken || getCanvasAccessToken();
  const domain = config.domain || getCanvasDomain();
  
  if (!token) {
    throw new Error('Canvas access token not found. Please connect to Canvas first.');
  }
  
  if (!domain) {
    throw new Error('Canvas domain not found. Please connect to Canvas first.');
  }
  
  if (!courseId || isNaN(courseId)) {
    throw new Error('Valid course ID is required.');
  }

  // Use proxy server to avoid CORS issues
  // CRITICAL: Use cache: 'no-store' + timestamp to force fresh data on every request
  const response = await fetch(`${SUPABASE_URL}/make-server-74508696/canvas/modules?t=${Date.now()}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    },
    cache: 'no-store',
    body: JSON.stringify({
      domain: domain,
      accessToken: token,
      courseId: courseId,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `Failed to fetch modules: ${response.statusText}`);
  }

  const data = await response.json();
  return data.modules;
}

/**
 * Get course assignments
 */
export async function getCourseAssignments(
  config: CanvasConfig,
  courseId: number
): Promise<CanvasAssignment[]> {
  const token = config.accessToken || getCanvasAccessToken();
  const domain = config.domain || getCanvasDomain();
  
  if (!token) {
    throw new Error('Canvas access token not found. Please connect to Canvas first.');
  }
  
  if (!domain) {
    throw new Error('Canvas domain not found. Please connect to Canvas first.');
  }
  
  if (!courseId || isNaN(courseId)) {
    throw new Error('Valid course ID is required.');
  }

  // Use proxy server to avoid CORS issues
  // CRITICAL: Use cache: 'no-store' + timestamp to force fresh data on every request
  const response = await fetch(`${SUPABASE_URL}/make-server-74508696/canvas/assignments?t=${Date.now()}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    },
    cache: 'no-store',
    body: JSON.stringify({
      domain: domain,
      accessToken: token,
      courseId: courseId,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `Failed to fetch assignments: ${response.statusText}`);
  }

  const data = await response.json();
  return data.assignments;
}

/**
 * Get course pages
 */
export async function getCoursePages(
  config: CanvasConfig,
  courseId: number
): Promise<CanvasPage[]> {
  const token = config.accessToken || getCanvasAccessToken();
  const domain = config.domain || getCanvasDomain();
  
  if (!token) {
    throw new Error('Canvas access token not found. Please connect to Canvas first.');
  }
  
  if (!domain) {
    throw new Error('Canvas domain not found. Please connect to Canvas first.');
  }

  try {
    // Use proxy server to avoid CORS issues
    // CRITICAL: Use cache: 'no-store' + timestamp to force fresh data on every request
    const response = await fetch(`${SUPABASE_URL}/make-server-74508696/canvas/pages?t=${Date.now()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      cache: 'no-store',
      body: JSON.stringify({
        domain: domain,
        accessToken: token,
        courseId: courseId,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `Failed to fetch pages: ${response.statusText}`);
    }

    const data = await response.json();
    return data.pages || [];
  } catch (error) {
    console.error('Error fetching pages:', error);
    return [];
  }
}

/**
 * Get a specific page by URL
 */
export async function getPage(
  config: CanvasConfig,
  courseId: number,
  pageUrl: string
): Promise<CanvasPage> {
  const token = config.accessToken || getCanvasAccessToken();
  const domain = config.domain || getCanvasDomain();
  
  if (!token) {
    throw new Error('Canvas access token not found. Please connect to Canvas first.');
  }
  
  if (!domain) {
    throw new Error('Canvas domain not found. Please connect to Canvas first.');
  }

  // Use proxy server to avoid CORS issues
  // CRITICAL: Use cache: 'no-store' to bypass browser cache entirely
  const response = await fetch(`${SUPABASE_URL}/make-server-74508696/canvas/page`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    },
    cache: 'no-store',
    body: JSON.stringify({
      domain: domain,
      accessToken: token,
      courseId: courseId,
      pageUrl: pageUrl,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `Failed to fetch page: ${response.statusText}`);
  }

  const data = await response.json();
  return data.page;
}

/**
 * Get course front page (home page)
 */
export async function getCourseFrontPage(
  config: CanvasConfig,
  courseId: number
): Promise<any> {
  const token = config.accessToken || getCanvasAccessToken();
  const domain = config.domain || getCanvasDomain();
  
  if (!token) {
    throw new Error('Canvas access token not found. Please connect to Canvas first.');
  }
  
  if (!domain) {
    throw new Error('Canvas domain not found. Please connect to Canvas first.');
  }

  try {
    // Use proxy server to avoid CORS issues
    // CRITICAL: Use cache: 'no-store' + timestamp to force fresh data on every request
    const response = await fetch(`${SUPABASE_URL}/make-server-74508696/canvas/front-page?t=${Date.now()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      cache: 'no-store',
      body: JSON.stringify({
        domain: domain,
        accessToken: token,
        courseId: courseId,
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.page;
  } catch (error) {
    console.error('Error fetching front page:', error);
    return null;
  }
}

/**
 * Delete a course
 */
export async function deleteCourse(
  config: CanvasConfig,
  courseId: number
): Promise<void> {
  await canvasRequest<any>(
    `/courses/${courseId}`,
    config,
    {
      method: 'DELETE',
    }
  );
}

/**
 * Get a specific assignment by ID
 */
export async function getAssignment(
  config: CanvasConfig,
  courseId: number,
  assignmentId: number
): Promise<CanvasAssignment> {
  const token = config.accessToken || getCanvasAccessToken();
  const domain = config.domain || getCanvasDomain();
  
  if (!token) {
    throw new Error('Canvas access token not found. Please connect to Canvas first.');
  }
  
  if (!domain) {
    throw new Error('Canvas domain not found. Please connect to Canvas first.');
  }

  // Use proxy server to avoid CORS issues
  // CRITICAL: Use cache: 'no-store' to bypass browser cache entirely
  const response = await fetch(`${SUPABASE_URL}/make-server-74508696/canvas/assignment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    },
    cache: 'no-store',
    body: JSON.stringify({
      domain: domain,
      accessToken: token,
      courseId: courseId,
      assignmentId: assignmentId,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `Failed to fetch assignment: ${response.statusText}`);
  }

  const data = await response.json();
  return data.assignment;
}

/**
 * Get course announcements
 */
export async function getCourseAnnouncements(
  config: CanvasConfig,
  courseId: number
): Promise<CanvasAnnouncement[]> {
  const token = config.accessToken || getCanvasAccessToken();
  const domain = config.domain || getCanvasDomain();
  
  if (!token) {
    throw new Error('Canvas access token not found. Please connect to Canvas first.');
  }
  
  if (!domain) {
    throw new Error('Canvas domain not found. Please connect to Canvas first.');
  }

  try {
    // CRITICAL: Use cache: 'no-store' + timestamp to force fresh data on every request
    const response = await fetch(`${SUPABASE_URL}/make-server-74508696/canvas/announcements?t=${Date.now()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      cache: 'no-store',
      body: JSON.stringify({
        domain: domain,
        accessToken: token,
        courseId: courseId,
      }),
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.announcements || [];
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return [];
  }
}

/**
 * Get course discussions
 */
export async function getCourseDiscussions(
  config: CanvasConfig,
  courseId: number
): Promise<any[]> {
  const token = config.accessToken || getCanvasAccessToken();
  const domain = config.domain || getCanvasDomain();
  
  if (!token) {
    throw new Error('Canvas access token not found. Please connect to Canvas first.');
  }
  
  if (!domain) {
    throw new Error('Canvas domain not found. Please connect to Canvas first.');
  }

  // CRITICAL: Use cache: 'no-store' + timestamp to force fresh data on every request
  const response = await fetch(`${SUPABASE_URL}/make-server-74508696/canvas/discussions?t=${Date.now()}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    },
    cache: 'no-store',
    body: JSON.stringify({
      domain: domain,
      accessToken: token,
      courseId: courseId,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `Failed to fetch discussions: ${response.statusText}`);
  }

  const data = await response.json();
  return data.discussions || [];
}

/**
 * Get course quizzes
 */
export async function getCourseQuizzes(
  config: CanvasConfig,
  courseId: number
): Promise<any[]> {
  const token = config.accessToken || getCanvasAccessToken();
  const domain = config.domain || getCanvasDomain();
  
  if (!token) {
    throw new Error('Canvas access token not found. Please connect to Canvas first.');
  }
  
  if (!domain) {
    throw new Error('Canvas domain not found. Please connect to Canvas first.');
  }

  // CRITICAL: Use cache: 'no-store' + timestamp to force fresh data on every request
  const response = await fetch(`${SUPABASE_URL}/make-server-74508696/canvas/quizzes?t=${Date.now()}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    },
    cache: 'no-store',
    body: JSON.stringify({
      domain: domain,
      accessToken: token,
      courseId: courseId,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `Failed to fetch quizzes: ${response.statusText}`);
  }

  const data = await response.json();
  return data.quizzes || [];
}