import { PrismaClient } from "@/generated/prisma"

const globalForPrisma = global as unknown as { 
    prisma: PrismaClient
}

const db = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

export default db