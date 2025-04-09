import Image from "next/image";

export const metadata = {
  title: "About Us | HandcraftedHaven",
  description:
    "Discover the story, mission, and people behind HandcraftedHaven — a marketplace celebrating artisan-made, sustainable treasures.",
  openGraph: {
    title: "About Us | HandcraftedHaven",
    description:
      "Explore the passion, creativity, and impact of our artisan community. Learn how HandcraftedHaven is redefining handmade in the modern world.",
    url: "https://yourdomain.com/about",
    siteName: "HandcraftedHaven",
    images: [
      {
        url: "/images/about-og.jpg",
        width: 1200,
        height: 630,
        alt: "About HandcraftedHaven",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function About() {
  return (
    <section id="main-content" className="py-20 bg-gradient-to-br from-backgroundDark via-darkPurple to-black/60 text-white text-center shadow-inner shadow-electricBlue/10">
      <div className="container mx-auto px-4 space-y-20">

        {/* Our Story */}
        <div>
        <h1 className="text-4xl font-bold font-poppins text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] mb-6 relative inline-block">
            Our Story
            <span className="absolute left-0 w-full h-1 bg-gradient-to-r from-electricBlue to-neonPink bottom-[-8px]"></span>
          </h1>
          <p className="text-base text-white/90 max-w-3xl mx-auto leading-relaxed">
            HandcraftedHaven was founded on one single mission: to recognize the artists and artisans who dedicate their heart and soul to each and every piece. What was a simple idea has evolved into an energetic marketplace where art, culture, and imagination interact.
          </p>
        </div>

        {/* Our Mission */}
        <div>
        <h2 className="text-2xl font-bold text-electricBlue mb-4">Our Mission</h2>
          <p className="text-base text-white/90 max-w-3xl mx-auto leading-relaxed">
            We empower small creators by providing a meaningful platform that honors authenticity, sustainability, and beauty. Each hand-made product carries a personal story behind it — and each shopping experience supports real individuals, their passion, and their purpose.
          </p>
        </div>

        {/* Meet the Team */}
        <div>
        <h2 className="text-2xl font-bold text-neonPink drop-shadow-[0_0_10px_rgba(255,0,128,0.4)] mb-10">Meet the Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 place-items-center">

            {/* Team Member - Jane */}
            <div className="flex flex-col items-center space-y-2">
              <Image
                src="/images/team/jane.jpg"
                alt="Jane Doe - Founder"
                width={120}
                height={120}
                className="rounded-full border-4 border-neonPink shadow-lg shadow-neonPink/30 transition-transform duration-300 hover:scale-105"
              />
              <h3 className="text-base font-semibold text-white">Jane Doe</h3>
              <p className="text-sm text-white/85">Founder & Creative Director</p>
            </div>

            {/* Team Member - Leo */}
            <div className="flex flex-col items-center space-y-2">
              <Image
                src="/images/team/leo.jpg"
                alt="Leo Ramirez - Head of Artisan Relations"
                width={120}
                height={120}
                className="rounded-full border-4 border-electricBlue shadow-lg shadow-electricBlue/30 transition-transform duration-300 hover:scale-105"
                />
              <h3 className="text-base font-semibold text-white">Leo Ramirez</h3>
              <p className="text-sm text-white/85">Head of Artisan Relations</p>
            </div>

            {/* Team Member - Priya */}
            <div className="flex flex-col items-center space-y-2">
              <Image
                src="/images/team/priya.jpg"
                alt="Priya Shah - Sustainability Lead"
                width={120}
                height={120}
                className="rounded-full border-4 border-neonPinkDark shadow-lg shadow-neonPinkDark/30 transition-transform duration-300 hover:scale-105"
                />
              <h3 className="text-base font-semibold text-white">Priya Shah</h3>
              <p className="text-sm text-white/85">Sustainability Lead</p>
            </div>

            {/* Team Member - Marcus */}
            <div className="flex flex-col items-center space-y-2">
              <Image
                src="/images/team/marcus.jpg"
                alt="Marcus Lee - Tech & E-Commerce Manager"
                width={120}
                height={120}
                className="rounded-full border-4 border-errorRed shadow-lg shadow-errorRed/30 transition-transform duration-300 hover:scale-105"
                />
              <h3 className="text-base font-semibold text-white">Marcus Lee</h3>
              <p className="text-sm text-white/85">Tech & E-Commerce Manager</p>
            </div>
          </div>
        </div>

        {/* Why Handmade */}
        <div>
        <h2 className="text-2xl font-bold text-electricBlue mb-6">Why Handmade?</h2>
        <p className="text-base text-white/90 max-w-3xl mx-auto leading-relaxed">
            All these handmade items reflect care, culture, and uniqueness. We do believe in complementing slow fashion, ethical production, and the art of making. It's not shopping — it's storytelling.
          </p>
        </div>
      </div>
    </section>
  );
}

  
  