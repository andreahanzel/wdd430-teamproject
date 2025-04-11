"use client";

import { ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

import clsx from "clsx";

export const buttonVariants = cva(
	"inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
	{
		variants: {
			variant: {
				primary: "bg-backgroundDark hover:bg-backgroundDark/90 text-white drop-shadow-md",
				secondary: "bg-white border border-gray-300 hover:bg-gray-100 text-gray-800",
				login: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md drop-shadow-md",
				register: "bg-[#017A40] hover:bg-[#016237] text-white px-4 py-2 rounded-md drop-shadow-md",
				product: "bg-gray-200 hover:bg-gray-300 text-gray-800",
				seller: "bg-yellow-200 hover:bg-yellow-300 text-gray-800",
			},

			size: {
				default: "h-10 px-4 py-2",
				sm: "h-8 px-3 rounded-md",
				lg: "h-11 px-8 rounded-md",
			},
		},
		defaultVariants: {
			variant: "primary",
			size: "default",
		},
	}
);

export interface ButtonProps
	extends ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	className?: string;
}

export function Button({ className, variant, size, ...props }: ButtonProps) {
	return (
		<button
			className={cn(buttonVariants({ variant, size }), className)}
			{...props}
		/>
	);
}
