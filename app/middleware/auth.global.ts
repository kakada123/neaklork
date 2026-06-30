const publicAuthPaths = new Set(["/login", "/signup"]);

function getSafeRedirectTarget(value: unknown) {
  if (typeof value !== "string" || !value.startsWith("/")) {
    return "/";
  }

  if (publicAuthPaths.has(value)) {
    return "/";
  }

  return value;
}

export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === "/app" || to.path.startsWith("/app/")) {
    return;
  }

  const { user, isReady, fetchMe } = useAuth();
  const isPublicAuthRoute = publicAuthPaths.has(to.path);

  if (!isReady.value) {
    await fetchMe();
  }

  if (isPublicAuthRoute) {
    if (user.value) {
      return navigateTo(getSafeRedirectTarget(to.query.redirect));
    }

    return;
  }

  if (!user.value) {
    return navigateTo({
      path: "/login",
      query: {
        redirect: to.fullPath,
      },
    });
  }
});
