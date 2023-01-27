import mongoose from 'mongoose';

const PacienteSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    propietario: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    fechaAlta: {
        type: Date,
        required: true,
        default: Date.now()
    },
    sintomas: {
        type: String,
        required: true
    },
    veterinario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Veterinario'
    }
}, { timestamps: true });

const Paciente = mongoose.model( 'Paciente', PacienteSchema );
export default Paciente;