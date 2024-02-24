/* path: /api/auth */
import { Router } from 'express';
import {
  confirmAccount,
  forgotPassword,
  resetPassword,
  revalidateAuth,
  updateUserPassword,
  updateUserProfile,
  userAuth,
  userProfile,
  userRegister,
  validateToken,
} from '../controllers';
import { checkSession } from '../middleware';

const router = Router();

router.post('/login', userAuth);
router.post('/register', userRegister);
router.get('/confirm-account/:token', confirmAccount);
router.post('/forgot-password', forgotPassword);
router.route('/reset-password/:token').get(validateToken).post(resetPassword);

//Area Protegida
router.use(checkSession);

router.get('/revalidateAuth', revalidateAuth);
router.get('/profile', userProfile);
router.put('/profile/:id', updateUserProfile);
router.put('/password-profile/:id', updateUserPassword);

export default router;
