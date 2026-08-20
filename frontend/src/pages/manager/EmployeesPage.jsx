import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader, Pencil, Plus, Trash2, UserPlus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import apiClient from '../../lib/api'
import { employeeSchema } from '../../lib/validations'
import { useFormHandler } from '../../hooks/useFormHandler'
import { useToast } from '../../hooks/useToast'

const formatCurrency = (amount) => `${Number(amount || 0).toLocaleString('en-US')} XAF`
const formatDate = (date) => date ? new Date(date).toLocaleDateString() : '-'

export default function EmployeesPage()
{
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [search, setSearch] = useState('')
    const { addToast } = useToast()
    const { submit, loading, error } = useFormHandler(['employees'])
    const { data: employees = [], isLoading, refetch } = useQuery({
        queryKey: ['employees'],
        queryFn: () => apiClient.get('/employees').then(response => response.data)
    })
    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(employeeSchema),
        defaultValues: { employmentDate: new Date().toISOString().slice(0, 10), monthlySalary: 0 }
    })

    const resetEmployeeForm = () => reset({ employmentDate: new Date().toISOString().slice(0, 10), monthlySalary: 0 })

    const onSubmit = async (data) =>
    {
        const saved = await submit(editingId ? `/employees/${editingId}` : '/employees', {
            ...data,
            monthlySalary: Number(data.monthlySalary),
            status: 'Active'
        }, editingId ? 'PUT' : 'POST')
        if (!saved)
        {
            addToast(`Failed to ${editingId ? 'update' : 'add'} employee`, 'error')
            return
        }
        addToast(`Employee ${editingId ? 'updated' : 'added'} successfully`, 'success')
        resetEmployeeForm()
        setEditingId(null)
        setShowForm(false)
        refetch()
    }

    const handleEdit = (employee) =>
    {
        setEditingId(employee.id)
        reset({
            fullName: employee.fullName, phone: employee.phone || '', email: employee.email || '',
            address: employee.address || '', position: employee.position, department: employee.department,
            monthlySalary: employee.monthlySalary, employmentDate: employee.employmentDate?.slice(0, 10),
            emergencyContact: employee.emergencyContact || '', emergencyPhone: employee.emergencyPhone || '', notes: employee.notes || ''
        })
        setShowForm(true)
    }

    const handleDelete = async (employee) =>
    {
        if (!window.confirm(`Delete employee ${employee.fullName}?`)) return
        try
        {
            await apiClient.delete(`/employees/${employee.id}`)
            addToast('Employee deleted successfully', 'success')
            refetch()
        } catch (err)
        {
            addToast(err.response?.data?.message || 'Failed to delete employee', 'error')
        }
    }

    const filteredEmployees = employees.filter(employee =>
        `${employee.fullName} ${employee.employeeId} ${employee.position} ${employee.department}`.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
                    <p className="text-gray-600 mt-1">Add and manage farm employee records.</p>
                </div>
                <button onClick={() => { setEditingId(null); resetEmployeeForm(); setShowForm(!showForm) }} className="btn-primary flex items-center justify-center gap-2">
                    <Plus size={18} /> {showForm ? 'Close form' : 'Add employee'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5">
                    <div className="flex items-center gap-2 border-b border-gray-200 pb-4">
                        <UserPlus size={20} className="text-green-700" />
                        <h2 className="text-xl font-semibold text-gray-900">{editingId ? 'Edit employee' : 'New employee'}</h2>
                    </div>
                    {error && <p className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</p>}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Field label="Full name" error={errors.fullName?.message}><input {...register('fullName')} className="input-field" placeholder="Employee full name" /></Field>
                        <Field label="Phone number (optional)" error={errors.phone?.message}><input {...register('phone')} className="input-field" placeholder="Phone number" /></Field>
                        <Field label="Email (optional)" error={errors.email?.message}><input type="email" {...register('email')} className="input-field" placeholder="employee@example.com" /></Field>
                        <Field label="Position" error={errors.position?.message}><input {...register('position')} className="input-field" placeholder="e.g. Farm supervisor" /></Field>
                        <Field label="Department" error={errors.department?.message}><input {...register('department')} className="input-field" placeholder="e.g. Palm Oil" /></Field>
                        <Field label="Monthly salary" error={errors.monthlySalary?.message}><input type="number" step="0.01" {...register('monthlySalary')} className="input-field" placeholder="0.00" /></Field>
                        <Field label="Employment date" error={errors.employmentDate?.message}><input type="date" {...register('employmentDate')} className="input-field" /></Field>
                        <Field label="Address" error={errors.address?.message}><input {...register('address')} className="input-field" placeholder="Residential address" /></Field>
                        <Field label="Emergency contact (optional)" error={errors.emergencyContact?.message}><input {...register('emergencyContact')} className="input-field" placeholder="Contact name" /></Field>
                        <Field label="Emergency phone (optional)" error={errors.emergencyPhone?.message}><input {...register('emergencyPhone')} className="input-field" placeholder="Emergency phone" /></Field>
                    </div>
                    <Field label="Notes" error={errors.notes?.message}><textarea {...register('notes')} className="input-field" rows="3" placeholder="Optional notes" /></Field>
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={() => { setShowForm(false); setEditingId(null); resetEmployeeForm() }} className="btn-secondary">Cancel</button>
                        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">{loading && <Loader size={16} className="animate-spin" />} {editingId ? 'Update employee' : 'Save employee'}</button>
                    </div>
                </form>
            )}

            <section className="card overflow-x-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                    <h2 className="text-xl font-semibold text-gray-900">Employee records</h2>
                    <input value={search} onChange={event => setSearch(event.target.value)} className="input-field sm:max-w-xs" placeholder="Search employees..." />
                </div>
                {isLoading ? <Loader className="animate-spin text-green-600" /> : filteredEmployees.length === 0 ? <p className="text-gray-500 py-6">{search ? 'No matching employees found.' : 'No employees added yet.'}</p> : (
                    <table className="w-full text-sm">
                        <thead className="border-b border-gray-200"><tr className="text-left text-gray-600"><th className="py-3 px-3">Employee ID</th><th className="py-3 px-3">Name</th><th className="py-3 px-3">Phone</th><th className="py-3 px-3">Position</th><th className="py-3 px-3">Department</th><th className="py-3 px-3">Monthly salary</th><th className="py-3 px-3">Start date</th><th className="py-3 px-3">Actions</th></tr></thead>
                        <tbody>{filteredEmployees.map(employee => <tr key={employee.id} className="border-b border-gray-100"><td className="py-3 px-3 font-medium">{employee.employeeId}</td><td className="py-3 px-3">{employee.fullName}</td><td className="py-3 px-3">{employee.phone || '-'}</td><td className="py-3 px-3">{employee.position}</td><td className="py-3 px-3">{employee.department}</td><td className="py-3 px-3 font-semibold">{formatCurrency(employee.monthlySalary)}</td><td className="py-3 px-3">{formatDate(employee.employmentDate)}</td><td className="py-3 px-3"><button onClick={() => handleEdit(employee)} className="text-blue-600 hover:text-blue-800 mr-3" title="Edit employee"><Pencil size={17} /></button><button onClick={() => handleDelete(employee)} className="text-red-600 hover:text-red-800" title="Delete employee"><Trash2 size={17} /></button></td></tr>)}</tbody>
                    </table>
                )}
            </section>
        </div>
    )
}

function Field({ label, error, children })
{
    return <div><label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>{children}{error && <p className="text-red-600 text-xs mt-1">{error}</p>}</div>
}
