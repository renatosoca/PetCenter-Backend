import { Router } from 'express';
import { createPatient, deletePatient, getPatient, getPatients, updatePatient } from '../controllers';
import { checkSesion } from '../middleware';

const router = Router();

router.use( checkSesion );

router.route('/').get(  getPatients ) //PASÓ
  .post(  createPatient ); //PASÓ

router.route('/:id').get( getPatient ) //Depende del programador - PASÓ
  .put( updatePatient ) //PASÓ
  .delete( deletePatient );  //PASÓ

export default router