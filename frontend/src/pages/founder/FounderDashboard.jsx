import { useQuery } from '@tanstack/react-query'
import { TrendingUp, AlertCircle, Users, Package } from 'lucide-react'
import apiClient from '../../lib/api'

export default function FounderDashboard()
{
    const { data, isLoading } = useQuery({
        queryKey: ['founder-dashboard'],
        queryFn: () => apiClient.get('/dashboard/founder').then(r => r.data)
    })

    if (isLoading) return <div>Loading...</div>

    const kpi = data || {}

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Welcome, Founder</h1>
                <p className="text-gray-600 mt-2">Here's your company overview</p>
            </div>

            {/* Financial KPIs */}
            <div className="grid grid-cols-4 gap-6 mb-8">
                <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
                    <p className="text-3xl font-bold text-green-700 mt-2">{kpi.financial?.totalRevenue?.toLocaleString()} XAF</p>
                    <p className="text-xs text-green-600 mt-2">↑ 12% vs last month</p>
                </div>

                <div className="card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                    <p className="text-gray-600 text-sm font-medium">Total Expenses</p>
                    <p className="text-3xl font-bold text-red-700 mt-2">{kpi.financial?.totalExpenses?.toLocaleString()} XAF</p>
                    <p className="text-xs text-red-600 mt-2">↑ 8% vs last month</p>
                </div>

                <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <p className="text-gray-600 text-sm font-medium">Net Profit</p>
                    <p className="text-3xl font-bold text-blue-700 mt-2">{kpi.financial?.netProfit?.toLocaleString()} XAF</p>
                    <p className="text-xs text-blue-600 mt-2">{kpi.financial?.profitMarginPercent}% margin</p>
                </div>

                <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <p className="text-gray-600 text-sm font-medium">Profit Margin</p>
                    <p className="text-3xl font-bold text-purple-700 mt-2">{kpi.financial?.profitMarginPercent}%</p>
                    <p className="text-xs text-purple-600 mt-2">Healthy margin</p>
                </div>
            </div>

            {/* Palm Oil & Cattle */}
            <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="card">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="text-palm-600" />
                        Palm Oil Division
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Fruit Harvested</span>
                            <span className="font-semibold">{kpi.palmOil?.totalFruitHarvestedKg?.toLocaleString()} KG</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Oil Produced</span>
                            <span className="font-semibold">{kpi.palmOil?.totalOilProducedLitres?.toLocaleString()} L</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Current Stock</span>
                            <span className="font-semibold">{kpi.palmOil?.currentStockLitres?.toLocaleString()} L</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Avg Yield</span>
                            <span className="font-semibold">{kpi.palmOil?.averageYieldPercent}%</span>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Package className="text-earth-600" />
                        Cattle Division
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Total Cattle</span>
                            <span className="font-semibold">{kpi.cattle?.totalCattle}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Male / Female</span>
                            <span className="font-semibold">{kpi.cattle?.maleCattle} / {kpi.cattle?.femaleCattle}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 flex items-center gap-2">
                                <AlertCircle size={16} className="text-orange-500" /> Health Alerts
                            </span>
                            <span className="font-semibold text-orange-600">{kpi.cattle?.healthAlerts}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Vaccinations Due</span>
                            <span className="font-semibold text-yellow-600">{kpi.cattle?.vaccinationsDue}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Company KPIs */}
            <div className="grid grid-cols-4 gap-6">
                <div className="card text-center">
                    <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{kpi.company?.totalEmployees}</p>
                    <p className="text-xs text-gray-500 mt-1">Active Employees</p>
                </div>

                <div className="card text-center">
                    <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{kpi.company?.totalCustomers}</p>
                    <p className="text-xs text-gray-500 mt-1">Customers</p>
                </div>

                <div className="card text-center">
                    <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{kpi.company?.lowStockItems}</p>
                    <p className="text-xs text-gray-500 mt-1">Low Stock Items</p>
                </div>

                <div className="card text-center">
                    <TrendingUp className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{kpi.company?.totalSuppliers}</p>
                    <p className="text-xs text-gray-500 mt-1">Suppliers</p>
                </div>
            </div>
        </div>
    )
}
