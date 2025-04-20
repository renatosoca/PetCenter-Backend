import { Router } from "express";
import { createPatient, deletePatient, getPatient, getPatients, updatePatient } from "../controllers";
import { checkSession } from "../middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Patient
 */

router.use(checkSession);

router.get("/", getPatients);

router.post("/", createPatient);

router.get("/:id", getPatient);

router.put("/:id", updatePatient);

router.delete("/:id", deletePatient);

export default router;
