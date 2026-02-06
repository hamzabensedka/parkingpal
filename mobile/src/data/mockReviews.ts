import { Review } from '../types';
import { subDays, subHours } from 'date-fns';

const now = new Date();

export const mockReviews: Review[] = [
  // Reviews for spot_1 (Secure Garage in Le Marais)
  {
    id: 'review_1',
    bookingId: 'booking_7',
    reviewerId: 'user_1',
    revieweeId: 'user_3',
    spotId: 'spot_1',
    rating: 5,
    comment: 'Perfect spot! Easy access, great location, exactly as described. Marie was very responsive and helpful. Will definitely book again!',
    tags: ['easy_access', 'great_value', 'accurate', 'good_location'],
    createdAt: subDays(now, 14).toISOString(),
    response: {
      text: 'Thank you Sophie! You were a wonderful guest. Looking forward to hosting you again! 🚗',
      createdAt: subDays(now, 13).toISOString(),
    },
  },
  {
    id: 'review_2',
    bookingId: 'booking_10',
    reviewerId: 'user_2',
    revieweeId: 'user_3',
    spotId: 'spot_1',
    rating: 5,
    comment: 'Superbe garage, très propre et sécurisé. La propriétaire est très accueillante. Parfait pour le travail en centre-ville.',
    tags: ['clean', 'safe', 'good_location'],
    createdAt: subDays(now, 6).toISOString(),
  },
  {
    id: 'review_3',
    bookingId: 'booking_prev_1',
    reviewerId: 'user_4',
    revieweeId: 'user_3',
    spotId: 'spot_1',
    rating: 4,
    comment: 'Good parking spot, convenient location. Only minor issue was finding the entrance the first time, but host helped via message.',
    tags: ['great_value', 'good_location'],
    createdAt: subDays(now, 20).toISOString(),
    response: {
      text: 'Thanks for the feedback Thomas! I have added clearer directions in the listing now.',
      createdAt: subDays(now, 19).toISOString(),
    },
  },

  // Reviews for spot_2 (Driveway Near Louvre Museum)
  {
    id: 'review_4',
    bookingId: 'booking_prev_2',
    reviewerId: 'user_7',
    revieweeId: 'user_2',
    spotId: 'spot_2',
    rating: 5,
    comment: 'Amazing location! We walked to the Louvre in 5 minutes. Marc was so helpful and even gave us local tips. Highly recommend!',
    tags: ['good_location', 'easy_access', 'accurate'],
    createdAt: subDays(now, 25).toISOString(),
  },
  {
    id: 'review_5',
    bookingId: 'booking_prev_3',
    reviewerId: 'user_1',
    revieweeId: 'user_2',
    spotId: 'spot_2',
    rating: 5,
    comment: 'Great driveway, perfect for museum visits. The host was waiting for me and showed me exactly where to park. Very professional!',
    tags: ['clean', 'accurate', 'good_location'],
    createdAt: subDays(now, 30).toISOString(),
  },

  // Reviews for spot_3 (Stadium Parking - PSG Matches)
  {
    id: 'review_6',
    bookingId: 'booking_4',
    reviewerId: 'user_1',
    revieweeId: 'user_8',
    spotId: 'spot_3',
    rating: 5,
    comment: 'Perfect for the PSG match! Short walk to stadium, easy access, and avoided the crazy parking situation. Antoine even texted to make sure I found it okay.',
    tags: ['easy_access', 'good_location', 'great_value'],
    createdAt: subDays(now, 4).toISOString(),
  },
  {
    id: 'review_7',
    bookingId: 'booking_prev_4',
    reviewerId: 'user_2',
    revieweeId: 'user_8',
    spotId: 'spot_3',
    rating: 5,
    comment: 'Been using this spot for every home game. Antoine is the best - reliable, great communication, fair pricing. Superhost deserved!',
    tags: ['great_value', 'safe', 'good_location'],
    createdAt: subDays(now, 40).toISOString(),
  },
  {
    id: 'review_8',
    bookingId: 'booking_prev_5',
    reviewerId: 'user_4',
    revieweeId: 'user_8',
    spotId: 'spot_3',
    rating: 4,
    comment: 'Good spot for matches. Street parking so a bit exposed, but the area is safe and well-lit. Would book again.',
    tags: ['good_location'],
    createdAt: subDays(now, 50).toISOString(),
  },

  // Reviews for spot_4 (Covered Parking Near Bastille)
  {
    id: 'review_9',
    bookingId: 'booking_5',
    reviewerId: 'user_1',
    revieweeId: 'user_5',
    spotId: 'spot_4',
    rating: 4,
    comment: 'Good underground parking. A bit tricky to find spot 45 at first, but secure and covered. Fair price for the area.',
    tags: ['clean', 'safe'],
    createdAt: subDays(now, 9).toISOString(),
  },
  {
    id: 'review_10',
    bookingId: 'booking_prev_6',
    reviewerId: 'user_4',
    revieweeId: 'user_5',
    spotId: 'spot_4',
    rating: 5,
    comment: 'Excellent parking! Underground so my car was protected from the rain. Close to Bastille metro and restaurants. Will use again.',
    tags: ['covered', 'clean', 'good_location', 'safe'],
    createdAt: subDays(now, 45).toISOString(),
  },

  // Reviews for spot_5 (Montmartre Garage with EV Charging)
  {
    id: 'review_11',
    bookingId: 'booking_prev_7',
    reviewerId: 'user_2',
    revieweeId: 'user_6',
    spotId: 'spot_5',
    rating: 5,
    comment: 'Finally a spot with EV charging! Charged my Tesla while visiting Sacré-Cœur. Smart lock worked perfectly. Jean-Paul was helpful with the app setup.',
    tags: ['easy_access', 'clean', 'great_value'],
    createdAt: subDays(now, 35).toISOString(),
  },
  {
    id: 'review_12',
    bookingId: 'booking_prev_8',
    reviewerId: 'user_7',
    revieweeId: 'user_6',
    spotId: 'spot_5',
    rating: 4,
    comment: 'Great garage with EV charging. Location is slightly uphill (its Montmartre after all!) but totally worth it. Smart lock was convenient.',
    tags: ['great_value', 'good_location'],
    createdAt: subDays(now, 60).toISOString(),
  },

  // Reviews from hosts about renters
  {
    id: 'review_13',
    bookingId: 'booking_7',
    reviewerId: 'user_3',
    revieweeId: 'user_1',
    rating: 5,
    comment: 'Sophie was a perfect guest! On time, respectful, and left the spot exactly as she found it. Would host again anytime.',
    tags: ['respectful', 'on_time', 'left_clean', 'would_host_again'],
    createdAt: subDays(now, 14).toISOString(),
  },
  {
    id: 'review_14',
    bookingId: 'booking_4',
    reviewerId: 'user_8',
    revieweeId: 'user_1',
    rating: 5,
    comment: 'Great renter! Good communication, arrived on time for the match, and was respectful of the neighborhood. Welcome back anytime!',
    tags: ['good_communication', 'on_time', 'respectful', 'would_host_again'],
    createdAt: subDays(now, 4).toISOString(),
  },
  {
    id: 'review_15',
    bookingId: 'booking_5',
    reviewerId: 'user_5',
    revieweeId: 'user_1',
    rating: 4,
    comment: 'Good guest, no issues. Would have appreciated a quick message when departing but otherwise perfect.',
    tags: ['respectful', 'left_clean'],
    createdAt: subDays(now, 9).toISOString(),
  },
  {
    id: 'review_16',
    bookingId: 'booking_10',
    reviewerId: 'user_3',
    revieweeId: 'user_2',
    rating: 5,
    comment: 'Marc is both a great host and a great guest! Very professional, clear communication, respects the rules. A model ParkingPal user!',
    tags: ['respectful', 'on_time', 'good_communication', 'left_clean', 'would_host_again'],
    createdAt: subDays(now, 6).toISOString(),
  },
];

// Get reviews by spot
export const getReviewsBySpot = (spotId: string): Review[] => {
  return mockReviews.filter((review) => review.spotId === spotId);
};

// Get reviews by user (received)
export const getReviewsForUser = (userId: string): Review[] => {
  return mockReviews.filter((review) => review.revieweeId === userId);
};

// Get reviews by user (given)
export const getReviewsByUser = (userId: string): Review[] => {
  return mockReviews.filter((review) => review.reviewerId === userId);
};

// Get average rating for spot
export const getAverageRatingForSpot = (spotId: string): number => {
  const reviews = getReviewsBySpot(spotId);
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
};

// Get average rating for user
export const getAverageRatingForUser = (userId: string): number => {
  const reviews = getReviewsForUser(userId);
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
};
