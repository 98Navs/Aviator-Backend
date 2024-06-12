//src/project_setup/Utils.mjs
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import multer from 'multer';
import url from 'url';
import Redis from 'ioredis';

// Redis caching implementation
const redis = new Redis({ host: 'localhost', port: 6379, retryStrategy: times => Math.min(times * 50, 2000) });
redis.on('error', err => console.error('Redis error:', err));
redis.on('connect', () => console.log('Connected to Redis server.'));
export { redis };

// Role verification middleware
const validateRole = async (req, roles) => {
    try {
        const signature = req.headers.authorization?.split(" ")[1] || req.cookies.jwt;
        if (!signature) {
            console.log('Token not found in headers or cookies');
            return false;
        }
        req.user = jwt.verify(signature, process.env.APP_SECRET);
        if (roles.includes(req.user.role)) return true;
        console.log(`User role ${req.user.role} is not authorized`);
        return false;
    } catch (error) {
        console.error(error);
        return false;
    }
};
export const ValidateAdminSignature = (req) => validateRole(req, ['admin']);
export const ValidateAffiliateSignature = (req) => validateRole(req, ['affiliate', 'admin']);
export const ValidateUserSignature = (req) => validateRole(req, ['user', 'admin']);

//Images uploader
const FILE_TYPE_MAP = { 'image/png': 'png', 'image/jpeg': 'jpeg', 'image/jpg': 'jpg' };
const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(FILE_TYPE_MAP[file.mimetype] ? null : new Error('Invalid image type'), 'src/public/uploads'); },
    filename: (req, file, cb) => {
        const extension = FILE_TYPE_MAP[file.mimetype];
        const fileName = `${file.originalname.split(' ').join('-')}-${Date.now()}.${extension}`;
        cb(null, fileName);
    }
});
export const uploadImages = multer({ storage });

//Pagination
export const generatePaginationUrls = (req, page, totalPages, limit) => {
    const baseUrl = url.format({ protocol: req.protocol, host: req.get('host'), pathname: req.originalUrl.split('?')[0] });
    return {
        prepage: page > 1 ? `${baseUrl}?page=${page - 1}&limit=${limit}` : null,
        nextpage: page < totalPages ? `${baseUrl}?page=${page + 1}&limit=${limit}` : null,
    };
};

export const paginate = async (model, query, page, limit, req) => {
    const skip = (page - 1) * limit;
    const [data, totalDocuments] = await Promise.all([ model.find(query).skip(skip).limit(limit).exec(), model.countDocuments(query) ]);
    const pages = Math.ceil(totalDocuments / limit);
    const nextPageUrl = page < pages ? `${req.baseUrl}${req.path}?pageNumber=${page + 1}&perpage=${limit}` : null;
    return { data, total: totalDocuments, pageNumber: page, nextPageUrl, page, pages, perpage: limit };
};

//Generate JWT token generation 
export const GenerateSignature = async (payload, res) => {
    try {
        const token = jwt.sign(payload, process.env.APP_SECRET, { expiresIn: '30d' });
        res.cookie('jwt', token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });
        return token;
    } catch (error) {
        console.error('Error generating token:', error);
        return error;
    }
};

//Email handler
const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    secure: false,
    auth: { user: '942cb39e2f2ca8', pass: '3bad5a04640988' }
});

export const sendEmail = async (to, subject, text) => {
    try {
        await transporter.sendMail({ from: 'admin@scriza.in', to, subject, text });
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email.');
    }
};

export default { GenerateSignature, sendEmail };