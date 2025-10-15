import { useQuery } from '@tanstack/react-query';
import { mockApi } from '~/mocks/api';

export const useWebsites = () => {
  return useQuery({
    queryKey: ['websites'],
    queryFn: () => mockApi.getWebsites(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
