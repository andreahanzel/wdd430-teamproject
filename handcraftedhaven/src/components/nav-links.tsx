"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { HomeIcon, Store, ShoppingBag, InfoIcon, LayoutDashboard } from "lucide-react";
import { useSession } from "next-auth/react";

export default function Nav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isSeller = session?.user?.role === "SELLER";
  const isCustomer = session?.user?.role === "CUSTOMER";
  const isAuthenticated = !!session;

  // Base links that are always shown
  const baseLinks = [
    { name: "Home", href: "/", icon: HomeIcon },
    { name: "Products", href: "/products", icon: ShoppingBag },
    { name: "Sellers", href: "/sellers", icon: Store },
    { name: "About", href: "/about", icon: InfoIcon },
  ];

  // Add dashboard links based on user role
  let links = [...baseLinks];
  
  if (isAuthenticated) {
    if (isSeller) {
      links.push({ name: "Dashboard", href: "/dashboard/seller", icon: LayoutDashboard });
    } else if (isCustomer) {
      links.push({ name: "Dashboard", href: "/dashboard/customer", icon: LayoutDashboard });
    }
  }

  return (
    <nav className="flex w-full justify-between p-3 rounded-lg md:justify-center md:space-x-16">
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link 
            key={link.name}
            href={link.href}
            className={clsx(
              "flex items-center gap-2 p-3 text-white font-medium rounded-lg hover:bg-electricBlue/80 transition-colors",
              {
                "bg-electricBlue": pathname === link.href,
                // Special styling for Dashboard link
                "bg-indigo-700 hover:bg-indigo-800": link.name === "Dashboard" && pathname !== link.href,
                "bg-indigo-800": link.name === "Dashboard" && pathname === link.href,
              }
            )}
          >
            <LinkIcon className="w-6 h-6 md:hidden text-white" />
            <p className="hidden md:block text-sm font-medium drop-shadow-md">{link.name}</p>
          </Link>
        );
      })}
    </nav>
  );
}