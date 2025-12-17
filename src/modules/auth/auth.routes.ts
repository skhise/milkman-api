import { Router } from 'express';
import { login, registerSeller, requestPinReset, verifyOtp, changePin, resetPin } from './auth.controller';
import { authenticate } from '../../utils/authMiddleware';

const router = Router();

router.post('/login', login);
router.post('/seller/register', registerSeller);
router.post('/pin/forgot', requestPinReset);
router.post('/pin/verify', verifyOtp);
router.post('/pin/reset', resetPin);
router.post('/pin/change', authenticate, changePin);

export default router;
