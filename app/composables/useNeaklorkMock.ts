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

const shop = {
  name: "Kakada Shop",
  id: "#10203",
  owner: "Owner",
};

const orders: Order[] = [
  {
    id: "1023",
    customerName: "Sara Jones",
    customerPhone: "02 345 6789",
    customerInitials: "SJ",
    productSummary: "Sunglasses x2",
    amount: "$120.00",
    timeAgo: "2m ago",
    status: "new",
    statusLabel: "New",
    paymentStatus: "unpaid",
    paymentLabel: "Unpaid",
  },
  {
    id: "1024",
    customerName: "Bessie Baker",
    customerPhone: "07 812 3456",
    customerInitials: "BB",
    productSummary: "Laptop x1",
    amount: "$56.50",
    timeAgo: "15m ago",
    status: "confirmed",
    statusLabel: "Easy",
    paymentStatus: "paid",
    paymentLabel: "Paid",
  },
  {
    id: "1025",
    customerName: "Leslie Alexander",
    customerPhone: "06 978 6543",
    customerInitials: "LA",
    productSummary: "Watch Set x1",
    amount: "$160.00",
    timeAgo: "28m ago",
    status: "confirmed",
    statusLabel: "Easy",
    paymentStatus: "unpaid",
    paymentLabel: "Unpaid",
  },
  {
    id: "1026",
    customerName: "Guy Hawkins",
    customerPhone: "01 234 5678",
    customerInitials: "GH",
    productSummary: "Shoes x1",
    amount: "$220.00",
    timeAgo: "45m ago",
    status: "packing",
    statusLabel: "Create",
    paymentStatus: "paypal",
    paymentLabel: "Paypal",
  },
];

const customers: Customer[] = [
  {
    name: "Dora",
    phone: "02 345 6789",
    totalOrders: 22,
    totalSpent: "$345.60",
  },
  {
    name: "Seng Mons",
    phone: "07 812 3456",
    totalOrders: 18,
    totalSpent: "$289.50",
  },
  {
    name: "Bora",
    phone: "06 978 6543",
    totalOrders: 12,
    totalSpent: "$187.20",
  },
  {
    name: "Chantha",
    phone: "01 234 5678",
    totalOrders: 24,
    totalSpent: "$610.75",
  },
  {
    name: "Vichea",
    phone: "09 978 5432",
    totalOrders: 16,
    totalSpent: "$412.30",
  },
  { name: "Mey", phone: "01 123 4567", totalOrders: 15, totalSpent: "$368.25" },
];

const actionItems = [
  {
    label: "New orders",
    count: 3,
    icon: "need_action_new_orders",
  },
  {
    label: "Need payment",
    count: 2,
    icon: "need_action_need_payment",
  },
  {
    label: "Need delivery",
    count: 4,
    icon: "need_action_need_delivery",
  },
  {
    label: "Problem orders",
    count: 1,
    icon: "need_action_problem_orders",
  },
];

const statusTabs = [
  { label: "New", count: 5 },
  { label: "Confirmed", count: 3 },
  { label: "Packing", count: 8 },
  { label: "Delivering", count: 6 },
  { label: "Paid" },
  { label: "Problem" },
];

const statusOptions = [
  { key: "new", label: "New", icon: "status_new" },
  { key: "confirmed", label: "Confirmed", icon: "status_confirmed" },
  { key: "packing", label: "Packing", icon: "status_packing" },
  { key: "delivering", label: "Delivering", icon: "status_delivering" },
  { key: "paid", label: "Paid", icon: "status_paid" },
  { key: "problem", label: "Problem", icon: "status_problem" },
];

const topProducts = [
  { name: "Sneakers", amount: "$56.00" },
  { name: "T-Shirt", amount: "$32.00" },
  { name: "Laptop", amount: "$120.00" },
  { name: "Lipstick", amount: "$10.00" },
  { name: "Watch", amount: "$40.00" },
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

export function useNeaklorkMock() {
  return {
    shop,
    orders,
    customers,
    actionItems,
    statusTabs,
    statusOptions,
    topProducts,
    reminderTemplates,
  };
}
