import mongoose from 'mongoose';
import dotenv from 'dotenv/config';

const connectDB = async () => {
    mongoose.set("strictQuery", false);

    try {
        const db = await mongoose.connect(process.env.MONGO_URI,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        const url = `${db.connection.host}: ${db.connection.port}`;
        /* console.log(url); */
    } catch (error) {
        /* console.log(`Error en ${error}`); */
        process.exit(1);
    };
};

export default connectDB;