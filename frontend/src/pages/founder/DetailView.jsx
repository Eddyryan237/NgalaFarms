import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Printer } from 'lucide-react'
import apiClient from '../../lib/api'

export default function DetailView()
{
    const { type, id } = useParams()
    const navigate = useNavigate()
    const [item, setItem] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() =>
    {
        if (!type || !id)
        {
            setError('Invalid parameters')
            setLoading(false)
            return
        }

        const fetchData = async () =>
        {
            try
            {
                setLoading(true)
                let endpoint = `/${type}/${id}`

                // Map common types to API endpoints
                const typeMap = {
                    'expense': '/expenses',
                    'expenses': '/expenses',
                    'sale': '/sales',
                    'sales': '/sales',
                    'production': '/production',
                    'inventory': '/inventories',
                    'cattle': '/cattle',
                    'harvest': '/palm-harvests',
                    'operation': '/daily-operations'
                }

                if (typeMap[type.toLowerCase()])
                {
                    endpoint = `${typeMap[type.toLowerCase()]}/${id}`
                }

                const res = await apiClient.get(endpoint)
                setItem(res.data)
                setError(null)
            } catch (err)
            {
                setError('Failed to load details: ' + (err.response?.data?.message || err.message))
                setItem(null)
            } finally
            {
                setLoading(false)
            }
        }

        fetchData()
    }, [type, id])

    const formatDate = (date) => new Date(date).toLocaleDateString()
    const formatCurrency = (amount) => `${(Math.abs(amount || 0)).toLocaleString('en-US')} XAF`

    const renderField = (key, value) =>
    {
        if (value === null || value === undefined || value === '') return null

        // Skip internal fields
        if (['id', 'createdAt', 'updatedAt', 'isDeleted', '$type'].includes(key)) return null

        // Format specific fields
        if (key.toLowerCase().includes('date') || key.toLowerCase().includes('time'))
        {
            return (
                <div key={key} className="py-3 border-b">
                    <p className="text-gray-600 font-semibold text-sm">{formatKeyName(key)}</p>
                    <p className="text-gray-900 mt-1">{formatDate(value)}</p>
                </div>
            )
        }

        if (key.toLowerCase().includes('price') || key.toLowerCase().includes('amount') || key.toLowerCase().includes('cost'))
        {
            return (
                <div key={key} className="py-3 border-b">
                    <p className="text-gray-600 font-semibold text-sm">{formatKeyName(key)}</p>
                    <p className="text-gray-900 font-bold mt-1">{formatCurrency(value)}</p>
                </div>
            )
        }

        if (typeof value === 'object')
        {
            return (
                <div key={key} className="py-3 border-b">
                    <p className="text-gray-600 font-semibold text-sm">{formatKeyName(key)}</p>
                    <pre className="text-xs mt-1 bg-gray-50 p-2 rounded overflow-auto">{JSON.stringify(value, null, 2)}</pre>
                </div>
            )
        }

        return (
            <div key={key} className="py-3 border-b">
                <p className="text-gray-600 font-semibold text-sm">{formatKeyName(key)}</p>
                <p className="text-gray-900 mt-1">{String(value)}</p>
            </div>
        )
    }

    const formatKeyName = (key) =>
    {
        return key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim()
    }

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

    if (error)
    {
        return (
            <div className="card bg-red-50 border border-red-200">
                <div className="flex justify-between items-center mb-4">
                    <button className="btn-secondary flex items-center gap-2" onClick={() => navigate(-1)}>
                        <ArrowLeft size={18} />
                        Back
                    </button>
                </div>
                <p className="text-red-600 font-semibold">{error}</p>
            </div>
        )
    }

    if (!item)
    {
        return (
            <div className="card bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                    <button className="btn-secondary flex items-center gap-2" onClick={() => navigate(-1)}>
                        <ArrowLeft size={18} />
                        Back
                    </button>
                </div>
                <p className="text-gray-600">No details available</p>
            </div>
        )
    }

    return (
        <div>
            <div className="mb-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 capitalize">{type} Details</h1>
                        <p className="text-gray-600 mt-2">Full record information</p>
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
                        <button className="btn-secondary flex items-center gap-2" onClick={() => navigate(-1)}>
                            <ArrowLeft size={18} />
                            Back
                        </button>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>
                        {Object.entries(item)
                            .slice(0, Math.ceil(Object.entries(item).length / 2))
                            .map(([key, value]) => renderField(key, value))}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Additional Information</h2>
                        {Object.entries(item)
                            .slice(Math.ceil(Object.entries(item).length / 2))
                            .map(([key, value]) => renderField(key, value))}
                    </div>
                </div>
            </div>

            <div className="mt-8 p-4 bg-gray-50 rounded">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Raw JSON Data</h3>
                <pre className="text-xs overflow-auto bg-gray-900 text-gray-100 p-4 rounded" style={{ maxHeight: '300px' }}>
                    {JSON.stringify(item, null, 2)}
                </pre>
            </div>
        </div>
    )
}
