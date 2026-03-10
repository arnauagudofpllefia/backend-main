import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;



export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log(' Conectado a MongoDB Atlas');
  } catch (error) {
    console.error(' Error al conectar a MongoDB Atlas:', error.message);
    process.exit(1);
  }
};


mongoose.connection.on('disconnected', () => {
  console.log(' Desconectado de MongoDB Atlas');
});

mongoose.connection.on('error', (error) => {
  console.error(' Error de MongoDB Atlas:', error);
});

