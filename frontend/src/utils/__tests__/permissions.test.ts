import { describe, it, expect } from 'vitest';
import { hasPermission, createPermissionHelpers } from '../permissions';
import type { UserPermissions } from '@/types/permissions';

describe('Permission Utilities', () => {
  const mockPermissions: UserPermissions = {
    dashboard: { view: { allowed: true } },
    rfp: {
      create: { allowed: true },
      view: { allowed: true, scope: 'own' as const },
      edit: { allowed: true, scope: 'own' as const, allowed_rfp_statuses: ['Draft'] },
      publish: { allowed: false },
    },
    supplier_response: {
      view: { allowed: true, scope: 'rfp_owner' as const },
      create: { allowed: false },
    },
    search: { allowed: { allowed: true } },
  };

  describe('hasPermission', () => {
    it('should return true for allowed permissions', () => {
      expect(hasPermission(mockPermissions, 'dashboard', 'view')).toBe(true);
      expect(hasPermission(mockPermissions, 'rfp', 'create')).toBe(true);
    });

    it('should return false for disallowed permissions', () => {
      expect(hasPermission(mockPermissions, 'rfp', 'publish')).toBe(false);
      expect(hasPermission(mockPermissions, 'supplier_response', 'create')).toBe(false);
    });

    it('should return false for non-existent permissions', () => {
      expect(hasPermission(mockPermissions, 'nonexistent', 'action')).toBe(false);
      expect(hasPermission(mockPermissions, 'rfp', 'nonexistent')).toBe(false);
    });

    it('should handle nested permission objects', () => {
      expect(hasPermission(mockPermissions, 'search', 'allowed')).toBe(true);
    });
  });

  describe('createPermissionHelpers', () => {
    const helpers = createPermissionHelpers(mockPermissions);

    it('should create helper properties for common permissions', () => {
      expect(helpers.canCreateRfp).toBe(true);
      expect(helpers.canViewRfp).toBe(true);
      expect(helpers.canEditRfp).toBe(true);
      expect(helpers.canPublishRfp).toBe(false);
    });

    it('should create helper properties for response permissions', () => {
      expect(helpers.canCreateResponse).toBe(false);
      expect(helpers.canViewResponse).toBe(true);
    });

    it('should create helper properties for search permissions', () => {
      expect(helpers.canSearch).toBe(true);
    });

    it('should have a hasPermission method', () => {
      expect(helpers.hasPermission('dashboard', 'view')).toBe(true);
      expect(helpers.hasPermission('rfp', 'publish')).toBe(false);
    });
  });
});
