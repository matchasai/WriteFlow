import fs from 'fs';
import main from '../config/gemini.js';
import imagekit from '../config/imagekit.js';
import { AppError } from '../middleware/errorHandler.js';
import Blog from '../models/Blog.js';
import Comment from '../models/Comment.js';

export const updateBlog = async (req, res, next) => {
    const imageFile = req.file;
    try {
        const { id } = req.params;
        const { title, subTitle, description, category, isPublished, metaDescription, tags, imageUrl } = JSON.parse(req.body.blog);

        if (!title || !description || !category) {
            throw new AppError("Title, description, and category are required", 400);
        }

        const updateData = {
            title,
            subTitle,
            description,
            category,
            isPublished,
            metaDescription,
            tags
        };

        if (imageUrl) {
            updateData.image = imageUrl;
        }

        // Only update image if a new one is provided
        if (imageFile) {
            const fileBuffer = fs.readFileSync(imageFile.path);
            
            // Upload new image to ImageKit
            const response = await imagekit.upload({
                file: fileBuffer,
                fileName: imageFile.originalname,
                folder: "/blogs"
            });

            // Optimize image URL
            const optimizedImageUrl = imagekit.url({
                path: response.filePath,
                transformation: [
                    { quality: 'auto' },
                    { format: 'webp' },
                    { width: '1280' }
                ]
            });

            updateData.image = optimizedImageUrl;
        }

        const updatedBlog = await Blog.findByIdAndUpdate(id, updateData, { new: true });
        
        if (!updatedBlog) {
            throw new AppError("Blog not found", 404);
        }

        res.status(200).json({ success: true, message: "Blog updated successfully", blog: updatedBlog });
    } catch (error) {
        next(error);
    } finally {
        if (imageFile?.path) {
            fs.promises.unlink(imageFile.path).catch(() => {});
        }
    }
};

export const addBlog = async (req, res, next) => {
    const imageFile = req.file;
    try {
        const { title, subTitle, description, category, isPublished, metaDescription, tags, imageUrl } = JSON.parse(req.body.blog);

        if (!title || !description || !category) {
            throw new AppError("Title, description, and category are required", 400);
        }

        if (!imageFile && !imageUrl) {
            throw new AppError("Provide an image upload or generate an image", 400);
        }

        let image = imageUrl;

        if (imageFile) {
            const fileBuffer = fs.readFileSync(imageFile.path);
            
            // Uploading image to ImageKit
            const response = await imagekit.upload({
                file: fileBuffer,
                fileName: imageFile.originalname,
                folder: "/blogs"
            });

            // Optimization through imagekit url transformation
            const optimizedImageUrl = imagekit.url({
                path: response.filePath,
                transformation: [
                    { quality: 'auto' },
                    { format: 'webp' },
                    { width: '1280' }
                ]
            });

            image = optimizedImageUrl;
        }

        await Blog.create({
            title,
            subTitle,
            description,
            category,
            image,
            isPublished,
            metaDescription,
            tags
        });

        res.status(201).json({ success: true, message: "Blog added successfully" });
    } catch (error) {
        next(error);
    } finally {
        if (imageFile?.path) {
            fs.promises.unlink(imageFile.path).catch(() => {});
        }
    }
};

export const generateImage = async (req, res, next) => {
    try {
        const { title, category } = req.body || {};
        if (!title || !String(title).trim()) {
            throw new AppError('Title is required to generate an image', 400);
        }

        const safeTitle = String(title).trim();
        const safeCategory = category ? String(category).trim() : '';

        // Minimal prompt engineering: keep it safe + blog-thumbnail oriented.
        const prompt = [
            'modern minimal blog thumbnail illustration',
            safeCategory ? `theme: ${safeCategory}` : null,
            `title: ${safeTitle}`,
            'clean composition, high contrast, no text, no watermark'
        ].filter(Boolean).join(', ');

        // Public image generation endpoint (no API key). If you prefer a paid provider,
        // we can swap this implementation to OpenAI/Replicate/Stability later.
        const srcUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1280&height=720&seed=${Date.now()}&nologo=true`;

        const resp = await fetch(srcUrl);
        if (!resp.ok) {
            throw new AppError(`Image generation failed (${resp.status})`, 502);
        }
        const arrayBuffer = await resp.arrayBuffer();
        const fileBuffer = Buffer.from(arrayBuffer);

        const fileName = `ai-${safeTitle.replace(/[^a-z0-9\-\s]/gi, '').trim().replace(/\s+/g, '-').slice(0, 40) || 'thumbnail'}-${Date.now()}.png`;

        const uploaded = await imagekit.upload({
            file: fileBuffer,
            fileName,
            folder: '/blogs'
        });

        const optimizedImageUrl = imagekit.url({
            path: uploaded.filePath,
            transformation: [
                { quality: 'auto' },
                { format: 'webp' },
                { width: '1280' }
            ]
        });

        res.status(200).json({ success: true, imageUrl: optimizedImageUrl });
    } catch (error) {
        next(error);
    }
};

export const getAllBlogs = async (req, res, next) => {
    try {
        const blogs = await Blog.find({ isPublished: true }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, blogs });
    } catch (error) {
        next(error);
    }
};

export const getBlogById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const blog = await Blog.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true });
        
        if (!blog) {
            throw new AppError("Blog not found", 404);
        }

        res.status(200).json({ success: true, blog });
    } catch (error) {
        next(error);
    }
};

export const deleteBlogById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const blog = await Blog.findByIdAndDelete(id);
        
        if (!blog) {
            throw new AppError("Blog not found", 404);
        }

        // Delete all comments associated with the blog
        await Comment.deleteMany({ blogId: id });

        res.status(200).json({ success: true, message: "Blog deleted successfully" });
    } catch (error) {
        next(error);
    }
};

export const togglePublish = async (req, res, next) => {
    try {
        const { id } = req.params;
        const blog = await Blog.findById(id);
        
        if (!blog) {
            throw new AppError("Blog not found", 404);
        }

        blog.isPublished = !blog.isPublished;
        await blog.save();

        res.status(200).json({ success: true, message: "Blog publish status updated" });
    } catch (error) {
        next(error);
    }
};

export const addComment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, content } = req.body;

        if (!name || !content) {
            throw new AppError("Name and content are required", 400);
        }

        await Comment.create({
            blogId: id,
            name,
            content
        });

        res.status(201).json({ success: true, message: "Comment added successfully" });
    } catch (error) {
        next(error);
    }
};

export const getBlogComments = async (req, res, next) => {
    try {
        const { id } = req.params;
        const comments = await Comment.find({ blogId: id, isApproved: true }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, comments });
    } catch (error) {
        next(error);
    }
};

export const generateContent = async (req, res, next) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            throw new AppError("Prompt is required", 400);
        }

        const fullPrompt = `You are a professional blog writer for WriteFlow.

    WriteFlow style: tech + startups + productivity. Audience: developers, builders, and early-stage founders.

    Write a complete, high-quality blog post in MARKDOWN based on the user's topic/prompt.

Rules:
- Output MUST be valid markdown (no HTML).
- Use clear H2/H3 headings.
- Use short paragraphs and bullet lists where helpful.
- Include at least 2 concrete examples or mini case studies.
- Include a "Key takeaways" section.
- Keep the tone practical and human.

User topic/prompt:
${prompt}
`;

        const content = await main(fullPrompt);

        res.status(200).json({
            success: true,
            content,
            message: "Content generated successfully"
        });
    } catch (error) {
        console.error('AI Generation Error:', error);
        next(new AppError(error.message || "Failed to generate content. Please check your API key.", 500));
    }
};

export const generateSEO = async (req, res, next) => {
    try {
        const { title, content } = req.body;

        if (!title && !content) {
            throw new AppError("Provide title or content for SEO generation", 400);
        }

        const prompt = `You are an SEO assistant. Based on the following blog details, generate:
1) A concise meta description (max 160 characters, plain text)
2) 5-8 relevant SEO tags (single or two-word phrases; lowercase; no #; JSON array)

Return ONLY a compact JSON object with the following structure and nothing else:
{
  "metaDescription": "...",
  "tags": ["tag1", "tag2", "tag3"]
}

Blog Title: ${title || '(none)'}
Blog Content (HTML allowed): ${content ? content.slice(0, 6000) : '(none)'}
`;

        const raw = await main(prompt);

        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        const jsonText = jsonMatch ? jsonMatch[0] : raw;
        let parsed;

        try {
            parsed = JSON.parse(jsonText);
        } catch {
            throw new AppError('AI returned invalid JSON for SEO.', 500);
        }

        const metaDescription = typeof parsed.metaDescription === 'string' ? parsed.metaDescription.trim() : '';
        const tags = Array.isArray(parsed.tags) ? parsed.tags.map(t => String(t).trim()).filter(Boolean) : [];

        if (!metaDescription || tags.length === 0) {
            throw new AppError('Failed to generate SEO fields. Try again.', 500);
        }

        res.status(200).json({ success: true, metaDescription, tags });
    } catch (error) {
        next(error);
    }
};