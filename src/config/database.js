import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const normalizeMongoUri = (rawValue) => {
  if (!rawValue) return '';

  let uri = rawValue.trim();

  // Permite valores mal pegados en plataformas (ej: "MONGODB_URI=mongodb+srv://...")
  if (uri.startsWith('MONGODB_URI=')) {
    uri = uri.slice('MONGODB_URI='.length).trim();
  }

  // Quitar comillas accidentales
  uri = uri.replace(/^['\"]|['\"]$/g, '');

  return uri;
};

const MONGODB_URI = normalizeMongoUri(process.env.MONGODB_URI);

// Validar que MONGODB_URI existe
if (!MONGODB_URI) {
  console.warn('⚠️  ADVERTENCIA: MONGODB_URI no está configurada');
}

export const connectDB = async () => {
  // Validar configuración
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI no está configurada. Configúrala en las variables de entorno.');
  }

  if (!MONGODB_URI.startsWith('mongodb://') && !MONGODB_URI.startsWith('mongodb+srv://')) {
    throw new Error('MONGODB_URI inválida. Debe empezar por mongodb:// o mongodb+srv://');
  }

  // Evitar reconexiones innecesarias
  if (mongoose.connection.readyState === 1) {
    console.log('✓ Ya conectado a MongoDB Atlas');
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✓ Conectado a MongoDB Atlas');
  } catch (error) {
    console.error('✗ Error al conectar a MongoDB Atlas:', error.message);
    throw error; // Re-lanzar en lugar de hacer process.exit()
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  Desconectado de MongoDB Atlas');
});

mongoose.connection.on('error', (error) => {
  console.error('✗ Error de MongoDB:', error.message);
});

