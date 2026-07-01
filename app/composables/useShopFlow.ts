export interface ShopItem {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateShopPayload {
  name: string;
  description?: string;
}

export function useShopFlow() {
  const shops = useState<ShopItem[]>("shop-flow:shops", () => []);
  const loadedForUserId = useState<string | null>(
    "shop-flow:loaded-for-user-id",
    () => null,
  );

  const hasShop = computed(() => shops.value.length > 0);

  async function fetchShops(userId: string, options: { force?: boolean } = {}) {
    if (!options.force && loadedForUserId.value === userId) {
      return shops.value;
    }

    const response = await $fetch<ShopItem[]>("/api/shops");

    shops.value = response;
    loadedForUserId.value = userId;

    return response;
  }

  async function createShop(payload: CreateShopPayload, userId: string) {
    const shop = await $fetch<ShopItem>("/api/shops", {
      method: "POST",
      body: payload,
    });

    shops.value = [
      shop,
      ...shops.value.filter((item) => item.id !== shop.id),
    ];
    loadedForUserId.value = userId;

    await refreshNuxtData("neaklork-app-seed").catch(() => null);

    return shop;
  }

  return {
    shops,
    hasShop,
    fetchShops,
    createShop,
  };
}
