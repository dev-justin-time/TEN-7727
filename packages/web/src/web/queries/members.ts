import { useMutation, useQuery } from "@tanstack/react-query";
import { orpc } from "../lib/api";
import { useRefreshAll } from "../hooks/refresh";

export function useMember(memberId: number | null) {
  return useQuery(
    orpc.members.get.queryOptions({ input: { memberId: memberId ?? 0 }, enabled: !!memberId, retry: false }),
  );
}

export function useMembersList() {
  return useQuery(orpc.members.list.queryOptions());
}

export function useDashboard(memberId: number | null) {
  return useQuery(orpc.members.dashboard.queryOptions({ input: { memberId: memberId ?? 0 }, enabled: !!memberId }));
}

export function useScores(memberId: number | null, targetHandle?: string) {
  return useQuery(
    orpc.members.scores.queryOptions({
      input: { memberId: memberId ?? 0, targetHandle },
      enabled: !!memberId,
      retry: false,
    }),
  );
}

export function useLeaderboard() {
  return useQuery(orpc.members.leaderboard.queryOptions());
}

export function useJoin() {
  const refresh = useRefreshAll();
  return useMutation(orpc.members.join.mutationOptions({ onSuccess: refresh }));
}

export function useSetWorld() {
  return useMutation(orpc.members.setWorld.mutationOptions());
}

export function useLevelUp() {
  const refresh = useRefreshAll();
  return useMutation(orpc.members.levelUp.mutationOptions({ onSuccess: refresh }));
}

export function useUnlockOngoing() {
  const refresh = useRefreshAll();
  return useMutation(orpc.members.unlockOngoing.mutationOptions({ onSuccess: refresh }));
}

export function useKyc() {
  const refresh = useRefreshAll();
  return useMutation(orpc.members.kyc.mutationOptions({ onSuccess: refresh }));
}

export function useTopUp() {
  const refresh = useRefreshAll();
  return useMutation(orpc.members.topUp.mutationOptions({ onSuccess: refresh }));
}
