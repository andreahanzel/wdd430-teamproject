'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Check, AlertCircle } from 'lucide-react';


export default function NewsletterSubscribe() {
    const [email, setEmail] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [subscribedEmails, setSubscribedEmails] = useState<string[]>([]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Basic email validation
        if (!email.includes('@') || !email.includes('.')) {
        setError('Please enter a valid email');
        return;
        }


        // Check if already subscribed
        if (subscribedEmails.includes(email)) {
        setError('You\'re already subscribed!');
        return;
        }


        setIsLoading(true);

        try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Add to subscribed emails
        setSubscribedEmails(prev => [...prev, email]);
        setIsSubscribed(true);
        setEmail('');

        // Reset after 3 seconds
        setTimeout(() => setIsSubscribed(false), 3000);
        } catch (err) {
        setError('Subscription failed. Please try again.');
        } finally {
        setIsLoading(false);
        }
    };


    return (
        <div className="relative w-full max-w-md">
        <AnimatePresence mode="wait">
            {isSubscribed ? (
            <motion.div
                key="success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 text-green-400 font-medium"
            >
                <Check className="w-5 h-5" />
                Subscribed successfully!
            </motion.div>
            ) : (
            <motion.div
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
            >
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
            {/* Remove one of the labeling methods - keeping just htmlFor/id pairing */}
            <label htmlFor="newsletter-email" className="sr-only">
                Email address
            </label>
            <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300" />
                <input
                id="newsletter-email"  // Changed to unique ID
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                required
                className="pl-10 pr-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 focus:border-neonPink focus:ring-1 focus:ring-neonPink outline-none transition-all w-full"
                />
            </div>
            </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2 bg-gradient-to-r from-neonPink to-electricBlue text-white rounded-full hover:shadow-lg hover:shadow-neonPink/30 transition-all disabled:opacity-70 whitespace-nowrap"
                >
                    {isLoading ? 'Subscribing...' : 'Subscribe'}
                </button>
                </form>

                {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-red-400 text-sm"
                >
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </motion.div>
                )}
            </motion.div>
            )}
        </AnimatePresence>
        </div>
    );
}
