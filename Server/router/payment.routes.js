import {Router} from 'express'
import { authorizedRoles, isLoggedIn } from '../middleware/auth.middleware.js';
import { allPayments, buySubscription, cancelSubscription, getRazorpayApiKey, verifySubscription } from '../controller/payment.controller.js';

const router = Router();

router
   .route('/razorpay-key')
   .get(
    isLoggedIn,
    getRazorpayApiKey);

router 
  .route('/subscribe')
  .post(
    isLoggedIn,
    buySubscription);

router
    .route('/verify')
    .post(
        isLoggedIn,
        verifySubscription);

router
   .route('/unsubscribe')
   .post(
    isLoggedIn,
    cancelSubscription)

router
    .route('/')
    .get(
        isLoggedIn,
        authorizedRoles('ADMIN'),
        allPayments);

  export default router;