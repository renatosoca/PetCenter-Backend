import mongoose from 'mongoose';
import dotenv from 'dotenv/config';

export const dbConnection = async () => {
  mongoose.set("strictQuery", false);

  try {
    const db = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log(`Port: ${db.connection.port}. Database: ${db.connection.name}`)
  } catch (error) {
    console.log(error);
    throw new Error('Error connecting to database');
  }
}