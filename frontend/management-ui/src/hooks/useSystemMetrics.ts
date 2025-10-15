import { useQuery } from '@tanstack/react-query';
import { mockApi } from '~/mocks/api';

export const useSystemMetrics = () => {
  return useQuery({
    queryKey: ['systemMetrics'],
    queryFn: () => mockApi.getSystemMetrics(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
