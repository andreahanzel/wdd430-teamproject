import type { Metadata } from "next";
import { Inter, Poppins, Fira_Code } from "next/font/google";
import "./css-reset.css";
import "./globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { CartProvider } from "@/contexts/CartContext";
import { SessionProvider } from "@/components/SessionProvider";
import { NotificationProvider } from "../contexts/NotificationContext";

const poppins = Poppins({
	variable: "--font-poppins",
	weight: ["400", "500", "600", "700"],
	subsets: ["latin"],
	display: "swap",
});

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
});

const firaCode = Fira_Code({
	variable: "--font-fira-code",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Handcrafted Haven",
	description: "Discover unique handcrafted goods and support local artisans.",
};

export default function RootLayout({
	children,
	}: Readonly<{
		children: React.ReactNode;
	}>) {
		return (
		<html lang="en" className="scroll-smooth h-full">
		<head>
			{/* Basic favicon */}
			<link rel="icon" href="/favicon.ico" sizes="any" />

			{/* Optional: higher resolution PNG versions */}
			<link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png" />
			<link rel="icon" type="image/png" sizes="256x256" href="/favicon-256x256.png" />
			<link rel="icon" type="image/png" sizes="512x512" href="/favicon-512x512.png" />
			{/* Optional: modern scalable icon for sharp display */}
			<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
		</head>
			<body className={`${inter.variable} ${poppins.variable} ${firaCode.variable} font-sans h-full`}>
			{/* Add this div to isolate notifications from layout transforms */}
			<div id="notification-root" className="fixed inset-0 pointer-events-none z-[9999]">
				{/* NotificationContainer will render here via portal */}
			</div>
			
			<SessionProvider>
				<NotificationProvider>
				<CartProvider>
					<div className="flex flex-col min-h-screen relative"> {/* Added relative */}
					<Header />
					<main className="flex-1">
						<div className="mx-auto w-full max-w-[3000px]">
						{children}
						</div>
					</main>
					<Footer />
					</div>
				</CartProvider>
				</NotificationProvider>
			</SessionProvider>

				{/* Skip to content link for accessibility */}
				<a
					href="#main-content"
					className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-blue-800 focus:shadow-lg"
				>
					Skip to content
				</a>
			</body>
		</html>
	);
}
