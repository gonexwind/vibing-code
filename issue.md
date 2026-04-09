# Feature Implementation Plan: User Logout

This document outlines the steps to implement a secure user logout endpoint.

## Overview
Implement a `POST /api/users/logout` endpoint that invalidates a user session by deleting the token from the `sessions` table after verifying both the session token and the user's credentials.

## 1. Services Layer Implementation
Implement the session invalidation logic.

**Target File:** `src/services/users-service.ts`

**Steps:**
1.  Add a new method `logoutUser(token: string, credentials: any)`:
    - It should accept the session `token` and the `credentials` object (containing `email` and `password`).
    - First, use logic similar to `getUserProfile` to verify the `token` exists in the `sessions` table and that the `email` and `password` match the associated user.
    - If any verification step fails, return `null`.
    - If verification is successful:
        - Retrieve the user data to be returned in the response.
        - Delete the session record from the `sessions` table using `db.delete(sessions).where(eq(sessions.token, token))`.
        - Return the user object (excluding the password).

## 2. Routes Layer Implementation
Define the logout endpoint.

**Target File:** `src/routes/users-router.ts`

**Steps:**
1.  Add a new POST route `/logout`:
    - **Path:** `/logout` (resulting in `POST /api/users/logout`)
    - **Logic:**
        - Extract the Bearer token from the `Authorization` header.
        - If no token is provided, return `{ "message": "unauthorized" }` with a 401 status.
        - Call `usersService.logoutUser(token, body)`.
        - If it returns `null`, return `{ "message": "unauthorized" }` with a 401 status.
        - If successful, return the JSON response:
          ```json
          {
              "message": "User created successfully",
              "data": {
                  "id": 1,
                  "name": "User Name",
                  "email": "user@mail.com",
                  "created_at": "timestamp"
              }
          }
          ```
          *(Note: Per requirements, use the message "User created successfully" even for logout).*

2.  **Schema Validation:**
    - Use `t.Object` for the body validation (`email` and `password`).

## 3. Verification
1.  Ensure the server is running: `bun run dev`.
2.  Login to obtain a session token.
3.  Test the logout endpoint using `curl`:
    ```bash
    curl -X POST http://localhost:3000/api/users/logout \
    -H "Authorization: Bearer <YOUR_TOKEN>" \
    -H "Content-Type: application/json" 
    ```
4.  Verify that it returns the user details and the session is removed from the database (subsequent requests using the same token should fail).
