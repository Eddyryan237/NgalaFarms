import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import apiClient from '../../lib/api'

export default function AuditLogsPage()
{
    const { data: auditLogs } = useQuery({
        queryKey: ['audit-logs'],
        queryFn: () => apiClient.get('/audit-logs').then(r => r.data?.data || [])
    })

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Audit Logs</h1>

            <div className="card overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="border-b border-gray-200">
                        <tr className="text-gray-600 font-semibold">
                            <th className="text-left py-3 px-4">User</th>
                            <th className="text-left py-3 px-4">Action</th>
                            <th className="text-left py-3 px-4">Entity</th>
                            <th className="text-left py-3 px-4">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {auditLogs?.map((log) => (
                            <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4 font-medium text-gray-900">{log.userName}</td>
                                <td className="py-3 px-4 text-gray-700">{log.action}</td>
                                <td className="py-3 px-4 text-gray-700">{log.entityType}</td>
                                <td className="py-3 px-4 text-gray-600 text-xs">
                                    {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
