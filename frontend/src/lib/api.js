import axios from 'axios'
import Cookies from 'js-cookie'

// Use relative path so Vite proxy works in dev
const API_BASE = '/api'

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
})

apiClient.interceptors.request.use((config) =>
{
  const token = Cookies.get('accessToken')
  if (token)
  {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (res) => res,
  async (err) =>
  {
    if (err.response?.status === 401)
    {
      const refreshToken = Cookies.get('refreshToken')
      if (refreshToken)
      {
        try
        {
          const res = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken })
          Cookies.set('accessToken', res.data.accessToken)
          Cookies.set('refreshToken', res.data.refreshToken)
          return apiClient(err.config)
        } catch
        {
          Cookies.remove('accessToken')
          Cookies.remove('refreshToken')
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(err)
  }
)

export default apiClient
