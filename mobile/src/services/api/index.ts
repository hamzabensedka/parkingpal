import { createApiClient } from '../http/apiClient';
import { secureTokenStorage } from '../http/secureTokenStorage';
import { API_BASE_URL } from '../../utils/constants';
import { createAuthApi } from './authApi';
import { createUserApi } from './userApi';
import { createVehicleApi } from './vehicleApi';
import { createPaymentApi } from './paymentApi';

const apiClient = createApiClient({
  baseURL: API_BASE_URL,
  tokenStorage: secureTokenStorage,
});

export const authApi = createAuthApi(apiClient);
export const userApi = createUserApi(apiClient);
export const vehicleApi = createVehicleApi(apiClient);
export const paymentApi = createPaymentApi(apiClient);

export { apiClient, createAuthApi, createUserApi, createVehicleApi, createPaymentApi };
