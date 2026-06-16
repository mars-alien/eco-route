import api from './axios'

export const getDrivers = () =>
  api.get('/drivers').then((r) => r.data)

export const getAvailableDrivers = () =>
  api.get('/drivers/available').then((r) => r.data)

export const updateDriverLocation = (id, latitude, longitude) =>
  api.patch(`/drivers/${id}/location`, { latitude, longitude }).then((r) => r.data)
