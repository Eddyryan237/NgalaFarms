import { Bell, User, Menu } from 'lucide-react'
import { getAuth } from '../lib/auth'

export default function Header({ onMenuClick })
{
    const auth = getAuth()

    return (
        <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-3 md:py-4 flex justify-between items-center sticky top-0 z-40">
            <div className="flex items-center gap-2 md:gap-3">
                <button onClick={onMenuClick} className="md:hidden text-gray-600 hover:text-gray-900 p-1">
                    <Menu size={24} />
                </button>
                <img
                    src="/images/ngalafarmslogo.png"
                    alt="Ngala Farms Logo"
                    className="h-8 md:h-10 w-8 md:w-10 object-contain"
                />
                <h2 className="text-lg md:text-2xl font-bold text-gray-900">Ngala Farms</h2>
            </div>

            <div className="flex items-center gap-3 md:gap-6">
                <button className="relative text-gray-600 hover:text-gray-900">
                    <Bell size={20} md:size={24} />
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 md:w-5 h-4 md:h-5 flex items-center justify-center text-xs">3</span>
                </button>

                <div className="hidden sm:flex items-center gap-2 md:gap-3 border-l border-gray-200 pl-3 md:pl-6">
                    <div className="bg-green-100 p-1 md:p-2 rounded-full">
                        <User size={16} md:size={20} className="text-green-600" />
                    </div>
                    <div className="hidden md:block">
                        <p className="font-medium text-gray-900 text-sm">{auth.user?.fullName}</p>
                        <p className="text-xs text-gray-500">{auth.user?.role}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
