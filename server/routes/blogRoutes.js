import express from 'express';
import { addBlog, addComment, deleteBlogById, generateContent, generateImage, generateSEO, getAllBlogs, getBlogById, getBlogComments, togglePublish, updateBlog } from '../controllers/blogController.js';
import auth from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import upload from '../middleware/multer.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import { validateComment, validateObjectId } from '../middleware/validator.js';

const blogRouter = express.Router();

// Auth first to avoid unnecessary upload work on unauthorized requests
blogRouter.post('/add', auth, upload.single('image'), asyncHandler(addBlog));
blogRouter.put('/update/:id', auth, validateObjectId, upload.single('image'), asyncHandler(updateBlog));
blogRouter.get('/all', asyncHandler(getAllBlogs));
blogRouter.get('/:id', validateObjectId, asyncHandler(getBlogById));
blogRouter.delete('/:id', auth, validateObjectId, asyncHandler(deleteBlogById));
blogRouter.post('/toggle-publish/:id', auth, validateObjectId, asyncHandler(togglePublish));

blogRouter.post('/add-comment/:id', validateObjectId, validateComment, asyncHandler(addComment));
blogRouter.get('/comments/:id', validateObjectId, asyncHandler(getBlogComments));
blogRouter.post('/generate-content', auth, aiLimiter, asyncHandler(generateContent));
blogRouter.post('/generate-seo', auth, aiLimiter, asyncHandler(generateSEO));
blogRouter.post('/generate-image', auth, aiLimiter, asyncHandler(generateImage));

export default blogRouter;