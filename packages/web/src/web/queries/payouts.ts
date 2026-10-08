import { useMutation, useQuery } from "@tanstack/react-query";
import { orpc } from "../lib/api";
import { useRefreshAll } from "../hooks/refresh";

export function usePortfolio(memberId: number | null) {
  return useQuery(
    orpc.payouts.portfolio.queryOptions({ input: { memberId: memberId ?? 0 }, enabled: !!memberId }),
  );
}
export function useDistributions(projectId: number) {
  return useQuery(
    orpc.payouts.history.queryOptions({ input: { projectId }, enabled: Number.isFinite(projectId) && projectId > 0 }),
  );
}
export function useReportRevenue() {
  const refresh = useRefreshAll();
  return useMutation(orpc.payouts.report.mutationOptions({ onSuccess: refresh }));
}
export function useEscrowQueue(memberId: number | null, enabled: boolean) {
  return useQuery(orpc.escrow.queue.queryOptions({ input: { memberId: memberId ?? 0 }, enabled }));
}
export function useEscrowReview() {
  const refresh = useRefreshAll();
  return useMutation(orpc.escrow.review.mutationOptions({ onSuccess: refresh }));
}
