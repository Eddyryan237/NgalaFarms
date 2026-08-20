import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Printer, TrendingUp } from 'lucide-react'
import apiClient from '../../lib/api'
import { exportReport, saveReport } from '../../lib/reportExport'

export default function WeeklyReportDetail()
{
    const { id } = useParams()
    const navigate = useNavigate()
    const [report, setReport] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() =>
    {
        if (!id) return
        const fetchReport = async () =>
        {
            try
            {
                const r = await apiClient.get(`/reports/${id}`)
                setReport(r.data)
            } catch (err)
            {
                setReport(null)
            } finally
            {
                setLoading(false)
            }
        }
        fetchReport()
    }, [id])

    if (loading)
    {
        return (
            <div className="card">
                <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-palm-600"></div>
                </div>
            </div>
        )
    }

    if (!report) return (
        <div className="card bg-yellow-50 border border-yellow-200">
            <p className="text-yellow-700 font-semibold">Report not found</p>
            <button className="btn-secondary mt-4" onClick={() => navigate(-1)}>Back</button>
        </div>
    )

    const formatCurrency = (amount) => `${(Math.abs(amount || 0)).toLocaleString('en-US')} XAF`
    const formatDate = (date) => new Date(date).toLocaleDateString()
    const weekStart = new Date(report.weekStart).toISOString().split('T')[0]

    // Calculate metrics
    const totalExpenses = report.totalExpenses || 0
    const totalRevenue = report.totalRevenue || 0
    const netProfit = totalRevenue - totalExpenses
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) : 0

    return (
        <div>
            <div className="mb-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Weekly Report</h1>
                        <p className="text-gray-600 mt-2">{report.weekLabel || 'Report Details'}</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => exportReport(report, `weekly-report-${weekStart}`)} className="btn-secondary flex items-center gap-2">
                            <Download size={18} />
                            Export
                        </button>
                        <button onClick={saveReport} className="btn-secondary flex items-center gap-2">
                            <Printer size={18} />
                            Save PDF
                        </button>
                        <button className="btn-secondary flex items-center gap-2" onClick={() => navigate(-1)}>
                            <ArrowLeft size={18} />
                            Back
                        </button>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
                    <p className="text-green-600 text-sm font-medium">Total Revenue</p>
                    <p className="text-3xl font-bold text-green-900 mt-2">{formatCurrency(totalRevenue)}</p>
                    <p className="text-xs text-green-700 mt-2">{report.salesCount || 0} sales recorded</p>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-6">
                    <p className="text-red-600 text-sm font-medium">Total Expenses</p>
                    <p className="text-3xl font-bold text-red-900 mt-2">{formatCurrency(totalExpenses)}</p>
                    <p className="text-xs text-red-700 mt-2">{report.expenseCount || 0} expenses recorded</p>
                </div>

                <div className={`bg-gradient-to-br ${netProfit >= 0 ? 'from-blue-50 to-blue-100 border border-blue-200' : 'from-yellow-50 to-yellow-100 border border-yellow-200'} rounded-lg p-6`}>
                    <p className={`${netProfit >= 0 ? 'text-blue-600' : 'text-yellow-600'} text-sm font-medium`}>Net Profit</p>
                    <p className={`text-3xl font-bold ${netProfit >= 0 ? 'text-blue-900' : 'text-yellow-900'} mt-2`}>{formatCurrency(netProfit)}</p>
                    <p className={`text-xs ${netProfit >= 0 ? 'text-blue-700' : 'text-yellow-700'} mt-2`}>{profitMargin}% margin</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6">
                    <p className="text-purple-600 text-sm font-medium">Period</p>
                    <p className="text-xl font-bold text-purple-900 mt-2">{formatDate(report.weekStart)}</p>
                    <p className="text-xs text-purple-700 mt-2">Generated {formatDate(report.generatedAt)}</p>
                </div>
            </div>

            {/* Detailed Report */}
            <div className="grid grid-cols-2 gap-8 mb-8">
                {/* Production Data */}
                <div className="card">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp size={20} className="text-green-600" />
                        Production Summary
                    </h2>
                    {report.palmOilProducedLitres !== undefined && (
                        <div className="space-y-3">
                            <div className="p-3 bg-green-50 rounded">
                                <p className="text-sm text-gray-600">Palm Oil Produced (L)</p>
                                <p className="text-2xl font-bold text-green-900">{report.palmOilProducedLitres?.toLocaleString() ?? 0} L</p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded">
                                <p className="text-sm text-gray-600">Palm Oil Sold (L)</p>
                                <p className="text-2xl font-bold text-blue-900">{report.palmOilSoldLitres?.toLocaleString() ?? 0} L</p>
                            </div>
                            <div className="p-3 bg-purple-50 rounded">
                                <p className="text-sm text-gray-600">Remaining Stock (L)</p>
                                <p className="text-2xl font-bold text-purple-900">{report.palmOilRemainingLitres?.toLocaleString() ?? 0} L</p>
                            </div>
                        </div>
                    )}
                    {report.productionCount && (
                        <p className="text-xs text-gray-600 mt-4">{report.productionCount} production entries</p>
                    )}
                </div>

                {/* Key Metrics */}
                <div className="card">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Key Metrics</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <span className="text-gray-700">Average Sale Price</span>
                            <span className="font-bold text-gray-900">{report.salesCount && report.totalRevenue ? formatCurrency(report.totalRevenue / report.salesCount) : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <span className="text-gray-700">Average Daily Expenses</span>
                            <span className="font-bold text-gray-900">{formatCurrency((totalExpenses / 7).toFixed(2))}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <span className="text-gray-700">Profit Margin</span>
                            <span className="font-bold text-gray-900">{profitMargin}%</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <span className="text-gray-700">Days in Period</span>
                            <span className="font-bold text-gray-900">7</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Links */}
            <div className="mb-8 p-4 bg-gray-50 rounded flex gap-3 justify-center flex-wrap">
                <Link to="/founder/reports" className="btn-secondary">← Back to Reports</Link>
                <Link to={`/founder/reports/daily?date=${weekStart}`} className="btn-secondary">Daily Report</Link>
                <Link to="/founder/reports/monthly" className="btn-secondary">Monthly Report</Link>
                <Link to="/founder/reports/yearly" className="btn-secondary">Yearly Report</Link>
            </div>

            {/* Raw Data */}
            <div className="card">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Raw Report Data</h2>
                <pre className="text-xs overflow-auto bg-gray-900 text-gray-100 p-4 rounded" style={{ maxHeight: '300px' }}>
                    {JSON.stringify(report, null, 2)}
                </pre>
            </div>
        </div>
    )
}
