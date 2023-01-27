import express from 'express';
import { registrar, perfil, confirmar, autenticar, olvidePassword, comprobarToken, nuevoPassword } from '../controllers/VeterinarioController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', registrar);
router.get('/confirmar/:token', confirmar);
router.post('/login', autenticar);
router.post('/olvide-password', olvidePassword );
router.route('/olvide-password/:token' ).get( comprobarToken ).post( nuevoPassword );

router.get('/perfil', authMiddleware, perfil);

export default router;