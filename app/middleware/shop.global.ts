const publicShopSkipPaths = new Set(["/login", "/signup"]);
const shopSetupPath = "/shop/setup";

function getSafeShopRedirectTarget(value: unknown) {
  if (typeof value !== "string" || !value.startsWith("/")) {
    return "/";
  }

  if (publicShopSkipPaths.has(value) || value === shopSetupPath) {
    return "/";
  }

  return value;
}

export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === "/app" || to.path.startsWith("/app/")) {
    return;
  }

  if (publicShopSkipPaths.has(to.path)) {
    return;
  }

  const { user, isReady, fetchMe } = useAuth();

  if (!isReady.value) {
    await fetchMe();
  }

  if (!user.value) {
    return;
  }

  const { fetchShops, hasShop } = useShopFlow();

  try {
    await fetchShops(user.value.id);
  } catch {
    return;
  }

  if (!hasShop.value && to.path !== shopSetupPath) {
    return navigateTo(
      {
        path: shopSetupPath,
        query: {
          redirect: to.fullPath,
        },
      },
      { replace: true },
    );
  }

  if (hasShop.value && to.path === shopSetupPath) {
    return navigateTo(getSafeShopRedirectTarget(to.query.redirect), {
      replace: true,
    });
  }
});
