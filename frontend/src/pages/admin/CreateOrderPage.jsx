import { useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import { divIcon } from 'leaflet'
import ProtectedRoute from '../../components/layout/ProtectedRoute'
import { useCreateOrder } from '../../hooks/useOrders'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import '../../styles/map.css'

const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const ATTRIBUTION = '&copy; OpenStreetMap contributors &copy; CARTO'

const pinIcon = divIcon({
  className: '',
  html: `<div style="width:12px;height:12px;background:var(--accent);border-radius:50%;border:2px solid #fff"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
})

function LiveMapPreview({ lat, lng }) {
  const validLat = parseFloat(lat)
  const validLng = parseFloat(lng)
  const isValid = !isNaN(validLat) && !isNaN(validLng) &&
    validLat >= -90 && validLat <= 90 && validLng >= -180 && validLng <= 180

  return (
    <div style={{ height: '300px', borderRadius: 'var(--r-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
      <MapContainer
        center={isValid ? [validLat, validLng] : [12.9716, 77.5946]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        key={isValid ? `${validLat}-${validLng}` : 'default'}
      >
        <TileLayer url={TILE_URL} attribution={ATTRIBUTION} />
        {isValid && <Marker position={[validLat, validLng]} icon={pinIcon} />}
      </MapContainer>
    </div>
  )
}

export default function CreateOrderPage() {
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: { latitude: '12.9716', longitude: '77.5946' }
  })
  const lat = useWatch({ control, name: 'latitude' })
  const lng = useWatch({ control, name: 'longitude' })
  const createOrder = useCreateOrder()
  const navigate = useNavigate()

  const onSubmit = async (data) => {
    await createOrder.mutateAsync({
      customer_name: data.customer_name,
      address: data.address,
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
    })
    navigate('/admin/orders')
  }

  return (
    <ProtectedRoute role="admin" title="Create Order">
      <div style={{ maxWidth: '680px' }}>
        <div className="page-header">
          <h1 className="page-title">New Order</h1>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
            <Input
              label="Customer Name"
              placeholder="Arjun Mehta"
              error={errors.customer_name?.message}
              {...register('customer_name', { required: 'Required' })}
            />
            <Input
              label="Address"
              placeholder="Hebbal Ring Road, Bengaluru"
              error={errors.address?.message}
              {...register('address', { required: 'Required' })}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s4)' }}>
              <Input
                label="Latitude"
                type="number"
                step="any"
                placeholder="12.9716"
                error={errors.latitude?.message}
                {...register('latitude', {
                  required: 'Required',
                  min: { value: -90, message: 'Must be ≥ -90' },
                  max: { value: 90, message: 'Must be ≤ 90' },
                })}
              />
              <Input
                label="Longitude"
                type="number"
                step="any"
                placeholder="77.5946"
                error={errors.longitude?.message}
                {...register('longitude', {
                  required: 'Required',
                  min: { value: -180, message: 'Must be ≥ -180' },
                  max: { value: 180, message: 'Must be ≤ 180' },
                })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Location Preview</label>
              <LiveMapPreview lat={lat} lng={lng} />
            </div>

            {createOrder.isError && (
              <p style={{ color: '#e06060', fontSize: 'var(--text-sm)' }}>
                {createOrder.error?.response?.data?.message || 'Failed to create order'}
              </p>
            )}

            <div style={{ display: 'flex', gap: 'var(--s3)', justifyContent: 'flex-end' }}>
              <Button type="button" variant="ghost" onClick={() => navigate('/admin/orders')}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={createOrder.isPending}>
                {createOrder.isPending ? <Spinner size={16} /> : 'Create Order'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  )
}
