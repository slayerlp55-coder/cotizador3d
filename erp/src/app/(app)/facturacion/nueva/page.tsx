import { prisma } from "@/lib/prisma";
import { createInvoiceAction } from "../actions";

export default async function NuevaFacturaPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;
  const orders = await prisma.order.findMany({
    where: { invoices: { none: {} } },
    orderBy: { createdAt: "desc" },
    include: { client: true, items: true },
  });

  const orderTotals = new Map(
    orders.map((order) => [
      order.id,
      order.items.reduce((s, i) => s + i.quantity * i.unitCost, 0) + order.laborCost,
    ])
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Nueva factura</h1>
      <form action={createInvoiceAction} className="mt-6 max-w-lg space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Pedido *
          </label>
          <select
            name="orderId"
            required
            defaultValue={orderId ?? ""}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          >
            <option value="" disabled>
              Selecciona un pedido sin factura
            </option>
            {orders.map((order) => (
              <option key={order.id} value={order.id}>
                {order.code} · {order.client.name} · $
                {orderTotals.get(order.id)?.toFixed(2)}
              </option>
            ))}
          </select>
          {orders.length === 0 && (
            <p className="mt-2 text-sm text-slate-400">
              Todos los pedidos ya tienen una factura generada.
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Monto *
          </label>
          <input
            type="number"
            step="any"
            min="0"
            name="amount"
            required
            defaultValue={
              orderId ? orderTotals.get(orderId)?.toFixed(2) : undefined
            }
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Fecha de vencimiento
          </label>
          <input
            type="date"
            name="dueDate"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Generar factura
        </button>
      </form>
    </div>
  );
}
