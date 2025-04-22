import { set, connect, ConnectOptions } from "mongoose";

export const dbConnection = async () => {
  set("strictQuery", false);

  try {
    const host = process.env.DB_HOST || "";
    const port = process.env.DB_PORT || "";
    const dbName = process.env.DB_NAME || "";
    const mongoUri: string = `${host}:${port}/${dbName}`;

    const db = await connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as ConnectOptions);

    console.log(`PORT: ${db.connection.port} | Database: ${db.connection.name}`);
  } catch (error) {
    console.log(error);
    setTimeout(dbConnection, 5000);
  }
};
