import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import VeterinarioRoutes from './routes/VeterinarioRoutes.js';
import PacienteRoutes from './routes/PacienteRouter.js';

const app = express();
connectDB();

//Para definir quienes tendran Acceso.
const dominiosPermitidos = [process.env.FRONTEND_URI];
const corsOptions = {
    origin: function( origin, callback ) {
        if (dominiosPermitidos.indexOf(origin) !== -1) {
            //El origen del Request está permitido
            callback(null, true);
        } else {
            callback( new Error('No permitido por CORS'))
        };
    },
};
app.use(cors(corsOptions));
//Todos tienen Acceso
/* app.use(cors({origin: '*'})); */

//Definir el Puerto
const port = process.env.PORT || 4000;

//Habilitar Lectura de JSON
app.use( express.json() );

//Asignar Router
app.use('/api/veterinarios', VeterinarioRoutes);
app.use('/api/pacientes', PacienteRoutes);

//Generar Servidor
app.listen( port, () => {
    console.log(`Corriendo en el Puerto: ${port}`);
});