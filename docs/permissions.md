# Permission Schema Documentation

This document outlines the structure of the JSON object used for defining role-based permissions and how the `hasPermission` middleware enforces them.

## Base Structure

The permissions object is organized by **resource** (e.g., `rfp`, `supplier_response`), with each resource containing a set of **actions** (e.g., `create`, `view`).

```json
{
  "resource_name": {
    "action_name": {
      "allowed": boolean,
      "scope": "string",
      "allowed_rfp_statuses": ["array"],
      "allowed_response_statuses": ["array"]
    }
  }
}
```

The `hasPermission(resource, action)` middleware checks if the current user's role has the `allowed: true` flag for the given resource and action. It then applies any additional rules defined in the permission object.

---

## Permission Rules

The following rules can be combined to create fine-grained access control.

### `allowed`

-   **Type:** `boolean`
-   **Description:** The most basic rule. If `true`, the user is allowed to perform the action, subject to other rules. If `false` or undefined, access is denied.

### `scope`

-   **Type:** `string`
-   **Description:** Restricts access based on the user's relationship to the resource.
-   **Values:**
    -   `"own"`: The user must be the direct owner of the resource.
        -   For an `rfp`, the `buyer_id` must match the user's ID.
        -   For a `supplier_response`, the `supplier_id` must match the user's ID.
    -   `"rfp_owner"`: The user must be the owner of the parent RFP. This is used for actions on a `supplier_response` where the user is the buyer.

### `allowed_rfp_statuses`

-   **Type:** `string[]` (Array of status codes)
-   **Description:** The action is only allowed if the target RFP's status is one of the statuses in the array.
-   **Example:** A supplier can only create a response for an RFP that is `Published`.

### `allowed_response_statuses`

-   **Type:** `string[]` (Array of status codes)
-   **Description:** The action is only allowed if the target supplier response's status is one of the statuses in the array.
-   **Example:** A supplier can only edit or submit a response that is in `Draft` status.

### `navbar`

-   **Type:** `string`
-   **Description:** Defines which navigation items should be visible to users with this role.
-   **Format:** Comma-separated list of navigation keys (e.g., "dashboard,users,analytics,audit,rfps,responses,permissions")

---

## Complete Role Permission Objects

### Buyer Role Permissions

```json
{
  "dashboard": {
    "view": {
      "allowed": true
    }
  },
  "rfp": {
    "create": {
      "allowed": true
    },
    "view": {
      "allowed": true,
      "scope": "own"
    },
    "edit": {
      "allowed": true,
      "scope": "own",
      "allowed_rfp_statuses": ["Draft"]
    },
    "publish": {
      "allowed": true,
      "scope": "own",
      "allowed_rfp_statuses": ["Draft"]
    },
    "close": {
      "allowed": true,
      "scope": "own",
      "allowed_rfp_statuses": ["Published"]
    },
    "cancel": {
      "allowed": true,
      "scope": "own",
      "allowed_rfp_statuses": ["Draft", "Published"]
    },
    "award": {
      "allowed": true,
      "scope": "own",
      "allowed_rfp_statuses": ["Published", "Closed"]
    },
    "review_responses": {
      "allowed": true,
      "scope": "own"
    },
    "read_responses": {
      "allowed": true,
      "scope": "own"
    },
    "manage_documents": {
      "allowed": true,
      "scope": "own"
    }
  },
  "supplier_response": {
    "submit": {
      "allowed": false
    },
    "view": {
      "allowed": true,
      "scope": "rfp_owner"
    },
    "edit": {
      "allowed": false
    },
    "create": {
      "allowed": false
    },
    "manage_documents": {
      "allowed": false
    },
    "review": {
      "allowed": true,
      "scope": "rfp_owner"
    },
    "approve": {
      "allowed": true,
      "scope": "rfp_owner",
      "allowed_response_statuses": ["Under Review"]
    },
    "reject": {
      "allowed": true,
      "scope": "rfp_owner",
      "allowed_response_statuses": ["Under Review"]
    },
    "award": {
      "allowed": true,
      "scope": "rfp_owner",
      "allowed_response_statuses": ["Approved"]
    },
    "reopen": {
      "allowed": true,
      "scope": "rfp_owner",
      "allowed_response_statuses": ["Rejected"]
    }
  },
  "documents": {
    "upload_for_rfp": {
      "allowed": true,
      "scope": "own"
    },
    "upload_for_response": {
      "allowed": false
    }
  },
  "audit": {
    "view": {
      "allowed": true,
      "scope": "own"
    }
  },
  "navbar": "dashboard,my_rfps,create_rfp,browse_rfps,audit"
}
```

### Supplier Role Permissions

```json
{
  "dashboard": {
    "view": {
      "allowed": true
    }
  },
  "rfp": {
    "create": {
      "allowed": false
    },
    "view": {
      "allowed": true,
      "allowed_rfp_statuses": ["Published", "Awarded", "Rejected"]
    },
    "edit": {
      "allowed": false
    },
    "publish": {
      "allowed": false
    },
    "close": {
      "allowed": false
    },
    "cancel": {
      "allowed": false
    },
    "award": {
      "allowed": false
    },
    "review_responses": {
      "allowed": false
    },
    "read_responses": {
      "allowed": true
    },
    "manage_documents": {
      "allowed": false
    }
  },
  "supplier_response": {
    "create": {
      "allowed": true,
      "allowed_rfp_statuses": ["Published"]
    },
    "submit": {
      "allowed": true,
      "scope": "own",
      "allowed_response_statuses": ["Draft"]
    },
    "view": {
      "allowed": true,
      "scope": "own"
    },
    "edit": {
      "allowed": true,
      "scope": "own",
      "allowed_response_statuses": ["Draft"]
    },
    "manage_documents": {
      "allowed": true,
      "scope": "own"
    },
    "approve": {
      "allowed": false
    },
    "reject": {
      "allowed": false
    },
    "award": {
      "allowed": false
    },
    "reopen": {
      "allowed": false
    }
  },
  "documents": {
    "upload_for_rfp": {
      "allowed": false
    },
    "upload_for_response": {
      "allowed": true,
      "scope": "own"
    }
  },
  "audit": {
    "view": {
      "allowed": true,
      "scope": "own"
    }
  },
  "navbar": "dashboard,browse_rfps,my_responses,audit"
}
```

### Admin Role Permissions

```json
{
  "dashboard": {
    "view": {
      "allowed": true
    }
  },
  "rfp": {
    "create": {
      "allowed": true
    },
    "view": {
      "allowed": true
    },
    "edit": {
      "allowed": true
    },
    "publish": {
      "allowed": true
    },
    "close": {
      "allowed": true
    },
    "cancel": {
      "allowed": true
    },
    "award": {
      "allowed": true
    },
    "review_responses": {
      "allowed": true
    },
    "read_responses": {
      "allowed": true
    },
    "manage_documents": {
      "allowed": true
    }
  },
  "supplier_response": {
    "create": {
      "allowed": true
    },
    "submit": {
      "allowed": true
    },
    "view": {
      "allowed": true
    },
    "edit": {
      "allowed": true
    },
    "manage_documents": {
      "allowed": true
    },
    "review": {
      "allowed": true
    },
    "approve": {
      "allowed": true
    },
    "reject": {
      "allowed": true
    },
    "award": {
      "allowed": true
    },
    "reopen": {
      "allowed": true
    }
  },
  "documents": {
    "upload_for_rfp": {
      "allowed": true
    },
    "upload_for_response": {
      "allowed": true
    }
  },
  "audit": {
    "view": {
      "allowed": true
    }
  },
  "navbar": "dashboard,users,analytics,audit,rfps,responses,permissions"
}
```

---

## Implementation Notes

### Middleware Usage

The `hasPermission(resource, action)` middleware should be used in route handlers:

```javascript
// Example: Only buyers can create RFPs
app.post('/rfp', hasPermission('rfp', 'create'), createRfpHandler);

// Example: Users can only view their own RFPs (scope: "own")
app.get('/rfp/:id', hasPermission('rfp', 'view'), getRfpHandler);

// Example: Buyers can approve supplier responses (scope: "rfp_owner")
app.patch('/supplier-response/:id/approve', hasPermission('supplier_response', 'approve'), approveResponseHandler);
```

### Status-based Access Control

When checking permissions that depend on resource status:

1. The middleware should first verify `allowed: true`
2. Then check if the resource status matches `allowed_rfp_statuses` or `allowed_response_statuses`
3. Apply scope restrictions (`own`, `rfp_owner`, etc.)

### Error Handling

When access is denied, the middleware should return appropriate HTTP status codes:
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: User authenticated but lacks permission
- `404 Not Found`: Resource doesn't exist or user has no access (security by obscurity)