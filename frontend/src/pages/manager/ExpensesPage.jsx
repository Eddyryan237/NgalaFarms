import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, AlertCircle, Loader } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import apiClient from '../../lib/api'
import Modal from '../../components/Modal'
import { expenseSchema } from '../../lib/validations'
import { useFormHandler } from '../../hooks/useFormHandler'

const DIVISIONS = ['Palm Oil Production', 'Cattle Management', 'General', 'Operations', 'Maintenance']

export default function ExpensesPage()
{
    const [showModal, setShowModal] = useState(false)
    const [filter, setFilter] = useState('')

    const { data: expenses = [], isLoading } = useQuery({
        queryKey: ['expenses'],
        queryFn: () => apiClient.get('/expenses').then(r => r.data)
    })

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(expenseSchema)
    })

    const { submit, loading, error } = useFormHandler(['expenses'])

    const onSubmit = async (data) =>
    {
        const success = await submit('/expenses', data)
        if (success)
        {
            reset()
            setShowModal(false)
        }
    }

    const filteredExpenses = filter
        ? expenses.filter(e => e.division === filter)
        : expenses

    const formatDate = (date) => new Date(date).toLocaleDateString()
    const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
                <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
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
                    <div className="mb-6 flex gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Division</label>
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="input-field"
                            >
                                <option value="">All Divisions</option>
                                {DIVISIONS.map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                        {filteredExpenses.length > 0 && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-4 flex items-end">
                                <div>
                                    <p className="text-blue-600 text-sm font-medium">Total Expenses</p>
                                    <p className="text-2xl font-bold text-blue-900">{formatCurrency(totalExpenses)}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {filteredExpenses.length === 0 ? (
                        <div className="card text-center py-12">
                            <p className="text-gray-500">No expenses recorded yet</p>
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
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredExpenses.map((e) => (
                                        <tr key={e.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4">{formatDate(e.expenseDate)}</td>
                                            <td className="py-3 px-4 text-sm">{e.division}</td>
                                            <td className="py-3 px-4">{e.category}</td>
                                            <td className="py-3 px-4">{e.description}</td>
                                            <td className="py-3 px-4 font-medium">{formatCurrency(e.amount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Expense">
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
                            <select {...register('division')} className="input-field">
                                <option value="">Select division</option>
                                {DIVISIONS.map(d => (
                                    <option key={d} value={d}>{d}</option>
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
                            <input type="date" {...register('expenseDate')} className="input-field" />
                            {errors.expenseDate && <p className="text-red-600 text-xs mt-1">{errors.expenseDate.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                            <input type="number" step="0.01" {...register('amount', { valueAsNumber: true })} className="input-field" placeholder="0.00" />
                            {errors.amount && <p className="text-red-600 text-xs mt-1">{errors.amount.message}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea {...register('description')} className="input-field" rows="3" placeholder="Expense details..." />
                        {errors.description && <p className="text-red-600 text-xs mt-1">{errors.description.message}</p>}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                            {loading && <Loader size={16} className="animate-spin" />}
                            Add Expense
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
