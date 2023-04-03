import { Response } from "express";
import { UserRequest } from "../interfaces";
import patientModel from "../models/patientModel";
import { Patient } from '../interfaces/patient.interface';

const getPatients = async ({ user }: UserRequest, res: Response) => {
  if (!user) return res.status(401).json({ msg: 'No autorizado para esta acción' });
  const { _id } = user;

  try {
    const patients = await patientModel.find({ user: _id }).populate("user", "_id name lastname email").sort({ createdAt: -1 });

    return res.status(200).json({
      ok: true,
      patients
    });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: 'Error del sistema, comuniquese con el administrador' });
  }
}

const getPatient = async ({ params, user }: UserRequest, res: Response) => {
  if (!user) return res.status(401).json({ msg: 'No autorizado para esta acción' });
  const { id } = params;
  const { _id } = user;

  try {
    const patient = await patientModel.findById(id).populate('createdFor');
    if (!patient) return res.status(404).json({ msg: 'Paciente no encontrado' });

    if (patient.createdFor._id.toString() !== _id.toString()) return res.status(401).json({ ok:false, msg: 'No autorizado para esta acción' });

    return res.status(200).json({ ok:true, patient });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: 'Error del sistema, comuniquese con el administrador' });
  };
}

const createPatient = async ({ body, user }: UserRequest, res: Response) => {
  if (!user) return res.status(401).json({ msg: 'No autorizado para esta acción' });

  try {
    const patient = new patientModel(body);

    patient.createdFor = user;
    const savedPatient = await patient.save();

    return res.status(201).json({
      ok: true,
      patient: savedPatient,
    });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: 'Error del sistema, comuniquese con el administrador' });
  }
}

const updatePatient = async ({ params, body, user }: UserRequest, res: Response) => {
  if (!user) return res.status(401).json({ msg: 'No autorizado para esta acción' });
  const { id } = params;

  try {
    const patient = await patientModel.findById(id).populate('createdFor');
    if (!patient) return res.status(404).json({ ok: false, msg: 'Paciente no encontrado' });

    if (patient.createdFor._id.toString() !== user._id.toString()) return res.status(401).json({ ok:false, msg: 'No autorizado para esta acción' });

    const newPatient = {
      ...body,
      user: user._id,
    }
    const updatedPatient = await patientModel.findByIdAndUpdate<Patient>(id, newPatient, { new: true });

    return res.status(200).json({
      ok: true,
      patient: updatedPatient,
    });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: 'Error del sistema, comuniquese con el administrador' });
  }
};

const deletePatient = async ({ params, user }: UserRequest, res: Response) => {
  if (!user) return res.status(401).json({ msg: 'No autorizado para esta acción' });
  const { id } = params;

  try {
    const patient = await patientModel.findById(id).populate('createdFor');
    if (!patient) return res.status(404).json({ ok: false, msg: 'Paciente no encontrado' });

    if (patient.createdFor._id.toString() !== user._id.toString()) return res.status(401).json({ ok: false, msg: 'No autorizado para esta acción' });

    await patient.deleteOne();

    return res.status(200).json({
      ok: true,
      msg: 'Paciente eliminado correctamente'
    });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: 'Error del sistema, comuniquese con el administrador' });
  }
};

export {
  getPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
};