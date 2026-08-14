import React from 'react'
import { AlertCircle } from 'lucide-react'

export class ErrorBoundary extends React.Component
{
    constructor(props)
    {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error)
    {
        return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo)
    {
        console.error('Error caught by boundary:', error, errorInfo)
    }

    render()
    {
        if (this.state.hasError)
        {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertCircle size={32} className="text-red-600" />
                            <h1 className="text-2xl font-bold text-red-600">Error</h1>
                        </div>
                        <p className="text-gray-700 mb-4">
                            Something went wrong loading the application.
                        </p>
                        <details className="bg-gray-100 p-3 rounded mb-4 text-sm text-gray-600">
                            <summary className="cursor-pointer font-medium">Details</summary>
                            <pre className="mt-2 overflow-auto">{this.state.error?.toString()}</pre>
                        </details>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
