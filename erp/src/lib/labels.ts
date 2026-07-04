import {
  MaterialType,
  OrderType,
  OrderStatus,
  InvoiceStatus,
  PaymentMethod,
} from "@/generated/prisma/client";

export const MATERIAL_TYPE_LABELS: Record<MaterialType, string> = {
  FILAMENTO: "Filamento",
  RESINA: "Resina",
  LAMINA_LASER: "Lámina láser",
  OTRO: "Otro",
};

export const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  IMPRESION_3D: "Impresión 3D",
  CORTE_LASER: "Corte láser",
  GRABADO: "Grabado",
  MIXTO: "Mixto",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDIENTE: "Pendiente",
  EN_PRODUCCION: "En producción",
  LISTO: "Listo",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDIENTE: "bg-amber-100 text-amber-800",
  EN_PRODUCCION: "bg-blue-100 text-blue-800",
  LISTO: "bg-purple-100 text-purple-800",
  ENTREGADO: "bg-green-100 text-green-800",
  CANCELADO: "bg-slate-200 text-slate-600",
};

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  PENDIENTE: "Pendiente",
  PAGADA: "Pagada",
  VENCIDA: "Vencida",
  CANCELADA: "Cancelada",
};

export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  PENDIENTE: "bg-amber-100 text-amber-800",
  PAGADA: "bg-green-100 text-green-800",
  VENCIDA: "bg-red-100 text-red-800",
  CANCELADA: "bg-slate-200 text-slate-600",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  EFECTIVO: "Efectivo",
  TRANSFERENCIA: "Transferencia",
  TARJETA: "Tarjeta",
  OTRO: "Otro",
};

export function formatCurrency(amount: number) {
  return `$${new Intl.NumberFormat("es", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("es", {
    dateStyle: "medium",
  }).format(new Date(date));
}
