import express from 'express';
import VeterinarioRoutes from './routes/VeterinarioRoutes.js';
import connectDB from './config/db.js';

const app = express();
connectDB();

const port = process.env.PORT || 4000;

//Habilitar Lectura de Datos de los Formularios
app.use(express.urlencoded({ extended: true }));

//Asignar Router
app.use('/api/veterinarios', VeterinarioRoutes);

//Generar Servidor
app.listen( port, () => {
    console.log(`Corriendo en el Puerto: ${port}`);
});