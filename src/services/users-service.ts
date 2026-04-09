import { db } from "../db";
import { users, sessions } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

export const usersService = {
	async registerUser(userData: any) {
		const { name, email, password } = userData;

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Insert user
		await db.insert(users).values({
			name,
			email,
			password: hashedPassword,
		});

		// Get created user
		const [user] = await db
			.select({
				id: users.id,
				name: users.name,
				email: users.email,
				createdAt: users.createdAt,
			})
			.from(users)
			.where(eq(users.email, email))
			.limit(1);

		return user;
	},

	async loginUser(credentials: any) {
		const { email, password } = credentials;

		// Find user
		const [user] = await db
			.select()
			.from(users)
			.where(eq(users.email, email))
			.limit(1);

		if (!user) {
			return null;
		}

		// Check password
		const isPasswordValid = await bcrypt.compare(password, user.password);

		if (!isPasswordValid) {
			return null;
		}

		// Generate session token
		const token = crypto.randomUUID();

		// Save session
		await db.insert(sessions).values({
			token,
			userId: user.id,
		});

		return token;
	},
};
