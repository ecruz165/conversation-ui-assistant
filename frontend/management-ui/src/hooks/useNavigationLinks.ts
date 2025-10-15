import { useQuery } from '@tanstack/react-query'
import { mockApi } from '~/mocks/api'

export const useNavigationLinks = (websiteId: string) => {
  return useQuery({
    queryKey: ['navigationLinks', websiteId],
    queryFn: () => mockApi.getNavigationLinks(websiteId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
