import clsx from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant: "login" | "register" | "primary" | "secondary" | "product" | "seller";
}

export function Button({ children, variant, className, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      className={clsx(
        "px-4 py-2 rounded-md font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-all duration-200",
        {
          // LOGIN: outlined with hover fill
          "bg-neonPinkDark border-electricBlue text-white hover:bg-electricBlue hover:text-white focus-visible:ring-electricBlue":
            variant === "login",

          // REGISTER: strong background, good hover contrast
          "bg-neonPinkDark text-white hover:bg-electricBlue focus-visible:ring-neonPinkDark":
            variant === "register",

          // PRIMARY: solid electric blue
          "bg-electricBlue text-white hover:bg-neonPinkDark focus-visible:ring-electricBlue":
            variant === "primary",

          // SECONDARY: dark with accent border
          "bg-backgroundDark border border-neonPink text-white hover:bg-neonPinkDark focus-visible:ring-neonPinkDark":
            variant === "secondary",

          // PRODUCT: outlined style, ensure hover contrast
          "w-full border border-electricBlue text-electricBlue hover:bg-electricBlue hover:text-white focus-visible:ring-electricBlue":
            variant === "product",

          // SELLER: pink accent but high contrast hover
          "w-full border border-neonPinkDark text-neonPinkDark hover:bg-neonPinkDark hover:text-white focus-visible:ring-neonPinkDark":
            variant === "seller",
        },
        className
      )}
    >
      {children}
    </button>
  );
}
