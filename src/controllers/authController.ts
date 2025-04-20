import { Request, Response } from "express";
import { userModel } from "../models";
import { comparePassword, emailUserRegister, emailUserResetPass, generateJWT, generateToken, hashPassword } from "../helpers";
import { UserRequest } from "../interfaces";

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: u18215194@gmail.com
 *               password:
 *                 type: string
 *                 example: 12345678
 *     responses:
 *       200:
 *         description: Autenticación exitosa
 *       403:
 *         description: Credenciales incorrectas o cuenta no confirmada
 *       404:
 *         description: Usuario no encontrado
 */

export const userAuth = async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };

  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.status(404).json({ ok: false, msg: "No existe un usuario con este email" });
    if (!user.confirmed) return res.status(403).json({ ok: false, msg: "Falta confirmar su correo electrónico" });

    const validPassword = comparePassword(password, user.password);
    if (!validPassword) return res.status(403).json({ ok: false, msg: "Email o contraseña incorrecto" });

    return res.status(200).json({
      ok: true,
      jwt: generateJWT(user),
    });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: "Error del sistema, comuníquese con el administrador" });
  }
};

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - lastname
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               lastname:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario registrado correctamente
 *       400:
 *         description: Ya existe un usuario con ese email
 *       500:
 *         description: Error del servidor
 */

export const userRegister = async ({ body }: Request, res: Response) => {
  const { email } = body;

  try {
    const userExist = await userModel.findOne({ email });
    if (userExist) return res.status(400).json({ ok: false, msg: "Ya existe un usuario con ese email" });

    const user = new userModel(body);
    user.password = hashPassword(user.password);
    const { token, name, lastname } = await user.save();

    await emailUserRegister(email, name, lastname, token);

    return res.status(200).json({
      ok: true,
      msg: "Hemos enviado las instrucciones a tu correo electrónico",
    });
  } catch (e) {
    return res.status(500).json({ ok: false, msg: "Error del sistema, comuníquese con el administrador" });
  }
};

/**
 * @swagger
 * /api/auth/confirm/{token}:
 *   get:
 *     tags: [Auth]
 *     parameters:
 *       - name: token
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Cuenta confirmada correctamente
 *       404:
 *         description: Token no válido o cuenta ya confirmada
 *       500:
 *         description: Error del servidor
 */

export const confirmAccount = async ({ params }: Request, res: Response) => {
  const { token } = params;

  try {
    const user = await userModel.findOne({ token });
    if (!user) return res.status(404).json({ ok: false, msg: "Token no válido o expirado" });
    if (user.confirmed)
      return res.status(404).json({
        ok: false,
        msg: "Su cuenta ya ha sido confirmada anteriormente, por lo que no es necesario que intente confirmarla de nuevo. Por favor, utilice la información de inicio de sesión que se le proporcionó anteriormente para acceder a su cuenta.",
      });

    user.confirmed = true;
    user.token = "";
    await user.save();

    return res.status(201).json({
      ok: true,
      msg: "Cuenta confirmada correctamente",
    });
  } catch (e) {
    return res.status(500).json({ ok: false, msg: "Error del sistema, comuníquese con el administrador" });
  }
};

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Instrucciones enviadas al correo electrónico
 *       404:
 *         description: Usuario no encontrado
 *       401:
 *         description: Cuenta no confirmada
 *       500:
 *         description: Error del servidor
 */

export const forgotPassword = async ({ body }: Request, res: Response) => {
  const { email } = body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.status(404).json({ ok: false, msg: "No existe un usuario con ese correo electrónico" });
    if (!user.confirmed) return res.status(401).json({ ok: false, msg: "falta confirmar su correo electrónico" });

    user.token = generateToken();
    const { name, lastname, token } = await user.save();

    await emailUserResetPass(email, name, lastname, token);

    return res.status(201).json({
      ok: true,
      msg: "Hemos enviado las instrucciones a su correo electrónico",
    });
  } catch (e) {
    return res.status(500).json({ ok: false, msg: "Error del sistema, comuníquese con el administrador" });
  }
};

/**
 * @swagger
 * /api/auth/forgot-password/{token}:
 *   get:
 *     tags: [Auth]
 *     parameters:
 *       - name: token
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Token válido
 *       404:
 *         description: Token no válido
 *       401:
 *         description: Cuenta no confirmada
 *       500:
 *         description: Error del servidor
 */

export const validateToken = async ({ params }: Request, res: Response) => {
  const { token } = params;

  try {
    const user = await userModel.findOne({ token });
    if (!user) return res.status(404).json({ ok: false, msg: "Token no válido o expirado" });
    if (!user.confirmed) return res.status(401).json({ ok: false, msg: "Falta confirmar su correo electrónico" });

    return res.status(201).json({
      ok: true,
      msg: "Por favor, ingrese su nueva contraseña",
    });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: "Error del sistema, comuníquese con el administrador" });
  }
};

/**
 * @swagger
 * /api/auth/forgot-password/{token}:
 *   post:
 *     tags: [Auth]
 *     parameters:
 *       - name: token
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Contraseña actualizada correctamente
 *       404:
 *         description: Token no válido
 *       401:
 *         description: Cuenta no confirmada
 *       500:
 *         description: Error del servidor
 */

export const resetPassword = async ({ params, body }: Request, res: Response) => {
  const { token } = params;
  const { password } = body;

  try {
    const user = await userModel.findOne({ token });
    if (!user) return res.status(404).json({ ok: false, msg: "Token no válido o expirado" });
    if (!user.confirmed) return res.status(401).json({ ok: false, msg: "Falta confirmar su correo electrónico" });

    user.token = "";
    user.password = hashPassword(password);
    const updatedUser = await user.save();

    return res.status(201).json({
      ok: true,
      jwt: generateJWT(updatedUser),
      msg: "Contraseña actualizada correctamente",
    });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: "Error del sistema, comuníquese con el administrador" });
  }
};

//Routes Privates

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil de usuario
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */

export const userProfile = ({ user }: UserRequest, res: Response) => {
  if (!user) return res.status(401).json({ ok: false, msg: "No tiene autorización" });

  try {
    return res.status(200).json({
      ok: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: "Error del sistema, comuníquese con el administrador" });
  }
};

/**
 * @swagger
 * /api/auth/profile/{id}:
 *   put:
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               lastname:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario actualizado correctamente
 *       404:
 *         description: Usuario no encontrado
 *       401:
 *         description: No autorizado
 *       400:
 *         description: El email ya está en uso
 *       500:
 *         description: Error del servidor
 */

export const updateUserProfile = async ({ params, body, user }: UserRequest, res: Response) => {
  if (!user) return res.status(401).json({ ok: false, msg: "No tiene autorización" });
  const { id } = params;
  const { email } = body;
  const { _id } = user;

  try {
    const user = await userModel.findById(id);
    if (!user) return res.status(404).json({ ok: false, msg: "Usuario no encontrado" });
    if (!user.confirmed) return res.status(401).json({ ok: false, msg: "Falta confirmar su correo electrónico" });

    if (user._id.toString() !== _id.toString()) return res.status(401).json({ ok: false, msg: "No autorizado para esta acción" });

    if (user.email !== email) {
      const emailExist = await userModel.findOne({ email });
      if (emailExist) return res.status(400).json({ ok: false, msg: "El email ya está en uso" });
    }

    const updatedUser = await userModel.findByIdAndUpdate(id, { ...body }, { new: true });

    return res.status(201).json({
      ok: true,
      user: updatedUser,
      msg: "Usuario actualizado correctamente",
    });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: "Error del sistema, comuníquese con el administrador" });
  }
};

/**
 * @swagger
 * /api/auth/profile-password/{id}:
 *   put:
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       201:
 *         description: Contraseña actualizada correctamente
 *       404:
 *         description: Usuario no encontrado o contraseña actual incorrecta
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */

export const updateUserPassword = async ({ params, body, user }: UserRequest, res: Response) => {
  if (!user) return res.status(401).json({ ok: false, msg: "No tiene autorización" });
  const { id } = params;
  const { oldPassword, newPassword } = body;

  try {
    const user = await userModel.findById(id);
    if (!user) return res.status(404).json({ ok: false, msg: "Usuario no encontrado" });
    if (!user.confirmed) return res.status(401).json({ ok: false, msg: "Falta confirmar su correo electrónico" });

    const validPassword = comparePassword(oldPassword, user.password);
    if (!validPassword) return res.status(404).json({ ok: false, msg: "La contraseña actual es incorrecta" });

    if (user._id.toString() !== user._id.toString()) return res.status(401).json({ ok: false, msg: "No autorizado para esta acción" });

    user.password = hashPassword(newPassword);
    await user.save();

    return res.status(201).json({
      ok: true,
      msg: "Contraseña actualizada correctamente",
    });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: "Error del sistema, comuníquese con el administrador." });
  }
};

/**
 * @swagger
 * /api/auth/revalidate:
 *   get:
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: JWT renovado exitosamente
 *       401:
 *         description: Usuario no autenticado
 *       500:
 *         description: Error del servidor
 */

export const revalidateAuth = async ({ user }: UserRequest, res: Response) => {
  if (!user) return res.status(401).json({ ok: false, msg: "No hay usuario autenticado" });

  try {
    return res.status(201).json({
      ok: true,
      jwt: generateJWT(user),
    });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: "Error del sistema, comuníquese con el administrador" });
  }
};
