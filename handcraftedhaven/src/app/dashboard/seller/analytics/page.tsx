'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { getSellerAnalytics } from '@/services/analyticsServices'
import styles from './analytics.module.css'
import MonthlySalesChart from '@/components/MonthlySalesChart'


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
                const data = await getSellerAnalytics()
                setAnalytics(data)
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
        <main id="main-content" className={styles.container}>
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
                    <p className={styles.productName}>{analytics.topProducts[0]?.name || 'N/A'}</p>
                    <p className={styles.productSales}>{analytics.topProducts[0]?.sales || 0} sales</p>
                </div>
            </div>

            <div className={styles.card}>
                <h3 className={styles.title}>Monthly Sales</h3>
                <MonthlySalesChart data={analytics.monthlySales} />
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
        </main>
    )
}
