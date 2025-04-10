"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import {
	ArrowLeft,
	CheckCircle,
	CreditCard,
	ShoppingBag,
	Truck,
	AlertCircle,
	} from "lucide-react";
	import styles from "./Checkout.module.css";

	// Define types for our form data and errors
	interface FormData {
	email: string;
	firstName: string;
	lastName: string;
	address: string;
	city: string;
	state: string;
	zipCode: string;
	phone: string;
	saveInfo: boolean;
	shippingMethod: "standard" | "express" | "overnight";
	paymentMethod: "credit" | "paypal";
	cardName: string;
	cardNumber: string;
	cardExpiry: string;
	cardCvc: string;
	}

	interface FormErrors {
	email?: string;
	firstName?: string;
	lastName?: string;
	address?: string;
	city?: string;
	state?: string;
	zipCode?: string;
	cardName?: string;
	cardNumber?: string;
	cardExpiry?: string;
	cardCvc?: string;
	}

	const steps = ["Cart", "Information", "Shipping", "Payment"];

	export default function Checkout() {
	const router = useRouter();
	const { cartItems, cartTotal, clearCart, isLoading } = useCart();
	const [currentStep, setCurrentStep] = useState<number>(1);
	const [formData, setFormData] = useState<FormData>({
		email: "",
		firstName: "",
		lastName: "",
		address: "",
		city: "",
		state: "",
		zipCode: "",
		phone: "",
		saveInfo: false,
		shippingMethod: "standard",
		paymentMethod: "credit",
		cardName: "",
		cardNumber: "",
		cardExpiry: "",
		cardCvc: "",
	});
	const [errors, setErrors] = useState<FormErrors>({});
	const [orderComplete, setOrderComplete] = useState<boolean>(false);
	const [orderNumber, setOrderNumber] = useState<string>("");
	const [isClient, setIsClient] = useState<boolean>(false);
	const [shouldRedirect, setShouldRedirect] = useState<boolean>(false);

	// First useEffect - Client-side initialization
	useEffect(() => {
		setIsClient(true);
		// Generate random order number
		setOrderNumber(`HCH-${Math.floor(100000 + Math.random() * 900000)}`);
		
		// Check if cart is empty (only after client-side hydration)
		if (cartItems.length === 0 && !orderComplete) {
		setShouldRedirect(true);
		}
	}, [cartItems.length, orderComplete]);

	// Second useEffect - Handle redirects
	useEffect(() => {
		if (isClient && shouldRedirect) {
		router.push("/cart");
		}
	}, [isClient, shouldRedirect, router]);

	// Early return but after all hooks are called
	if (!isClient) {
		return null;
	}

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value, type } = e.target as HTMLInputElement;

		setFormData({
		...formData,
		[name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
		});

		// Clear error for this field when user types
		if (errors[name as keyof FormErrors]) {
		setErrors({
			...errors,
			[name]: undefined,
		});
		}
	};

	const validateForm = (): boolean => {
		const newErrors: FormErrors = {};

		if (currentStep === 1) {
		if (!formData.email) newErrors.email = "Email is required";
		if (!formData.firstName) newErrors.firstName = "First name is required";
		if (!formData.lastName) newErrors.lastName = "Last name is required";
		if (!formData.address) newErrors.address = "Address is required";
		if (!formData.city) newErrors.city = "City is required";
		if (!formData.state) newErrors.state = "State is required";
		if (!formData.zipCode) newErrors.zipCode = "ZIP code is required";
		} else if (currentStep === 3) {
		if (formData.paymentMethod === "credit") {
			if (!formData.cardName)
			newErrors.cardName = "Cardholder name is required";
			if (!formData.cardNumber)
			newErrors.cardNumber = "Card number is required";
			if (!formData.cardExpiry)
			newErrors.cardExpiry = "Expiration date is required";
			if (!formData.cardCvc) newErrors.cardCvc = "CVC is required";
		}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleNext = () => {
		if (validateForm()) {
		if (currentStep < steps.length) {
			setCurrentStep(currentStep + 1);
		} else {
			// Handle order completion
			completeOrder();
		}
		}
	};

	const handleBack = () => {
		if (currentStep > 1) {
		setCurrentStep(currentStep - 1);
		} else {
		router.push("/cart");
		}
	};

	const completeOrder = async () => {
		try {
		// Generate a random order number if not set
		const generatedOrderNumber = `HCH-${Math.floor(
			100000 + Math.random() * 900000
		)}`;

		// Calculate total with shipping and tax
		const shippingCost =
			formData.shippingMethod === "express"
			? 12.99
			: formData.shippingMethod === "overnight"
			? 24.99
			: 0;

		const taxAmount = cartTotal * 0.07; // 7% tax
		const totalWithShippingAndTax = cartTotal + shippingCost + taxAmount;

		// Prepare order data
		const orderData = {
			orderNumber: generatedOrderNumber,
			shippingAddress: {
			firstName: formData.firstName,
			lastName: formData.lastName,
			email: formData.email,
			address: formData.address,
			city: formData.city,
			state: formData.state,
			zipCode: formData.zipCode,
			phone: formData.phone,
			},
			paymentDetails: {
			method: formData.paymentMethod,
			...(formData.paymentMethod === "credit" && {
				cardName: formData.cardName,
				cardNumberLastFour: formData.cardNumber.slice(-4),
			}),
			},
			totalAmount: totalWithShippingAndTax,
			items: cartItems.map((item) => ({
			id: item.id,
			quantity: item.quantity,
			price: item.price,
			sellerId: item.sellerId
			})),
			shippingMethod: formData.shippingMethod,
			taxAmount: taxAmount,
			shippingCost: shippingCost,
		};

		// Send order to the backend
		const response = await fetch("/api/orders", {
			method: "POST",
			headers: {
			"Content-Type": "application/json",
			},
			body: JSON.stringify(orderData),
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || "Failed to place order");
		}

		// Clear the cart after successful order
		await clearCart();

		// Set order as complete
		setOrderComplete(true);
		setOrderNumber(generatedOrderNumber);
		} catch (error) {
		console.error("Order completion error:", error);
		}
	};

	// Don't render if we need to redirect (handled in useEffect)
	if (shouldRedirect) {
		return null;
	}

	// Order Complete View
	if (orderComplete) {
		return (
		<div className="max-w-3xl mx-auto p-6">
			<div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl overflow-hidden p-8 text-center border border-white/10">
			<motion.div
				initial={{ scale: 0.8, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				transition={{ duration: 0.5 }}
				className="mb-6 flex justify-center"
			>
				<div className="bg-green-500/20 p-4 rounded-full">
				<CheckCircle size={64} className="text-green-400" />
				</div>
			</motion.div>

			<motion.div
				initial={{ y: 20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ delay: 0.2, duration: 0.5 }}
			>
				<h1 className="text-3xl font-bold text-white mb-4">
				Thank You for Your Order!
				</h1>
				<p className="text-pink-100 mb-6">
				Your order has been received and is being processed. We&apos;ll
				send you a confirmation email shortly.
				</p>

				<div className="bg-white/5 p-4 rounded-lg mb-8 border border-white/10">
				<p className="text-sm text-pink-200">Order Number</p>
				<p className="text-xl font-semibold text-white">
					{orderNumber}
				</p>
				</div>

				<div className="flex justify-center space-x-4">
				<Link href="/">
				<Button 
					variant="secondary" 
					className="border-white/20 bg-white/20 hover:bg-white/30 text-white font-medium"
					>
					Return to Home
					</Button>
					</Link>
				<Link href="/products">
					<Button 
					variant="primary" 
					className="bg-pink-600 hover:bg-pink-500 text-white py-2 px-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-105"
					>
					Continue Shopping
					</Button>
				</Link>
				</div>
			</motion.div>
			</div>
		</div>
		);
	}

	return (
		<div id="main-content" className="max-w-7xl mx-auto p-6">
		{/* Checkout Steps */}
		<div className="mb-10">
			<div className="flex justify-between items-center">
			{steps.map((step, index) => (
				<div key={step} className="flex flex-col items-center">
				<div
					className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 
					${
					index + 1 === currentStep
						? "bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white shadow-lg"
						: index + 1 < currentStep
						? "bg-green-500/50 text-white shadow backdrop-blur-sm border border-white/20"
						: "bg-white/5 text-white/50 border border-white/10 backdrop-blur-sm"
					}`}
				>
					{index + 1 < currentStep ? (
					<CheckCircle size={18} />
					) : (
					<span>{index + 1}</span>
					)}
				</div>
				<span
					className={`text-xs font-medium 
					${
					index + 1 === currentStep
						? "text-white"
						: index + 1 < currentStep
						? "text-green-400"
						: "text-pink-100/50"
					}`}
				>
					{step}
				</span>
				</div>
			))}
			</div>
			<div className={styles.progressContainer}>
			<div className={`${styles.progressBarBackground} bg-white/10`}></div>
			<div
				className={`${styles.progressBar} ${
				currentStep === 1
					? styles.progressBar0
					: currentStep === 2
					? styles.progressBar33
					: currentStep === 3
					? styles.progressBar66
					: styles.progressBar100
				} bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500`}
			></div>
			</div>
		</div>

		<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
			{/* Checkout Form */}
			<div className="lg:col-span-2">
			<div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/10">
				<div className="p-6 border-b border-white/10 flex justify-between items-center">
				<h2 className="text-xl font-semibold text-white">
					{currentStep === 1 && "Shipping Information"}
					{currentStep === 2 && "Shipping Method"}
					{currentStep === 3 && "Payment Details"}
				</h2>
				<button
					onClick={handleBack}
					className="text-pink-300 hover:text-pink-100 flex items-center gap-1 transition-colors"
				>
					<ArrowLeft size={16} />
					Back
				</button>
				</div>

				<div className="p-6">
				{/* Shipping Information Form */}
				{currentStep === 1 && (
					<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					exit={{ opacity: 0, x: 20 }}
					transition={{ duration: 0.3 }}
					className="space-y-4"
					>
					<div className="grid grid-cols-1 gap-4">
						<div>
						<label
							htmlFor="email"
							className="block text-sm font-medium text-pink-100 mb-1"
						>
							Email
						</label>
						<input
							type="email"
							id="email"
							name="email"
							value={formData.email}
							onChange={handleInputChange}
							className={`w-full px-4 py-2 bg-black/30 text-white border ${
							errors.email ? "border-pink-500" : "border-white/20"
							} rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500 placeholder-white/30`}
							placeholder="Your email address"
						/>
						{errors.email && (
							<p className="mt-1 text-xs text-pink-500">
							{errors.email}
							</p>
						)}
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label
							htmlFor="firstName"
							className="block text-sm font-medium text-pink-100 mb-1"
							>
							First Name
							</label>
							<input
							type="text"
							id="firstName"
							name="firstName"
							value={formData.firstName}
							onChange={handleInputChange}
							className={`w-full px-4 py-2 bg-black/30 text-white border ${
								errors.firstName ? "border-pink-500" : "border-white/20"
							} rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500 placeholder-white/30`}
							/>
							{errors.firstName && (
							<p className="mt-1 text-xs text-pink-500">
								{errors.firstName}
							</p>
							)}
						</div>

						<div>
							<label
							htmlFor="lastName"
							className="block text-sm font-medium text-pink-100 mb-1"
							>
							Last Name
							</label>
							<input
							type="text"
							id="lastName"
							name="lastName"
							value={formData.lastName}
							onChange={handleInputChange}
							className={`w-full px-4 py-2 bg-black/30 text-white border ${
								errors.lastName ? "border-pink-500" : "border-white/20"
							} rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500 placeholder-white/30`}
							/>
							{errors.lastName && (
							<p className="mt-1 text-xs text-pink-500">
								{errors.lastName}
							</p>
							)}
						</div>
						</div>

						<div>
						<label
							htmlFor="address"
							className="block text-sm font-medium text-pink-100 mb-1"
						>
							Address
						</label>
						<input
							type="text"
							id="address"
							name="address"
							value={formData.address}
							onChange={handleInputChange}
							className={`w-full px-4 py-2 bg-black/30 text-white border ${
							errors.address ? "border-pink-500" : "border-white/20"
							} rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500 placeholder-white/30`}
						/>
						{errors.address && (
							<p className="mt-1 text-xs text-pink-500">
							{errors.address}
							</p>
						)}
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<label
							htmlFor="city"
							className="block text-sm font-medium text-pink-100 mb-1"
							>
							City
							</label>
							<input
							type="text"
							id="city"
							name="city"
							value={formData.city}
							onChange={handleInputChange}
							className={`w-full px-4 py-2 bg-black/30 text-white border ${
								errors.city ? "border-pink-500" : "border-white/20"
							} rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500 placeholder-white/30`}
							/>
							{errors.city && (
							<p className="mt-1 text-xs text-pink-500">
								{errors.city}
							</p>
							)}
						</div>

						<div>
							<label
							htmlFor="state"
							className="block text-sm font-medium text-pink-100 mb-1"
							>
							State
							</label>
							<input
							type="text"
							id="state"
							name="state"
							value={formData.state}
							onChange={handleInputChange}
							className={`w-full px-4 py-2 bg-black/30 text-white border ${
								errors.state ? "border-pink-500" : "border-white/20"
							} rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500 placeholder-white/30`}
							/>
							{errors.state && (
							<p className="mt-1 text-xs text-pink-500">
								{errors.state}
							</p>
							)}
						</div>

						<div>
							<label
							htmlFor="zipCode"
							className="block text-sm font-medium text-pink-100 mb-1"
							>
							ZIP Code
							</label>
							<input
							type="text"
							id="zipCode"
							name="zipCode"
							value={formData.zipCode}
							onChange={handleInputChange}
							className={`w-full px-4 py-2 bg-black/30 text-white border ${
								errors.zipCode ? "border-pink-500" : "border-white/20"
							} rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500 placeholder-white/30`}
							/>
							{errors.zipCode && (
							<p className="mt-1 text-xs text-pink-500">
								{errors.zipCode}
							</p>
							)}
						</div>
						</div>

						<div>
						<label
							htmlFor="phone"
							className="block text-sm font-medium text-pink-100 mb-1"
						>
							Phone Number (optional)
						</label>
						<input
							type="tel"
							id="phone"
							name="phone"
							value={formData.phone}
							onChange={handleInputChange}
							className="w-full px-4 py-2 bg-black/30 text-white border border-white/20 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500 placeholder-white/30"
						/>
						</div>

						<div className="flex items-center mt-2">
						<input
							type="checkbox"
							id="saveInfo"
							name="saveInfo"
							checked={formData.saveInfo}
							onChange={handleInputChange}
							className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-white/20 rounded bg-black/30"
						/>
						<label
							htmlFor="saveInfo"
							className="ml-2 text-sm text-pink-100"
						>
							Save this information for next time
						</label>
						</div>
					</div>
					</motion.div>
				)}

				{/* Shipping Method */}
				{currentStep === 2 && (
					<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					exit={{ opacity: 0, x: 20 }}
					transition={{ duration: 0.3 }}
					className="space-y-4"
					>
					<p className="text-pink-100 mb-6">
						Please select your preferred shipping method.
					</p>

					<div className="space-y-3">
						<label
						className={`block border ${
							formData.shippingMethod === "standard"
							? "border-indigo-400 bg-indigo-500/20"
							: "border-white/20 hover:border-white/40"
						} rounded-lg p-4 cursor-pointer transition-colors`}
						>
						<div className="flex items-start">
							<input
							type="radio"
							name="shippingMethod"
							value="standard"
							checked={formData.shippingMethod === "standard"}
							onChange={handleInputChange}
							className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 mt-1 border-white/20 bg-black/30"
							/>
							<div className="ml-3">
							<div className="flex justify-between">
								<span className="text-sm font-medium text-white">
								Standard Shipping
								</span>
								<span className="text-sm font-medium text-pink-100">
								Free
								</span>
							</div>
							<p className="text-sm text-pink-200">
								Delivery in 5-7 business days
							</p>
							<div className="flex items-center mt-1 text-indigo-300">
								<Truck size={16} className="mr-1" />
								<span className="text-xs">
								Free shipping on orders over $50
								</span>
							</div>
							</div>
						</div>
						</label>

						<label
						className={`block border ${
							formData.shippingMethod === "express"
							? "border-indigo-400 bg-indigo-500/20"
							: "border-white/20 hover:border-white/40"
						} rounded-lg p-4 cursor-pointer transition-colors`}
						>
						<div className="flex items-start">
							<input
							type="radio"
							name="shippingMethod"
							value="express"
							checked={formData.shippingMethod === "express"}
							onChange={handleInputChange}
							className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 mt-1 border-white/20 bg-black/30"
							/>
							<div className="ml-3">
							<div className="flex justify-between">
								<span className="text-sm font-medium text-white">
								Express Shipping
								</span>
								<span className="text-sm font-medium text-pink-100">
								$12.99
								</span>
							</div>
							<p className="text-sm text-pink-200">
								Delivery in 2-3 business days
							</p>
							</div>
						</div>
						</label>

						<label
						className={`block border ${
							formData.shippingMethod === "overnight"
							? "border-indigo-400 bg-indigo-500/20"
							: "border-white/20 hover:border-white/40"
						} rounded-lg p-4 cursor-pointer transition-colors`}
						>
						<div className="flex items-start">
							<input
							type="radio"
							name="shippingMethod"
							value="overnight"
							checked={formData.shippingMethod === "overnight"}
							onChange={handleInputChange}
							className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 mt-1 border-white/20 bg-black/30"
							/>
							<div className="ml-3">
							<div className="flex justify-between">
								<span className="text-sm font-medium text-white">
								Overnight Shipping
								</span>
								<span className="text-sm font-medium text-pink-100">
								$24.99
								</span>
							</div>
							<p className="text-sm text-pink-200">
								Delivery the next business day
							</p>
							</div>
						</div>
						</label>
					</div>

					<div className="mt-6 p-4 bg-indigo-900/30 rounded-lg border border-indigo-500/30">
						<div className="flex items-start">
						<div className="flex-shrink-0">
							<AlertCircle size={20} className="text-indigo-300" />
						</div>
						<div className="ml-3">
							<h3 className="text-sm font-medium text-indigo-300">
							Shipping Information
							</h3>
							<div className="mt-2 text-sm text-pink-100">
							<p>
								All orders are processed within 1-2 business days.
								Handcrafted items may require additional processing
								time.
							</p>
							</div>
						</div>
						</div>
					</div>
					</motion.div>
				)}

				{/* Payment Details */}
				{currentStep === 3 && (
					<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					exit={{ opacity: 0, x: 20 }}
					transition={{ duration: 0.3 }}
					className="space-y-4"
					>
					<div className="mb-6">
						<h3 className="text-lg font-medium text-white mb-4">
						Payment Method
						</h3>

						<div className="space-y-3">
						<label
							className={`block border ${
							formData.paymentMethod === "credit"
								? "border-indigo-400 bg-indigo-500/20"
								: "border-white/20 hover:border-white/40"
							} rounded-lg p-4 cursor-pointer transition-colors`}
						>
							<div className="flex items-center">
							<input
								type="radio"
								name="paymentMethod"
								value="credit"
								checked={formData.paymentMethod === "credit"}
								onChange={handleInputChange}
								className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-white/20 bg-black/30"
							/>
							<div className="ml-3 flex items-center">
								<CreditCard
								size={20}
								className="text-pink-300 mr-2"
								/>
								<span className="text-sm font-medium text-white">
								Credit Card
								</span>
							</div>
							</div>
						</label>

						<label
							className={`block border ${
							formData.paymentMethod === "paypal"
								? "border-indigo-400 bg-indigo-500/20"
								: "border-white/20 hover:border-white/40"
							} rounded-lg p-4 cursor-pointer transition-colors`}
						>
							<div className="flex items-center">
							<input
								type="radio"
								name="paymentMethod"
								value="paypal"
								checked={formData.paymentMethod === "paypal"}
								onChange={handleInputChange}
								className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-white/20 bg-black/30"
							/>
							<div className="ml-3">
								<span className="text-sm font-medium text-white">
								PayPal
								</span>
							</div>
							</div>
						</label>
						</div>
					</div>

					{formData.paymentMethod === "credit" && (
						<div className="space-y-4 border-t border-white/10 pt-4">
						<div>
							<label
							htmlFor="cardName"
							className="block text-sm font-medium text-pink-100 mb-1"
							>
							Cardholder Name
							</label>
							<input
							type="text"
							id="cardName"
							name="cardName"
							value={formData.cardName}
							onChange={handleInputChange}
							className={`w-full px-4 py-2 bg-black/30 text-white border ${
								errors.cardName ? "border-pink-500" : "border-white/20"
							} rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500 placeholder-white/30`}
							placeholder="Name on card"
							/>
							{errors.cardName && (
							<p className="mt-1 text-xs text-pink-500">
								{errors.cardName}
							</p>
							)}
						</div>

						<div>
							<label
							htmlFor="cardNumber"
							className="block text-sm font-medium text-pink-100 mb-1"
							>
							Card Number
							</label>
							<input
							type="text"
							id="cardNumber"
							name="cardNumber"
							value={formData.cardNumber}
							onChange={handleInputChange}
							className={`w-full px-4 py-2 bg-black/30 text-white border ${
								errors.cardNumber ? "border-pink-500" : "border-white/20"
							} rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500 placeholder-white/30`}
							placeholder="1234 5678 9012 3456"
							/>
							{errors.cardNumber && (
							<p className="mt-1 text-xs text-pink-500">
								{errors.cardNumber}
							</p>
							)}
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
							<label
								htmlFor="cardExpiry"
								className="block text-sm font-medium text-pink-100 mb-1"
							>
								Expiration Date
							</label>
							<input
								type="text"
								id="cardExpiry"
								name="cardExpiry"
								value={formData.cardExpiry}
								onChange={handleInputChange}
								className={`w-full px-4 py-2 bg-black/30 text-white border ${
								errors.cardExpiry ? "border-pink-500" : "border-white/20"
								} rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500 placeholder-white/30`}
								placeholder="MM/YY"
							/>
							{errors.cardExpiry && (
								<p className="mt-1 text-xs text-pink-500">
								{errors.cardExpiry}
								</p>
							)}
							</div>

							<div>
							<label
								htmlFor="cardCvc"
								className="block text-sm font-medium text-pink-100 mb-1"
							>
								CVC
							</label>
							<input
								type="text"
								id="cardCvc"
								name="cardCvc"
								value={formData.cardCvc}
								onChange={handleInputChange}
								className={`w-full px-4 py-2 bg-black/30 text-white border ${
								errors.cardCvc ? "border-pink-500" : "border-white/20"
								} rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500 placeholder-white/30`}
								placeholder="123"
							/>
							{errors.cardCvc && (
								<p className="mt-1 text-xs text-pink-500">
								{errors.cardCvc}
								</p>
							)}
							</div>
						</div>
						</div>
					)}

					{formData.paymentMethod === "paypal" && (
						<div className="border-t border-white/10 pt-4">
						<p className="text-pink-100 mb-4">
							You will be redirected to PayPal to complete your
							purchase securely.
						</p>
						<div className="bg-white/5 p-4 rounded-lg text-center border border-white/10">
							<p className="text-sm text-pink-200">
							Click &quot;Complete Order&quot; to proceed to PayPal
							</p>
						</div>
						</div>
					)}
					</motion.div>
				)}

				<div className="mt-8">
					<Button
					variant="primary"
					className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-all duration-300"
					onClick={handleNext}
					>
					{currentStep < steps.length ? "Continue" : "Complete Order"}
					</Button>
				</div>
				</div>
			</div>
			</div>

			{/* Order Summary */}
			<div className="lg:col-span-1">
			<div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl overflow-hidden sticky top-6 border border-white/10">
				<div className="p-6 border-b border-white/10">
				<div className="flex justify-between items-center">
					<h2 className="text-lg font-semibold text-white">
					Order Summary
					</h2>
					<Link
					href="/cart"
					className="text-sm text-pink-300 hover:text-pink-100 transition-colors"
					>
					Edit Cart
					</Link>
				</div>
				</div>

				<div className="px-6 py-4 max-h-80 overflow-y-auto">
				<ul className="divide-y divide-white/10">
					{cartItems.map((item) => (
					<li key={item.id} className="py-3 flex">
						<div className="flex-shrink-0 w-16 h-16 bg-white/5 rounded-md overflow-hidden border border-white/10">
						<img
							src={item.image}
							alt={item.name}
							className="h-full w-full object-cover"
						/>
						</div>
						<div className="ml-4 flex-1">
						<div className="flex justify-between">
							<div>
							<h3 className="text-sm font-medium text-white line-clamp-1">
								{item.name}
							</h3>
							<p className="text-xs text-pink-200">
								Qty: {item.quantity}
							</p>
							</div>
							<p className="text-sm font-medium text-white">
							${(item.price * item.quantity).toFixed(2)}
							</p>
						</div>
						</div>
					</li>
					))}
				</ul>
				</div>

				<div className="p-6 space-y-4 border-t border-white/10">
				<div className="flex justify-between text-sm">
					<span className="text-pink-100">Subtotal</span>
					<span className="font-medium text-white">${cartTotal.toFixed(2)}</span>
				</div>

				<div className="flex justify-between text-sm">
					<span className="text-pink-100">Shipping</span>
					<span className="font-medium text-white">
					{formData.shippingMethod === "standard" && "Free"}
					{formData.shippingMethod === "express" && "$12.99"}
					{formData.shippingMethod === "overnight" && "$24.99"}
					</span>
				</div>

				<div className="flex justify-between text-sm">
					<span className="text-pink-100">Taxes</span>
					<span className="font-medium text-white">
					${(cartTotal * 0.07).toFixed(2)}
					</span>
				</div>

				<div className="border-t border-white/10 mt-4 pt-4 flex justify-between">
					<span className="font-medium text-white">Total</span>
					<span className="font-bold text-white">
					$
					{(
						cartTotal +
						(formData.shippingMethod === "express"
						? 12.99
						: formData.shippingMethod === "overnight"
						? 24.99
						: 0) +
						cartTotal * 0.07
					).toFixed(2)}
					</span>
				</div>
				</div>
			</div>
			</div>
		</div>
		</div>
	);
	}