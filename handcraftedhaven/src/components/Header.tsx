"use client";

import Link from "next/link";
import Image from "next/image";
import Nav from "./nav-links";
import { Button } from "./ui/Button";
import CartButton from "./CartButton";
import { useSession, signOut } from "next-auth/react";
import { useNotification } from "../contexts/NotificationContext";
import { User } from "lucide-react";
import { buttonVariants } from "./ui/Button";

export default function Header() {
	const { data: session, status } = useSession();
	const isAuthenticated = status === "authenticated";
	const { showNotification } = useNotification();

	const handleSignOut = () => {
		showNotification("You have been signed out successfully", "info");
	
		// Delay redirect to allow the notification to show
		setTimeout(() => {
		signOut({ callbackUrl: "/" });
		}, 1500); // 1.5 second delay
	};  

	return (
		<header className="bg-gradient-to-br from-backgroundDark via-darkPurple to-black text-white py-4 sticky top-0 z-40 shadow-md shadow-neonPink/30 ring-1 ring-white/20">
		<div className="container mx-auto px-4">
			{/* Desktop Layout */}
			<div className="hidden lg:flex lg:items-center lg:justify-between">
			<div className="flex items-center justify-between w-full">
				<Link href="/" className="flex items-center gap-4 group">
				<Image
					src="/images/logo/haven.png"
					alt="Handcrafted Haven Logo"
					width={60}  
					height={60} 
					className="h-20 w-auto transition-transform group-hover:scale-105" // Increased from h-10
					priority
				/>
				<div className="flex flex-col">
					<span className="text-2xl font-poppins font-bold hover:text-white/90 transition-colors leading-tight">
					Handcrafted Haven
					</span>
				</div>
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
					<Link href="/login" className={buttonVariants({ variant: "login", size: "sm" })}>
					Login
					</Link>
					<Link href="/register" className={buttonVariants({ variant: "register", size: "sm" })}>
					Register
					</Link>
				</>
				)}
			</div>
			</div>

			{/* Mobile Layout */}
			<div className="flex flex-col lg:hidden">
			<div className="flex items-center justify-between mb-4">
				<Link href="/" className="flex items-center gap-3">
				<Image
					src="/images/logo/haven.png"
					alt="Handcrafted Haven Logo"
					width={48}  // Increased from 32
					height={48} // Increased from 32
					className="h-12 w-auto" // Increased from h-8
					priority
				/>
				<div className="flex flex-col">
					<span className="text-xl font-poppins font-bold leading-tight">
					Handcrafted
					</span>
					<span className="text-lg font-poppins text-neonPink font-medium leading-tight">
					Discover Unique
					</span>
				</div>
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
					<Link href="/login" className={buttonVariants({ variant: "login", size: "sm" })}>
						Login
					</Link>
					<Link href="/register" className={buttonVariants({ variant: "register", size: "sm" })}>
						Register
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