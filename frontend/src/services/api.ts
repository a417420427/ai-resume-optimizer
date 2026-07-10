import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 60000, // 60s for AI processing
})

// Attach token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 - redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// --- Auth ---
export const authAPI = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),

  register: (username: string, password: string, email?: string) =>
    api.post('/auth/register', { username, password, email }),

  getMe: () => api.get('/user/me'),
}

// --- Resume ---
export const resumeAPI = {
  upload: (formData: FormData) =>
    api.post('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getHistory: () => api.get('/resume/history'),

  getResult: (id: number) => api.get(`/resume/result/${id}`),

  chat: (optimizationId: number, question: string) => {
    const formData = new FormData()
    formData.append('question', question)
    return api.post(`/resume/chat/${optimizationId}`, formData)
  },
}

export default api
