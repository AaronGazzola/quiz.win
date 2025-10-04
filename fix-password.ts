import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function fixPassword() {
  const password = process.env.NEXT_PUBLIC_DEV_PASSWORD;

  if (!password) {
    console.error('NEXT_PUBLIC_DEV_PASSWORD not set');
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 10);

  const existing = await prisma.password.findFirst();

  if (existing) {
    await prisma.password.update({
      where: { id: existing.id },
      data: {
        hash,
        length: password.length,
      },
    });
    console.log('Password updated successfully');
  } else {
    await prisma.password.create({
      data: {
        hash,
        length: password.length,
      },
    });
    console.log('Password created successfully');
  }

  const verify = await bcrypt.compare(password, hash);
  console.log('Verification test:', verify);

  await prisma.$disconnect();
}

fixPassword();
