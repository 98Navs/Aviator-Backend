
import { ValidateAdminSignature } from "../utils/index.mjs";

export const authAdminMiddleware = async (req, res, next)=> {
    try {
        const isAuthorized = await ValidateAdminSignature(req);
        if (isAuthorized) {
            return next();
        }
        return res.status(403).json({ success: false, message: "NOT Authorized as user is Not Admin" });
    } catch (error) {
        console.error('Error in auth middleware:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};