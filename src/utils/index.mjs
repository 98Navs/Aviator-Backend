import jwt from "jsonwebtoken";
import multer from 'multer';
import url from 'url';
// validation for User Token only
export const ValidateSignature = async (req) => {
    try {
        let signature;

        if (req.headers.authorization) {
            signature = req.headers.authorization.split(" ")[1];
        }
        if (!signature && req.cookies.jwt) {
            signature = req.cookies.jwt;
        }

        if (!signature) {
            console.log('Token not found in headers or cookies');
            return false;
        }
        const payload = await jwt.verify(signature, process.env.APP_SECRET);
        req.user = payload;
        return true;

    } catch (error) {
        console.log(error);
        return false;
    }
};
 
// Validation for Admin Token
export const ValidateAdminSignature = async (req) => {
    try {
        const isValid = await ValidateSignature(req);

        if (!isValid) {
            console.log('Token not found in headers or cookies');
            return false;
        }
 
        if (isValid && req.user.role === 'admin' || req.user.role === 'super-admin') {
            return true;
        } else {
            console.log('User is not an admin');
            return false;
        }

    } catch (error) {
        console.error(error);
        return false;
    }
};

// all images handler here uplodas.

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
}
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if (isValid) {
            uploadError = null
        }
        cb(uploadError, 'src/public/uploads')
    },
    filename: function (req, file, cb) {

        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`)
    }
})
export const uploadOptions = multer({ storage: storage })


export const generatePaginationUrls = (req, page, totalPages, limit) => {
    const baseUrl = url.format({
        protocol: req.protocol,
        host: req.get('host'),
        pathname: req.originalUrl.split('?')[0]
    });
    const prepage = page > 1 ? `${baseUrl}?page=${page - 1}&limit=${limit}` : null;
    const nextpage = page < totalPages ? `${baseUrl}?page=${page + 1}&limit=${limit}` : null;

    return { prepage, nextpage };
}