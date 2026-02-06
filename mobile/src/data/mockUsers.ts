import { User } from '../types';

export const mockUsers: User[] = [
  {
    id: 'user_1',
    email: 'sophie.martin@email.com',
    firstName: 'Sophie',
    lastName: 'Martin',
    phone: '+33 6 12 34 56 78',
    profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    userType: 'renter',
    verified: {
      phone: true,
      id: true,
    },
    rating: 4.9,
    reviewCount: 15,
    memberSince: '2024-06-15T10:00:00Z',
    bio: 'Regular commuter looking for convenient parking in Paris.',
  },
  {
    id: 'user_2',
    email: 'marc.dubois@email.com',
    firstName: 'Marc',
    lastName: 'Dubois',
    phone: '+33 6 23 45 67 89',
    profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    userType: 'both',
    verified: {
      phone: true,
      id: true,
    },
    rating: 4.8,
    reviewCount: 42,
    memberSince: '2023-09-20T08:30:00Z',
    isSuperhost: true,
    bio: 'Host in Le Marais. Proud Superhost with 3 parking spots available!',
  },
  {
    id: 'user_3',
    email: 'marie.laurent@email.com',
    firstName: 'Marie',
    lastName: 'Laurent',
    phone: '+33 6 34 56 78 90',
    profilePhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    userType: 'host',
    verified: {
      phone: true,
      id: true,
    },
    rating: 5.0,
    reviewCount: 67,
    memberSince: '2023-03-10T14:00:00Z',
    isSuperhost: true,
    bio: 'Homeowner in the heart of Paris. My driveway is your parking spot!',
  },
  {
    id: 'user_4',
    email: 'thomas.bernard@email.com',
    firstName: 'Thomas',
    lastName: 'Bernard',
    phone: '+33 6 45 67 89 01',
    profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    userType: 'renter',
    verified: {
      phone: true,
      id: false,
    },
    rating: 4.7,
    reviewCount: 8,
    memberSince: '2024-11-05T16:20:00Z',
    bio: 'New to Paris, looking for reliable parking near my office.',
  },
  {
    id: 'user_5',
    email: 'claire.moreau@email.com',
    firstName: 'Claire',
    lastName: 'Moreau',
    phone: '+33 6 56 78 90 12',
    profilePhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200',
    userType: 'host',
    verified: {
      phone: true,
      id: true,
    },
    rating: 4.6,
    reviewCount: 23,
    memberSince: '2024-01-22T11:45:00Z',
    bio: 'I have a garage near Bastille. Easy access, great location!',
  },
  {
    id: 'user_6',
    email: 'jean.petit@email.com',
    firstName: 'Jean',
    lastName: 'Petit',
    phone: '+33 6 67 89 01 23',
    profilePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    userType: 'both',
    verified: {
      phone: true,
      id: true,
    },
    rating: 4.5,
    reviewCount: 31,
    memberSince: '2023-07-18T09:15:00Z',
    isSuperhost: false,
    bio: 'Property manager with multiple spots available across Paris.',
  },
  {
    id: 'user_7',
    email: 'emma.wilson@email.com',
    firstName: 'Emma',
    lastName: 'Wilson',
    phone: '+44 7911 123456',
    profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    userType: 'renter',
    verified: {
      phone: true,
      id: false,
    },
    rating: 4.8,
    reviewCount: 3,
    memberSince: '2025-01-10T18:30:00Z',
    bio: 'Frequent visitor from London. Love Paris!',
  },
  {
    id: 'user_8',
    email: 'antoine.garcia@email.com',
    firstName: 'Antoine',
    lastName: 'Garcia',
    phone: '+33 6 78 90 12 34',
    profilePhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
    userType: 'host',
    verified: {
      phone: true,
      id: true,
    },
    rating: 4.9,
    reviewCount: 55,
    memberSince: '2023-05-02T13:00:00Z',
    isSuperhost: true,
    bio: 'Stadium area host. Perfect for match days and concerts!',
  },
];

// Get user by ID
export const getUserById = (id: string): User | undefined => {
  return mockUsers.find((user) => user.id === id);
};

// Get users by type
export const getUsersByType = (type: 'renter' | 'host' | 'both'): User[] => {
  return mockUsers.filter((user) => user.userType === type || user.userType === 'both');
};

// Get superhosts
export const getSuperHosts = (): User[] => {
  return mockUsers.filter((user) => user.isSuperhost);
};
