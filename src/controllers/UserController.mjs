// src/controllers/UserController.mjs
import bcrypt from 'bcrypt';
import UserRepository from "../repositories/UserRepository.mjs";
import GenerateSignature  from "../project_setup/Utils.mjs"

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

            if (!user) return res.status(400).json({ error: 'Please provide email, userName, or mobile.' });

            let existingUser = null;
            if (typeof user === 'string') {
                if (user.includes('@')) existingUser = await UserRepository.getUserByEmail(user.toLowerCase());
                else existingUser = await UserRepository.getUserByUserName(user.toLowerCase());
            } else if (!isNaN(user)) {
                existingUser = await UserRepository.getUserByMobile(user);
            } else {
                return res.status(400).json({ error: 'Invalid email, userName, or mobile provided.' });
            }

            if (!existingUser || !(await bcrypt.compare(password, existingUser.password))) {
                return res.status(401).json({ error: 'Invalid password.' });
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
    if (missingFields.length > 0) {
        return { error: `Missing or empty fields: ${missingFields.join(', ')}` };
    }
    const error = [
        { field: 'userName', validator: (val) => val.length >= 4 && !/[^a-zA-Z0-9]/.test(val), message: 'Invalid username provided. Username must be at least 4 characters long and cannot contain special characters.' },
        { field: 'email', validator: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), message: 'Invalid email provided.' },
        { field: 'mobile', validator: (val) => /^\d{10}$/.test(val), message: 'Invalid mobile number provided.' },
        { field: 'password', validator: (val) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(val), message: 'Invalid password. Must be at least 8 characters long, with at least one lowercase letter, one uppercase letter, one digit, and one special character' }
    ].find(({ field, validator }) => !validator(userData[field]));
    if (error) return { error: error.message };

    if (await UserRepository.getUserByUserName(userData.userName)) return { error: 'Username is already taken.' };
    if (await UserRepository.getUserByEmail(userData.email)) return { error: 'Email is already registered.' };
    if (await UserRepository.getUserByMobile(mobile)) return { error: 'Mobile number is already registered.' };
    if (await UserRepository.getUserByPromoCode(promoCode)) return { error: 'Promo code is already used.' };
    if (await UserRepository.getUserByUserId(userId)) return { error: 'UserId code is already used.' };
    if (referenceCode) {
        const existingRefUser = await UserRepository.getUserByReferenceCode(referenceCode.toUpperCase());
        userData.referenceCode = existingRefUser ? referenceCode.toUpperCase() : 'admin';
    }
    return { error: null, userData };
}

export default UserController;
