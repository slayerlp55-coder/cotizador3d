"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { InvoiceStatus, PaymentMethod } from "@/generated/prisma/client";

async function nextInvoiceNumber() {
  const count = await prisma.invoice.count();
  return `FAC-${String(count + 1).padStart(4, "0")}`;
}

export async function createInvoiceAction(formData: FormData) {
  const orderId = String(formData.get("orderId") ?? "");
  const amount = Number(formData.get("amount") ?? 0);
  const dueDateRaw = String(formData.get("dueDate") ?? "");

  if (!orderId) throw new Error("Selecciona un pedido.");
  if (amount <= 0) throw new Error("El monto debe ser mayor a cero.");

  const number = await nextInvoiceNumber();
  const invoice = await prisma.invoice.create({
    data: {
      number,
      orderId,
      amount,
      dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
    },
  });

  revalidatePath("/facturacion");
  revalidatePath(`/pedidos/${orderId}`);
  redirect(`/facturacion/${invoice.id}`);
}

export async function registerPaymentAction(
  invoiceId: string,
  formData: FormData
) {
  const amount = Number(formData.get("amount") ?? 0);
  const method = String(formData.get("method") ?? "") as PaymentMethod;
  if (amount <= 0) throw new Error("El monto del pago debe ser mayor a cero.");

  await prisma.$transaction(async (tx) => {
    await tx.payment.create({
      data: { invoiceId, amount, method },
    });

    const invoice = await tx.invoice.findUniqueOrThrow({
      where: { id: invoiceId },
      include: { payments: true },
    });
    const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);

    if (totalPaid >= invoice.amount && invoice.status !== InvoiceStatus.CANCELADA) {
      await tx.invoice.update({
        where: { id: invoiceId },
        data: { status: InvoiceStatus.PAGADA },
      });
    }
  });

  revalidatePath(`/facturacion/${invoiceId}`);
  revalidatePath("/facturacion");
}

export async function cancelInvoiceAction(id: string) {
  await prisma.invoice.update({
    where: { id },
    data: { status: InvoiceStatus.CANCELADA },
  });
  revalidatePath("/facturacion");
  revalidatePath(`/facturacion/${id}`);
}

export async function markInvoiceOverdueAction(id: string) {
  await prisma.invoice.update({
    where: { id },
    data: { status: InvoiceStatus.VENCIDA },
  });
  revalidatePath("/facturacion");
  revalidatePath(`/facturacion/${id}`);
}
