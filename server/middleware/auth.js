import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized Access" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (error) {
        const message = error.name === 'TokenExpiredError' 
            ? 'Session expired. Please login again.' 
            : 'Unauthorized Access';
        return res.status(401).json({ success: false, message, expired: error.name === 'TokenExpiredError' });
    }
};

export default auth;