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

  // Base links that are always shown
  const baseLinks = [
    { name: "Home", href: "/", icon: HomeIcon },
    { name: "Products", href: "/products", icon: ShoppingBag },
    { name: "Sellers", href: "/sellers", icon: Store },
    { name: "About", href: "/about", icon: InfoIcon },
  ];

  // Conditionally add dashboard link for sellers
  const links = isSeller 
    ? [...baseLinks, { name: "Dashboard", href: "/dashboard/seller", icon: LayoutDashboard }]
    : baseLinks;

  return (
    <nav className="flex w-full justify-between p-3 rounded-lg md:justify-center md:space-x-16">
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link 
            key={link.name}
            href={link.href}
            className={clsx(
              "flex items-center gap-2 p-3 text-white rounded-lg hover:bg-electricBlue transition-colors",
              {
                "bg-electricBlue": pathname === link.href,
                // Special styling for Dashboard link
                "bg-indigo-600 hover:bg-indigo-700": link.name === "Dashboard" && pathname !== link.href,
                "bg-indigo-700": link.name === "Dashboard" && pathname === link.href,
              }
            )}
          >
            <LinkIcon className="w-6 h-6 md:hidden text-white" />
            <p className="hidden md:block text-sm font-medium">{link.name}</p>
          </Link>
        );
      })}
    </nav>
  );
}