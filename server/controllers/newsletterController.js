import { AppError } from "../middleware/errorHandler.js";
import Subscriber from "../models/Subscriber.js";

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
    res.status(201).json({ success: true, message: "Subscribed successfully" });
  } catch (error) {
    next(error);
  }
};
