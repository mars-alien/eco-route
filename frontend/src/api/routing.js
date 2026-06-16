import api from './axios'

export const optimizeRoutes = () =>
  api.post('/routing/optimize').then((r) => r.data)

export const getRoutePlans = () =>
  api.get('/routing/plans').then((r) => r.data)

export const getRoutePlan = (id) =>
  api.get(`/routing/plans/${id}`).then((r) => r.data)
