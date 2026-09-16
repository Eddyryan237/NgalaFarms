import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import apiClient from '../../lib/api'
import { useToast } from '../../hooks/useToast'

export default function GeneralReportsPage()
{
    const categories = ['Palm', 'Cattle', 'Sheep']
    const queryClient = useQueryClient()
    const { showToast } = useToast()
    const [category, setCategory] = useState('Palm')
    const [report, setReport] = useState('')
    const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0])

    const { data: reports = [], isLoading, isError } = useQuery({
        queryKey: ['general-activity-reports'],
        queryFn: () => apiClient.get('/general-activity-reports').then(response =>
        {
            const payload = response.data
            return Array.isArray(payload) ? payload : (Array.isArray(payload?.data) ? payload.data : [])
        })
    })

    const saveMutation = useMutation({
        mutationFn: payload => apiClient.post('/general-activity-reports', payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['general-activity-reports'] })
            setReport('')
            showToast('General report submitted successfully.', 'success')
        },
        onError: error => showToast(error.response?.data?.message || 'Unable to submit report.', 'error')
    })

    const handleSubmit = event => {
        event.preventDefault()
        if (!report.trim()) {
            showToast('Write a report before submitting.', 'error')
            return
        }
        saveMutation.mutate({ category, report, reportDate })
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">General Report</h1>
                    <p className="text-gray-600 mt-1">Record a summary of the activities completed by category.</p>
                </div>
                <Link to="/manager/dashboard" className="btn-secondary">Dashboard</Link>
            </div>

            <form onSubmit={handleSubmit} className="card space-y-4">
                <h2 className="text-xl font-bold text-gray-900">Submit Activity Report</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <select value={category} onChange={event => setCategory(event.target.value)} className="input-field">
                            {categories.map(item => <option key={item} value={item}>{item}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Activity date</label>
                        <input type="date" value={reportDate} onChange={event => setReportDate(event.target.value)} className="input-field" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">General report</label>
                    <textarea value={report} onChange={event => setReport(event.target.value)} rows="6" className="input-field" placeholder={`Describe the ${category.toLowerCase()} activities, progress, issues, and next steps...`} />
                </div>
                <button type="submit" disabled={saveMutation.isPending} className="btn-primary disabled:opacity-50">
                    {saveMutation.isPending ? 'Submitting...' : 'Submit Report'}
                </button>
            </form>

            <section className="card">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Submitted Reports</h2>
                {isLoading && <p className="text-gray-500">Loading reports...</p>}
                {isError && <p className="text-red-600">Unable to load general reports.</p>}
                {!isLoading && reports.length === 0 && <p className="text-gray-500">No general reports submitted yet.</p>}
                <div className="space-y-3">
                    {reports.map(item => (
                        <article key={item.id} className="border-b border-gray-100 pb-3 last:border-0">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                <h3 className="font-semibold text-gray-900">{item.category} activity</h3>
                                <p className="text-sm text-gray-500">{new Date(item.reportDate).toLocaleDateString()} by {item.submittedBy || 'Manager'}</p>
                            </div>
                            <p className="text-gray-700 mt-2 whitespace-pre-wrap">{item.report}</p>
                        </article>
                    ))}
                </div>
            </section>
        </div>
    )
}
