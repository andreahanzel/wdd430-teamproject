"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function CartButton() {
  const { cartCount } = useCart();
  const [isClient, setIsClient] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [prevCount, setPrevCount] = useState(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Don't animate on initial render
    if (isClient && prevCount !== cartCount) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      setPrevCount(cartCount);
      return () => clearTimeout(timer);
    }
  }, [cartCount, isClient, prevCount]);

  if (!isClient) {
    return (
      <div className="relative p-2 text-white hover:text-neonPink transition-colors">
        <ShoppingBag size={24} />
      </div>
    );
  }

  return (
    <Link href="/cart" className="relative p-2 text-white hover:text-neonPink transition-colors">
        <ShoppingBag size={24} />
        <AnimatePresence>
          {cartCount > 0 && (
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ 
                scale: isAnimating ? [1, 1.2, 1] : 1, 
                opacity: 1 
              }}
              transition={{ 
                duration: isAnimating ? 0.5 : 0.2,
                ease: "easeOut" 
              }}
              className="absolute -top-1 -right-1 bg-neonPink text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
            >
              {cartCount}
            </motion.div>
          )}
        </AnimatePresence>
    </Link>
  );
}