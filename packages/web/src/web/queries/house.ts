import { useMutation, useQuery } from "@tanstack/react-query";
import { orpc } from "../lib/api";
import { useRefreshAll } from "../hooks/refresh";

export function useHouseLedger(memberId: number | null, enabled: boolean) {
  return useQuery(orpc.house.ledger.queryOptions({ input: { memberId: memberId ?? 0 }, enabled }));
}
export function useWatchlist(memberId: number | null, enabled: boolean) {
  return useQuery(orpc.house.watchlist.queryOptions({ input: { memberId: memberId ?? 0 }, enabled }));
}
export function useHouseNotices(memberId: number | null, enabled: boolean) {
  return useQuery(orpc.house.notices.queryOptions({ input: { memberId: memberId ?? 0 }, enabled }));
}
export function useMyNotices(memberId: number | null) {
  return useQuery(
    orpc.house.myNotices.queryOptions({ input: { memberId: memberId ?? 0 }, enabled: !!memberId }),
  );
}
export function useFeatures() {
  return useQuery(orpc.house.features.queryOptions());
}
export function useVoteFeature() {
  const refresh = useRefreshAll();
  return useMutation(orpc.house.voteFeature.mutationOptions({ onSuccess: refresh }));
}
export function useIssueGrace() {
  const refresh = useRefreshAll();
  return useMutation(orpc.house.issueGrace.mutationOptions({ onSuccess: refresh }));
}
export function useIssueDefault() {
  const refresh = useRefreshAll();
  return useMutation(orpc.house.issueDefaultNotice.mutationOptions({ onSuccess: refresh }));
}
export function useCureNotice() {
  const refresh = useRefreshAll();
  return useMutation(orpc.house.cureNotice.mutationOptions({ onSuccess: refresh }));
}
export function useForeclose() {
  const refresh = useRefreshAll();
  return useMutation(orpc.house.foreclose.mutationOptions({ onSuccess: refresh }));
}
