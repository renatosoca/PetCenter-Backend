import express from "express";
import { agregarPaciente, obtenerPacientes, obtenerPaciente, updatePaciente, deletePaciente } from "../controllers/PacienteController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.route('/').get( authMiddleware, obtenerPacientes ).post( authMiddleware, agregarPaciente );
router.route('/:id').get( authMiddleware, obtenerPaciente ).put( authMiddleware, updatePaciente ).delete( authMiddleware, deletePaciente );


export default router