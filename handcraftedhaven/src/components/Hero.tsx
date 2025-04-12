"use client";

import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "./ui/Button";

export default function Hero() {
  return (
    <section className="relative text-white py-24 overflow-hidden shadow-lg shadow-neonPink/20">
      
      {/* Background blobs */}
      <div className="absolute inset-0 -z-20 top-[-50px]">
        <Image
          src="/images/hero/asset2.png"
          alt="Purple abstract background"
          fill
          className="object-cover object-center opacity-60"
          priority
        />
      </div>

      {/* Foreground 3D loop */}
      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-10 md:translate-x-0 z-0 opacity-70 animate-float">
        <Image
          src="/images/hero/asset1.png"
          alt="Colorful 3D Loop Element"
          width={500}
          height={500}
          className="w-[300px] md:w-[500px] h-auto pointer-events-none select-none"
        />
      </div>

      {/* Soft pink glow behind text */}
      <div className="absolute left-[-10%] top-[25%] w-[400px] h-[300px] bg-neonPink/20 rounded-full blur-3xl z-0" />

      {/* Sparkles */}
      <div className="absolute top-12 left-1/3 w-2 h-2 bg-white/30 rounded-full blur-sm animate-pulse z-0" />
      <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-electricBlue/30 rounded-full blur-[1px] animate-ping z-0" />
      <div className="absolute bottom-10 left-[15%] w-2 h-2 bg-white/20 rounded-full blur-md animate-ping z-0" />

      {/* Text content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-poppins font-bold mb-4">
            Discover Unique{" "}
            <span className="text-neonPinkDark">Handcrafted</span> Treasures
          </h1>
          <p className="text-lg mb-8">
            Support artisans and find one-of-a-kind items made with passion and skill.
          </p>

          <div className="flex space-x-4">
            <Link
              href="/products"
              className={buttonVariants({ variant: "primary" })}
            >
              Explore Products
            </Link>
            <Link
              href="/sellers"
              className={buttonVariants({ variant: "secondary" })}
            >
              Meet Artisans
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
        <span className="text-white text-sm animate-bounce opacity-60">Scroll ↓</span>
      </div>
    </section>
  );
}
