import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create a default host user
  const hashedPassword = await bcrypt.hash('Host123!', 10);

  const host = await prisma.user.upsert({
    where: { email: 'host@parkingpal.com' },
    update: {},
    create: {
      email: 'host@parkingpal.com',
      password: hashedPassword,
      firstName: 'Jean',
      lastName: 'Dupont',
      userType: 'HOST',
      emailVerified: true,
      emailVerifiedAt: new Date(),
      isActive: true,
      isSuperhost: true,
      rating: 4.8,
      reviewCount: 15,
    },
  });

  console.log(`Created host user: ${host.email} (ID: ${host.id})`);

  // Create a default spot in Toulouse (Place du Capitole area)
  const spot = await prisma.spot.upsert({
    where: { id: 'toulouse-spot-001' },
    update: {},
    create: {
      id: 'toulouse-spot-001',
      hostId: host.id,
      title: 'Parking Sécurisé Centre Toulouse',
      description: 'Place de parking privée située à deux pas de la Place du Capitole. Idéal pour visiter le centre-ville de Toulouse. Accès facile et sécurisé 24h/24.',
      address: '15 Rue des Filatiers',
      city: 'Toulouse',
      postalCode: '31000',
      country: 'France',
      latitude: 43.6047,
      longitude: 1.4442,
      spotType: 'GARAGE',
      locationType: 'RESIDENTIAL',
      capacity: 1,
      vehicleSizes: ['COMPACT', 'SEDAN', 'SUV'],
      amenities: ['covered', 'lighting', 'security_camera', 'ev_charging'],
      accessType: 'CODE',
      accessInstructions: 'Entrez le code sur le digicode à gauche du portail. Le parking est au niveau -1, place numéro 12.',
      accessCode: '1234',
      spotLocation: 'Niveau -1, Place 12',
      hourlyRate: 3.5,
      dailyRate: 18,
      weeklyRate: 90,
      monthlyRate: 280,
      houseRules: 'Merci de respecter les horaires de silence entre 22h et 7h. Ne pas stationner en dehors de la place réservée.',
      cancellationPolicy: 'FLEXIBLE',
      instantBook: true,
      minBookingMinutes: 60,
      maxBookingMinutes: 10080, // 1 week max
      advanceNoticeMinutes: 60,
      bookingWindowDays: 60,
      status: 'ACTIVE',
      rating: 4.7,
      reviewCount: 23,
    },
  });

  console.log(`Created spot: ${spot.title} (ID: ${spot.id})`);

  // Add availability for the spot (available every day)
  const daysOfWeek = [0, 1, 2, 3, 4, 5, 6]; // Sunday to Saturday

  for (const dayOfWeek of daysOfWeek) {
    await prisma.spotAvailability.upsert({
      where: {
        id: `toulouse-spot-001-day-${dayOfWeek}`,
      },
      update: {},
      create: {
        id: `toulouse-spot-001-day-${dayOfWeek}`,
        spotId: spot.id,
        dayOfWeek,
        startTime: '00:00',
        endTime: '23:59',
        isAllDay: true,
      },
    });
  }

  console.log('Created availability schedule for the spot');

  // Create a default renter user for testing
  const renterPassword = await bcrypt.hash('Renter123!', 10);

  const renter = await prisma.user.upsert({
    where: { email: 'renter@parkingpal.com' },
    update: {},
    create: {
      email: 'renter@parkingpal.com',
      password: renterPassword,
      firstName: 'Marie',
      lastName: 'Martin',
      userType: 'RENTER',
      emailVerified: true,
      emailVerifiedAt: new Date(),
      isActive: true,
      rating: 4.9,
      reviewCount: 8,
    },
  });

  console.log(`Created renter user: ${renter.email} (ID: ${renter.id})`);

  // Add a vehicle for the renter
  await prisma.vehicle.upsert({
    where: { id: 'renter-vehicle-001' },
    update: {},
    create: {
      id: 'renter-vehicle-001',
      userId: renter.id,
      make: 'Peugeot',
      model: '308',
      licensePlate: 'AB-123-CD',
      color: 'Blue',
      type: 'SEDAN',
      year: 2021,
      isDefault: true,
    },
  });

  console.log('Created default vehicle for renter');

  console.log('\n=== Seed completed successfully! ===');
  console.log('\nTest accounts:');
  console.log('  Host: host@parkingpal.com / Host123!');
  console.log('  Renter: renter@parkingpal.com / Renter123!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
