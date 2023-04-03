import { Schema, model } from 'mongoose';
import { Patient } from '../interfaces';

const patientSchema = new Schema<Patient>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  owner: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  visitDate: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  createdFor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

export default model<Patient>('Patient', patientSchema);