import { RoleName, RFP_STATUS, SUPPLIER_RESPONSE_STATUS } from '../enum';

describe('Enum Utilities', () => {
  describe('RoleName enum', () => {
    it('should have Buyer and Supplier roles', () => {
      expect(RoleName.Buyer).toBe('Buyer');
      expect(RoleName.Supplier).toBe('Supplier');
    });

    it('should have exactly 2 roles', () => {
      const roles = Object.values(RoleName);
      expect(roles).toHaveLength(2);
      expect(roles).toContain('Buyer');
      expect(roles).toContain('Supplier');
    });
  });

  describe('RFP_STATUS enum', () => {
    it('should have all required RFP statuses', () => {
      expect(RFP_STATUS.Draft).toBe('Draft');
      expect(RFP_STATUS.Published).toBe('Published');
      expect(RFP_STATUS.Closed).toBe('Closed');
      expect(RFP_STATUS.Cancelled).toBe('Cancelled');
      expect(RFP_STATUS.Awarded).toBe('Awarded');
    });

    it('should have exactly 6 statuses', () => {
      const statuses = Object.values(RFP_STATUS);
      expect(statuses).toHaveLength(6);
    });

    it('should be string values', () => {
      Object.values(RFP_STATUS).forEach(status => {
        expect(typeof status).toBe('string');
      });
    });
  });

  describe('SUPPLIER_RESPONSE_STATUS enum', () => {
    it('should have all required supplier response statuses', () => {
      expect(SUPPLIER_RESPONSE_STATUS.Draft).toBe('Draft');
      expect(SUPPLIER_RESPONSE_STATUS.Submitted).toBe('Submitted');
      expect(SUPPLIER_RESPONSE_STATUS.Under_Review).toBe('Under Review');
      expect(SUPPLIER_RESPONSE_STATUS.Approved).toBe('Approved');
      expect(SUPPLIER_RESPONSE_STATUS.Rejected).toBe('Rejected');
    }); 

    it('should have exactly 2 statuses', () => {
      const statuses = Object.values(SUPPLIER_RESPONSE_STATUS);
      expect(statuses).toHaveLength(5);
      expect(statuses).toContain('Draft');
      expect(statuses).toContain('Submitted');
      expect(statuses).toContain('Under Review');
      expect(statuses).toContain('Approved');
      expect(statuses).toContain('Rejected');
    });

    it('should be string values', () => {
      Object.values(SUPPLIER_RESPONSE_STATUS).forEach(status => {
        expect(typeof status).toBe('string');
      });
    });
  });
});
