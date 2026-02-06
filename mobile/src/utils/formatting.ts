import { format, formatDistance, formatRelative, parseISO, differenceInHours, differenceInMinutes, isToday, isTomorrow, isYesterday, addHours } from 'date-fns';
import { fr } from 'date-fns/locale';

// Currency formatting
export const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format price with /hour or /day
export const formatPrice = (amount: number, unit: 'hour' | 'day' = 'hour'): string => {
  return `${formatCurrency(amount)}/${unit === 'hour' ? 'h' : 'day'}`;
};

// Date formatting
export const formatDate = (date: string | Date, formatStr: string = 'PPP'): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr, { locale: fr });
};

// Format date with smart display (today, tomorrow, etc.)
export const formatSmartDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;

  if (isToday(d)) {
    return "Aujourd'hui";
  }
  if (isTomorrow(d)) {
    return 'Demain';
  }
  if (isYesterday(d)) {
    return 'Hier';
  }

  return format(d, 'EEEE d MMMM', { locale: fr });
};

// Format time
export const formatTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'HH:mm', { locale: fr });
};

// Format date and time
export const formatDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, "d MMM yyyy 'à' HH:mm", { locale: fr });
};

// Format relative time (e.g., "2 hours ago")
export const formatRelativeTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistance(d, new Date(), { addSuffix: true, locale: fr });
};

// Format booking duration
export const formatDuration = (startTime: string | Date, endTime: string | Date): string => {
  const start = typeof startTime === 'string' ? parseISO(startTime) : startTime;
  const end = typeof endTime === 'string' ? parseISO(endTime) : endTime;

  const hours = differenceInHours(end, start);
  const minutes = differenceInMinutes(end, start) % 60;

  if (hours === 0) {
    return `${minutes} min`;
  }
  if (minutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}min`;
};

// Format countdown timer
export const formatCountdown = (endTime: string | Date): string => {
  const end = typeof endTime === 'string' ? parseISO(endTime) : endTime;
  const now = new Date();

  const totalMinutes = differenceInMinutes(end, now);

  if (totalMinutes <= 0) {
    return 'Terminé';
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}min restantes`;
  }
  return `${hours}h ${minutes}min restantes`;
};

// Format distance (meters to km or m)
export const formatDistance2 = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
};

// Format rating
export const formatRating = (rating: number, reviewCount?: number): string => {
  const stars = rating.toFixed(1);
  if (reviewCount !== undefined) {
    return `${stars} (${reviewCount} avis)`;
  }
  return stars;
};

// Format phone number
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }
  if (cleaned.length === 11 && cleaned.startsWith('33')) {
    return '+33 ' + cleaned.slice(2).replace(/(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }
  return phone;
};

// Format license plate
export const formatLicensePlate = (plate: string): string => {
  const cleaned = plate.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  if (cleaned.length === 7) {
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 5)}-${cleaned.slice(5, 7)}`;
  }
  return plate;
};

// Format card number with masking
export const formatCardNumber = (cardNumber: string): string => {
  return `•••• •••• •••• ${cardNumber.slice(-4)}`;
};

// Format name initials
export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

// Format full name
export const formatFullName = (firstName: string, lastName: string): string => {
  return `${firstName} ${lastName}`;
};

// Format booking time range
export const formatTimeRange = (startTime: string | Date, endTime: string | Date): string => {
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
};

// Format address (shorter version)
export const formatShortAddress = (address: string): string => {
  const parts = address.split(',');
  if (parts.length >= 2) {
    return parts.slice(0, 2).join(',').trim();
  }
  return address;
};

// Format earnings
export const formatEarnings = (amount: number): string => {
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}k€`;
  }
  return formatCurrency(amount);
};

// Truncate text
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength - 3)}...`;
};

// Pluralize text
export const pluralize = (count: number, singular: string, plural: string): string => {
  return count === 1 ? singular : plural;
};

// Format booking date range for display
export const formatBookingDateRange = (startTime: string, endTime: string): string => {
  const start = parseISO(startTime);
  const end = parseISO(endTime);

  const startDate = formatSmartDate(start);
  const timeRange = formatTimeRange(start, end);

  return `${startDate}, ${timeRange}`;
};
