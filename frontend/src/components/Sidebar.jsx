import { Link, useLocation } from 'react-router-dom'
import { Leaf, Home, TrendingUp, FileText, BarChart3, Zap, Users, Wallet, LogOut, X } from 'lucide-react'
import { clearAuth } from '../lib/auth'

export default function Sidebar({ isFounder, isOpen = true, onClose })
{
    const location = useLocation()
    const isActive = (path) => location.pathname === path

    const navLink = (to, label, icon) => (
        <Link
            to={to}
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive(to) ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
        >
            {icon}
            <span className="text-sm md:text-base">{label}</span>
        </Link>
    )

    const handleLogout = () =>
    {
        clearAuth()
        window.location.hash = '#/login'
    }

    return (
        <div className={`fixed md:relative w-64 bg-white border-r border-gray-200 h-screen flex flex-col overflow-hidden z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
            <div className="p-4 md:p-6 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                    <img
                        src="/images/ngalafarmslogo.png"
                        alt="Ngala Farms Logo"
                        className="w-10 md:w-12 h-10 md:h-12 object-contain"
                    />
                    <div>
                        <h1 className="text-base md:text-xl font-bold text-gray-900">Ngala Farms</h1>
                        <p className="text-xs text-gray-500">Mgmt System</p>
                    </div>
                </div>
                <button onClick={onClose} className="md:hidden text-gray-600 hover:text-gray-900">
                    <X size={20} />
                </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-3 md:p-4 space-y-1 md:space-y-2">
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
                        <div className="text-xs font-semibold text-gray-500 px-4 py-2 uppercase">Farm Manager</div>
                        {navLink('/manager/dashboard', 'Dashboard', <Home size={18} />)}
                        {navLink('/manager/daily-operations', 'Daily Ops', <TrendingUp size={18} />)}
                        {navLink('/manager/palm-harvest', 'Palm Harvest', <Zap size={18} />)}
                        {navLink('/manager/cattle', 'Cattle', <TrendingUp size={18} />)}
                        {navLink('/manager/production', 'Production', <Leaf size={18} />)}
                        {navLink('/manager/sales', 'Sales', <FileText size={18} />)}
                        {navLink('/manager/expenses', 'Expenses', <BarChart3 size={18} />)}
                        {navLink('/manager/employees', 'Employees', <Users size={18} />)}
                        {navLink('/manager/payroll', 'Payroll', <Wallet size={18} />)}
                    </>
                )}
            </nav>

            <div className="border-t border-gray-200 p-3 md:p-4 shrink-0 bg-white">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 md:py-3 text-red-600 hover:bg-red-50 rounded-lg transition text-sm md:text-base"
                >
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    )
}
