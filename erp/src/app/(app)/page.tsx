import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  formatCurrency,
} from "@/lib/labels";
import { InvoiceStatus, OrderStatus } from "@/generated/prisma/client";

export default async function DashboardPage() {
  const [
    clientCount,
    activeOrders,
    lowStockMaterials,
    openInvoices,
    recentOrders,
  ] = await Promise.all([
    prisma.client.count(),
    prisma.order.count({
      where: {
        status: { notIn: [OrderStatus.ENTREGADO, OrderStatus.CANCELADO] },
      },
    }),
    prisma.material.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.invoice.findMany({
      where: { status: { in: [InvoiceStatus.PENDIENTE, InvoiceStatus.VENCIDA] } },
      include: { payments: true },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { client: true },
    }),
  ]);

  const lowStock = lowStockMaterials.filter((m) => m.stock <= m.minStock);
  const amountDue = openInvoices.reduce((sum, invoice) => {
    const paid = invoice.payments.reduce((s, p) => s + p.amount, 0);
    return sum + Math.max(0, invoice.amount - paid);
  }, 0);

  const cards = [
    { label: "Clientes", value: clientCount, href: "/clientes" },
    { label: "Pedidos activos", value: activeOrders, href: "/pedidos" },
    {
      label: "Materiales con stock bajo",
      value: lowStock.length,
      href: "/inventario",
    },
    {
      label: "Por cobrar",
      value: formatCurrency(amountDue),
      href: "/facturacion",
    },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Resumen de tu taller de impresión 3D y corte/grabado láser.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-lg border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm"
          >
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {card.value}
            </p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Pedidos recientes
          </h2>
          <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/pedidos/${order.id}`}
                        className="font-medium text-slate-900 hover:underline"
                      >
                        {order.code}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {order.client.name}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${ORDER_STATUS_COLORS[order.status]}`}
                      >
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-slate-400">
                      Todavía no hay pedidos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Stock bajo
          </h2>
          <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Material</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Mínimo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lowStock.map((material) => (
                  <tr key={material.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/inventario/${material.id}`}
                        className="font-medium text-slate-900 hover:underline"
                      >
                        {material.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-red-700">
                      {material.stock} {material.unit}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {material.minStock} {material.unit}
                    </td>
                  </tr>
                ))}
                {lowStock.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-slate-400">
                      Todos los materiales tienen stock suficiente.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
