import express from 'express';
import 'dotenv/config';
import cors, { CorsOptions } from 'cors';
import { dbConnection } from './database/config';
import { authRoutes, patientRoutes } from './routes';

const app = express();
dbConnection();

const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    if (origin && [process.env.FRONTEND_URI].indexOf(origin) !== -1) return callback(null, true);

    return callback(new Error('Not authorized by CORS'), false);
  },
};
app.use(cors(corsConfig));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);

const port = process.env.PORT || 4001;
app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
