import { useQuery } from '@tanstack/react-query'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import apiClient from '../../lib/api'

export default function AnalyticsPage()
{
    const { data, isLoading } = useQuery({
        queryKey: ['analytics'],
        queryFn: () => apiClient.get('/analytics').then(r => r.data)
    })

    if (isLoading) return <div>Loading...</div>

    const analytics = data || {}

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Company Analytics</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="card">
                    <p className="text-gray-600 text-sm">Total Revenue</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">{analytics.totalRevenue?.toLocaleString()} XAF</p>
                </div>
                <div className="card">
                    <p className="text-gray-600 text-sm">Total Expenses</p>
                    <p className="text-3xl font-bold text-red-600 mt-2">{analytics.totalExpenses?.toLocaleString()} XAF</p>
                </div>
                <div className="card">
                    <p className="text-gray-600 text-sm">Net Profit</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{analytics.netProfit?.toLocaleString()} XAF</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-6">
                <div className="card">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analytics.monthlyTrend || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="revenue" stroke="#4a9557" />
                            <Line type="monotone" dataKey="expenses" stroke="#ef4444" />
                            <Line type="monotone" dataKey="profit" stroke="#3b82f6" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="card">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Expense Breakdown</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analytics.expenseBreakdown || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="division" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="amount" fill="#8ab589" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Divisions */}
            <div className="grid grid-cols-2 gap-6 mt-8">
                <div className="card">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">🌴 Palm Oil Division</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span>Fruit Harvested:</span><strong>{analytics.palmOil?.totalFruitHarvestedKg?.toLocaleString()} KG</strong></div>
                        <div className="flex justify-between"><span>Oil Produced:</span><strong>{analytics.palmOil?.totalOilProducedLitres?.toLocaleString()} L</strong></div>
                        <div className="flex justify-between"><span>Revenue:</span><strong className="text-green-600">{analytics.palmOil?.revenue?.toLocaleString()} XAF</strong></div>
                        <div className="flex justify-between"><span>Expenses:</span><strong className="text-red-600">{analytics.palmOil?.productionCost?.toLocaleString()} XAF</strong></div>
                        <div className="flex justify-between border-t pt-2"><span className="font-bold">Profit:</span><strong className="text-blue-600">{analytics.palmOil?.profit?.toLocaleString()} XAF</strong></div>
                    </div>
                </div>

                <div className="card">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">🐄 Cattle Division</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span>Total Cattle:</span><strong>{analytics.cattle?.totalActiveCattle}</strong></div>
                        <div className="flex justify-between"><span>Acquisition Cost:</span><strong>{analytics.cattle?.acquisitionCostTotal?.toLocaleString()} XAF</strong></div>
                        <div className="flex justify-between"><span>Feeding Cost:</span><strong>{analytics.cattle?.feedingCostTotal?.toLocaleString()} XAF</strong></div>
                        <div className="flex justify-between"><span>Revenue:</span><strong className="text-green-600">{analytics.cattle?.salesRevenue?.toLocaleString()} XAF</strong></div>
                        <div className="flex justify-between border-t pt-2"><span className="font-bold">Profit:</span><strong className="text-blue-600">{analytics.cattle?.profit?.toLocaleString()} XAF</strong></div>
                    </div>
                </div>
            </div>
        </div>
    )
}
