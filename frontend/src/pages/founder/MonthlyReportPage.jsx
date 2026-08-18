import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Download, Printer, Calendar } from 'lucide-react'
import apiClient from '../../lib/api'

export default function MonthlyReportPage()
{
    const [months, setMonths] = useState(1)
    const [report, setReport] = useState(null)
    const [loading, setLoading] = useState(false)
    const [selectedItem, setSelectedItem] = useState(null)

    const generate = async () =>
    {
        setLoading(true)
        try
        {
            const res = await apiClient.get(`/reports/monthly?months=${months}`)
            setReport(res.data)
        } catch (err)
        {
            alert('Failed to generate report: ' + (err.response?.data?.message || err.message))
            setReport(null)
        } finally
        {
            setLoading(false)
        }
    }

    useEffect(() =>
    {
        generate()
    }, [])

    const formatCurrency = (amount) => `${(Math.abs(amount || 0)).toLocaleString('en-US')} XAF`
    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString()

    const totalExpenses = report?.expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0
    const totalSales = report?.sales?.reduce((sum, s) => sum + (s.totalPrice || 0), 0) || 0
    const profit = totalSales - totalExpenses
    const margin = totalSales > 0 ? ((profit / totalSales) * 100).toFixed(2) : 0

    return (
        <div>
            <div className="mb-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Monthly Report</h1>
                        <p className="text-gray-600 mt-2">Performance metrics for selected period</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="btn-secondary flex items-center gap-2">
                            <Download size={18} />
                            Export
                        </button>
                        <button className="btn-secondary flex items-center gap-2">
                            <Printer size={18} />
                            Print
                        </button>
                    </div>
                </div>
            </div>

            {/* Period Selector */}
            <div className="card mb-8">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Calendar size={20} className="text-palm-600" />
                        <label className="text-gray-700 font-semibold">Last</label>
                        <input
                            type="number"
                            min={1}
                            max={12}
                            value={months}
                            onChange={e => setMonths(Number(e.target.value))}
                            className="input-field w-24"
                        />
                        <span className="text-gray-700">month(s)</span>
                    </div>
                    <button
                        onClick={generate}
                        disabled={loading}
                        className="btn-primary disabled:opacity-50"
                    >
                        {loading ? 'Generating...' : 'Generate Report'}
                    </button>
                </div>
            </div>

            {loading && (
                <div className="card">
                    <div className="flex items-center justify-center p-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-palm-600"></div>
                    </div>
                </div>
            )}

            {report && (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-4 gap-4 mb-8">
                        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-6">
                            <p className="text-red-600 text-sm font-medium">Total Expenses</p>
                            <p className="text-3xl font-bold text-red-900 mt-2">{formatCurrency(totalExpenses)}</p>
                            <p className="text-xs text-red-700 mt-2">{report.expenses?.length || 0} entries</p>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
                            <p className="text-green-600 text-sm font-medium">Total Revenue</p>
                            <p className="text-3xl font-bold text-green-900 mt-2">{formatCurrency(totalSales)}</p>
                            <p className="text-xs text-green-700 mt-2">{report.sales?.length || 0} sales</p>
                        </div>

                        <div className={`bg-gradient-to-br ${profit >= 0 ? 'from-blue-50 to-blue-100 border border-blue-200' : 'from-yellow-50 to-yellow-100 border border-yellow-200'} rounded-lg p-6`}>
                            <p className={`${profit >= 0 ? 'text-blue-600' : 'text-yellow-600'} text-sm font-medium`}>Net Profit</p>
                            <p className={`text-3xl font-bold ${profit >= 0 ? 'text-blue-900' : 'text-yellow-900'} mt-2`}>{formatCurrency(profit)}</p>
                            <p className={`text-xs ${profit >= 0 ? 'text-blue-700' : 'text-yellow-700'} mt-2`}>{margin}% margin</p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6">
                            <p className="text-purple-600 text-sm font-medium">Period</p>
                            <p className="text-lg font-bold text-purple-900 mt-2">{months} month{months > 1 ? 's' : ''}</p>
                            <p className="text-xs text-purple-700 mt-2">From {formatDate(report.start)}</p>
                        </div>
                    </div>

                    {/* Detailed Sections */}
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        {/* Expenses */}
                        <div className="card">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Expenses ({report.expenses?.length || 0})</h2>
                            {report.expenses && report.expenses.length > 0 ? (
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {report.expenses.map((e, idx) => (
                                        <div
                                            key={e.id || idx}
                                            className="p-3 bg-red-50 rounded border border-red-200 hover:shadow cursor-pointer transition"
                                            onClick={() => setSelectedItem({ ...e, type: 'expense' })}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold text-gray-900">{e.category}</p>
                                                    <p className="text-xs text-gray-600">{formatDate(e.date)}</p>
                                                </div>
                                                <p className="font-bold text-red-600">{formatCurrency(e.amount)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">No expenses recorded</p>
                            )}
                        </div>

                        {/* Sales */}
                        <div className="card">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Sales ({report.sales?.length || 0})</h2>
                            {report.sales && report.sales.length > 0 ? (
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {report.sales.map((s, idx) => (
                                        <div
                                            key={s.id || idx}
                                            className="p-3 bg-green-50 rounded border border-green-200 hover:shadow cursor-pointer transition"
                                            onClick={() => setSelectedItem({ ...s, type: 'sale' })}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold text-gray-900">{s.product}</p>
                                                    <p className="text-xs text-gray-600">{formatDate(s.saleDate)} • {s.quantityLitres}L</p>
                                                </div>
                                                <p className="font-bold text-green-600">{formatCurrency(s.totalPrice)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">No sales recorded</p>
                            )}
                        </div>

                        {/* Production */}
                        <div className="card">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Production ({report.production?.length || 0})</h2>
                            {report.production && report.production.length > 0 ? (
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {report.production.map((p, idx) => (
                                        <div
                                            key={p.id || idx}
                                            className="p-3 bg-blue-50 rounded border border-blue-200 hover:shadow cursor-pointer transition"
                                            onClick={() => setSelectedItem({ ...p, type: 'production' })}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold text-gray-900">{p.item}</p>
                                                    <p className="text-xs text-gray-600">{formatDate(p.date)} • {p.quantity} {p.unit}</p>
                                                </div>
                                                <p className="font-bold text-blue-600">{formatCurrency(p.quantity * p.cost)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">No production recorded</p>
                            )}
                        </div>

                        {/* Operations */}
                        <div className="card">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Operations ({report.operations?.length || 0})</h2>
                            {report.operations && report.operations.length > 0 ? (
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {report.operations.map((op, idx) => (
                                        <div
                                            key={op.id || idx}
                                            className="p-3 bg-purple-50 rounded border border-purple-200 hover:shadow cursor-pointer transition"
                                            onClick={() => setSelectedItem({ ...op, type: 'operation' })}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold text-gray-900">{op.operationType}</p>
                                                    <p className="text-xs text-gray-600">{formatDate(op.date)}</p>
                                                </div>
                                                <p className="text-xs font-semibold text-purple-600">{op.performedBy || 'Manager'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">No operations recorded</p>
                            )}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="mb-8 p-4 bg-gray-50 rounded flex gap-3 justify-center flex-wrap">
                        <Link to="/founder" className="btn-secondary flex items-center gap-2">
                            <ArrowLeft size={18} />
                            Back to Dashboard
                        </Link>
                        <Link to="/founder/reports" className="btn-secondary">Weekly Reports</Link>
                        <Link to="/founder/reports/daily" className="btn-secondary">Daily Report</Link>
                        <Link to="/founder/reports/yearly" className="btn-secondary">Yearly Report</Link>
                    </div>

                    {/* Raw Data */}
                    <div className="card">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Raw Report Data</h2>
                        <pre className="text-xs overflow-auto bg-gray-900 text-gray-100 p-4 rounded" style={{ maxHeight: '300px' }}>
                            {JSON.stringify(report, null, 2)}
                        </pre>
                    </div>
                </>
            )}

            {/* Detail Modal */}
            {selectedItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900 capitalize">{selectedItem.type} Details</h2>
                            <button
                                onClick={() => setSelectedItem(null)}
                                className="text-gray-600 hover:text-gray-900 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                            {Object.entries(selectedItem).map(([key, value]) =>
                            {
                                if (key === 'type' || value === null || value === undefined) return null
                                return (
                                    <div key={key} className="border-b pb-2">
                                        <p className="text-xs text-gray-600 font-semibold">{key}</p>
                                        <p className="text-gray-900">{String(value)}</p>
                                    </div>
                                )
                            })}
                        </div>

                        <button
                            onClick={() => setSelectedItem(null)}
                            className="btn-secondary w-full mt-4"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
