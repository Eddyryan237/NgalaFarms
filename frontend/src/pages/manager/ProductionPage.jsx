import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, AlertCircle, Loader, Trash2, Pencil, Eye } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import apiClient from '../../lib/api'
import Modal from '../../components/Modal'
import { useToast } from '../../hooks/useToast'

const productionSchema = z.object({
    date: z.string().min(1, 'Production date is required'),
    category: z.enum(['Palm Oil', 'Cattle', 'Processed Goods'], 'Category is required'),
    item: z.string().min(1, 'Item/Product name is required'),
    quantity: z.coerce.number().min(0.1, 'Quantity must be greater than 0'),
    unit: z.string().min(1, 'Unit is required'),
    cost: z.coerce.number().min(0, 'Cost cannot be negative'),
    description: z.string().optional()
})

export default function ProductionPage()
{
    const queryClient = useQueryClient()
    const { showToast } = useToast()
    const [showModal, setShowModal] = useState(false)
    const [showDetails, setShowDetails] = useState(false)
    const [filter, setFilter] = useState('All')
    const [editingId, setEditingId] = useState(null)
    const [selectedProduction, setSelectedProduction] = useState(null)

    const { data: production = [], isLoading } = useQuery({
        queryKey: ['production'],
        queryFn: () => apiClient.get('/production').then(r => r.data || []).catch(() => [])
    })

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(productionSchema),
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            category: 'Palm Oil',
            item: '',
            quantity: '',
            unit: '',
            cost: '',
            description: ''
        }
    })

    const invalidateProductionQueries = () => {
        queryClient.invalidateQueries({ queryKey: ['production'] })
        queryClient.invalidateQueries({ queryKey: ['all-production'] })
        queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] })
    }

    const saveMutation = useMutation({
        mutationFn: (payload) => editingId
            ? apiClient.put(`/production/${editingId}`, payload)
            : apiClient.post('/production', payload),
        onSuccess: () => {
            invalidateProductionQueries()
            resetForm()
            showToast(editingId ? 'Production record updated successfully!' : 'Production recorded successfully!', 'success')
        },
        onError: (err) => {
            showToast(err.response?.data?.message || (editingId ? 'Failed to update production record' : 'Failed to record production'), 'error')
        }
    })

    const deleteMutation = useMutation({
        mutationFn: (id) => apiClient.delete(`/production/${id}`),
        onSuccess: () => {
            invalidateProductionQueries()
            setSelectedProduction(null)
            setShowDetails(false)
            showToast('Production deleted successfully!', 'success')
        },
        onError: (err) => {
            showToast(err.response?.data?.message || 'Failed to delete production record', 'error')
        }
    })

    const resetForm = () => {
        reset({
            date: new Date().toISOString().split('T')[0],
            category: 'Palm Oil',
            item: '',
            quantity: '',
            unit: '',
            cost: '',
            description: ''
        })
        setEditingId(null)
        setShowModal(false)
    }

    const onSubmit = (data) => {
        const payload = {
            date: data.date,
            category: data.category,
            item: data.item,
            quantity: Number(data.quantity),
            unit: data.unit,
            cost: Number(data.cost),
            description: data.description || ''
        }

        saveMutation.mutate(payload)
    }

    const openEdit = (record) => {
        setEditingId(record.id)
        setSelectedProduction(record)
        setValue('date', record.date ? record.date.split('T')[0] : new Date().toISOString().split('T')[0])
        setValue('category', record.category || 'Palm Oil')
        setValue('item', record.item || '')
        setValue('quantity', record.quantity ?? '')
        setValue('unit', record.unit || '')
        setValue('cost', record.cost ?? '')
        setValue('description', record.description || '')
        setShowModal(true)
    }

    const filteredProduction = filter === 'All'
        ? production
        : production.filter(p => p.category === filter)

    const formatDate = (date) => new Date(date).toLocaleDateString()
    const formatCurrency = (amount) => `${(Math.abs(amount || 0)).toLocaleString('en-US')} XAF`

    const totalValue = filteredProduction.reduce((sum, p) => sum + ((p.quantity * p.cost) || 0), 0)

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Production Records</h1>
                <button onClick={() => { setEditingId(null); setSelectedProduction(null); setShowModal(true); reset({ date: new Date().toISOString().split('T')[0], category: 'Palm Oil', item: '', quantity: '', unit: '', cost: '', description: '' }) }} className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center">
                    <Plus size={18} />
                    Record Production
                </button>
            </div>

            {isLoading ? (
                <div className="card text-center py-12">
                    <Loader className="inline animate-spin text-green-600" size={32} />
                </div>
            ) : (
                <>
                    <div className="mb-6 flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="input-field"
                            >
                                <option value="All">All Categories</option>
                                <option value="Palm Oil">Palm Oil</option>
                                <option value="Cattle">Cattle</option>
                                <option value="Processed Goods">Processed Goods</option>
                            </select>
                        </div>
                        {filteredProduction.length > 0 && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-4 flex items-end">
                                <div>
                                    <p className="text-blue-600 text-sm font-medium">Total Production Value</p>
                                    <p className="text-2xl font-bold text-blue-900">{formatCurrency(totalValue)}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {filteredProduction.length === 0 ? (
                        <div className="card text-center py-12">
                            <p className="text-gray-500">No production records yet</p>
                        </div>
                    ) : (
                        <div className="card overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b border-gray-200">
                                    <tr className="text-gray-600 font-semibold">
                                        <th className="text-left py-3 px-4">Date</th>
                                        <th className="text-left py-3 px-4">Category</th>
                                        <th className="text-left py-3 px-4">Item</th>
                                        <th className="text-left py-3 px-4">Quantity</th>
                                        <th className="text-left py-3 px-4">Unit</th>
                                        <th className="text-left py-3 px-4">Cost/Unit</th>
                                        <th className="text-left py-3 px-4">Total Value</th>
                                        <th className="text-left py-3 px-4">Description</th>
                                        <th className="text-left py-3 px-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProduction.map((p) => (
                                        <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4">{formatDate(p.date)}</td>
                                            <td className="py-3 px-4 text-sm">
                                                <span className={`px-2 py-1 rounded text-white text-xs font-semibold ${p.category === 'Palm Oil' ? 'bg-green-600' :
                                                        p.category === 'Cattle' ? 'bg-amber-600' :
                                                            'bg-blue-600'
                                                    }`}>
                                                    {p.category}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">{p.item}</td>
                                            <td className="py-3 px-4 font-medium">{p.quantity}</td>
                                            <td className="py-3 px-4">{p.unit}</td>
                                            <td className="py-3 px-4">{formatCurrency(p.cost)}</td>
                                            <td className="py-3 px-4 font-bold text-green-600">{formatCurrency(p.quantity * p.cost)}</td>
                                            <td className="py-3 px-4 text-xs text-gray-600">{p.description || '-'}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <button type="button" onClick={() => window.location.href = `/founder/details/production/${p.id}`} className="text-blue-600 hover:text-blue-800" title="View details">
                                                        <Eye size={16} />
                                                    </button>
                                                    <button type="button" onClick={() => openEdit(p)} className="text-green-600 hover:text-green-800" title="Edit record">
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button type="button" onClick={() => deleteMutation.mutate(p.id)} className="text-red-600 hover:text-red-900" title="Delete record">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            <Modal isOpen={showModal} onClose={() => resetForm()} title={editingId ? 'Edit Production Record' : 'Record Production'}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {saveMutation.isError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded flex gap-2 text-red-700 text-sm">
                            <AlertCircle size={18} className="flex-shrink-0" />
                            {saveMutation.error?.response?.data?.message || 'Failed to save production record'}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Production Date</label>
                            <input type="date" {...register('date')} className="input-field" />
                            {errors.date && <p className="text-red-600 text-xs mt-1">{errors.date.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select {...register('category')} className="input-field">
                                <option value="">Select category</option>
                                <option value="Palm Oil">Palm Oil</option>
                                <option value="Cattle">Cattle</option>
                                <option value="Processed Goods">Processed Goods</option>
                            </select>
                            {errors.category && <p className="text-red-600 text-xs mt-1">{errors.category.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Item/Product Name</label>
                            <input type="text" {...register('item')} className="input-field" placeholder="e.g., Palm Oil, Beef" />
                            {errors.item && <p className="text-red-600 text-xs mt-1">{errors.item.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                            <input type="number" step="0.01" {...register('quantity', { valueAsNumber: true })} className="input-field" placeholder="0.00" />
                            {errors.quantity && <p className="text-red-600 text-xs mt-1">{errors.quantity.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                            <input type="text" {...register('unit')} className="input-field" placeholder="e.g., Litres, Kg, Tons" />
                            {errors.unit && <p className="text-red-600 text-xs mt-1">{errors.unit.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cost per Unit</label>
                            <input type="number" step="0.01" {...register('cost', { valueAsNumber: true })} className="input-field" placeholder="0.00" />
                            {errors.cost && <p className="text-red-600 text-xs mt-1">{errors.cost.message}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea {...register('description')} className="input-field" rows="3" placeholder="Additional notes..." />
                        {errors.description && <p className="text-red-600 text-xs mt-1">{errors.description.message}</p>}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={() => resetForm()} className="btn-secondary flex-1">
                            Cancel
                        </button>
                        <button type="submit" disabled={saveMutation.isPending} className="btn-primary flex-1 flex items-center justify-center gap-2">
                            {saveMutation.isPending && <Loader size={16} className="animate-spin" />}
                            {editingId ? 'Update Production' : 'Record Production'}
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={showDetails} onClose={() => { setShowDetails(false); setSelectedProduction(null) }} title="Production Details">
                {selectedProduction ? (
                    <div className="space-y-4 text-sm text-gray-700">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-gray-500">Date</p>
                                <p className="font-semibold text-gray-900">{formatDate(selectedProduction.date)}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Category</p>
                                <p className="font-semibold text-gray-900">{selectedProduction.category}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Item</p>
                                <p className="font-semibold text-gray-900">{selectedProduction.item}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Quantity</p>
                                <p className="font-semibold text-gray-900">{selectedProduction.quantity} {selectedProduction.unit}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Cost per Unit</p>
                                <p className="font-semibold text-gray-900">{formatCurrency(selectedProduction.cost)}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Total Value</p>
                                <p className="font-semibold text-gray-900 text-green-700">{formatCurrency(selectedProduction.quantity * selectedProduction.cost)}</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-gray-500">Description</p>
                            <p className="font-semibold text-gray-900 whitespace-pre-line">{selectedProduction.description || 'No description provided.'}</p>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={() => { setShowDetails(false); openEdit(selectedProduction) }} className="btn-primary flex-1">
                                Edit Record
                            </button>
                            <button type="button" onClick={() => { setShowDetails(false); deleteMutation.mutate(selectedProduction.id) }} className="btn-secondary flex-1">
                                Delete
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500">No production selected.</p>
                )}
            </Modal>
        </div>
    )
}
