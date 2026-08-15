import { createContext, useState, useCallback } from 'react'
import Toast from '../components/Toast'

export const ToastContext = createContext()

export function ToastProvider({ children })
{
    const [toasts, setToasts] = useState([])

    const addToast = useCallback((message, type = 'success', duration = 3000) =>
    {
        const id = Date.now()
        const toast = { id, message, type }
        setToasts(prev => [...prev, toast])

        if (duration > 0)
        {
            setTimeout(() =>
            {
                removeToast(id)
            }, duration)
        }

        return id
    }, [])

    const removeToast = useCallback((id) =>
    {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <div className="fixed bottom-4 right-4 space-y-2 z-50">
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    )
}
