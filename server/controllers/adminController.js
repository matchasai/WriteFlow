import jwt from 'jsonwebtoken';
import { AppError } from '../middleware/errorHandler.js';
import Blog from '../models/Blog.js';
import Comment from '../models/Comment.js';

export const adminLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.Admin_EMAIL;
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.Admin_Password;

        if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
            return res.status(401).json({ success: false, message: "Invalid Credentials" });
        }

        // Token expires in 12 hours
        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '12h' });
        res.status(200).json({ success: true, token, message: "Login successful" });
    } catch (error) {
        next(error);
    }
};

export const getAllBlogsAdmin = async (req, res, next) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, blogs });
    } catch (error) {
        next(error);
    }
};

export const getAllComments = async (req, res, next) => {
    try {
        const comments = await Comment.find({}).sort({ createdAt: -1 }).populate('blogId');
        res.status(200).json({ success: true, comments });
    } catch (error) {
        next(error);
    }
};

export const getDashboard = async (req, res, next) => {
    try {
        const recentBlogs = await Blog.find({}).sort({ createdAt: -1 }).limit(5);
        const blogs = await Blog.countDocuments();
        const comments = await Comment.countDocuments();
        const drafts = await Blog.countDocuments({ isPublished: false });

        const dashboardData = {
            blogs,
            comments,
            drafts,
            recentBlogs
        };

        res.status(200).json({ success: true, dashboardData });
    } catch (error) {
        next(error);
    }
};

export const deleteCommentById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const comment = await Comment.findByIdAndDelete(id);
        
        if (!comment) {
            throw new AppError('Comment not found', 404);
        }

        res.status(200).json({ success: true, message: "Comment deleted successfully" });
    } catch (error) {
        next(error);
    }
};

export const approveCommentById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const comment = await Comment.findByIdAndUpdate(id, { isApproved: true }, { new: true });
        
        if (!comment) {
            throw new AppError('Comment not found', 404);
        }

        res.status(200).json({ success: true, message: "Comment approved successfully" });
    } catch (error) {
        next(error);
    }
};