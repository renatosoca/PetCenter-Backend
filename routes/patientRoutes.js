import { Router } from "express";
import { 
  createPatient, deletePatient, getPatient, getPatients, updatePatient 
} from "../controllers/patientController.js";
import jwtValidation from "../middleware/jwtValidation.js";

const router = Router();

router.use( jwtValidation );

router.route('/').get(  getPatients ) //PASÓ
  .post(  createPatient ); //PASÓ

router.route('/:id').get( getPatient ) //Depende del programador - PASÓ
  .put( updatePatient ) //PASÓ
  .delete( deletePatient );  //PASÓ

export default router