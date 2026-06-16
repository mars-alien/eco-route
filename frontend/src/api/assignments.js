import api from './axios'

export const getDriverAssignment = (driverId) =>
  api.get(`/assignments/driver/${driverId}`).then((r) => r.data)

export const completeStop = (planId, stopIndex) =>
  api.patch(`/assignments/${planId}/stops/${stopIndex}/complete`).then((r) => r.data)

export const getAllAssignments = () =>
  api.get('/assignments/all').then((r) => r.data)
