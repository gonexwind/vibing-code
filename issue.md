# Feature Implementation Plan: Comprehensive API Documentation (Swagger)

## Overview
The goal of this task is to fully configure and populate the Swagger UI for this project so that other developers or client applications can easily understand and use the available APIs. While the basic `@elysiajs/swagger` plugin is installed, our routes currently lack the necessary descriptive metadata to generate a useful API documentation page.

## Technical Setup Verification
1.  **Check Plugin Registration**: Verify in `src/index.ts` that `@elysiajs/swagger` is imported and registered with the application.
    ```typescript
    import { swagger } from "@elysiajs/swagger";
    // Ensure app.use(swagger()) is present
    export const app = new Elysia()
        .use(swagger({
            documentation: {
                info: {
                    title: 'Vibing Code User Authentication API',
                    version: '1.0.0'
                }
            }
        }))
    // ...
    ```

## Implementation Steps

Your task is to update `src/routes/users-router.ts` to add detailed OpenAPI metadata to every existing route.

### Step 1: Add Swagger Metadata to Public Routes

For both the **Registration (`POST /`)** and **Login (`POST /login`)** routes, update the route options object (the 3rd parameter of the `.post` method).

Add a `detail` object and a `response` object to describe the endpoint:

**Example Implementation (Registration):**
```typescript
{
    body: t.Object({ /* existing validation */ }),
    response: {
        200: t.Object({
            message: t.String(),
            data: t.Object({
                id: t.Number(),
                name: t.String(),
                email: t.String(),
                createdAt: t.Any()
            })
        }),
        400: t.Object({ message: t.String() })
    },
    detail: {
        summary: "Register a new user",
        description: "Creates a new user record in the database with hashed passwords.",
        tags: ["Authentication"]
    }
}
```

Repeat a similar process for **Login** (updating the `summary`, `description`, and `response` schema to match whatlogin returns).

### Step 2: Add Swagger Metadata to Protected Routes

Protected routes currently lack the 3rd parameter entirely. You will need to add it to both **Get Profile (`POST /profile`)** and **Logout (`POST /logout`)**.

Since these require a Bearer token, you must also specify security requirements in the `detail` object so the Swagger UI displays a lock icon indicating authentication is needed.

**Example Implementation (Profile):**
```typescript
.post("/profile", async ({ user, authError }) => {
    // existing logic
}, {
    response: {
        200: t.Object({ /* profile schema */ }),
        401: t.Object({ message: t.String() })
    },
    detail: {
        summary: "Get current user profile",
        description: "Returns the profile of the currently authenticated user based on the Bearer token.",
        tags: ["User Action"],
        security: [{ bearerAuth: [] }]
    }
})
```

### Step 3: Run and Verify

1.  Start the application in development mode: `bun run dev`
2.  Open your browser and navigate to `http://localhost:3000/swagger`.
3.  Verify that all 4 endpoints are visible, categorised under "Authentication" and "User Action".
4.  Verify that you can see the expected Request Body and Response Models for each endpoint.
