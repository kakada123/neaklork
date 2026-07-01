-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('NEW', 'CONFIRMED', 'PACKING', 'DELIVERING', 'PAID', 'PROBLEM');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PAID', 'PARTIAL', 'PAYPAL');

-- CreateTable
CREATE TABLE "app_orders" (
    "id" TEXT NOT NULL,
    "orderNo" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "productSummary" TEXT NOT NULL,
    "amountValue" DECIMAL(10,2) NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'NEW',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "app_orders_orderNo_key" ON "app_orders"("orderNo");

-- CreateIndex
CREATE INDEX "app_orders_status_idx" ON "app_orders"("status");

-- CreateIndex
CREATE INDEX "app_orders_paymentStatus_idx" ON "app_orders"("paymentStatus");

-- CreateIndex
CREATE INDEX "app_orders_createdAt_idx" ON "app_orders"("createdAt");
