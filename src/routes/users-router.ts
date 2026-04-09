import { Elysia, t } from "elysia";
import { usersService } from "../services/users-service";

export const usersRouter = new Elysia({ prefix: "/api/users" })
	// --- Public Routes ---
	.post(
		"/",
		async ({ body, set }) => {
			try {
				const user = await usersService.registerUser(body);
				return {
					message: "User created successfully",
					data: user,
				};
			} catch (error) {
				set.status = 400;
				console.log(error);
				return { message: "Error" };
			}
		},
		{
			body: t.Object({
				name: t.String({ minLength: 1, maxLength: 255 }),
				email: t.String({ format: "email", maxLength: 255 }),
				password: t.String({ minLength: 8, maxLength: 255 }),
			}),
			response: {
				200: t.Object({
					message: t.String(),
					data: t.Object({
						id: t.Number(),
						name: t.String(),
						email: t.String(),
						createdAt: t.Any(),
					}),
				}),
				400: t.Object({
					message: t.String(),
				}),
				422: t.Any(),
			},
			detail: {
				summary: "Register a new user",
				description:
					"Creates a new user account with hashed password storage and unique email validation.",
				tags: ["Authentication"],
			},
		}
	)
	.post(
		"/login",
		async ({ body, set }) => {
			const token = await usersService.loginUser(body);

			if (!token) {
				set.status = 401;
				return { message: "error" };
			}

			return {
				message: "User created successfully",
				data: token,
			};
		},
		{
			body: t.Object({
				email: t.String({ format: "email" }),
				password: t.String(),
			}),
			response: {
				200: t.Object({
					message: t.String(),
					data: t.String({ description: "UUID session token" }),
				}),
				401: t.Object({
					message: t.String(),
				}),
				422: t.Any(),
			},
			detail: {
				summary: "User login",
				description:
					"Authenticates a user and returns a session token for subsequent protected requests.",
				tags: ["Authentication"],
			},
		}
	)

	// --- Protected Routes ---
	.derive(async ({ headers, set }) => {
		const token = headers.authorization?.split(" ")[1];

		if (!token) {
			set.status = 401;
			return { authError: "unauthorized" };
		}

		const user = await usersService.findUserByToken(token);

		if (!user) {
			set.status = 401;
			return { authError: "unauthorized" };
		}

		return { user, token };
	})
	.post(
		"/profile",
		async ({ user, authError }) => {
			if (authError) return { message: authError };

			return {
				message: "Get User successfully",
				data: user,
			};
		},
		{
			response: {
				200: t.Object({
					message: t.String(),
					data: t.Object({
						id: t.Number(),
						name: t.String(),
						email: t.String(),
						createdAt: t.Any(),
					}),
				}),
				401: t.Object({ message: t.String() }),
			},
			detail: {
				summary: "Get user profile",
				description:
					"Returns the profile of the currently authenticated user. Requires Bearer token.",
				tags: ["User Action"],
				security: [{ bearerAuth: [] }],
			},
		}
	)
	.post(
		"/logout",
		async ({ token, authError }) => {
			if (authError) return { message: authError };

			const userProfile = await usersService.logoutUser(token);

			return {
				message: "",
				data: userProfile,
			};
		},
		{
			response: {
				200: t.Object({
					message: t.String(),
					data: t.Object({
						id: t.Number(),
						name: t.String(),
						email: t.String(),
						createdAt: t.Any(),
					}),
				}),
				401: t.Object({ message: t.String() }),
			},
			detail: {
				summary: "User logout",
				description:
					"Invalidates the current session token to protect against unauthorized future use.",
				tags: ["User Action"],
				security: [{ bearerAuth: [] }],
			},
		}
	);
