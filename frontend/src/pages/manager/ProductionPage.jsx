import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, AlertCircle, Loader, Trash2, Edit2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import apiClient from '../../lib/api'
import Modal from '../../components/Modal'
import { useFormHandler } from '../../hooks/useFormHandler'

const productionSchema = z.object({
    date: z.string().min(1, 'Production date is required'),
    category: z.enum(['Palm Oil', 'Cattle', 'Processed Goods'], 'Category is required'),
    item: z.string().min(1, 'Item/Product name is required'),
    quantity: z.number().min(0.1, 'Quantity must be greater than 0'),
    unit: z.string().min(1, 'Unit is required'),
    cost: z.number().min(0, 'Cost cannot be negative'),
    description: z.string().optional()
})

export default function ProductionPage()
{
    const [showModal, setShowModal] = useState(false)
    const [filter, setFilter] = useState('All')

    const { data: production = [], isLoading, refetch } = useQuery({
        queryKey: ['production'],
        queryFn: () => apiClient.get('/api/production').then(r => r.data).catch(() => [])
    })

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(productionSchema)
    })

    const { submit, loading, error } = useFormHandler(['production'])

    const onSubmit = async (data) =>
    {
        const success = await submit('/api/production', data)
        if (success)
        {
            reset()
            setShowModal(false)
            refetch()
        }
    }

    const handleDelete = async (id) =>
    {
        if (window.confirm('Delete this production record?'))
        {
            try
            {
                await apiClient.delete(`/api/production/${id}`)
                refetch()
            } catch (err)
            {
                alert('Error deleting record: ' + err.response?.data?.message)
            }
        }
    }

    const filteredProduction = filter === 'All'
        ? production
        : production.filter(p => p.category === filter)

    const formatDate = (date) => new Date(date).toLocaleDateString()
    const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(amount || 0))

    const totalValue = filteredProduction.reduce((sum, p) => sum + ((p.quantity * p.cost) || 0), 0)

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Production Records</h1>
                <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
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
                    <div className="mb-6 flex gap-4">
                        <div>
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
                                                <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-900">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Record Production">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded flex gap-2 text-red-700 text-sm">
                            <AlertCircle size={18} className="flex-shrink-0" />
                            {error}
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
                        <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                            {loading && <Loader size={16} className="animate-spin" />}
                            Record Production
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
