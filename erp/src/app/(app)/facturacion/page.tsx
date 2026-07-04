import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  INVOICE_STATUS_LABELS,
  INVOICE_STATUS_COLORS,
  formatCurrency,
  formatDate,
} from "@/lib/labels";

export default async function FacturacionPage() {
  const invoices = await prisma.invoice.findMany({
    orderBy: { issueDate: "desc" },
    include: { order: { include: { client: true } }, payments: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Facturación</h1>
        <Link
          href="/facturacion/nueva"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          + Nueva factura
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Número</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Pedido</th>
              <th className="px-4 py-3">Monto</th>
              <th className="px-4 py-3">Saldo</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Emisión</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoices.map((invoice) => {
              const paid = invoice.payments.reduce((s, p) => s + p.amount, 0);
              const balance = Math.max(0, invoice.amount - paid);
              return (
                <tr key={invoice.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {invoice.number}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {invoice.order.client.name}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {invoice.order.code}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatCurrency(invoice.amount)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatCurrency(balance)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${INVOICE_STATUS_COLORS[invoice.status]}`}
                    >
                      {INVOICE_STATUS_LABELS[invoice.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatDate(invoice.issueDate)}
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
              );
            })}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                  Todavía no hay facturas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
