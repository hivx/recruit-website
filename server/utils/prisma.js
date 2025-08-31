// utils/prisma.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['error', 'warn'], // có thể thêm 'query' khi cần debug
});

module.exports = prisma;