import { Link } from 'react-router-dom'
import ProtectedRoute from '../../components/layout/ProtectedRoute'
import { useAuthStore } from '../../store/authStore'
import { useDriverAssignment, useCompleteStop } from '../../hooks/useRoutes'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'

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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s6)' }}>
            <div>
              <h1 className="page-title">Today's Route</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--s1)' }}>
                {plan.stops.length} stops · {plan.total_distance_km} km · ~{plan.total_eta_minutes} min
              </p>
            </div>
            <Link to="/driver/route">
              <Button variant="primary">View Map</Button>
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s3)' }}>
            {plan.stops.map((stop, idx) => (
              <div key={stop.order_id} className="card" style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--s4)',
                opacity: stop.status === 'COMPLETED' ? 0.5 : 1,
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: stop.status === 'COMPLETED' ? 'var(--delivered)' : 'var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 'var(--text-sm)',
                  flexShrink: 0, color: '#fff',
                }}>
                  {stop.status === 'COMPLETED' ? '✓' : stop.sequence}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>{stop.address}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                    ETA {stop.eta_minutes} min
                  </div>
                </div>
                {stop.status !== 'COMPLETED' && (
                  <Button
                    variant="primary"
                    style={{ fontSize: 'var(--text-xs)', padding: 'var(--s1) var(--s3)' }}
                    disabled={completeStop.isPending}
                    onClick={() => completeStop.mutate({ planId: plan.plan_id, stopIndex: idx })}
                  >
                    {completeStop.isPending ? <Spinner size={12} /> : 'Delivered'}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </ProtectedRoute>
  )
}
