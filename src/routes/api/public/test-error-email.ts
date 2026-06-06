import { createFileRoute } from "@tanstack/react-router";
import { logAppError } from "@/lib/error-logging.functions";

export const Route = createFileRoute("/api/public/test-error-email")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (request.headers.get("x-test-key") !== "ideapilot-test-2026") {
          return new Response("Unauthorized", { status: 401 });
        }
        const res = await logAppError({
          data: {
            action_name: "test_error_email_notification",
            error_type: "manual_test",
            error_message: "Test invio email error logging IdeaPilot AI",
            severity: "critical",
            metadata: { test: true, source: "manual_error_logging_test" },
          },
        });
        return Response.json(res);
      },
    },
  },
});