export default defineNuxtPlugin(() => {
  const router = useRouter();

  const routeStack: string[] = [normalizeRoutePath(router.currentRoute.value.fullPath)];

  router.beforeEach((to, from) => {
    const toPath = normalizeRoutePath(to.fullPath);
    const fromPath = normalizeRoutePath(from.fullPath);

    const toIndex = routeStack.lastIndexOf(toPath);
    const fromIndex = routeStack.lastIndexOf(fromPath);

    const isBack = toIndex !== -1 && fromIndex !== -1 && toIndex < fromIndex;

    to.meta.pageTransition = {
      name: isBack ? "page-back" : "page-forward",
      mode: "out-in",
    };
  });

  router.afterEach((to, from, failure) => {
    if (failure) {
      return;
    }

    const toPath = normalizeRoutePath(to.fullPath);
    const fromPath = normalizeRoutePath(from.fullPath);

    if (toPath === fromPath) {
      return;
    }

    const toIndex = routeStack.lastIndexOf(toPath);
    const fromIndex = routeStack.lastIndexOf(fromPath);

    const isBack = toIndex !== -1 && fromIndex !== -1 && toIndex < fromIndex;

    if (isBack) {
      routeStack.splice(toIndex + 1);
      return;
    }

    if (routeStack.at(-1) !== toPath) {
      routeStack.push(toPath);
    }
  });
});

function normalizeRoutePath(fullPath: string) {
  if (fullPath === "/app") {
    return "/";
  }

  if (fullPath.startsWith("/app?") || fullPath.startsWith("/app#")) {
    return `/${fullPath.slice(5)}`;
  }

  if (fullPath.startsWith("/app/")) {
    return fullPath.slice(4);
  }

  return fullPath;
}
