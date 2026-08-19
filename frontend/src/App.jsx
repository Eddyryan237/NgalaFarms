import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getAuth } from './lib/auth'
import { ToastProvider } from './contexts/ToastContext'

import LoginPage from './pages/LoginPage'
import FounderLayout from './layouts/FounderLayout'
import ManagerLayout from './layouts/ManagerLayout'
import FounderDashboard from './pages/founder/FounderDashboard'
import AnalyticsPage from './pages/founder/AnalyticsPage'
import WeeklyReportsPage from './pages/founder/WeeklyReportsPage'
import WeeklyReportDetail from './pages/founder/WeeklyReportDetail'
import DailyReportPage from './pages/founder/DailyReportPage'
import MonthlyReportPage from './pages/founder/MonthlyReportPage'
import YearlyReportPage from './pages/founder/YearlyReportPage'
import AuditLogsPage from './pages/founder/AuditLogsPage'
import DetailView from './pages/founder/DetailView'
import ManagerDashboard from './pages/manager/ManagerDashboard'
import DailyOperationsPage from './pages/manager/DailyOperationsPage'
import CattleListPage from './pages/manager/CattleListPage'
import PalmHarvestPage from './pages/manager/PalmHarvestPage'
import SalesPage from './pages/manager/SalesPage'
import ExpensesPage from './pages/manager/ExpensesPage'
import ProductionPage from './pages/manager/ProductionPage'

const queryClient = new QueryClient()

function ProtectedRoute({ children, requiredRole })
{
    const auth = getAuth()

    if (!auth.isAuthenticated) return <Navigate to="/login" replace />

    if (requiredRole === 'Founder' && auth.user?.role !== 'Founder')
    {
        return <Navigate to="/manager/dashboard" replace />
    }

    return children
}

function AppContent()
{
    const [auth, setAuth] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() =>
    {
        try
        {
            const authData = getAuth()
            setAuth(authData)
        } catch (err)
        {
            console.error('Auth error:', err)
            setAuth({ isAuthenticated: false, token: null, user: null })
        } finally
        {
            setLoading(false)
        }
    }, [])

    if (loading)
    {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    if (!auth)
    {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-4">
                    <h1 className="text-2xl font-bold text-red-600">Error</h1>
                    <p className="text-gray-600 mt-2">Failed to initialize application</p>
                </div>
            </div>
        )
    }

    const isFounder = auth.isAuthenticated && auth.user?.role === 'Founder'
    const isManager = auth.isAuthenticated && (auth.user?.role === 'Manager' || auth.user?.role === 'Founder')

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />

                {isFounder && (
                    <Route element={<FounderLayout />}>
                        <Route path="/founder/dashboard" element={<FounderDashboard />} />
                        <Route path="/founder/analytics" element={<AnalyticsPage />} />
                        <Route path="/founder/reports" element={<WeeklyReportsPage />} />
                        <Route path="/founder/reports/daily" element={<DailyReportPage />} />
                        <Route path="/founder/reports/monthly" element={<MonthlyReportPage />} />
                        <Route path="/founder/reports/yearly" element={<YearlyReportPage />} />
                        <Route path="/founder/reports/:id" element={<WeeklyReportDetail />} />
                        <Route path="/founder/details/:type/:id" element={<DetailView />} />
                        <Route path="/founder/audit-logs" element={<AuditLogsPage />} />
                    </Route>
                )}

                {isManager && (
                    <Route element={<ManagerLayout />}>
                        <Route path="/manager/dashboard" element={<ManagerDashboard />} />
                        <Route path="/manager/daily-operations" element={<DailyOperationsPage />} />
                        <Route path="/manager/cattle" element={<CattleListPage />} />
                        <Route path="/manager/palm-harvest" element={<PalmHarvestPage />} />
                        <Route path="/manager/production" element={<ProductionPage />} />
                        <Route path="/manager/sales" element={<SalesPage />} />
                        <Route path="/manager/expenses" element={<ExpensesPage />} />
                    </Route>
                )}

                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    )
}

export default function App()
{
    return (
        <QueryClientProvider client={queryClient}>
            <ToastProvider>
                <AppContent />
            </ToastProvider>
        </QueryClientProvider>
    )
}
