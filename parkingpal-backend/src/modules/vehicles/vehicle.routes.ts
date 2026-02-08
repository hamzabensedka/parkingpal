import { Router } from 'express';
import { vehicleController, authenticate } from '../../container';
import { validate } from '../../middleware/validate';
import { createVehicleSchema, updateVehicleSchema } from './vehicle.validation';

const router = Router({ mergeParams: true });

router.get('/', authenticate, vehicleController.list.bind(vehicleController));
router.post(
  '/',
  authenticate,
  validate(createVehicleSchema),
  vehicleController.create.bind(vehicleController)
);
router.put(
  '/:id',
  authenticate,
  validate(updateVehicleSchema),
  vehicleController.update.bind(vehicleController)
);
router.delete('/:id', authenticate, vehicleController.delete.bind(vehicleController));
router.post(
  '/:id/default',
  authenticate,
  vehicleController.setDefault.bind(vehicleController)
);

export default router;
