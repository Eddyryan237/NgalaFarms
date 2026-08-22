import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import apiClient from '../../lib/api'

export default function GeneralReportsPage()
{
    const { data, isLoading, error } = useQuery({ queryKey: ['general-report'], queryFn: () => apiClient.get('/reports/general').then(r => r.data) })
    if (isLoading) return <div className="card">Loading general report...</div>
    if (error) return <div className="card text-red-600">Unable to load the general report.</div>
    return <div className="space-y-6"><div className="flex justify-between items-center"><div><h1 className="text-3xl font-bold text-gray-900">General Reports</h1><p className="text-gray-600 mt-1">Cattle, sheep, and palm-oil overview</p></div><Link to="/founder/reports" className="btn-secondary">Weekly Reports</Link></div><div className="grid grid-cols-1 md:grid-cols-3 gap-6"><section className="card"><h2 className="font-bold text-lg">Cattle</h2><p className="text-3xl font-bold mt-3">{data.cattle.total}</p><p>Total weight: {data.cattle.totalWeightKg} KG</p><div className="mt-3 space-y-1">{data.cattle.byCategory.map(row => <p key={row.category || 'uncategorized'} className="flex justify-between"><span>{row.category || 'Uncategorized'}</span><strong>{row.count}</strong></p>)}</div></section><section className="card"><h2 className="font-bold text-lg">Sheep</h2><p className="text-3xl font-bold mt-3">{data.sheep.total}</p><p>Male: {data.sheep.male} | Female: {data.sheep.female}</p><p className="mt-2">Total weight: {data.sheep.totalWeightKg} KG</p></section><section className="card"><h2 className="font-bold text-lg">Palm Oil</h2><p className="mt-3">Fruit harvested: <strong>{data.palmOil.harvestKg} KG</strong></p><p>Oil produced: <strong>{data.palmOil.producedLitres} L</strong></p><p>Processing cost: <strong>{data.palmOil.processingCost.toLocaleString()} XAF</strong></p></section></div></div>
}
