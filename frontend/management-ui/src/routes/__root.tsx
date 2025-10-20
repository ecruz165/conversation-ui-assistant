/// <reference types="vite/client" />

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type * as React from "react";
import { DefaultCatchBoundary } from "~/components/DefaultCatchBoundary";
import { NotFound } from "~/components/NotFound";
import { startInstance, Test } from "~/start";
import appCss from "~/styles/app.css?url";
import { seo } from "~/utils/seo";

// Create QueryClient instance with optimized caching strategies
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes default
      gcTime: 1000 * 60 * 30, // 30 minutes - data kept in cache for offline use
      retry: 1,
      refetchOnWindowFocus: false, // Prevent unnecessary refetches on tab focus
      refetchOnReconnect: true, // Refetch on network reconnection
      refetchOnMount: false, // Use cached data on component mount if available
    },
    mutations: {
      retry: 1,
    },
  },
});

export const testServerMw = startInstance.createMiddleware().server(({ next, context }) => {
  context.fromFetch;
  //      ^?
  context.fromServerMw;
  //      ^?

  return next({
    context: {
      fromIndexServerMw: true,
    },
  });
});

export const testFnMw = startInstance
  .createMiddleware({ type: "function" })
  .middleware([testServerMw])
  .server(({ next, context }) => {
    context.fromFetch;
    //      ^?
    context.fromServerMw;
    //      ^?
    context.fromFnMw;
    //      ^?
    context.fromIndexServerMw;
    //      ^?

    return next({
      context: {
        fromIndexFnMw: true,
      },
    });
  });

export const testGetMiddleware = startInstance.createMiddleware().server(({ next, context }) => {
  return next({
    context: {
      fromGetMiddleware: true,
    },
  });
});

export const Route = createRootRoute({
  server: {
    middleware: [testServerMw],
    handlers: {
      GET: ({ context, next }) => {
        context.fromFetch;
        //      ^?
        context.fromServerMw;
        //      ^?
        context.fromIndexServerMw;
        //      ^?
        return next({
          context: {
            fromGet: true,
          },
        });
      },
      POST: ({ context, next }) => {
        context.fromFetch;
        context.fromServerMw;
        context.fromIndexServerMw;
        return next({
          context: {
            fromPost: true,
          },
        });
      },
    },
    // handlers: ({ createHandlers }) =>
    //   createHandlers({
    //     GET: {
    //       middleware: [testGetMiddleware],
    //       handler: ({ context, next }) => {
    //         context.fromFetch
    //         //      ^?
    //         context.fromServerMw
    //         //      ^?
    //         context.fromIndexServerMw
    //         //      ^?
    //         context.fromGetMiddleware
    //         //      ^?
    //         return next({
    //           context: {
    //             fromGet: true,
    //             fromPost: false,
    //           },
    //         })
    //       },
    //     },
    //     POST: {
    //       handler: ({ next }) => {
    //         return next({
    //           context: {
    //             fromGet: false,
    //             fromPost: true,
    //           },
    //         })
    //       },
    //     },
    //   }),
    test: (_test) => {},
  },
  beforeLoad: ({ serverContext }) => {
    serverContext?.fromFetch;
    //             ^?
    serverContext?.fromServerMw;
    //             ^?
    serverContext?.fromIndexServerMw;
    //             ^?
    serverContext?.fromGet;
    //             ^?
    return serverContext;
  },
  // ssr: false,
  loader: ({ context }) => {
    context?.fromFetch;
    //             ^?
    context?.fromServerMw;
    //             ^?
    context?.fromIndexServerMw;
    //             ^?
    context?.fromPost;
    //             ^?
    return new Test("test");
  },
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      ...seo({
        title: "TanStack Start | Type-Safe, Client-First, Full-Stack React Framework",
        description: `TanStack Start is a type-safe, client-first, full-stack React framework. `,
      }),
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      // Nunito Sans font from Google Fonts
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,opsz,wght@0,6..12,200..1000;1,6..12,200..1000&display=swap",
      },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png",
      },
      { rel: "manifest", href: "/site.webmanifest", color: "#fffff" },
      { rel: "icon", href: "/favicon.ico" },
    ],
    scripts: [
      {
        src: "/customScript.js",
        type: "text/javascript",
      },
    ],
  }),
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: () => <NotFound />,
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
          <TanStackRouterDevtools position="bottom-right" />
          <Scripts />
        </QueryClientProvider>
      </body>
    </html>
  );
}
