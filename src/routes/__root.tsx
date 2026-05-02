import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { I18nProvider } from "@/lib/i18n";
import { CartProvider } from "@/lib/cart";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <div className="text-display text-[140px] leading-none">404</div>
        <p className="text-eyebrow opacity-60 mt-4">Page introuvable</p>
        <Link to="/" className="inline-block mt-8 text-eyebrow border-b border-foreground pb-1 hover:opacity-60">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Taliani — Carry the elegance." },
      { name: "description", content: "Taliani — premium clothing house. Editorial garments, conceived in Tunisia, dressed for the world." },
      { property: "og:title", content: "Taliani — Carry the elegance." },
      { property: "og:description", content: "Premium clothing house. Editorial garments, conceived in Tunisia." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Inter+Tight:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&family=Noto+Naskh+Arabic:wght@400;500;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
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
  return (
    <I18nProvider>
      <CartProvider>
        <Outlet />
        <Toaster />
      </CartProvider>
    </I18nProvider>
  );
}
