import { useState } from 'react'
import ProtectedRoute from '../../components/layout/ProtectedRoute'
import { useOrders } from '../../hooks/useOrders'
import { useAvailableDrivers } from '../../hooks/useDrivers'
import { useOptimize } from '../../hooks/useRoutes'
import DeliveryMap from '../../components/map/DeliveryMap'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'

const CLUSTER_COLORS = ['var(--cluster-0)', 'var(--cluster-1)', 'var(--cluster-2)', 'var(--cluster-3)', 'var(--cluster-4)']

function PlanCard({ plan, index, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen)
  const color = CLUSTER_COLORS[index % CLUSTER_COLORS.length]

  return (
    <div style={{
      border: '1px solid var(--border)',
      borderLeft: `3px solid ${color}`,
      borderRadius: 'var(--r-md)',
      marginBottom: 'var(--s3)',
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%',
          background: 'var(--surface-raised)',
          border: 'none',
          padding: 'var(--s3) var(--s4)',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: 'var(--text-primary)',
        }}
      >
        <span style={{ fontWeight: 500, fontSize: 'var(--text-sm)' }}>{plan.driver_name}</span>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{open ? '▲' : '▼'}</span>
      </button>
      <div style={{ padding: '0 var(--s4) var(--s1)', background: 'var(--surface-raised)' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
          {plan.total_distance_km} km · {plan.total_eta_minutes} min · {plan.stops.length} stops
        </span>
      </div>

      {open && (
        <div style={{ padding: 'var(--s3) var(--s4)', background: 'var(--surface)' }}>
          {plan.stops.map((stop) => (
            <div key={stop.order_id} style={{
              display: 'flex',
              gap: 'var(--s3)',
              alignItems: 'flex-start',
              paddingBottom: 'var(--s2)',
              marginBottom: 'var(--s2)',
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              <div style={{
                width: '20px', height: '20px', borderRadius: '50%',
                background: color, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '10px', fontWeight: 600,
                flexShrink: 0, color: '#fff',
              }}>
                {stop.sequence}
              </div>
              <div>
                <div style={{ fontSize: 'var(--text-sm)', lineHeight: 1.3 }}>{stop.address}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
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
      <div style={{ display: 'flex', height: '100%' }}>
        <div style={{
          width: '360px',
          minWidth: '360px',
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <div style={{ padding: 'var(--s6)', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--s4)' }}>
              K-Means++ / Nearest Neighbor Heuristic
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s3)', marginBottom: 'var(--s4)' }}>
              <div style={{ background: 'var(--surface-raised)', borderRadius: 'var(--r-md)', padding: 'var(--s3)' }}>
                <div className="stat-label">Pending</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-lg)', fontWeight: 600 }}>
                  {ordersLoading ? '…' : pending.length}
                </div>
              </div>
              <div style={{ background: 'var(--surface-raised)', borderRadius: 'var(--r-md)', padding: 'var(--s3)' }}>
                <div className="stat-label">Drivers</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--accent)' }}>
                  {driversLoading ? '…' : drivers.length}
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={optimize.isPending || pending.length === 0}
              onClick={handleOptimize}
            >
              {optimize.isPending ? <><Spinner size={14} /> Optimizing…</> : 'Run Optimization'}
            </Button>

            {optimize.isError && (
              <p style={{ color: '#e06060', fontSize: 'var(--text-xs)', marginTop: 'var(--s3)' }}>
                {optimize.error?.response?.data?.message || 'Optimization failed'}
              </p>
            )}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--s4)' }}>
            {result && (
              <>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--s3)', fontWeight: 500 }}>
                  {result.total_orders_assigned} orders assigned · {result.clusters_generated} routes
                </div>
                {result.route_plans.map((plan, i) => (
                  <PlanCard key={plan.plan_id} plan={plan} index={i} defaultOpen={i === 0} />
                ))}
              </>
            )}
            {!result && !optimize.isPending && (
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', textAlign: 'center', marginTop: 'var(--s8)' }}>
                Run optimization to see route plans
              </p>
            )}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <DeliveryMap
            orders={mapOrders}
            clusters={clusters}
            routes={routes}
          />
        </div>
      </div>
    </ProtectedRoute>
  )
}
