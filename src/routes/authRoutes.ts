/* path: /api/auth */
import { Router } from 'express';
import { confirmAccount, forgotPassword, resetPassword, revalidateAuth, updateUserPassword, updateUserProfile, userAuth, userProfile, userRegister, validateToken } from '../controllers';
import { checkSesion } from '../middleware';

const router = Router();

router.post('/login', userAuth);  //PASÓ
router.post('/register', userRegister); //PASÓ
router.get('/confirm-account/:token', confirmAccount); //PASÓ
router.post('/forgot-password', forgotPassword ); //PASÓ
router.route('/reset-password/:token' )
  .get( validateToken )  //Depende del programador - PASÓ
  .post( resetPassword ); //PASÓ

//Area Protegida
router.use( checkSesion );

router.get('/revalidateAuth', revalidateAuth);  //PASÓ
router.get('/profile', userProfile);  //Depende del programador - PASÓ
router.put('/profile/:id', updateUserProfile); //PASÓ
router.put('/password-profile', updateUserPassword); //PASÓ

export default router;