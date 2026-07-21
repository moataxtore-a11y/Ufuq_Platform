const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres'
const adapter = new PrismaPg({ connectionString })

const prisma = new PrismaClient({ adapter })

module.exports = { prisma }
