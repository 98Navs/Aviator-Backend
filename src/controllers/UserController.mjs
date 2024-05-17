import bcrypt from 'bcrypt';
import UserRepository from "../repositories/UserRepository.mjs";
import { GenerateSignature, sendEmail } from "../project_setup/Utils.mjs";

class UserController {
    static async createUser(req, res) {
        try {
            const { error, userData } = await UserController.validateUserData(req.body);
            if (error) return res.status(400).json({ success: false, error });
            userData.password = await UserRepository.hashPassword(userData.password);
            const user = await UserRepository.createUser(userData);
            res.status(201).json({ success: true, message: 'User created successfully', user });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    static async signIn(req, res) {
        try {
            const { user, password } = req.body;
            if (!user) return res.status(400).json({ error: 'Please provide email, userId, or mobile.' });
            let existingUser = null;
            if (typeof user === 'string') {
                if (user.includes('@')) existingUser = await UserRepository.getUserByEmail(user.toLowerCase());
                else if (/^\d{10}$/.test(user)) existingUser = await UserRepository.getUserByMobile(parseInt(user, 10));
                else if (!isNaN(user)) existingUser = await UserRepository.getUserByUserId(user);
            } else {
                return res.status(400).json({ error: 'Invalid email, userId, or mobile provided.' });
            }
            if (!existingUser || !(await bcrypt.compare(password, existingUser.password))) {
                return res.status(401).json({ error: 'Invalid credentials.' });
            }
            const token = await GenerateSignature({ userId: existingUser.userId, email: existingUser.email, objectId: existingUser._id, role: existingUser.role }, res);
            res.json({ message: 'Sign in successful!', user: { userId: existingUser.userId, email: existingUser.email, token } });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
    
    static async changePassword(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) return res.status(400).json({ success: false, error: 'Please provide the new password.' });
            if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(password)) return res.status(400).json({ success: false, error: 'Password must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters.' });
            const user = await UserRepository.getUserByEmail(email);
            if (!user) return res.status(404).json({ success: false, error: 'User not found.' });
            user.password = await UserRepository.hashPassword(password);
            await user.save();
            res.status(200).json({ success: true, message: 'Password reset successfully.' });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    static async getAllUsers(req, res) {
        try {
            const users = await UserRepository.getAllUsers();
            res.status(200).json({ success: true, message: 'Users fetched successfully', users });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async getUserByUserId(req, res) {
        try {
            const { userId } = req.params;
            const user = await UserController.validateAndFetchUserByUserId(userId);
            res.status(200).json({ success: true, message: `Data fetched successfully for userId ${userId}`, user });
        } catch (error) {
            if (error instanceof ValidationError) { res.status(400).json({ success: false, error: error.message }); }
            else if (error instanceof NotFoundError) { res.status(404).json({ success: false, error: error.message });}
            else { res.status(500).json({ success: false, error: 'Internal server error.' }); }
        }
    }

    static async getWalletByUserId(req, res) {
        try {
            const { userId } = req.params;
            const user = await UserController.validateAndFetchUserByUserId(userId);
            const { wallet, depositAmount, bonusAmount, commissionAmount } = user;
            res.status(200).json({ success: true, message: `Wallet data fetched successfully for userId ${userId}`, wallet, depositAmount, bonusAmount, commissionAmount });
        } catch (error) {
            if (error instanceof ValidationError) { res.status(400).json({ success: false, error: error.message }); }
            else if (error instanceof NotFoundError) { res.status(404).json({ success: false, error: error.message }); }
            else { res.status(500).json({ success: false, error: 'Internal server error.' }); }
        }
    }

    static async updateUserByUserId(req, res) {
        try {
            const { userId } = req.params;
            const user = await UserController.validateAndFetchUserByUserId(userId);
            if (req.body.password) {
                if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(req.body.password)) { throw new ValidationError('Password must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters.'); }                
                req.body.password = await UserRepository.hashPassword(req.body.password);
            }
            const updatedUser = await UserRepository.updateUserByUserId(userId, req.body);
            res.status(200).json({ success: true, message: `Data updated successfully for userId ${userId}`, updatedUser });
        } catch (error) {
            if (error instanceof ValidationError) { res.status(400).json({ success: false, error: error.message }); }
            else if (error instanceof NotFoundError) { res.status(404).json({ success: false, error: error.message }); }
            else { res.status(500).json({ success: false, error: 'Internal server error.' }); }
        }        
    }

    static async deleteUserByUserId(req, res) {
        try {
            const { userId } = req.params;
            const user = await UserController.validateAndFetchUserByUserId(userId);
            const deleteUser = await UserRepository.deleteUserByUserId(userId);
            res.status(200).json({ success: true, message: `Data deleted successfully for userId ${userId}`, deleteUser });
        } catch (error) {
            if (error instanceof ValidationError) { res.status(400).json({ success: false, error: error.message }); }
            else if (error instanceof NotFoundError) { res.status(404).json({ success: false, error: error.message }); }
            else { res.status(500).json({ success: false, error: 'Internal server error.' }); }
        }        
    }

    static async getUser(user) {
        if (typeof user !== 'string') throw new Error('Invalid email, userId, or mobile provided.');
        if (user.includes('@')) return UserRepository.getUserByEmail(user.toLowerCase());
        if (/^\d{10}$/.test(user)) return UserRepository.getUserByMobile(parseInt(user, 10));
        if (!isNaN(user)) return UserRepository.getUserByUserId(user);
        throw new Error('Invalid email, userId, or mobile provided.');
    }

    static async validateAndFetchUserByUserId(userId) {
        if (!/^[0-9]{6}$/.test(userId)) { throw new ValidationError('Invalid userId format.'); }
        const user = await UserRepository.getUserByUserId(userId);
        if (!user) { throw new NotFoundError('User not found.');}
        return user;
    }

    static async validateUserData({ userName, email, mobile, password, referenceCode }) {
        const requiredFields = { userName, email, mobile, password };
        const missingFields = Object.keys(requiredFields).filter(key => !requiredFields[key]);
        if (missingFields.length > 0) { return { error: `Missing required fields: ${missingFields.join(', ')}` }; }
        
        const validators = {
            userName: { test: val => /^[a-zA-Z ]{4,}$/.test(val), message: 'Invalid userName. Must be at least 4 characters and only letters.' },
            email: { test: val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), message: 'Invalid email format.' },
            mobile: { test: val => /^\d{10}$/.test(val), message: 'Invalid mobile number. Must be 10 digits.' },
            password: { test: val => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(val), message: 'Invalid password. Must be 8 characters with uppercase, lowercase, numbers, and special characters.' }
        };

        for (const [field, { test, message }] of Object.entries(validators)) {
            if (!test(arguments[0][field])) return { error: message };
        }

        const checkDuplicates = async () => {
            const emailLower = email.toLowerCase();
            const userNameLower = userName.toLowerCase();
            if (await UserRepository.getUserByEmail(emailLower)) return { error: 'Email already registered.' };
            if (await UserRepository.getUserByMobile(mobile)) return { error: 'Mobile number already registered.' };
            if (referenceCode) {
                const refUser = await UserRepository.getUserByReferenceCode(referenceCode.toUpperCase());
                arguments[0].referenceCode = refUser ? referenceCode.toUpperCase() : 'admin';
            }
            return { error: null, userData: { ...arguments[0], userName: userNameLower, email: emailLower } };
        };

        return checkDuplicates();
    }
}

class ValidationError extends Error { constructor(message) { super(message); this.name = 'ValidationError'; } }
class NotFoundError extends Error { constructor(message) { super(message); this.name = 'NotFoundError'; } }

export default UserController;