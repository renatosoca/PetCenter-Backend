import express from 'express';
import { registrar, perfil, actualizarPerfil, confirmar, autenticar, olvidePassword, comprobarToken, nuevoPassword, actualizarClave } from '../controllers/VeterinarioController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', registrar);
router.get('/confirmar/:token', confirmar);
router.post('/login', autenticar);
router.post('/olvide-password', olvidePassword );
router.route('/olvide-password/:token' ).get( comprobarToken ).post( nuevoPassword );

//Area Protegida
router.get('/perfil', authMiddleware, perfil);
router.put('/perfil/:id', authMiddleware, actualizarPerfil);
router.put('/actualizar-password', authMiddleware, actualizarClave);

export default router;