import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MATERIAL_TYPE_LABELS, formatCurrency } from "@/lib/labels";
import { adjustStockAction } from "./actions";

export default async function InventarioPage() {
  const materials = await prisma.material.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Inventario</h1>
        <Link
          href="/inventario/nuevo"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          + Nuevo material
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Material</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Costo/u</th>
              <th className="px-4 py-3">Ajuste rápido</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {materials.map((material) => {
              const lowStock = material.stock <= material.minStock;
              return (
                <tr key={material.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {material.name}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {MATERIAL_TYPE_LABELS[material.type]}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        lowStock
                          ? "rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800"
                          : "text-slate-700"
                      }
                    >
                      {material.stock} {material.unit}
                      {lowStock && " · stock bajo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatCurrency(material.costPerUnit)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <form
                        action={async (formData: FormData) => {
                          "use server";
                          await adjustStockAction(material.id, formData);
                        }}
                      >
                        <input type="hidden" name="delta" value="-1" />
                        <button
                          type="submit"
                          className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                        >
                          -1
                        </button>
                      </form>
                      <form
                        action={async (formData: FormData) => {
                          "use server";
                          await adjustStockAction(material.id, formData);
                        }}
                      >
                        <input type="hidden" name="delta" value="1" />
                        <button
                          type="submit"
                          className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                        >
                          +1
                        </button>
                      </form>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/inventario/${material.id}`}
                      className="text-sm font-medium text-slate-700 hover:underline"
                    >
                      Ver / editar
                    </Link>
                  </td>
                </tr>
              );
            })}
            {materials.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  Todavía no hay materiales registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
