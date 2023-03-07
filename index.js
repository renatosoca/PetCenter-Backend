import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import { dbConnection } from './database/config.js';

const app = express();
dbConnection();

app.use(cors({origin: '*'}));

app.use( express.json() );

//Change Routes
app.use( '/api/auth', authRoutes );
app.use('/api/patient', patientRoutes);

const port = process.env.PORT || 4000;
app.listen( port, () => {
    console.log(`Run server on Port: ${port}`);
});