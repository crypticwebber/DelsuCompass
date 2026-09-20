import { MutationCache, QueryClient } from "@tanstack/react-query";

export function createQueryClient(notifyOtherTabs: () => void) {
  const client = new QueryClient({
    mutationCache: new MutationCache({
      onSuccess: () => {
        void client.invalidateQueries();
        notifyOtherTabs();
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 120_000,
        gcTime: 15 * 60_000,
        retry: 1,
        refetchOnWindowFocus: "always",
        refetchOnReconnect: "always",
      },
      mutations: { retry: 0 },
    },
  });
  return client;
}
