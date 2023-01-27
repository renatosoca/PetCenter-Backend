import express from 'express';
import connectDB from './config/db.js';
import VeterinarioRoutes from './routes/VeterinarioRoutes.js';
import PacienteRoutes from './routes/PacienteRouter.js';

const app = express();
connectDB();

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