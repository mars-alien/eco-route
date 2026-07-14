import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { useLogin } from '../hooks/useAuth'
import { register as registerApi, login as loginApi } from '../api/auth'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'

/* ── Hero stats ─────────────────────────────────── */
const HERO_STATS = [
  { value: '1,240', label: 'Orders today' },
  { value: '38',    label: 'Drivers online' },
  { value: '31%',   label: 'Fewer km driven' },
]

function HeroPanel() {
  return (
    <div style={{
      flex: 1,
      background: 'linear-gradient(150deg,#FFD060 0%,#FF9F1C 60%,#F2790B 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '56px 52px',
      position: 'relative',
      overflow: 'hidden',
      minHeight: '100%',
    }}>
      {/* Decorative blobs */}
      <div style={{
        position: 'absolute', top: '-80px', right: '-60px',
        width: '320px', height: '320px', borderRadius: '50%',
        background: 'rgba(255,255,255,0.10)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-100px', left: '-40px',
        width: '260px', height: '260px', borderRadius: '50%',
        background: 'rgba(255,255,255,0.08)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '40%', left: '30%',
        width: '140px', height: '140px', borderRadius: '50%',
        background: 'rgba(255,255,255,0.06)',
        pointerEvents: 'none',
      }} />

      {/* Brand mark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', position: 'relative' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '14px',
          background: 'rgba(255,255,255,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '24px',
        }}>🌿</div>
        <span style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '26px', fontWeight: 700,
          color: '#fff', letterSpacing: '0.02em',
        }}>EcoRoute</span>
      </div>

      {/* Headline */}
      <h1 style={{
        fontFamily: 'var(--font-heading)',
        fontSize: '38px', fontWeight: 700,
        color: '#fff',
        lineHeight: 1.15,
        marginBottom: '20px',
        position: 'relative',
        maxWidth: '380px',
      }}>
        Smarter delivery routes,<br />lighter footprint.
      </h1>
      <p style={{
        color: 'rgba(255,255,255,0.80)',
        fontSize: '16px',
        lineHeight: 1.6,
        marginBottom: '44px',
        position: 'relative',
        maxWidth: '340px',
      }}>
        AI-powered clustering and route optimisation for sustainable last-mile logistics.
      </p>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '32px', position: 'relative' }}>
        {HERO_STATS.map((s) => (
          <div key={s.label}>
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '32px', fontWeight: 700,
              color: '#fff', lineHeight: 1,
              marginBottom: '4px',
            }}>{s.value}</div>
            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', fontWeight: 500, letterSpacing: '0.04em' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Tab pill ────────────────────────────────────── */
function TabPill({ tabs, active, onChange }) {
  return (
    <div style={{
      display: 'flex',
      background: '#FFF3D6',
      borderRadius: '50px',
      padding: '4px',
      marginBottom: '28px',
    }}>
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          style={{
            flex: 1,
            padding: '8px 0',
            border: 'none',
            borderRadius: '50px',
            background: active === t.id ? 'var(--grad-primary)' : 'transparent',
            color: active === t.id ? '#fff' : 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '14px',
            fontFamily: 'var(--font)',
            cursor: 'pointer',
            transition: 'all 200ms ease',
            boxShadow: active === t.id ? '0 4px 12px rgba(255,159,28,0.30)' : 'none',
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

/* ── Sign-in form ─────────────────────────────────── */
function LoginForm() {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm()
  const login = useLogin()

  const fillDemo = (type) => {
    if (type === 'admin') {
      setValue('email', 'admin@ecoroute.com')
      setValue('password', 'admin123')
    } else {
      setValue('email', 'driver1@ecoroute.com')
      setValue('password', 'driver123')
    }
  }

  return (
    <form onSubmit={handleSubmit((d) => login.mutate(d))} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <Input label="Email" type="email" placeholder="you@example.com"
        error={errors.email?.message}
        {...register('email', { required: 'Email is required' })}
      />
      <Input label="Password" type="password" placeholder="••••••••"
        error={errors.password?.message}
        {...register('password', { required: 'Password is required' })}
      />

      {login.isError && (
        <p style={{ color: 'var(--danger)', fontSize: '13px', margin: 0, padding: '8px 12px', background: 'rgba(196,69,59,0.07)', borderRadius: 'var(--r-sm)', borderLeft: '3px solid var(--danger)' }}>
          {login.error?.response?.data?.detail || 'Invalid email or password'}
        </p>
      )}

      <Button type="submit" variant="primary" disabled={login.isPending}
        style={{ justifyContent: 'center', padding: '12px', fontSize: '15px', marginTop: '4px' }}>
        {login.isPending ? <Spinner size={16} /> : 'Sign in'}
      </Button>

      {/* Quick-fill chips */}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        <button type="button" onClick={() => fillDemo('admin')} style={{
          background: 'var(--surface-raised)', border: '1.5px solid var(--border)',
          borderRadius: '50px', padding: '5px 14px', fontSize: '12px',
          color: 'var(--text-secondary)', fontFamily: 'var(--font)', cursor: 'pointer',
          fontWeight: 500, transition: 'all 150ms',
        }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
        >Try demo admin</button>
        <button type="button" onClick={() => fillDemo('driver')} style={{
          background: 'var(--surface-raised)', border: '1.5px solid var(--border)',
          borderRadius: '50px', padding: '5px 14px', fontSize: '12px',
          color: 'var(--text-secondary)', fontFamily: 'var(--font)', cursor: 'pointer',
          fontWeight: 500, transition: 'all 150ms',
        }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
        >Try demo driver</button>
      </div>
    </form>
  )
}

/* ── Sign-up form ─────────────────────────────────── */
function RegisterForm() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  const registerMutation = useMutation({
    mutationFn: (data) => registerApi({ ...data, role: 'driver' }),
    onSuccess: async (_, variables) => {
      const loginData = await loginApi(variables.email, variables.password)
      setAuth(loginData.token, { name: loginData.name, id: loginData.user_id }, loginData.role)
      navigate('/driver/dashboard')
    },
  })

  return (
    <form onSubmit={handleSubmit((d) => registerMutation.mutate(d))} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '10px 14px', borderRadius: 'var(--r-md)',
        background: 'var(--accent-dim)', border: '1px solid var(--accent-light)',
        fontSize: '12px', color: '#8A5605', fontWeight: 600,
      }}>
        🚗 Driver accounts only — Admin access is pre-configured by the system
      </div>
      <Input label="Full Name" type="text" placeholder="Arjun Mehta"
        error={errors.name?.message}
        {...register('name', { required: 'Name is required' })}
      />
      <Input label="Email" type="email" placeholder="driver@example.com"
        error={errors.email?.message}
        {...register('email', { required: 'Email is required' })}
      />
      <Input label="Password" type="password" placeholder="Min. 6 characters"
        error={errors.password?.message}
        {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
      />

      {registerMutation.isError && (
        <p style={{ color: 'var(--danger)', fontSize: '13px', margin: 0, padding: '8px 12px', background: 'rgba(196,69,59,0.07)', borderRadius: 'var(--r-sm)', borderLeft: '3px solid var(--danger)' }}>
          {registerMutation.error?.response?.data?.detail || 'Registration failed'}
        </p>
      )}

      <Button type="submit" variant="primary" disabled={registerMutation.isPending}
        style={{ justifyContent: 'center', padding: '12px', fontSize: '15px', marginTop: '4px' }}>
        {registerMutation.isPending ? <Spinner size={16} /> : 'Create Driver Account'}
      </Button>
    </form>
  )
}

/* ── Page ─────────────────────────────────────────── */
export default function LoginPage() {
  const [tab, setTab] = useState('login')

  return (
    <div style={{
      height: '100%',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'stretch',
      background: 'linear-gradient(150deg,#FFFDF7 0%,#FFF6DE 45%,#FFECC2 100%)',
    }}>
      {/* Left hero — hidden on mobile */}
      <div className="hide-mobile" style={{ display: 'flex', flexDirection: 'column', flex: 1, maxWidth: '560px', minWidth: '400px' }}>
        <HeroPanel />
      </div>

      {/* Right form panel */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        minHeight: '100vh',
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }} className="animate-in">
          {/* Mobile-only logo */}
          <div className="show-mobile" style={{
            flexDirection: 'column', alignItems: 'center',
            marginBottom: '32px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>🌿</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '26px', fontWeight: 700 }}>EcoRoute</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Intelligent Delivery Optimizer</div>
          </div>

          {/* Card */}
          <div style={{
            background: 'var(--surface)',
            borderRadius: 'var(--r-xl)',
            padding: '36px 32px',
            boxShadow: 'var(--shadow-login)',
            border: '1px solid var(--border)',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '22px', fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '24px',
            }}>
              {tab === 'login' ? 'Welcome back' : 'Create account'}
            </h2>

            <TabPill
              tabs={[{ id: 'login', label: 'Sign In' }, { id: 'register', label: 'Sign Up' }]}
              active={tab}
              onChange={setTab}
            />

            {tab === 'login' ? <LoginForm /> : <RegisterForm />}
          </div>
        </div>
      </div>
    </div>
  )
}
