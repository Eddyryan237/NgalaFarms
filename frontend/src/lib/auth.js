import Cookies from 'js-cookie'

export const getAuth = () =>
{
    const token = Cookies.get('accessToken')
    const user = localStorage.getItem('user')
    return {
        isAuthenticated: !!token,
        token,
        user: user ? JSON.parse(user) : null
    }
}

export const setAuth = (accessToken, refreshToken, user) =>
{
    Cookies.set('accessToken', accessToken, { expires: 1 })
    Cookies.set('refreshToken', refreshToken, { expires: 7 })
    localStorage.setItem('user', JSON.stringify(user))
    window.dispatchEvent(new Event('auth-change'))
}

export const clearAuth = () =>
{
    Cookies.remove('accessToken')
    Cookies.remove('refreshToken')
    localStorage.removeItem('user')
    window.dispatchEvent(new Event('auth-change'))
}

export const isFounder = () =>
{
    const auth = getAuth()
    return auth.user?.role === 'Founder'
}

export const isManager = () =>
{
    const auth = getAuth()
    return auth.user?.role === 'Manager' || auth.user?.role === 'Founder'
}
