/** Safe operational audit: rule outcomes, not internal reasoning or private form data. */
export function logDecision(scope: string, event: string, data?: unknown) {
  console.log(`[kinship:${scope}] ${new Date().toISOString()} ${event}`, data ?? "");
}