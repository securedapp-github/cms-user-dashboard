import useSWR from 'swr';
import { userApi } from '../services/api/userApi';

/**
 * Centralized logs fetching hook using SWR for automatic deduplication.
 * Multiple components using this hook will share the same cached request.
 */
export function useLogs(limit?: number, enabled: boolean = true) {
  const key = enabled ? `user/logs${limit ? `/limit-${limit}` : ''}` : null;

  const { data, isLoading, error, mutate } = useSWR(
    key,
    () => userApi.getLogs(limit),
    {
      refreshInterval: 10000, // Poll every 10s
      revalidateOnFocus: false, // Don't revalidate on window focus
      dedupingInterval: 10000, // Dedupe requests within 10s window
    }
  );

  return {
    logs: data?.logs || [],
    isLoading,
    error,
    mutate,
  };
}