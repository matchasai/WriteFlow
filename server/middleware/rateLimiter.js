// Simple in-memory rate limiter
const requestCounts = new Map();

// Clean up old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, data] of requestCounts.entries()) {
        // Remove entries that haven't been touched since their window ended.
        // `resetTime` is the window end timestamp; after that, keep a short grace
        // period so clients can reuse the same key without unbounded growth.
        if (now > data.resetTime + 60_000) {
            requestCounts.delete(key);
        }
    }
}, 300000);

export const rateLimiter = (options = {}) => {
    const {
        windowMs = 60000, // 1 minute window
        max = 100, // Max 100 requests per window
        message = 'Too many requests, please try again later'
    } = options;

    return (req, res, next) => {
        const key = req.ip || req.connection.remoteAddress;
        const now = Date.now();

        if (!requestCounts.has(key)) {
            requestCounts.set(key, {
                count: 1,
                resetTime: now + windowMs
            });
            return next();
        }

        const data = requestCounts.get(key);

        // Reset if window expired
        if (now > data.resetTime) {
            data.count = 1;
            data.resetTime = now + windowMs;
            return next();
        }

        // Check if limit exceeded
        if (data.count >= max) {
            const retryAfter = Math.max(1, Math.ceil((data.resetTime - now) / 1000));
            res.set('Retry-After', String(retryAfter));
            return res.status(429).json({
                success: false,
                message,
                retryAfter
            });
        }

        data.count++;
        next();
    };
};

// Specific rate limiters
export const loginLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 login attempts per 15 minutes
    message: 'Too many login attempts. Please try again after 15 minutes'
});

export const apiLimiter = rateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: 'Too many requests from this IP'
});

export const aiLimiter = rateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // 5 AI requests per minute
    message: 'AI generation limit reached. Please wait before trying again'
});
