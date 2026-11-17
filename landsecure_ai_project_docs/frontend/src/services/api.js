import axios from 'axios'

const API = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

const http = axios.create({
  baseURL: API,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to attach JWT token to every request
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers = config.headers || {}
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor to handle 401 session expirations gracefully
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || ''
      if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        delete http.defaults.headers.common['Authorization']
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export const setToken = (tok) => {
  if (tok) {
    localStorage.setItem('token', tok)
    http.defaults.headers.common['Authorization'] = `Bearer ${tok}`
  } else {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete http.defaults.headers.common['Authorization']
  }
}

export default http
export { API }
