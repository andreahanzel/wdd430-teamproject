"use client";


import { Button } from "./Button";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState, FormEvent, useEffect } from "react";
import { useNotification } from "../../contexts/NotificationContext";
import { User, Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";




export default function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/";
    const registered = searchParams.get("registered");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { showNotification } = useNotification();
    const [showPassword, setShowPassword] = useState(false);


    // Show success message if redirected from registration
    useEffect(() => {
        const param = new URLSearchParams(window.location.search).get("registered");
        if (param === "true") {
            showNotification(
                "Registration successful! Please log in with your new account.",
                "success"
            );
        }
    }, []); // only run once on first render



    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setError(null);


        const formData = new FormData(event.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;


        try {
            const result = await signIn("credentials", {
                redirect: false,
                email,
                password,
            });


            if (result?.error) {
                // Format the error message
                const errorMessage = result.error.includes("No account found")
                    ? "No account found with this email address. Please register first."
                    : result.error.includes("Incorrect password")
                    ? "Incorrect password. Please try again."
                    : "Login failed. Please check your credentials.";


                setError(errorMessage);
                showNotification(errorMessage, "error");
                setIsLoading(false);
                return;
            }


            showNotification("Login successful! Welcome back.", "success");
            router.push(callbackUrl);
            router.refresh();
        } catch (error) {
            setError("An error occurred during login. Please try again.");
            showNotification(
                "An error occurred during login. Please try again.",
                "error"
            );
            setIsLoading(false);
        }
    }


    return (
        <form onSubmit={handleSubmit} className="space-y-6 text-white">
            <h2 className="text-2xl font-bold mb-2 text-white text-center">Sign in to your account</h2>
            <p className="text-pink-100 mb-6 text-sm text-center">Welcome back! Enter your credentials.</p>
    
            {error && (
                <div className="bg-pink-600/40 border border-pink-300 text-white p-4 rounded-lg flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 mt-0.5" />
                    <div>
                        <p className="font-medium">Login Error</p>
                        <p>{error}</p>
                        {error.includes("No account found") && (
                            <p className="mt-1 text-sm">
                                New user?{" "}
                                <Link href="/register" className="text-white underline hover:text-pink-200">
                                    Create an account
                                </Link>
                            </p>
                        )}
                    </div>
                </div>
            )}
    
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-pink-200 mb-1">
                    Email address
                </label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-300" />
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        className="ios-input w-full pl-10 pr-3 py-2 bg-indigo-900/40 border border-white/30 rounded-lg text-white placeholder-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition duration-300"
                    />
                </div>
            </div>
    
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-pink-200 mb-1">
                    Password
                </label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-300" />
                    <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        minLength={6}
                        className="ios-input w-full pl-10 pr-10 py-2 bg-indigo-900/40 border border-white/30 rounded-lg text-white placeholder-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition duration-300"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-300 hover:text-pink-200 transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        aria-controls="password"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
            </div>
    
            <div className="flex justify-end text-sm">
                <Link href="#" className="text-pink-200 hover:text-white transition">
                    Forgot password?
                </Link>
            </div>
    
            <Button
                variant="primary"
                type="submit"
                disabled={isLoading}
                className="w-full bg-pink-600 hover:bg-pink-500 text-white py-2.5 rounded-lg shadow-md transition duration-300 transform hover:scale-105"
            >
                {isLoading ? "Signing in..." : "Sign In"}
            </Button>
    
            <div className="relative flex py-3 items-center">
                <div className="flex-grow border-t border-white/20" />
                <span className="mx-3 text-white/60 text-sm">or</span>
                <div className="flex-grow border-t border-white/20" />
            </div>
    
            <div className="text-center">
                <p className="text-pink-100 mb-4 text-sm">Don't have an account?</p>
                <Link href="/register" className="w-full inline-block">
                    <span className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-lg shadow-md transition duration-300 transform hover:scale-105 flex items-center justify-center">
                        Create Account
                    </span>
                </Link>
            </div>
        </form>
    );
}
