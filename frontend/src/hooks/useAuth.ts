import { useState, useCallback, useEffect } from 'react'
import { authAPI } from '../services/api'
import type { UserInfo } from '../types'

export function useAuth() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('token')

  const fetchUser = useCallback(async () => {
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const res = await authAPI.getMe()
      setUser(res.data)
    } catch {
      localStorage.removeItem('token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const login = async (username: string, password: string) => {
    const res = await authAPI.login(username, password)
    localStorage.setItem('token', res.data.access_token)
    await fetchUser()
    return res.data
  }

  const register = async (username: string, password: string, email?: string) => {
    const res = await authAPI.register(username, password, email)
    localStorage.setItem('token', res.data.access_token)
    await fetchUser()
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    window.location.href = '/'
  }

  return { user, loading, login, register, logout, isLoggedIn: !!token && !!user }
}
