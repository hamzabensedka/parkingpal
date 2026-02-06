import { Response } from 'express';
import { HTTP_STATUS } from '../config/constants';

// Standard API Response Types
interface SuccessResponse<T = unknown> {
  success: true;
  message?: string;
  data?: T;
}

interface ErrorResponse {
  success: false;
  error: string;
  details?: Record<string, string>;
  reason?: string;
}

type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

/**
 * Send a success response
 */
export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: number = HTTP_STATUS.OK
): Response => {
  const response: SuccessResponse<T> = {
    success: true,
  };

  if (message) response.message = message;
  if (data !== undefined) response.data = data;

  return res.status(statusCode).json(response);
};

/**
 * Send a created response (201)
 */
export const sendCreated = <T>(
  res: Response,
  data?: T,
  message?: string
): Response => {
  return sendSuccess(res, data, message, HTTP_STATUS.CREATED);
};

/**
 * Send an error response
 */
export const sendError = (
  res: Response,
  error: string,
  statusCode: number = HTTP_STATUS.BAD_REQUEST,
  details?: Record<string, string>,
  reason?: string
): Response => {
  const response: ErrorResponse = {
    success: false,
    error,
  };

  if (details) response.details = details;
  if (reason) response.reason = reason;

  return res.status(statusCode).json(response);
};

/**
 * Send a validation error response
 */
export const sendValidationError = (
  res: Response,
  details: Record<string, string>
): Response => {
  return sendError(res, 'Validation Error', HTTP_STATUS.BAD_REQUEST, details);
};

/**
 * Send an unauthorized response (401)
 */
export const sendUnauthorized = (
  res: Response,
  error: string = 'Unauthorized'
): Response => {
  return sendError(res, error, HTTP_STATUS.UNAUTHORIZED);
};

/**
 * Send a forbidden response (403)
 */
export const sendForbidden = (
  res: Response,
  error: string = 'Forbidden',
  reason?: string
): Response => {
  return sendError(res, error, HTTP_STATUS.FORBIDDEN, undefined, reason);
};

/**
 * Send a not found response (404)
 */
export const sendNotFound = (
  res: Response,
  error: string = 'Not Found'
): Response => {
  return sendError(res, error, HTTP_STATUS.NOT_FOUND);
};

/**
 * Send a conflict response (409)
 */
export const sendConflict = (
  res: Response,
  error: string
): Response => {
  return sendError(res, error, HTTP_STATUS.CONFLICT);
};

/**
 * Send a rate limit exceeded response (429)
 */
export const sendRateLimitExceeded = (
  res: Response,
  error: string = 'Too many requests, please try again later'
): Response => {
  return sendError(res, error, HTTP_STATUS.TOO_MANY_REQUESTS);
};

/**
 * Send an internal server error response (500)
 */
export const sendInternalError = (
  res: Response,
  error: string = 'Internal Server Error'
): Response => {
  return sendError(res, error, HTTP_STATUS.INTERNAL_SERVER_ERROR);
};
