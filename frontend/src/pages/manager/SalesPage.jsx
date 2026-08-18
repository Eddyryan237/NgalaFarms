import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, AlertCircle, Loader, Edit2, Trash2, Eye } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import apiClient from '../../lib/api'
import Modal from '../../components/Modal'
import { salesSchema } from '../../lib/validations'
import { useToast } from '../../hooks/useToast'

const DEFAULT_ACKNOWLEDGEMENT = 'I hereby confirm that I have inspected and tasted the palm oil prior to purchase. I have verified the color, texture and taste of the product and found it satisfactory. I accept the product in its present condition and acknowledge that the sale was completed after my verification and approval'

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
            customerName: '',
            customerPhone: '',
            customerEmail: '',
            customerAddress: '',
            sellerName: '',
            saleDate: new Date().toISOString().split('T')[0],
            product: 'Palm Oil',
            quantityLitres: '',
            unitPrice: '',
            paymentMethod: 'Cash',
            paymentStatus: 'Paid',
            notes: DEFAULT_ACKNOWLEDGEMENT
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
        onSuccess: (response) =>
        {
            invalidateSalesQueries()
            resetForm()
            showToast(editingId ? 'Sale updated successfully' : 'Sale recorded successfully', 'success')
            const savedSale = response?.data || selectedSale
            printReceipt(savedSale)
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
            customerName: '',
            customerPhone: '',
            customerEmail: '',
            customerAddress: '',
            sellerName: '',
            saleDate: new Date().toISOString().split('T')[0],
            product: 'Palm Oil',
            quantityLitres: '',
            unitPrice: '',
            paymentMethod: 'Cash',
            paymentStatus: 'Paid',
            notes: DEFAULT_ACKNOWLEDGEMENT
        })
        setEditingId(null)
        setShowModal(false)
    }

    const printReceipt = (saleRecord) =>
    {
        const receipt = saleRecord || selectedSale
        if (!receipt) return

        const receiptWindow = window.open('', '_blank', 'width=900,height=1200')
        if (!receiptWindow)
        {
            showToast('Receipt could not open because pop-ups are blocked. Please allow pop-ups and try again.', 'error')
            return
        }

        const saleDate = receipt.saleDate ? new Date(receipt.saleDate).toLocaleString() : 'N/A'
        const totalAmount = Number(receipt.totalPrice ?? ((receipt.quantityLitres ?? 0) * (receipt.unitPrice ?? 0)))
        const logoUrl = '/images/ngalafarmslogo.png'
        const sellerName = receipt.sellerName || 'Not provided'
        const saleNotes = (receipt.notes || '').trim() || DEFAULT_ACKNOWLEDGEMENT
        const customerPhone = (receipt.customerPhone || '').trim() || 'N/A'
        const customerEmail = (receipt.customerEmail || '').trim() || 'N/A'
        const customerAddress = (receipt.customerAddress || '').trim() || 'Not provided'
        const customerType = receipt.customerType || 'Customer'

        receiptWindow.document.write(`<!DOCTYPE html>
            <html>
                <head>
                    <title>Ngala Farms Receipt</title>
                    <style>
                        body { font-family: Arial, sans-serif; background: #f7f7f7; color: #111827; margin: 0; padding: 18px; }
                        .receipt { max-width: 760px; margin: 0 auto; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 8px 20px rgba(0,0,0,0.06); }
                        .header { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 22px 24px 14px; border-bottom: 1px solid #e5e7eb; }
                        .logo { width: 72px; height: 72px; object-fit: contain; border-radius: 10px; }
                        .company h1 { margin: 0; font-size: 26px; color: #14532d; }
                        .company p { margin: 4px 0 0; color: #4b5563; }
                        .section { padding: 16px 24px; border-bottom: 1px solid #e5e7eb; }
                        .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #1f2937; letter-spacing: 0.08em; margin-bottom: 10px; }
                        .meta-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 16px; }
                        .label { display: block; font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: #6b7280; margin-bottom: 4px; }
                        .value { font-size: 14px; font-weight: 600; color: #111827; line-height: 1.4; }
                        .customer-info { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 16px; }
                        .info-block { }
                        .info-label { display: block; font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: #6b7280; margin-bottom: 4px; font-weight: 600; }
                        .info-value { font-size: 13px; color: #374151; line-height: 1.5; }
                        .address-block { grid-column: 1 / -1; }
                        .items { padding: 16px 24px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
                        th, td { padding: 9px 8px; border-bottom: 1px solid #e5e7eb; text-align: left; }
                        th { color: #374151; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; }
                        td { font-size: 13px; color: #374151; }
                        .totals { padding: 16px 24px; background: #f9fafb; border-top: 2px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; }
                        .totals-row { display: flex; justify-content: space-between; font-size: 16px; font-weight: 700; color: #111827; padding: 8px 0; }
                        .totals-row.highlight { font-size: 18px; color: #059669; padding: 12px 0; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; margin: 4px 0; }
                        .notes { padding: 16px 24px; border-bottom: 1px solid #e5e7eb; }
                        .notes h3 { margin: 0 0 10px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #374151; font-weight: 600; }
                        .notes p { margin: 0; color: #374151; font-size: 12px; white-space: pre-line; line-height: 1.5; }
                        .signatures { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; padding: 18px 24px 12px; }
                        .signature-box { border-top: 2px solid #111827; padding-top: 8px; font-size: 11px; color: #374151; }
                        .signature-box strong { display: block; margin-bottom: 2px; color: #111827; }
                        .footer { padding: 14px 24px 20px; font-size: 11px; color: #6b7280; text-align: center; }
                        .footer p { margin: 4px 0; }
                        @media print { body { background: #fff; padding: 0; } .receipt { box-shadow: none; border: none; margin: 0; } }
                    </style>
                </head>
                <body>
                    <div class="receipt">
                        <div class="header">
                            <div class="company">
                                <h1>Ngala Farms</h1>
                                <p>Fresh Palm Oil & Livestock Sales</p>
                            </div>
                            <img class="logo" src="${logoUrl}" alt="Ngala Farms Logo" />
                        </div>

                        <div class="section">
                            <div class="section-title">Transaction Information</div>
                            <div class="meta-grid">
                                <div>
                                    <span class="label">Receipt No.</span>
                                    <div class="value">${receipt.invoiceId || 'N/A'}</div>
                                </div>
                                <div>
                                    <span class="label">Date</span>
                                    <div class="value">${saleDate}</div>
                                </div>
                                <div>
                                    <span class="label">Payment Status</span>
                                    <div class="value">${receipt.paymentStatus || 'Paid'}</div>
                                </div>
                                <div>
                                    <span class="label">Payment Method</span>
                                    <div class="value">${receipt.paymentMethod || 'Cash'}</div>
                                </div>
                            </div>
                        </div>

                        <div class="section">
                            <div class="section-title">Customer Information</div>
                            <div class="customer-info">
                                <div class="info-block">
                                    <span class="info-label">Customer Name</span>
                                    <div class="info-value">${receipt.customerName || 'Walk-in Customer'}</div>
                                </div>
                                <div class="info-block">
                                    <span class="info-label">Customer Type</span>
                                    <div class="info-value">${customerType}</div>
                                </div>
                                <div class="info-block">
                                    <span class="info-label">Customer Number</span>
                                    <div class="info-value">${customerPhone}</div>
                                </div>
                                <div class="info-block">
                                    <span class="info-label">Email</span>
                                    <div class="info-value">${customerEmail}</div>
                                </div>
                                <div class="address-block">
                                    <span class="info-label">Address</span>
                                    <div class="info-value">${customerAddress}</div>
                                </div>
                            </div>
                        </div>

                        <div class="section">
                            <div class="section-title">Seller Information</div>
                            <div class="meta-grid">
                                <div>
                                    <span class="label">Seller Name</span>
                                    <div class="value">${sellerName}</div>
                                </div>
                            </div>
                        </div>

                        <div class="items">
                            <div class="section-title">Sale Details</div>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th>Quantity</th>
                                        <th>Unit Price</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>${receipt.product || 'Palm Oil'}</td>
                                        <td>${Number(receipt.quantityLitres ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L</td>
                                        <td>${Number(receipt.unitPrice ?? 0).toLocaleString('en-US')} XAF</td>
                                        <td>${Number(totalAmount).toLocaleString('en-US')} XAF</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="totals">
                            <div class="totals-row highlight">
                                <span>Total Amount</span>
                                <span>${Number(totalAmount).toLocaleString('en-US')} XAF</span>
                            </div>
                        </div>

                        <div class="notes">
                            <h3>Acknowledgement</h3>
                            <p>${saleNotes}</p>
                        </div>

                        <div class="signatures">
                            <div class="signature-box">
                                <strong>Manager Signature</strong>
                                ____________________________
                            </div>
                            <div class="signature-box">
                                <strong>Customer Signature</strong>
                                ____________________________
                            </div>
                        </div>

                        <div class="footer">
                            <p><strong>Ngala Farms Management System</strong></p>
                            <p>Fresh Palm Oil & Livestock Sales</p>
                            <p style="margin-top: 12px; font-size: 10px;">Thank you for your business!</p>
                        </div>
                    </div>
                </body>
            </html>
        `)

        receiptWindow.document.close()
        receiptWindow.focus()
        receiptWindow.print()
    }

    const handleCustomerSelection = (customerId) =>
    {
        const selectedCustomer = customers.find(c => String(c.id) === String(customerId))

        if (selectedCustomer)
        {
            setValue('customerName', selectedCustomer.name || '')
            setValue('customerPhone', selectedCustomer.phone || '')
            setValue('customerEmail', selectedCustomer.email || '')
            setValue('customerAddress', selectedCustomer.address || '')
            setValue('customerType', selectedCustomer.customerType || 'Customer')
        }
        else
        {
            setValue('customerName', '')
            setValue('customerPhone', '')
            setValue('customerEmail', '')
            setValue('customerAddress', '')
            setValue('customerType', 'Customer')
        }
    }

    const onSubmit = async (data) =>
    {
        let selectedCustomer = customers.find(c => String(c.id) === String(data.customerId))
        const customerNameInput = (data.customerName || '').trim()

        if (customerNameInput)
        {
            const existingCustomerMatch = customers.find(c => (c.name || '').trim().toLowerCase() === customerNameInput.toLowerCase())
            if (existingCustomerMatch)
            {
                selectedCustomer = existingCustomerMatch
            }
            else
            {
                try
                {
                    const response = await apiClient.post('/customers', {
                        name: customerNameInput,
                        phone: data.customerPhone || null,
                        email: data.customerEmail || null,
                        address: data.customerAddress || null,
                        customerType: 'Customer',
                        notes: data.notes || DEFAULT_ACKNOWLEDGEMENT
                    })
                    selectedCustomer = response.data
                }
                catch (error)
                {
                    showToast(error.response?.data?.message || 'Failed to save customer details. Please try again.', 'error')
                    return
                }
            }
        }

        const payload = {
            customerId: selectedCustomer ? selectedCustomer.id : null,
            customerName: selectedCustomer ? selectedCustomer.name : (customerNameInput || 'Walk-in Customer'),
            customerPhone: selectedCustomer ? selectedCustomer.phone : (data.customerPhone || ''),
            customerEmail: selectedCustomer ? selectedCustomer.email : (data.customerEmail || ''),
            customerAddress: selectedCustomer ? selectedCustomer.address : (data.customerAddress || ''),
            customerType: selectedCustomer ? selectedCustomer.customerType : 'Customer',
            sellerName: data.sellerName || 'Unknown Seller',
            product: data.product,
            quantityLitres: Number(data.quantityLitres),
            unitPrice: Number(data.unitPrice),
            paymentMethod: data.paymentMethod,
            paymentStatus: data.paymentStatus,
            saleDate: data.saleDate,
            notes: data.notes || DEFAULT_ACKNOWLEDGEMENT
        }

        saveMutation.mutate(payload)
    }

    const handleEdit = (sale) =>
    {
        setEditingId(sale.id)
        setSelectedSale(sale)
        setValue('customerId', sale.customerId ? String(sale.customerId) : '')
        setValue('customerName', sale.customerName || '')
        setValue('customerPhone', sale.customerPhone || '')
        setValue('customerEmail', sale.customerEmail || '')
        setValue('customerAddress', sale.customerAddress || '')
        setValue('sellerName', sale.sellerName || '')
        setValue('saleDate', sale.saleDate ? sale.saleDate.split('T')[0] : new Date().toISOString().split('T')[0])
        setValue('product', sale.product || 'Palm Oil')
        setValue('quantityLitres', sale.quantityLitres ?? '')
        setValue('unitPrice', sale.unitPrice ?? '')
        setValue('paymentMethod', sale.paymentMethod || 'Cash')
        setValue('paymentStatus', sale.paymentStatus || 'Paid')
        setValue('notes', sale.notes || DEFAULT_ACKNOWLEDGEMENT)
        setShowModal(true)
    }

    const handleCloseModal = () =>
    {
        resetForm()
    }

    const formatDate = (date) => new Date(date).toLocaleDateString()
    const formatCurrency = (amount) => `${(Math.abs(amount || 0)).toLocaleString('en-US')} XAF`

    const filteredSales = sales.filter(s =>
        (s.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.product || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.invoiceId || '').toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Sales Records</h1>
                <button onClick={() => { setEditingId(null); setSelectedSale(null); setShowModal(true); reset({ customerId: '', customerName: '', customerPhone: '', customerEmail: '', customerAddress: '', saleDate: new Date().toISOString().split('T')[0], product: 'Palm Oil', quantityLitres: '', unitPrice: '', paymentMethod: 'Cash', paymentStatus: 'Paid', notes: DEFAULT_ACKNOWLEDGEMENT }) }} className="btn-primary flex items-center gap-2">
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
                <div className="card">
                    <div className="overflow-x-auto overflow-y-auto max-h-[70vh]">
                        <table className="w-full text-sm min-w-[900px]">
                            <thead className="border-b border-gray-200 sticky top-0 bg-white z-10">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                            <input type="text" {...register('customerName')} className="input-field" placeholder="Enter customer full name" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Number</label>
                            <input type="tel" {...register('customerPhone')} className="input-field" placeholder="Enter customer phone number" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input type="email" {...register('customerEmail')} className="input-field" placeholder="customer@email.com" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Seller Name</label>
                            <input type="text" {...register('sellerName')} className="input-field" placeholder="Name of the person who completed the sale" />
                            {errors.sellerName && <p className="text-red-600 text-xs mt-1">{errors.sellerName.message}</p>}
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

                        <div>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <textarea {...register('customerAddress')} className="input-field" rows="2" placeholder="Customer physical address" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Acknowledgement</label>
                        <textarea {...register('notes')} className="input-field" rows="5" defaultValue={DEFAULT_ACKNOWLEDGEMENT} />
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <button type="button" onClick={() => printReceipt(selectedSale)} className="btn-primary flex-1">
                                Print Receipt
                            </button>
                            <button type="button" onClick={() => { setShowDetails(false); handleEdit(selectedSale) }} className="btn-secondary flex-1">
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
