/** Operational events and rule outcomes only; never secrets or private form contents. */
function emit(level: "log" | "warn" | "error", scope: string, message: string, data?: unknown) {
  if (localStorage.getItem("kinship.log") === "off") return;
  console[level](`[kinship:${scope}] ${new Date().toISOString()} ${message}`, data ?? "");
}
export const log = {
  decide: (scope: string, message: string, data?: unknown) => emit("log", scope, message, data),
  warn: (scope: string, message: string, data?: unknown) => emit("warn", scope, message, data),
  error: (scope: string, message: string, data?: unknown) => emit("error", scope, message, data),
};