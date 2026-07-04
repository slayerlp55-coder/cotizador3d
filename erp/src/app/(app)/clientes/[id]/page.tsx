import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  ORDER_TYPE_LABELS,
  formatDate,
} from "@/lib/labels";
import ClientForm from "../ClientForm";
import { updateClientAction, deleteClientAction } from "../actions";

export default async function ClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      orders: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!client) notFound();

  const updateWithId = updateClientAction.bind(null, client.id);
  const deleteWithId = deleteClientAction.bind(null, client.id);

  return (
    <div className="space-y-10">
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-900">
            {client.name}
          </h1>
          <form action={deleteWithId}>
            <button
              type="submit"
              className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Eliminar cliente
            </button>
          </form>
        </div>
        <div className="mt-6">
          <ClientForm
            action={updateWithId}
            defaultValues={client}
            submitLabel="Guardar cambios"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Pedidos</h2>
          <Link
            href={`/pedidos/nuevo?clientId=${client.id}`}
            className="text-sm font-medium text-slate-700 hover:underline"
          >
            + Nuevo pedido para este cliente
          </Link>
        </div>
        <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {client.orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {order.code}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {ORDER_TYPE_LABELS[order.type]}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${ORDER_STATUS_COLORS[order.status]}`}
                    >
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/pedidos/${order.id}`}
                      className="text-sm font-medium text-slate-700 hover:underline"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
              {client.orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    Este cliente todavía no tiene pedidos.
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
