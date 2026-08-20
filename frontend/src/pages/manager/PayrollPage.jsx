import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, Loader, Printer, Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import apiClient from '../../lib/api'
import { payrollSchema } from '../../lib/validations'
import { useFormHandler } from '../../hooks/useFormHandler'
import { useToast } from '../../hooks/useToast'

const PAYMENT_METHODS = [
    { label: 'Cash', value: 'Cash' },
    { label: 'Bank Transfer', value: 'BankTransfer' },
    { label: 'Mobile Money', value: 'MobileMoney' },
    { label: 'Cheque', value: 'Cheque' },
    { label: 'Other', value: 'Other' }
]

const formatCurrency = (amount) => `${Number(amount || 0).toLocaleString('en-US')} XAF`
const formatDate = (date) => date ? new Date(date).toLocaleDateString() : '-'

export default function PayrollPage()
{
    const [receipt, setReceipt] = useState(null)
    const { addToast } = useToast()
    const { submit, loading, error } = useFormHandler(['payroll'])
    const { data: employees = [], isLoading: employeesLoading } = useQuery({
        queryKey: ['employees'],
        queryFn: () => apiClient.get('/employees').then(response => response.data)
    })
    const { data: payroll = [], isLoading: payrollLoading, refetch } = useQuery({
        queryKey: ['payroll'],
        queryFn: () => apiClient.get('/payroll').then(response => response.data)
    })
    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(payrollSchema),
        defaultValues: {
            paymentDate: new Date().toISOString().slice(0, 10),
            paymentMethod: 'Cash'
        }
    })
    const onSubmit = async (data) =>
    {
        const saved = await submit('/payroll', { ...data, employeeId: Number(data.employeeId) })
        if (!saved)
        {
            addToast('Failed to record payroll', 'error')
            return
        }
        setReceipt(saved)
        reset({ paymentDate: new Date().toISOString().slice(0, 10), paymentMethod: 'Cash' })
        refetch()
        addToast('Payroll recorded and receipt generated', 'success')
    }

    const printReceipt = () =>
    {
        if (!receipt) return
        const printWindow = window.open('', '_blank', 'width=720,height=800')
        if (!printWindow) return
        printWindow.document.write(`
            <html><head><title>${receipt.receiptNumber}</title><style>
            body{font-family:Arial,sans-serif;max-width:640px;margin:40px auto;color:#17221b}h1{margin-bottom:4px;color:#166534}h2{border-bottom:1px solid #d1d5db;padding-bottom:8px}.row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e5e7eb}.total{font-size:22px;font-weight:bold;margin-top:20px}.muted{color:#6b7280}
            </style></head><body><h1>Ngala Farms</h1><p class="muted">Salary Payment Receipt</p><h2>${receipt.receiptNumber}</h2>
            <div class="row"><b>Employee ID</b><span>${receipt.employeeCode}</span></div><div class="row"><b>Employee name</b><span>${receipt.employeeName}</span></div><div class="row"><b>Phone</b><span>${receipt.employeePhone || '-'}</span></div><div class="row"><b>Position</b><span>${receipt.employeePosition}</span></div><div class="row"><b>Department</b><span>${receipt.employeeDepartment}</span></div><div class="row"><b>Payroll period</b><span>${receipt.period}</span></div><div class="row"><b>Period dates</b><span>${formatDate(receipt.periodStart)} - ${formatDate(receipt.periodEnd)}</span></div><div class="row"><b>Payment date</b><span>${formatDate(receipt.paymentDate)}</span></div><div class="row"><b>Payment method</b><span>${receipt.paymentMethod}</span></div><p class="total">Amount paid: ${formatCurrency(receipt.amount)}</p><p class="muted">Status: Paid</p><p>${receipt.notes || ''}</p><script>window.print();</script></body></html>`)
        printWindow.document.close()
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Payroll</h1>
                <p className="text-gray-600 mt-1">Register employee salary payments and generate receipts.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] gap-6 items-start">
                <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5">
                    <div className="flex items-center gap-2 border-b border-gray-200 pb-4">
                        <Save size={20} className="text-green-700" />
                        <h2 className="text-xl font-semibold text-gray-900">Record salary payment</h2>
                    </div>
                    {error && <p className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</p>}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                        <select {...register('employeeId')} className="input-field" disabled={employeesLoading}>
                            <option value="">{employeesLoading ? 'Loading employees...' : 'Select employee'}</option>
                            {employees.map(employee => <option key={employee.id} value={employee.id}>{employee.employeeId} - {employee.fullName} ({employee.position})</option>)}
                        </select>
                        {errors.employeeId && <p className="text-red-600 text-xs mt-1">{errors.employeeId.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Amount paid" error={errors.amount?.message}><input type="number" step="0.01" {...register('amount')} className="input-field" placeholder="0.00" /></Field>
                        <Field label="Payroll month" error={errors.period?.message}><input type="month" {...register('period')} className="input-field" /></Field>
                        <Field label="Payment date" error={errors.paymentDate?.message}><input type="date" {...register('paymentDate')} className="input-field" /></Field>
                        <Field label="Payment method" error={errors.paymentMethod?.message}><select {...register('paymentMethod')} className="input-field">{PAYMENT_METHODS.map(method => <option key={method.value} value={method.value}>{method.label}</option>)}</select></Field>
                    </div>
                    <Field label="Notes"><textarea {...register('notes')} className="input-field" rows="3" placeholder="Optional payment notes" /></Field>
                    <button type="submit" disabled={loading} className="btn-primary w-full flex justify-center items-center gap-2">{loading ? <Loader size={17} className="animate-spin" /> : <Save size={17} />} Record payment</button>
                </form>

                {receipt ? <ReceiptCard receipt={receipt} onPrint={printReceipt} /> : <div className="card text-center py-14"><Printer className="mx-auto text-gray-400" size={38} /><p className="mt-4 font-medium text-gray-700">Your receipt will appear here</p><p className="text-sm text-gray-500 mt-1">Complete a payment to generate a printable receipt.</p></div>}
            </div>

            <section className="card overflow-x-auto">
                <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-semibold text-gray-900">Payroll history</h2><span className="text-sm text-gray-500">{payroll.length} record(s)</span></div>
                {payrollLoading ? <Loader className="animate-spin text-green-600" /> : payroll.length === 0 ? <p className="text-gray-500 py-6">No salary payments recorded yet.</p> : <table className="w-full text-sm"><thead className="border-b border-gray-200"><tr className="text-left text-gray-600"><th className="py-3 px-3">Receipt</th><th className="py-3 px-3">Employee</th><th className="py-3 px-3">Period</th><th className="py-3 px-3">Paid</th><th className="py-3 px-3">Amount</th><th className="py-3 px-3"></th></tr></thead><tbody>{payroll.map(item => <tr key={item.id} className="border-b border-gray-100"><td className="py-3 px-3 font-medium">{item.receiptNumber}</td><td className="py-3 px-3">{item.employeeName}<br /><span className="text-xs text-gray-500">{item.employeeCode}</span></td><td className="py-3 px-3">{item.period}</td><td className="py-3 px-3">{formatDate(item.paymentDate)}</td><td className="py-3 px-3 font-semibold">{formatCurrency(item.amount)}</td><td className="py-3 px-3"><button onClick={() => setReceipt(item)} className="text-green-700 hover:text-green-900" title="View receipt"><Printer size={18} /></button></td></tr>)}</tbody></table>}
            </section>
        </div>
    )
}

function Field({ label, error, children })
{
    return <div><label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>{children}{error && <p className="text-red-600 text-xs mt-1">{error}</p>}</div>
}

function ReceiptCard({ receipt, onPrint })
{
    return <aside className="card border-green-200"><div className="flex justify-between items-start border-b border-gray-200 pb-4"><div><p className="text-sm text-green-700 font-semibold">Ngala Farms</p><h2 className="text-xl font-bold text-gray-900">Salary receipt</h2></div><CheckCircle2 className="text-green-600" /></div><p className="font-mono text-sm mt-4">{receipt.receiptNumber}</p><div className="space-y-3 text-sm mt-5"><ReceiptRow label="Employee ID" value={receipt.employeeCode} /><ReceiptRow label="Employee" value={receipt.employeeName} /><ReceiptRow label="Phone" value={receipt.employeePhone || '-'} /><ReceiptRow label="Position" value={receipt.employeePosition} /><ReceiptRow label="Department" value={receipt.employeeDepartment} /><ReceiptRow label="Period" value={`${receipt.period} (${formatDate(receipt.periodStart)} - ${formatDate(receipt.periodEnd)})`} /><ReceiptRow label="Payment date" value={formatDate(receipt.paymentDate)} /><ReceiptRow label="Method" value={receipt.paymentMethod} /></div><div className="flex justify-between border-t border-gray-200 mt-5 pt-4 text-lg font-bold"><span>Total paid</span><span>{formatCurrency(receipt.amount)}</span></div><button onClick={onPrint} className="btn-secondary mt-5 w-full flex justify-center items-center gap-2"><Printer size={17} /> Print receipt</button></aside>
}

function ReceiptRow({ label, value })
{
    return <div className="flex justify-between gap-4"><span className="text-gray-500">{label}</span><span className="font-medium text-right">{value}</span></div>
}
