import express from 'express';
import cors from 'cors';
import { connectDB } from '../config/database.js';
import alumnosRoutes from '../routes/alumnos.routes.js';

const app = express();

// Almacenar estado de conexión
let isConnected = false;

// Configuración CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para conectar a BD si es necesario
app.use(async (req, res, next) => {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
      console.log('✓ Conectado a MongoDB');
    } catch (error) {
      console.error('✗ Error al conectar a MongoDB:', error.message);
      return res.status(500).json({
        error: 'Error de conexión a la base de datos',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
  next();
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: 'API de Gestión de Alumnos',
    version: '1.0.0',
    endpoints: {
      alumnos: '/api/alumnos',
    },
  });
});

// Rutas de alumnos
app.use('/api/alumnos', alumnosRoutes);

// Middleware 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Middleware de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

export default app;