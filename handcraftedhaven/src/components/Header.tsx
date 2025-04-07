import Link from "next/link";
import Nav from "./nav-links";
import { Button } from "./ui/Button";
import CartButton from "./CartButton";

export default function Header() {
    return (
        <header className="bg-backgroundDark text-white py-4">
            <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center lg:justify-between space-y-4 lg:space-y-0">
                
                <div className="text-2xl font-poppins font-bold">Handcrafted Haven</div>
                
                <Nav />

                <div className="flex items-center space-x-4">
                    <CartButton />
                    <Link href="/login" >
                        <Button variant="login">Login</Button>
                    </Link>
                    <Link href="/register" >
                        <Button variant="register">Register</Button>
                    </Link>
                </div>
            </div>
        </header>
    );
}