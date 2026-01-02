import { sendMail } from '../config/mail.js';
import { AppError } from "../middleware/errorHandler.js";
import Blog from '../models/Blog.js';
import Subscriber from "../models/Subscriber.js";
import { buildWelcomeEmail } from '../services/notifySubscribers.js';

export const subscribe = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new AppError("Email is required", 400);
    }

    const exists = await Subscriber.findOne({ email });

    if (exists) {
      return res.status(200).json({ success: true, message: "You're already subscribed" });
    }

    await Subscriber.create({ email });

    // Optional: send a welcome email with recent posts (only if MAIL_* is configured)
    try {
      const recentBlogs = await Blog.find({ isPublished: true })
        .sort({ createdAt: -1 })
        .limit(3)
        .select({ title: 1, metaDescription: 1, createdAt: 1 })
        .lean();

      const { subject, html, text } = buildWelcomeEmail(recentBlogs);
      await sendMail({ to: email, subject, html, text });
    } catch {
      // Don't fail subscription if email sending fails
    }

    res.status(201).json({ success: true, message: "Subscribed successfully" });
  } catch (error) {
    next(error);
  }
};
