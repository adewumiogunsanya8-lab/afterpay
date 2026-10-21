import type { Instrumentation } from "next";

/**
 * Keep a searchable server-side record for production render failures. The
 * digest shown by Next's error screen can be matched to these route details in
 * the Vercel function logs without sending database errors to the browser.
 */
export const onRequestError: Instrumentation.onRequestError = (
  error,
  request,
  context,
) => {
  const digest =
    typeof error === "object" && error !== null && "digest" in error
      ? String(error.digest)
      : undefined;

  console.error("[next:request-error]", {
    digest,
    message: error instanceof Error ? error.message : String(error),
    method: request.method,
    path: request.path.split("?")[0],
    route: context.routePath,
    routeType: context.routeType,
    renderSource: context.renderSource,
  });
};
