import api from './axios'

export const getOrders = () =>
  api.get('/orders').then((r) => r.data)

export const createOrder = (data) =>
  api.post('/orders', data).then((r) => r.data)

export const deleteOrder = (id) =>
  api.delete(`/orders/${id}`).then((r) => r.data)
