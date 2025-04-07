"use client";

import Link from "next/link";
import Nav from "./nav-links";
import { Button } from "./ui/Button";
import CartButton from "./CartButton";
import { useSession, signOut } from "next-auth/react";
import { useNotification } from "../contexts/NotificationContext";

export default function Header() {
	const { data: session, status } = useSession();
	const isAuthenticated = status === "authenticated";
	const { showNotification } = useNotification();

	const handleSignOut = async () => {
		await signOut({ callbackUrl: "/" });
		showNotification("You have been signed out successfully", "info");
	};

	return (
		<header className="bg-backgroundDark text-white py-4">
			<div className="container mx-auto px-4 flex flex-col lg:flex-row items-center lg:justify-between space-y-4 lg:space-y-0">
				<Link className="text-2xl font-poppins font-bold" href="/">
					Handcrafted Haven
				</Link>

				<Nav />

				<div className="flex items-center space-x-4">
					<CartButton />

					{isAuthenticated ? (
						<div className="flex items-center space-x-4">
							<span className="text-sm">
								Hello, {session.user.name || session.user.email}
							</span>
							<Button variant="login" onClick={handleSignOut}>
								Sign Out
							</Button>
						</div>
					) : (
						<>
							<Link href="/login">
								<Button variant="login">Login</Button>
							</Link>
							<Link href="/register">
								<Button variant="register">Register</Button>
							</Link>
						</>
					)}
				</div>
			</div>
		</header>
	);
}
