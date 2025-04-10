"use client";

import Link from "next/link";
import Nav from "./nav-links";
import { Button } from "./ui/Button";
import CartButton from "./CartButton";
import { useSession, signOut } from "next-auth/react";
import { useNotification } from "../contexts/NotificationContext";
import { User } from "lucide-react";

export default function Header() {
	const { data: session, status } = useSession();
	const isAuthenticated = status === "authenticated";
	const { showNotification } = useNotification();

	const handleSignOut = async () => {
		await signOut({ callbackUrl: "/" });
		showNotification("You have been signed out successfully", "info");
	};

	return (
			<header className="bg-gradient-to-br from-backgroundDark via-darkPurple to-black text-white py-4 sticky top-0 z-40 shadow-md shadow-neonPink/30 ring-1 ring-white/20">
			<div className="container mx-auto px-4">
				{/* Desktop Layout */}
				<div className="hidden lg:flex lg:items-center lg:justify-between">
					<div className="flex items-center justify-between w-full">
						<Link
							className="text-2xl font-poppins font-bold hover:text-white/90 transition-colors"
							href="/"
						>
							Handcrafted Haven
						</Link>
						<Nav />
					</div>

					<div className="flex items-center space-x-4">
						{/* Only show cart button for authenticated users */}
						{isAuthenticated && <CartButton />}

						{isAuthenticated ? (
							<div className="flex items-center space-x-3">
								<div className="flex items-center bg-black/20 rounded-full px-3 py-1.5">
									<User className="h-4 w-4 mr-2" />
									<span className="text-sm font-medium truncate max-w-[120px]">
										{session.user.name || session.user.email}
									</span>
								</div>
								<Button variant="login" onClick={handleSignOut} size="sm">
									Sign Out
								</Button>
							</div>
						) : (
							<>
								<Link href="/login">
									<Button variant="login" size="sm">
										Login
									</Button>
								</Link>
								<Link href="/register">
									<Button variant="register" size="sm">
										Register
									</Button>
								</Link>
							</>
						)}
					</div>
				</div>

				{/* Mobile Layout */}
				<div className="flex flex-col lg:hidden">
					<div className="flex items-center justify-between mb-4">
						<Link className="text-xl font-poppins font-bold" href="/">
							Handcrafted Haven
						</Link>
						<div className="flex items-center space-x-3">
							{/* Only show cart button for authenticated users */}
							{isAuthenticated && <CartButton />}

							{isAuthenticated ? (
								<Button variant="login" onClick={handleSignOut} size="sm">
									Sign Out
								</Button>
							) : (
								<div className="flex space-x-2">
									<Link href="/login">
										<Button variant="login" size="sm">
											Login
										</Button>
									</Link>
									<Link href="/register">
										<Button variant="register" size="sm">
											Register
										</Button>
									</Link>
								</div>
							)}
						</div>
					</div>

					{isAuthenticated && (
						<div className="bg-white/10 rounded-md p-2 mb-3 flex items-center">
							<User className="h-4 w-4 mr-2" />
							<span className="text-sm">
								Hello, {session.user.name || session.user.email}
							</span>
						</div>
					)}

					<Nav />
				</div>
			</div>
		</header>
	);
}
