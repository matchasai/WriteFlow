import express from "express";
import { adminLogin, approveCommentById, deleteCommentById, getAllBlogsAdmin, getAllComments, getDashboard } from "../controllers/adminController.js";
import auth from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { loginLimiter } from "../middleware/rateLimiter.js";
import { validateLogin, validateObjectId } from "../middleware/validator.js";

const adminRouter = express.Router();

adminRouter.post("/login", loginLimiter, validateLogin, asyncHandler(adminLogin));
adminRouter.get("/blogs", auth, asyncHandler(getAllBlogsAdmin));
adminRouter.get("/comments", auth, asyncHandler(getAllComments));
adminRouter.get("/dashboard", auth, asyncHandler(getDashboard));
adminRouter.delete("/comments/delete-comment/:id", auth, validateObjectId, asyncHandler(deleteCommentById));
adminRouter.patch("/comments/approve-comment/:id", auth, validateObjectId, asyncHandler(approveCommentById));

export default adminRouter;