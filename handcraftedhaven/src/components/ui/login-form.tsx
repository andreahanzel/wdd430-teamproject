"use client"

import { Button } from "./Button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { login } from "@/app/actions/auth";

export default function LoginForm() {

    const [state, action, pending] = useActionState(login, undefined);
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';

    return (
        <form className="w-full max-w-sm space-y-5 p-6 bg-white rounded-xl shadow-md"
        action={action}>
            <h1 className="text-2xl font-semibold text-center">Log In</h1>
            <div className="flex-1 space-y-4">
                <div className="border border-gray-200 rounded-lg px-4 py-3">
                    <input className="w-full bg-transparent outline-none text-sm" id="email" type="email" name="email" placeholder="Email address" required />
                </div>
                <div className="border border-gray-200 rounded-lg px-4 py-3">
                    <input className="w-full bg-transparent outline-none text-sm" id="password" type="password" name="password" placeholder="Password" minLength={6} required />
                </div>
            </div>
            <div className="flex justify-center">
                <input type="hidden" name="redirectTo" value={callbackUrl} />
                <Button variant="login" type="submit" disabled={pending}>Log In</Button>
            </div>

            <div className="flex justify-center">
                {state ?.errors?.email && (
                <p className="text-sm text-red-500">{state.errors.email[0]}</p>
                )}
                {state?.errors?.password && (
                <p className="text-sm text-red-500">{state.errors.password[0]}</p>
                )}
            </div>
            
            <hr className="border-t border-gray-200" />

            <div className="text-center">
                    <p className="text-sm mb-3">Not a member yet?</p>
                <Link href="/register">
                    <Button variant="register">Register</Button></Link>
            </div>
        </form>
    );
}