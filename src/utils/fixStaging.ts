/**
 * Fix Staging System
 * Manages staging fixes before publishing to Canvas
 */

import { ScanIssue } from '../App';
import { fixCanvasIssue } from './canvasFixer';
import { fixSupabaseIssue } from './supabaseFixer';

export interface StagedFix {
  issueId: string;
  contentType: 'page' | 'assignment' | 'announcement' | 'discussion' | 'file';
  contentId: string;
  originalContent: string;
  fixedContent: string;
  fixType: string;
  timestamp: Date;
  // Custom text for different fix types
  customAltText?: string;
  customLinkText?: string;
  customCaption?: string;
  customTextColor?: string; // For contrast fixes
  newImageSrc?: string; // For broken image fixes: new Canvas URL after upload
}

/**
 * Stage a fix for an issue (doesn't publish yet)
 * Determines whether to use Canvas fixer or Supabase fixer based on course type
 */
export async function stageFix(
  courseId: string,
  issue: ScanIssue,
  isImported: boolean = false,
  customFix?: string
): Promise<{ success: boolean; stagedFix?: StagedFix; message: string }> {
  if (customFix) {
  }
  
  if (!issue.contentId || !issue.contentType) {
    return {
      success: false,
      message: 'Missing content metadata. Cannot stage fix.'
    };
  }

  try {
    let fixResult;
    
    // If custom fix is provided, update the issue's suggested fix
    const issueToFix = customFix ? { ...issue, suggestedFix: customFix } : issue;
    
    if (isImported) {
      // Use Supabase fixer for imported courses
      fixResult = await fixSupabaseIssue(courseId, issueToFix);
    } else {
      // Use Canvas fixer for live Canvas courses
      fixResult = await fixCanvasIssue(courseId, issueToFix);
    }

    if (!fixResult.success) {
      return {
        success: false,
        message: fixResult.message || 'Failed to stage fix'
      };
    }

    // Create staged fix record
    const stagedFix: StagedFix = {
      issueId: issue.id,
      contentType: issue.contentType,
      contentId: issue.contentId,
      originalContent: fixResult.originalContent || '',
      fixedContent: fixResult.fixedContent || '',
      fixType: issue.category,
      timestamp: new Date(),
      // Store custom text fields from the fix result
      customAltText: fixResult.customAltText,
      customLinkText: fixResult.customLinkText,
      customCaption: fixResult.customCaption,
      customTextColor: fixResult.customTextColor,
      newImageSrc: issue.newImageSrc
    };

    return {
      success: true,
      stagedFix,
      message: 'Fix staged successfully'
    };
  } catch (error) {
    console.error('❌ Error staging fix:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Batch stage all auto-fixable issues
 */
export async function batchStageFixes(
  courseId: string,
  issues: ScanIssue[],
  isImported: boolean = false,
  onProgress?: (completed: number, total: number) => void,
  customFix?: string
): Promise<{
  success: boolean;
  stagedFixes: StagedFix[];
  failedIssues: string[];
  message: string;
}> {
  
  const autoFixableIssues = issues.filter(
    issue => issue.autoFixAvailable && issue.status === 'pending'
  );

  if (autoFixableIssues.length === 0) {
    return {
      success: false,
      stagedFixes: [],
      failedIssues: [],
      message: 'No auto-fixable issues to stage'
    };
  }

  const stagedFixes: StagedFix[] = [];
  const failedIssues: string[] = [];

  for (let i = 0; i < autoFixableIssues.length; i++) {
    const issue = autoFixableIssues[i];
    
    try {
      // Use the issue's own courseId when available (e.g. "All Courses" scans where
      // each issue may belong to a different course), otherwise fall back to the
      // batch-level courseId passed by the caller.
      const issueCourseId = issue.courseId || courseId;
      const result = await stageFix(issueCourseId, issue, isImported, customFix);
      
      if (result.success && result.stagedFix) {
        stagedFixes.push(result.stagedFix);
      } else {
        failedIssues.push(issue.id);
      }
      
      // Report progress
      if (onProgress) {
        onProgress(i + 1, autoFixableIssues.length);
      }
    } catch (error) {
      console.error(`Failed to stage fix for ${issue.id}:`, error);
      failedIssues.push(issue.id);
    }
  }

  return {
    success: stagedFixes.length > 0,
    stagedFixes,
    failedIssues,
    message: `Staged ${stagedFixes.length}/${autoFixableIssues.length} fixes`
  };
}

/**
 * Clear a staged fix
 */
export function unstageFix(issueId: string, stagedFixes: Map<string, StagedFix>): Map<string, StagedFix> {
  const newMap = new Map(stagedFixes);
  newMap.delete(issueId);
  return newMap;
}

/**
 * Clear all staged fixes
 */
export function clearAllStagedFixes(): Map<string, StagedFix> {
  return new Map();
}