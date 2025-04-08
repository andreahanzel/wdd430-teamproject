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
