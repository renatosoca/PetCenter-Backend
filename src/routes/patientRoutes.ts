import { Router } from 'express';
import { createPatient, deletePatient, getPatient, getPatients, updatePatient } from '../controllers';
import { checkSession } from '../middleware';

const router = Router();

router.use(checkSession);

router.route('/').get(getPatients).post(createPatient);

router.route('/:id').get(getPatient).put(updatePatient).delete(deletePatient);

export default router;
