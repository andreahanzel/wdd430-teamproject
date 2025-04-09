/**
 * Get all orders for the current seller
 */
export async function getSellerOrders() {
    try {
        const response = await fetch('/api/seller/orders');
        
        if (!response.ok) {
            if (response.status === 404) return [];
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const orders = await response.json();
        return orders;
        } catch (error) {
        console.error('Error fetching seller orders:', error);
        throw error;
        }
    }
    
    /**
     * Get a specific order by ID for the seller
     */
    export async function getSellerOrderById(id: number) {
        try {
        const response = await fetch(`/api/seller/orders/${id}`);
        
        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const order = await response.json();
        return order;
        } catch (error) {
        console.error(`Error fetching order with id ${id}:`, error);
        throw error;
        }
    }
    
    /**
     * Update the status of an order
     */
    export async function updateOrderStatus(id: number, status: string) {
        try {
        const response = await fetch(`/api/seller/orders/${id}/status`, {
            method: 'PUT',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status }),
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const updatedOrder = await response.json();
        return updatedOrder;
        } catch (error) {
        console.error(`Error updating order status:`, error);
        throw error;
        }
    }