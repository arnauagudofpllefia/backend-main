
import express from 'express';
import cors from 'cors';
import { connectDB } from '../config/database.js';
import alumnosRoutes from '../routes/alumnos.routes.js';

const app = express();

app.use(cors({
  origin: 'https://anuario-react.vercel.app',
  credentials: true,
}));
app.use(express.json());
app.use('/api/alumnos', alumnosRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

await connectDB();


export default app;