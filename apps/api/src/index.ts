import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import healthRoutes from './routes/health';
import authRoutes from './routes/auth';
import notaRoutes from './routes/nota';
import anggotaRoutes from './routes/anggota';
import barangRoutes from './routes/barang';
import periodeRoutes from './routes/periode';
import laporanRoutes from './routes/laporan';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.API_PORT || 3000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Public routes
app.use('/uploads', express.static(path.join(__dirname, '..', '..', 'uploads')));
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);

// Protected routes (placeholder — future CRUD routes go here)
app.use('/api', authMiddleware);
app.use('/api/anggota', anggotaRoutes);
app.use('/api/barang', barangRoutes);
app.use('/api/nota', notaRoutes);
app.use('/api/periode', periodeRoutes);
app.use('/api/laporan', laporanRoutes);

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
