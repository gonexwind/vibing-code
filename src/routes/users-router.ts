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
				return { message: "error" };
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
			const user = await usersService.loginUser(body);

			if (!user) {
				set.status = 401;
				return { message: "error" };
			}

			return {
				message: "User logged in successfully",
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
