import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { optimizeRoutes, getRoutePlans, getRoutePlan } from '../api/routing'
import { getDriverAssignment, completeStop, getAllAssignments } from '../api/assignments'

export function useOptimize() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: optimizeRoutes,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] })
      qc.invalidateQueries({ queryKey: ['plans'] })
      qc.invalidateQueries({ queryKey: ['assignments'] })
    },
  })
}

export function useRoutePlans() {
  return useQuery({ queryKey: ['plans'], queryFn: getRoutePlans })
}

export function useRoutePlan(id) {
  return useQuery({ queryKey: ['plans', id], queryFn: () => getRoutePlan(id), enabled: !!id })
}

export function useDriverAssignment(driverId) {
  return useQuery({
    queryKey: ['assignment', driverId],
    queryFn: () => getDriverAssignment(driverId),
    enabled: !!driverId,
    retry: false,
  })
}

export function useCompleteStop() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ planId, stopIndex }) => completeStop(planId, stopIndex),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assignment'] })
      qc.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

export function useAllAssignments() {
  return useQuery({ queryKey: ['assignments'], queryFn: getAllAssignments })
}
