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
    harvestDate: z.string().min(1, 'Harvest date is required'),
    fruitBunchesCollected: z.number().min(1, 'Fruit bunches must be at least 1'),
    estimatedYieldKg: z.number().min(0.1, 'Estimated yield must be greater than 0'),
    notes: z.string().optional()
})

export const salesSchema = z.object({
    customerId: z.string().min(1, 'Customer is required'),
    saleDate: z.string().min(1, 'Sale date is required'),
    productType: z.enum(['Crude Palm Oil', 'Palm Kernel Oil', 'Fresh Fruit Bunch'], 'Product type is required'),
    quantityKg: z.number().min(0.1, 'Quantity must be greater than 0'),
    pricePerKg: z.number().min(0, 'Price must be at least 0'),
    notes: z.string().optional()
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
