import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "./session";
import { log } from "../lib/log";

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
  mutationCache: new MutationCache({
    onMutate: (_variables, mutation) => { log.decide("mutation", "Requested", mutation.options.mutationKey); },
    onSuccess: (_data, _variables, _context, mutation) => { log.decide("mutation", "Completed", mutation.options.mutationKey); },
    onError: (_error, _variables, _context, mutation) => { log.warn("mutation", "Rejected; see the inline explanation", mutation.options.mutationKey); },
  }),
});

interface ProviderProps {
  children: React.ReactNode;
}

export function Provider({ children }: ProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>{children}</SessionProvider>
    </QueryClientProvider>
  );
}
