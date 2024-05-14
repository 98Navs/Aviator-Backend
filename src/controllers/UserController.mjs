// src/controllers/UserController.mjs
import bcrypt from 'bcrypt';
import UserRepository from "../repositories/UserRepository.mjs";
import GenerateSignature from "../project_setup/Utils.mjs";

class UserController {
    static async createUser(req, res) {
        try {
            const userData = req.body;
            const validationResult = await validateUserData(userData);
            if (validationResult.error) return res.status(400).json({ error: validationResult.error });
            const hashedPassword = await UserRepository.hashPassword(userData.password);
            const user = await UserRepository.createUser({ ...userData, password: hashedPassword });
            res.status(201).json(user);
        } catch (error) {
            res.status(400).json({ error: error.message });
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
            const token = await GenerateSignature({ userId: existingUser.userId, email: existingUser.email, role: existingUser.role }, res);
            res.json({ message: 'Sign in successful!', user: { userId: existingUser.userId, email: existingUser.email, token } });
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
}

async function validateUserData(userData) {
    const { userName, email, mobile, promoCode, password, userId, referenceCode } = userData;
    userData.userName = userName.toLowerCase();
    userData.email = email.toLowerCase();
    const requiredFields = ['userName', 'email', 'mobile', 'password'];
    const missingFields = requiredFields.filter(field => !userData[field] || (userData[field].trim && userData[field].trim() === ''));
    if (missingFields.length > 0) return { error: `Missing or empty fields: ${missingFields.join(', ')}` };
    const validators = {
        userName: (val) => /^[a-zA-Z]+(?: [a-zA-Z]+)*$/.test(val) && val.length >= 4,
        email: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
        mobile: (val) => /^\d{10}$/.test(val),
        password: (val) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(val)
    };
    const errorField = Object.keys(validators).find(field => !validators[field](userData[field]));
    if (errorField) return { error: validators[errorField].message };
    const existingEmail = await UserRepository.getUserByEmail(userData.email);
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

export default UserController;
