"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { HomeIcon, List, ShoppingBag, InfoIcon } from "lucide-react";

const links = [
  { name: "Home", href: "/home", icon: HomeIcon },
  { name: "Products", href: "/products", icon: ShoppingBag },
  { name: "Sellers", href: "/sellers", icon: List },
  { name: "About", href: "/about", icon: InfoIcon },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="flex w-full justify-between p-3 rounded-lg md:justify-center md:space-x-16">
    {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link 
            key={link.name}
            href={link.href}
            className={clsx(
              "flex items-center gap-2 p-3 text-white rounded-lg hover:bg-electricBlue",
              {
                "bg-electricBlue": pathname === link.href, // highlight active link later
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
