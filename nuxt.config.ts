interface AppRoute {
  path: string;
  alias?: string | string[];
  children?: AppRoute[];
}

function stripAppPrefix(path: string) {
  if (path === "/app") {
    return "/";
  }

  return path.startsWith("/app/") ? path.slice(4) : path;
}

function addRouteAlias(route: AppRoute, alias: string) {
  const aliases = Array.isArray(route.alias)
    ? route.alias
    : route.alias
      ? [route.alias]
      : [];

  route.alias = Array.from(new Set([...aliases, alias]));
}

function exposeAppPagesAtRoot(routes: AppRoute[]) {
  for (const route of routes) {
    const originalPath = route.path;
    const cleanPath = stripAppPrefix(originalPath);

    if (cleanPath !== originalPath) {
      route.path = cleanPath;
      addRouteAlias(route, originalPath);
    }

    if (route.children) {
      exposeAppPagesAtRoot(route.children);
    }
  }
}

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },
  runtimeConfig: {
    apiBaseUrl: "http://localhost:3001",
    public: {
      googleClientId: "",
      facebookAppId: "",
      telegramBotName: "",
    },
  },
  css: [
    "primeicons/primeicons.css",
    "~/assets/scss/tailwind.scss",
    "~/assets/scss/main.scss",
  ],
  hooks: {
    "pages:extend"(pages) {
      exposeAppPagesAtRoot(pages);
    },
  },
  postcss: {
    plugins: {
      "@tailwindcss/postcss": {},
    },
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          loadPaths: ["node_modules"],
        },
      },
    },
  },
  app: {
    pageTransition: {
      name: "page-forward",
      mode: "out-in",
    },
    layoutTransition: {
      name: "layout-fade",
      mode: "out-in",
    },
    head: {
      title: "NeakLork",
      meta: [
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1, viewport-fit=cover",
        },
      ],
    },
  },
});
