/**
 * Tests for bulk edit functionality
 * Demonstrates the bug and verifies the fix for application URL detection
 */

import { describe, it, expect, beforeEach } from 'vitest';
import type { JobPosting, BulkEditPayload } from './bulk-edit';
import {
  hasChangesBuggy,
  hasChangesFixed,
  createBulkUpdatePayloadBuggy,
  createBulkUpdatePayloadFixed,
  bulkUpdateJobPostingsBuggy,
  bulkUpdateJobPostingsFixed,
} from './bulk-edit';

describe('Bulk Edit Bug - Application URL Not Detected', () => {
  let samplePosting: JobPosting;

  beforeEach(() => {
    samplePosting = {
      id: '1',
      title: 'Software Engineer',
      description: 'Great opportunity',
      applicationUrl: 'https://example.com/apply/old',
      location: 'Berlin',
      salary: '€60,000',
      status: 'published',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };
  });

  describe('hasChanges - Dirty Check', () => {
    it('BUGGY: should NOT detect application URL change (demonstrates the bug)', () => {
      const updates: BulkEditPayload = {
        applicationUrl: 'https://example.com/apply/new',
      };

      const hasChanged = hasChangesBuggy(samplePosting, updates);
      
      // This is the BUG: application URL changed but returns false
      expect(hasChanged).toBe(false);
    });

    it('FIXED: should detect application URL change', () => {
      const updates: BulkEditPayload = {
        applicationUrl: 'https://example.com/apply/new',
      };

      const hasChanged = hasChangesFixed(samplePosting, updates);
      
      // FIXED: Now correctly detects the change
      expect(hasChanged).toBe(true);
    });

    it('FIXED: should detect when applicationUrl is added to posting without one', () => {
      const postingWithoutUrl = { ...samplePosting, applicationUrl: undefined };
      const updates: BulkEditPayload = {
        applicationUrl: 'https://example.com/apply',
      };

      expect(hasChangesFixed(postingWithoutUrl, updates)).toBe(true);
    });

    it('FIXED: should detect when applicationUrl is removed', () => {
      const updates: BulkEditPayload = {
        applicationUrl: '',
      };

      expect(hasChangesFixed(samplePosting, updates)).toBe(true);
    });

    it('FIXED: should NOT detect change when applicationUrl is the same', () => {
      const updates: BulkEditPayload = {
        applicationUrl: 'https://example.com/apply/old',
      };

      expect(hasChangesFixed(samplePosting, updates)).toBe(false);
    });

    it('FIXED: should detect change when applicationUrl is updated along with other fields', () => {
      const updates: BulkEditPayload = {
        title: 'Senior Software Engineer',
        applicationUrl: 'https://example.com/apply/new',
      };

      expect(hasChangesFixed(samplePosting, updates)).toBe(true);
    });
  });

  describe('createBulkUpdatePayload - Payload Generation', () => {
    it('BUGGY: should NOT include applicationUrl in payload (demonstrates the bug)', () => {
      const updates: BulkEditPayload = {
        applicationUrl: 'https://example.com/apply/new',
      };

      const payload = createBulkUpdatePayloadBuggy(updates);
      
      // This is the BUG: applicationUrl is not in the payload
      expect(payload.applicationUrl).toBeUndefined();
      expect(payload).not.toHaveProperty('applicationUrl');
    });

    it('FIXED: should include applicationUrl in payload', () => {
      const updates: BulkEditPayload = {
        applicationUrl: 'https://example.com/apply/new',
      };

      const payload = createBulkUpdatePayloadFixed(updates);
      
      // FIXED: applicationUrl is now in the payload
      expect(payload.applicationUrl).toBe('https://example.com/apply/new');
    });

    it('FIXED: should include applicationUrl along with other fields', () => {
      const updates: BulkEditPayload = {
        title: 'Senior Software Engineer',
        applicationUrl: 'https://example.com/apply/new',
        salary: '€70,000',
      };

      const payload = createBulkUpdatePayloadFixed(updates);
      
      expect(payload.title).toBe('Senior Software Engineer');
      expect(payload.applicationUrl).toBe('https://example.com/apply/new');
      expect(payload.salary).toBe('€70,000');
      expect(payload.updatedAt).toBeInstanceOf(Date);
    });

    it('FIXED: should handle empty string applicationUrl', () => {
      const updates: BulkEditPayload = {
        applicationUrl: '',
      };

      const payload = createBulkUpdatePayloadFixed(updates);
      
      expect(payload.applicationUrl).toBe('');
    });
  });

  describe('bulkUpdateJobPostings - End-to-End', () => {
    let mockPostings: Map<string, JobPosting>;
    let updatedPostings: Map<string, Partial<JobPosting>>;

    beforeEach(() => {
      mockPostings = new Map();
      updatedPostings = new Map();

      // Create test postings
      for (let i = 1; i <= 50; i++) {
        mockPostings.set(`posting-${i}`, {
          id: `posting-${i}`,
          title: `Job ${i}`,
          description: `Description ${i}`,
          applicationUrl: `https://example.com/apply/${i}`,
          location: 'Berlin',
          salary: '€50,000',
          status: 'published',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        });
      }
    });

    const getCurrentPosting = async (id: string): Promise<JobPosting> => {
      const posting = mockPostings.get(id);
      if (!posting) throw new Error(`Posting ${id} not found`);
      return posting;
    };

    const updatePosting = async (id: string, payload: Partial<JobPosting>): Promise<void> => {
      updatedPostings.set(id, payload);
    };

    it('BUGGY: should NOT update any postings when only applicationUrl changes (demonstrates the bug)', async () => {
      const postingIds = ['posting-1', 'posting-2', 'posting-3'];
      const updates: BulkEditPayload = {
        applicationUrl: 'https://example.com/new-apply',
      };

      const result = await bulkUpdateJobPostingsBuggy(
        postingIds,
        updates,
        getCurrentPosting,
        updatePosting
      );

      // BUG: All postings are skipped because change is not detected
      expect(result.updated).toHaveLength(0);
      expect(result.skipped).toHaveLength(3);
      expect(updatedPostings.size).toBe(0);
    });

    it('FIXED: should update all postings when applicationUrl changes', async () => {
      const postingIds = ['posting-1', 'posting-2', 'posting-3'];
      const updates: BulkEditPayload = {
        applicationUrl: 'https://example.com/new-apply',
      };

      const result = await bulkUpdateJobPostingsFixed(
        postingIds,
        updates,
        getCurrentPosting,
        updatePosting
      );

      // FIXED: All postings are updated
      expect(result.updated).toHaveLength(3);
      expect(result.skipped).toHaveLength(0);
      expect(updatedPostings.size).toBe(3);
      
      // Verify the applicationUrl is in the payload
      for (const id of postingIds) {
        const payload = updatedPostings.get(id);
        expect(payload?.applicationUrl).toBe('https://example.com/new-apply');
      }
    });

    it('FIXED: should handle bulk update of 48+ postings', async () => {
      // Test with 48 postings as mentioned in requirements
      const postingIds = Array.from({ length: 48 }, (_, i) => `posting-${i + 1}`);
      const updates: BulkEditPayload = {
        applicationUrl: 'https://example.com/bulk-apply',
      };

      const result = await bulkUpdateJobPostingsFixed(
        postingIds,
        updates,
        getCurrentPosting,
        updatePosting
      );

      expect(result.updated).toHaveLength(48);
      expect(result.skipped).toHaveLength(0);
      expect(updatedPostings.size).toBe(48);
      
      // Verify all postings have the new applicationUrl
      for (const id of postingIds) {
        const payload = updatedPostings.get(id);
        expect(payload?.applicationUrl).toBe('https://example.com/bulk-apply');
      }
    });

    it('FIXED: should handle bulk update of 50 postings', async () => {
      const postingIds = Array.from({ length: 50 }, (_, i) => `posting-${i + 1}`);
      const updates: BulkEditPayload = {
        applicationUrl: 'https://example.com/bulk-apply-50',
      };

      const result = await bulkUpdateJobPostingsFixed(
        postingIds,
        updates,
        getCurrentPosting,
        updatePosting
      );

      expect(result.updated).toHaveLength(50);
      expect(result.skipped).toHaveLength(0);
    });

    it('FIXED: should update applicationUrl along with other fields', async () => {
      const postingIds = ['posting-1', 'posting-2'];
      const updates: BulkEditPayload = {
        title: 'Updated Title',
        applicationUrl: 'https://example.com/new-apply',
        status: 'draft',
      };

      const result = await bulkUpdateJobPostingsFixed(
        postingIds,
        updates,
        getCurrentPosting,
        updatePosting
      );

      expect(result.updated).toHaveLength(2);
      
      for (const id of postingIds) {
        const payload = updatedPostings.get(id);
        expect(payload?.title).toBe('Updated Title');
        expect(payload?.applicationUrl).toBe('https://example.com/new-apply');
        expect(payload?.status).toBe('draft');
      }
    });

    it('FIXED: should skip postings where no changes are detected', async () => {
      const postingIds = ['posting-1', 'posting-2'];
      const updates: BulkEditPayload = {
        // Same applicationUrl as posting-1 already has
        applicationUrl: 'https://example.com/apply/1',
      };

      // Update posting-1 to match the update URL
      const posting1 = mockPostings.get('posting-1')!;
      posting1.applicationUrl = 'https://example.com/apply/1';

      const result = await bulkUpdateJobPostingsFixed(
        ['posting-1'], // Only posting-1
        updates,
        getCurrentPosting,
        updatePosting
      );

      // No change detected, should be skipped
      expect(result.updated).toHaveLength(0);
      expect(result.skipped).toHaveLength(1);
    });

    it('FIXED: should verify other bulk-editable fields are not affected', async () => {
      const postingIds = ['posting-1'];
      
      // Test each field individually to ensure they still work
      const fieldsToTest: BulkEditPayload[] = [
        { title: 'New Title' },
        { description: 'New Description' },
        { location: 'Munich' },
        { salary: '€70,000' },
        { status: 'closed' as const },
      ];

      for (const fieldUpdate of fieldsToTest) {
        updatedPostings.clear();
        
        const result = await bulkUpdateJobPostingsFixed(
          postingIds,
          fieldUpdate,
          getCurrentPosting,
          updatePosting
        );

        expect(result.updated).toHaveLength(1);
        const payload = updatedPostings.get('posting-1');
        
        // Verify the field is in the payload
        const fieldName = Object.keys(fieldUpdate)[0] as keyof BulkEditPayload;
        expect(payload?.[fieldName]).toBe(fieldUpdate[fieldName]);
      }
    });
  });

  describe('Integration Test - Business Dashboard Scenario', () => {
    it('should correctly handle bulk editing applicationUrl for selected postings', async () => {
      // Simulate a user selecting multiple job postings in the Business Dashboard
      // and updating the application URL
      const mockDb = new Map<string, JobPosting>();
      
      // Create sample postings
      const postings: JobPosting[] = [
        {
          id: 'job-1',
          title: 'Frontend Developer',
          description: 'React, TypeScript',
          applicationUrl: 'https://old-system.com/apply/frontend',
          location: 'Berlin',
          status: 'published',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: 'job-2',
          title: 'Backend Developer',
          description: 'Node.js, PostgreSQL',
          applicationUrl: 'https://old-system.com/apply/backend',
          location: 'Munich',
          status: 'published',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: 'job-3',
          title: 'DevOps Engineer',
          description: 'Kubernetes, AWS',
          applicationUrl: 'https://old-system.com/apply/devops',
          location: 'Hamburg',
          status: 'published',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ];

      postings.forEach(p => mockDb.set(p.id, p));

      const getCurrentPosting = async (id: string) => mockDb.get(id)!;
      const updatePosting = async (id: string, payload: Partial<JobPosting>) => {
        const current = mockDb.get(id)!;
        mockDb.set(id, { ...current, ...payload });
      };

      // User updates application URL to new recruitment system
      const newApplicationUrl = 'https://new-recruitment-system.com/apply';
      const selectedIds = ['job-1', 'job-2', 'job-3'];

      const result = await bulkUpdateJobPostingsFixed(
        selectedIds,
        { applicationUrl: newApplicationUrl },
        getCurrentPosting,
        updatePosting
      );

      // Verify all postings were updated
      expect(result.updated).toHaveLength(3);
      expect(result.skipped).toHaveLength(0);

      // Verify the URL is persisted in the database
      for (const id of selectedIds) {
        const posting = mockDb.get(id)!;
        expect(posting.applicationUrl).toBe(newApplicationUrl);
      }

      // Verify other fields remain unchanged
      expect(mockDb.get('job-1')!.title).toBe('Frontend Developer');
      expect(mockDb.get('job-2')!.title).toBe('Backend Developer');
      expect(mockDb.get('job-3')!.title).toBe('DevOps Engineer');
    });
  });
});
