import { db } from "../src/db";
import { users, sessions } from "../src/db/schema";

export async function clearDatabase() {
	// Delete sessions first due to foreign key constraints if applicable
	// (Though in our schema userId is int not formally bigint with FK in some versions,
	// but we should still follow order)
	await db.delete(sessions);
	await db.delete(users);
}
