import postgres from "postgres";

export const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

// fecth all the products from the database
export async function getProducts() {
    const products = await sql`
        SELECT * FROM products
    `;
    return products;
}

// fetch all users from the database
export async function getUsers() {
    const users = await sql`
        SELECT * FROM users
    `;
    return users;   
}