import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import providerRoutes from './routes/provider.js'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors({
  origin: 'http://localhost:5174',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

//middlewares
app.use('/api/auth', authRoutes);
app.use("/api/provider", providerRoutes);

app.get('/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});