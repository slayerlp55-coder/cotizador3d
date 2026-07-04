import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  ORDER_STATUS_LABELS,
  ORDER_TYPE_LABELS,
  INVOICE_STATUS_LABELS,
  INVOICE_STATUS_COLORS,
  formatCurrency,
  formatDate,
} from "@/lib/labels";
import { OrderStatus } from "@/generated/prisma/client";
import { updateOrderStatusAction, deleteOrderAction } from "../actions";

export default async function PedidoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      client: true,
      items: { include: { material: true } },
      invoices: true,
    },
  });

  if (!order) notFound();

  const materialsCost = order.items.reduce(
    (sum, item) => sum + item.quantity * item.unitCost,
    0
  );
  const total = materialsCost + order.laborCost;

  const updateStatusWithId = updateOrderStatusAction.bind(null, order.id);
  const deleteWithId = deleteOrderAction.bind(null, order.id);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {order.code}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Cliente:{" "}
            <Link href={`/clientes/${order.client.id}`} className="font-medium text-slate-700 hover:underline">
              {order.client.name}
            </Link>
            {" · "}
            {ORDER_TYPE_LABELS[order.type]}
          </p>
        </div>
        <form action={deleteWithId}>
          <button
            type="submit"
            className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Eliminar pedido
          </button>
        </form>
      </div>

      {order.description && (
        <p className="text-sm text-slate-700">{order.description}</p>
      )}

      <div className="flex flex-wrap gap-6 text-sm text-slate-600">
        <span>
          Entrega:{" "}
          {order.deliveryDate ? formatDate(order.deliveryDate) : "sin definir"}
        </span>
        <span>Creado: {formatDate(order.createdAt)}</span>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Estado
        </label>
        <form action={updateStatusWithId} className="flex items-center gap-3">
          <select
            name="status"
            defaultValue={order.status}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          >
            {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Actualizar estado
          </button>
        </form>
        {order.status !== OrderStatus.CANCELADO && (
          <p className="mt-1 text-xs text-slate-400">
            Al cancelar un pedido, los materiales usados se devuelven al inventario.
          </p>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900">Materiales usados</h2>
        <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Material</th>
                <th className="px-4 py-3">Cantidad</th>
                <th className="px-4 py-3">Costo/u</th>
                <th className="px-4 py-3">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 text-slate-900">
                    {item.material.name}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {item.quantity} {item.material.unit}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatCurrency(item.unitCost)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatCurrency(item.quantity * item.unitCost)}
                  </td>
                </tr>
              ))}
              {order.items.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                    Este pedido no usó materiales del inventario.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="max-w-xs space-y-1 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>Materiales</span>
          <span>{formatCurrency(materialsCost)}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Mano de obra</span>
          <span>{formatCurrency(order.laborCost)}</span>
        </div>
        <div className="flex justify-between border-t border-slate-200 pt-1 font-semibold text-slate-900">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Facturas</h2>
          {order.invoices.length === 0 && (
            <Link
              href={`/facturacion/nueva?orderId=${order.id}`}
              className="text-sm font-medium text-slate-700 hover:underline"
            >
              + Generar factura
            </Link>
          )}
        </div>
        <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Número</th>
                <th className="px-4 py-3">Monto</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {order.invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {invoice.number}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatCurrency(invoice.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${INVOICE_STATUS_COLORS[invoice.status]}`}
                    >
                      {INVOICE_STATUS_LABELS[invoice.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/facturacion/${invoice.id}`}
                      className="text-sm font-medium text-slate-700 hover:underline"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
              {order.invoices.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                    Este pedido todavía no tiene facturas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
