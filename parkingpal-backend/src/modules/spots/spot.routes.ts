import { Router } from 'express';
import { spotController, authenticate, optionalAuthenticate } from '../../container';
import { requireUserType } from '../../middleware/authenticate';
import { validate, validateQuery } from '../../middleware/validate';
import { spotCreateLimiter, searchLimiter, userApiLimiter } from '../../middleware/rateLimiter';
import { createSpotSchema, updateSpotSchema, searchSpotsSchema } from './spot.validation';
import { uploadMultiplePhotos, uploadSpotDocument, handleMulterError } from '../../middleware/upload';

const router = Router();

// POST /api/spots - Create listing (auth + renter/host/both, multipart with photos)
// Renters are allowed so they can create their first listing; the service upgrades them to 'both'.
router.post(
  '/',
  authenticate,
  requireUserType('renter', 'host'),
  spotCreateLimiter, // Limit listing creation per user
  uploadMultiplePhotos,
  handleMulterError,
  spotController.create.bind(spotController)
);

// GET /api/spots/my-listings - Host's listings
router.get(
  '/my-listings',
  authenticate,
  requireUserType('host'),
  spotController.getMyListings.bind(spotController)
);

// GET /api/spots/search - Search spots (public, optional auth)
router.get(
  '/search',
  optionalAuthenticate,
  searchLimiter, // Prevent scraping
  validateQuery(searchSpotsSchema),
  spotController.search.bind(spotController)
);

// GET /api/spots/:id - Get spot detail (optional auth)
router.get(
  '/:id',
  optionalAuthenticate,
  spotController.getById.bind(spotController)
);

// GET /api/spots/:id/availability - Get booked slots and schedule for booking calendar
router.get(
  '/:id/availability',
  optionalAuthenticate,
  spotController.getAvailability.bind(spotController)
);

// PUT /api/spots/:id - Update listing
router.put(
  '/:id',
  authenticate,
  requireUserType('host'),
  validate(updateSpotSchema),
  spotController.update.bind(spotController)
);

// DELETE /api/spots/:id - Delete listing (soft delete)
router.delete(
  '/:id',
  authenticate,
  requireUserType('host'),
  spotController.delete.bind(spotController)
);

// POST /api/spots/:id/pause - Pause listing
router.post(
  '/:id/pause',
  authenticate,
  requireUserType('host'),
  spotController.pause.bind(spotController)
);

// POST /api/spots/:id/activate - Activate listing
router.post(
  '/:id/activate',
  authenticate,
  requireUserType('host'),
  spotController.activate.bind(spotController)
);

// POST /api/spots/:id/photos - Upload photos
router.post(
  '/:id/photos',
  authenticate,
  requireUserType('host'),
  uploadMultiplePhotos,
  handleMulterError,
  spotController.addPhotos.bind(spotController)
);

// DELETE /api/spots/:id/photos/:photoId - Delete photo
router.delete(
  '/:id/photos/:photoId',
  authenticate,
  requireUserType('host'),
  spotController.removePhoto.bind(spotController)
);

// POST /api/spots/:id/documents - Upload ownership document
router.post(
  '/:id/documents',
  authenticate,
  requireUserType('host'),
  uploadSpotDocument,
  handleMulterError,
  spotController.uploadDocument.bind(spotController)
);

export default router;
