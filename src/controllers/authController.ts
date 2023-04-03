import { Request, Response } from "express";
import userModel from "../models/userModel";
import { comparePassword, emailUserRegister, emailUserResetPass, generateJWT, generateToken } from "../helpers";
import { UserRequest } from "../interfaces";

const userAuth = async ({ body }: Request, res: Response) => {
  const { email, password } = body;

  try {
    const user = await userModel.findOne({ email }).select(' -password -token -confirmed -createdAt -updatedAt');
    if (!user) return res.status(404).json({ ok: false, msg: "No existe un usuario con este email" });
    if (!user.confirmed) return res.status(403).json({ ok: false, msg: "Falta confirmar su correo electronico" });

    const validPassword = comparePassword(password, user.password);
    if (!validPassword) return res.status(403).json({ ok: false, msg: "Email o contraseña incorrecto" });

    return res.status(200).json({
      ok: true,
      user,
      jwt: generateJWT(user._id, user.email),
    });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: 'Error del sistema, comuniquese con el administrador' });
  }
}

const userRegister = async ({ body }: Request, res: Response) => {
  const { email } = body;

  try {
    const userExist = await userModel.findOne({ email });
    if (userExist) return res.status(400).json({ ok: false, msg: 'Ya existe un usuario con ese email' });

    const user = new userModel(body);
    const { token, name, lastname } = await user.save();

    await emailUserRegister(email, name, lastname, token);

    return res.status(200).json({
      ok: true,
      msg: 'Hemos enviado las instrucciones a tu correo electrónico'
    });
  } catch (e) {
    return res.status(500).json({ ok: false, msg: 'Error del sistema, comuniquese con el administrador' });
  }
}

const confirmAccount = async ({ params }: Request, res: Response) => {
  const { token } = params;

  try {
    const user = await userModel.findOne({ token });
    if (!user) return res.status(404).json({ ok: false, msg: 'Token no válido o expirado' });
    if (user.confirmed) return res.status(404).json({ ok: false, msg: 'Esta cuenta ya ha sido confirmada anteriormente. Inicia sesión o restablece tu contraseña' });

    user.confirmed = true;
    user.token = '';
    await user.save();

    return res.status(201).json({
      ok: true,
      msg: 'Cuenta confirmada correctamente'
    });
  } catch (e) {
    return res.status(500).json({ ok: false, msg: 'Error del sistema, comuniquese con el administrador' });
  }
}

const forgotPassword = async ({ body }: Request, res: Response) => {
  const { email } = body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.status(404).json({ ok: false, msg: 'No existe un usuario con ese correo electronico' });
    if (!user.confirmed) return res.status(401).json({ ok: false, msg: 'falta confirmar su correo electronico' });

    user.token = generateToken();
    const { name, lastname, token } = await user.save();

    await emailUserResetPass(email, name, lastname, token);

    return res.status(201).json({
      ok: true,
      msg: 'Hemos enviado las instrucciones a su correo electrónico'
    });
  } catch (e) {
    return res.status(500).json({ ok: false, msg: 'Error del sistema, comuniquese con el administrador' });
  }
}

const validateToken = async ({ params }: Request, res: Response) => {
  const { token } = params;

  try {
    const user = await userModel.findOne({ token });
    if (!user) return res.status(404).json({ ok: false, msg: 'Token no válido o expirado' });
    if (!user.confirmed) return res.status(401).json({ ok: false, msg: 'Falta confirmar su correo electronico' });

    return res.status(201).json({
      ok: true,
      msg: 'Por favor, ingrese su nueva contraseña'
    })
  } catch (error) {
    return res.status(500).json({ ok: false, msg: 'Error del sistema, comuniquese con el administrador' });
  }
};

const resetPassword = async ({ params, body }: Request, res: Response) => {
  const { token } = params;
  const { password } = body;

  try {
    const user = await userModel.findOne({ token });
    if (!user) return res.status(404).json({ ok: false, msg: 'Token no válido o expirado' });
    if (!user.confirmed) return res.status(401).json({ ok: false, msg: 'Falta confirmar su correo electronico' });

    user.token = '';
    user.password = password;
    const { _id, name, lastname, email } = await user.save();

    return res.status(200).json({
      ok: true,
      user: { _id, name, lastname, email },
      msg: 'Contraseña actualizada correctamente'
    });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: 'Error del sistema, comuniquese con el administrador' });
  }
};

//Routes Privates
const userProfile = ({ user }: UserRequest, res: Response) => {
  if (!user) return res.status(401).json({ ok: false, msg: 'No tiene autorización' });
  const { _id, name, lastname, email, phone, address } = user;

  try {
    return res.status(200).json({
      ok: true,
      user: { _id, name, lastname, email, phone, address },
    });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: 'Error del sistema, comuniquese con el administrador' });
  }
};

const updateUserProfile = async ({ params, body, user }: UserRequest, res: Response) => {
  if (!user) return res.status(401).json({ ok: false, msg: 'No tiene autorización' });
  const { id } = params;
  const { email } = body;
  const { _id } = user;

  try {
    const user = await userModel.findById(id);
    if (!user) return res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
    if (!user.confirmed) return res.status(401).json({ ok: false, msg: 'Falta confirmar su correo electronico' });

    if (user.email !== email) {
      const emailExist = await userModel.findOne({ email });
      if (emailExist) return res.status(400).json({ ok: false, msg: 'El email ya está en uso' });
    }

    if (user._id.toString() !== _id.toString()) return res.status(401).json({ ok: false, msg: 'No autorizado para esta acción' });

    const updatedUser = await userModel.findByIdAndUpdate(id, { ...body }, { new: true });

    return res.status(200).json({
      ok: true,
      user: updatedUser,
      msg: 'Perfil actualizado correctamente'
    });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: 'Error del sistema, comuniquese con el administrador' });
  }
};

const updateUserPassword = async ({ params, body, user }: UserRequest, res: Response) => {
  if (!user) return res.status(401).json({ ok: false, msg: 'No tiene autorización' });
  const { id } = params;
  const { oldPassword, newPassword } = body;

  try {
    const user = await userModel.findById(id);
    if (!user) return res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
    if (!user.confirmed) return res.status(401).json({ ok: false, msg: 'Falta confirmar su correo electronico' });

    const validPassword = comparePassword(oldPassword, user.password);
    if (!validPassword) return res.status(404).json({ ok: false, msg: 'La contraseña actual es incorrecta' });

    if (user._id.toString() !== user._id.toString()) return res.status(401).json({ ok:false, msg: 'No autorizado para esta acción' });

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      ok: true,
      msg: 'Contraseña actualizada correctamente'
    })
  } catch (error) {
    return res.status(500).json({ ok: false, msg: 'Error del sistema, comuniquese con el administrador' });
  }
};


const revalidateAuth = async ({ user }: UserRequest, res: Response) => {
  try {
    if (!user) return res.status(401).json({ ok: false, msg: 'No hay usuario autenticado' });
    const { _id, name, lastname, email, phone, address } = user;

    return res.status(201).json({
      ok: true,
      user: { _id, name, lastname, email, phone, address },
      jwt: generateJWT(_id, email),
    });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: 'Error del sistema, comuniquese con el administrador' });
  }
}

export {
  userAuth,
  userRegister,
  confirmAccount,
  forgotPassword,
  validateToken,
  resetPassword,

  //PRIVATE
  userProfile,
  updateUserProfile,
  updateUserPassword,
  revalidateAuth,
};
