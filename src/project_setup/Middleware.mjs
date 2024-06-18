// src/project_setup/Middleware.mjs
import jwt from 'jsonwebtoken';
import { CommonHandler, MiddlewareError } from '../controllers/CommonHandler.mjs';

class Middleware {
    //Validate Authentiacation
    static async validateToken(req, res, next, roles, message) {
        try {
            const token = req.headers.authorization?.split(" ")[1] || req.cookies.jwt;
            if (!token) throw new MiddlewareError('Token not found in header or cookies');
            const decodedToken = jwt.verify(token, process.env.APP_SECRET);
            if (!roles.includes(decodedToken.role)) { return res.status(403).json({ status: 403, success: false, message }); }
            req.user = decodedToken;
            next();
        } catch (error) {
            const errorMessage = error instanceof jwt.JsonWebTokenError ? 'Unauthorized or distorted token': error.message;
            CommonHandler.catchError(new MiddlewareError(errorMessage), res);
        }
    }
    static validateRole(roles, message) { return (req, res, next) => Middleware.validateToken(req, res, next, roles, message); }

    //Generate JWT token generation 
    static async generateToken(payload, res) {
        try {
            const token = jwt.sign(payload, process.env.APP_SECRET, { expiresIn: '30d' });
            res.cookie('jwt', token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });
            return token;
        } catch (error) {
            throw new MiddlewareError('Error generating token');
        }
    }
}

//Validate Authorization
const roles = { admin: ['admin'], affiliate: ['affiliate', 'admin'], user: ['user', 'affiliate', 'admin'] };
Middleware.admin = Middleware.validateRole(roles.admin, "NOT Authorized as user is Not Admin");
Middleware.affiliate = Middleware.validateRole(roles.affiliate, "NOT Authorized as user is Not Affiliate");
Middleware.user = Middleware.validateRole(roles.user, "Not Authorized as user");

export default Middleware;