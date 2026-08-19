import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, Calendar } from 'lucide-react'
import apiClient from '../../lib/api'
import { useToast } from '../../hooks/useToast'

const OPERATION_TYPES = [
    'Clearing',
    'Ringing',
    'Pegging',
    'Planting',
    'Harvesting',
    'Weeding',
    'Fertilizing',
    'Pesticide Spraying',
    'Pruning',
    'Maintenance',
    'Inspection',
    'Other'
]

export default function DailyOperationsPage()
{
    const queryClient = useQueryClient()
    const { showToast } = useToast()
    const [showForm, setShowForm] = useState(false)
    const [filter, setFilter] = useState('all')
    const [editingId, setEditingId] = useState(null)
    const [selectedOperation, setSelectedOperation] = useState(null)
    const [formData, setFormData] = useState({
        operationType: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        plantationId: '',
        palmBlockId: '',
        performedBy: ''
    })

    // Fetch operations
    const { data: operations = [] } = useQuery({
        queryKey: ['daily-operations'],
        queryFn: () => apiClient.get('/daily-operations').then(r => r.data || [])
    })

    // Fetch plantations for selector
    const { data: plantations = [] } = useQuery({
        queryKey: ['plantations'],
        queryFn: () => apiClient.get('/plantations').then(r => r.data)
    })

    const invalidateDailyOperations = () =>
    {
        queryClient.invalidateQueries({ queryKey: ['daily-operations'] })
        queryClient.invalidateQueries({ queryKey: ['all-daily-operations'] })
        queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] })
    }

    // Create/update operation mutation
    const saveMutation = useMutation({
        mutationFn: (data) => editingId
            ? apiClient.put(`/daily-operations/${editingId}`, data)
            : apiClient.post('/daily-operations', data),
        onSuccess: () =>
        {
            invalidateDailyOperations()
            setShowForm(false)
            setEditingId(null)
            setSelectedOperation(null)
            setFormData({
                operationType: '',
                description: '',
                date: new Date().toISOString().split('T')[0],
                plantationId: '',
                palmBlockId: '',
                performedBy: ''
            })
            showToast(editingId ? 'Operation updated successfully!' : 'Operation recorded successfully!', 'success')
        },
        onError: (err) =>
        {
            showToast(err.response?.data?.message || (editingId ? 'Failed to update operation' : 'Failed to record operation'), 'error')
        }
    })

    // Delete operation mutation
    const deleteMutation = useMutation({
        mutationFn: (id) => apiClient.delete(`/daily-operations/${id}`),
        onSuccess: () =>
        {
            invalidateDailyOperations()
            showToast('Operation deleted successfully!', 'success')
        },
        onError: (err) =>
        {
            showToast(err.response?.data?.message || 'Failed to delete operation', 'error')
        }
    })

    const handleSubmit = (e) =>
    {
        e.preventDefault()
        if (!formData.operationType || !formData.date)
        {
            alert('Please fill in all required fields')
            return
        }

        const payload = {
            ...formData,
            plantationId: formData.plantationId || null,
            palmBlockId: formData.palmBlockId || null,
            performedBy: formData.performedBy || 'Manager'
        }

        saveMutation.mutate(payload)
    }

    const startEdit = (op) =>
    {
        setEditingId(op.id)
        setSelectedOperation(op)
        setFormData({
            operationType: op.operationType || '',
            description: op.description || '',
            date: op.date ? new Date(op.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            plantationId: op.plantationId || '',
            palmBlockId: op.palmBlockId || '',
            performedBy: op.performedBy || ''
        })
        setShowForm(true)
    }

    const resetForm = () =>
    {
        setShowForm(false)
        setEditingId(null)
        setFormData({
            operationType: '',
            description: '',
            date: new Date().toISOString().split('T')[0],
            plantationId: '',
            palmBlockId: '',
            performedBy: ''
        })
    }

    const filteredOperations = filter === 'all'
        ? operations
        : operations.filter(op => op.operationType === filter)

    const operationStats = {
        total: operations.length,
        today: operations.filter(op =>
        {
            const opDate = new Date(op.date).toDateString()
            const today = new Date().toDateString()
            return opDate === today
        }).length,
        byType: OPERATION_TYPES.reduce((acc, type) =>
        {
            acc[type] = operations.filter(op => op.operationType === type).length
            return acc
        }, {})
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Daily Operations</h1>
                <button
                    onClick={() =>
                    {
                        setSelectedOperation(null)
                        setEditingId(null)
                        setShowForm(!showForm)
                        if (showForm)
                        {
                            resetForm()
                        }
                    }}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                    <Plus size={20} />
                    {showForm ? 'Close Form' : 'Record Operation'}
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <div className="card">
                    <p className="text-gray-600 text-sm">Total Operations</p>
                    <p className="text-2xl md:text-3xl font-bold text-green-600 mt-2">{operationStats.total}</p>
                </div>
                <div className="card">
                    <p className="text-gray-600 text-sm">Today's Operations</p>
                    <p className="text-2xl md:text-3xl font-bold text-blue-600 mt-2">{operationStats.today}</p>
                </div>
                <div className="card">
                    <p className="text-gray-600 text-sm">Operation Types</p>
                    <p className="text-2xl md:text-3xl font-bold text-purple-600 mt-2">{OPERATION_TYPES.length}</p>
                </div>
            </div>

            {/* Form */}
            {showForm && (
                <div className="card bg-gradient-to-br from-green-50 to-blue-50 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">{editingId ? 'Edit Operation' : 'Record New Operation'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Operation Type *
                                </label>
                                <select
                                    value={formData.operationType}
                                    onChange={(e) => setFormData({ ...formData, operationType: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="">Select operation type</option>
                                    {OPERATION_TYPES.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date *
                                </label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Plantation (Optional)
                                </label>
                                <select
                                    value={formData.plantationId || ''}
                                    onChange={(e) => setFormData({ ...formData, plantationId: e.target.value || '' })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="">No plantation selected</option>
                                    {plantations.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Palm Block (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.palmBlockId}
                                    onChange={(e) => setFormData({ ...formData, palmBlockId: e.target.value })}
                                    placeholder="e.g. A1"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Performed By (Optional)
                            </label>
                            <input
                                type="text"
                                value={formData.performedBy}
                                onChange={(e) => setFormData({ ...formData, performedBy: e.target.value })}
                                placeholder="Manager name or email"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description (Optional)
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Add details about this operation..."
                                rows="3"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={saveMutation.isPending}
                                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                            >
                                {saveMutation.isPending ? (editingId ? 'Updating...' : 'Recording...') : (editingId ? 'Update Operation' : 'Record Operation')}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filter */}
            <div className="mb-6 flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">Filter by Type:</label>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                    <option value="all">All Operations</option>
                    {OPERATION_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
            </div>

            {/* Operations List */}
            <div className="card overflow-x-auto">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    {filter === 'all' ? 'All Operations' : `${filter} Operations`}
                    {filteredOperations.length > 0 && (
                        <span className="text-sm font-normal text-gray-600 ml-2">
                            ({filteredOperations.length})
                        </span>
                    )}
                </h2>

                {filteredOperations.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No operations recorded yet</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="text-left px-4 py-3 font-semibold text-gray-700">Date</th>
                                <th className="text-left px-4 py-3 font-semibold text-gray-700">Operation Type</th>
                                <th className="text-left px-4 py-3 font-semibold text-gray-700">Description</th>
                                <th className="text-left px-4 py-3 font-semibold text-gray-700">Performed By</th>
                                <th className="text-left px-4 py-3 font-semibold text-gray-700">Plantation</th>
                                <th className="text-center px-4 py-3 font-semibold text-gray-700">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredOperations.map((op) => (
                                <tr key={op.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} className="text-gray-400" />
                                            {new Date(op.date).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                                            {op.operationType}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 max-w-xs truncate">{op.description || '-'}</td>
                                    <td className="px-4 py-3 text-gray-600">{op.performedBy || '-'}</td>
                                    <td className="px-4 py-3 text-gray-600">{op.plantationName || '-'}</td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-3">
                                            <button
                                                onClick={() => setSelectedOperation(op)}
                                                className="text-blue-600 hover:text-blue-800 transition"
                                                title="View details"
                                            >
                                                View
                                            </button>
                                            <button
                                                onClick={() => startEdit(op)}
                                                className="text-amber-600 hover:text-amber-800 transition"
                                                title="Edit operation"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => deleteMutation.mutate(op.id)}
                                                disabled={deleteMutation.isPending}
                                                className="text-red-600 hover:text-red-800 transition disabled:opacity-50"
                                                title="Delete operation"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {selectedOperation && (
                <div className="card mt-8">
                    <div className="flex justify-between items-start gap-4 mb-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Operation details</p>
                            <h3 className="text-xl font-bold text-gray-900">{selectedOperation.operationType}</h3>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => startEdit(selectedOperation)}
                                className="px-3 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => setSelectedOperation(null)}
                                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-gray-500">Date</p>
                            <p className="font-semibold text-gray-900">{new Date(selectedOperation.date).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Performed by</p>
                            <p className="font-semibold text-gray-900">{selectedOperation.performedBy || 'Manager'}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Plantation</p>
                            <p className="font-semibold text-gray-900">{selectedOperation.plantationId || 'Not assigned'}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Palm block</p>
                            <p className="font-semibold text-gray-900">{selectedOperation.palmBlockId || 'Not assigned'}</p>
                        </div>
                    </div>

                    <div className="mt-4">
                        <p className="text-gray-500">Description</p>
                        <p className="mt-1 text-gray-900 whitespace-pre-wrap">{selectedOperation.description || 'No description provided.'}</p>
                    </div>
                </div>
            )}

            {/* Operation Types Stats */}
            <div className="card mt-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Operations by Type</h2>
                <div className="grid grid-cols-4 gap-4">
                    {OPERATION_TYPES.map(type => (
                        <div key={type} className="text-center p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-700">{type}</p>
                            <p className="text-2xl font-bold text-green-600 mt-2">{operationStats.byType[type] || 0}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
