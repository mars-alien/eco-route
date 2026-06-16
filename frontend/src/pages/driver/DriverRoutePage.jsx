import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet'
import { divIcon } from 'leaflet'
import ProtectedRoute from '../../components/layout/ProtectedRoute'
import { useAuthStore } from '../../store/authStore'
import { useDriverAssignment, useCompleteStop } from '../../hooks/useRoutes'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import '../../styles/map.css'

const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const ATTRIBUTION = '&copy; OpenStreetMap contributors &copy; CARTO'

function stopIcon(seq, completed) {
  const bg = completed ? '#3b8c78' : '#3b8c78'
  const border = completed ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.8)'
  return divIcon({
    className: '',
    html: `<div class="cluster-marker" style="background:${bg};border-color:${border}">${completed ? '✓' : seq}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  })
}

export default function DriverRoutePage() {
  const user = useAuthStore((s) => s.user)
  const { data: plan, isLoading, isError } = useDriverAssignment(user?.id)
  const completeStop = useCompleteStop()

  const currentStop = plan?.stops.find((s) => s.status !== 'COMPLETED')
  const currentIdx = plan?.stops.indexOf(currentStop)

  return (
    <ProtectedRoute role="driver" title="Route Map" mapLayout>
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
                color="var(--accent)"
                weight={3}
                opacity={0.8}
                dashArray="8 5"
              />
              {plan.stops.map((stop, idx) => (
                <Marker
                  key={stop.order_id}
                  position={[stop.lat, stop.lng]}
                  icon={stopIcon(stop.sequence, stop.status === 'COMPLETED')}
                >
                  <Popup>
                    <strong>Stop #{stop.sequence}</strong><br />
                    {stop.address}<br />
                    <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
                      ETA {stop.eta_minutes} min
                    </span>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {currentStop && (
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '260px',
                background: 'var(--surface)',
                borderTop: '1px solid var(--border)',
                padding: 'var(--s4)',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--s3)',
              }}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Current Stop — {currentIdx + 1} of {plan.stops.length}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-md)' }}>Stop #{currentStop.sequence}</div>
                  <div style={{ color: 'var(--text-secondary)', marginTop: 'var(--s1)' }}>{currentStop.address}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--accent)', marginTop: 'var(--s2)' }}>
                    ETA {currentStop.eta_minutes} min
                  </div>
                </div>
                <Button
                  variant="primary"
                  style={{ justifyContent: 'center', marginTop: 'auto' }}
                  disabled={completeStop.isPending}
                  onClick={() => completeStop.mutate({ planId: plan.plan_id, stopIndex: currentIdx })}
                >
                  {completeStop.isPending ? <Spinner size={16} /> : 'Mark as Delivered'}
                </Button>
              </div>
            )}

            {!currentStop && (
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: 'var(--s6)',
                background: 'var(--surface)',
                borderTop: '1px solid var(--border)',
                textAlign: 'center',
                color: 'var(--delivered)',
                fontWeight: 600,
                zIndex: 1000,
              }}>
                All stops completed!
              </div>
            )}
          </>
        )}
      </div>
    </ProtectedRoute>
  )
}
