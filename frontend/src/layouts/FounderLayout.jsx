import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

export default function FounderLayout()
{
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar isFounder={true} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-40" onClick={() => setSidebarOpen(false)} />}
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
                <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
