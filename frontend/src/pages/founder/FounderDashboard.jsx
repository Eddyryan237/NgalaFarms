import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle, Trash2, RefreshCw, Download, Eye, EyeOff } from 'lucide-react'
import apiClient from '../../lib/api'

export default function FounderDashboard()
{
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [showDetails, setShowDetails] = useState(false)

    // Fetch all system data
    const { data: expenses = [], isLoading: expensesLoading, refetch: refetchExpenses } = useQuery({
        queryKey: ['all-expenses'],
        queryFn: () => apiClient.get('/api/expenses').then(r => r.data).catch(() => [])
    })

    const { data: production = [], isLoading: productionLoading, refetch: refetchProduction } = useQuery({
        queryKey: ['all-production'],
        queryFn: () => apiClient.get('/api/production').then(r => r.data).catch(() => [])
    })

    const { data: sales = [], isLoading: salesLoading, refetch: refetchSales } = useQuery({
        queryKey: ['all-sales'],
        queryFn: () => apiClient.get('/api/sales').then(r => r.data).catch(() => [])
    })

    const { data: cattle = [], isLoading: cattleLoading, refetch: refetchCattle } = useQuery({
        queryKey: ['all-cattle'],
        queryFn: () => apiClient.get('/api/cattle').then(r => r.data).catch(() => [])
    })

    const { data: dailyOperations = [], isLoading: operationsLoading } = useQuery({
        queryKey: ['all-daily-operations'],
        queryFn: () => apiClient.get('/api/daily-operations').then(r => r.data).catch(() => [])
    })

    const handleClearAllData = async () =>
    {
        try
        {
            await apiClient.post('/api/admin/clear-data')
            alert('✅ All data cleared successfully. System reset for testing.')
            refetchExpenses()
            refetchProduction()
            refetchSales()
            refetchCattle()
            setShowDeleteConfirm(false)
        } catch (err)
        {
            alert('Error clearing data: ' + err.response?.data?.message)
        }
    }

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
    const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(amount || 0))

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayExpenses = expenses.filter(e => new Date(e.createdAt).setHours(0, 0, 0, 0) === today.getTime())
    const todayProduction = production.filter(p => new Date(p.date).setHours(0, 0, 0, 0) === today.getTime())
    const todaySales = sales.filter(s => new Date(s.saleDate).setHours(0, 0, 0, 0) === today.getTime())
    const todayOperations = dailyOperations.filter(o => new Date(o.date).setHours(0, 0, 0, 0) === today.getTime())

    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)
    const totalProduction = production.reduce((sum, p) => sum + (p.quantity * p.cost || 0), 0)
    const totalSales = sales.reduce((sum, s) => sum + (s.totalPrice || 0), 0)

    const isLoading = expensesLoading || productionLoading || salesLoading || cattleLoading

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900">Founder Dashboard</h1>
                <p className="text-gray-600 mt-2">Complete system overview and daily reports</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
                    <p className="text-green-600 text-sm font-medium">Total Expenses</p>
                    <p className="text-3xl font-bold text-green-900 mt-2">{formatCurrency(totalExpenses)}</p>
                    <p className="text-xs text-green-700 mt-2">{expenses.length} records</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
                    <p className="text-blue-600 text-sm font-medium">Production Value</p>
                    <p className="text-3xl font-bold text-blue-900 mt-2">{formatCurrency(totalProduction)}</p>
                    <p className="text-xs text-blue-700 mt-2">{production.length} records</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6">
                    <p className="text-purple-600 text-sm font-medium">Total Sales</p>
                    <p className="text-3xl font-bold text-purple-900 mt-2">{formatCurrency(totalSales)}</p>
                    <p className="text-xs text-purple-700 mt-2">{sales.length} records</p>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-lg p-6">
                    <p className="text-amber-600 text-sm font-medium">Active Cattle</p>
                    <p className="text-3xl font-bold text-amber-900 mt-2">{cattle.length}</p>
                    <p className="text-xs text-amber-700 mt-2">Total in system</p>
                </div>
            </div>

            {/* Daily Reports */}
            <div className="grid grid-cols-2 gap-8 mb-8">
                {/* Today's Expenses */}
                <div className="card">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Expenses</h2>
                    {todayExpenses.length === 0 ? (
                        <p className="text-gray-500 text-sm">No expenses recorded today</p>
                    ) : (
                        <div className="space-y-2">
                            {todayExpenses.map(e => (
                                <div key={e.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
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
                                <div key={p.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
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
                                <div key={s.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
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

                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                        <p className="text-red-700 font-semibold mb-3">⚠️ Danger Zone - Clear All Data</p>
                        <p className="text-red-600 text-sm mb-4">This will permanently delete all records for accurate testing. This action cannot be undone.</p>
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded hover:bg-red-700 font-semibold w-full"
                        >
                            <Trash2 size={18} />
                            Clear All Data for Testing
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

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm Data Clearance</h2>
                            <p className="text-gray-600 mb-4">
                                Are you sure you want to delete all data? This action is <strong>irreversible</strong>.
                            </p>
                            <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                                <p className="text-red-700 text-sm">
                                    ⚠️ All expenses, production records, sales, and other data will be permanently deleted.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded hover:bg-gray-300 font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleClearAllData}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-semibold"
                                >
                                    Yes, Clear All Data
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
