"use client";

import dynamic from 'next/dynamic';

const DynamicCheckoutPage = dynamic(() => import('@/components/Checkout'), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-700 flex items-center justify-center">
      <div className="w-16 h-16 border-t-4 border-white rounded-full animate-spin"></div>
    </div>
  )
});

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-700 text-white">
      <div className="pt-16">
        <DynamicCheckoutPage />
      </div>
    </div>
  );
}