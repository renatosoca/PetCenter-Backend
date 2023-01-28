import Veterinario from "../models/Veterinario.js";
import generarJWT from "../helpers/generarJWT.js";
import generarId from "../helpers/generarId.js";
import emailRegistro from "../helpers/emailRegistro.js";
import emailOlvidePass from "../helpers/emailOlvidePass.js";

const registrar = async (req, res) => {
    const { email, nombre } = req.body;

    //Prevenir Usuarios Duplicados
    const existeUsuario = await Veterinario.findOne({email});
    if (existeUsuario) {
        const error = new Error('El Email Ya Está en Uso');
        return res.status(400).json({ msg: error.message });
    };
    
    try {
        const veterinario = new Veterinario(req.body);
        const respuesta = await veterinario.save();

        //Enviar Email
        emailRegistro({
            email,
            nombre,
            token: respuesta.token
        });
        
        res.json( respuesta );
    } catch (e) {
        const error = new Error('No se Pudo registrar al Veterinario');
        res.status(400).json( { msg: error.message } );
    };
};

const confirmar = async (req, res) => {
    //Cuando Extraemos valores de la URL
    const { token } = req.params;
    const veterinario = await Veterinario.findOne( {token} );

    if ( !veterinario ) {
        const error = new Error('Token no valido');
        return res.status(400).json({ msg: error.message });
    };

    try {
        veterinario.confirmado = true;
        veterinario.token = null;

        await veterinario.save();
        res.json( {msg: 'Usuario Confirmado'} );
    } catch (e) {
        const error = new Error('No se Pudo confirmar al Usuario');
        res.status(400).json( { msg: error.message } );
    };
};

const autenticar = async (req, res) => {
    const { email, password } = req.body;
    const veterinario = await Veterinario.findOne( { email });
    //Si no existe una instancia
    if ( !veterinario ) {
        const error = new Error('El Usuario no Existe');
        return res.status(403).json( { msg: error.message });
    };
    //Si no esta confirmado
    if ( !veterinario.confirmado) {
        const error = new Error('Falta confirmar su cuenta');
        return res.status(403).json( { msg: error.message });
    };
    //Validar Password
    const validated = await veterinario.comprobarPass( password );
    if ( !validated ) {
        const error = new Error('Password incorrecto');
        return res.status(403).json( { msg: error.message });
    };
    //Autenticado
    const { _id, nombre, telefono, web } = veterinario;
    res.json( {
        _id,
        nombre,
        email,
        telefono,
        web,
        token: generarJWT( veterinario.id )
    });
};

const olvidePassword = async (req, res) => {
    const { email } = req.body;

    const veterinario = await Veterinario.findOne( { email });

    if( !veterinario ) {
        const error = new Error('No existe el Usuario');
        return res.status(404).json( { msg: error.message } );
    };

    if( !veterinario.confirmado ) {
        const error = new Error('Falta confirmar su Cuenta');
        return res.status(403).json( { msg: error.msg } );
    };

    try {
        veterinario.token = generarId();
        await veterinario.save();

        //Enviar Email
        emailOlvidePass({
            email,
            nombre: veterinario.nombre,
            token: veterinario.token
        });

        res.json( { msg: 'Hemos enviado un email con las instrucciones' } );
    } catch (e) {
        const error = new Error('Ocurrio un Problema al Enviar las Instrucciones');
        res.status(400).json( { msg: error.message } );
    };
};

const comprobarToken = async (req, res) => {
    const { token } = req.params;

    const veterinario = await Veterinario.findOne( { token } );
    if ( !veterinario ) {
        const error = new Error('Token no válido');
        return res.status(400).json( { msg: error.message } );
    };

    res.json( { veterinario } );
};

const nuevoPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    const veterinario = await Veterinario.findOne( { token } );

    if ( !veterinario ) {
        const error = new Error('Usuario no Encontrado');
        return res.status(400).json( { msg: error.message } );
    };

    try {
        veterinario.token = null;
        veterinario.password = password;
        await veterinario.save();
        
        res.json( { msg: 'Password Modificado Correctamente' } );
    } catch (e) {
        const error = new Error('No se Pudo Crear un Nuevo Password');
        res.status(400).json( { msg: error.message } );
    };
};

const perfil = (req, res) => {
    const { veterinario } = req;
    
    res.json( veterinario );
};
const actualizarPerfil = async (req, res) => {
    const veterinario = await Veterinario.findById( req.params.id )
    if ( !veterinario) {
        const error = new Error('No existe el Veterinario');
        return res.status(404).json({ msg: error.message });
    };
    
    const { email } = req.body
    if ( veterinario.email !== req.body.email ) {
        const existEmail = await Veterinario.findOne( { email });
        if (existEmail) {
            const error = new Error('El Email ya está en Uso');
            return res.status(404).json({ msg: error.message });
        };
    };

    try {
        veterinario.nombre = req.body.nombre || veterinario.nombre;
        veterinario.email = req.body.email || veterinario.email;
        veterinario.web = req.body.web;
        veterinario.telefono = req.body.telefono;

        const veterinarioActualizado = await veterinario.save();
        res.json( veterinarioActualizado );
    } catch (e) {
        const error = new Error('No se pudo actualizar el Perfil del Usuario');
        return res.status(404).json({ msg: error.message });
    }
};
const actualizarClave = async (req, res) => {
    //Leer Datos
    const { id } = req.veterinario;
    const { currentPassword, newPassword } = req.body;
    //Existe
    const veterinario = await Veterinario.findById( id );
    if ( !veterinario ) {
        const error = new Error('No existe el usuario');
        return res.status(404).json({ msg: error.message });
    };
    //Comprobar el Pass
    if ( ! await veterinario.comprobarPass( currentPassword ) ) {
        const error = new Error('Contraseña Actual Incorrecta');
        return res.status(403).json( { msg: error.message } );
    }
    //Actualizar Pass
    try {
        veterinario.password = newPassword;
        await veterinario.save();
        res.json({ msg: 'Contraseña Actualizada Correctamente' });
    } catch (e) {
        const error = new Error('Error al Actualizar la Contraseña');
        return res.status(403).json( { msg: error.message } );
    };
};

export {
    registrar,
    perfil,
    actualizarPerfil,
    confirmar,
    autenticar,
    olvidePassword,
    comprobarToken,
    nuevoPassword,
    actualizarClave
};