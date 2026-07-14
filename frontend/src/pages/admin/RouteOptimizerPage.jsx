import { useState } from 'react'
import ProtectedRoute from '../../components/layout/ProtectedRoute'
import { useOrders } from '../../hooks/useOrders'
import { useAvailableDrivers } from '../../hooks/useDrivers'
import { useOptimize } from '../../hooks/useRoutes'
import DeliveryMap from '../../components/map/DeliveryMap'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'

const CLUSTER_COLORS = [
  { css: 'var(--cluster-0)', hex: '#FF9F1C' },
  { css: 'var(--cluster-1)', hex: '#2F9E6E' },
  { css: 'var(--cluster-2)', hex: '#D6455D' },
  { css: 'var(--cluster-3)', hex: '#7C8CE0' },
  { css: 'var(--cluster-4)', hex: '#F2790B' },
]

function PlanCard({ plan, index, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen)
  const color = CLUSTER_COLORS[index % CLUSTER_COLORS.length]

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderLeft: `4px solid ${color.hex}`,
      borderRadius: 'var(--r-md)',
      marginBottom: 'var(--s3)',
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(180,130,20,0.06)',
    }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%',
          background: 'var(--surface-raised)',
          border: 'none',
          padding: '12px 14px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: 'var(--text-primary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            width: '10px', height: '10px', borderRadius: '50%',
            background: color.css, flexShrink: 0, display: 'block',
          }} />
          <span style={{ fontWeight: 700, fontSize: '14px', fontFamily: 'var(--font)' }}>{plan.driver_name}</span>
        </div>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>{open ? '▲' : '▼'}</span>
      </button>

      <div style={{ padding: '6px 14px 10px', background: 'var(--surface-raised)', borderBottom: open ? '1px solid var(--border)' : 'none' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
          {plan.stops.length} stops · {plan.total_distance_km} km · ~{plan.total_eta_minutes} min
        </span>
      </div>

      {open && (
        <div style={{ padding: '12px 14px' }}>
          {plan.stops.map((stop) => (
            <div key={stop.order_id} style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
              paddingBottom: '10px',
              marginBottom: '10px',
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              <div style={{
                width: '22px', height: '22px', borderRadius: '50%',
                background: color.css,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10px', fontWeight: 700,
                flexShrink: 0, color: '#fff',
                fontFamily: 'var(--font-heading)',
              }}>
                {stop.sequence}
              </div>
              <div>
                <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.4 }}>{stop.address}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  ETA {stop.eta_minutes} min
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function RouteOptimizerPage() {
  const { data: orders = [], isLoading: ordersLoading } = useOrders()
  const { data: drivers = [], isLoading: driversLoading } = useAvailableDrivers()
  const optimize = useOptimize()
  const [result, setResult] = useState(null)

  const pending = orders.filter((o) => o.status === 'PENDING')

  const handleOptimize = () => {
    optimize.mutate(undefined, {
      onSuccess: (data) => setResult(data),
    })
  }

  const clusters = result
    ? result.route_plans.map((plan, i) => ({
        cluster_index: i,
        order_ids: plan.stops.map((s) => s.order_id),
      }))
    : []

  const routes = result
    ? result.route_plans.map((plan) => ({
        driver_id: plan.driver_id,
        driver_name: plan.driver_name,
        stops: plan.stops,
      }))
    : []

  const mapOrders = result
    ? orders.filter((o) => o.status === 'ASSIGNED' || clusters.some((c) => c.order_ids.includes(o.id)))
    : pending

  return (
    <ProtectedRoute role="admin" title="Route Optimizer" mapLayout>
      <div className="optimizer-layout" style={{ display: 'flex', height: '100%' }}>
        {/* Left panel */}
        <div className="optimizer-panel" style={{
          width: '340px',
          minWidth: '340px',
          background: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Controls */}
          <div style={{ padding: 'var(--s5)', borderBottom: '1px solid var(--border)' }}>
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: 'var(--text-muted)',
              marginBottom: '16px',
            }}>
              K-Means++ / Nearest Neighbour Heuristic
            </div>

            {/* Mini stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              {[
                { label: 'Pending', value: ordersLoading ? '…' : pending.length, grad: 'var(--grad-amber)' },
                { label: 'Drivers', value: driversLoading ? '…' : drivers.length, grad: 'var(--grad-green)' },
              ].map((s) => (
                <div key={s.label} style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-md)',
                  padding: '12px',
                  boxShadow: '0 4px 10px rgba(180,130,20,0.07)',
                }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>{s.label}</div>
                  <div style={{
                    fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: 700,
                    backgroundImage: s.grad, WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                    lineHeight: 1,
                  }}>{s.value}</div>
                </div>
              ))}
            </div>

            <Button
              variant="primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '15px' }}
              disabled={optimize.isPending || pending.length === 0}
              onClick={handleOptimize}
            >
              {optimize.isPending
                ? <><Spinner size={14} /> Optimising…</>
                : result ? 'Re-run Optimization' : 'Run Optimization'}
            </Button>

            {optimize.isError && (
              <p style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '10px', padding: '8px 10px', background: 'var(--danger-bg)', borderRadius: 'var(--r-sm)' }}>
                {optimize.error?.response?.data?.message || 'Optimisation failed'}
              </p>
            )}
          </div>

          {/* Route plan list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>
            {result && (
              <>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: 600 }}>
                  {result.total_orders_assigned} orders assigned · {result.clusters_generated} routes generated
                </div>
                {result.route_plans.map((plan, i) => (
                  <PlanCard key={plan.plan_id} plan={plan} index={i} defaultOpen={i === 0} />
                ))}
              </>
            )}
            {!result && !optimize.isPending && (
              <div style={{ textAlign: 'center', padding: '40px 16px' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>🗺</div>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.6 }}>
                  Run optimization to assign pending orders to drivers and generate route plans.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="optimizer-map" style={{ flex: 1 }}>
          <DeliveryMap orders={mapOrders} clusters={clusters} routes={routes} />
        </div>
      </div>
    </ProtectedRoute>
  )
}
