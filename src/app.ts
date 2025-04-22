import express from "express";
import "dotenv/config";
import cors from "cors";
import { dbConnection } from "./database/config";
import authRoutes from "./routes/auth.routes";
import patientRoutes from "./routes/patient.routes";

import swaggerUI from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";
import { swaggerOptions } from "./swagger";

const port = +(process.env.PORT || 4001);
const app = express();
dbConnection();

app.use(cors());

app.use(express.json());

const configSwagger = swaggerJsDoc(swaggerOptions);

app.use("/api/auth", authRoutes);
app.use("/api/patient", patientRoutes);

app.use("/api-doc", swaggerUI.serve, swaggerUI.setup(configSwagger));

app.listen(port, () => {
  console.log(`Documentation available at: http://localhost:${port}/api-doc`);
});
