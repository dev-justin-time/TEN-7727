import { useMutation, useQuery } from "@tanstack/react-query";
import { orpc } from "../lib/api";
import { useRefreshAll } from "../hooks/refresh";

type Kind =
  | "provisional_patent"
  | "copyright_registration"
  | "trademark_intent"
  | "nda"
  | "work_for_hire"
  | "ip_assignment";

export function useIpTemplates() {
  return useQuery(orpc.ipdesk.templates.queryOptions({ staleTime: Infinity }));
}
export function useIpPreview(kind: Kind | null, formData: Record<string, string>) {
  return useQuery(
    orpc.ipdesk.preview.queryOptions({
      input: { kind: kind ?? "nda", formData },
      enabled: !!kind,
      placeholderData: (prev) => prev,
    }),
  );
}
export function useMyFilings(memberId: number | null) {
  return useQuery(orpc.ipdesk.mine.queryOptions({ input: { memberId: memberId ?? 0 }, enabled: !!memberId }));
}
export function useGenerateFiling() {
  const refresh = useRefreshAll();
  return useMutation(orpc.ipdesk.generate.mutationOptions({ onSuccess: refresh }));
}
export function useAttorneyReview() {
  const refresh = useRefreshAll();
  return useMutation(orpc.ipdesk.requestAttorneyReview.mutationOptions({ onSuccess: refresh }));
}
