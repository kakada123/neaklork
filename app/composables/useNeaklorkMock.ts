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

const statusOptions = [
  { key: "new", label: "New", icon: "status_new" },
  { key: "confirmed", label: "Confirmed", icon: "status_confirmed" },
  { key: "packing", label: "Packing", icon: "status_packing" },
  { key: "delivering", label: "Delivering", icon: "status_delivering" },
  { key: "paid", label: "Paid", icon: "status_paid" },
  { key: "problem", label: "Problem", icon: "status_problem" },
];

const reminderTemplates = [
  {
    title: "Khmer reminder",
    message:
      "សួស្តីបង 🙏\nOrder របស់បងនៅមិនទាន់ទូទាត់ទេ។\nបងអាចផ្ញើ slip មកខ្ញុំបានណា។\nអរគុណច្រើន ❤️",
  },
  {
    title: "English reminder",
    message:
      "Hi 👋\n\nThis is a friendly reminder that payment for your order is due.\nPlease send it to the payment info.\nThank you! ❤️",
  },
];

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

const shop = {
  name: "Kakada Shop",
  id: "#10203",
  owner: "Owner",
};

const rawOrders: RawOrder[] = [
  {
    id: "1023",
    customerName: "Sara Jones",
    customerPhone: "02 345 6789",
    productSummary: "Sunglasses x2",
    amountValue: 120,
    minutesAgo: 2,
    status: "new",
    statusLabel: "New",
    paymentStatus: "unpaid",
    paymentLabel: "Unpaid",
  },
  {
    id: "1024",
    customerName: "Bessie Baker",
    customerPhone: "07 812 3456",
    productSummary: "Laptop x1",
    amountValue: 56.5,
    minutesAgo: 15,
    status: "confirmed",
    statusLabel: "Easy",
    paymentStatus: "paid",
    paymentLabel: "Paid",
  },
  {
    id: "1025",
    customerName: "Leslie Alexander",
    customerPhone: "06 978 6543",
    productSummary: "Watch Set x1",
    amountValue: 160,
    minutesAgo: 28,
    status: "confirmed",
    statusLabel: "Easy",
    paymentStatus: "unpaid",
    paymentLabel: "Unpaid",
  },
  {
    id: "1026",
    customerName: "Guy Hawkins",
    customerPhone: "01 234 5678",
    productSummary: "Shoes x1",
    amountValue: 220,
    minutesAgo: 45,
    status: "packing",
    statusLabel: "Create",
    paymentStatus: "paypal",
    paymentLabel: "Paypal",
  },
  {
    id: "1027",
    customerName: "Dora",
    customerPhone: "02 345 6789",
    productSummary: "Perfume x3",
    amountValue: 95,
    minutesAgo: 62,
    status: "delivering",
    statusLabel: "Delivering",
    paymentStatus: "paid",
    paymentLabel: "Paid",
  },
  {
    id: "1028",
    customerName: "Chantha",
    customerPhone: "01 234 5678",
    productSummary: "Backpack x1",
    amountValue: 74.25,
    minutesAgo: 88,
    status: "problem",
    statusLabel: "Problem",
    paymentStatus: "partial",
    paymentLabel: "Partial",
  },
];

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

export function useNeaklorkMock() {
  const orders = computed<Order[]>(() =>
    rawOrders.map((order) => ({
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
    const grouped = groupBy(rawOrders, (order) => order.customerPhone);

    return Array.from(grouped.values()).map((items) => {
      const firstItem = items[0];
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
        count: orderList.filter((order) => order.paymentStatus !== "paid").length,
        icon: "need_action_need_payment",
      },
      {
        label: "Need delivery",
        count: orderList.filter((order) => order.status === "delivering").length,
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

    return statusOptions.map((option) => {
      const count = orderList.filter((order) => order.status === option.key).length;

      return count > 0 ? { label: option.label, count } : { label: option.label };
    });
  });

  const topProducts = computed(() => {
    const grouped = groupBy(rawOrders, (order) => parseProductSummary(order.productSummary));

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
    const sales = rawOrders.reduce((sum, order) => sum + order.amountValue, 0);
    const unpaid = rawOrders
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
      delivering: orderList.filter((order) => order.status === "delivering").length,
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
