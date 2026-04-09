import { Elysia, t } from "elysia";
import { usersService } from "../services/users-service";

export const usersRouter = new Elysia({ prefix: "/api/users" })
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
				name: t.String(),
				email: t.String(),
				password: t.String(),
			}),
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
				email: t.String(),
				password: t.String(),
			}),
		}
	)
	.post(
		"/profile",
		async ({ body, headers, set }) => {
			const token = headers.authorization?.split(" ")[1];

			if (!token) {
				set.status = 401;
				return { message: "unauthorized" };
			}

			const user = await usersService.getUserProfile(token, body);

			if (!user) {
				set.status = 401;
				return { message: "unauthorized" };
			}

			return {
				message: "Get User successfully",
				data: user,
			};
		},
		{
			body: t.Object({
				email: t.String(),
				password: t.String(),
			}),
		}
	);
