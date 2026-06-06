import { logAppError, type LogAppErrorInput } from "@/lib/error-logging.functions";

/**
 * Client-side helper to report errors. Never throws — failures are swallowed
 * so the logger can never break the user experience.
 */
export async function reportError(input: Partial<LogAppErrorInput> & { action_name: string; error: unknown }) {
  try {
    const { error, ...rest } = input;
    const err = error instanceof Error ? error : new Error(typeof error === "string" ? error : "Unknown error");
    const browser = typeof navigator !== "undefined" ? navigator.userAgent : undefined;
    const device = typeof navigator !== "undefined"
      ? (/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? "mobile" : "desktop")
      : undefined;
    const page_url = typeof window !== "undefined" ? window.location.href : undefined;
    const route = typeof window !== "undefined" ? window.location.pathname : undefined;
    await logAppError({
      data: {
        severity: "medium",
        ...rest,
        action_name: input.action_name,
        error_type: err.name,
        error_message: err.message,
        error_stack: err.stack,
        browser,
        device,
        page_url,
        route,
      } as LogAppErrorInput,
    });
  } catch {
    // never propagate
  }
}