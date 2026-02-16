import { createApiClient } from '../http/apiClient';
import { secureTokenStorage } from '../http/secureTokenStorage';
import { API_BASE_URL } from '../../utils/constants';
import { createAuthApi } from './authApi';
import { createUserApi } from './userApi';
import { createVehicleApi } from './vehicleApi';
import { createPaymentApi } from './paymentApi';
import { createSpotApi } from './spotApi';
import { createFavoriteApi } from './favoriteApi';
import { createBookingApi } from './bookingApi';
import { createMessageApi } from './messageApi';
import { createNotificationApi } from './notificationApi';
import { createEarningsApi } from './earningsApi';
import { createSafetyApi } from './safetyApi';

const apiClient = createApiClient({
  baseURL: API_BASE_URL,
  tokenStorage: secureTokenStorage,
});

export const authApi = createAuthApi(apiClient);
export const userApi = createUserApi(apiClient);
export const vehicleApi = createVehicleApi(apiClient);
export const paymentApi = createPaymentApi(apiClient);
export const spotApi = createSpotApi(apiClient);
export const favoriteApi = createFavoriteApi(apiClient);
export const bookingApi = createBookingApi(apiClient);
export const messageApi = createMessageApi(apiClient);
export const notificationApi = createNotificationApi(apiClient);
export const earningsApi = createEarningsApi(apiClient);
export const safetyApi = createSafetyApi(apiClient);

// Export review API functions directly
export * as reviewApi from './reviewApi';

export { apiClient, createAuthApi, createUserApi, createVehicleApi, createPaymentApi, createSpotApi, createFavoriteApi, createBookingApi, createMessageApi, createNotificationApi, createEarningsApi, createSafetyApi };
