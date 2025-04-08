import type { Metadata } from "next";
import { Inter, Poppins, Fira_Code } from "next/font/google";
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
		<html lang="en" className="scroll-smooth">
			<body
				className={`${inter.variable} ${poppins.variable} ${firaCode.variable} font-sans min-h-screen flex flex-col bg-gray-50`}
			>
				<SessionProvider>
					<NotificationProvider>
						<CartProvider>
							<div className="flex flex-col min-h-screen">
								<Header />
								
								<main className="flex-grow">
									<div className="mx-auto w-full max-w-[2000px]">
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
					className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-blue-600 focus:shadow-lg"
				>
					Skip to content
				</a>
			</body>
		</html>
	);
}
