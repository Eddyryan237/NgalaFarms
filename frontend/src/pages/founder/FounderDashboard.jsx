import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle, Trash2, RefreshCw, Download, Eye, EyeOff, BarChart3, TrendingUp, Calendar, FileText, X, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import apiClient from '../../lib/api'

export default function FounderDashboard()
{
    const [showDetails, setShowDetails] = useState(false)
    const [selectedItem, setSelectedItem] = useState(null)
    const [selectedItemType, setSelectedItemType] = useState(null)

    // Fetch all system data
    const { data: expenses = [], isLoading: expensesLoading, refetch: refetchExpenses } = useQuery({
        queryKey: ['all-expenses'],
        queryFn: () => apiClient.get('/expenses').then(r => r.data).catch(() => [])
    })

    const { data: production = [], isLoading: productionLoading, refetch: refetchProduction } = useQuery({
        queryKey: ['all-production'],
        queryFn: () => apiClient.get('/production').then(r => r.data).catch(() => [])
    })

    const { data: inventories = [] } = useQuery({
        queryKey: ['inventories'],
        queryFn: () => apiClient.get('/inventory').then(r => r.data || []).catch(() => [])
    })

    const { data: sales = [], isLoading: salesLoading, refetch: refetchSales } = useQuery({
        queryKey: ['all-sales'],
        queryFn: () => apiClient.get('/sales').then(r => r.data).catch(() => [])
    })

    const { data: cattle = [], isLoading: cattleLoading, refetch: refetchCattle } = useQuery({
        queryKey: ['all-cattle'],
        queryFn: () => apiClient.get('/cattle').then(r => r.data).catch(() => [])
    })

    const { data: dailyOperations = [], isLoading: operationsLoading, refetch: refetchDailyOperations } = useQuery({
        queryKey: ['all-daily-operations'],
        queryFn: () => apiClient.get('/daily-operations').then(r => r.data || []).catch(() => [])
    })

    const { data: palmHarvests = [], isLoading: palmHarvestsLoading, refetch: refetchPalmHarvests } = useQuery({
        queryKey: ['all-palm-harvests'],
        queryFn: () => apiClient.get('/palm-harvests').then(r => r.data || []).catch(() => [])
    })

    const { data: dashboard = {} } = useQuery({
        queryKey: ['founder-dashboard'],
        queryFn: () => apiClient.get('/dashboard/founder').then(r => r.data)
    })


    const exportToCSV = (data, filename) =>
    {
        const csv = [
            Object.keys(data[0] || {}).join(','),
            ...data.map(row => Object.values(row).join(','))
        ].join('\n')

        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
    }

    const formatDate = (date) => new Date(date).toLocaleDateString()
    const formatCurrency = (amount) => `${(Math.abs(amount || 0)).toLocaleString('en-US')} XAF`

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayExpenses = expenses.filter(e => new Date(e.date).setHours(0, 0, 0, 0) === today.getTime())
    const todayProduction = production.filter(p => new Date(p.date).setHours(0, 0, 0, 0) === today.getTime())
    const todaySales = sales.filter(s => new Date(s.saleDate).setHours(0, 0, 0, 0) === today.getTime())
    const todayOperations = dailyOperations.filter(o =>
    {
        const rowDate = new Date(o.date)
        return rowDate && rowDate.setHours(0, 0, 0, 0) === today.getTime()
    })

    const todayHarvests = palmHarvests.filter(h =>
    {
        const rowDate = new Date(h.harvestDate)
        return rowDate && rowDate.setHours(0, 0, 0, 0) === today.getTime()
    })

    const totalExpenses = Number(dashboard.financial?.totalExpenses ?? 0)
    const totalProduction = production.reduce((sum, p) => sum + (p.quantity * p.cost || 0), 0)
    const totalSales = sales.reduce((sum, s) => sum + (s.totalPrice || 0), 0)

    // compute current palm oil stock: inventory (if present) + total produced litres - total sold litres
    const inventoryPalm = inventories.find(i => (i.productName || '').toLowerCase().includes('palm oil') || (i.productName || '').toLowerCase().includes('palm'))
    const currentPalmOilStock = Number(dashboard.palmOil?.currentStockLitres ?? 0)

    const isLoading = expensesLoading || productionLoading || salesLoading || cattleLoading || palmHarvestsLoading

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Founder Dashboard</h1>
                <p className="text-gray-600 text-sm md:text-base mt-2">Complete system overview and daily reports</p>
            </div>

            {/* Reports Quick Access Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Link to="/founder/reports" className="card bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="flex items-start gap-2 mb-2">
                        <FileText className="text-blue-600 flex-shrink-0" size={20} />
                        <h3 className="font-bold text-gray-900 text-sm md:text-base">Weekly Reports</h3>
                    </div>
                    <p className="text-xs text-gray-600">View all weekly reports and trends</p>
                </Link>

                <Link to="/founder/reports/daily" className="card bg-gradient-to-br from-green-50 to-green-100 border border-green-200 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="flex items-start gap-2 mb-2">
                        <Calendar className="text-green-600 flex-shrink-0" size={20} />
                        <h3 className="font-bold text-gray-900 text-sm md:text-base">Daily Report</h3>
                    </div>
                    <p className="text-xs text-gray-600">Today's summary and activities</p>
                </Link>

                <Link to="/founder/reports/monthly" className="card bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="flex items-start gap-2 mb-2">
                        <TrendingUp className="text-purple-600 flex-shrink-0" size={20} />
                        <h3 className="font-bold text-gray-900 text-sm md:text-base">Monthly Report</h3>
                    </div>
                    <p className="text-xs text-gray-600">Month to date performance</p>
                </Link>

                <Link to="/founder/reports/yearly" className="card bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="flex items-center gap-3 mb-2">
                        <BarChart3 className="text-amber-600" size={24} />
                        <h3 className="font-bold text-gray-900">Yearly Report</h3>
                    </div>
                    <p className="text-xs text-gray-600">Annual overview and analysis</p>
                </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4 md:p-6">
                    <p className="text-green-600 text-xs md:text-sm font-medium">Total Expenses</p>
                    <p className="text-2xl md:text-3xl font-bold text-green-900 mt-2">{formatCurrency(totalExpenses)}</p>
                    <p className="text-xs text-green-700 mt-2">{expenses.length} records including payroll</p>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-4 md:p-6">
                    <div className="flex items-center gap-2">
                        <Wallet className="text-red-600" size={18} />
                        <p className="text-red-600 text-xs md:text-sm font-medium">Total Payroll</p>
                    </div>
                    <p className="text-2xl md:text-3xl font-bold text-red-900 mt-2">{formatCurrency(dashboard.financial?.totalPayroll ?? 0)}</p>
                    <p className="text-xs text-red-700 mt-2">Paid salaries included in expenses</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 md:p-6">
                    <p className="text-blue-600 text-xs md:text-sm font-medium">Production Value</p>
                    <p className="text-2xl md:text-3xl font-bold text-blue-900 mt-2">{formatCurrency(totalProduction)}</p>
                    <p className="text-xs text-blue-700 mt-2">{production.length} records</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4 md:p-6">
                    <p className="text-purple-600 text-xs md:text-sm font-medium">Total Sales</p>
                    <p className="text-2xl md:text-3xl font-bold text-purple-900 mt-2">{formatCurrency(totalSales)}</p>
                    <p className="text-xs text-purple-700 mt-2">{sales.length} records</p>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-lg p-4 md:p-6">
                    <p className="text-amber-600 text-xs md:text-sm font-medium">Active Cattle</p>
                    <p className="text-2xl md:text-3xl font-bold text-amber-900 mt-2">{cattle.length}</p>
                    <p className="text-xs text-amber-700 mt-2">Total in system</p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4 md:p-6">
                    <p className="text-orange-600 text-xs md:text-sm font-medium">Sheep Status</p>
                    <p className="text-2xl md:text-3xl font-bold text-orange-900 mt-2">{dashboard.sheep?.totalSheep ?? 0}</p>
                    <p className="text-xs text-orange-700 mt-2">{dashboard.sheep?.maleSheep ?? 0} male / {dashboard.sheep?.femaleSheep ?? 0} female • {Number(dashboard.sheep?.totalWeightKg ?? 0).toLocaleString()} KG</p>
                </div>

                <div className="bg-gradient-to-br from-teal-50 to-teal-100 border border-teal-200 rounded-lg p-4 md:p-6">
                    <p className="text-teal-600 text-xs md:text-sm font-medium">Total Employees</p>
                    <p className="text-2xl md:text-3xl font-bold text-teal-900 mt-2">{dashboard.company?.totalEmployees ?? 0}</p>
                    <p className="text-xs text-teal-700 mt-2">Active employees</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 md:p-6">
                    <p className="text-blue-600 text-xs md:text-sm font-medium">Current Palm Oil Stock</p>
                    <p className="text-2xl md:text-3xl font-bold text-blue-900 mt-2">{currentPalmOilStock.toLocaleString()} L</p>
                    <p className="text-xs text-blue-700 mt-2">Adjusted by production & sales</p>
                </div>
            </div>

            {/* Daily Reports */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 mb-8">
                {/* Today's Expenses */}
                <div className="card">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Expenses</h2>
                    {todayExpenses.length === 0 ? (
                        <p className="text-gray-500 text-sm">No expenses recorded today</p>
                    ) : (
                        <div className="space-y-2">
                            {todayExpenses.map(e => (
                                <div
                                    key={e.id}
                                    className="flex justify-between items-center p-2 bg-gray-50 rounded hover:bg-red-50 cursor-pointer transition-colors"
                                    onClick={() => { setSelectedItem(e); setSelectedItemType('expense'); }}
                                >
                                    <div>
                                        <p className="font-semibold text-gray-900">{e.category}</p>
                                        <p className="text-xs text-gray-600">{e.description}</p>
                                    </div>
                                    <p className="font-bold text-red-600">{formatCurrency(e.amount)}</p>
                                </div>
                            ))}
                            <div className="border-t pt-2 mt-2 font-bold flex justify-between">
                                <span>Today's Total:</span>
                                <span className="text-red-600">{formatCurrency(todayExpenses.reduce((s, e) => s + (e.amount || 0), 0))}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Today's Production */}
                <div className="card">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Production</h2>
                    {todayProduction.length === 0 ? (
                        <p className="text-gray-500 text-sm">No production recorded today</p>
                    ) : (
                        <div className="space-y-2">
                            {todayProduction.map(p => (
                                <div
                                    key={p.id}
                                    className="flex justify-between items-center p-2 bg-gray-50 rounded hover:bg-green-50 cursor-pointer transition-colors"
                                    onClick={() => { setSelectedItem(p); setSelectedItemType('production'); }}
                                >
                                    <div>
                                        <p className="font-semibold text-gray-900">{p.item}</p>
                                        <p className="text-xs text-gray-600">{p.quantity} {p.unit}</p>
                                    </div>
                                    <p className="font-bold text-green-600">{formatCurrency(p.quantity * p.cost)}</p>
                                </div>
                            ))}
                            <div className="border-t pt-2 mt-2 font-bold flex justify-between">
                                <span>Today's Total:</span>
                                <span className="text-green-600">{formatCurrency(todayProduction.reduce((s, p) => s + (p.quantity * p.cost || 0), 0))}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Today's Sales */}
                <div className="card">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Sales</h2>
                    {todaySales.length === 0 ? (
                        <p className="text-gray-500 text-sm">No sales recorded today</p>
                    ) : (
                        <div className="space-y-2">
                            {todaySales.map(s => (
                                <div
                                    key={s.id}
                                    className="flex justify-between items-center p-2 bg-gray-50 rounded hover:bg-blue-50 cursor-pointer transition-colors"
                                    onClick={() => { setSelectedItem(s); setSelectedItemType('sale'); }}
                                >
                                    <div>
                                        <p className="font-semibold text-gray-900">{s.product}</p>
                                        <p className="text-xs text-gray-600">{s.customerName}</p>
                                    </div>
                                    <p className="font-bold text-blue-600">{formatCurrency(s.totalPrice)}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Today's Harvests */}
                <div className="card bg-gradient-to-br from-palm-50 to-palm-100 border border-palm-200">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Harvests</h2>
                    {todayHarvests.length === 0 ? (
                        <p className="text-gray-600 text-sm">No palm harvests recorded today</p>
                    ) : (
                        <div className="space-y-2">
                            {todayHarvests.map(h => (
                                <div key={h.id} className="flex items-start gap-2 p-2 bg-white rounded border border-palm-200">
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900">{h.harvestId}</p>
                                        <p className="text-xs text-gray-600">{h.numberOfBunches || 0} bunches • {h.totalWeightKg || 0} kg</p>
                                        <p className="text-xs text-gray-500 mt-1">Team: {h.harvestTeam || 'Field team'}</p>
                                    </div>
                                </div>
                            ))}
                            <div className="border-t pt-2 mt-2">
                                <p className="text-sm font-semibold text-palm-900">
                                    Total Harvests: {todayHarvests.length}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Today's Daily Operations */}
                <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Operations</h2>
                    {todayOperations.length === 0 ? (
                        <p className="text-gray-600 text-sm">No daily operations recorded today</p>
                    ) : (
                        <div className="space-y-2">
                            {todayOperations.map(op => (
                                <div key={op.id} className="flex items-start gap-2 p-2 bg-white rounded border border-purple-200">
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900">{op.operationType}</p>
                                        <p className="text-xs text-gray-600">{op.description || 'No details'}</p>
                                        <p className="text-xs text-gray-500 mt-1">By: {op.performedBy || 'Manager'}</p>
                                    </div>
                                </div>
                            ))}
                            <div className="border-t pt-2 mt-2">
                                <p className="text-sm font-semibold text-purple-900">
                                    Total Operations: {todayOperations.length}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* System Stats */}
                <div className="card">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">System Statistics</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-gray-700">Total Expense Records</span>
                            <span className="font-bold">{expenses.length}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-gray-700">Total Production Records</span>
                            <span className="font-bold">{production.length}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-gray-700">Total Sales Records</span>
                            <span className="font-bold">{sales.length}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-gray-700">Cattle in System</span>
                            <span className="font-bold">{cattle.length}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-purple-50 rounded border border-purple-200">
                            <span className="text-gray-700 font-semibold">Daily Operations</span>
                            <span className="font-bold text-purple-600">{dailyOperations.length}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-blue-50 rounded border border-blue-200">
                            <span className="text-gray-700 font-semibold">Production Entries</span>
                            <span className="font-bold text-blue-600">{production.length}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-palm-50 rounded border border-palm-200">
                            <span className="text-gray-700 font-semibold">Palm Harvests</span>
                            <span className="font-bold text-palm-600">{palmHarvests.length}</span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="card bg-gray-50 border-2 border-gray-200 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <AlertCircle size={24} className="text-orange-600" />
                        System Management
                    </h2>

                    <div className="grid grid-cols-3 gap-4">
                        <button
                            onClick={() => exportToCSV(expenses, 'expenses.csv')}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
                        >
                            <Download size={18} />
                            Export Expenses
                        </button>

                        <button
                            onClick={() => exportToCSV(production, 'production.csv')}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 font-semibold"
                        >
                            <Download size={18} />
                            Export Production
                        </button>

                        <button
                            onClick={() => setShowDetails(!showDetails)}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded hover:bg-purple-700 font-semibold"
                        >
                            {showDetails ? <EyeOff size={18} /> : <Eye size={18} />}
                            {showDetails ? 'Hide' : 'Show'} Details
                        </button>
                    </div>

                </div>

                {/* Detailed Data View */}
                {showDetails && (
                    <div className="grid grid-cols-2 gap-8">
                        {/* All Expenses */}
                        <div className="card">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">All Expenses ({expenses.length})</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead className="border-b">
                                        <tr className="text-gray-600 font-semibold">
                                            <th className="text-left py-2">Date</th>
                                            <th className="text-left py-2">Category</th>
                                            <th className="text-left py-2">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {expenses.slice(0, 10).map(e => (
                                            <tr key={e.id} className="border-b">
                                                <td className="py-2">{formatDate(e.date)}</td>
                                                <td className="py-2">{e.category}</td>
                                                <td className="py-2 font-semibold">{formatCurrency(e.amount)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* All Production */}
                        <div className="card">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">All Production ({production.length})</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead className="border-b">
                                        <tr className="text-gray-600 font-semibold">
                                            <th className="text-left py-2">Date</th>
                                            <th className="text-left py-2">Item</th>
                                            <th className="text-left py-2">Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {production.slice(0, 10).map(p => (
                                            <tr key={p.id} className="border-b">
                                                <td className="py-2">{formatDate(p.date)}</td>
                                                <td className="py-2">{p.item}</td>
                                                <td className="py-2 font-semibold">{formatCurrency(p.quantity * p.cost)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Detail View Modal */}
                {selectedItem && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold text-gray-900 capitalize">
                                    {selectedItemType} Details
                                </h2>
                                <button
                                    onClick={() => { setSelectedItem(null); setSelectedItemType(null); }}
                                    className="text-gray-600 hover:text-gray-900"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {selectedItemType === 'expense' && selectedItem && (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-gray-600 font-semibold">Category</p>
                                                <p className="text-lg text-gray-900">{selectedItem.category}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600 font-semibold">Amount</p>
                                                <p className="text-lg font-bold text-red-600">{formatCurrency(selectedItem.amount)}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-gray-600 font-semibold">Description</p>
                                            <p className="text-gray-900">{selectedItem.description}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-gray-600 font-semibold">Date</p>
                                                <p className="text-gray-900">{formatDate(selectedItem.date)}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600 font-semibold">Payment Method</p>
                                                <p className="text-gray-900">{selectedItem.paymentMethod || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {selectedItemType === 'sale' && selectedItem && (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-gray-600 font-semibold">Customer</p>
                                                <p className="text-lg text-gray-900">{selectedItem.customerName}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600 font-semibold">Total Price</p>
                                                <p className="text-lg font-bold text-blue-600">{formatCurrency(selectedItem.totalPrice)}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-gray-600 font-semibold">Product</p>
                                                <p className="text-gray-900">{selectedItem.product}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600 font-semibold">Quantity (Litres)</p>
                                                <p className="text-gray-900">{selectedItem.quantityLitres} L</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-gray-600 font-semibold">Unit Price</p>
                                                <p className="text-gray-900">{formatCurrency(selectedItem.unitPrice)}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600 font-semibold">Payment Status</p>
                                                <span className={`px-3 py-1 rounded text-sm font-semibold ${selectedItem.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {selectedItem.paymentStatus}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-gray-600 font-semibold">Date</p>
                                            <p className="text-gray-900">{formatDate(selectedItem.saleDate)}</p>
                                        </div>
                                    </>
                                )}

                                {selectedItemType === 'production' && selectedItem && (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-gray-600 font-semibold">Item</p>
                                                <p className="text-lg text-gray-900">{selectedItem.item}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600 font-semibold">Total Value</p>
                                                <p className="text-lg font-bold text-green-600">{formatCurrency(selectedItem.quantity * selectedItem.cost)}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-gray-600 font-semibold">Quantity</p>
                                                <p className="text-gray-900">{selectedItem.quantity} {selectedItem.unit}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600 font-semibold">Unit Cost</p>
                                                <p className="text-gray-900">{formatCurrency(selectedItem.cost)}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-gray-600 font-semibold">Date</p>
                                            <p className="text-gray-900">{formatDate(selectedItem.date)}</p>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={() => { setSelectedItem(null); setSelectedItemType(null); }}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded hover:bg-gray-300 font-semibold"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}
