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
		<html lang="en">
			<body
				className={`${inter.variable} ${poppins.variable} ${firaCode.variable} font-sans`}
			>
				<SessionProvider>
					<NotificationProvider>
						<CartProvider>
							<Header />

							<main>{children}</main>

							<Footer />
						</CartProvider>
					</NotificationProvider>
				</SessionProvider>
			</body>
		</html>
	);
}
