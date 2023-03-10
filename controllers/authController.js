import userModel from "../models/userModel.js";
import jwtGenerator from "../helpers/jwtGenerator.js";
import tokenGenerator from "../helpers/tokenGenerador.js";
import emailRegister from "../helpers/emailRegister.js";
import emailResetPass from "../helpers/emailResetPass.js";

const authUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if ( !user ) return res.status(400).json({ msg: "No existe un usuario con este email" });
    if ( !user.confirmed ) return res.status(400).json({ msg: "Falta confirmar su correo electronico" });
    
    const validPassword = await user.matchPassword(password);
    if (!validPassword) return res.status(403).json({ msg: "Email o contraseña incorrecto" });
    
    const { _id, name, lastname, phone, webPage } = user;

    res.status(200).json({
      _id,
      name,
      lastname,
      email,
      phone,
      webPage,
      jwt: jwtGenerator( _id, name ),
    });
  } catch (error) {
    res.status(500).json({ msg: 'Error del sistema, comuniquese con el administrador' });
  }
};

const registerUser = async (req, res) => {
  const { email } = req.body;
  
  try {
    const userExist = await userModel.findOne({ email });
    if ( userExist ) return res.status(400).json({ msg: 'Ya existe un usuario con ese email' });

    const user = new userModel( req.body );
    const savedUser = await user.save();
    const { token, name, lastname } = savedUser;

    emailRegister({
      email,
      name,
      lastname,
      token,
    });

    res.status(200).json({ 
      msg: 'Hemos enviado las instrucciones a tu correo electrónico' 
    });
  } catch (e) {
    res.status(500).json({ msg: 'Error del sistema, comuniquese con el administrador' });
  }
};

const revalidateJWT = async (req, res) => {
  const { _id, name, lastname, email, phone, webPage } = req.user;

  res.status(201).json({
    _id,
    name,
    lastname,
    email,
    phone,
    webPage,
    jwt: jwtGenerator( _id, name ),
  });
}

const confirmAccount = async (req, res) => {
  const { token } = req.params;
  
  try {
    const user = await userModel.findOne({ token });
    if (!user) return res.status(404).json({ msg: 'Token no válido o expirado' });
    if (user.confirmed) return res.status(404).json({ msg: 'Esta cuenta ya ha sido confirmada anteriormente. Inicia sesión o restablece tu contraseña' });

    user.confirmed = true;
    user.token = null;
    await user.save();

    res.status(201).json({
      msg: 'Cuenta confirmada correctamente' 
    });
  } catch (e) {
    res.status(500).json({ msg: 'Error del sistema, comuniquese con el administrador' });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  
  try {
    const user = await userModel.findOne({ email });
    if ( !user ) return res.status(404).json({ ok: false, msg: 'No existe un usuario con ese correo electronico' });
    if ( !user.confirmed ) return res.status(401).json({ ok: false, msg: 'falta confirmar su correo electronico' });
    
    user.token = tokenGenerator();
    const { name, lastname, token } = await user.save();

    emailResetPass({
      email,
      name,
      lastname,
      token,
    });

    res.status(201).json({ 
      msg: 'Hemos enviado las instrucciones a su correo electrónico' 
    });
  } catch (e) {
    res.status(500).json({ msg: 'Error del sistema, comuniquese con el administrador' });
  }
};

const validateToken = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await userModel.findOne({ token });
    if ( !user ) return res.status(404).json({ ok: false, msg: 'Token no válido o expirado' });
    if ( !user.confirmed ) return res.status(401).json({ ok: false, msg: 'falta confirmar su correo electronico' });

    return res.status(201).json({
      ok: true,
      msg: 'Por favor, ingrese su nueva contraseña'
    })
  } catch (error) {
    return res.status(500).json({
      msg: 'Error del sistema, comuniquese con el administrador'
    })
  }
};

const newPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await userModel.findOne({ token });
    if ( !user ) return res.status(404).json({ ok: false, msg: 'Token no válido o expirado' });
    if ( !user.confirmed ) return res.status(401).json({ ok: false, msg: 'falta confirmar su correo electronico' });

    user.token = null;
    user.password = password;
    await user.save();

    return res.status(200).json({
      ok: true,
      msg: 'Contraseña actualizada correctamente'
    })
  } catch (error) {
    return res.status(500).json({
      msg: 'Error del sistema, comuniquese con el administrador'
    })
  }
};

//Routes Privates
const userProfile = (req, res) => {
  const { _id, name, lastname, email, phone, webPage } = req.user;

  try {
    return res.status(200).json({
        _id,
        name, 
        lastname, 
        email, 
        phone, 
        webPage,
    })
  } catch (error) {
    return res.status(500).json({
      ok: false,
      msg: 'Error del sistema, comuniquese con el administrador'
    })
  }
};

const updateUserProfile = async (req, res) => {
    const { id } = req.params;
    const { email } = req.body;
    const { _id } = req.user;
  
    try {
      const user = await userModel.findById( id );
      if ( !user ) return res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
      if ( !user.confirmed ) return res.status(401).json({ ok: false, msg: 'falta confirmar su correo electronico' });
  
      if ( user.email !== email ) {
        const emailExist = await userModel.findOne({ email });
        if ( emailExist ) return res.status(400).json({ ok: false, msg: 'El email ya está en uso' });
      }

      if ( user._id.toString() !== _id.toString() ) return res.status(401).json({ msg: 'No autorizado para esta acción' });
  
      const newUser = {
        ...req.body,
      }
      const updateUser = await userModel.findByIdAndUpdate( id, newUser, { new: true } );
      const { name, lastname, phone, webPage} = updateUser;
  
      return res.status(200).json({
        user: { name, lastname, email, phone, webPage },
        msg: 'Perfil actualizado correctamente'
      })
    } catch (error) {
      return res.status(500).json({
        msg: 'Error del sistema, comuniquese con el administrador'
      })
    }
};

const updateUserPassword = async (req, res) => {
  const { _id } = req.user;
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await userModel.findById( _id );
    if ( !user ) return res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
    if ( !user.confirmed ) return res.status(401).json({ ok: false, msg: 'Falta confirmar su correo electronico' });

    const validPassword = await user.matchPassword( oldPassword );
    if ( !validPassword ) return res.status(404).json({ ok: false, msg: 'La contraseña actual es incorrecta' });

    if ( user._id.toString() !== _id.toString() ) return res.status(401).json({ msg: 'No autorizado para esta acción' });

    user.password = newPassword;
    await user.save();
    
    return res.status(200).json({
      msg: 'Contraseña actualizada correctamente'
    })
  } catch (error) {
    return res.status(500).json({
      msg: 'Error del sistema, comuniquese con el administrador'
    })
  }
};

export {
    authUser,
    registerUser,
    revalidateJWT,
    confirmAccount,
    forgotPassword,
    validateToken,
    newPassword,
    userProfile,
    updateUserProfile,
    updateUserPassword,
};
