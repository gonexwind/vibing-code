import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { usersRouter } from "./routes/users-router";

export const app = new Elysia()
	.use(
		swagger({
			documentation: {
				info: {
					title: "Vibing Code User Authentication API",
					version: "1.0.0",
				},
				components: {
					securitySchemes: {
						bearerAuth: {
							type: "http",
							scheme: "bearer",
							bearerFormat: "JWT",
						},
					},
				},
			},
		})
	)
	.use(usersRouter)
	.get("/", () => "Hello Elysia");

if (process.env.NODE_ENV !== "test") {
	app.listen(3000);
	console.log(
		`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
	);
}
