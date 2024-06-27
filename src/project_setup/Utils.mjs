//src/project_setup/Utils.mjs
import nodemailer from 'nodemailer';
import multer from 'multer';
import url from 'url';
// import Redis from 'ioredis';

// // Redis caching implementation
// const redis = new Redis({ host: 'localhost', port: 6379, retryStrategy: times => Math.min(times * 50, 2000) });
// redis.on('error', err => console.error('Redis error:', err));
// redis.on('connect', () => console.log('Connected to Redis server.'));
// export { redis };

// Images uploader
const FILE_TYPE_MAP = { 'image/png': 'png', 'image/jpeg': 'jpeg', 'image/jpg': 'jpg' };
const getDestination = (req, file, cb) => {
    const paths = { profileImages: ['createUser', 'changeUserImageByUserId'], gameImages: ['createAvailableGame', 'updateAvailableGameByGameId'], bannerImages: ['createBanner', 'updateBannerById'], bankQRCode: ['createBankDetails', 'updateBankDetailsByUserIdAndSaveAs'], paymentProof: ['createRechargeByUserId'] };
    const dest = Object.keys(paths).find( key => paths[key].some(value => req.url.includes(value)) ) || 'uploads';
    const isValidFileType = FILE_TYPE_MAP[file.mimetype];
    cb(isValidFileType ? null : new Error('Invalid image type'), `src/public/${dest}`);
};

const storage = multer.diskStorage({
    destination: getDestination,
    filename: (req, file, cb) => {
        const extension = FILE_TYPE_MAP[file.mimetype];
        const fileName = `${file.originalname.replace(/\s+/g, '-')}-${Date.now()}.${extension}`;
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