import Veterinario from "../models/Veterinario.js";
import generarJWT from "../helpers/generarJWT.js";
import generarId from "../helpers/generarId.js";

const registrar = async (req, res) => {
    const { email } = req.body;

    //Prevenir Usuarios Duplicados
    const existeUsuario = await Veterinario.findOne({email});
    if (existeUsuario) {
        const error = new Error('Usuario Ya Registrado');
        return res.status(400).json({ msg: error.message });
    };
    
    try {
        const veterinario = new Veterinario(req.body);
        const respuesta = await veterinario.save();
        res.json({ msg : 'Veterinario registrado'});
    } catch (e) {
        const error = new Error('Ocurrio un Problema');
        res.status(400).json( { msg: error.message } );
    };
};

const perfil = (req, res) => {
    const { veterinario } = req;
    
    res.json( veterinario );
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
        const error = new Error('Ocurrio un Problema');
        res.status(400).json( { msg: error.message } );
    };
};

const autenticar = async (req, res) => {
    const { email, password } = req.body;
    const veterinario = await Veterinario.findOne( { email });
    //Si no existe una instancia
    if ( !veterinario ) return res.status(403).json( { msg: error.message });

    //Si no esta confirmado
    if ( !veterinario.confirmado) {
        const error = new Error('Falta confirmar su cuenta');
        return res.status(403).json( { msg: error.message });
    };
    //Validar Password
    if ( !await veterinario.comprobarPass( password )) {
        const error = new Error('Password incorrecto');
        return res.status(403).json( { msg: error.message });
    };
    //Autenticar
    res.json( { token: generarJWT( veterinario.id ) } );
};

const olvidePassword = async (req, res) => {
    const { email } = req.body;

    const veterinario = await Veterinario.findOne( { email });
    if( !veterinario ) return res.json( { msg: 'No existe el Usuario' } );
    
    if( !veterinario.confirmado ) return res.json( { msg: 'Falta confirmar su cuenta' } );

    try {
        veterinario.token = generarId();
        await veterinario.save();
        res.json( { msg: 'Hemos enviado un email con las instrucciones' } );
    } catch (e) {
        const error = new Error('Ocurrio un Problema');
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
        const error = new Error('Token no válido');
        return res.status(400).json( { msg: error.message } );
    };

    try {
        veterinario.token = null;
        veterinario.password = password;
        await veterinario.save();
        
        res.json( { msg: 'Password Modificado Correctamente' } );
    } catch (e) {
        const error = new Error('Ocurrio un Problema');
        res.status(400).json( { msg: error.message } );
    }
};

export {
    registrar,
    perfil,
    confirmar,
    autenticar,
    olvidePassword,
    comprobarToken,
    nuevoPassword
};