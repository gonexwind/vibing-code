import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { usersRouter } from "./routes/users-router";

const app = new Elysia()
	.use(swagger())
	.use(usersRouter)
	.get("/", () => "Hello Elysia")
	.listen(3000);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
