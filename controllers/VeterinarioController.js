import Veterinario from "../models/Veterinario.js";

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
    } catch (error) {
        console.error(error);
    };
};

const perfil = (req, res) => {
    res.json({ url : 'Desde el perfil Veterinario'});
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
    } catch (error) {
        console.log(error);
    };
};

const autenticar = async (req, res) => {
    const { email, password } = req.body;
    const veterinario = await Veterinario.findOne( { email });
    if ( !veterinario ) {
        const error = new Error('No Existe el usuario');
        return res.status(403).json( { msg: error.message });
    };
    //Si no esta confirmado
    if ( !veterinario.confirmado) {
        const error = new Error('Falta confirmar su cuenta');
        return res.status(403).json( { msg: error.message });
    };
    //Validar Password
    if ( !await veterinario.comprobarPass( password )) {
        const error = new Error('Password incorrecto');
        return res.status(403).json( { msg: error.message });
    }

    res.json( { msg: 'Autenticando' } );
};

export {
    registrar,
    perfil,
    confirmar,
    autenticar
};