import { QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { createQueryClient } from "./query-client";

export function AppProviders({ children }: { children: ReactNode }) {
  const channel = useRef<BroadcastChannel | null>(null);
  const [queryClient] = useState(() =>
    createQueryClient(() => {
      channel.current?.postMessage("data-changed");
    }),
  );

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const connection = new BroadcastChannel("delsu-data-updates");
    channel.current = connection;
    connection.onmessage = (event) => {
      // Only an invalidation signal crosses tabs. Each tab fetches with its
      // own credentials; account data and tokens are never broadcast.
      if (event.data === "data-changed") void queryClient.invalidateQueries();
    };
    return () => {
      channel.current = null;
      connection.close();
    };
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
