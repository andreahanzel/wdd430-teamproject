'use client';

import { useNotification } from "@/contexts/NotificationContext";

export default function NotificationTestPage() {
    const { showNotification } = useNotification();
    
    return (
        <div className="min-h-screen bg-gray-100 p-8">
        <h1 className="text-2xl font-bold mb-6">Notification Test</h1>
        
        <div className="space-y-4">
            <button
            onClick={() => showNotification("Test success message!", "success")}
            className="px-4 py-2 bg-green-500 text-white rounded"
            >
            Show Success Notification
            </button>

            <button
            onClick={() => showNotification("Test error message!", "error")}
            className="px-4 py-2 bg-red-500 text-white rounded"
            >
            Show Error Notification
            </button>

            <button
            onClick={() => {
                showNotification("First message", "info");
                setTimeout(() => showNotification("Delayed message", "warning"), 1000);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded"
            >
            Test Multiple Notifications
            </button>
        </div>
        </div>
    );
}