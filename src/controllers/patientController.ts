import { Response } from "express";
import { UserRequest } from "../interfaces";
import { patientModel } from "../models";
import { Patient } from "../interfaces";

/**
 * @swagger
 * components:
 *   schemas:
 *     Patient:
 *       type: object
 *       required:
 *         - name
 *         - owner
 *         - email
 *         - phone
 *         - symptoms
 *       properties:
 *         _id:
 *           type: string
 *           description: ID autogenerado del paciente
 *         name:
 *           type: string
 *           description: Nombre de la mascota
 *         owner:
 *           type: string
 *           description: Nombre del dueño
 *         email:
 *           type: string
 *           description: Correo del dueño
 *         phone:
 *           type: string
 *           description: Teléfono del dueño
 *         symptoms:
 *           type: string
 *           description: Síntomas que presenta la mascota
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *         createdFor:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             lastname:
 *               type: string
 *             email:
 *               type: string
 *           description: Usuario creador del paciente
 *       example:
 *         _id: "661aef122b2f1a45237642c3"
 *         name: "Luna"
 *         owner: "Carlos Pérez"
 *         email: "carlos@example.com"
 *         phone: "123456789"
 *         symptoms: "Fiebre, vómitos"
 *         createdAt: "2024-04-12T10:15:30.123Z"
 *         updatedAt: "2024-04-12T10:15:30.123Z"
 *         createdFor:
 *           _id: "660d8e5c9f3a3b3a441e7c1f"
 *           name: "Andrea"
 *           lastname: "Gómez"
 *           email: "andrea@example.com"
 */

/**
 * @swagger
 * /api/patient:
 *   get:
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: false
 *         description: Página a consultar
 *       - in: query
 *         name: rowPerPage
 *         schema:
 *           type: integer
 *         required: false
 *         description: Número de registros por página
 *     responses:
 *       200:
 *         description: Lista de pacientes
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                ok:
 *                  type: boolean
 *                page:
 *                  type: integer
 *                rowPerPage:
 *                  type: integer
 *                totalCount:
 *                  type: integer
 *                patients:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/Patient'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */

export const getPatients = async (req: UserRequest, res: Response) => {
  const { user } = req;
  if (!user) return res.status(401).json({ msg: "No autorizado para esta acción" });
  const { _id } = user;

  const page = parseInt(req.query.page as string) || 1;
  const rowPerPage = parseInt(req.query.rowPerPage as string) || 10;
  const skip = (page - 1) * rowPerPage;

  try {
    const totalCount = await patientModel.countDocuments({ createdFor: _id });

    const patients = await patientModel
      .find({ createdFor: _id })
      .populate("createdFor", "_id name lastname email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(rowPerPage);

    return res.status(200).json({
      ok: true,
      page,
      rowPerPage,
      totalCount,
      patients,
    });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: "Error del sistema, comuníquese con el administrador" });
  }
};

/**
 * @swagger
 * /api/patient/{id}:
 *   get:
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del paciente
 *     responses:
 *       200:
 *         description: Información del paciente
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                ok:
 *                  type: boolean
 *                patient:
 *                  $ref: '#/components/schemas/Patient'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Paciente no encontrado
 *       500:
 *         description: Error interno del servidor
 */

export const getPatient = async (req: UserRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ msg: "No autorizado para esta acción" });
  const { id } = req.params;
  const { _id } = req.user;

  try {
    const patient = await patientModel.findById(id).populate("createdFor");
    if (!patient) return res.status(404).json({ msg: "Paciente no encontrado" });

    if (patient.createdFor._id.toString() !== _id.toString())
      return res.status(401).json({ ok: false, msg: "No autorizado para esta acción" });

    return res.status(200).json({ ok: true, patient });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: "Error del sistema, comuníquese con el administrador" });
  }
};

/**
 * @swagger
 * /api/patient:
 *   post:
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               owner:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               symptoms:
 *                 type: string
 *     responses:
 *       201:
 *         description: Paciente creado exitosamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */

export const createPatient = async ({ body, user }: UserRequest, res: Response) => {
  if (!user) return res.status(401).json({ msg: "No autorizado para esta acción" });

  try {
    const patient = new patientModel(body);

    patient.createdFor = user;
    const savedPatient = await patient.save();

    return res.status(201).json({
      ok: true,
      patient: savedPatient,
    });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: "Error del sistema, comuníquese con el administrador" });
  }
};

/**
 * @swagger
 * /api/patient/{id}:
 *   put:
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del paciente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               owner:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               symptoms:
 *                 type: string
 *     responses:
 *       201:
 *         description: Paciente actualizado
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Paciente no encontrado
 *       500:
 *         description: Error interno del servidor
 */

export const updatePatient = async ({ params, body, user }: UserRequest, res: Response) => {
  if (!user) return res.status(401).json({ msg: "No autorizado para esta acción" });
  const { id } = params;

  try {
    const patient = await patientModel.findById(id).populate("createdFor");
    if (!patient) return res.status(404).json({ ok: false, msg: "Paciente no encontrado" });

    if (patient.createdFor._id.toString() !== user._id.toString())
      return res.status(401).json({ ok: false, msg: "No autorizado para esta acción" });

    const updatedPatient = await patientModel.findByIdAndUpdate<Patient>(id, { ...body }, { new: true });

    return res.status(201).json({
      ok: true,
      patient: updatedPatient,
    });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: "Error del sistema, comuníquese con el administrador" });
  }
};

/**
 * @swagger
 * /api/patient/{id}:
 *   delete:
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del paciente
 *     responses:
 *       200:
 *         description: Paciente eliminado correctamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Paciente no encontrado
 *       500:
 *         description: Error interno del servidor
 */

export const deletePatient = async ({ params, user }: UserRequest, res: Response) => {
  if (!user) return res.status(401).json({ msg: "No autorizado para esta acción" });
  const { id } = params;

  try {
    const patient = await patientModel.findById(id).populate("createdFor");
    if (!patient) return res.status(404).json({ ok: false, msg: "Paciente no encontrado" });

    if (patient.createdFor._id.toString() !== user._id.toString())
      return res.status(401).json({ ok: false, msg: "No autorizado para esta acción" });

    await patient.deleteOne();

    return res.status(200).json({
      ok: true,
      msg: "Paciente eliminado correctamente",
    });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: "Error del sistema, comuníquese con el administrador" });
  }
};
