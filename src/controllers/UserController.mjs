import bcrypt from 'bcrypt';
import UserRepository from "../repositories/UserRepository.mjs";
import { GenerateSignature, sendEmail } from "../project_setup/Utils.mjs";

class UserController {
    static async createUser(req, res) {
        try {
            const validationResult = await UserController.validateUserData(req.body);
            if (validationResult.error) {
                return res.status(400).json({ error: validationResult.error });
            }
            const hashedPassword = await UserRepository.hashPassword(req.body.password);
            const user = await UserRepository.createUser({ ...req.body, password: hashedPassword });
            res.status(201).json(user);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async signIn(req, res) {
        try {
            const { user, password } = req.body;
            if (!user) return res.status(400).json({ error: 'Please provide email, userId, or mobile.' });
            let existingUser = await UserController.getUser(user);
            if (!existingUser) { return res.status(404).json({ error: 'User not found.' }); }
            if (!password) return res.status(400).json({ error: 'Please provide password' });
            const isPasswordValid = await bcrypt.compare(password, existingUser.password);
            if (!isPasswordValid) { return res.status(401).json({ error: 'Invalid credentials.' }); }
            const token = await GenerateSignature({ userId: existingUser.userId, email: existingUser.email, role: existingUser.role }, res);
            res.json({ message: 'Sign in successful!', user: { userId: existingUser.userId, email: existingUser.email, token } });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async forgetPassword(req, res) {
        try {
            const { email } = req.body;
            if (!email) return res.status(400).json({ error: 'Please provide an email.' });

            const emailValidator = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
            if (!emailValidator(email)) { return res.status(400).json({ error: 'Invalid email format.' }); }

            const user = await UserController.getUserByEmail(email);
            if (!user) return res.status(404).json({ error: 'User not found.' });

            const otp = Math.floor(100000 + Math.random() * 900000);
            user.otp = otp;
            await user.save();
            await sendEmail(user.email, 'Password Reset OTP', `Your OTP for password reset is: ${otp}`);

            res.json({ message: 'OTP sent to your email.' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async resetPassword(req, res) {
        try {
            const { email, otp, password } = req.body;

            if (!email || !otp || !password) {
                return res.status(400).json({ error: 'Please provide email, OTP, and new password.' });
            }

            const passwordValidationResult = await UserController.validatePassword(password);
            if (passwordValidationResult.error) {
                return res.status(400).json({ error: passwordValidationResult.error });
            }

            const user = await UserController.getUserByEmail(email);
            if (!user || otp !== user.otp) {
                return res.status(401).json({ error: 'Invalid OTP.' });
            }

            const hashedPassword = await UserRepository.hashPassword(password);
            await UserRepository.updateUserPassword(user.userId, hashedPassword);

            user.otp = null;
            await user.save();

            res.json({ message: 'Password reset successfully.' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async getAllUsers(req, res) {
        try {
            const users = await UserRepository.getAllUsers();
            res.json(users);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getUserById(req, res) {
        try {
            res.json(await UserRepository.getUserById(req.params.id));
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }

    static async updateUserById(req, res) {
        try {
            res.json(await UserRepository.updateUserById(req.params.id, req.body));
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }

    static async deleteUserById(req, res) {
        try {
            res.json(await UserRepository.deleteUserById(req.params.id));
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }

    static async getUser(user) {
        if (typeof user === 'string') {
            if (user.includes('@')) return await UserRepository.getUserByEmail(user.toLowerCase());
            else if (/^\d{10}$/.test(user)) return await UserRepository.getUserByMobile(parseInt(user, 10));
            else if (!isNaN(user)) return await UserRepository.getUserByUserId(user);
        }
        throw new Error('Invalid email, userId, or mobile provided.');
    }

    static async getUserByEmail(email) {
        return await UserRepository.getUserByEmail(email.toLowerCase());
    }

    static async validateUserData(userData) {
        const { userName, email, mobile, promoCode, password, userId, referenceCode } = userData;
        const requiredFields = ['userName', 'email', 'mobile', 'password'];
        const missingFields = requiredFields.filter(field => !userData[field] || (userData[field].trim && userData[field].trim() === ''));
        if (missingFields.length > 0) return { error: `Missing or empty fields: ${missingFields.join(', ')}` };
        userData.userName = userName.toLowerCase();
        userData.email = email.toLowerCase();
        const validators = {
            userName: (val) => /^[a-zA-Z]+(?: [a-zA-Z]+)*$/.test(val) && val.length >= 4,
            email: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
            mobile: (val) => /^\d{10}$/.test(val),
            password: (val) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(val)
        };
        const errorField = Object.keys(validators).find(field => !validators[field](userData[field]));
        if (errorField) return { error: validators[errorField].message };
        const existingEmail = await UserController.getUserByEmail(userData.email);
        if (existingEmail) return { error: 'Email is already registered.' };
        const existingMobile = await UserRepository.getUserByMobile(mobile);
        if (existingMobile) return { error: 'Mobile number is already registered.' };
        const existingPromoCode = await UserRepository.getUserByPromoCode(promoCode);
        if (existingPromoCode) return { error: 'Promo code is already used.' };
        const existingUserId = await UserRepository.getUserByUserId(userId);
        if (existingUserId) return { error: 'UserId code is already used.' };
        if (referenceCode) {
            const existingRefUser = await UserRepository.getUserByReferenceCode(referenceCode.toUpperCase());
            userData.referenceCode = existingRefUser ? referenceCode.toUpperCase() : 'admin';
        }
        return { error: null, userData };
    }

    static async validatePassword(password) {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
        if (!passwordRegex.test(password)) {
            return { error: 'Password must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters.' };
        }
        return { error: null };
    }
}

export default UserController;
