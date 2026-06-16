import { useQuery } from '@tanstack/react-query'
import { getDrivers, getAvailableDrivers } from '../api/drivers'

export function useDrivers() {
  return useQuery({ queryKey: ['drivers'], queryFn: getDrivers })
}

export function useAvailableDrivers() {
  return useQuery({ queryKey: ['drivers', 'available'], queryFn: getAvailableDrivers })
}
