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
        queryFn: () => apiClient.get('/daily-operations').then(r => r.data || []),
        select: (data) => (Array.isArray(data) ? data.slice(0, 5) : [])
    })

    const { data: recentHarvests = [] } = useQuery({
        queryKey: ['palm-harvests'],
        queryFn: () => apiClient.get('/palm-harvests').then(r => r.data || []),
        select: (data) => (Array.isArray(data) ? data.slice(0, 5) : [])
    })

    const { data: recentProduction = [] } = useQuery({
        queryKey: ['production'],
        queryFn: () => apiClient.get('/production').then(r => r.data || []),
        select: (data) => (Array.isArray(data) ? data.slice(0, 5) : [])
    })

    const { data: recentSales = [] } = useQuery({
        queryKey: ['sales'],
        queryFn: () => apiClient.get('/sales').then(r => r.data || []),
        select: (data) => (Array.isArray(data) ? data.slice(0, 5) : [])
    })

    // fetch all sales to compute stock adjustments
    const { data: allSales = [] } = useQuery({
        queryKey: ['sales-all'],
        queryFn: () => apiClient.get('/sales').then(r => r.data || [])
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
                    {
                        (() => {
                            const baseStock = Number(dashboard.currentPalmOilStockLitres) || 0
                            const soldLitres = Array.isArray(allSales) ? allSales.reduce((s, it) => s + (Number(it.quantityLitres) || 0), 0) : 0
                            const displayed = Math.max(0, baseStock - soldLitres)
                            return <p className="text-3xl font-bold text-blue-600 mt-2">{displayed.toLocaleString()} L</p>
                        })()
                    }
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

            <div className="grid grid-cols-4 gap-6 mt-8">
                <div className="card">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Recent Daily Operations</h3>
                        <Link to="/manager/daily-operations" className="text-sm font-medium text-green-700 hover:text-green-800">
                            View all
                        </Link>
                    </div>

                    {recentOperations.length === 0 ? (
                        <p className="text-sm text-gray-500">No daily operations recorded yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {recentOperations.map((op) => (
                                <div key={op.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                                    <div className="flex justify-between items-start gap-3">
                                        <div>
                                            <p className="font-semibold text-gray-900">{op.operationType}</p>
                                            <p className="text-xs text-gray-600">{new Date(op.date).toLocaleDateString()}</p>
                                        </div>
                                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                                            {op.performedBy || 'Manager'}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-700">{op.description || 'No details provided.'}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="card">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Recent Sales</h3>
                        <Link to="/manager/sales" className="text-sm font-medium text-green-700 hover:text-green-800">
                            View all
                        </Link>
                    </div>

                    {recentSales.length === 0 ? (
                        <p className="text-sm text-gray-500">No sales recorded yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {recentSales.map((sale) => (
                                <div key={sale.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                                    <div className="flex justify-between items-start gap-3">
                                        <div>
                                            <p className="font-semibold text-gray-900">{sale.customerName}</p>
                                            <p className="text-xs text-gray-600">{new Date(sale.saleDate).toLocaleDateString()}</p>
                                        </div>
                                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                                            {sale.paymentStatus}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-700">{sale.product} • {Number(sale.quantityLitres).toFixed(2)} L • {sale.totalPrice ? `$${Number(sale.totalPrice).toLocaleString()}` : '$0'}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="card">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Recent Production</h3>
                        <Link to="/manager/production" className="text-sm font-medium text-green-700 hover:text-green-800">
                            View all
                        </Link>
                    </div>

                    {recentProduction.length === 0 ? (
                        <p className="text-sm text-gray-500">No production recorded yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {recentProduction.map((item) => (
                                <div key={item.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                                    <div className="flex justify-between items-start gap-3">
                                        <div>
                                            <p className="font-semibold text-gray-900">{item.item}</p>
                                            <p className="text-xs text-gray-600">{new Date(item.date).toLocaleDateString()}</p>
                                        </div>
                                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                                            {item.category}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-700">{item.quantity} {item.unit} • {item.cost ? `Cost ${item.cost}` : ''}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="card">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Recent Palm Harvests</h3>
                        <Link to="/manager/palm-harvest" className="text-sm font-medium text-green-700 hover:text-green-800">
                            View all
                        </Link>
                    </div>

                    {recentHarvests.length === 0 ? (
                        <p className="text-sm text-gray-500">No palm harvests recorded yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {recentHarvests.map((harvest) => (
                                <div key={harvest.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                                    <div className="flex justify-between items-start gap-3">
                                        <div>
                                            <p className="font-semibold text-gray-900">{harvest.harvestId}</p>
                                            <p className="text-xs text-gray-600">{new Date(harvest.harvestDate).toLocaleDateString()}</p>
                                        </div>
                                        <span className="text-xs px-2 py-1 rounded-full bg-palm-100 text-palm-700">
                                            {harvest.totalWeightKg || 0} KG
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-700">{harvest.harvestTeam || 'Harvest team'} • {harvest.numberOfBunches || 0} bunches</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
