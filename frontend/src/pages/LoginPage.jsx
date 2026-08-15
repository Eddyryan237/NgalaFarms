import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Loader } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Cookies from 'js-cookie'
import apiClient from '../lib/api'
import { setAuth } from '../lib/auth'

const loginSchema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters')
})

export default function LoginPage()
{
    const navigate = useNavigate()
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(loginSchema)
    })

    const onSubmit = async (data) =>
    {
        setLoading(true)
        setError(null)
        try
        {
            const res = await apiClient.post('/auth/login', data)
            const { accessToken, refreshToken, fullName, role, userId } = res.data

            Cookies.set('accessToken', accessToken)
            Cookies.set('refreshToken', refreshToken)

            const user = { fullName, role, userId }
            setAuth(accessToken, refreshToken, user)
            localStorage.setItem('user', JSON.stringify(user))

            const redirectPath = role === 'Founder' ? '/founder/dashboard' : '/manager/dashboard'
            navigate(redirectPath)
        } catch (err)
        {
            console.error('Login error:', err)
            setError(err.response?.data?.message || 'Login failed')
        } finally
        {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <img
                        src="/images/ngalafarmslogo.png"
                        alt="Ngala Farms Logo"
                        className="h-20 w-20 mx-auto mb-4 object-contain"
                    />
                    <h1 className="text-3xl font-bold text-gray-900">Ngala Farms</h1>
                    <p className="text-gray-600 mt-2">Agricultural Management System</p>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded mb-6 flex gap-2 text-red-700 text-sm">
                        <AlertCircle size={18} className="flex-shrink-0" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            {...register('email')}
                            className="input-field"
                            placeholder="your@email.com"
                            autoComplete="email"
                        />
                        {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            {...register('password')}
                            className="input-field"
                            placeholder="••••••••"
                            autoComplete="current-password"
                        />
                        {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary flex items-center justify-center gap-2 mt-6"
                    >
                        {loading && <Loader size={18} className="animate-spin" />}
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    )
}
