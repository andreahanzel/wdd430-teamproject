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
		<div className="fixed top-4 right-4 z-[9999]">
			<AnimatePresence>
			{notifications.map((notification) => (
				<motion.div
				key={notification.id}
				className={`p-4 mb-2 rounded-lg shadow-lg text-white ${
					notification.type === 'success' ? 'bg-green-500' : 
					notification.type === 'error' ? 'bg-red-500' :
					'bg-blue-500'
				}`}
				initial={{ opacity: 0, x: 100 }}
				animate={{ opacity: 1, x: 0 }}
				exit={{ opacity: 0, x: 100 }}
				onClick={() => dismissNotification(notification.id)}
				>
				<div className="flex justify-between items-center">
					<span>{notification.message}</span>
					<button 
					onClick={(e) => {
						e.stopPropagation();
						dismissNotification(notification.id);
					}}
					className="ml-4 text-white hover:text-gray-200"
					title="Dismiss notification"
					>
					<X size={16} />
					</button>
				</div>
				</motion.div>
			))}
			</AnimatePresence>
		</div>
		);
	}
