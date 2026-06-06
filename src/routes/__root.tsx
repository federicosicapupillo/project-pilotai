import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import iconAsset from "@/assets/ideapilot-mark.png.asset.json";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { reportError } from "@/lib/log-error";
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "@/components/ui/sonner";
import { captureUtmFromUrl } from "@/lib/tracking";
import { AppHeader } from "@/components/AppHeader";
import { HelpAiWidget } from "@/components/HelpAiWidget";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
    void reportError({
      action_name: "react_root_error_boundary",
      error,
      severity: "high",
    });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "IdeaPilot AI — Dalla tua idea alla tua prima app" },
      { name: "description", content: "IdeaPilot AI: il metodo per imprenditori e creator senza competenze tecniche. Scheda progetto, agenti AI, prompt operativi e roadmap." },
      { property: "og:title", content: "IdeaPilot AI — Dalla tua idea alla tua prima app" },
      { property: "og:description", content: "IdeaPilot AI: il metodo per imprenditori e creator senza competenze tecniche. Scheda progetto, agenti AI, prompt operativi e roadmap." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "IdeaPilot AI — Dalla tua idea alla tua prima app" },
      { name: "twitter:description", content: "IdeaPilot AI: il metodo per imprenditori e creator senza competenze tecniche. Scheda progetto, agenti AI, prompt operativi e roadmap." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/30ddb202-9067-4b6a-83cc-191cc7faea9a/id-preview-d35bf12d--b3a7a2a2-f2e9-453f-91df-a9741d019cd6.lovable.app-1780679064974.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/30ddb202-9067-4b6a-83cc-191cc7faea9a/id-preview-d35bf12d--b3a7a2a2-f2e9-453f-91df-a9741d019cd6.lovable.app-1780679064974.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", type: "image/png", href: iconAsset.url },
      { rel: "apple-touch-icon", href: iconAsset.url },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "IdeaPilot AI",
          url: "https://ideapilots.app",
          logo: "https://ideapilots.app/favicon.ico",
          description:
            "IdeaPilot AI è il metodo guidato per imprenditori e creator senza competenze tecniche: trasforma un'idea in app con scheda progetto, agenti AI, prompt operativi e roadmap.",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "IdeaPilot AI",
          url: "https://ideapilots.app",
          inLanguage: "it-IT",
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    captureUtmFromUrl();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      router.invalidate();
      queryClient.invalidateQueries();
    });
    // Global window error listeners → forward to centralized logger
    const onError = (ev: ErrorEvent) => {
      void reportError({
        action_name: "window_onerror",
        error: ev.error ?? ev.message,
        severity: "medium",
      });
    };
    const onRejection = (ev: PromiseRejectionEvent) => {
      void reportError({
        action_name: "unhandled_promise_rejection",
        error: ev.reason,
        severity: "medium",
      });
    };
    if (typeof window !== "undefined") {
      window.addEventListener("error", onError);
      window.addEventListener("unhandledrejection", onRejection);
    }
    return () => {
      subscription.unsubscribe();
      if (typeof window !== "undefined") {
        window.removeEventListener("error", onError);
        window.removeEventListener("unhandledrejection", onRejection);
      }
    };
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <AppHeader />
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <Toaster />
      <HelpAiWidget />
    </QueryClientProvider>
  );
}
