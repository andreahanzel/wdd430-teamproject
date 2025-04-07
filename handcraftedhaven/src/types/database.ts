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
}
