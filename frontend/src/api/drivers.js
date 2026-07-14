import api from './axios'

export const getAvailableDrivers = () =>
  api.get('/drivers/available').then((r) => r.data)
