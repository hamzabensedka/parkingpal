const { PrismaClient } = require('@prisma/client');

/**
 * Seeds one ACTIVE test spot in Toulouse.
 *
 * Usage:
 *   node scripts/seed-toulouse-spot.js
 */
async function main() {
  const prisma = new PrismaClient();

  const email = 'host.toulouse@parkingpal.dev';

  // 1) Ensure a host user exists (password is irrelevant for seed data)
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      userType: 'HOST',
      firstName: 'Test',
      lastName: 'Host',
      phone: '+33600000000',
    },
    create: {
      email,
      phone: '+33600000000',
      // bcrypt hash for "password" (but auth isn't needed for search)
      password: '$2b$10$Z9c8p0dK7g2fHn5nqOZt2uZ2Q0qf7mB7jz9q0qk2xqvHjvL3fTqQ2',
      firstName: 'Test',
      lastName: 'Host',
      userType: 'HOST',
      emailVerified: true,
      phoneVerified: true,
      idVerified: false,
    },
    select: { id: true, email: true },
  });

  // 2) Create one ACTIVE spot in Toulouse
  const spot = await prisma.spot.create({
    data: {
      hostId: user.id,
      title: 'Test Garage — Toulouse Centre',
      description:
        'Seeded test listing in Toulouse. Secure garage spot, easy access, great for testing search + detail screens.',
      address: 'Place du Capitole, 31000 Toulouse, France',
      city: 'Toulouse',
      postalCode: '31000',
      country: 'France',
      latitude: 43.604652, // Toulouse centre
      longitude: 1.444209,
      spotType: 'GARAGE',
      locationType: 'RESIDENTIAL',
      capacity: 1,
      vehicleSizes: ['COMPACT', 'SEDAN', 'SUV'],
      amenities: ['covered', 'lit', 'camera'],
      accessType: 'CODE',
      accessInstructions: 'Garage door code provided after booking. Park in spot #A12.',
      hourlyRate: 3.5,
      dailyRate: 18,
      weeklyRate: 90,
      monthlyRate: 250,
      houseRules: 'No loud music. Keep the area clean.',
      cancellationPolicy: 'FLEXIBLE',
      instantBook: true,
      minBookingMinutes: 60,
      advanceNoticeMinutes: 0,
      bookingWindowDays: 30,
      status: 'ACTIVE',
      rating: 4.9,
      reviewCount: 12,
      photos: {
        create: [
          {
            url: 'https://picsum.photos/seed/parkingpal-toulouse/800/600',
            caption: 'Test photo',
            sortOrder: 0,
            isPrimary: true,
          },
        ],
      },
      availability: {
        create: [
          // All week 00:00–23:59 (simple for testing)
          { dayOfWeek: 0, startTime: '00:00', endTime: '23:59', isAllDay: true },
          { dayOfWeek: 1, startTime: '00:00', endTime: '23:59', isAllDay: true },
          { dayOfWeek: 2, startTime: '00:00', endTime: '23:59', isAllDay: true },
          { dayOfWeek: 3, startTime: '00:00', endTime: '23:59', isAllDay: true },
          { dayOfWeek: 4, startTime: '00:00', endTime: '23:59', isAllDay: true },
          { dayOfWeek: 5, startTime: '00:00', endTime: '23:59', isAllDay: true },
          { dayOfWeek: 6, startTime: '00:00', endTime: '23:59', isAllDay: true },
        ],
      },
    },
    select: {
      id: true,
      title: true,
      city: true,
      latitude: true,
      longitude: true,
      status: true,
    },
  });

  console.log('Seeded user:', user.email);
  console.log('Seeded spot:', spot);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});

