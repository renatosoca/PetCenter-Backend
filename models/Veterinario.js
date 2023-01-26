import mongoose from 'mongoose';

const VeterinarioSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        uniqued: true,
        trim: true
    },
    telefono: {
        type: String,
        default: null,
        trim: true
    },
    web: {
        type: String,
        default: null
    },
    token: {
        type: String
    },
    confirmado: {
        type: Boolean,
        default: false
    }
});

const Veterinario = mongoose.model( 'Veterinario', VeterinarioSchema );
export default Veterinario;