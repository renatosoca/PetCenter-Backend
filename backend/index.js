import express from 'express';
import router from './routes/index.js';

const app = express();

const port = 4000;

app.use('/', router);

app.listen( port, () => {
    console.log(`Corriendo en el Puerto: ${port}`);
});