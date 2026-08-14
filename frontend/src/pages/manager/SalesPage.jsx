import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, AlertCircle, Loader } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import apiClient from '../../lib/api'
import Modal from '../../components/Modal'
import { salesSchema } from '../../lib/validations'
import { useFormHandler } from '../../hooks/useFormHandler'

export default function SalesPage()
{
    const [showModal, setShowModal] = useState(false)

    const { data: sales = [], isLoading } = useQuery({
        queryKey: ['sales'],
        queryFn: () => apiClient.get('/sales').then(r => r.data)
    })

    const { data: customers = [] } = useQuery({
        queryKey: ['customers'],
        queryFn: () => apiClient.get('/customers').then(r => r.data)
    })

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(salesSchema)
    })

    const { submit, loading, error } = useFormHandler(['sales'])

    const onSubmit = async (data) =>
    {
        const success = await submit('/sales', data)
        if (success)
        {
            reset()
            setShowModal(false)
        }
    }

    const formatDate = (date) => new Date(date).toLocaleDateString()
    const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Sales Records</h1>
                <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
                    <Plus size={18} />
                    Record Sale
                </button>
            </div>

            {isLoading ? (
                <div className="card text-center py-12">
                    <Loader className="inline animate-spin text-green-600" size={32} />
                </div>
            ) : sales.length === 0 ? (
                <div className="card text-center py-12">
                    <p className="text-gray-500">No sales recorded yet</p>
                </div>
            ) : (
                <div className="card overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b border-gray-200">
                            <tr className="text-gray-600 font-semibold">
                                <th className="text-left py-3 px-4">Sale ID</th>
                                <th className="text-left py-3 px-4">Customer</th>
                                <th className="text-left py-3 px-4">Date</th>
                                <th className="text-left py-3 px-4">Product</th>
                                <th className="text-left py-3 px-4">Quantity (KG)</th>
                                <th className="text-left py-3 px-4">Total</th>
                                <th className="text-left py-3 px-4">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sales.map((s) =>
                            {
                                const total = s.quantityKg * s.pricePerKg
                                return (
                                    <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4 font-medium">{s.saleId}</td>
                                        <td className="py-3 px-4">{s.customer?.name}</td>
                                        <td className="py-3 px-4">{formatDate(s.saleDate)}</td>
                                        <td className="py-3 px-4">{s.productType}</td>
                                        <td className="py-3 px-4">{s.quantityKg.toFixed(2)}</td>
                                        <td className="py-3 px-4 font-medium">{formatCurrency(total)}</td>
                                        <td className="py-3 px-4"><span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">{s.status}</span></td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Record Sale">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded flex gap-2 text-red-700 text-sm">
                            <AlertCircle size={18} className="flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                            <select {...register('customerId')} className="input-field">
                                <option value="">Select customer</option>
                                {customers.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            {errors.customerId && <p className="text-red-600 text-xs mt-1">{errors.customerId.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sale Date</label>
                            <input type="date" {...register('saleDate')} className="input-field" />
                            {errors.saleDate && <p className="text-red-600 text-xs mt-1">{errors.saleDate.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
                            <select {...register('productType')} className="input-field">
                                <option value="">Select product</option>
                                <option value="Crude Palm Oil">Crude Palm Oil</option>
                                <option value="Palm Kernel Oil">Palm Kernel Oil</option>
                                <option value="Fresh Fruit Bunch">Fresh Fruit Bunch</option>
                            </select>
                            {errors.productType && <p className="text-red-600 text-xs mt-1">{errors.productType.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (KG)</label>
                            <input type="number" step="0.01" {...register('quantityKg', { valueAsNumber: true })} className="input-field" placeholder="0.00" />
                            {errors.quantityKg && <p className="text-red-600 text-xs mt-1">{errors.quantityKg.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price Per KG</label>
                            <input type="number" step="0.01" {...register('pricePerKg', { valueAsNumber: true })} className="input-field" placeholder="0.00" />
                            {errors.pricePerKg && <p className="text-red-600 text-xs mt-1">{errors.pricePerKg.message}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea {...register('notes')} className="input-field" rows="3" placeholder="Sale notes..." />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                            {loading && <Loader size={16} className="animate-spin" />}
                            Record Sale
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
