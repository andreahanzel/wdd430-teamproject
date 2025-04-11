import { SocialIcon } from "react-social-icons";

const socialLinks = [
  { url: "https://www.facebook.com", label: "Facebook" },
  { url: "https://www.instagram.com", label: "Instagram" },
  { url: "https://www.tiktok.com", label: "TikTok" },
];

export default function SocialLinks() {
  return (
    <div className="flex justify-end items-center space-x-6 mt-4 md:mt-0">
      {socialLinks.map((social) => (
        <SocialIcon
          key={social.url}
          url={social.url}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-70 transition"
          fgColor="#ffffff"
          bgColor="transparent"
          style={{ width: 30, height: 30, pointerEvents: "auto" }}
        />
      ))}
    </div>
  );
}