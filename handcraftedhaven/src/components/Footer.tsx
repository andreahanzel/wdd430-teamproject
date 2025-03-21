import SocialLinks from "./social-links";

export default function Footer() {
  return (
    <footer className="w-full bg-backgroundDark text-white py-8">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
        
        <div className="text-sm whitespace-nowrap">
          <p>© 2025 Handcrafted Haven. All rights reserved.</p>
        </div>

        <SocialLinks />

      </div>
    </footer>
  );
}