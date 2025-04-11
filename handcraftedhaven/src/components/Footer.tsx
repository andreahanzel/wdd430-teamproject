import SocialLinks from "./social-links";
import NewsletterSubscribe from "./NewsletterSubscribe";

export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-t from-backgroundDark via-darkPurple to-black text-white py-12 shadow-inner shadow-neonPink/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          
          {/* Copyright */}
          <div className="text-sm">
            <p className="drop-shadow-md">© 2025 Handcrafted Haven. All rights reserved.</p>
          </div>
          
          {/* Newsletter Subscription */}
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-medium mb-3 text-center">
              Get the latest updates
            </h3>
            <NewsletterSubscribe />
          </div>
          
          {/* Social Links */}
          <div className="flex justify-center md:justify-end">
            <SocialLinks />
          </div>
          
        </div>
        
        {/* Optional divider */}
        <div className="border-t border-white/10 mt-8 pt-8 text-center text-xs text-white/60">
          <p>Handmade with love for unique creations</p>
        </div>
      </div>
    </footer>
  );
}