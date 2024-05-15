//src/utils/utils.mjs
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';


export async function GenerateSignature(payload, res) {
    try {
        const token = jwt.sign(payload, process.env.APP_SECRET, { expiresIn: '30d' });

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

export async function sendEmail(to, subject, text) {
    try {
        await transporter.sendMail({
            from: 'admin@scriza.in',
            to,
            subject,
            text
        });
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email.');
    }
}

const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    secure: false,
    auth: {
        user: '942cb39e2f2ca8',
        pass: '3bad5a04640988'
    }
});

export default { GenerateSignature, sendEmail };