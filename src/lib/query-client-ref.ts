import type { QueryClient } from "@tanstack/react-query";

/**
 * Module-level reference to the active TanStack QueryClient.
 * Set once from <RootComponent /> so imperative stores can trigger
 * query invalidations outside of React render scope.
 */
let currentQueryClient: QueryClient | null = null;

export function setQueryClient(client: QueryClient) {
  currentQueryClient = client;
}

export function getQueryClient(): QueryClient | null {
  return currentQueryClient;
}
