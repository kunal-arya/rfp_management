import { describe, it, expect } from 'vitest';
import { validateBulkOperation, formatBulkOperationMessage } from '../export';

describe('Export Utilities', () => {
  describe('validateBulkOperation', () => {
    it('should return false for empty selection', () => {
      expect(validateBulkOperation([], 'delete')).toBe(false);
    });

    it('should return false for invalid action', () => {
      expect(validateBulkOperation(['1', '2'], 'invalid')).toBe(false);
    });

    it('should return true for valid selections and actions', () => {
      expect(validateBulkOperation(['1'], 'delete')).toBe(true);
      expect(validateBulkOperation(['1', '2'], 'publish')).toBe(true);
      expect(validateBulkOperation(['1'], 'archive')).toBe(true);
      expect(validateBulkOperation(['1'], 'export')).toBe(true);
    });
  });

  describe('formatBulkOperationMessage', () => {
    it('should format singular messages correctly', () => {
      expect(formatBulkOperationMessage(1, 'delete')).toBe(
        'Are you sure you want to delete 1 item?'
      );
      expect(formatBulkOperationMessage(1, 'publish')).toBe(
        'Are you sure you want to publish 1 item?'
      );
    });

    it('should format plural messages correctly', () => {
      expect(formatBulkOperationMessage(2, 'delete')).toBe(
        'Are you sure you want to delete 2 items?'
      );
      expect(formatBulkOperationMessage(5, 'archive')).toBe(
        'Are you sure you want to archive 5 items?'
      );
    });

    it('should handle unknown actions', () => {
      expect(formatBulkOperationMessage(1, 'unknown')).toBe(
        'Are you sure you want to unknown 1 item?'
      );
    });
  });
});
