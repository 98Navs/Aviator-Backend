//src/utils/utils.mjs
import jwt from 'jsonwebtoken';

export default async function GenerateSignature(payload, res) {
    try {
        const token = await jwt.sign(payload, process.env.APP_SECRET, { expiresIn: '30d' });

        // Set the token as a cookie
        res.cookie('jwt', token, {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });

        return token;
    } catch (error) {
        console.error('Error generating token:', error);
        return error;
    }
}
