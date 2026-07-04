import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  INVOICE_STATUS_LABELS,
  INVOICE_STATUS_COLORS,
  PAYMENT_METHOD_LABELS,
  formatCurrency,
  formatDate,
} from "@/lib/labels";
import { InvoiceStatus, PaymentMethod } from "@/generated/prisma/client";
import {
  registerPaymentAction,
  cancelInvoiceAction,
  markInvoiceOverdueAction,
} from "../actions";

export default async function FacturaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      order: { include: { client: true } },
      payments: { orderBy: { paidAt: "desc" } },
    },
  });

  if (!invoice) notFound();

  const totalPaid = invoice.payments.reduce((s, p) => s + p.amount, 0);
  const balance = Math.max(0, invoice.amount - totalPaid);
  const registerPaymentWithId = registerPaymentAction.bind(null, invoice.id);
  const cancelWithId = cancelInvoiceAction.bind(null, invoice.id);
  const markOverdueWithId = markInvoiceOverdueAction.bind(null, invoice.id);
  const isClosed =
    invoice.status === InvoiceStatus.CANCELADA ||
    invoice.status === InvoiceStatus.PAGADA;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {invoice.number}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Cliente:{" "}
            <Link
              href={`/clientes/${invoice.order.client.id}`}
              className="font-medium text-slate-700 hover:underline"
            >
              {invoice.order.client.name}
            </Link>
            {" · Pedido "}
            <Link
              href={`/pedidos/${invoice.order.id}`}
              className="font-medium text-slate-700 hover:underline"
            >
              {invoice.order.code}
            </Link>
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${INVOICE_STATUS_COLORS[invoice.status]}`}
        >
          {INVOICE_STATUS_LABELS[invoice.status]}
        </span>
      </div>

      <div className="flex flex-wrap gap-8 text-sm">
        <div>
          <p className="text-slate-500">Monto total</p>
          <p className="text-lg font-semibold text-slate-900">
            {formatCurrency(invoice.amount)}
          </p>
        </div>
        <div>
          <p className="text-slate-500">Pagado</p>
          <p className="text-lg font-semibold text-slate-900">
            {formatCurrency(totalPaid)}
          </p>
        </div>
        <div>
          <p className="text-slate-500">Saldo pendiente</p>
          <p className="text-lg font-semibold text-slate-900">
            {formatCurrency(balance)}
          </p>
        </div>
        <div>
          <p className="text-slate-500">Emisión</p>
          <p className="text-lg font-semibold text-slate-900">
            {formatDate(invoice.issueDate)}
          </p>
        </div>
        {invoice.dueDate && (
          <div>
            <p className="text-slate-500">Vence</p>
            <p className="text-lg font-semibold text-slate-900">
              {formatDate(invoice.dueDate)}
            </p>
          </div>
        )}
      </div>

      {!isClosed && (
        <div className="flex gap-3">
          <form action={markOverdueWithId}>
            <button
              type="submit"
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Marcar como vencida
            </button>
          </form>
          <form action={cancelWithId}>
            <button
              type="submit"
              className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Cancelar factura
            </button>
          </form>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-slate-900">Pagos</h2>
        <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Monto</th>
                <th className="px-4 py-3">Método</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-4 py-3 text-slate-600">
                    {formatDate(payment.paidAt)}
                  </td>
                  <td className="px-4 py-3 text-slate-900">
                    {formatCurrency(payment.amount)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {PAYMENT_METHOD_LABELS[payment.method]}
                  </td>
                </tr>
              ))}
              {invoice.payments.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-slate-400">
                    Todavía no se han registrado pagos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!isClosed && balance > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Registrar pago
          </h2>
          <form
            action={registerPaymentWithId}
            className="mt-3 flex flex-wrap items-end gap-3"
          >
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Monto
              </label>
              <input
                type="number"
                step="any"
                min="0"
                name="amount"
                defaultValue={balance.toFixed(2)}
                className="w-40 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Método
              </label>
              <select
                name="method"
                defaultValue={PaymentMethod.EFECTIVO}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              >
                {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              Registrar pago
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
