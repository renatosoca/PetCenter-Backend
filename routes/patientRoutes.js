import { Router } from "express";
import { 
  createPatient, deletePatient, getPatients, updatePatient 
} from "../controllers/patientController.js";
import jwtValidation from "../middleware/jwtValidation.js";

const router = Router();

router.use( jwtValidation );

router.route('/').get(  getPatients ).post(  createPatient );
router.route('/:id').get( getPatients ).put( updatePatient ).delete( deletePatient );

export default router