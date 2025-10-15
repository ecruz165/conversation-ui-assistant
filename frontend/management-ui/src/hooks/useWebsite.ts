import { useQuery } from '@tanstack/react-query'
import { mockApi } from '~/mocks/api'

export const useWebsite = (id: string) => {
  return useQuery({
    queryKey: ['website', id],
    queryFn: () => mockApi.getWebsite(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
