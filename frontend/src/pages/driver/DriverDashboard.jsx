import { Link } from 'react-router-dom'
import ProtectedRoute from '../../components/layout/ProtectedRoute'
import { useAuthStore } from '../../store/authStore'
import { useDriverAssignment, useCompleteStop } from '../../hooks/useRoutes'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'

function StopCard({ stop, idx, onDeliver, loading }) {
  const done = stop.status === 'COMPLETED'

  return (
    <div className="animate-in" style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-lg)',
      padding: '16px 18px',
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      boxShadow: 'var(--shadow-card)',
      opacity: done ? 0.65 : 1,
      transition: 'opacity 300ms',
    }}>
      {/* Numbered badge */}
      <div style={{
        width: '36px', height: '36px', borderRadius: '50%',
        background: done
          ? 'var(--delivered-bg)'
          : 'var(--grad-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '14px',
        flexShrink: 0,
        color: done ? 'var(--delivered-text)' : '#fff',
        boxShadow: done ? 'none' : 'var(--shadow-btn)',
      }}>
        {done ? '✓' : stop.sequence}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 600, fontSize: '14px',
          color: 'var(--text-primary)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {stop.address}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
          ETA {stop.eta_minutes} min
        </div>
      </div>

      {/* Action */}
      {done ? (
        <span className="status-badge delivered">Delivered</span>
      ) : (
        <Button
          variant="primary"
          style={{ fontSize: '12px', padding: '6px 14px', whiteSpace: 'nowrap' }}
          disabled={loading}
          onClick={onDeliver}
        >
          {loading ? <Spinner size={12} /> : 'Mark delivered'}
        </Button>
      )}
    </div>
  )
}

export default function DriverDashboard() {
  const user = useAuthStore((s) => s.user)
  const { data: plan, isLoading, isError } = useDriverAssignment(user?.id)
  const completeStop = useCompleteStop()

  return (
    <ProtectedRoute role="driver" title="My Deliveries">
      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--s10)' }}>
          <Spinner />
        </div>
      )}
      {isError && <EmptyState message="No deliveries assigned yet." icon="📭" />}
      {plan && (
        <>
          {/* Header */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-lg)',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            marginBottom: '20px',
            boxShadow: 'var(--shadow-card)',
            flexWrap: 'wrap',
          }}>
            <div>
              <h1 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '26px', fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '4px',
              }}>Today's Route</h1>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {[
                  { icon: '📍', value: `${plan.stops.length} stops` },
                  { icon: '🛣', value: `${plan.total_distance_km} km` },
                  { icon: '⏱', value: `~${plan.total_eta_minutes} min` },
                ].map((s) => (
                  <span key={s.value} style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {s.icon} {s.value}
                  </span>
                ))}
              </div>
            </div>
            <Link to="/driver/route">
              <Button variant="primary" style={{ fontSize: '14px', padding: '10px 20px' }}>
                🗺 View Map
              </Button>
            </Link>
          </div>

          {/* Stop list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {plan.stops.map((stop, idx) => (
              <StopCard
                key={stop.order_id}
                stop={stop}
                idx={idx}
                loading={completeStop.isPending}
                onDeliver={() => completeStop.mutate({ planId: plan.plan_id, stopIndex: idx })}
              />
            ))}
          </div>
        </>
      )}
    </ProtectedRoute>
  )
}
