import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { FileText, Download, TrendingUp, Calendar } from 'lucide-react'
import apiClient from '../../lib/api'

export default function WeeklyReportsPage()
{
    const { data: reports, isLoading } = useQuery({
        queryKey: ['weekly-reports'],
        queryFn: () => apiClient.get('/reports').then(r => r.data || []).catch(() => [])
    })

    const formatCurrency = (amount) => `${(Math.abs(amount || 0)).toLocaleString('en-US')} XAF`
    const formatDate = (date) => new Date(date).toLocaleDateString()

    if (isLoading)
    {
        return (
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Weekly Reports</h1>
                <div className="card flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-palm-600"></div>
                </div>
            </div>
        )
    }

    return (
        <div>
            <div className="mb-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Weekly Reports</h1>
                        <p className="text-gray-600 mt-2">View all weekly performance reports</p>
                    </div>
                    <div className="flex gap-3">
                        <Link to="/founder" className="btn-secondary">← Dashboard</Link>
                        <Link to="/founder/reports/daily" className="btn-secondary">Daily Report</Link>
                        <Link to="/founder/reports/monthly" className="btn-secondary">Monthly Report</Link>
                    </div>
                </div>
            </div>

            {!reports || reports.length === 0 ? (
                <div className="card bg-gray-50">
                    <p className="text-gray-600 text-center py-8">No reports generated yet. Reports will appear once data is recorded.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reports.map((report) =>
                    {
                        const revenue = report.totalRevenue || 0
                        const expenses = report.totalExpenses || 0
                        const profit = revenue - expenses
                        const margin = revenue > 0 ? ((profit / revenue) * 100).toFixed(2) : 0

                        return (
                            <Link
                                key={report.id}
                                to={`/founder/reports/${report.id}`}
                                className="card hover:shadow-lg transition-shadow block group"
                            >
                                <div className="flex justify-between items-start gap-6">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="p-3 bg-blue-50 rounded">
                                            <FileText className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg text-gray-900 group-hover:text-palm-600 transition">{report.weekLabel || `Week of ${formatDate(report.weekStart)}`}</h3>
                                            <p className="text-gray-600 text-sm mt-1">
                                                {report.salesCount || 0} sales • {report.expenseCount || 0} expenses
                                            </p>
                                            <p className="text-gray-500 text-xs mt-2">Generated: {formatDate(report.generatedAt)}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 min-w-max">
                                        <div className="text-right">
                                            <p className="text-green-600 text-xs font-semibold">REVENUE</p>
                                            <p className="text-green-900 font-bold text-lg">{formatCurrency(revenue)}</p>
                                        </div>
                                        <div className="text-right border-l border-gray-200 pl-4">
                                            <p className="text-red-600 text-xs font-semibold">EXPENSES</p>
                                            <p className="text-red-900 font-bold text-lg">{formatCurrency(expenses)}</p>
                                        </div>
                                        <div className="text-right border-l border-gray-200 pl-4">
                                            <p className={`${profit >= 0 ? 'text-blue-600' : 'text-yellow-600'} text-xs font-semibold`}>PROFIT</p>
                                            <p className={`${profit >= 0 ? 'text-blue-900' : 'text-yellow-900'} font-bold text-lg`}>{formatCurrency(profit)}</p>
                                            <p className={`text-xs font-semibold ${profit >= 0 ? 'text-blue-600' : 'text-yellow-600'}`}>{margin}%</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button className="btn-secondary flex items-center gap-2" onClick={(e) => { e.preventDefault(); }}>
                                            <Download size={16} />
                                            Export
                                        </button>
                                    </div>
                                </div>

                                {/* Palm Oil Stats */}
                                {(report.palmOilProducedLitres || report.palmOilSoldLitres) && (
                                    <div className="mt-4 pt-4 border-t flex gap-4 text-sm">
                                        {report.palmOilProducedLitres && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-600">Palm Produced:</span>
                                                <span className="font-semibold text-green-600">{report.palmOilProducedLitres?.toLocaleString()} L</span>
                                            </div>
                                        )}
                                        {report.palmOilSoldLitres && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-600">Palm Sold:</span>
                                                <span className="font-semibold text-blue-600">{report.palmOilSoldLitres?.toLocaleString()} L</span>
                                            </div>
                                        )}
                                        {report.palmOilRemainingLitres && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-600">Stock Remaining:</span>
                                                <span className="font-semibold text-purple-600">{report.palmOilRemainingLitres?.toLocaleString()} L</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Link>
                        )
                    })}
                </div>
            )}

            {/* Quick Links */}
            <div className="mt-12 p-6 bg-gray-50 rounded">
                <h3 className="font-bold text-gray-900 mb-4">Quick Navigation</h3>
                <div className="grid grid-cols-4 gap-4">
                    <Link to="/founder" className="card text-center hover:shadow">
                        <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-gray-900">Dashboard</p>
                    </Link>
                    <Link to="/founder/reports/daily" className="card text-center hover:shadow">
                        <FileText className="w-6 h-6 text-green-600 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-gray-900">Daily Report</p>
                    </Link>
                    <Link to="/founder/reports/monthly" className="card text-center hover:shadow">
                        <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-gray-900">Monthly Report</p>
                    </Link>
                    <Link to="/founder/reports/yearly" className="card text-center hover:shadow">
                        <TrendingUp className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-gray-900">Yearly Report</p>
                    </Link>
                </div>
            </div>
        </div>
    )
}
