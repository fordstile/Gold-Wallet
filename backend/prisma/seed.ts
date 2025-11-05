import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@goldwallet.com' },
    update: {},
    create: {
      email: 'admin@goldwallet.com',
      passwordHash: adminPassword,
      isAdmin: true,
      kycStatus: 'verified',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create initial gold pool
  const pool1 = await prisma.pool.upsert({
    where: { id: 'pool-1-initial' },
    update: {},
    create: {
      id: 'pool-1-initial',
      name: 'Pool 1 - 1kg 24k Gold',
      totalGrams: 1000.0,
      availableGrams: 1000.0,
      purity: '24k',
    },
  });
  console.log('✅ Initial pool created:', pool1.name);

  // Set initial prices (15,000 KES per gram buy, 14,500 KES per gram sell)
  const initialPrice = await prisma.price.create({
    data: {
      buyPricePerGram: 15000.0,
      sellPricePerGram: 14500.0,
      createdBy: admin.id,
    },
  });
  console.log('✅ Initial prices set:');
  console.log(`   Buy:  ${initialPrice.buyPricePerGram} KES/gram`);
  console.log(`   Sell: ${initialPrice.sellPricePerGram} KES/gram`);

  // Create a test user
  const testPassword = await bcrypt.hash('Test123!', 12);
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      passwordHash: testPassword,
      isAdmin: false,
      kycStatus: 'pending',
    },
  });
  console.log('✅ Test user created:', testUser.email);

  // Create user balance for test user
  await prisma.userBalance.upsert({
    where: { userId: testUser.id },
    update: {},
    create: {
      userId: testUser.id,
      grams: 0,
      lockedGrams: 0,
    },
  });
  console.log('✅ Test user balance initialized');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📝 Login credentials:');
  console.log('   Admin: admin@goldwallet.com / Admin123!');
  console.log('   Test User: test@example.com / Test123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

