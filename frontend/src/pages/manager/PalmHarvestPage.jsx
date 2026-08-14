import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, AlertCircle, Loader } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import apiClient from '../../lib/api'
import Modal from '../../components/Modal'
import { palmHarvestSchema } from '../../lib/validations'
import { useFormHandler } from '../../hooks/useFormHandler'

export default function PalmHarvestPage()
{
    const [showModal, setShowModal] = useState(false)

    const { data: harvests = [], isLoading } = useQuery({
        queryKey: ['palm-harvests'],
        queryFn: () => apiClient.get('/palm-harvests').then(r => r.data)
    })

    const { data: plantations = [] } = useQuery({
        queryKey: ['plantations'],
        queryFn: () => apiClient.get('/plantations').then(r => r.data)
    })

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(palmHarvestSchema)
    })

    const { submit, loading, error } = useFormHandler(['palm-harvests'])

    const onSubmit = async (data) =>
    {
        const success = await submit('/palm-harvests', data)
        if (success)
        {
            reset()
            setShowModal(false)
        }
    }

    const formatDate = (date) => new Date(date).toLocaleDateString()

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Palm Harvesting</h1>
                <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
                    <Plus size={18} />
                    Record Harvest
                </button>
            </div>

            {isLoading ? (
                <div className="card text-center py-12">
                    <Loader className="inline animate-spin text-green-600" size={32} />
                </div>
            ) : harvests.length === 0 ? (
                <div className="card text-center py-12">
                    <p className="text-gray-500">No harvests recorded yet</p>
                </div>
            ) : (
                <div className="card overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b border-gray-200">
                            <tr className="text-gray-600 font-semibold">
                                <th className="text-left py-3 px-4">Harvest ID</th>
                                <th className="text-left py-3 px-4">Plantation</th>
                                <th className="text-left py-3 px-4">Date</th>
                                <th className="text-left py-3 px-4">Fruit Bunches</th>
                                <th className="text-left py-3 px-4">Est. Yield (KG)</th>
                                <th className="text-left py-3 px-4">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {harvests.map((h) => (
                                <tr key={h.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4 font-medium">{h.harvestId}</td>
                                    <td className="py-3 px-4">{h.plantation?.name}</td>
                                    <td className="py-3 px-4">{formatDate(h.harvestDate)}</td>
                                    <td className="py-3 px-4">{h.fruitBunchesCollected}</td>
                                    <td className="py-3 px-4">{h.estimatedYieldKg}</td>
                                    <td className="py-3 px-4"><span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">{h.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Record Palm Harvest">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded flex gap-2 text-red-700 text-sm">
                            <AlertCircle size={18} className="flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Plantation</label>
                            <select {...register('plantationId')} className="input-field">
                                <option value="">Select plantation</option>
                                {plantations.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            {errors.plantationId && <p className="text-red-600 text-xs mt-1">{errors.plantationId.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Harvest Date</label>
                            <input type="date" {...register('harvestDate')} className="input-field" />
                            {errors.harvestDate && <p className="text-red-600 text-xs mt-1">{errors.harvestDate.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fruit Bunches Collected</label>
                            <input type="number" {...register('fruitBunchesCollected', { valueAsNumber: true })} className="input-field" placeholder="0" />
                            {errors.fruitBunchesCollected && <p className="text-red-600 text-xs mt-1">{errors.fruitBunchesCollected.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Yield (KG)</label>
                            <input type="number" step="0.01" {...register('estimatedYieldKg', { valueAsNumber: true })} className="input-field" placeholder="0.00" />
                            {errors.estimatedYieldKg && <p className="text-red-600 text-xs mt-1">{errors.estimatedYieldKg.message}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea {...register('notes')} className="input-field" rows="3" placeholder="Harvest notes..." />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                            {loading && <Loader size={16} className="animate-spin" />}
                            Record Harvest
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
