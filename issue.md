# Bug Report: Missing Input Validation for User Registration

## Description
The user registration endpoint (`POST /api/users`) lacks proper input validation. While the database schema correctly limits fields to 255 characters, the application does not validate this limit before attempting the database insert. This results in generic 400 "Error" responses caused by database exceptions when inputs are too long, rather than specific validation errors.

## Steps to Reproduce
1. Attempt to register a new user with a name that is 300 characters long.
2. The server will return a generic `{"message":"Error"}`.
3. The server console will show a MySQL error regarding data length.

## How to Fix (Step-by-Step)

### Step 1: Add Input Validation to Routes
Implement schema validation using Elysia's `t` (TypeBox) to match the database constraints and ensure data integrity.

**Target File:** `src/routes/users-router.ts`

**Implementation:**
Update the `.post("/")` (registration) and other relevant routes to include validation for `name`, `email`, and `password`.

1.  **Name**: Limit to 255 characters to match the database `varchar(255)`.
2.  **Email**: Validated as a proper email format and limited to 255 characters.
3.  **Password**: Add a minimum length (e.g., 8 characters) for security, and limit to 255 characters.

```typescript
// src/routes/users-router.ts updates

// Registration validation
{
    body: t.Object({
        name: t.String({ minLength: 1, maxLength: 255 }),
        email: t.String({ format: 'email', maxLength: 255 }),
        password: t.String({ minLength: 8, maxLength: 255 }),
    }),
}

// Login validation
{
    body: t.Object({
        email: t.String({ format: 'email' }),
        password: t.String(),
    }),
}
```

### Step 2: Handle Validation Errors (Optional but Recommended)
Elysia automatically handles validation errors and returns a 400 status. Ensure the error handling in the `try-catch` block doesn't swallow specific validation details if you choose to customize the response.

### Step 3: Verification
1.  **Test 300 chars**: Register with a 300-character name. It should now return a specific validation error (e.g., `Expected string length less than or equal to 255`) instead of a generic "Error".
2.  **Test Valid Input**: Register with valid data and ensure it still works.
3.  **Test Invalid Email**: Try an invalid email format to verify the `format: 'email'` check.
4.  **Test Short Password**: Try a 4-character password to verify the `minLength: 8` check.

## Schema Reference (for Alignment)
The following limits are defined in `src/db/schema.ts` and must be respected by the validation layer:
- `users`: `name` (255), `email` (255), `password` (255).
- `sessions`: `token` (255).
