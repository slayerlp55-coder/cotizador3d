"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MaterialType } from "@/generated/prisma/client";

function readMaterialForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "") as MaterialType;
  const unit = String(formData.get("unit") ?? "").trim();
  const stock = Number(formData.get("stock") ?? 0);
  const minStock = Number(formData.get("minStock") ?? 0);
  const costPerUnit = Number(formData.get("costPerUnit") ?? 0);
  return { name, type, unit, stock, minStock, costPerUnit };
}

export async function createMaterialAction(formData: FormData) {
  const data = readMaterialForm(formData);
  if (!data.name || !data.unit) {
    throw new Error("El nombre y la unidad son obligatorios.");
  }
  await prisma.material.create({ data });
  revalidatePath("/inventario");
  redirect("/inventario");
}

export async function updateMaterialAction(id: string, formData: FormData) {
  const data = readMaterialForm(formData);
  if (!data.name || !data.unit) {
    throw new Error("El nombre y la unidad son obligatorios.");
  }
  await prisma.material.update({ where: { id }, data });
  revalidatePath("/inventario");
  revalidatePath(`/inventario/${id}`);
  redirect("/inventario");
}

export async function deleteMaterialAction(id: string) {
  const usageCount = await prisma.orderItem.count({ where: { materialId: id } });
  if (usageCount > 0) {
    throw new Error(
      "No se puede eliminar un material que ya fue usado en pedidos."
    );
  }
  await prisma.material.delete({ where: { id } });
  revalidatePath("/inventario");
  redirect("/inventario");
}

export async function adjustStockAction(id: string, formData: FormData) {
  const delta = Number(formData.get("delta") ?? 0);
  if (!delta) return;
  const material = await prisma.material.findUniqueOrThrow({ where: { id } });
  const newStock = Math.max(0, material.stock + delta);
  await prisma.material.update({ where: { id }, data: { stock: newStock } });
  revalidatePath("/inventario");
  revalidatePath(`/inventario/${id}`);
}
