import express from 'express';
import cors from 'cors';
import { connectDB } from '../config/database.js';
import alumnosRoutes from '../routes/alumnos.routes.js';

const app = express();

// Almacenar estado de conexión
let isConnected = false;
let connectionError = null;

// Configuración CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint de salud para diagnosticar
app.get('/api/health', (req, res) => {
  const health = {
    status: isConnected ? 'connected' : 'disconnected',
    mongodb: isConnected ? 'OK' : 'ERROR',
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV || 'not set',
      MONGODB_URI_CONFIGURED: !!process.env.MONGODB_URI,
    },
  };

  if (connectionError) {
    health.error = connectionError;
  }

  const statusCode = isConnected ? 200 : 503;
  res.status(statusCode).json(health);
});

// Middleware para conectar a BD si es necesario (excepto para health check)
app.use((req, res, next) => {
  // Saltar BD para ciertas rutas
  if (req.path === '/api/health' || req.path === '/') {
    return next();
  }

  if (!isConnected && !connectionError) {
    // Primera vez: intentar conectar
    return connectToDB(req, res, next);
  } else if (connectionError) {
    // Ya hubo error de conexión
    return res.status(503).json({
      error: 'Servicio no disponible - Error de conexión a BD',
      message: process.env.NODE_ENV === 'development' ? connectionError : undefined,
    });
  }

  next();
});

// Función para conectar a BD
async function connectToDB(req, res, next) {
  try {
    console.log('[' + new Date().toISOString() + '] Intentando conectar a MongoDB...');
    await connectDB();
    isConnected = true;
    connectionError = null;
    console.log('[' + new Date().toISOString() + '] ✓ Conectado a MongoDB');
    next();
  } catch (error) {
    connectionError = error.message;
    console.error('[' + new Date().toISOString() + '] ✗ Error de conexión:', error.message);
    return res.status(503).json({
      error: 'Servicio no disponible',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
      code: 'DATABASE_CONNECTION_FAILED',
    });
  }
}

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: 'API de Gestión de Alumnos',
    version: '1.0.0',
    status: isConnected ? 'operational' : 'initializing',
    endpoints: {
      alumnos: '/api/alumnos',
      health: '/api/health',
    },
  });
});

// Rutas de alumnos
app.use('/api/alumnos', alumnosRoutes);

// Middleware 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.path,
  });
});

// Middleware de errores
app.use((err, req, res, next) => {
  console.error('[ERROR]', new Date().toISOString(), err);
  res.status(err.status || 500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

export default app;