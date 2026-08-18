import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, AlertCircle, Loader, Eye, Pencil, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import apiClient from '../../lib/api'
import Modal from '../../components/Modal'
import { palmHarvestSchema } from '../../lib/validations'
import { useToast } from '../../hooks/useToast'

export default function PalmHarvestPage()
{
    const queryClient = useQueryClient()
    const { showToast } = useToast()
    const [showModal, setShowModal] = useState(false)
    const [showDetails, setShowDetails] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [selectedHarvest, setSelectedHarvest] = useState(null)

    const { data: harvests = [], isLoading } = useQuery({
        queryKey: ['palm-harvests'],
        queryFn: () => apiClient.get('/palm-harvests').then(r => r.data || [])
    })

    const { data: plantations = [] } = useQuery({
        queryKey: ['plantations'],
        queryFn: () => apiClient.get('/plantations').then(r => r.data || [])
    })

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
        resolver: zodResolver(palmHarvestSchema),
        defaultValues: {
            plantationId: '',
            palmBlockId: '',
            harvestDate: new Date().toISOString().split('T')[0],
            numberOfBunches: '',
            totalWeightKg: '',
            harvestTeam: '',
            laborCost: '',
            notes: ''
        }
    })

    const selectedPlantationId = watch('plantationId')
    const { data: blocks = [] } = useQuery({
        queryKey: ['plantation-blocks', selectedPlantationId],
        enabled: !!selectedPlantationId,
        queryFn: () => apiClient.get(`/plantations/${selectedPlantationId}/blocks`).then(r => r.data || [])
    })

    const invalidateHarvestQueries = () => {
        queryClient.invalidateQueries({ queryKey: ['palm-harvests'] })
        queryClient.invalidateQueries({ queryKey: ['all-palm-harvests'] })
        queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] })
    }

    const saveMutation = useMutation({
        mutationFn: (payload) => editingId
            ? apiClient.put(`/palm-harvests/${editingId}`, payload)
            : apiClient.post('/palm-harvests', payload),
        onSuccess: () => {
            invalidateHarvestQueries()
            resetForm()
            showToast(editingId ? 'Palm harvest updated successfully!' : 'Palm harvest recorded successfully!', 'success')
        },
        onError: (err) => {
            showToast(err.response?.data?.message || (editingId ? 'Failed to update palm harvest' : 'Failed to record palm harvest'), 'error')
        }
    })

    const deleteMutation = useMutation({
        mutationFn: (id) => apiClient.delete(`/palm-harvests/${id}`),
        onSuccess: () => {
            invalidateHarvestQueries()
            setSelectedHarvest(null)
            setShowDetails(false)
            showToast('Palm harvest deleted successfully!', 'success')
        },
        onError: (err) => {
            showToast(err.response?.data?.message || 'Failed to delete palm harvest', 'error')
        }
    })

    const resetForm = () => {
        reset({
            plantationId: '',
            palmBlockId: '',
            harvestDate: new Date().toISOString().split('T')[0],
            numberOfBunches: '',
            totalWeightKg: '',
            harvestTeam: '',
            laborCost: '',
            notes: ''
        })
        setEditingId(null)
        setShowModal(false)
    }

    const onSubmit = async (data) => {
        const payload = {
            plantationId: Number(data.plantationId),
            palmBlockId: data.palmBlockId ? Number(data.palmBlockId) : null,
            harvestDate: data.harvestDate,
            numberOfBunches: Number(data.numberOfBunches),
            totalWeightKg: Number(data.totalWeightKg),
            harvestTeam: data.harvestTeam,
            laborCost: Number(data.laborCost),
            notes: data.notes || ''
        }

        saveMutation.mutate(payload)
    }

    const openEdit = (harvest) => {
        setEditingId(harvest.id)
        setSelectedHarvest(harvest)
        setValue('plantationId', String(harvest.plantationId || ''))
        setValue('palmBlockId', harvest.palmBlockId ? String(harvest.palmBlockId) : '')
        setValue('harvestDate', harvest.harvestDate ? harvest.harvestDate.split('T')[0] : new Date().toISOString().split('T')[0])
        setValue('numberOfBunches', harvest.numberOfBunches ?? '')
        setValue('totalWeightKg', harvest.totalWeightKg ?? '')
        setValue('harvestTeam', harvest.harvestTeam || '')
        setValue('laborCost', harvest.laborCost ?? '')
        setValue('notes', harvest.notes || '')
        setShowModal(true)
    }

    const formatDate = (date) => new Date(date).toLocaleDateString()

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Palm Harvesting</h1>
                <button onClick={() => { setEditingId(null); setSelectedHarvest(null); setShowModal(true); reset({ plantationId: '', palmBlockId: '', harvestDate: new Date().toISOString().split('T')[0], numberOfBunches: '', totalWeightKg: '', harvestTeam: '', laborCost: '', notes: '' }) }} className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center">
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
                                <th className="text-left py-3 px-4">Bunches</th>
                                <th className="text-left py-3 px-4">Yield (KG)</th>
                                <th className="text-left py-3 px-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {harvests.map((h) => (
                                <tr key={h.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4 font-medium">{h.harvestId}</td>
                                    <td className="py-3 px-4">{h.plantationName || 'N/A'}</td>
                                    <td className="py-3 px-4">{formatDate(h.harvestDate)}</td>
                                    <td className="py-3 px-4">{h.numberOfBunches}</td>
                                    <td className="py-3 px-4">{h.totalWeightKg}</td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                            <button type="button" onClick={() => { setSelectedHarvest(h); setShowDetails(true) }} className="text-blue-600 hover:text-blue-800" title="View details">
                                                <Eye size={18} />
                                            </button>
                                            <button type="button" onClick={() => openEdit(h)} className="text-green-600 hover:text-green-800" title="Edit harvest">
                                                <Pencil size={18} />
                                            </button>
                                            <button type="button" onClick={() => deleteMutation.mutate(h.id)} className="text-red-600 hover:text-red-800" title="Delete harvest">
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

            <Modal isOpen={showModal} onClose={() => resetForm()} title={editingId ? 'Edit Palm Harvest' : 'Record Palm Harvest'}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {saveMutation.isError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded flex gap-2 text-red-700 text-sm">
                            <AlertCircle size={18} className="flex-shrink-0" />
                            {saveMutation.error?.response?.data?.message || 'Failed to save harvest'}
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Palm Block</label>
                            <select {...register('palmBlockId')} className="input-field" disabled={!selectedPlantationId}>
                                <option value="">No specific block</option>
                                {blocks.map(block => (
                                    <option key={block.id} value={block.id}>{block.name}</option>
                                ))}
                            </select>
                            {errors.palmBlockId && <p className="text-red-600 text-xs mt-1">{errors.palmBlockId.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Harvest Date</label>
                            <input type="date" {...register('harvestDate')} className="input-field" />
                            {errors.harvestDate && <p className="text-red-600 text-xs mt-1">{errors.harvestDate.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Harvest Team</label>
                            <input type="text" {...register('harvestTeam')} className="input-field" placeholder="Team Alpha" />
                            {errors.harvestTeam && <p className="text-red-600 text-xs mt-1">{errors.harvestTeam.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fruit Bunches</label>
                            <input type="number" {...register('numberOfBunches', { valueAsNumber: true })} className="input-field" placeholder="0" />
                            {errors.numberOfBunches && <p className="text-red-600 text-xs mt-1">{errors.numberOfBunches.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Yield (KG)</label>
                            <input type="number" step="0.01" {...register('totalWeightKg', { valueAsNumber: true })} className="input-field" placeholder="0.00" />
                            {errors.totalWeightKg && <p className="text-red-600 text-xs mt-1">{errors.totalWeightKg.message}</p>}
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Labor Cost</label>
                            <input type="number" step="0.01" {...register('laborCost', { valueAsNumber: true })} className="input-field" placeholder="0.00" />
                            {errors.laborCost && <p className="text-red-600 text-xs mt-1">{errors.laborCost.message}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea {...register('notes')} className="input-field" rows="3" placeholder="Harvest notes..." />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={() => resetForm()} className="btn-secondary flex-1">
                            Cancel
                        </button>
                        <button type="submit" disabled={saveMutation.isPending} className="btn-primary flex-1 flex items-center justify-center gap-2">
                            {saveMutation.isPending && <Loader size={16} className="animate-spin" />}
                            {editingId ? 'Update Harvest' : 'Record Harvest'}
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={showDetails} onClose={() => { setShowDetails(false); setSelectedHarvest(null) }} title="Harvest Details">
                {selectedHarvest ? (
                    <div className="space-y-4 text-sm text-gray-700">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-gray-500">Harvest ID</p>
                                <p className="font-semibold text-gray-900">{selectedHarvest.harvestId}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Plantation</p>
                                <p className="font-semibold text-gray-900">{selectedHarvest.plantationName || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Date</p>
                                <p className="font-semibold text-gray-900">{formatDate(selectedHarvest.harvestDate)}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Palm Block</p>
                                <p className="font-semibold text-gray-900">{selectedHarvest.blockName || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Bunches</p>
                                <p className="font-semibold text-gray-900">{selectedHarvest.numberOfBunches}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Yield</p>
                                <p className="font-semibold text-gray-900">{selectedHarvest.totalWeightKg} KG</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Team</p>
                                <p className="font-semibold text-gray-900">{selectedHarvest.harvestTeam || 'Field team'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Labor Cost</p>
                                <p className="font-semibold text-gray-900">{selectedHarvest.laborCost || 0}</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-gray-500">Notes</p>
                            <p className="font-semibold text-gray-900 whitespace-pre-line">{selectedHarvest.notes || 'No notes provided.'}</p>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={() => { setShowDetails(false); openEdit(selectedHarvest) }} className="btn-primary flex-1">
                                Edit Harvest
                            </button>
                            <button type="button" onClick={() => { setShowDetails(false); deleteMutation.mutate(selectedHarvest.id) }} className="btn-secondary flex-1">
                                Delete
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500">No harvest selected.</p>
                )}
            </Modal>
        </div>
    )
}
