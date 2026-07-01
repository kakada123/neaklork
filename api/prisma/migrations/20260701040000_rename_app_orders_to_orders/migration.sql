ALTER TABLE "app_orders" RENAME TO "orders";

ALTER INDEX "app_orders_pkey" RENAME TO "orders_pkey";
ALTER INDEX "app_orders_orderNo_key" RENAME TO "orders_orderNo_key";
ALTER INDEX "app_orders_status_idx" RENAME TO "orders_status_idx";
ALTER INDEX "app_orders_paymentStatus_idx" RENAME TO "orders_paymentStatus_idx";
ALTER INDEX "app_orders_createdAt_idx" RENAME TO "orders_createdAt_idx";
ALTER INDEX "app_orders_shopId_idx" RENAME TO "orders_shopId_idx";

ALTER TABLE "orders" RENAME CONSTRAINT "app_orders_shopId_fkey" TO "orders_shopId_fkey";
