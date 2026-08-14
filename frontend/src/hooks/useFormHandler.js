import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import apiClient from '../lib/api'

export function useFormHandler(queryKey)
{
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const queryClient = useQueryClient()

    const submit = async (endpoint, data, method = 'POST') =>
    {
        setLoading(true)
        setError(null)
        try
        {
            if (method === 'POST')
            {
                await apiClient.post(endpoint, data)
            } else if (method === 'PUT')
            {
                await apiClient.put(endpoint, data)
            }
            queryClient.invalidateQueries({ queryKey })
            return true
        } catch (err)
        {
            setError(err.response?.data?.message || err.message)
            return false
        } finally
        {
            setLoading(false)
        }
    }

    return { submit, loading, error }
}
