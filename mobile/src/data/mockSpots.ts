import { Spot, SpotType, AccessType, AmenityType, VehicleSize } from '../types';

// Generate availability for the next 30 days
const generateAvailability = (pattern: 'weekdays' | 'weekends' | 'all' | 'custom'): Record<string, { available: boolean; timeSlots?: string[] }> => {
  const availability: Record<string, { available: boolean; timeSlots?: string[] }> = {};
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    switch (pattern) {
      case 'weekdays':
        availability[dateStr] = {
          available: !isWeekend,
          timeSlots: !isWeekend ? ['09:00-18:00'] : undefined,
        };
        break;
      case 'weekends':
        availability[dateStr] = {
          available: isWeekend,
          timeSlots: isWeekend ? ['08:00-22:00'] : undefined,
        };
        break;
      case 'all':
        availability[dateStr] = {
          available: true,
          timeSlots: ['00:00-23:59'],
        };
        break;
      case 'custom':
        availability[dateStr] = {
          available: Math.random() > 0.2, // 80% available
          timeSlots: Math.random() > 0.5 ? ['09:00-18:00'] : ['08:00-22:00'],
        };
        break;
    }
  }

  return availability;
};

export const mockSpots: Spot[] = [
  {
    id: 'spot_1',
    hostId: 'user_3',
    title: 'Secure Garage near Capitole',
    description: 'Covered garage in quiet residential building, perfect for daily commuters or tourists. 2-minute walk to Capitole metro, 5 minutes to Place du Capitole. Safe neighborhood with 24/7 lighting. Easy in-and-out access.',
    address: '15 Rue du Taur, 31000 Toulouse',
    latitude: 43.6047,
    longitude: 1.4442,
    spotType: 'garage',
    hourlyRate: 6,
    dailyRate: 40,
    photos: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
      'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=600',
      'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=600',
    ],
    amenities: ['covered', 'lit', 'camera', 'gated'],
    vehicleSizes: ['compact', 'sedan', 'suv'],
    accessInstructions: 'Enter gate code 4523# at main entrance. Walk through courtyard, garage is on left. Park in spot B12 (marked). Lock gate behind you.',
    accessType: 'code',
    houseRules: '• No smoking\n• No loud music or idling\n• Must leave by 6 PM sharp\n• No in-and-out privileges during booking',
    availability: generateAvailability('weekdays'),
    rating: 4.9,
    reviewCount: 67,
    instantBook: true,
    createdAt: '2023-03-15T10:00:00Z',
    cancellationPolicy: 'flexible',
  },
  {
    id: 'spot_2',
    hostId: 'user_2',
    title: 'Driveway Near Saint-Sernin',
    description: 'Private driveway just 300m from the Basilica of Saint-Sernin. Perfect for tourists and museum visitors. Quiet residential street with easy access. Well-maintained space fits most vehicles.',
    address: '8 Rue du Taur, 31000 Toulouse',
    latitude: 43.6080,
    longitude: 1.4380,
    spotType: 'driveway',
    hourlyRate: 8,
    dailyRate: 55,
    photos: [
      'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=600',
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600',
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600',
    ],
    amenities: ['lit'],
    vehicleSizes: ['compact', 'sedan'],
    accessInstructions: 'Ring bell at number 8, I will open the gate. Park on the left side next to the blue door.',
    accessType: 'key',
    houseRules: '• Please be quiet when arriving/leaving\n• No parking on grass\n• Call 15min before arrival',
    availability: generateAvailability('all'),
    rating: 4.8,
    reviewCount: 42,
    instantBook: false,
    createdAt: '2023-09-25T14:30:00Z',
    cancellationPolicy: 'moderate',
  },
  {
    id: 'spot_3',
    hostId: 'user_8',
    title: 'Stadium Parking - Toulouse FC',
    description: 'Perfect parking spot for Stadium Toulousain! Only 200m walk to the stadium. Ideal for rugby matches, concerts, and events. Secure residential area.',
    address: '24 Allée Gabriel Biénès, 31400 Toulouse',
    latitude: 43.5820,
    longitude: 1.4340,
    spotType: 'street',
    hourlyRate: 10,
    dailyRate: 60,
    photos: [
      'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600',
      'https://images.unsplash.com/photo-1516475429286-465d815a0df7?w=600',
    ],
    amenities: ['lit'],
    vehicleSizes: ['compact', 'sedan', 'suv', 'van'],
    accessInstructions: 'Street parking in front of building 24. Text me when you arrive and I will show you the exact spot.',
    accessType: 'key',
    houseRules: '• Match day parking only during event times\n• No overnight parking\n• Must vacate 1 hour after match ends',
    availability: generateAvailability('custom'),
    rating: 4.9,
    reviewCount: 55,
    instantBook: true,
    createdAt: '2023-05-10T09:00:00Z',
    cancellationPolicy: 'strict',
  },
  {
    id: 'spot_4',
    hostId: 'user_5',
    title: 'Covered Parking Near Saint-Cyprien',
    description: 'Underground covered parking spot in a secure building. Close to Saint-Cyprien market, restaurants, and nightlife. 24/7 access available.',
    address: '12 Rue de la République, 31300 Toulouse',
    latitude: 43.5980,
    longitude: 1.4320,
    spotType: 'covered',
    hourlyRate: 5,
    dailyRate: 35,
    photos: [
      'https://images.unsplash.com/photo-1470224114660-3f6686c562eb?w=600',
      'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600',
      'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=600',
    ],
    amenities: ['covered', 'lit', 'camera', 'gated'],
    vehicleSizes: ['compact', 'sedan'],
    accessInstructions: 'Enter code 7890 at parking entrance. Take level -2, spot 45 is on the right.',
    accessType: 'code',
    houseRules: '• No car washing\n• No loud music\n• Max height 1.9m',
    availability: generateAvailability('all'),
    rating: 4.6,
    reviewCount: 23,
    instantBook: true,
    createdAt: '2024-01-25T16:00:00Z',
    cancellationPolicy: 'flexible',
  },
  {
    id: 'spot_5',
    hostId: 'user_6',
    title: 'Carmes Garage with EV Charging',
    description: 'Modern garage with EV charging station! Perfect for electric car owners visiting the Carmes market. 10-minute walk to Place du Capitole. Covered and secure.',
    address: '45 Rue des Filatiers, 31000 Toulouse',
    latitude: 43.6010,
    longitude: 1.4480,
    spotType: 'garage',
    hourlyRate: 7,
    dailyRate: 50,
    photos: [
      'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
      'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=600',
    ],
    amenities: ['covered', 'lit', 'ev_charging', 'gated'],
    vehicleSizes: ['compact', 'sedan', 'suv'],
    accessInstructions: 'Smart lock - download the Nuki app and I will grant you access. EV charger is on the wall, use at no extra charge.',
    accessType: 'smart_lock',
    houseRules: '• EV charging free during your stay\n• Please unplug when done charging\n• No gas-powered generator use',
    availability: generateAvailability('weekends'),
    rating: 4.8,
    reviewCount: 31,
    instantBook: false,
    createdAt: '2023-07-20T11:30:00Z',
    cancellationPolicy: 'moderate',
  },
  {
    id: 'spot_6',
    hostId: 'user_3',
    title: 'Quiet Spot in Saint-Pierre',
    description: 'Charming driveway in the heart of Saint-Pierre. Close to famous cafés, Garonne river, and Place Saint-Pierre. Very quiet street.',
    address: '28 Rue Saint-Pierre, 31000 Toulouse',
    latitude: 43.5970,
    longitude: 1.4400,
    spotType: 'driveway',
    hourlyRate: 9,
    dailyRate: 60,
    photos: [
      'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=600',
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600',
    ],
    amenities: ['lit'],
    vehicleSizes: ['compact', 'sedan'],
    accessInstructions: 'Call me when you arrive. The blue gate on the left side of building 28 - I will open it remotely.',
    accessType: 'key',
    availability: generateAvailability('all'),
    rating: 5.0,
    reviewCount: 18,
    instantBook: true,
    createdAt: '2024-06-10T08:00:00Z',
    cancellationPolicy: 'flexible',
  },
  {
    id: 'spot_7',
    hostId: 'user_2',
    title: 'Wilson District Private Garage',
    description: 'Secure private garage near Place Wilson. Great for theater-goers and Capitole shoppers. Spacious spot fits large vehicles.',
    address: '5 Rue du Rempart Saint-Étienne, 31000 Toulouse',
    latitude: 43.6060,
    longitude: 1.4420,
    spotType: 'garage',
    hourlyRate: 8,
    dailyRate: 55,
    photos: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
      'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=600',
    ],
    amenities: ['covered', 'lit', 'gated'],
    vehicleSizes: ['compact', 'sedan', 'suv', 'van'],
    accessInstructions: 'Gate code 2468. Enter garage, go straight to the end. Spot 3 on your right with "RESERVED" sign.',
    accessType: 'code',
    houseRules: '• No car repairs in garage\n• Lock garage door when leaving\n• No storage of items',
    availability: generateAvailability('weekdays'),
    rating: 4.7,
    reviewCount: 29,
    instantBook: true,
    createdAt: '2024-02-14T12:00:00Z',
    cancellationPolicy: 'moderate',
  },
  {
    id: 'spot_8',
    hostId: 'user_6',
    title: 'Capitole Nearby Parking',
    description: 'Walking distance to Place du Capitole! Residential driveway in quiet center. Perfect for tourists. Safe and well-lit area.',
    address: '10 Rue du Languedoc, 31000 Toulouse',
    latitude: 43.6030,
    longitude: 1.4360,
    spotType: 'driveway',
    hourlyRate: 10,
    dailyRate: 70,
    photos: [
      'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=600',
      'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600',
      'https://images.unsplash.com/photo-1522093007474-d86e9bf7ba6f?w=600',
    ],
    amenities: ['lit', 'camera'],
    vehicleSizes: ['compact', 'sedan', 'suv'],
    accessInstructions: 'Meet me at the entrance. I will show you the parking spot and give you a temporary remote control.',
    accessType: 'key',
    houseRules: '• Return remote when leaving\n• No honking - residential area\n• Park within marked lines',
    availability: generateAvailability('all'),
    rating: 4.5,
    reviewCount: 14,
    instantBook: false,
    createdAt: '2024-08-01T15:00:00Z',
    cancellationPolicy: 'strict',
  },
  {
    id: 'spot_9',
    hostId: 'user_5',
    title: 'Jean Jaurès Area Covered',
    description: 'Premium covered parking near Place Jean Jaurès. Underground, secure, and climate controlled. Walk to metro in 5 minutes.',
    address: '78 Allées Jean Jaurès, 31000 Toulouse',
    latitude: 43.6090,
    longitude: 1.4380,
    spotType: 'covered',
    hourlyRate: 12,
    dailyRate: 80,
    photos: [
      'https://images.unsplash.com/photo-1470224114660-3f6686c562eb?w=600',
      'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600',
    ],
    amenities: ['covered', 'lit', 'camera', 'gated', 'handicap'],
    vehicleSizes: ['compact', 'sedan', 'suv'],
    accessInstructions: 'Badge access - I will add your phone to the system. Download "ParisParking" app and follow instructions.',
    accessType: 'smart_lock',
    houseRules: '• Premium spot - please respect\n• No food/drink in parking area\n• Report any issues immediately',
    availability: generateAvailability('all'),
    rating: 4.8,
    reviewCount: 37,
    instantBook: true,
    createdAt: '2023-11-20T10:30:00Z',
    cancellationPolicy: 'moderate',
  },
  {
    id: 'spot_10',
    hostId: 'user_8',
    title: 'Stadium Toulousain Parking',
    description: 'Only 500m from Stadium Toulousain! Perfect for rugby, football, and concerts. Large spot fits any vehicle. Great for tailgating!',
    address: '2 Rue des Troènes, 31400 Toulouse',
    latitude: 43.5840,
    longitude: 1.4300,
    spotType: 'street',
    hourlyRate: 8,
    dailyRate: 45,
    photos: [
      'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600',
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600',
    ],
    amenities: ['lit'],
    vehicleSizes: ['compact', 'sedan', 'suv', 'van', 'motorcycle'],
    accessInstructions: 'Text me 30min before arrival. I will meet you on the corner of Rue Francis and Avenue du President Wilson.',
    accessType: 'key',
    houseRules: '• Event parking only\n• No overnight parking\n• Respect neighbors',
    availability: generateAvailability('custom'),
    rating: 4.7,
    reviewCount: 48,
    instantBook: true,
    createdAt: '2023-04-15T17:00:00Z',
    cancellationPolicy: 'strict',
  },
  {
    id: 'spot_11',
    hostId: 'user_3',
    title: 'Garonne Riverside Hidden Gem',
    description: 'Beautiful area along the Garonne. Trendy neighborhood with cafés and boutiques. Covered spot in residential courtyard.',
    address: '50 Quai de la Daurade, 31000 Toulouse',
    latitude: 43.5980,
    longitude: 1.4460,
    spotType: 'covered',
    hourlyRate: 5,
    dailyRate: 35,
    photos: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
      'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=600',
    ],
    amenities: ['covered', 'lit', 'gated'],
    vehicleSizes: ['compact', 'sedan'],
    accessInstructions: 'Code 1357 opens the large green door. Drive into courtyard, spot is under the awning on left.',
    accessType: 'code',
    houseRules: '• Enter slowly - children play in courtyard\n• Park within lines\n• Close gate after entry',
    availability: generateAvailability('weekdays'),
    rating: 4.9,
    reviewCount: 22,
    instantBook: true,
    createdAt: '2024-04-05T09:15:00Z',
    cancellationPolicy: 'flexible',
  },
  {
    id: 'spot_12',
    hostId: 'user_6',
    title: 'Budget Spot in Compans-Caffarelli',
    description: 'Affordable parking in vibrant Compans-Caffarelli! Great for exploring northern Toulouse. Street parking with neighborhood watch.',
    address: '15 Rue de la Concorde, 31000 Toulouse',
    latitude: 43.6120,
    longitude: 1.4540,
    spotType: 'street',
    hourlyRate: 3,
    dailyRate: 20,
    photos: [
      'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=600',
    ],
    amenities: ['lit'],
    vehicleSizes: ['compact', 'sedan', 'motorcycle'],
    accessInstructions: 'Look for building 15 - the spot is right in front. No code needed, just park and message me.',
    accessType: 'trust',
    houseRules: '• Budget option - basic amenities\n• Street parking rules apply\n• Move if street cleaning signs appear',
    availability: generateAvailability('all'),
    rating: 4.3,
    reviewCount: 19,
    instantBook: true,
    createdAt: '2024-09-10T14:00:00Z',
    cancellationPolicy: 'flexible',
  },
];

// Get spot by ID
export const getSpotById = (id: string): Spot | undefined => {
  return mockSpots.find((spot) => spot.id === id);
};

// Get spots by host
export const getSpotsByHost = (hostId: string): Spot[] => {
  return mockSpots.filter((spot) => spot.hostId === hostId);
};

// Get spots by area (simple radius search)
export const getSpotsNearLocation = (lat: number, lon: number, radiusKm: number = 5): Spot[] => {
  const R = 6371; // Earth radius in km
  return mockSpots.filter((spot) => {
    const dLat = ((spot.latitude - lat) * Math.PI) / 180;
    const dLon = ((spot.longitude - lon) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat * Math.PI) / 180) *
        Math.cos((spot.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance <= radiusKm;
  });
};

// Get featured spots (superhosts with high ratings)
export const getFeaturedSpots = (): Spot[] => {
  return mockSpots.filter((spot) => spot.rating >= 4.8).slice(0, 5);
};
