"use client";

import { useState } from "react";

type MaterialOption = {
  id: string;
  name: string;
  unit: string;
  stock: number;
};

export default function OrderItemsInput({
  materials,
}: {
  materials: MaterialOption[];
}) {
  const [rows, setRows] = useState<number[]>([0]);
  const [nextKey, setNextKey] = useState(1);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700">
        Materiales usados
      </label>
      {rows.map((rowKey) => (
        <div key={rowKey} className="flex items-center gap-3">
          <select
            name="materialId"
            defaultValue=""
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          >
            <option value="">— Sin material —</option>
            {materials.map((material) => (
              <option key={material.id} value={material.id}>
                {material.name} ({material.stock} {material.unit} disponibles)
              </option>
            ))}
          </select>
          <input
            type="number"
            step="any"
            min="0"
            name="quantity"
            defaultValue={0}
            placeholder="Cantidad"
            className="w-32 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
          <button
            type="button"
            onClick={() => setRows((r) => r.filter((k) => k !== rowKey))}
            className="rounded-md border border-slate-300 px-2 py-2 text-xs text-slate-500 hover:bg-slate-100"
            aria-label="Quitar material"
          >
            Quitar
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => {
          setRows((r) => [...r, nextKey]);
          setNextKey((k) => k + 1);
        }}
        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
      >
        + Agregar material
      </button>
    </div>
  );
}
