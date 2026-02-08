import { Router } from 'express';
import { paymentMethodController, authenticate } from '../../container';
import { validate } from '../../middleware/validate';
import { createPaymentMethodSchema } from './payment-method.validation';

const router = Router({ mergeParams: true });

router.get('/', authenticate, paymentMethodController.list.bind(paymentMethodController));
router.post(
  '/',
  authenticate,
  validate(createPaymentMethodSchema),
  paymentMethodController.create.bind(paymentMethodController)
);
router.delete('/:id', authenticate, paymentMethodController.delete.bind(paymentMethodController));
router.post(
  '/:id/default',
  authenticate,
  paymentMethodController.setDefault.bind(paymentMethodController)
);

export default router;
