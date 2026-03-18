// API utility for interacting with Supabase backend
import { projectId, publicAnonKey } from './supabase/info';
import type { ScanIssue } from '../App';
import type { IMSCCCourse } from './imsccParser';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-74508696`;

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `API request failed: ${response.statusText}`);
  }

  return response.json();
}

export interface SavedCourse {
  courseId: string;
  courseName: string;
  courseData: IMSCCCourse;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  lastScan?: string;
  issueCount?: number;
}

/**
 * Save a course to the backend
 */
export async function saveCourse(
  courseId: string,
  courseName: string,
  courseData: IMSCCCourse,
  scanResults: ScanIssue[],
  metadata?: Record<string, any>
): Promise<{ success: boolean; courseId: string }> {
  return fetchAPI('/courses', {
    method: 'POST',
    body: JSON.stringify({
      courseId,
      courseName,
      courseData,
      scanResults,
      metadata,
    }),
  });
}

/**
 * Get all saved courses
 */
export async function getCourses(): Promise<SavedCourse[]> {
  const data = await fetchAPI('/courses');
  return data.courses || [];
}

/**
 * Get a specific course by ID
 */
export async function getCourse(courseId: string): Promise<{
  course: SavedCourse;
  scanResults: ScanIssue[];
  lastScan: string | null;
}> {
  return fetchAPI(`/courses/${courseId}`);
}

/**
 * Update course data (for applying fixes to imported courses)
 */
export async function updateCourse(
  courseId: string,
  courseData: IMSCCCourse
): Promise<{ success: boolean }> {
  return fetchAPI(`/courses/${courseId}`, {
    method: 'PUT',
    body: JSON.stringify({ courseData }),
  });
}

/**
 * Update scan results for a course
 */
export async function updateScanResults(
  courseId: string,
  scanResults: ScanIssue[]
): Promise<{ success: boolean }> {
  return fetchAPI(`/courses/${courseId}/scan`, {
    method: 'POST',
    body: JSON.stringify({ scanResults }),
  });
}

/**
 * Apply fixes to a course
 */
export async function applyFixes(
  courseId: string,
  issueIds: string[],
  fixType: string
): Promise<{ success: boolean; fixedCount: number }> {
  return fetchAPI(`/courses/${courseId}/fix`, {
    method: 'POST',
    body: JSON.stringify({ issueIds, fixType }),
  });
}

/**
 * Delete a course
 */
export async function deleteCourse(courseId: string): Promise<{ success: boolean }> {
  return fetchAPI(`/courses/${courseId}`, {
    method: 'DELETE',
  });
}