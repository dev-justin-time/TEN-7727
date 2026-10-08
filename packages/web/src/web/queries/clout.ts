import { useMutation, useQuery } from "@tanstack/react-query";
import { orpc } from "../lib/api";
import { useRefreshAll } from "../hooks/refresh";

export function useTaskBoard() {
  return useQuery(orpc.clout.board.queryOptions({ staleTime: Infinity }));
}
export function useMyTasks(memberId: number | null) {
  return useQuery(orpc.clout.mine.queryOptions({ input: { memberId: memberId ?? 0 }, enabled: !!memberId }));
}
export function useClaimTask() {
  const refresh = useRefreshAll();
  return useMutation(orpc.clout.claim.mutationOptions({ onSuccess: refresh }));
}
export function useSubmitTask() {
  const refresh = useRefreshAll();
  return useMutation(orpc.clout.submit.mutationOptions({ onSuccess: refresh }));
}
export function useProposals() {
  return useQuery(orpc.governance.proposals.queryOptions());
}
export function usePropose() {
  const refresh = useRefreshAll();
  return useMutation(orpc.governance.propose.mutationOptions({ onSuccess: refresh }));
}
export function useVote() {
  const refresh = useRefreshAll();
  return useMutation(orpc.governance.vote.mutationOptions({ onSuccess: refresh }));
}
export function useReserve() {
  return useQuery(orpc.governance.reserve.queryOptions());
}
