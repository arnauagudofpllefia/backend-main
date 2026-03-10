import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import alumnosRoutes from '../routes/alumnos.routes.js';
import { connectDB } from '../config/database.js';

const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL || '*';

// ensure MongoDB is connected before handling requests (works in Vercel serverless)
let dbConnected = false;
const ensureConnection = async () => {
  if (dbConnected || mongoose.connection.readyState !== 0) {
    return;
  }
  await connectDB();
  dbConnected = true;
};


app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// database middleware for serverless functions
app.use(async (req, res, next) => {
  try {
    await ensureConnection();
    next();
  } catch (error) {
    res.status(500).json({
      error: 'Error de conexión a la base de datos',
      message: error.message,
    });
  }
});


app.get('/', (req, res) => {
  res.json({ 
    message: 'API de Gestión de Alumnos',
    version: '1.0.0',
    endpoints: {
      alumnos: '/api/alumnos',
    },
  });
});

app.use('/api/alumnos', alumnosRoutes);


app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});


export default app;
