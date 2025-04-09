'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import styles from './analytics.module.css'

export default function AnalyticsSection() {
    const { data: session } = useSession()
    const router = useRouter()
    const [analytics, setAnalytics] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!session || session.user.role !== 'SELLER') {
            router.push('/')
            return
        }

        
        const fetchAnalytics = async () => {
            try {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000))
                
                // Mock data
                setAnalytics({
                    totalSales: 1245.89,
                    totalOrders: 28,
                    topProducts: [
                        { name: 'Handmade Ceramic Mug', sales: 15 },
                        { name: 'Wooden Cutting Board', sales: 10 },
                        { name: 'Knitted Scarf', sales: 8 },
                    ],
                    monthlySales: [
                        { month: 'Jan', sales: 120 },
                        { month: 'Feb', sales: 200 },
                        { month: 'Mar', sales: 150 },
                        { month: 'Apr', sales: 280 },
                        { month: 'May', sales: 190 },
                        { month: 'Jun', sales: 320 },
                    ]
                })
            } catch (error) {
                console.error('Error fetching analytics:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchAnalytics()
    }, [session, router])

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.gridContainer}>
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className={styles.loadingCard}></div>
                    ))}
                </div>
                <div className={styles.loadingCard}></div>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <div className={styles.gridContainer}>
                <div className={styles.card}>
                    <h3 className={styles.title}>Total Sales</h3>
                    <p className={styles.value}>${analytics.totalSales.toFixed(2)}</p>
                </div>
                
                <div className={styles.card}>
                    <h3 className={styles.title}>Total Orders</h3>
                    <p className={styles.value}>{analytics.totalOrders}</p>
                </div>
                
                <div className={styles.card}>
                    <h3 className={styles.title}>Top Product</h3>
                    <p className={styles.productName}>{analytics.topProducts[0].name}</p>
                    <p className={styles.productSales}>{analytics.topProducts[0].sales} sales</p>
                </div>
            </div>
            
            <div className={styles.card}>
                <h3 className={styles.title}>Monthly Sales</h3>
                <div className={styles.chartContainer}>
                    <div className={styles.chart}>
                        {analytics.monthlySales.map((item: any, index: number) => (
                            <div key={index} className={styles.flexCol}>
                                <div 
                                    className={styles.chartBar}
                                    style={{ '--bar-height': `${(item.sales / 400) * 100}%` } as React.CSSProperties}
                                ></div>
                                <span className={styles.chartLabel}>{item.month}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className={styles.card}>
                <h3 className={styles.title}>Top Products</h3>
                <div className={styles.productList}>
                    {analytics.topProducts.map((product: any, index: number) => (
                        <div key={index} className={styles.productItem}>
                            <span className={styles.productName}>{product.name}</span>
                            <span className={styles.productSales}>{product.sales} sales</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}