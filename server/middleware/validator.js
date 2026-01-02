import { AppError } from './errorHandler.js';

// Email validation
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Sanitize input to prevent XSS
export const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input.trim().replace(/[<>]/g, '');
};

// Validate login input
export const validateLogin = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new AppError('Email and password are required', 400);
    }

    if (!isValidEmail(email)) {
        throw new AppError('Invalid email format', 400);
    }

    req.body.email = sanitizeInput(email);
    req.body.password = sanitizeInput(password);

    next();
};

// Validate blog input
export const validateBlog = (req, res, next) => {
    try {
        const blog = req.body.blog ? JSON.parse(req.body.blog) : {};
        const { title, description, category } = blog;

        if (!title || !description || !category) {
            throw new AppError('Title, description, and category are required', 400);
        }

        if (title.length < 3 || title.length > 200) {
            throw new AppError('Title must be between 3 and 200 characters', 400);
        }

        if (description.length < 50) {
            throw new AppError('Description must be at least 50 characters', 400);
        }

        next();
    } catch (error) {
        if (error instanceof SyntaxError) {
            throw new AppError('Invalid blog data format', 400);
        }
        throw error;
    }
};

// Validate comment input
export const validateComment = (req, res, next) => {
    const { name, content } = req.body;

    if (!name || !content) {
        throw new AppError('Name and content are required', 400);
    }

    if (name.length < 2 || name.length > 50) {
        throw new AppError('Name must be between 2 and 50 characters', 400);
    }

    if (content.length < 5 || content.length > 1000) {
        throw new AppError('Comment must be between 5 and 1000 characters', 400);
    }

    req.body.name = sanitizeInput(name);
    req.body.content = sanitizeInput(content);

    next();
};

// Validate email subscription
export const validateSubscription = (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        throw new AppError('Email is required', 400);
    }

    if (!isValidEmail(email)) {
        throw new AppError('Invalid email format', 400);
    }

    req.body.email = sanitizeInput(email).toLowerCase();

    next();
};

// Validate MongoDB ObjectId
export const validateObjectId = (req, res, next) => {
    const { id } = req.params;
    
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new AppError('Invalid ID format', 400);
    }

    next();
};
