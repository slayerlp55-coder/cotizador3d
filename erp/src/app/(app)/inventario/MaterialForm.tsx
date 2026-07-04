import { MaterialType } from "@/generated/prisma/client";
import { MATERIAL_TYPE_LABELS } from "@/lib/labels";

type MaterialFormValues = {
  name?: string;
  type?: MaterialType;
  unit?: string;
  stock?: number;
  minStock?: number;
  costPerUnit?: number;
};

export default function MaterialForm({
  action,
  defaultValues,
  submitLabel = "Guardar",
}: {
  action: (formData: FormData) => void | Promise<void>;
  defaultValues?: MaterialFormValues;
  submitLabel?: string;
}) {
  return (
    <form action={action} className="max-w-xl space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Nombre *
        </label>
        <input
          name="name"
          required
          defaultValue={defaultValues?.name ?? ""}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          placeholder="PLA Negro 1kg"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Tipo
          </label>
          <select
            name="type"
            defaultValue={defaultValues?.type ?? MaterialType.FILAMENTO}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          >
            {Object.entries(MATERIAL_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Unidad *
          </label>
          <input
            name="unit"
            required
            defaultValue={defaultValues?.unit ?? ""}
            placeholder="g, ml, hoja, m2, unidad"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Stock actual
          </label>
          <input
            type="number"
            step="any"
            name="stock"
            defaultValue={defaultValues?.stock ?? 0}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Stock mínimo
          </label>
          <input
            type="number"
            step="any"
            name="minStock"
            defaultValue={defaultValues?.minStock ?? 0}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Costo por unidad
          </label>
          <input
            type="number"
            step="any"
            name="costPerUnit"
            defaultValue={defaultValues?.costPerUnit ?? 0}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
        </div>
      </div>
      <button
        type="submit"
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
      >
        {submitLabel}
      </button>
    </form>
  );
}
