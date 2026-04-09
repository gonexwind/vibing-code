# Issue Implementation Plan: User Sessions Management

This document outlines the steps to implement user sessions after a successful login. This includes database schema updates, service logic for session creation, and API response updates.

## 1. Database Schema Update
Define the `sessions` table to store user login tokens.

**Target File:** `src/db/schema.ts`

**Steps:**
1.  Import `int` or `serial` from `drizzle-orm/mysql-core` (if not already present).
2.  Import `users` table reference to create a foreign key relationship.
3.  Define a new table `sessions`:
    - `id`: integer, primary key, auto-increment.
    - `token`: varchar(255), not null (will store a UUID).
    - `userId`: integer, foreign key to `users.id`.
    - `createdAt`: timestamp, defaults to `current_timestamp`.

**Example Drizzle Code:**
```typescript
export const sessions = mysqlTable("sessions", {
	id: serial("id").primaryKey(),
	token: varchar("token", { length: 255 }).notNull(),
	userId: int("user_id").references(() => users.id),
	createdAt: timestamp("created_at").defaultNow(),
});
```

**Sync Database:**
Run the following commands to apply changes:
```bash
npx drizzle-kit generate
npx drizzle-kit push
```

## 2. Implement Session Service Logic
Handle the creation of the session token and storage.

**Target File:** `src/services/users-service.ts`

**Steps:**
1.  Update the `loginUser` service (or create a new helper in `users-service`).
2.  After verifying the password successfully:
    - Generate a unique token (UUID). In Bun, you can use `crypto.randomUUID()`.
    - Insert a new record into the `sessions` table with the generated `token` and the `user.id`.
    - Modify the `loginUser` return value to include this `token`.

**Note:** Ensure you import the `sessions` table from the schema file.

## 3. Update User Router
Expose the login functionality with the new session behavior.

**Target File:** `src/routes/users-router.ts`

**Steps:**
1.  Locate the `POST /login` route inside `usersRouter`.
2.  Ensure it calls the updated `usersService.loginUser`.
3.  Update the success response body to match the following structure:
    ```json
    {
        "message": "User created successfully",
        "data": "SESSION_TOKEN_HERE"
    }
    ```
    *(Note: Per requirements, use the message "User created successfully" even for login).*

4.  Ensure failure still returns:
    ```json
    {
        "message": "error"
    }
    ```

## 4. Verification
1.  Restart the server: `bun run dev`.
2.  Register a user (if not already exists).
3.  Test the login endpoint using `curl`:
    ```bash
    curl -X POST http://localhost:3000/api/users/login \
    -H "Content-Type: application/json" \
    -d '{"email": "fi@mail.com", "password": "yourpassword"}'
    ```
4.  Verify that a token is returned and a corresponding entry exists in the `sessions` table.
