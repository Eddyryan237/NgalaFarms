import { Link, useLocation } from 'react-router-dom'
import { Leaf, Home, TrendingUp, FileText, BarChart3, Zap, LogOut } from 'lucide-react'
import { clearAuth } from '../lib/auth'

export default function Sidebar({ isFounder })
{
    const location = useLocation()
    const isActive = (path) => location.pathname === path

    const navLink = (to, label, icon) => (
        <Link
            to={to}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive(to) ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
        >
            {icon}
            <span>{label}</span>
        </Link>
    )

    const handleLogout = () =>
    {
        clearAuth()
        window.location.href = '/login'
    }

    return (
        <div className="w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto sticky top-0">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                    <img
                        src="/images/ngalafarmslogo.png"
                        alt="Ngala Farms Logo"
                        className="w-12 h-12 object-contain"
                    />
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Ngala Farms</h1>
                        <p className="text-xs text-gray-500">Management System</p>
                    </div>
                </div>
            </div>

            <nav className="p-4 space-y-2">
                {isFounder ? (
                    <>
                        <div className="text-xs font-semibold text-gray-500 px-4 py-2 uppercase">Founder</div>
                        {navLink('/founder/dashboard', 'Dashboard', <Home size={18} />)}
                        {navLink('/founder/analytics', 'Analytics', <BarChart3 size={18} />)}
                        {navLink('/founder/reports', 'Weekly Reports', <FileText size={18} />)}
                        {navLink('/founder/audit-logs', 'Audit Logs', <TrendingUp size={18} />)}
                    </>
                ) : (
                    <>
                        <div className="text-xs font-semibold text-gray-500 px-4 py-2 uppercase">Operations</div>
                        {navLink('/manager/dashboard', 'Dashboard', <Home size={18} />)}
                        {navLink('/manager/palm-harvest', 'Palm Harvest', <Zap size={18} />)}
                        {navLink('/manager/cattle', 'Cattle', <TrendingUp size={18} />)}
                        {navLink('/manager/sales', 'Sales', <FileText size={18} />)}
                        {navLink('/manager/expenses', 'Expenses', <BarChart3 size={18} />)}
                    </>
                )}
            </nav>

            <div className="border-t border-gray-200 p-4 mt-auto fixed bottom-0 w-64">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    )
}
