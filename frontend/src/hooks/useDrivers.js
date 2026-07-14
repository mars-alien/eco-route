import { useQuery } from '@tanstack/react-query'
import { getAvailableDrivers } from '../api/drivers'

export function useAvailableDrivers() {
  return useQuery({ queryKey: ['drivers', 'available'], queryFn: getAvailableDrivers })
}
