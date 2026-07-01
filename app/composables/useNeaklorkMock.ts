export type PaymentStatus = "unpaid" | "paid" | "partial" | "paypal";
export type OrderStatus =
  | "new"
  | "confirmed"
  | "packing"
  | "delivering"
  | "paid"
  | "problem";

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerInitials: string;
  productSummary: string;
  amount: string;
  timeAgo: string;
  status: OrderStatus;
  statusLabel: string;
  paymentStatus: PaymentStatus;
  paymentLabel: string;
}

export interface Customer {
  name: string;
  phone: string;
  totalOrders: number;
  totalSpent: string;
}

interface AppSeedData {
  shop: {
    name: string;
    id: string;
    owner: string;
  };
  rawOrders: RawOrder[];
  statusOptions: Array<{
    key: OrderStatus;
    label: string;
    icon: string;
  }>;
  reminderTemplates: Array<{
    title: string;
    message: string;
  }>;
}

const statusOptions = ref<AppSeedData["statusOptions"]>([]);

const reminderTemplates = ref<AppSeedData["reminderTemplates"]>([]);

interface RawOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  productSummary: string;
  amountValue: number;
  minutesAgo: number;
  status: OrderStatus;
  statusLabel: string;
  paymentStatus: PaymentStatus;
  paymentLabel: string;
}

const shop = reactive({
  name: "",
  id: "",
  owner: "",
});

const rawOrders = ref<RawOrder[]>([]);

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatRelativeMinutes(minutesAgo: number) {
  if (minutesAgo < 60) {
    return `${minutesAgo}m ago`;
  }

  const hours = Math.round(minutesAgo / 60);
  return `${hours}h ago`;
}

function deriveInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function parseProductSummary(summary: string) {
  const [label = summary] = summary.split(" x");
  return label;
}

function groupBy<T>(items: T[], keySelector: (item: T) => string) {
  const buckets = new Map<string, T[]>();

  for (const item of items) {
    const key = keySelector(item);
    const bucket = buckets.get(key) ?? [];
    bucket.push(item);
    buckets.set(key, bucket);
  }

  return buckets;
}

const emptyAppSeed: AppSeedData = {
  shop: {
    name: "",
    id: "",
    owner: "",
  },
  rawOrders: [],
  statusOptions: [],
  reminderTemplates: [],
};

const appSeed = useAsyncData<AppSeedData>(
  "neaklork-app-seed",
  () => $fetch<AppSeedData>("/api/app/data"),
  {
    server: false,
    default: () => emptyAppSeed,
  },
);

watchEffect(() => {
  const seed = appSeed.data.value;

  Object.assign(shop, seed.shop);
  rawOrders.value = seed.rawOrders;
  statusOptions.value = seed.statusOptions;
  reminderTemplates.value = seed.reminderTemplates;
});

export function useNeaklorkMock() {
  const orders = computed<Order[]>(() =>
    rawOrders.value.map((order) => ({
      id: order.id,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerInitials: deriveInitials(order.customerName),
      productSummary: order.productSummary,
      amount: formatMoney(order.amountValue),
      timeAgo: formatRelativeMinutes(order.minutesAgo),
      status: order.status,
      statusLabel: order.statusLabel,
      paymentStatus: order.paymentStatus,
      paymentLabel: order.paymentLabel,
    })),
  );

  const customers = computed<Customer[]>(() => {
    const grouped = groupBy(rawOrders.value, (order) => order.customerPhone);

    return Array.from(grouped.values()).map((items) => {
      const firstItem = items[0]!;
      const totalOrders = items.length;
      const totalSpent = items.reduce((sum, item) => sum + item.amountValue, 0);

      return {
        name: firstItem.customerName,
        phone: firstItem.customerPhone,
        totalOrders,
        totalSpent: formatMoney(totalSpent),
      };
    });
  });

  const actionItems = computed(() => {
    const orderList = orders.value;

    return [
      {
        label: "New orders",
        count: orderList.filter((order) => order.status === "new").length,
        icon: "need_action_new_orders",
      },
      {
        label: "Need payment",
        count: orderList.filter((order) => order.paymentStatus !== "paid")
          .length,
        icon: "need_action_need_payment",
      },
      {
        label: "Need delivery",
        count: orderList.filter((order) => order.status === "delivering")
          .length,
        icon: "need_action_need_delivery",
      },
      {
        label: "Problem orders",
        count: orderList.filter((order) => order.status === "problem").length,
        icon: "need_action_problem_orders",
      },
    ];
  });

  const statusTabs = computed(() => {
    const orderList = orders.value;

    return statusOptions.value.map((option) => {
      const count = orderList.filter(
        (order) => order.status === option.key,
      ).length;

      return count > 0
        ? { label: option.label, count }
        : { label: option.label };
    });
  });

  const topProducts = computed(() => {
    const grouped = groupBy(rawOrders.value, (order) =>
      parseProductSummary(order.productSummary),
    );

    return Array.from(grouped.entries())
      .map(([name, items]) => ({
        name,
        total: items.reduce((sum, item) => sum + item.amountValue, 0),
      }))
      .sort((left, right) => right.total - left.total)
      .slice(0, 5)
      .map((item) => ({
        name: item.name,
        amount: formatMoney(item.total),
      }));
  });

  const dashboardSummary = computed(() => {
    const orderList = orders.value;
    const sales = rawOrders.value.reduce(
      (sum, order) => sum + order.amountValue,
      0,
    );
    const unpaid = rawOrders.value
      .filter((order) => order.paymentStatus !== "paid")
      .reduce((sum, order) => sum + order.amountValue, 0);

    return {
      todayLabel: new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(new Date()),
      sales: formatMoney(sales),
      orders: orderList.length,
      unpaid: formatMoney(unpaid),
      delivering: orderList.filter((order) => order.status === "delivering")
        .length,
      recentOrder: orderList[0] ?? null,
    };
  });

  return {
    shop,
    orders,
    customers,
    actionItems,
    statusTabs,
    statusOptions,
    topProducts,
    reminderTemplates,
    dashboardSummary,
  };
}
