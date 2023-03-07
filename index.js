import express from 'express';
import cors from 'cors';
import VeterinarioRoutes from './routes/VeterinarioRoutes.js';
import PacienteRoutes from './routes/PacienteRouter.js';
import { dbConnection } from './database/config.js';

const app = express();
dbConnection();
//connectDB();

/* const dominiosPermitidos = [process.env.FRONTEND_URI];
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
app.use(cors(corsOptions)); */

app.use(cors({origin: '*'}));

app.use( express.json() );

//Change Routes
app.use('/api/veterinarios', VeterinarioRoutes);
app.use('/api/pacientes', PacienteRoutes);

const port = process.env.PORT || 4000;
app.listen( port, () => {
    console.log(`Run server on Port: ${port}`);
});