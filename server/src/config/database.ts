import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.warn('⚠️  Server will continue without database (users won\'t persist)');
    console.warn('⚠️  Fix DATABASE_URL in .env to enable database features');
    // Don't crash the server - allow testing without database
    // process.exit(1); // Commented out to allow server to run
  }
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
}
