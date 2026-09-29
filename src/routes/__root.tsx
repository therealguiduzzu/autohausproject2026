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
import { reportLovableError } from "../lib/lovable-error-reporting";
import CookieBanner from "../components/CookieBanner";
import WhatsAppButton from "../components/WhatsAppButton";
import { Toaster } from "@/components/ui/sonner";
import { SITE_URL } from "@/lib/site";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Seite nicht gefunden</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Die gesuchte Seite existiert nicht oder wurde verschoben.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Zur Startseite
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
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Diese Seite konnte nicht geladen werden
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Bei uns ist etwas schiefgelaufen. Bitte laden Sie die Seite neu oder kehren Sie zur Startseite zurück.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Erneut versuchen
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Zur Startseite
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
      { title: "Auto Semmel — Alfa Romeo · Fiat · Abarth in Langenselbold" },
      {
        name: "description",
        content:
          "Auto Semmel in Langenselbold — Ihr offizieller Stellantis-Partner für Alfa Romeo, Fiat, Abarth und Fiat Professional. Verkauf, Werkstatt, Ankauf.",
      },
      { name: "author", content: "Auto Semmel GmbH & Co. Siegfried Polenz KG" },
      { name: "theme-color", content: "#B90E0A" },
      { property: "og:site_name", content: "Auto Semmel" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "de_DE" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "stylesheet", href: "/fonts/fonts.css" },
      {
        rel: "preload",
        href: "/fonts/inter-tight-400-latin.woff2",
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AutoDealer",
          name: "Auto Semmel GmbH & Co. Siegfried Polenz KG",
          url: SITE_URL,
          telephone: "+49 6184 2633",
          email: "info@auto-semmel.de",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Gelnhäuser Straße 40",
            postalCode: "63505",
            addressLocality: "Langenselbold",
            addressRegion: "Hessen",
            addressCountry: "DE",
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: 50.1763,
            longitude: 9.0339,
          },
          brand: [
            { "@type": "Brand", name: "Alfa Romeo" },
            { "@type": "Brand", name: "Fiat" },
            { "@type": "Brand", name: "Abarth" },
            { "@type": "Brand", name: "Fiat Professional" },
          ],
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              opens: "07:30",
              closes: "17:30",
            },
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: "Saturday",
              opens: "09:00",
              closes: "14:00",
            },
          ],
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
    <html lang="de">
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
    // Expose the QueryClient to imperative stores so they can invalidate
    // queries from outside React render scope.
    import("../lib/query-client-ref").then(({ setQueryClient }) => setQueryClient(queryClient));

    // Wire Supabase auth-state changes to router + query invalidation.
    import("../integrations/supabase/client").then(({ supabase }) => {
      const { data } = supabase.auth.onAuthStateChange((event) => {
        if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
        router.invalidate();
        if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
      });
      // store unsubscribe on the cleanup-less effect via window for HMR
      (window as unknown as { __asAuthSub?: { unsubscribe: () => void } }).__asAuthSub?.unsubscribe();
      (window as unknown as { __asAuthSub?: { unsubscribe: () => void } }).__asAuthSub =
        data.subscription;
    });
  }, [queryClient, router]);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <WhatsAppButton />
      <CookieBanner />
      <Toaster position="top-right" richColors closeButton />
    </QueryClientProvider>
  );
}
