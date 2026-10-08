import { useQueryClient } from "@tanstack/react-query";

/**
 * Almost every action moves simulated money or points, which shows up in the
 * wallet chip, dashboards and books at once — so mutations refresh everything.
 */
export function useRefreshAll() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries();
}
