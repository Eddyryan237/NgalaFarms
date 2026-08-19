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
        <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8">Company Analytics</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <div className="card min-w-0">
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

                <div className="card min-w-0">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mt-6 md:mt-8">
                <div className="card min-w-0">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">🌴 Palm Oil Division</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex flex-wrap justify-between gap-2"><span>Fruit Harvested:</span><strong className="text-right break-words">{analytics.palmOil?.totalFruitHarvestedKg?.toLocaleString()} KG</strong></div>
                        <div className="flex flex-wrap justify-between gap-2"><span>Oil Produced:</span><strong className="text-right break-words">{analytics.palmOil?.totalOilProducedLitres?.toLocaleString()} L</strong></div>
                        <div className="flex flex-wrap justify-between gap-2"><span>Revenue:</span><strong className="text-right break-words text-green-600">{analytics.palmOil?.revenue?.toLocaleString()} XAF</strong></div>
                        <div className="flex flex-wrap justify-between gap-2"><span>Expenses:</span><strong className="text-right break-words text-red-600">{analytics.palmOil?.productionCost?.toLocaleString()} XAF</strong></div>
                        <div className="flex flex-wrap justify-between gap-2 border-t pt-2"><span className="font-bold">Profit:</span><strong className="text-right break-words text-blue-600">{analytics.palmOil?.profit?.toLocaleString()} XAF</strong></div>
                    </div>
                </div>

                <div className="card min-w-0">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">🐄 Cattle Division</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex flex-wrap justify-between gap-2"><span>Total Cattle:</span><strong className="text-right break-words">{analytics.cattle?.totalActiveCattle}</strong></div>
                        <div className="flex flex-wrap justify-between gap-2"><span>Acquisition Cost:</span><strong className="text-right break-words">{analytics.cattle?.acquisitionCostTotal?.toLocaleString()} XAF</strong></div>
                        <div className="flex flex-wrap justify-between gap-2"><span>Feeding Cost:</span><strong className="text-right break-words">{analytics.cattle?.feedingCostTotal?.toLocaleString()} XAF</strong></div>
                        <div className="flex flex-wrap justify-between gap-2"><span>Revenue:</span><strong className="text-right break-words text-green-600">{analytics.cattle?.salesRevenue?.toLocaleString()} XAF</strong></div>
                        <div className="flex flex-wrap justify-between gap-2 border-t pt-2"><span className="font-bold">Profit:</span><strong className="text-right break-words text-blue-600">{analytics.cattle?.profit?.toLocaleString()} XAF</strong></div>
                    </div>
                </div>
            </div>
        </div>
    )
}
