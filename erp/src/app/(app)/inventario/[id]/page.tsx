import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import MaterialForm from "../MaterialForm";
import { updateMaterialAction, deleteMaterialAction } from "../actions";

export default async function MaterialDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const material = await prisma.material.findUnique({ where: { id } });
  if (!material) notFound();

  const updateWithId = updateMaterialAction.bind(null, material.id);
  const deleteWithId = deleteMaterialAction.bind(null, material.id);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">
          {material.name}
        </h1>
        <form action={deleteWithId}>
          <button
            type="submit"
            className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Eliminar material
          </button>
        </form>
      </div>
      <div className="mt-6">
        <MaterialForm
          action={updateWithId}
          defaultValues={material}
          submitLabel="Guardar cambios"
        />
      </div>
    </div>
  );
}
