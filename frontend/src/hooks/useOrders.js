import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getOrders, createOrder, deleteOrder } from '../api/orders'

export function useOrders() {
  return useQuery({ queryKey: ['orders'], queryFn: getOrders })
}

export function useCreateOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  })
}

export function useDeleteOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  })
}
