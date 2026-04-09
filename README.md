# Vibing Code - Secure Authentication API

A robust, performant, and secure backend authentication API built from the ground up using **Bun** and **ElysiaJS**. This project demonstrates best practices in API design, including strict input validation, database query optimization, token-based authentication, and comprehensive unit testing.

## Technology Stack & Libraries

- **Runtime:** [Bun](https://bun.sh/) (Fast all-in-one JavaScript runtime)
- **Web Framework:** [ElysiaJS](https://elysiajs.com/) (Ergonomic, high-performance TypeScript framework)
- **Database ORM:** [Drizzle ORM](https://orm.drizzle.team/) (Lightweight, type-safe SQL ORM)
- **Database:** MySQL
- **Security/Hashing:** `bcrypt` (Password hashing)
- **Validation:** Elysia's built-in TypeBox integration (`t`)
- **Testing:** `bun test`

---

## Architecture & Folder Structure

The application follows a clean, layered architectural pattern separating routing logic from business logic to ensure maintainability and testability.

```text
.
├── src/
│   ├── db/                    # Database configuration and schemas
│   │   ├── index.ts           # DB connection setup
│   │   └── schema.ts          # Drizzle schema definitions (tables)
│   ├── routes/                # HTTP Route definitions (Controllers)
│   │   └── users-router.ts    # Defines API endpoints and payload validation
│   ├── services/              # Business logic layer
│   │   └── users-service.ts   # Handles DB operations and core logic
│   └── index.ts               # Application entry point
├── tests/                     # Unit testing suite
│   ├── auth.test.ts           # Comprehensive tests for all auth scenarios
│   └── utils.ts               # Test helpers (e.g., DB cleanup)
├── drizzle/                   # Drizzle migrations
├── package.json               # Dependencies and scripts
└── tsconfig.json              # TypeScript configuration
```

### Naming Conventions
- **Files:** Use `kebab-case` with semantic suffixes (e.g., `users-router.ts`, `users-service.ts`).
- **Variables/Functions:** Use `camelCase` (e.g., `findUserByToken`, `usersService`).
- **Database Tables:** Use plural, lowercase `snake_case` (e.g., `users`, `sessions`).

---

## Database Schema

The system relies on a MySQL database with the following core tables structured via Drizzle ORM:

### `users` table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `serial` | Primary Key | Unique user identifier. |
| `name` | `varchar(255)` | Not Null | User's full name. |
| `email` | `varchar(255)` | Not Null, Unique | User's email address. |
| `password` | `varchar(255)` | Not Null | Bcrypt hashed password. |
| `createdAt` | `timestamp` | Default Now() | Timestamp of registration. |

### `sessions` table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `serial` | Primary Key | Unique session identifier. |
| `token` | `varchar(255)` | Not Null | UUID token identifying the session. |
| `userId` | `int` | Not Null, Foreign Key | References `users.id`. |
| `createdAt` | `timestamp` | Default Now() | Timestamp of login. |

---

## Available APIs

All APIs fall under the `/api/users` prefix.

### Public Endpoints

#### 1. Register User
- **Method:** `POST /api/users`
- **Description:** Registers a new user with strict payload validation.
- **Body:**
  ```json
  {
    "name": "John Doe",             // Max 255 chars
    "email": "john@example.com",    // Valid email format, Max 255 chars
    "password": "password123"       // Min 8 chars, Max 255 chars
  }
  ```

#### 2. User Login
- **Method:** `POST /api/users/login`
- **Description:** Authenticates a user and generates a unique secure UUID session token.
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Returns:** The UUID Bearer token string to be used for protected routes.

### Protected Endpoints
*These require an `Authorization: Bearer <token>` header.*

#### 3. Get User Profile
- **Method:** `POST /api/users/profile`
- **Description:** Retrieves the authenticated user's profile data. The password hash is explicitly excluded for security.

#### 4. Logout
- **Method:** `POST /api/users/logout`
- **Description:** Invalidates the current session by deleting the token record from the database. Subsequent requests with that token will result in a `401 Unauthorized` response.

---

## API Documentation (Swagger)

The project includes built-in interactive API documentation powered by Swagger. This allows you to explore the available endpoints, view request/response schemas, and test the APIs directly from your browser.

- **Swagger UI URL:** `http://localhost:3000/swagger`

### Interactive Testing
1.  **Public Routes**: You can test Registration and Login directly by providing the required payload.
2.  **Protected Routes**: After logging in, copy your session token. Click the **"Authorize"** button at the top of the Swagger page and paste your token under the `bearerAuth` definition. You can then test `/profile` and `/logout` with a valid session header automatically attached.

---

## Development Setup

Follow these steps to run the application locally.

### 1. Prerequisites
- Install [Bun](https://bun.sh/docs/installation)
- A running instance of MySQL

### 2. Installation
Clone the repository and install dependencies:
```bash
bun install
```

### 3. Environment Configuration
Create a `.env` file in the root directory and configure your database connection string:
```env
DATABASE_URL="mysql://user:password@localhost:3306/vibing_code"
```

### 4. Database Setup
Push the Drizzle schema to your connected MySQL database:
```bash
bunx drizzle-kit push
```

### 5. Running the Application
Start the development server with hot-reloading enabled:
```bash
bun run dev
```
The server will start at `http://localhost:3000`.

---

## Testing

The project includes a robust suite of unit tests verifying both success and failure constraints (validation, duplicates, unauthenticated access). 

We utilize Bun's built-in fast test runner. Tests are isolated; the database is automatically cleaned before every scenario execution.

To run the test suite:
```bash
bun test
```