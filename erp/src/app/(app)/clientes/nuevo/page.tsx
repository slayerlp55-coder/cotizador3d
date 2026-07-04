import ClientForm from "../ClientForm";
import { createClientAction } from "../actions";

export default function NuevoClientePage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Nuevo cliente</h1>
      <div className="mt-6">
        <ClientForm action={createClientAction} submitLabel="Crear cliente" />
      </div>
    </div>
  );
}
