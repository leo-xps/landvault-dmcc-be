import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const res = await prisma.users.deleteMany({
    where: {
      email: {
        contains: 'guest',
      },
    },
  });

  console.log(`Deleted ${res.count} users`);
}

main();
