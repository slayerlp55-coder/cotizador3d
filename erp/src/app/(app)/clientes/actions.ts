"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

function readClientForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  return {
    name,
    phone: phone || null,
    email: email || null,
    address: address || null,
    notes: notes || null,
  };
}

export async function createClientAction(formData: FormData) {
  const data = readClientForm(formData);
  if (!data.name) {
    throw new Error("El nombre del cliente es obligatorio.");
  }
  await prisma.client.create({ data });
  revalidatePath("/clientes");
  redirect("/clientes");
}

export async function updateClientAction(id: string, formData: FormData) {
  const data = readClientForm(formData);
  if (!data.name) {
    throw new Error("El nombre del cliente es obligatorio.");
  }
  await prisma.client.update({ where: { id }, data });
  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
  redirect("/clientes");
}

export async function deleteClientAction(id: string) {
  const orderCount = await prisma.order.count({ where: { clientId: id } });
  if (orderCount > 0) {
    throw new Error(
      "No se puede eliminar un cliente con pedidos registrados."
    );
  }
  await prisma.client.delete({ where: { id } });
  revalidatePath("/clientes");
  redirect("/clientes");
}
