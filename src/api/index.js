import express from 'express';
import { connectDB } from '../../config/database.js';
import alumnosRoutes from '../../routes/alumnos.routes.js';

const app = express();
app.use(express.json());
app.use('/api/alumnos', alumnosRoutes);

await connectDB();
export default app;