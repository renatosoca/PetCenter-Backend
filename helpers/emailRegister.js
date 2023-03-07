import nodemailer from 'nodemailer';

const emailRegister = async (datos) => {
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
        subject: 'Confirma tu Cuenta',
        html: `
            <p>Hola ${nombre}, comprueba tu cuenta en APV</p>
            <p>Tu cuenta ya está lista, solo debes comprobarla en el siguiente enlace:
            <a href="${process.env.FRONTEND_URI}/confirmar/${token}" target="_black">Confirmar Cuenta</a></p>
            
            <p>Si tu no creaste esta cuenta, puedes ignorar este mensaje</p>
        `
    });
    console.log(`Message send: ${info.messageId}`);
};

export default emailRegister;