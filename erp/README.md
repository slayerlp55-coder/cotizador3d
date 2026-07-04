# Taller 3D ERP

ERP interno para un taller de impresión 3D y corte/grabado láser. Construido con Next.js (App Router), Prisma + SQLite y Tailwind CSS.

## Módulos

- **Clientes**: alta, edición y borrado de clientes, con historial de pedidos.
- **Inventario**: materiales (filamento, resina, láminas láser, etc.), stock, stock mínimo y costo por unidad.
- **Pedidos**: alta de pedidos por cliente, consumo de materiales del inventario, estados (pendiente, en producción, listo, entregado, cancelado). Al cancelar un pedido, los materiales usados se devuelven automáticamente al inventario.
- **Facturación**: generación de facturas a partir de un pedido, registro de pagos (parciales o totales) y marcado automático como pagada al cubrir el monto.

El acceso es solo para uso interno: hay un login simple con usuario y contraseña, sin registro público.

## Requisitos

- Node.js 20+

## Puesta en marcha

```bash
npm install
cp .env .env.local   # opcional, o edita .env directamente
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). El seed crea un usuario administrador de ejemplo:

- **Correo**: el valor de `SEED_ADMIN_EMAIL` en `.env` (por defecto `admin@taller3d.local`)
- **Contraseña**: el valor de `SEED_ADMIN_PASSWORD` en `.env` (por defecto `admin1234`)

Cámbialos en `.env` antes de sembrar la base de datos en un entorno real, y genera tu propio `SESSION_SECRET` con:

```bash
openssl rand -hex 32
```

## Base de datos

Usa SQLite por defecto (`prisma/schema.prisma`, archivo `dev.db` en la raíz del proyecto), ideal para desarrollo o un taller pequeño con un solo servidor. Para producción con múltiples usuarios concurrentes, se recomienda migrar el `datasource` a PostgreSQL y ajustar el adapter de Prisma (`@prisma/adapter-pg` en vez de `@prisma/adapter-better-sqlite3`).

## Scripts

- `npm run dev` — servidor de desarrollo
- `npm run build` — build de producción
- `npm run lint` — ESLint
- `npx prisma studio` — explorador visual de la base de datos
