import { ValidateSignature } from "../utils/index.mjs";

export const authMiddleware = async (req, res, next) => {
    try {
        const isAuthorized = await ValidateSignature(req);
        if (isAuthorized) {
            return next();
        }
        return res.status(403).json({ success: false, message: "Not Authorized" });
    } catch (error) {
        console.error('Error in auth middleware:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

