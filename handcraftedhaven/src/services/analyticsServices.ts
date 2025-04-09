import { AnalyticsData } from "@/types/database";

type TimeFrame = 'week' | 'month' | 'year';

/**
 * Get analytics data for the current seller
 */
export async function getSellerAnalytics(timeframe: TimeFrame = 'month'): Promise<AnalyticsData> {
    try {
        const response = await fetch(`/api/seller/analytics?timeframe=${timeframe}`);
        
        if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching analytics data:', error);
        
        // Return empty data in case of error
        return {
        salesOverTime: [],
        salesByCategory: [],
        topProducts: [],
        summary: {
            totalSales: 0,
            totalRevenue: 0,
            totalOrders: 0,
            averageOrderValue: 0,
            newCustomers: 0
        }
        };
    }
}