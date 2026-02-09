const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    const spot = await prisma.spot.findFirst();
    console.log('spot.findFirst OK:', spot ? 'found row' : 'no rows');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('Smoke test failed:', e);
  process.exit(1);
});

