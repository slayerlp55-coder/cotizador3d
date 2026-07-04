import { prisma } from "@/lib/prisma";
import { ORDER_TYPE_LABELS } from "@/lib/labels";
import { OrderType } from "@/generated/prisma/client";
import OrderItemsInput from "../OrderItemsInput";
import { createOrderAction } from "../actions";

export default async function NuevoPedidoPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const { clientId } = await searchParams;
  const [clients, materials] = await Promise.all([
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    prisma.material.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Nuevo pedido</h1>
      <form action={createOrderAction} className="mt-6 max-w-2xl space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Cliente *
            </label>
            <select
              name="clientId"
              required
              defaultValue={clientId ?? ""}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            >
              <option value="" disabled>
                Selecciona un cliente
              </option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Tipo de trabajo
            </label>
            <select
              name="type"
              defaultValue={OrderType.IMPRESION_3D}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            >
              {Object.entries(ORDER_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Descripción
          </label>
          <textarea
            name="description"
            rows={3}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            placeholder="Ej. Figura decorativa personalizada x3"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Fecha de entrega
            </label>
            <input
              type="date"
              name="deliveryDate"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Costo de mano de obra
            </label>
            <input
              type="number"
              step="any"
              min="0"
              name="laborCost"
              defaultValue={0}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
          </div>
        </div>

        <OrderItemsInput materials={materials} />

        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Crear pedido
        </button>
      </form>
    </div>
  );
}
