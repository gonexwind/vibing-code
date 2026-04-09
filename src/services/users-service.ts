import { db } from "../db";
import { users, sessions } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

export const usersService = {
	/**
	 * Registers a new user in the system.
	 * Hashes the provided password for security before persisting to the database.
	 * Returns the newly created user profile (excluding the password).
	 *
	 * @param userData The user payload (name, email, password)
	 * @returns The created user object
	 */
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

	/**
	 * Authenticates user credentials to establish a new session.
	 * Verifies the password against the stored hash and generates a UUID Bearer token.
	 *
	 * @param credentials User email and plaintext password
	 * @returns A unique session token string if successful, or null on failure
	 */
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

	/**
	 * Retrieves the public profile of the currently authenticated user.
	 * Internally uses the provided session token to map to the associated user record.
	 *
	 * @param token The active Bearer session token
	 * @returns The user's profile data (excluding password) if token is valid, else null
	 */
	async getUserProfile(token: string) {
		return await this.findUserByToken(token);
	},

	/**
	 * Terminates an active user session.
	 * Invalidates the specified token by removing its entry from the database.
	 *
	 * @param token The active Bearer session token to invalidate
	 * @returns The profile of the user that was logged out, or null if the token was invalid
	 */
	async logoutUser(token: string) {
		const userProfile = await this.findUserByToken(token);

		if (!userProfile) {
			return null;
		}

		// Delete the session
		await db.delete(sessions).where(eq(sessions.token, token));

		return userProfile;
	},

	/**
	 * Helper function to securely fetch a user based on an active session token.
	 * Uses an optimized database JOIN query to retrieve the user securely.
	 * Explicitly strips out sensitive data (like the password hash) before returning.
	 *
	 * @param token The session token to lookup
	 * @returns A safe user object if found and active, else null
	 */
	async findUserByToken(token: string) {
		// Use innerJoin to fetch session and user in one query
		const [result] = await db
			.select()
			.from(sessions)
			.innerJoin(users, eq(sessions.userId, users.id))
			.where(eq(sessions.token, token))
			.limit(1);

		if (!result) {
			return null;
		}

		// Exclude password from the returned user object
		const { password: _, ...userWithoutPassword } = result.users;
		return userWithoutPassword;
	},
};
