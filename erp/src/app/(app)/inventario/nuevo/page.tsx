import MaterialForm from "../MaterialForm";
import { createMaterialAction } from "../actions";

export default function NuevoMaterialPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Nuevo material</h1>
      <div className="mt-6">
        <MaterialForm action={createMaterialAction} submitLabel="Crear material" />
      </div>
    </div>
  );
}
