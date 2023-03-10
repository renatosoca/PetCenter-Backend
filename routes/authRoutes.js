/* path: /api/auth */
import { Router } from 'express';
import { 
  authUser, confirmAccount, forgotPassword, newPassword, registerUser, revalidateJWT, updateUserPassword, updateUserProfile, userProfile, validateToken, 
} from '../controllers/authController.js';
import jwtValidation from '../middleware/jwtValidation.js';

const router = Router();

router.post('/login', authUser);  //PASÓ
router.post('/register', registerUser); //PASÓ
router.get('/confirm/:token', confirmAccount); //PASÓ
router.post('/forgot-password', forgotPassword ); //PASÓ
router.route('/reset-password/:token' ).get( validateToken )  //Depende del programador - PASÓ
  .post( newPassword ); //PASÓ

//Area Protegida
router.use( jwtValidation );

router.get('/renew', revalidateJWT);  //PASÓ
router.get('/profile', userProfile);  //Depende del programador - PASÓ
router.put('/profile/:id', updateUserProfile); //PASÓ
router.put('/password-profile', updateUserPassword); //PASÓ

export default router;