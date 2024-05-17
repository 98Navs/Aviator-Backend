//src/project_setup/Middleware.js
import { ValidateSignature, ValidateAdminSignature } from "../project_setup/Utils.mjs";

class Middleware {
    static async validate(req, res, next, validator, notAuthorizedMessage) {
        try {
            const isAuthorized = await validator(req);
            if (isAuthorized) return next();
            res.status(403).json({ success: false, message: notAuthorizedMessage });
        } catch (error) {
            console.error('Error in auth middleware:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }

    static user(req, res, next) {
        Middleware.validate(req, res, next, ValidateSignature, "Not Authorized as user");
    }

    static admin(req, res, next) {
        Middleware.validate(req, res, next, ValidateAdminSignature, "NOT Authorized as user is Not Admin");
    }
}

export default Middleware;
