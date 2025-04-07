import bcryptjs from "bcryptjs";
import { sql } from "@/lib/db";
import { User } from "@/models/User";

// find user by email
export async function findUserByEmail(email: string) {
    const result = await sql`SELECT * FROM users WHERE email = ${email}`;
    return result[0];
}

// create user
export async function createUser(name: string, email: string, password: string): Promise<User>  {
    const hashedPassword = await bcryptjs.hash(password, 10);
    const result = await sql<User[]>`
        INSERT INTO users (name, email, password)
        VALUES (${name}, ${email}, ${hashedPassword})
        RETURNING id, name, email, password
    `;
    return result[0];
}

// validate password
export async function validatePassword(plain: string, hashed: string) {
    return await bcryptjs.compare(plain, hashed);
}