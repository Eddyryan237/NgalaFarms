import { X, Check, AlertCircle, Info } from 'lucide-react'

export default function Toast({ message, type = 'success', onClose })
{
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    }

    const icons = {
        success: <Check size={20} />,
        error: <AlertCircle size={20} />,
        warning: <AlertCircle size={20} />,
        info: <Info size={20} />
    }

    return (
        <div className={`${colors[type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in`}>
            {icons[type]}
            <span className="flex-1">{message}</span>
            <button
                onClick={onClose}
                className="hover:opacity-80 transition"
            >
                <X size={18} />
            </button>
        </div>
    )
}
