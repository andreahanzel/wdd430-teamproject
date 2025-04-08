import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { SessionPayload } from "./definitions";
import { cookies } from "next/headers";

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

/* This function is used to encrypt the session token
and create a JSON Web Token (JWT) with the user ID and expiration time.
The JWT is signed with the secret key and can be verified
to ensure its authenticity. The payload contains the user ID and expiration time. */
export async function encrypt(payload: SessionPayload) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(encodedKey);
}

/* This function is used to decrypt the session token
and retrieve the payload. It is called when the user makes a request
to the server and the session token is included in the request headers.
The payload contains the user ID and the expiration time of the session. */
export async function decrypt(session: string | undefined = ""): Promise<SessionPayload | undefined> {
    try {
        const { payload } = await jwtVerify(session, encodedKey, {
            algorithms: ["HS256"],
        })
        return payload as SessionPayload;
    } catch (error) {
        console.error("Session decryption error:", error);
    }
}

/* This function is used to create a session for the user
after they log in or register. It sets a cookie with the session
information, which is used to authenticate the user on subsequent requests.
The session is valid for 7 days, after which the user will need to log in again. */
export async function createSession(userId: number) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const session = await encrypt({ userId, expiresAt });
    const cookieStore = await cookies();

    cookieStore.set("session", session, {
        httpOnly: true,
        secure: true, 
        expires: expiresAt,
        sameSite: "lax",
        path: "/",
    })
}

/* This function is used to delete the session cookie
when the user logs out. It removes the session information
from the client's browser, effectively logging the user out. */
export async function deleteSession() {
    const cookieStore = await cookies();
    cookieStore.delete("session")
}