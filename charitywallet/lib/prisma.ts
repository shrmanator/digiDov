import { PrismaClient } from "@prisma/client";

declare global {
  // This prevents creating multiple instances of PrismaClient during development
  // because Next.js hot-reloads modules.
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV === "development") {
  global.prisma = prisma;
}

export default prisma;
