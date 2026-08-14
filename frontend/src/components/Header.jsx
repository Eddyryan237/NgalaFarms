import { Bell, User } from 'lucide-react'
import { getAuth } from '../lib/auth'

export default function Header()
{
    const auth = getAuth()

    return (
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-40">
            <div className="flex items-center gap-3">
                <img
                    src="/images/ngalafarmslogo.png"
                    alt="Ngala Farms Logo"
                    className="h-10 w-10 object-contain"
                />
                <h2 className="text-2xl font-bold text-gray-900">Ngala Farms</h2>
            </div>

            <div className="flex items-center gap-6">
                <button className="relative text-gray-600 hover:text-gray-900">
                    <Bell size={24} />
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
                </button>

                <div className="flex items-center gap-3 border-l border-gray-200 pl-6">
                    <div className="bg-green-100 p-2 rounded-full">
                        <User size={20} className="text-green-600" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">{auth.user?.fullName}</p>
                        <p className="text-xs text-gray-500">{auth.user?.role}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
