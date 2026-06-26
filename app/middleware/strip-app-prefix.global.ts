export default defineNuxtRouteMiddleware((to) => {
  if (to.path !== "/app" && !to.path.startsWith("/app/")) {
    return;
  }

  return navigateTo(
    {
      path: to.path === "/app" ? "/" : to.path.slice(4),
      query: to.query,
      hash: to.hash,
    },
    { replace: true },
  );
});
