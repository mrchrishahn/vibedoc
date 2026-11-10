/**
 * Bulk edit functionality for job postings
 * Demonstrates the bug where application URL changes are not detected in bulk mode
 */

export interface JobPosting {
  id: string;
  title: string;
  description: string;
  applicationUrl?: string;
  location: string;
  salary?: string;
  status: 'draft' | 'published' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

export interface BulkEditPayload {
  title?: string;
  description?: string;
  applicationUrl?: string;
  location?: string;
  salary?: string;
  status?: 'draft' | 'published' | 'closed';
}

/**
 * BUGGY VERSION: Checks if any fields have changed between original and updates
 * BUG: Missing applicationUrl in the diff check, so changes to applicationUrl
 * are not detected and not included in the update payload
 */
export function hasChangesBuggy(
  original: Partial<JobPosting>,
  updates: BulkEditPayload
): boolean {
  const fieldsToCheck: (keyof BulkEditPayload)[] = [
    'title',
    'description',
    // BUG: 'applicationUrl' is missing here!
    'location',
    'salary',
    'status',
  ];

  return fieldsToCheck.some((field) => {
    if (updates[field] === undefined) return false;
    return original[field] !== updates[field];
  });
}

/**
 * FIXED VERSION: Properly includes applicationUrl in the diff check
 */
export function hasChangesFixed(
  original: Partial<JobPosting>,
  updates: BulkEditPayload
): boolean {
  const fieldsToCheck: (keyof BulkEditPayload)[] = [
    'title',
    'description',
    'applicationUrl', // FIXED: Now includes applicationUrl
    'location',
    'salary',
    'status',
  ];

  return fieldsToCheck.some((field) => {
    if (updates[field] === undefined) return false;
    return original[field] !== updates[field];
  });
}

/**
 * BUGGY VERSION: Creates the bulk update payload
 * BUG: applicationUrl is not included in the returned payload
 */
export function createBulkUpdatePayloadBuggy(
  updates: BulkEditPayload
): Partial<JobPosting> {
  const payload: Partial<JobPosting> = {};

  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.description !== undefined) payload.description = updates.description;
  // BUG: applicationUrl is missing here!
  if (updates.location !== undefined) payload.location = updates.location;
  if (updates.salary !== undefined) payload.salary = updates.salary;
  if (updates.status !== undefined) payload.status = updates.status;

  payload.updatedAt = new Date();

  return payload;
}

/**
 * FIXED VERSION: Properly includes applicationUrl in the payload
 */
export function createBulkUpdatePayloadFixed(
  updates: BulkEditPayload
): Partial<JobPosting> {
  const payload: Partial<JobPosting> = {};

  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.applicationUrl !== undefined) payload.applicationUrl = updates.applicationUrl; // FIXED
  if (updates.location !== undefined) payload.location = updates.location;
  if (updates.salary !== undefined) payload.salary = updates.salary;
  if (updates.status !== undefined) payload.status = updates.status;

  payload.updatedAt = new Date();

  return payload;
}

/**
 * BUGGY VERSION: Applies bulk updates to multiple job postings
 * Uses the buggy hasChanges and createBulkUpdatePayload functions
 */
export async function bulkUpdateJobPostingsBuggy(
  postingIds: string[],
  updates: BulkEditPayload,
  getCurrentPosting: (id: string) => Promise<JobPosting>,
  updatePosting: (id: string, payload: Partial<JobPosting>) => Promise<void>
): Promise<{ updated: string[]; skipped: string[] }> {
  const updated: string[] = [];
  const skipped: string[] = [];

  for (const id of postingIds) {
    const current = await getCurrentPosting(id);
    
    if (hasChangesBuggy(current, updates)) {
      const payload = createBulkUpdatePayloadBuggy(updates);
      await updatePosting(id, payload);
      updated.push(id);
    } else {
      skipped.push(id);
    }
  }

  return { updated, skipped };
}

/**
 * FIXED VERSION: Applies bulk updates to multiple job postings
 * Uses the fixed hasChanges and createBulkUpdatePayload functions
 */
export async function bulkUpdateJobPostingsFixed(
  postingIds: string[],
  updates: BulkEditPayload,
  getCurrentPosting: (id: string) => Promise<JobPosting>,
  updatePosting: (id: string, payload: Partial<JobPosting>) => Promise<void>
): Promise<{ updated: string[]; skipped: string[] }> {
  const updated: string[] = [];
  const skipped: string[] = [];

  for (const id of postingIds) {
    const current = await getCurrentPosting(id);
    
    if (hasChangesFixed(current, updates)) {
      const payload = createBulkUpdatePayloadFixed(updates);
      await updatePosting(id, payload);
      updated.push(id);
    } else {
      skipped.push(id);
    }
  }

  return { updated, skipped };
}

/**
 * Main export using the fixed version
 */
export const hasChanges = hasChangesFixed;
export const createBulkUpdatePayload = createBulkUpdatePayloadFixed;
export const bulkUpdateJobPostings = bulkUpdateJobPostingsFixed;
