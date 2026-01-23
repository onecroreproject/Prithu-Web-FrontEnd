// src/hooks/index.js
/**
 * Central export file for all custom React Query hooks
 * Import from here for cleaner imports: import { useNotifications, usePostActions } from '../hooks';
 */

// Phase 1: Post Actions & Notifications
export * from './usePostActions';
export * from './useNotifications';
export * from './useComments';

// Phase 2: Search & Profile Data
export * from './useSearch';
export * from './useProfileData';

// Phase 3: Jobs & Miscellaneous
export * from './useMiscellaneous';

// Existing hooks (if any)
export * from './userProfile';
export * from './userUserLoaction';
