import {PrismaClient} from "@prisma/client";

const globalForPrisma = globalThis;

globalForPrisma.prisma ??= new PrismaClient();

export const db = globalForPrisma.prisma;