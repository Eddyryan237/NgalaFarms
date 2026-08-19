import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Plus, AlertCircle, Loader, Edit2, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import apiClient from '../../lib/api'
import Modal from '../../components/Modal'
import { expenseSchema } from '../../lib/validations'
import { useFormHandler } from '../../hooks/useFormHandler'
import { useToast } from '../../hooks/useToast'

const DIVISIONS = [
    { label: 'Palm Oil', value: 0 },
    { label: 'Cattle Management', value: 1 },
    { label: 'General', value: 2 }
]

const PAYMENT_METHODS = [
    { label: 'Cash', value: 0 },
    { label: 'Bank Transfer', value: 1 },
    { label: 'Mobile Money', value: 2 }
]

export default function ExpensesPage()
{
    const [showModal, setShowModal] = useState(false)
    const [filter, setFilter] = useState('')
    const [editingId, setEditingId] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const { addToast } = useToast()

    const { data: expenses = [], isLoading, refetch } = useQuery({
        queryKey: ['expenses'],
        queryFn: () => apiClient.get('/expenses').then(r => r.data)
    })

    const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm({
        resolver: zodResolver(expenseSchema)
    })

    const { submit, loading, error } = useFormHandler(['expenses'])

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id) => apiClient.delete(`/expenses/${id}`),
        onSuccess: () =>
        {
            refetch()
            addToast('Expense deleted successfully', 'success')
        },
        onError: () =>
        {
            addToast('Failed to delete expense', 'error')
        }
    })

    const onSubmit = async (data) =>
    {
        if (editingId)
        {
            try
            {
                await apiClient.put(`/expenses/${editingId}`, data)
                addToast('Expense updated successfully', 'success')
                setEditingId(null)
            } catch
            {
                addToast('Failed to update expense', 'error')
                return
            }
        } else
        {
            const success = await submit('/expenses', data)
            if (!success)
            {
                addToast('Failed to record expense', 'error')
                return
            }
            addToast('Expense recorded successfully', 'success')
        }

        reset()
        setShowModal(false)
        refetch()
    }

    const handleEdit = (expense) =>
    {
        setEditingId(expense.id)
        setValue('division', expense.division)
        setValue('category', expense.category)
        setValue('date', expense.date)
        setValue('amount', expense.amount)
        setValue('paymentMethod', expense.paymentMethod)
        setValue('description', expense.description)
        setShowModal(true)
    }

    const handleDelete = (id) =>
    {
        if (window.confirm('Are you sure you want to delete this expense?'))
        {
            deleteMutation.mutate(id)
        }
    }

    const handleCloseModal = () =>
    {
        setShowModal(false)
        setEditingId(null)
        reset()
    }

    const formatDate = (date) => new Date(date).toLocaleDateString()
    const formatCurrency = (amount) => `${(Math.abs(amount || 0)).toLocaleString('en-US')} XAF`

    const filteredExpenses = expenses.filter(e =>
    {
        const matchesFilter = filter ? e.division === parseInt(filter) : true
        const matchesSearch = e.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.division.toString().includes(searchTerm)
        return matchesFilter && matchesSearch
    })

    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0)

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
                <button onClick={() => { setEditingId(null); reset(); setShowModal(true) }} className="btn-primary flex items-center gap-2">
                    <Plus size={18} />
                    Add Expense
                </button>
            </div>

            {isLoading ? (
                <div className="card text-center py-12">
                    <Loader className="inline animate-spin text-green-600" size={32} />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="card">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Division</label>
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="input-field"
                            >
                                <option value="">All Divisions</option>
                                {DIVISIONS.map(d => (
                                    <option key={d.value} value={d.value}>{d.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="card">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Search Expenses</label>
                            <input
                                type="text"
                                placeholder="Search by category or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input-field"
                            />
                        </div>
                    </div>

                    {filteredExpenses.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
                            <p className="text-blue-600 text-sm font-medium">Total Expenses (Filtered)</p>
                            <p className="text-3xl font-bold text-blue-900">{formatCurrency(totalExpenses)}</p>
                        </div>
                    )}

                    {filteredExpenses.length === 0 ? (
                        <div className="card text-center py-12">
                            <p className="text-gray-500">{searchTerm || filter ? 'No matching expenses found' : 'No expenses recorded yet'}</p>
                        </div>
                    ) : (
                        <div className="card overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b border-gray-200">
                                    <tr className="text-gray-600 font-semibold">
                                        <th className="text-left py-3 px-4">Date</th>
                                        <th className="text-left py-3 px-4">Division</th>
                                        <th className="text-left py-3 px-4">Category</th>
                                        <th className="text-left py-3 px-4">Description</th>
                                        <th className="text-left py-3 px-4">Amount</th>
                                        <th className="text-center py-3 px-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredExpenses.map((e) => (
                                        <tr key={e.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4">{formatDate(e.date)}</td>
                                            <td className="py-3 px-4 text-sm">{DIVISIONS.find(d => d.value == e.division)?.label || e.division}</td>
                                            <td className="py-3 px-4">{e.category}</td>
                                            <td className="py-3 px-4 max-w-xs truncate">{e.description}</td>
                                            <td className="py-3 px-4 font-medium">{formatCurrency(e.amount)}</td>
                                            <td className="py-3 px-4 text-center space-x-2">
                                                <button
                                                    onClick={() => window.location.hash = `#/founder/details/expenses/${e.id}`}
                                                    className="text-blue-600 hover:text-blue-800 transition"
                                                    title="Open in founder view"
                                                >
                                                    <Edit2 size={18} className="inline" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(e.id)}
                                                    className="text-red-600 hover:text-red-800 transition"
                                                    title="Delete expense"
                                                >
                                                    <Trash2 size={18} className="inline" />
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

            <Modal isOpen={showModal} onClose={handleCloseModal} title={editingId ? 'Edit Expense' : 'Add Expense'}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded flex gap-2 text-red-700 text-sm">
                            <AlertCircle size={18} className="flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Division</label>
                            <select {...register('division', { valueAsNumber: true })} className="input-field">
                                <option value="">Select division</option>
                                {DIVISIONS.map(d => (
                                    <option key={d.value} value={d.value}>{d.label}</option>
                                ))}
                            </select>
                            {errors.division && <p className="text-red-600 text-xs mt-1">{errors.division.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <input type="text" {...register('category')} className="input-field" placeholder="e.g., Fuel, Fertilizer" />
                            {errors.category && <p className="text-red-600 text-xs mt-1">{errors.category.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Expense Date</label>
                            <input type="date" {...register('date')} className="input-field" />
                            {errors.date && <p className="text-red-600 text-xs mt-1">{errors.date.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                            <input type="number" step="0.01" {...register('amount', { valueAsNumber: true })} className="input-field" placeholder="0.00" />
                            {errors.amount && <p className="text-red-600 text-xs mt-1">{errors.amount.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                            <select {...register('paymentMethod', { valueAsNumber: true })} className="input-field">
                                <option value="">Select payment method</option>
                                {PAYMENT_METHODS.map(m => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                            {errors.paymentMethod && <p className="text-red-600 text-xs mt-1">{errors.paymentMethod.message}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea {...register('description')} className="input-field" rows="3" placeholder="Expense details..." />
                        {errors.description && <p className="text-red-600 text-xs mt-1">{errors.description.message}</p>}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={handleCloseModal} className="btn-secondary flex-1">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                            {loading && <Loader size={16} className="animate-spin" />}
                            {editingId ? 'Update Expense' : 'Add Expense'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
