# Feature Implementation Plan: API Unit Testing

## Overview
Implement comprehensive unit tests for all available user authentication and management APIs using `bun test`.

## Technical Requirements
- **Framework:** `bun test`
- **Location:** All test files must be saved in the `tests` directory at the root of the project.
- **Data Consistency Requirement:** The database state MUST be cleared before every single test scenario executes to ensure tests are isolated and consistent. (e.g., Use `beforeEach` hooks to clear the `users` and `sessions` tables).

---

## Test Scenarios to Implement

Do not worry about the low-level implementation details in this document; simply follow this list of scenarios and write the corresponding test blocks. Ensure you cover as many edge cases as possible based on these scenarios.

### 1. User Registration (`POST /api/users`)
*   **Success Scenario:**
    *   Register a new user with valid `name`, `email`, and `password`. Verify the user is created and returned correctly (status 200).
*   **Failure Scenarios (Validation & Constraints):**
    *   Attempt to register with an email that is already in use (Conflict/Error handling).
    *   Attempt to register with a `name` exceeding 255 characters.
    *   Attempt to register with an invalid `email` format.
    *   Attempt to register with a `password` shorter than 8 characters.
    *   Attempt to register with missing required fields in the request body.

### 2. User Login (`POST /api/users/login`)
*   **Success Scenario:**
    *   Login with valid credentials. Verify a valid session token is returned (status 200) and a session record is created in the database.
*   **Failure Scenarios:**
    *   Attempt to login with an unregistered email. (Expect 401 Unauthorized)
    *   Attempt to login with a correct email but an incorrect password. (Expect 401 Unauthorized)
    *   Attempt to login with an invalid email format in the request body. (Validation Error)
    *   Attempt to login with missing fields. (Validation Error)

### 3. Get User Profile (`POST /api/users/profile`)
*   **Success Scenario:**
    *   Request profile with a valid `Bearer token` in the `Authorization` header. Verify the user profile data is returned correctly and that the **password is not exposed**.
*   **Failure Scenarios (Authentication):**
    *   Attempt to request profile without an `Authorization` header. (Expect 401 Unauthorized)
    *   Attempt to request profile with an invalid, malformed, or fake Bearer token. (Expect 401 Unauthorized)

### 4. User Logout (`POST /api/users/logout`)
*   **Success Scenario:**
    *   Request logout with a valid `Bearer token`. Verify the return value (status 200) and **crucially**, verify that the session record has been successfully deleted from the database.
*   **Failure Scenarios:**
    *   Attempt to logout without an `Authorization` header. (Expect 401 Unauthorized)
    *   Attempt to logout with an invalid or previously deleted token. (Expect 401 Unauthorized) 
    *   Attempt to request the profile endpoint using the same token *after* a successful logout to ensure it fails.
