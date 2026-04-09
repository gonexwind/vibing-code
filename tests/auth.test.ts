import { describe, it, expect, beforeEach } from "bun:test";
import { app } from "../src/index";
import { clearDatabase } from "./utils";

describe("User Authentication APIs", () => {
	beforeEach(async () => {
		await clearDatabase();
	});

	describe("Registration (POST /api/users)", () => {
		it("should successfully register a new user", async () => {
			const res = await app.handle(
				new Request("http://localhost/api/users", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						name: "Tester",
						email: "tester@example.com",
						password: "password123",
					}),
				})
			);

			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.message).toBe("User created successfully");
			expect(data.data.name).toBe("Tester");
			expect(data.data.email).toBe("tester@example.com");
			expect(data.data).not.toHaveProperty("password");
		});

		it("should fail when registering with a duplicate email", async () => {
			// First registration
			await app.handle(
				new Request("http://localhost/api/users", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						name: "Tester 1",
						email: "duplicate@example.com",
						password: "password123",
					}),
				})
			);

			// Duplicate registration
			const res = await app.handle(
				new Request("http://localhost/api/users", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						name: "Tester 2",
						email: "duplicate@example.com",
						password: "password123",
					}),
				})
			);

			expect(res.status).toBe(400);
			const data = await res.json();
			expect(data.message).toBe("Error");
		});

		it("should fail when name is too long ( > 255 chars)", async () => {
			const longName = "a".repeat(300);
			const res = await app.handle(
				new Request("http://localhost/api/users", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						name: longName,
						email: "long@example.com",
						password: "password123",
					}),
				})
			);

			// Expected status would be 422 from Elysia validation
			expect(res.status).toBe(422);
		});

		it("should fail with invalid email format", async () => {
			const res = await app.handle(
				new Request("http://localhost/api/users", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						name: "Tester",
						email: "invalid-email",
						password: "password123",
					}),
				})
			);

			expect(res.status).toBe(422);
		});

		it("should fail with short password (< 8 chars)", async () => {
			const res = await app.handle(
				new Request("http://localhost/api/users", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						name: "Tester",
						email: "weak@example.com",
						password: "short",
					}),
				})
			);

			expect(res.status).toBe(422);
		});

		it("should fail with missing required fields", async () => {
			const res = await app.handle(
				new Request("http://localhost/api/users", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						email: "missing@example.com",
					}),
				})
			);

			expect(res.status).toBe(422);
		});
	});

	describe("Login (POST /api/users/login)", () => {
		beforeEach(async () => {
			// Register a user for login tests
			await app.handle(
				new Request("http://localhost/api/users", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						name: "Login Tester",
						email: "login@example.com",
						password: "password123",
					}),
				})
			);
		});

		it("should successfully login with valid credentials", async () => {
			const res = await app.handle(
				new Request("http://localhost/api/users/login", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						email: "login@example.com",
						password: "password123",
					}),
				})
			);

			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.message).toBe("User created successfully");
			expect(typeof data.data).toBe("string"); // UUID token
		});

		it("should fail with unregistered email", async () => {
			const res = await app.handle(
				new Request("http://localhost/api/users/login", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						email: "nonexistent@example.com",
						password: "password123",
					}),
				})
			);

			expect(res.status).toBe(401);
			const data = await res.json();
			expect(data.message).toBe("error");
		});

		it("should fail with incorrect password", async () => {
			const res = await app.handle(
				new Request("http://localhost/api/users/login", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						email: "login@example.com",
						password: "wrongpassword",
					}),
				})
			);

			expect(res.status).toBe(401);
			const data = await res.json();
			expect(data.message).toBe("error");
		});

		it("should fail with invalid email format", async () => {
			const res = await app.handle(
				new Request("http://localhost/api/users/login", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						email: "not-an-email",
						password: "password123",
					}),
				})
			);

			expect(res.status).toBe(422);
		});
	});

	describe("User Profile (POST /api/users/profile)", () => {
		let token: string;

		beforeEach(async () => {
			// Register and Login to get a token
			await app.handle(
				new Request("http://localhost/api/users", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						name: "Profile Tester",
						email: "profile@example.com",
						password: "password123",
					}),
				})
			);

			const loginRes = await app.handle(
				new Request("http://localhost/api/users/login", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						email: "profile@example.com",
						password: "password123",
					}),
				})
			);

			const loginData = await loginRes.json();
			token = loginData.data;
		});

		it("should successfully fetch profile with valid token", async () => {
			const res = await app.handle(
				new Request("http://localhost/api/users/profile", {
					method: "POST",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				})
			);

			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.message).toBe("Get User successfully");
			expect(data.data.email).toBe("profile@example.com");
			expect(data.data).not.toHaveProperty("password");
		});

		it("should fail without Authorization header", async () => {
			const res = await app.handle(
				new Request("http://localhost/api/users/profile", {
					method: "POST",
				})
			);

			expect(res.status).toBe(401);
			const data = await res.json();
			expect(data.message).toBe("unauthorized");
		});

		it("should fail with invalid token", async () => {
			const res = await app.handle(
				new Request("http://localhost/api/users/profile", {
					method: "POST",
					headers: {
						Authorization: "Bearer invalid-token",
					},
				})
			);

			expect(res.status).toBe(401);
			const data = await res.json();
			expect(data.message).toBe("unauthorized");
		});
	});

	describe("User Logout (POST /api/users/logout)", () => {
		let token: string;

		beforeEach(async () => {
			// Register and Login to get a token
			await app.handle(
				new Request("http://localhost/api/users", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						name: "Logout Tester",
						email: "logout@example.com",
						password: "password123",
					}),
				})
			);

			const loginRes = await app.handle(
				new Request("http://localhost/api/users/login", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						email: "logout@example.com",
						password: "password123",
					}),
				})
			);

			const loginData = await loginRes.json();
			token = loginData.data;
		});

		it("should successfully logout and invalidate token", async () => {
			const res = await app.handle(
				new Request("http://localhost/api/users/logout", {
					method: "POST",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				})
			);

			expect(res.status).toBe(200);
			const data = await res.json();
			expect(data.message).toBe("");
			expect(data.data.email).toBe("logout@example.com");

			// Verify token is invalidated by trying to fetch profile
			const profileRes = await app.handle(
				new Request("http://localhost/api/users/profile", {
					method: "POST",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				})
			);

			expect(profileRes.status).toBe(401);
		});

		it("should fail logout without Authorization header", async () => {
			const res = await app.handle(
				new Request("http://localhost/api/users/logout", {
					method: "POST",
				})
			);

			expect(res.status).toBe(401);
		});

		it("should fail logout with invalid token", async () => {
			const res = await app.handle(
				new Request("http://localhost/api/users/logout", {
					method: "POST",
					headers: {
						Authorization: "Bearer invalid-token",
					},
				})
			);

			expect(res.status).toBe(401);
		});
	});
});
