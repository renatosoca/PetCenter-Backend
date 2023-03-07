import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import tokenGenerator from '../helpers/tokenGenerador.js';

const userSchema = Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    lastname: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        uniqued: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        default: null,
        trim: true
    },
    webPage: {
        type: String,
        default: null
    },
    token: {
        type: String,
        default: tokenGenerator()
    },
    confirmed: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

userSchema.pre('save', async function( next ) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash( this.password, salt );
});

userSchema.methods.matchPassword = async function( pass ) {
    return await bcrypt.compare( pass, this.password );
};

export default model( 'User', userSchema );