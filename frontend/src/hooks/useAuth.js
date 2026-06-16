import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/auth'
import { useAuthStore } from '../store/authStore'

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: ({ email, password }) => login(email, password),
    onSuccess: (data) => {
      setAuth(data.token, { name: data.name, id: data.user_id }, data.role)
      if (data.role === 'admin') navigate('/admin/dashboard')
      else navigate('/driver/dashboard')
    },
  })
}
