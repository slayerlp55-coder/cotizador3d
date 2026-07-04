import { PrismaClient, MaterialType, OrderType, OrderStatus, InvoiceStatus } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@taller3d.local";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "admin1234";

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Administrador",
      email: adminEmail,
      passwordHash,
    },
  });

  const materials = await Promise.all(
    [
      { name: "PLA Negro 1kg", type: MaterialType.FILAMENTO, unit: "g", stock: 5000, minStock: 500, costPerUnit: 0.02 },
      { name: "PLA Blanco 1kg", type: MaterialType.FILAMENTO, unit: "g", stock: 3000, minStock: 500, costPerUnit: 0.02 },
      { name: "Resina Estándar", type: MaterialType.RESINA, unit: "ml", stock: 2000, minStock: 300, costPerUnit: 0.05 },
      { name: "MDF 3mm 60x40", type: MaterialType.LAMINA_LASER, unit: "hoja", stock: 20, minStock: 5, costPerUnit: 45 },
      { name: "Acrílico 3mm transparente", type: MaterialType.LAMINA_LASER, unit: "hoja", stock: 10, minStock: 3, costPerUnit: 80 },
    ].map((m) =>
      prisma.material.upsert({
        where: { id: m.name },
        update: {},
        create: { id: m.name, ...m },
      })
    )
  );

  const client1 = await prisma.client.upsert({
    where: { id: "cliente-demo-1" },
    update: {},
    create: {
      id: "cliente-demo-1",
      name: "Juan Pérez",
      phone: "555-1234",
      email: "juan@example.com",
      address: "Calle Falsa 123",
    },
  });

  const client2 = await prisma.client.upsert({
    where: { id: "cliente-demo-2" },
    update: {},
    create: {
      id: "cliente-demo-2",
      name: "Estudio Creativo SA",
      phone: "555-5678",
      email: "contacto@estudiocreativo.com",
      address: "Av. Siempre Viva 742",
    },
  });

  const order = await prisma.order.upsert({
    where: { code: "PED-0001" },
    update: {},
    create: {
      code: "PED-0001",
      clientId: client1.id,
      type: OrderType.IMPRESION_3D,
      status: OrderStatus.EN_PRODUCCION,
      description: "Figura decorativa personalizada x3",
      laborCost: 150,
      items: {
        create: [
          { materialId: materials[0].id, quantity: 250, unitCost: 0.02 },
        ],
      },
    },
  });

  await prisma.invoice.upsert({
    where: { number: "FAC-0001" },
    update: {},
    create: {
      number: "FAC-0001",
      orderId: order.id,
      amount: 205,
      status: InvoiceStatus.PENDIENTE,
    },
  });

  console.log("Seed completado.");
  console.log(`Usuario admin: ${adminEmail} / contraseña: ${adminPassword}`);
  console.log(`Cliente demo 2 disponible: ${client2.name}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
