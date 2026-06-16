import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import OrdersPage from './pages/admin/OrdersPage'
import CreateOrderPage from './pages/admin/CreateOrderPage'
import RouteOptimizerPage from './pages/admin/RouteOptimizerPage'
import DriverDashboard from './pages/driver/DriverDashboard'
import DriverRoutePage from './pages/driver/DriverRoutePage'

function RootRedirect() {
  const role = useAuthStore((s) => s.role)
  const token = useAuthStore((s) => s.token)
  if (!token) return <Navigate to="/login" replace />
  if (role === 'admin') return <Navigate to="/admin/dashboard" replace />
  return <Navigate to="/driver/dashboard" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/orders" element={<OrdersPage />} />
      <Route path="/admin/orders/create" element={<CreateOrderPage />} />
      <Route path="/admin/optimize" element={<RouteOptimizerPage />} />
      <Route path="/driver/dashboard" element={<DriverDashboard />} />
      <Route path="/driver/route" element={<DriverRoutePage />} />
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  )
}
