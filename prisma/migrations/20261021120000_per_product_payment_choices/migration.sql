-- Persist the payment preference independently for each product in an order.
ALTER TABLE "order_items"
ADD COLUMN "payment_choice" "PaymentChoice" NOT NULL DEFAULT 'full',
ADD COLUMN "installment_months" INTEGER NOT NULL DEFAULT 0;
