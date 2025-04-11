"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

type NotificationType = "success" | "error" | "info" | "warning";

interface Notification {
	id: string;
	type: NotificationType;
	message: string;
}

interface NotificationContextType {
	notifications: Notification[];
	showNotification: (message: string, type: NotificationType) => void;
	dismissNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
	undefined
);

export const useNotification = () => {
	const context = useContext(NotificationContext);
	if (context === undefined) {
		throw new Error(
			"useNotification must be used within a NotificationProvider"
		);
	}
	return context;
};

export function NotificationProvider({ children }: { children: ReactNode }) {
	const [notifications, setNotifications] = useState<Notification[]>([]);

	const showNotification = (message: string, type: NotificationType) => {
		const id = Math.random().toString(36).substring(2, 9);
		setNotifications((prev) => [...prev, { id, type, message }]);

		// Auto dismiss after 5 seconds
		setTimeout(() => {
			dismissNotification(id);
		}, 10000);
	};

	const dismissNotification = (id: string) => {
		setNotifications((prev) =>
			prev.filter((notification) => notification.id !== id)
		);
	};

	return (
		<NotificationContext.Provider
			value={{ notifications, showNotification, dismissNotification }}
		>
			{children}
			<NotificationContainer
				notifications={notifications}
				dismissNotification={dismissNotification}
			/>
		</NotificationContext.Provider>
	);
}

function NotificationContainer({
	notifications,
	dismissNotification,
}: {
	notifications: Notification[];
	dismissNotification: (id: string) => void;
}) {
	return (
		<div className="fixed top-24 right-6 z-50 flex flex-col gap-4 w-full max-w-md">
			<AnimatePresence>
				{notifications.map((notification) => (
					<motion.div
						key={notification.id}
						initial={{ opacity: 0, x: 50 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: 50 }}
						transition={{ duration: 0.3 }}
						className={`rounded-xl p-4 flex items-start justify-between border backdrop-blur-lg shadow-lg
							${
							notification.type === 'success'
								? 'bg-green-500/20 text-green-200 border-green-400/20'
								: notification.type === 'error'
								? 'bg-red-500/20 text-red-200 border-red-400/20'
								: notification.type === 'warning'
								? 'bg-yellow-400/20 text-yellow-200 border-yellow-400/20'
								: 'bg-blue-500/20 text-blue-200 border-blue-400/20'
							}`}
					>
						<div className="flex-1">{notification.message}</div>
						<button
							onClick={() => dismissNotification(notification.id)}
							className="ml-2 focus:outline-none"
							aria-label="Dismiss notification"
						>
							<X size={16} />
						</button>
					</motion.div>
				))}
			</AnimatePresence>
		</div>
	);
}
