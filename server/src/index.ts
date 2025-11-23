import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/authRoutes';
import tournamentRoutes from './routes/tournamentRoutes';
import transactionRoutes from './routes/transactionRoutes';
import winnerRoutes from './routes/winnerRoutes';
import cancelRoutes from './routes/cancelRoutes';

dotenv.config();

const app = express();
export const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Basic health check
app.get('/', (req, res) => {
    res.json({ message: 'Esports API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/winner', winnerRoutes);
app.use('/api/cancel', cancelRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
});

