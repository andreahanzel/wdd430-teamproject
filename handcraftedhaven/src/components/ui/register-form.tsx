"use client"

import { Button } from "./Button";
import { signup } from "@/app/actions/auth";
import { useActionState } from "react";

export default function RegisterForm() {

    const [state, action, pending] = useActionState(signup, undefined)

    return (
        <form className="w-full max-w-sm space-y-5 p-6 bg-white rounded-xl shadow-md"
        action={action}>
            <h1 className="text-2xl font-semibold text-center">Register</h1>
            <div className="flex-1 space-y-4">
                <div className="border border-gray-200 rounded-lg px-4 py-3">
                    <label htmlFor="name" className="sr-only">Name</label>
                    <input className="w-full bg-transparent outline-none text-sm" id="name" type="text" name="name" placeholder="Name" required />
                    {state?.errors?.name && <p>{state.errors.name}</p>}
                </div>
            </div>
            <div className="flex-1 space-y-4">
                <div className="border border-gray-200 rounded-lg px-4 py-3">
                    <label htmlFor="email" className="sr-only">Email address</label>
                    <input className="w-full bg-transparent outline-none text-sm" id="email" type="email" name="email" placeholder="Email address" required />
                    {state?.errors?.email && <p>{state.errors.email}</p>}
                </div>
                <div className="border border-gray-200 rounded-lg px-4 py-3">
                    <label htmlFor="password" className="sr-only">Password</label>
                    <input className="w-full bg-transparent outline-none text-sm" id="password" type="password" name="password" placeholder="Password" minLength={6} required />
                    {state?.errors?.password && (
                        <div>
                        <p>Password must:</p>
                        <ul>
                            {state.errors.password.map((error) => (
                            <li key={error}>- {error}</li>
                            ))}
                        </ul>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex justify-center">
                <input type="hidden" name="redirectTo"/>
                <Button variant="register" type="submit" disabled={pending}>Register</Button>
            </div>
        </form>
    );
}