"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OrderType, OrderStatus } from "@/generated/prisma/client";

async function nextOrderCode() {
  const count = await prisma.order.count();
  return `PED-${String(count + 1).padStart(4, "0")}`;
}

export async function createOrderAction(formData: FormData) {
  const clientId = String(formData.get("clientId") ?? "");
  const type = String(formData.get("type") ?? "") as OrderType;
  const description = String(formData.get("description") ?? "").trim();
  const deliveryDateRaw = String(formData.get("deliveryDate") ?? "");
  const laborCost = Number(formData.get("laborCost") ?? 0);

  if (!clientId) throw new Error("Selecciona un cliente.");

  const materialIds = formData.getAll("materialId").map(String);
  const quantities = formData.getAll("quantity").map(Number);

  const items: { materialId: string; quantity: number }[] = [];
  materialIds.forEach((materialId, index) => {
    const quantity = quantities[index];
    if (materialId && quantity > 0) {
      items.push({ materialId, quantity });
    }
  });

  const order = await prisma.$transaction(async (tx) => {
    for (const item of items) {
      const material = await tx.material.findUniqueOrThrow({
        where: { id: item.materialId },
      });
      if (material.stock < item.quantity) {
        throw new Error(
          `No hay suficiente stock de "${material.name}" (disponible: ${material.stock} ${material.unit}).`
        );
      }
    }

    const code = await nextOrderCode();
    const created = await tx.order.create({
      data: {
        code,
        clientId,
        type,
        description: description || null,
        deliveryDate: deliveryDateRaw ? new Date(deliveryDateRaw) : null,
        laborCost,
        items: {
          create: await Promise.all(
            items.map(async (item) => {
              const material = await tx.material.findUniqueOrThrow({
                where: { id: item.materialId },
              });
              return {
                materialId: item.materialId,
                quantity: item.quantity,
                unitCost: material.costPerUnit,
              };
            })
          ),
        },
      },
    });

    for (const item of items) {
      await tx.material.update({
        where: { id: item.materialId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return created;
  });

  revalidatePath("/pedidos");
  revalidatePath("/inventario");
  revalidatePath(`/clientes/${clientId}`);
  redirect(`/pedidos/${order.id}`);
}

export async function updateOrderStatusAction(id: string, formData: FormData) {
  const status = String(formData.get("status") ?? "") as OrderStatus;
  const order = await prisma.order.findUniqueOrThrow({
    where: { id },
    include: { items: true },
  });

  if (status === OrderStatus.CANCELADO && order.status !== OrderStatus.CANCELADO) {
    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.material.update({
          where: { id: item.materialId },
          data: { stock: { increment: item.quantity } },
        });
      }
      await tx.order.update({ where: { id }, data: { status } });
    });
  } else {
    await prisma.order.update({ where: { id }, data: { status } });
  }

  revalidatePath("/pedidos");
  revalidatePath(`/pedidos/${id}`);
  revalidatePath("/inventario");
}

export async function deleteOrderAction(id: string) {
  const invoiceCount = await prisma.invoice.count({ where: { orderId: id } });
  if (invoiceCount > 0) {
    throw new Error("No se puede eliminar un pedido que ya tiene facturas.");
  }
  await prisma.order.delete({ where: { id } });
  revalidatePath("/pedidos");
  redirect("/pedidos");
}
