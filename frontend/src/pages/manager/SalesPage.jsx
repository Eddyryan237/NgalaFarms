import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, AlertCircle, Loader, Edit2, Trash2, Eye } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import apiClient from '../../lib/api'
import Modal from '../../components/Modal'
import { salesSchema } from '../../lib/validations'
import { useToast } from '../../hooks/useToast'

export default function SalesPage()
{
    const [showModal, setShowModal] = useState(false)
    const [showDetails, setShowDetails] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [selectedSale, setSelectedSale] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const queryClient = useQueryClient()
    const { showToast } = useToast()

    const { data: sales = [], isLoading } = useQuery({
        queryKey: ['sales'],
        queryFn: () => apiClient.get('/sales').then(r => r.data || []).catch(() => [])
    })

    const { data: customers = [] } = useQuery({
        queryKey: ['customers'],
        queryFn: () => apiClient.get('/customers').then(r => r.data || []).catch(() => [])
    })

    const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm({
        resolver: zodResolver(salesSchema),
        defaultValues: {
            customerId: '',
            saleDate: new Date().toISOString().split('T')[0],
            product: 'Palm Oil',
            quantityLitres: '',
            unitPrice: '',
            paymentMethod: 'Cash',
            paymentStatus: 'Paid',
            notes: ''
        }
    })

    const invalidateSalesQueries = () =>
    {
        queryClient.invalidateQueries({ queryKey: ['sales'] })
        queryClient.invalidateQueries({ queryKey: ['all-sales'] })
        queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] })
    }

    const saveMutation = useMutation({
        mutationFn: (payload) => editingId
            ? apiClient.put(`/sales/${editingId}`, payload)
            : apiClient.post('/sales', payload),
        onSuccess: () =>
        {
            invalidateSalesQueries()
            resetForm()
            showToast(editingId ? 'Sale updated successfully' : 'Sale recorded successfully', 'success')
        },
        onError: (err) =>
        {
            showToast(err.response?.data?.message || (editingId ? 'Failed to update sale' : 'Failed to record sale'), 'error')
        }
    })

    const deleteMutation = useMutation({
        mutationFn: (id) => apiClient.delete(`/sales/${id}`),
        onSuccess: () =>
        {
            invalidateSalesQueries()
            setSelectedSale(null)
            setShowDetails(false)
            showToast('Sale deleted successfully', 'success')
        },
        onError: (err) =>
        {
            showToast(err.response?.data?.message || 'Failed to delete sale', 'error')
        }
    })

    const resetForm = () =>
    {
        reset({
            customerId: '',
            saleDate: new Date().toISOString().split('T')[0],
            product: 'Palm Oil',
            quantityLitres: '',
            unitPrice: '',
            paymentMethod: 'Cash',
            paymentStatus: 'Paid',
            notes: ''
        })
        setEditingId(null)
        setShowModal(false)
    }

    const onSubmit = (data) =>
    {
        const selectedCustomer = customers.find(c => String(c.id) === String(data.customerId));

        if (data.customerId && !selectedCustomer)
        {
            showToast('Selected customer is not valid. Please choose a customer from the list.', 'error');
            return;
        }

        const payload = {
            customerId: selectedCustomer ? selectedCustomer.id : null,
            customerName: selectedCustomer ? selectedCustomer.name : 'Walk-in customer',
            product: data.product,
            quantityLitres: Number(data.quantityLitres),
            unitPrice: Number(data.unitPrice),
            paymentMethod: data.paymentMethod,
            paymentStatus: data.paymentStatus,
            saleDate: data.saleDate,
            notes: data.notes || ''
        }

        saveMutation.mutate(payload)
    }

    const handleEdit = (sale) =>
    {
        setEditingId(sale.id)
        setSelectedSale(sale)
        setValue('customerId', sale.customerId ? String(sale.customerId) : '')
        setValue('saleDate', sale.saleDate ? sale.saleDate.split('T')[0] : new Date().toISOString().split('T')[0])
        setValue('product', sale.product || 'Palm Oil')
        setValue('quantityLitres', sale.quantityLitres ?? '')
        setValue('unitPrice', sale.unitPrice ?? '')
        setValue('paymentMethod', sale.paymentMethod || 'Cash')
        setValue('paymentStatus', sale.paymentStatus || 'Paid')
        setValue('notes', sale.notes || '')
        setShowModal(true)
    }

    const handleCloseModal = () =>
    {
        resetForm()
    }

    const formatDate = (date) => new Date(date).toLocaleDateString()
    const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(amount || 0))

    const filteredSales = sales.filter(s =>
        (s.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.product || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.invoiceId || '').toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Sales Records</h1>
                <button onClick={() => { setEditingId(null); setSelectedSale(null); setShowModal(true); reset({ customerId: '', saleDate: new Date().toISOString().split('T')[0], product: 'Palm Oil', quantityLitres: '', unitPrice: '', paymentMethod: 'Cash', paymentStatus: 'Paid', notes: '' }) }} className="btn-primary flex items-center gap-2">
                    <Plus size={18} />
                    Record Sale
                </button>
            </div>

            <div className="card mb-6">
                <input
                    type="text"
                    placeholder="Search by customer, product, or invoice ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field w-full"
                />
            </div>

            {isLoading ? (
                <div className="card text-center py-12">
                    <Loader className="inline animate-spin text-green-600" size={32} />
                </div>
            ) : filteredSales.length === 0 ? (
                <div className="card text-center py-12">
                    <p className="text-gray-500">{searchTerm ? 'No matching sales found' : 'No sales recorded yet'}</p>
                </div>
            ) : (
                <div className="card overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b border-gray-200">
                            <tr className="text-gray-600 font-semibold">
                                <th className="text-left py-3 px-4">Invoice ID</th>
                                <th className="text-left py-3 px-4">Customer</th>
                                <th className="text-left py-3 px-4">Date</th>
                                <th className="text-left py-3 px-4">Product</th>
                                <th className="text-left py-3 px-4">Quantity (L)</th>
                                <th className="text-left py-3 px-4">Total</th>
                                <th className="text-left py-3 px-4">Status</th>
                                <th className="text-center py-3 px-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSales.map((s) => (
                                <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4 font-medium">{s.invoiceId}</td>
                                    <td className="py-3 px-4">{s.customerName}</td>
                                    <td className="py-3 px-4">{formatDate(s.saleDate)}</td>
                                    <td className="py-3 px-4">{s.product}</td>
                                    <td className="py-3 px-4">{Number(s.quantityLitres).toFixed(2)}</td>
                                    <td className="py-3 px-4 font-medium">{formatCurrency(s.totalPrice)}</td>
                                    <td className="py-3 px-4"><span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">{s.paymentStatus}</span></td>
                                    <td className="py-3 px-4 text-center">
                                        <div className="flex items-center justify-center gap-3">
                                            <button type="button" onClick={() => { setSelectedSale(s); setShowDetails(true) }} className="text-blue-600 hover:text-blue-800" title="View details">
                                                <Eye size={18} />
                                            </button>
                                            <button type="button" onClick={() => window.location.href = `/founder/details/sales/${s.id}`} className="text-blue-600 hover:text-blue-800" title="Open in founder view">
                                                <Eye size={18} />
                                            </button>
                                            <button type="button" onClick={() => handleEdit(s)} className="text-green-600 hover:text-green-800" title="Edit sale">
                                                <Edit2 size={18} />
                                            </button>
                                            <button type="button" onClick={() => deleteMutation.mutate(s.id)} className="text-red-600 hover:text-red-800" title="Delete sale">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal isOpen={showModal} onClose={handleCloseModal} title={editingId ? 'Edit Sale' : 'Record Sale'}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {saveMutation.isError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded flex gap-2 text-red-700 text-sm">
                            <AlertCircle size={18} className="flex-shrink-0" />
                            {saveMutation.error?.response?.data?.message || 'Failed to save sale'}
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                            <select {...register('product')} className="input-field">
                                <option value="Palm Oil">Palm Oil</option>
                                <option value="Palm Kernel Oil">Palm Kernel Oil</option>
                                <option value="Fresh Fruit Bunch">Fresh Fruit Bunch</option>
                            </select>
                            {errors.product && <p className="text-red-600 text-xs mt-1">{errors.product.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (Litres)</label>
                            <input type="number" step="0.01" {...register('quantityLitres', { valueAsNumber: true })} className="input-field" placeholder="0.00" />
                            {errors.quantityLitres && <p className="text-red-600 text-xs mt-1">{errors.quantityLitres.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
                            <input type="number" step="0.01" {...register('unitPrice', { valueAsNumber: true })} className="input-field" placeholder="0.00" />
                            {errors.unitPrice && <p className="text-red-600 text-xs mt-1">{errors.unitPrice.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                            <select {...register('paymentMethod')} className="input-field">
                                <option value="Cash">Cash</option>
                                <option value="BankTransfer">Bank Transfer</option>
                                <option value="MobileMoney">Mobile Money</option>
                            </select>
                            {errors.paymentMethod && <p className="text-red-600 text-xs mt-1">{errors.paymentMethod.message}</p>}
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                            <select {...register('paymentStatus')} className="input-field">
                                <option value="Paid">Paid</option>
                                <option value="Pending">Pending</option>
                                <option value="PartiallyPaid">Partially Paid</option>
                                <option value="Overdue">Overdue</option>
                            </select>
                            {errors.paymentStatus && <p className="text-red-600 text-xs mt-1">{errors.paymentStatus.message}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea {...register('notes')} className="input-field" rows="3" placeholder="Sale notes..." />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={handleCloseModal} className="btn-secondary flex-1">
                            Cancel
                        </button>
                        <button type="submit" disabled={saveMutation.isPending} className="btn-primary flex-1 flex items-center justify-center gap-2">
                            {saveMutation.isPending && <Loader size={16} className="animate-spin" />}
                            {editingId ? 'Update Sale' : 'Record Sale'}
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={showDetails} onClose={() => { setShowDetails(false); setSelectedSale(null) }} title="Sale Details">
                {selectedSale ? (
                    <div className="space-y-4 text-sm text-gray-700">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-gray-500">Invoice ID</p>
                                <p className="font-semibold text-gray-900">{selectedSale.invoiceId}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Customer</p>
                                <p className="font-semibold text-gray-900">{selectedSale.customerName}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Date</p>
                                <p className="font-semibold text-gray-900">{formatDate(selectedSale.saleDate)}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Product</p>
                                <p className="font-semibold text-gray-900">{selectedSale.product}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Quantity</p>
                                <p className="font-semibold text-gray-900">{Number(selectedSale.quantityLitres).toFixed(2)} L</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Unit Price</p>
                                <p className="font-semibold text-gray-900">{formatCurrency(selectedSale.unitPrice)}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Payment Method</p>
                                <p className="font-semibold text-gray-900">{selectedSale.paymentMethod}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Status</p>
                                <p className="font-semibold text-gray-900">{selectedSale.paymentStatus}</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-gray-500">Notes</p>
                            <p className="font-semibold text-gray-900 whitespace-pre-line">{selectedSale.notes || 'No notes provided.'}</p>
                        </div>

                        <div className="border-t pt-3">
                            <p className="text-gray-500">Total Amount</p>
                            <p className="text-2xl font-bold text-green-700">{formatCurrency(selectedSale.totalPrice)}</p>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={() => { setShowDetails(false); handleEdit(selectedSale) }} className="btn-primary flex-1">
                                Edit Sale
                            </button>
                            <button type="button" onClick={() => { setShowDetails(false); deleteMutation.mutate(selectedSale.id) }} className="btn-secondary flex-1">
                                Delete
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500">No sale selected.</p>
                )}
            </Modal>
        </div>
    )
}
