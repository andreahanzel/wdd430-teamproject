"use client";

interface SellerProfileCardProps {
    seller: {
        id: number;
        name: string;
        shopName: string;
        profileImage: string;
        location: string;
        rating: string;
        sales: string;
        bio: string;
    };
}

export default function SellerProfileCard({ seller }: SellerProfileCardProps) {
    return (
        <div className="bg-white shadow-md rounded-2xl p-8 md:p-12 mb-12">
        <div className="flex flex-col md:flex-row gap-8 items-center">
            <img
            src={seller.profileImage}
            alt={seller.name}
            className="w-24 h-24 rounded-full object-cover border-2 border-electricBlue"
            />
            <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-darkPurple">{seller.shopName}</h1>
            <p className="text-gray-500">
                {seller.name} — {seller.location}
            </p>
            <p className="text-sm text-gray-600 mt-2">{seller.bio}</p>
            <p className="text-xs text-gray-400 mt-1">
                ⭐ {seller.rating} • {seller.sales} sales
            </p>
            </div>
        </div>
        </div>
    );
}
