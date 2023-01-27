import nodemailer from 'nodemailer';

const emailOlvidePass = async (datos) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
    });

    //Enviar Email
    const { email, nombre, token } = datos;
    const info = await transporter.sendMail({
        from: 'administracion@gamil.com',
        to: email,
        subject: 'Reestablece tu Contraseña',
        html: `
            <p>Hola ${nombre}, has solicitado reestablecer tu contraseña</p>
            <p>Sigue el siguiente enlace para generar tu nueva contraseña:
            <a href="${process.env.FRONTEND_URI}/olvide-password/${token}" target="_black">Nueva Contraseña</a></p>

            <p>Si tu no creaste esta cuenta, puedes ignorar este mensaje</p>
        `
    });
    console.log('Mensaje Enviado de Recuperar: %s', info.messageId);
}

export default emailOlvidePass;