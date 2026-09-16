import { useQuery } from '@tanstack/react-query'
import { Calendar, Share2 } from 'lucide-react'
import apiClient from '../../lib/api'
import { shareOperationsOnWhatsApp } from '../../utils/operationSharing'

export default function OperationsPage()
{
    const { data: operations = [], isLoading, isError } = useQuery({
        queryKey: ['founder-operations'],
        queryFn: () => apiClient.get('/daily-operations').then(response => response.data || [])
    })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Operations</h1>
                <p className="text-gray-600 mt-1">Daily operations recorded by the farm manager</p>
            </div>

            <div className="card overflow-x-auto">
                {isLoading && <p className="text-gray-500 py-8 text-center">Loading operations...</p>}
                {isError && <p className="text-red-600 py-8 text-center">Unable to load operations.</p>}
                {!isLoading && !isError && operations.length === 0 && (
                    <p className="text-gray-500 py-8 text-center">No daily operations have been recorded.</p>
                )}
                {!isLoading && !isError && operations.length > 0 && (
                    <table className="w-full text-sm">
                        <thead className="border-b border-gray-200">
                            <tr className="text-left text-gray-600">
                                <th className="py-3 pr-4">Date</th>
                                <th className="py-3 pr-4">Operation</th>
                                <th className="py-3 pr-4">Details</th>
                                <th className="py-3 pr-4">Performed by</th>
                                <th className="py-3 pr-4">Plantation / Block</th>
                                <th className="py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {operations.map(operation => (
                                <tr key={operation.id} className="border-b border-gray-100 align-top">
                                    <td className="py-3 pr-4 whitespace-nowrap">
                                        <span className="inline-flex items-center gap-2"><Calendar size={15} className="text-gray-400" />{new Date(operation.date).toLocaleDateString()}</span>
                                    </td>
                                    <td className="py-3 pr-4 font-semibold text-gray-900">{operation.operationType}</td>
                                    <td className="py-3 pr-4 text-gray-600 whitespace-pre-wrap">{operation.description || 'No details provided.'}</td>
                                    <td className="py-3 pr-4 text-gray-600">{operation.performedBy || 'Manager'}</td>
                                    <td className="py-3 pr-4 text-gray-600">{operation.plantationId || '-'}{operation.palmBlockId ? ` / ${operation.palmBlockId}` : ''}</td>
                                    <td className="py-3">
                                        <button
                                            onClick={() => shareOperationsOnWhatsApp([operation], 'Ngala Farms operation')}
                                            className="text-green-700 hover:text-green-900 transition"
                                            title="Share operation on WhatsApp"
                                        >
                                            <Share2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
