import { useQuery } from '@tanstack/react-query'
import { FileText, Download } from 'lucide-react'
import apiClient from '../../lib/api'

export default function WeeklyReportsPage()
{
    const { data: reports } = useQuery({
        queryKey: ['weekly-reports'],
        queryFn: () => apiClient.get('/reports').then(r => r.data)
    })

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Weekly Reports</h1>
                <button className="btn-primary">Generate Report</button>
            </div>

            <div className="space-y-4">
                {reports?.map((report) => (
                    <div key={report.id} className="card">
                        <div className="flex justify-between items-start">
                            <div className="flex items-start gap-4">
                                <FileText className="w-10 h-10 text-palm-600 mt-1" />
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">{report.weekLabel}</h3>
                                    <p className="text-gray-600 text-sm">
                                        Revenue: {report.totalRevenue?.toLocaleString()} XAF |
                                        Expenses: {report.totalExpenses?.toLocaleString()} XAF |
                                        Profit: {report.netProfit?.toLocaleString()} XAF
                                    </p>
                                </div>
                            </div>
                            <button className="btn-secondary flex items-center gap-2">
                                <Download size={16} />
                                PDF
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
