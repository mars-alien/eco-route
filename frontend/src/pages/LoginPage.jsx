import { useForm } from 'react-hook-form'
import { useLogin } from '../hooks/useAuth'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const login = useLogin()

  return (
    <div style={{
      minHeight: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
    }}>
      <div style={{ width: '360px' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--s8)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 'var(--s3)' }}>🌿</div>
          <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, marginBottom: 'var(--s2)' }}>EcoRoute</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            Intelligent Delivery Optimizer
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit((d) => login.mutate(d))} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
            <Input
              label="Email"
              type="email"
              placeholder="admin@ecoroute.com"
              error={errors.email?.message}
              {...register('email', { required: 'Email is required' })}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password', { required: 'Password is required' })}
            />

            {login.isError && (
              <p style={{ color: '#e06060', fontSize: 'var(--text-sm)' }}>
                {login.error?.response?.data?.detail || 'Login failed'}
              </p>
            )}

            <Button type="submit" variant="primary" disabled={login.isPending} style={{ marginTop: 'var(--s2)', justifyContent: 'center' }}>
              {login.isPending ? <Spinner size={16} /> : 'Sign in'}
            </Button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 'var(--s6)', color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
          admin@ecoroute.com / admin123 &nbsp;·&nbsp; driver1@ecoroute.com / driver123
        </p>
      </div>
    </div>
  )
}
