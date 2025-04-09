export interface Product {
	id: number;
	name: string;
	description: string;
	price: number;
	image: string;
	category: string;
	color: string | null;
	material: string | null;
	sellerId: number;
	createdAt: Date;
	updatedAt: Date;
	seller?: Seller;
	reviews?: Review[];
	cartItems?: CartItem[];
	orderItems?: OrderItem[];
}

export interface Seller {
	id: number;
	name: string;
	shopName: string;
	profileImage: string;
	location: string;
	rating: string;
	sales: string;
	bio: string;
	story: string;
	contact: string;
	createdAt: Date;
	updatedAt: Date;
	products?: Product[];
	reviews?: Review[];
}

export interface Review {
	id: number;
	productId?: number | null;
	sellerId?: number | null;
	userId: string;
	userName: string;
	rating: number;
	comment: string;
	date: Date;
	user?: {
		name?: string | null;
		image?: string | null;
	};
}

export interface CartItem {
	id: number;
	userId: string;
	productId: number;
	quantity: number;
	createdAt: Date;
	updatedAt: Date;
	product?: Product;
	user?: User;
}

export interface Order {
	id: number;
	userId: string;
	orderNumber: string;
	status: string;
	totalAmount: number;
	shippingAddress: ShippingAddress;
	paymentDetails?: PaymentDetails;
	createdAt: Date;
	updatedAt: Date;
	user?: User;
	orderItems?: OrderItem[];
}

export interface OrderItem {
	id: number;
	orderId: number;
	productId: number;
	quantity: number;
	price: number;
	createdAt: Date;
	updatedAt: Date;
	order?: Order;
	product?: Product;
}

export interface User {
	id: string;
	name?: string | null;
	email: string;
	emailVerified?: Date | null;
	image?: string | null;
	createdAt: Date;
	updatedAt: Date;
	cartItems?: CartItem[];
	orders?: Order[];
	reviews?: Review[];
}

export interface ShippingAddress {
	firstName: string;
	lastName: string;
	email: string;
	address: string;
	city: string;
	state: string;
	zipCode: string;
	phone?: string;
}

export interface PaymentDetails {
	method: "credit" | "paypal";
	cardName?: string;
	cardNumberLastFour?: string;
}
