import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet'
import { divIcon } from 'leaflet'
import ProtectedRoute from '../../components/layout/ProtectedRoute'
import { useAuthStore } from '../../store/authStore'
import { useDriverAssignment, useCompleteStop } from '../../hooks/useRoutes'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import { TILE_URL, ATTRIBUTION } from '../../api/mapConfig'
import '../../styles/map.css'

function stopIcon(seq, completed) {
  const bg = completed ? '#2F9E6E' : '#FF9F1C'
  const border = completed ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.9)'
  return divIcon({
    className: '',
    html: `<div class="cluster-marker" style="background:${bg};border-color:${border}">${completed ? '✓' : seq}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  })
}

export default function DriverRoutePage() {
  const user = useAuthStore((s) => s.user)
  const { data: plan, isLoading, isError } = useDriverAssignment(user?.id)
  const completeStop = useCompleteStop()

  const currentStop = plan?.stops.find((s) => s.status !== 'COMPLETED')
  const currentIdx = plan?.stops.indexOf(currentStop)

  return (
    <ProtectedRoute role="driver" title="My Route" mapLayout>
      <div style={{ position: 'relative', height: '100%' }}>
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Spinner />
          </div>
        )}
        {isError && <EmptyState message="No active route found." />}
        {plan && (
          <>
            <MapContainer
              center={currentStop ? [currentStop.lat, currentStop.lng] : [12.9716, 77.5946]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer url={TILE_URL} attribution={ATTRIBUTION} />
              <Polyline
                positions={plan.stops.map((s) => [s.lat, s.lng])}
                color="#FF9F1C"
                weight={3.5}
                opacity={0.85}
                dashArray="10 6"
              />
              {plan.stops.map((stop, idx) => (
                <Marker
                  key={stop.order_id}
                  position={[stop.lat, stop.lng]}
                  icon={stopIcon(stop.sequence, stop.status === 'COMPLETED')}
                >
                  <Popup>
                    <strong style={{ color: 'var(--text-primary)' }}>Stop #{stop.sequence}</strong><br />
                    <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{stop.address}</span><br />
                    <span style={{ color: 'var(--accent)', fontSize: '11px', fontWeight: 600 }}>
                      ETA {stop.eta_minutes} min
                    </span>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Bottom sheet — current stop */}
            {currentStop && (
              <div style={{
                position: 'absolute',
                bottom: 0, left: 0, right: 0,
                background: 'var(--surface)',
                borderTop: '2px solid var(--border)',
                borderRadius: '20px 20px 0 0',
                padding: '20px 24px',
                zIndex: 1000,
                boxShadow: '0 -8px 32px rgba(180,130,20,0.14)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}>
                {/* Handle */}
                <div style={{
                  width: '40px', height: '4px', borderRadius: '2px',
                  background: 'var(--border)', margin: '-8px auto 4px',
                }} />

                <div style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em',
                  textTransform: 'uppercase', color: 'var(--text-muted)',
                }}>
                  Current Stop — {currentIdx + 1} of {plan.stops.length}
                </div>

                <div>
                  <div style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700, fontSize: '18px',
                    color: 'var(--text-primary)',
                  }}>
                    Stop #{currentStop.sequence}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
                    {currentStop.address}
                  </div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    marginTop: '8px',
                    padding: '4px 12px',
                    background: 'var(--accent-dim)',
                    borderRadius: '50px',
                    fontSize: '12px', fontWeight: 700,
                    color: '#8A5605',
                  }}>
                    ⏱ ETA {currentStop.eta_minutes} min
                  </div>
                </div>

                <Button
                  variant="primary"
                  style={{ justifyContent: 'center', padding: '13px', fontSize: '15px' }}
                  disabled={completeStop.isPending}
                  onClick={() => completeStop.mutate({ planId: plan.plan_id, stopIndex: currentIdx })}
                >
                  {completeStop.isPending ? <Spinner size={16} /> : '✓ Mark as Delivered'}
                </Button>
              </div>
            )}

            {/* All done banner */}
            {!currentStop && (
              <div style={{
                position: 'absolute',
                bottom: 0, left: 0, right: 0,
                padding: '24px',
                background: 'var(--surface)',
                borderTop: '2px solid var(--border)',
                borderRadius: '20px 20px 0 0',
                textAlign: 'center',
                zIndex: 1000,
                boxShadow: '0 -8px 32px rgba(180,130,20,0.14)',
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎉</div>
                <div style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '20px', fontWeight: 700,
                  color: 'var(--success)',
                }}>All stops completed!</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Great work — your route is complete.
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ProtectedRoute>
  )
}
