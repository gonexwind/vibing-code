# Feature Implementation Plan: Get User Profile

This document outlines the steps to implement an authenticated API endpoint to retrieve user details.

## Overview
Implement a `POST /api/users/profile` endpoint that requires both a valid session token (in headers) and the user's credentials (in the request body) to return user profile information.

## 1. Services Layer Implementation
Implement the profile retrieval logic.

**Target File:** `src/services/users-service.ts`

**Steps:**
1.  Add a new method `getUserProfile(token: string, credentials: any)`:
    - It should accept the session `token` and the `credentials` object (containing `email` and `password`).
    - First, query the `sessions` table to find an entry matching the provided `token`.
    - If no session is found, return `null`.
    - If a session is found, retrieve the associated user using the `userId` from the session.
    - Verify that the `email` from the credentials matches the retrieved user's email.
    - Use `bcrypt.compare` to verify that the `password` from the credentials matches the user's hashed password.
    - If all checks pass, return the user object (excluding the password).
    - If any check fails, return `null`.

## 2. Routes Layer Implementation
Define the endpoint and handle HTTP request/response.

**Target File:** `src/routes/users-router.ts`

**Steps:**
1.  Add a new POST route `/profile`:
    - **Path:** `/profile` (resulting in `POST /api/users/profile`)
    - **Logic:**
        - Extract the `Authorization` header.
        - Parse the Bearer token: `const token = headers.authorization?.split(' ')[1]`.
        - If no token is provided, return `{ "message": "unauthorized" }` with a 401 status.
        - Call `usersService.getUserProfile(token, body)`.
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
          *(Note: Per requirements, use the message "User created successfully" even for profile retrieval).*

2.  **Schema Validation:**
    - Use `t.Object` for the body validation (`email` and `password`).

## 3. Verification
1.  Ensure the server is running: `bun run dev`.
2.  Login first to obtain a session token.
3.  Test the profile endpoint using `curl`:
    ```bash
    curl -X POST http://localhost:3000/api/users/profile \
    -H "Authorization: Bearer <YOUR_TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{"email": "fi@mail.com", "password": "password123"}'
    ```
4.  Verify that it returns the user profile on success or "unauthorized" on incorrect token/credentials.
