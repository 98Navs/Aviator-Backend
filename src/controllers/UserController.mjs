import bcrypt from 'bcrypt';
import UserRepository from "../repositories/UserRepository.mjs";
import { GenerateSignature, sendEmail } from "../project_setup/Utils.mjs";

class UserController {
    static async createUser(req, res) {
        try {
            const { error, userData } = await UserController.validateUserData(req.body);
            if (error) return res.status(400).json({ success: false, error });
            const hashedPassword = await UserRepository.hashPassword(userData.password);
            const user = await UserRepository.createUser({ ...userData, password: hashedPassword });
            res.status(201).json({ success: true, message: 'User created successfully', user });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    static async signIn(req, res) {
        try {
            const { user, password } = req.body;
            if (!user) return res.status(400).json({ success: false, error: 'Please provide email, userId, or mobile.' });
            const existingUser = await UserController.getUser(user);
            if (!existingUser) return res.status(400).json({ success: false, error: 'User not found.' });

            if (!password) return res.status(400).json({ success: false, error: 'Please provide password.' });
            const isPasswordValid = await bcrypt.compare(password, existingUser.password);
            if (!isPasswordValid) return res.status(401).json({ success: false, error: 'Invalid credentials.' });

            const token = await GenerateSignature({ userId: existingUser.userId, email: existingUser.email, role: existingUser.role }, res);
            res.json({ success: true, message: 'Sign in successful!', user: { userId: existingUser.userId, email: existingUser.email, token } });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    static async forgetPassword(req, res) {
        try {
            const { email } = req.body;
            if (!email) return res.status(400).json({ success: false, error: 'Please provide email.' });
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ success: false, error: 'Invalid email format.' });

            const user = await UserController.getUserByEmail(email);
            if (!user) return res.status(404).json({ success: false, error: 'User not found.' });

            const otp = Math.floor(100000 + Math.random() * 900000);
            user.otp = otp;
            await user.save();
            await sendEmail(email, 'Password Reset OTP', `Your OTP for password reset is: ${otp}`);

            res.json({ success: true, message: 'OTP sent to your email.' });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    static async resetPassword(req, res) {
        try {
            const { email, otp, password } = req.body;
            if (!email || !otp || !password) return res.status(400).json({ success: false, error: 'Please provide email, OTP, and new password.' });

            const { error } = await UserController.validatePassword(password);
            if (error) return res.status(400).json({ success: false, error });

            const user = await UserController.getUserByEmail(email);
            if (!user || otp !== user.otp) return res.status(401).json({ success: false, error: 'Invalid OTP.' });

            const hashedPassword = await UserRepository.hashPassword(password);
            await UserRepository.updateUserPassword(user.userId, hashedPassword);
            user.otp = null;
            await user.save();

            res.json({ success: true, message: 'Password reset successfully.' });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    static async getAllUsers(req, res) {
        try {
            const users = await UserRepository.getAllUsers();
            res.json({ success: true, message: 'Users fetched successfully', users });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async getUserByUserId(req, res) {
        try {
            const { userId } = req.params;
            if (!/^[0-9]{6}$/.test(userId)) return res.status(400).json({ success: false, error: 'Invalid userId format.' });

            const user = await UserRepository.getUserByUserId(userId);
            if (!user) return res.status(404).json({ success: false, error: 'User not found.' });

            res.json({ success: true, message: `Data fetched successfully for userId ${userId}`, user });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Internal server error.' });
        }
    }

    static async updateUserByUserId(req, res) {
        try {
            const { userId } = req.params;
            if (!/^[0-9]{6}$/.test(userId)) return res.status(400).json({ success: false, error: 'Invalid userId format.' });

            const updatedUser = await UserRepository.updateUserByUserId(userId, req.body);
            if (!updatedUser) return res.status(404).json({ success: false, error: 'User not found.' });

            res.json({ success: true, message: `Data updated successfully for userId ${userId}`, updatedUser });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async deleteUserByUserId(req, res) {
        try {
            const { userId } = req.params;
            if (!/^[0-9]{6}$/.test(userId)) return res.status(400).json({ success: false, error: 'Invalid userId format.' });

            const deleteUser = await UserRepository.deleteUserByUserId(userId);
            if (!deleteUser) return res.status(404).json({ success: false, error: 'User not found.' });

            res.json({ success: true, message: `Data deleted successfully for userId ${userId}`, deleteUser });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async getUser(user) {
        if (typeof user !== 'string') throw new Error('Invalid email, userId, or mobile provided.');

        if (user.includes('@')) return UserRepository.getUserByEmail(user.toLowerCase());
        if (/^\d{10}$/.test(user)) return UserRepository.getUserByMobile(parseInt(user, 10));
        if (!isNaN(user)) return UserRepository.getUserByUserId(user);

        throw new Error('Invalid email, userId, or mobile provided.');
    }

    static async validateUserData({ userName, email, mobile, password, userId, promoCode, referenceCode }) {
        const validators = {
            userName: { test: (val) => /^[a-zA-Z ]{4,}$/.test(val), message: 'Invalid userName. Must be at least 4 characters and only letters.' },
            email: { test: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), message: 'Invalid email format.' },
            mobile: { test: (val) => /^\d{10}$/.test(val), message: 'Invalid mobile number. Must be 10 digits.' },
            password: { test: (val) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(val), message: 'Invalid password. Must be 8 characters with uppercase, lowercase, numbers, and special characters.' }
        };

        for (const [field, { test, message }] of Object.entries(validators)) {
            if (!test(arguments[0][field])) return { error: message };
        }

        const checkDuplicates = async () => {
            if (await UserRepository.getUserByEmail(email.toLowerCase())) return { error: 'Email already registered.' };
            if (await UserRepository.getUserByMobile(mobile)) return { error: 'Mobile number already registered.' };
            if (promoCode && await UserRepository.getUserByPromoCode(promoCode)) return { error: 'Promo code already used.' };
            if (await UserRepository.getUserByUserId(userId)) return { error: 'UserId already used.' };
            if (referenceCode) {
                const refUser = await UserRepository.getUserByReferenceCode(referenceCode.toUpperCase());
                arguments[0].referenceCode = refUser ? referenceCode.toUpperCase() : 'admin';
            }
            return { error: null, userData: arguments[0] };
        };

        return checkDuplicates();
    }

    static async validatePassword(password) {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
        if (!passwordRegex.test(password)) return { error: 'Password must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters.' };
        return { error: null };
    }
}

export default UserController;
