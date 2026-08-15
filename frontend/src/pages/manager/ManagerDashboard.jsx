import { useQuery } from '@tanstack/react-query'
import { AlertCircle, TrendingUp, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import apiClient from '../../lib/api'

export default function ManagerDashboard()
{
    const { data } = useQuery({
        queryKey: ['manager-dashboard'],
        queryFn: () => apiClient.get('/dashboard/manager').then(r => r.data)
    })

    const { data: recentOperations = [] } = useQuery({
        queryKey: ['daily-operations'],
        queryFn: () => apiClient.get('/daily-operations').then(r => r.data),
        select: (data) => data.slice(0, 5)
    })

    const dashboard = data || {}

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Operations Dashboard</h1>

            {/* Today's Overview */}
            <div className="grid grid-cols-4 gap-6 mb-8">
                <div className="card">
                    <p className="text-gray-600 text-sm">Today's Palm Harvest</p>
                    <p className="text-3xl font-bold text-palm-600 mt-2">{dashboard.todaysPalmHarvestKg?.toLocaleString()} KG</p>
                </div>

                <div className="card">
                    <p className="text-gray-600 text-sm">Today's Production</p>
                    <p className="text-3xl font-bold text-earth-600 mt-2">{dashboard.todaysPalmOilProductionLitres?.toLocaleString()} L</p>
                </div>

                <div className="card">
                    <p className="text-gray-600 text-sm">Current Stock</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{dashboard.currentPalmOilStockLitres?.toLocaleString()} L</p>
                </div>

                <div className="card flex items-center justify-between">
                    <div>
                        <p className="text-gray-600 text-sm">Today's Sales</p>
                        <p className="text-2xl font-bold text-green-600 mt-2">{dashboard.todaysSalesRevenue?.toLocaleString()} XAF</p>
                    </div>
                </div>
            </div>

            {/* Cattle & Quick Stats */}
            <div className="grid grid-cols-3 gap-6">
                <div className="card">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Cattle Status</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Active Cattle</span>
                            <span className="font-bold text-lg">{dashboard.totalActiveCattle}</span>
                        </div>
                        <div className="flex justify-between flex-col gap-2">
                            <span className="text-gray-600 flex items-center gap-2">
                                <AlertCircle size={16} className="text-orange-500" />
                                Health Alerts
                            </span>
                            <span className="font-bold text-lg text-orange-600">{dashboard.cattleHealthAlerts}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Active Employees</span>
                            <span className="font-bold text-lg">{dashboard.activeEmployees}</span>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Daily Expenses</h3>
                    <p className="text-3xl font-bold text-red-600">{dashboard.todaysExpenses?.toLocaleString()} XAF</p>
                    <p className="text-xs text-gray-500 mt-2">Track all daily costs</p>
                </div>

                <div className="card bg-gradient-to-br from-palm-50 to-earth-50">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="space-y-2">
                        <Link
                            to="/manager/daily-operations"
                            className="w-full text-left px-3 py-2 text-sm bg-white rounded hover:bg-gray-50 flex items-center gap-2"
                        >
                            <Plus size={16} />
                            + Daily Operations
                        </Link>
                        <button className="w-full text-left px-3 py-2 text-sm bg-white rounded hover:bg-gray-50">
                            + Record Harvest
                        </button>
                        <button className="w-full text-left px-3 py-2 text-sm bg-white rounded hover:bg-gray-50">
                            + Record Production
                        </button>
                        <button className="w-full text-left px-3 py-2 text-sm bg-white rounded hover:bg-gray-50">
                            + Add Expense
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
