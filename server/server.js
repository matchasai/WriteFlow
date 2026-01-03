import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import connectDB from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import adminRouter from './routes/adminRoutes.js';
import blogRouter from './routes/blogRoutes.js';
import newsletterRouter from './routes/newsletterRoutes.js';

process.setMaxListeners(20);

const app = express();

// If deployed behind a reverse proxy (Render/Vercel/Nginx), this allows req.ip to be the real client IP.
app.set('trust proxy', 1);

// Connect to database with error handling
try {
    await connectDB();
} catch (error) {
    console.error("Failed to connect to database:", error.message);
    process.exit(1);
}

// CORS Configuration
const parseAllowedOrigins = () => {
    const raw = process.env.CLIENT_URL || '';
    return raw
        .split(',')
    .map((s) => s.trim().replace(/\/+$/, ''))
        .filter(Boolean);
};

const isSameHostOrigin = (origin, host) => {
    if (!origin || !host) return false;
    try {
        const url = new URL(origin);
        return url.host === host;
    } catch {
        return false;
    }
};

const corsOptionsDelegate = (req, callback) => {
    const requestOrigin = req.header('Origin');
    const requestHost = req.header('Host');
    const allowedOrigins = parseAllowedOrigins();

    const allowOrigin =
        !requestOrigin ||
        allowedOrigins.length === 0 ||
        allowedOrigins.includes(requestOrigin) ||
        isSameHostOrigin(requestOrigin, requestHost);

    callback(null, {
        origin: allowOrigin,
        credentials: true,
        optionsSuccessStatus: 200
    });
};

// Middleware
app.use(cors(corsOptionsDelegate));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

// Routes
app.get('/api/health', (req, res) => res.json({ success: true }));
app.use('/api/admin', adminRouter);
app.use('/api/blogs', blogRouter);
app.use('/api/newsletter', newsletterRouter);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);
});

export default app;