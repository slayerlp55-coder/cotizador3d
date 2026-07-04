import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ClientesPage() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Clientes</h1>
        <Link
          href="/clientes/nuevo"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          + Nuevo cliente
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Teléfono</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Pedidos</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {client.name}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {client.phone ?? "—"}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {client.email ?? "—"}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {client._count.orders}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/clientes/${client.id}`}
                    className="text-sm font-medium text-slate-700 hover:text-slate-900 hover:underline"
                  >
                    Ver / editar
                  </Link>
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  Todavía no hay clientes registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
