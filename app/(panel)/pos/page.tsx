import { guard } from "@/lib/auth";
import { api } from "@/lib/api";
import { PosScreen } from "@/components/pos-screen";
import { PageHeader } from "@/components/ui";
import { money } from "@/lib/money";

export default async function PosPage() {
  await guard("pos.sell");
  const { held, customers } = await api("/api/desk/pos");
  return (
    <div>
      <PageHeader title="Point of sale" description="Hold a sale to reserve stock, or complete it to deduct batches and issue the invoice." />
      <PosScreen held={held.map((order) => ({ id: order.id, number: order.number, holdLabel: order.holdLabel, grandTotal: money(order.grandTotal) }))} customers={customers.map((customer) => ({ id: customer.id, name: customer.name, phone: customer.phone }))} />
    </div>
  );
}
