import { z } from 'zod'

export const cattleSchema = z.object({
    tagNumber: z.string().min(1, 'Tag number is required'),
    breed: z.string().min(1, 'Breed is required'),
    sex: z.enum(['Male', 'Female'], 'Sex is required'),
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    currentWeightKg: z.number().min(1, 'Weight must be greater than 0'),
    description: z.string().optional()
})

export const palmHarvestSchema = z.object({
    plantationId: z.string().min(1, 'Plantation is required'),
    palmBlockId: z.string().optional(),
    harvestDate: z.string().min(1, 'Harvest date is required'),
    numberOfBunches: z.coerce.number().min(1, 'Fruit bunches must be at least 1'),
    totalWeightKg: z.coerce.number().min(0.1, 'Estimated yield must be greater than 0'),
    harvestTeam: z.string().min(1, 'Harvest team is required'),
    laborCost: z.coerce.number().min(0, 'Labor cost is required'),
    notes: z.string().optional()
})

export const salesSchema = z.object({
    customerId: z.string().optional().or(z.literal('')),
    customerName: z.string().optional(),
    customerPhone: z.string().optional(),
    customerEmail: z.string().optional(),
    customerAddress: z.string().optional(),
    sellerName: z.string().min(1, 'Seller name is required'),
    saleDate: z.string().min(1, 'Sale date is required'),
    product: z.enum(['Palm Oil', 'Palm Kernel Oil', 'Fresh Fruit Bunch'], 'Product is required'),
    quantityLitres: z.coerce.number().min(0.1, 'Quantity must be greater than 0'),
    unitPrice: z.coerce.number().min(0, 'Price must be at least 0'),
    paymentMethod: z.enum(['Cash', 'BankTransfer', 'MobileMoney'], 'Payment method is required'),
    paymentStatus: z.enum(['Paid', 'Pending', 'PartiallyPaid', 'Overdue'], 'Payment status is required'),
    notes: z.string().optional().default('I hereby confirm that I have inspected and tasted the palm oil prior to purchase. I have verified the color, texture and taste of the product and found it satisfactory. I accept the product in its present condition and acknowledge that the sale was completed after my verification and approval')
})

export const expenseSchema = z.object({
    division: z.number().min(0, 'Division is required'),
    category: z.string().min(1, 'Category is required'),
    amount: z.number().min(0.01, 'Amount must be greater than 0'),
    date: z.string().min(1, 'Expense date is required'),
    description: z.string().min(1, 'Description is required'),
    paymentMethod: z.number().min(0, 'Payment method is required')
})

export const processingSchema = z.object({
    harvestId: z.string().min(1, 'Harvest is required'),
    processingDate: z.string().min(1, 'Processing date is required'),
    freshFruitBunchKg: z.number().min(0.1, 'Fresh fruit bunch weight must be greater than 0'),
    processedOilKg: z.number().min(0.1, 'Processed oil weight must be greater than 0'),
    notes: z.string().optional()
})

export const employeeSchema = z.object({
    fullName: z.string().min(1, 'Full name is required'),
    phone: z.string().optional(),
    email: z.string().email('Enter a valid email').optional().or(z.literal('')),
    address: z.string().optional(),
    position: z.string().min(1, 'Position is required'),
    department: z.string().min(1, 'Department is required'),
    monthlySalary: z.coerce.number().min(0, 'Salary cannot be negative'),
    employmentDate: z.string().min(1, 'Employment date is required'),
    emergencyContact: z.string().optional(),
    emergencyPhone: z.string().optional(),
    notes: z.string().optional()
})

export const payrollSchema = z.object({
    employeeId: z.coerce.number().min(1, 'Employee is required'),
    amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
    period: z.string().min(1, 'Payroll month is required'),
    paymentDate: z.string().min(1, 'Payment date is required'),
    paymentMethod: z.enum(['Cash', 'BankTransfer', 'MobileMoney', 'Cheque', 'Other'], 'Payment method is required'),
    notes: z.string().optional()
})
