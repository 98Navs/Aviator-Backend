import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import multer from 'multer';
import url from 'url';

export const ValidateSignature = async (req) => {
    try {
        const signature = req.headers.authorization?.split(" ")[1] || req.cookies.jwt;
        if (!signature) {
            console.log('Token not found in headers or cookies');
            return false;
        }
        req.user = await jwt.verify(signature, process.env.APP_SECRET);
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
};

export const ValidateAdminSignature = async (req) => {
    try {
        if (await ValidateSignature(req)) {
            const { role } = req.user;
            if (role === 'admin' || role === 'super-admin') return true;
            console.log('User is not an admin');
        }
        return false;
    } catch (error) {
        console.error(error);
        return false;
    }
};

const FILE_TYPE_MAP = { 'image/png': 'png', 'image/jpeg': 'jpeg', 'image/jpg': 'jpg' };

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(FILE_TYPE_MAP[file.mimetype] ? null : new Error('Invalid image type'), 'src/public/uploads');
    },
    filename: (req, file, cb) => {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    }
});
export const uploadOptions = multer({ storage });

export const generatePaginationUrls = (req, page, totalPages, limit) => {
    const baseUrl = url.format({ protocol: req.protocol, host: req.get('host'), pathname: req.originalUrl.split('?')[0] });
    return {
        prepage: page > 1 ? `${baseUrl}?page=${page - 1}&limit=${limit}` : null,
        nextpage: page < totalPages ? `${baseUrl}?page=${page + 1}&limit=${limit}` : null,
    };
};

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
