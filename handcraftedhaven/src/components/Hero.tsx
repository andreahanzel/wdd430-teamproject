import { Button } from './ui/Button';
import Link from 'next/link';

export default function Hero() {
    return (
        <section className="bg-backgroundDark text-white py-20">
        <div className="container mx-auto px-4">
            
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-poppins font-bold mb-4">
              Discover Unique <span className="text-neonPinkDark">Handcrafted</span> Treasures
            </h1>
            <p className="text-lg mb-8">
              Support artisans and find one-of-a-kind items made with passion and skill.
            </p>

            <div className="flex space-x-4">
              <Link href="/products">
                <Button variant="primary">Explore Products</Button></Link>
              <Link href="/sellers">
                <Button variant="secondary">Meet Artisans</Button></Link>
            </div>

          </div>
        </div>
      </section>
    )
}