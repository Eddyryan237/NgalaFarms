import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, AlertCircle, Loader } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import apiClient from '../../lib/api'
import Modal from '../../components/Modal'
import { cattleSchema } from '../../lib/validations'
import { useFormHandler } from '../../hooks/useFormHandler'

export default function CattleListPage()
{
    const [showModal, setShowModal] = useState(false)
    const { data: cattle = [], isLoading } = useQuery({
        queryKey: ['cattle'],
        queryFn: () => apiClient.get('/cattle').then(r => r.data)
    })

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(cattleSchema)
    })

    const { submit, loading, error } = useFormHandler(['cattle'])

    const onSubmit = async (data) =>
    {
        const success = await submit('/cattle', data)
        if (success)
        {
            reset()
            setShowModal(false)
        }
    }

    const handleAddCattle = () =>
    {
        reset()
        setShowModal(true)
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Cattle Management</h1>
                <button onClick={handleAddCattle} className="btn-primary flex items-center gap-2">
                    <Plus size={18} />
                    Add Cattle
                </button>
            </div>

            {isLoading ? (
                <div className="card text-center py-12">
                    <Loader className="inline animate-spin text-green-600" size={32} />
                </div>
            ) : cattle.length === 0 ? (
                <div className="card text-center py-12">
                    <p className="text-gray-500">No cattle records found</p>
                </div>
            ) : (
                <div className="card overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b border-gray-200">
                            <tr className="text-gray-600 font-semibold">
                                <th className="text-left py-3 px-4">ID</th>
                                <th className="text-left py-3 px-4">Tag</th>
                                <th className="text-left py-3 px-4">Breed</th>
                                <th className="text-left py-3 px-4">Sex</th>
                                <th className="text-left py-3 px-4">Weight (KG)</th>
                                <th className="text-left py-3 px-4">Status</th>
                                <th className="text-left py-3 px-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cattle.map((c) => (
                                <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4 font-medium">{c.cattleId}</td>
                                    <td className="py-3 px-4">{c.tagNumber}</td>
                                    <td className="py-3 px-4">{c.breed}</td>
                                    <td className="py-3 px-4">{c.sex}</td>
                                    <td className="py-3 px-4">{c.currentWeightKg}</td>
                                    <td className="py-3 px-4"><span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">{c.status}</span></td>
                                    <td className="py-3 px-4 text-xs space-x-2">
                                        <button className="text-blue-600 hover:underline">View</button>
                                        <button className="text-orange-600 hover:underline">Edit</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Cattle">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded flex gap-2 text-red-700 text-sm">
                            <AlertCircle size={18} className="flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tag Number</label>
                            <input type="text" {...register('tagNumber')} className="input-field" placeholder="e.g., COW-001" />
                            {errors.tagNumber && <p className="text-red-600 text-xs mt-1">{errors.tagNumber.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
                            <input type="text" {...register('breed')} className="input-field" placeholder="e.g., Friesian" />
                            {errors.breed && <p className="text-red-600 text-xs mt-1">{errors.breed.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sex</label>
                            <select {...register('sex')} className="input-field">
                                <option value="">Select sex</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                            {errors.sex && <p className="text-red-600 text-xs mt-1">{errors.sex.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                            <input type="date" {...register('dateOfBirth')} className="input-field" />
                            {errors.dateOfBirth && <p className="text-red-600 text-xs mt-1">{errors.dateOfBirth.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Current Weight (KG)</label>
                            <input type="number" step="0.01" {...register('currentWeightKg', { valueAsNumber: true })} className="input-field" placeholder="0.00" />
                            {errors.currentWeightKg && <p className="text-red-600 text-xs mt-1">{errors.currentWeightKg.message}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea {...register('description')} className="input-field" rows="3" placeholder="Additional notes..." />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                            {loading && <Loader size={16} className="animate-spin" />}
                            Add Cattle
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
