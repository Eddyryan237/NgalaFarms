import { useQuery } from '@tanstack/react-query'
import { Plus, Loader } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import apiClient from '../../lib/api'
import Modal from '../../components/Modal'
import { useFormHandler } from '../../hooks/useFormHandler'

export default function SheepPage()
{
    const [showModal, setShowModal] = useState(false)
    const { data: sheep = [], isLoading, refetch } = useQuery({ queryKey: ['sheep'], queryFn: () => apiClient.get('/sheep').then(r => r.data || []) })
    const { register, handleSubmit, reset } = useForm({ defaultValues: { sex: 'Female', acquisitionDate: new Date().toISOString().slice(0, 10) } })
    const { submit, loading } = useFormHandler(['sheep'])
    const onSubmit = async data => { const saved = await submit('/sheep', { ...data, acquisitionCost: Number(data.acquisitionCost), currentWeightKg: Number(data.currentWeightKg) }); if (saved) { reset(); setShowModal(false); refetch() } }
    return <div>
        <div className="flex justify-between items-center mb-8"><h1 className="text-3xl font-bold text-gray-900">Sheep</h1><button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> Add Sheep</button></div>
        {isLoading ? <Loader className="animate-spin text-green-600" /> : <div className="card overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b"><th className="text-left p-3">ID</th><th className="text-left p-3">Tag</th><th className="text-left p-3">Sex</th><th className="text-left p-3">Weight (KG)</th><th className="text-left p-3">Remarks</th></tr></thead><tbody>{sheep.map(s => <tr key={s.id} className="border-b"><td className="p-3">{s.sheepId}</td><td className="p-3">{s.tagNumber || '-'}</td><td className="p-3">{s.sex}</td><td className="p-3">{s.currentWeightKg ?? '-'}</td><td className="p-3">{s.remarks || '-'}</td></tr>)}</tbody></table></div>}
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Sheep"><form onSubmit={handleSubmit(onSubmit)} className="space-y-4"><select {...register('sex')} className="input-field"><option value="Male">Male</option><option value="Female">Female</option></select><input type="date" {...register('dateOfBirth')} className="input-field" /><input type="number" step="0.01" {...register('currentWeightKg', { setValueAs: value => value === '' ? undefined : Number(value) })} className="input-field" placeholder="Current weight (KG), optional" /><input type="number" step="0.01" {...register('acquisitionCost', { setValueAs: value => value === '' ? undefined : Number(value) })} className="input-field" placeholder="Acquisition cost" /><input {...register('location')} className="input-field" placeholder="Location" /><textarea {...register('remarks')} className="input-field" rows="3" placeholder="Manager remarks" /><div className="flex gap-3"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button><button disabled={loading} className="btn-primary flex-1">Save Sheep</button></div></form></Modal>
    </div>
}
