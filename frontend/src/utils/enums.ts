export enum AUDIT_ACTIONS {
    // RFP Actions
    RFP_CREATED = "RFP_CREATED",
    RFP_UPDATED = "RFP_UPDATED",
    RFP_DELETED = "RFP_DELETED",
    RFP_PUBLISHED = "RFP_PUBLISHED",
    RFP_STATUS_CHANGED = "RFP_STATUS_CHANGED",
    
    // Response Actions
    RESPONSE_CREATED = "RESPONSE_CREATED",
    RESPONSE_UPDATED = "RESPONSE_UPDATED",
    RESPONSE_DELETED = "RESPONSE_DELETED",
    RESPONSE_SUBMITTED = "RESPONSE_SUBMITTED",
    RESPONSE_MOVED_TO_REVIEW = "RESPONSE_MOVED_TO_REVIEW",
    RESPONSE_APPROVED = "RESPONSE_APPROVED",
    RESPONSE_REJECTED = "RESPONSE_REJECTED",
    RESPONSE_AWARDED = "RESPONSE_AWARDED",
    
    // Document Actions
    DOCUMENT_UPLOADED = "DOCUMENT_UPLOADED",
    DOCUMENT_DELETED = "DOCUMENT_DELETED",
    
    // User Actions
    USER_LOGIN = "USER_LOGIN",
    USER_LOGOUT = "USER_LOGOUT",
    USER_REGISTERED = "USER_REGISTERED",
    USER_PROFILE_UPDATED = "USER_PROFILE_UPDATED",
    
    // System Actions
    SYSTEM_ERROR = "SYSTEM_ERROR",
    PERMISSION_DENIED = "PERMISSION_DENIED",
    
    // Error Actions
    AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
    AUTHORIZATION_ERROR = "AUTHORIZATION_ERROR",
    VALIDATION_ERROR = "VALIDATION_ERROR",
    RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
    CLIENT_ERROR = "CLIENT_ERROR",
    
    // Admin Actions
    DATA_EXPORTED = "DATA_EXPORTED",
    REPORT_GENERATED = "REPORT_GENERATED",
    REPORT_SCHEDULED = "REPORT_SCHEDULED"
}

// Helper function to get display name for audit actions
export const getAuditActionDisplayName = (action: string): string => {
    return action.replace(/_/g, ' ');
};

// Helper function to get action category
export const getAuditActionCategory = (action: string): string => {
    if (action.includes('RFP_')) return 'RFP';
    if (action.includes('RESPONSE_')) return 'Response';
    if (action.includes('DOCUMENT_')) return 'Document';
    if (action.includes('USER_')) return 'User';
    if (action.includes('ERROR') || action.includes('SYSTEM_') || action.includes('PERMISSION_')) return 'System';
    if (action.includes('DATA_') || action.includes('REPORT_')) return 'Admin';
    return 'Other';
};
