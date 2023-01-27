import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import generarId from '../helpers/generarId.js';

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
        type: String,
        default: generarId()
    },
    confirmado: {
        type: Boolean,
        default: false
    }
});

//Hashear el PASSWORD antes de insertar el objeto en la DB
VeterinarioSchema.pre('save', async function( next ) {
    //Si el PASSWORD ya está Hasheado
    if (!this.isModified('password')) next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash( this.password, salt );
});

//Metodo para comprobar la Contraseña
VeterinarioSchema.methods.comprobarPass = async function( pass ) {
    return await bcrypt.compare( pass, this.password );
};

const Veterinario = mongoose.model( 'Veterinario', VeterinarioSchema );
export default Veterinario;