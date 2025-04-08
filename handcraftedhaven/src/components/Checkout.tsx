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

const steps = ["Cart", "Information", "Shipping", "Payment"];

export default function Checkout() {
	const router = useRouter();
	const { cartItems, cartTotal, clearCart, isLoading } = useCart();
	const [currentStep, setCurrentStep] = useState(1);
	const [formData, setFormData] = useState({
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
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [orderComplete, setOrderComplete] = useState(false);
	const [orderNumber, setOrderNumber] = useState("");
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
		// Generate random order number
		setOrderNumber(`HCH-${Math.floor(100000 + Math.random() * 900000)}`);
	}, []);

	// Protect against server-side rendering issues
	if (!isClient) {
		return null;
	}

	// Redirect to cart if empty
	if (cartItems.length === 0 && !orderComplete) {
		router.push("/cart");
		return null;
	}

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value, type } = e.target as HTMLInputElement;

		setFormData({
			...formData,
			[name]:
				type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
		});

		// Clear error for this field when user types
		if (errors[name]) {
			setErrors({
				...errors,
				[name]: "",
			});
		}
	};

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

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
				})),
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

	// Order Complete View
	if (orderComplete) {
		return (
			<div className="max-w-3xl mx-auto p-6">
				<div className="bg-white rounded-xl shadow-md overflow-hidden p-8 text-center">
					<motion.div
						initial={{ scale: 0.8, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						transition={{ duration: 0.5 }}
						className="mb-6 flex justify-center"
					>
						<div className="bg-green-50 p-4 rounded-full">
							<CheckCircle size={64} className="text-green-500" />
						</div>
					</motion.div>

					<motion.div
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: 0.2, duration: 0.5 }}
					>
						<h1 className="text-3xl font-bold text-darkPurple mb-4">
							Thank You for Your Order!
						</h1>
						<p className="text-gray-600 mb-6">
							Your order has been received and is being processed. We&apos;ll
							send you a confirmation email shortly.
						</p>

						<div className="bg-gray-50 p-4 rounded-lg mb-8">
							<p className="text-sm text-gray-500">Order Number</p>
							<p className="text-xl font-semibold text-darkPurple">
								{orderNumber}
							</p>
						</div>

						<div className="flex justify-center space-x-4">
							<Link href="/">
								<Button variant="secondary">Return to Home</Button>
							</Link>
							<Link href="/products">
								<Button variant="primary">Continue Shopping</Button>
							</Link>
						</div>
					</motion.div>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto p-6">
			{/* Checkout Steps */}
			<div className="mb-10">
				<div className="flex justify-between items-center">
					{steps.map((step, index) => (
						<div key={step} className="flex flex-col items-center">
							<div
								className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 
                ${
									index + 1 === currentStep
										? "bg-electricBlue text-white"
										: index + 1 < currentStep
										? "bg-green-100 text-green-600 border-2 border-green-600"
										: "bg-gray-100 text-gray-400"
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
										? "text-darkPurple"
										: index + 1 < currentStep
										? "text-green-600"
										: "text-gray-400"
								}`}
							>
								{step}
							</span>
						</div>
					))}
				</div>
				<div className={styles.progressContainer}>
					<div className={styles.progressBarBackground}></div>
					<div
						className={`${styles.progressBar} ${
							currentStep === 1
								? styles.progressBar0
								: currentStep === 2
								? styles.progressBar33
								: currentStep === 3
								? styles.progressBar66
								: styles.progressBar100
						}`}
					></div>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Checkout Form */}
				<div className="lg:col-span-2">
					<div className="bg-white rounded-xl shadow-md overflow-hidden">
						<div className="p-6 border-b border-gray-100 flex justify-between items-center">
							<h2 className="text-xl font-semibold text-darkPurple">
								{currentStep === 1 && "Shipping Information"}
								{currentStep === 2 && "Shipping Method"}
								{currentStep === 3 && "Payment Details"}
							</h2>
							<button
								onClick={handleBack}
								className="text-electricBlue hover:text-neonPink flex items-center gap-1 transition-colors"
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
												className="block text-sm font-medium text-gray-700 mb-1"
											>
												Email
											</label>
											<input
												type="email"
												id="email"
												name="email"
												value={formData.email}
												onChange={handleInputChange}
												className={`w-full px-4 py-2 border ${
													errors.email ? "border-errorRed" : "border-gray-300"
												} rounded-md focus:ring-2 focus:ring-electricBlue focus:border-electricBlue text-gray-800`}
												placeholder="Your email address"
											/>
											{errors.email && (
												<p className="mt-1 text-xs text-errorRed">
													{errors.email}
												</p>
											)}
										</div>

										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div>
												<label
													htmlFor="firstName"
													className="block text-sm font-medium text-gray-700 mb-1"
												>
													First Name
												</label>
												<input
													type="text"
													id="firstName"
													name="firstName"
													value={formData.firstName}
													onChange={handleInputChange}
													className={`w-full px-4 py-2 border ${
														errors.firstName
															? "border-errorRed"
															: "border-gray-300"
													} rounded-md focus:ring-2 focus:ring-electricBlue focus:border-electricBlue text-gray-800`}
												/>
												{errors.firstName && (
													<p className="mt-1 text-xs text-errorRed">
														{errors.firstName}
													</p>
												)}
											</div>

											<div>
												<label
													htmlFor="lastName"
													className="block text-sm font-medium text-gray-700 mb-1"
												>
													Last Name
												</label>
												<input
													type="text"
													id="lastName"
													name="lastName"
													value={formData.lastName}
													onChange={handleInputChange}
													className={`w-full px-4 py-2 border ${
														errors.lastName
															? "border-errorRed"
															: "border-gray-300"
													} rounded-md focus:ring-2 focus:ring-electricBlue focus:border-electricBlue text-gray-800`}
												/>
												{errors.lastName && (
													<p className="mt-1 text-xs text-errorRed">
														{errors.lastName}
													</p>
												)}
											</div>
										</div>

										<div>
											<label
												htmlFor="address"
												className="block text-sm font-medium text-gray-700 mb-1"
											>
												Address
											</label>
											<input
												type="text"
												id="address"
												name="address"
												value={formData.address}
												onChange={handleInputChange}
												className={`w-full px-4 py-2 border ${
													errors.address ? "border-errorRed" : "border-gray-300"
												} rounded-md focus:ring-2 focus:ring-electricBlue focus:border-electricBlue text-gray-800`}
											/>
											{errors.address && (
												<p className="mt-1 text-xs text-errorRed">
													{errors.address}
												</p>
											)}
										</div>

										<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
											<div>
												<label
													htmlFor="city"
													className="block text-sm font-medium text-gray-700 mb-1"
												>
													City
												</label>
												<input
													type="text"
													id="city"
													name="city"
													value={formData.city}
													onChange={handleInputChange}
													className={`w-full px-4 py-2 border ${
														errors.city ? "border-errorRed" : "border-gray-300"
													} rounded-md focus:ring-2 focus:ring-electricBlue focus:border-electricBlue text-gray-800`}
												/>
												{errors.city && (
													<p className="mt-1 text-xs text-errorRed">
														{errors.city}
													</p>
												)}
											</div>

											<div>
												<label
													htmlFor="state"
													className="block text-sm font-medium text-gray-700 mb-1"
												>
													State
												</label>
												<input
													type="text"
													id="state"
													name="state"
													value={formData.state}
													onChange={handleInputChange}
													className={`w-full px-4 py-2 border ${
														errors.state ? "border-errorRed" : "border-gray-300"
													} rounded-md focus:ring-2 focus:ring-electricBlue focus:border-electricBlue`}
												/>
												{errors.state && (
													<p className="mt-1 text-xs text-errorRed">
														{errors.state}
													</p>
												)}
											</div>

											<div>
												<label
													htmlFor="zipCode"
													className="block text-sm font-medium text-gray-700 mb-1"
												>
													ZIP Code
												</label>
												<input
													type="text"
													id="zipCode"
													name="zipCode"
													value={formData.zipCode}
													onChange={handleInputChange}
													className={`w-full px-4 py-2 border ${
														errors.zipCode
															? "border-errorRed"
															: "border-gray-300"
													} rounded-md focus:ring-2 focus:ring-electricBlue focus:border-electricBlue`}
												/>
												{errors.zipCode && (
													<p className="mt-1 text-xs text-errorRed">
														{errors.zipCode}
													</p>
												)}
											</div>
										</div>

										<div>
											<label
												htmlFor="phone"
												className="block text-sm font-medium text-gray-700 mb-1"
											>
												Phone Number (optional)
											</label>
											<input
												type="tel"
												id="phone"
												name="phone"
												value={formData.phone}
												onChange={handleInputChange}
												className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-electricBlue focus:border-electricBlue"
											/>
										</div>

										<div className="flex items-center mt-2">
											<input
												type="checkbox"
												id="saveInfo"
												name="saveInfo"
												checked={formData.saveInfo}
												onChange={handleInputChange}
												className="h-4 w-4 text-electricBlue focus:ring-electricBlue border-gray-300 rounded"
											/>
											<label
												htmlFor="saveInfo"
												className="ml-2 text-sm text-gray-700"
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
									<p className="text-gray-600 mb-6">
										Please select your preferred shipping method.
									</p>

									<div className="space-y-3">
										<label
											className={`block border ${
												formData.shippingMethod === "standard"
													? "border-electricBlue bg-blue-50"
													: "border-gray-200"
											} rounded-lg p-4 cursor-pointer transition-colors`}
										>
											<div className="flex items-start">
												<input
													type="radio"
													name="shippingMethod"
													value="standard"
													checked={formData.shippingMethod === "standard"}
													onChange={handleInputChange}
													className="h-5 w-5 text-electricBlue focus:ring-electricBlue mt-1"
												/>
												<div className="ml-3">
													<div className="flex justify-between">
														<span className="text-sm font-medium text-gray-900">
															Standard Shipping
														</span>
														<span className="text-sm font-medium text-gray-900">
															Free
														</span>
													</div>
													<p className="text-sm text-gray-500">
														Delivery in 5-7 business days
													</p>
													<div className="flex items-center mt-1 text-electricBlue">
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
													? "border-electricBlue bg-blue-50"
													: "border-gray-200"
											} rounded-lg p-4 cursor-pointer transition-colors`}
										>
											<div className="flex items-start">
												<input
													type="radio"
													name="shippingMethod"
													value="express"
													checked={formData.shippingMethod === "express"}
													onChange={handleInputChange}
													className="h-5 w-5 text-electricBlue focus:ring-electricBlue mt-1"
												/>
												<div className="ml-3">
													<div className="flex justify-between">
														<span className="text-sm font-medium text-gray-900">
															Express Shipping
														</span>
														<span className="text-sm font-medium text-gray-900">
															$12.99
														</span>
													</div>
													<p className="text-sm text-gray-500">
														Delivery in 2-3 business days
													</p>
												</div>
											</div>
										</label>

										<label
											className={`block border ${
												formData.shippingMethod === "overnight"
													? "border-electricBlue bg-blue-50"
													: "border-gray-200"
											} rounded-lg p-4 cursor-pointer transition-colors`}
										>
											<div className="flex items-start">
												<input
													type="radio"
													name="shippingMethod"
													value="overnight"
													checked={formData.shippingMethod === "overnight"}
													onChange={handleInputChange}
													className="h-5 w-5 text-electricBlue focus:ring-electricBlue mt-1"
												/>
												<div className="ml-3">
													<div className="flex justify-between">
														<span className="text-sm font-medium text-gray-900">
															Overnight Shipping
														</span>
														<span className="text-sm font-medium text-gray-900">
															$24.99
														</span>
													</div>
													<p className="text-sm text-gray-500">
														Delivery the next business day
													</p>
												</div>
											</div>
										</label>
									</div>

									<div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
										<div className="flex items-start">
											<div className="flex-shrink-0">
												<AlertCircle size={20} className="text-electricBlue" />
											</div>
											<div className="ml-3">
												<h3 className="text-sm font-medium text-electricBlue">
													Shipping Information
												</h3>
												<div className="mt-2 text-sm text-gray-600">
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
										<h3 className="text-lg font-medium text-gray-900 mb-4">
											Payment Method
										</h3>

										<div className="space-y-3">
											<label
												className={`block border ${
													formData.paymentMethod === "credit"
														? "border-electricBlue bg-blue-50"
														: "border-gray-200"
												} rounded-lg p-4 cursor-pointer transition-colors`}
											>
												<div className="flex items-center">
													<input
														type="radio"
														name="paymentMethod"
														value="credit"
														checked={formData.paymentMethod === "credit"}
														onChange={handleInputChange}
														className="h-5 w-5 text-electricBlue focus:ring-electricBlue"
													/>
													<div className="ml-3 flex items-center">
														<CreditCard
															size={20}
															className="text-gray-500 mr-2"
														/>
														<span className="text-sm font-medium text-gray-900">
															Credit Card
														</span>
													</div>
												</div>
											</label>

											<label
												className={`block border ${
													formData.paymentMethod === "paypal"
														? "border-electricBlue bg-blue-50"
														: "border-gray-200"
												} rounded-lg p-4 cursor-pointer transition-colors`}
											>
												<div className="flex items-center">
													<input
														type="radio"
														name="paymentMethod"
														value="paypal"
														checked={formData.paymentMethod === "paypal"}
														onChange={handleInputChange}
														className="h-5 w-5 text-electricBlue focus:ring-electricBlue"
													/>
													<div className="ml-3">
														<span className="text-sm font-medium text-gray-900">
															PayPal
														</span>
													</div>
												</div>
											</label>
										</div>
									</div>

									{formData.paymentMethod === "credit" && (
										<div className="space-y-4 border-t border-gray-200 pt-4">
											<div>
												<label
													htmlFor="cardName"
													className="block text-sm font-medium text-gray-700 mb-1"
												>
													Cardholder Name
												</label>
												<input
													type="text"
													id="cardName"
													name="cardName"
													value={formData.cardName}
													onChange={handleInputChange}
													className={`w-full px-4 py-2 border ${
														errors.cardName
															? "border-errorRed"
															: "border-gray-300"
													} rounded-md focus:ring-2 focus:ring-electricBlue focus:border-electricBlue`}
													placeholder="Name on card"
												/>
												{errors.cardName && (
													<p className="mt-1 text-xs text-errorRed">
														{errors.cardName}
													</p>
												)}
											</div>

											<div>
												<label
													htmlFor="cardNumber"
													className="block text-sm font-medium text-gray-700 mb-1"
												>
													Card Number
												</label>
												<input
													type="text"
													id="cardNumber"
													name="cardNumber"
													value={formData.cardNumber}
													onChange={handleInputChange}
													className={`w-full px-4 py-2 border ${
														errors.cardNumber
															? "border-errorRed"
															: "border-gray-300"
													} rounded-md focus:ring-2 focus:ring-electricBlue focus:border-electricBlue`}
													placeholder="1234 5678 9012 3456"
												/>
												{errors.cardNumber && (
													<p className="mt-1 text-xs text-errorRed">
														{errors.cardNumber}
													</p>
												)}
											</div>

											<div className="grid grid-cols-2 gap-4">
												<div>
													<label
														htmlFor="cardExpiry"
														className="block text-sm font-medium text-gray-700 mb-1"
													>
														Expiration Date
													</label>
													<input
														type="text"
														id="cardExpiry"
														name="cardExpiry"
														value={formData.cardExpiry}
														onChange={handleInputChange}
														className={`w-full px-4 py-2 border ${
															errors.cardExpiry
																? "border-errorRed"
																: "border-gray-300"
														} rounded-md focus:ring-2 focus:ring-electricBlue focus:border-electricBlue`}
														placeholder="MM/YY"
													/>
													{errors.cardExpiry && (
														<p className="mt-1 text-xs text-errorRed">
															{errors.cardExpiry}
														</p>
													)}
												</div>

												<div>
													<label
														htmlFor="cardCvc"
														className="block text-sm font-medium text-gray-700 mb-1"
													>
														CVC
													</label>
													<input
														type="text"
														id="cardCvc"
														name="cardCvc"
														value={formData.cardCvc}
														onChange={handleInputChange}
														className={`w-full px-4 py-2 border ${
															errors.cardCvc
																? "border-errorRed"
																: "border-gray-300"
														} rounded-md focus:ring-2 focus:ring-electricBlue focus:border-electricBlue`}
														placeholder="123"
													/>
													{errors.cardCvc && (
														<p className="mt-1 text-xs text-errorRed">
															{errors.cardCvc}
														</p>
													)}
												</div>
											</div>
										</div>
									)}

									{formData.paymentMethod === "paypal" && (
										<div className="border-t border-gray-200 pt-4">
											<p className="text-gray-600 mb-4">
												You will be redirected to PayPal to complete your
												purchase securely.
											</p>
											<div className="bg-gray-50 p-4 rounded-lg text-center">
												<p className="text-sm text-gray-500">
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
									className="w-full py-3"
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
					<div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-6">
						<div className="p-6 border-b border-gray-100">
							<div className="flex justify-between items-center">
								<h2 className="text-lg font-semibold text-darkPurple">
									Order Summary
								</h2>
								<Link
									href="/cart"
									className="text-sm text-electricBlue hover:text-neonPink transition-colors"
								>
									Edit Cart
								</Link>
							</div>
						</div>

						<div className="px-6 py-4 max-h-80 overflow-y-auto">
							<ul className="divide-y divide-gray-100">
								{cartItems.map((item) => (
									<li key={item.id} className="py-3 flex">
										<div className="flex-shrink-0 w-16 h-16 bg-gray-50 rounded-md overflow-hidden">
											<img
												src={item.image}
												alt={item.name}
												className="h-full w-full object-cover"
											/>
										</div>
										<div className="ml-4 flex-1">
											<div className="flex justify-between">
												<div>
													<h3 className="text-sm font-medium text-gray-900 line-clamp-1">
														{item.name}
													</h3>
													<p className="text-xs text-gray-500">
														Qty: {item.quantity}
													</p>
												</div>
												<p className="text-sm font-medium text-gray-900">
													${(item.price * item.quantity).toFixed(2)}
												</p>
											</div>
										</div>
									</li>
								))}
							</ul>
						</div>

						<div className="p-6 space-y-4 border-t border-gray-100">
							<div className="flex justify-between text-sm">
								<span className="text-gray-600">Subtotal</span>
								<span className="font-medium">${cartTotal.toFixed(2)}</span>
							</div>

							<div className="flex justify-between text-sm">
								<span className="text-gray-600">Shipping</span>
								<span className="font-medium">
									{formData.shippingMethod === "standard" && "Free"}
									{formData.shippingMethod === "express" && "$12.99"}
									{formData.shippingMethod === "overnight" && "$24.99"}
								</span>
							</div>

							<div className="flex justify-between text-sm">
								<span className="text-gray-600">Taxes</span>
								<span className="font-medium">
									${(cartTotal * 0.07).toFixed(2)}
								</span>
							</div>

							<div className="border-t border-gray-100 mt-4 pt-4 flex justify-between">
								<span className="font-medium text-darkPurple">Total</span>
								<span className="font-bold text-darkPurple">
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
