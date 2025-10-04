import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function test() {
  const password = await prisma.password.findFirst();
  if (!password) {
    console.log('No password found');
    process.exit(0);
  }

  console.log('Hash from DB:', password.hash.substring(0, 20) + '...');
  console.log('Hash length:', password.hash.length);
  console.log('Expected password length:', password.length);

  const testPassword = process.env.NEXT_PUBLIC_DEV_PASSWORD || 'test';
  console.log('Test password:', testPassword);
  console.log('Test password length:', testPassword.length);

  const result = await bcrypt.compare(testPassword, password.hash);
  console.log('Bcrypt compare result:', result);

  const newHash = await bcrypt.hash(testPassword, 10);
  console.log('New hash would be:', newHash.substring(0, 20) + '...');

  await prisma.$disconnect();
}

test();
