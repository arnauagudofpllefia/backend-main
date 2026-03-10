import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import alumnosRoutes from '../routes/alumnos.routes.js';

const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL || '*';


app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


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
