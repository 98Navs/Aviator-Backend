//src/controllers/UserController.mjs
import bcrypt from 'bcrypt';
import UserRepository from "../repositories/UserRepository.mjs";
import { GenerateSignature, sendEmail } from "../project_setup/Utils.mjs";

class UserController {
    static async createUser(req, res) {
        try {
            const { error, userData } = await UserController.validateUserData(req.body);
            if (error) return res.status(400).json({ status: 400, success: false, message: error });
            userData.password = await UserRepository.hashPassword(userData.password);
            const user = await UserRepository.createUser(userData);
            res.status(201).json({ status: 201, success: true, message: 'User created successfully', user });
        } catch (error) {
            res.status(400).json({ status: 400, success: false, message: error.message });
        }
    }

    static async signIn(req, res) {
        try {
            const { user, password } = req.body;
            if (!user) return res.status(400).json({ status: 400, success: false, message: 'Please provide email, userId, or mobile.' });
            const existingUser = await UserController.getUser(user);
            if (!existingUser) return res.status(400).json({ status: 400, success: false, message: 'User not found.' });
            if (!password) return res.status(400).json({ status: 400 + message, success: false, message: 'Please provide password.' });
            if (!await bcrypt.compare(password, existingUser.password)) return res.status(401).json({ status: 401, success: false, message: 'Invalid credentials.' });
            const token = await GenerateSignature({ userId: existingUser.userId, email: existingUser.email, objectId: existingUser._id, role: existingUser.role }, res);
            res.status(200).json({ status: 200, success: true, message: 'Sign in successful!', user: { userId: existingUser.userId, email: existingUser.email, token } });
        } catch (error) {
            res.status(400).json({ status: 400, success: false, message: error.message });
        }
    }

    static async forgetPassword(req, res) {
        try {
            const { email } = req.body;
            if (!email) return res.status(400).json({ status: 400, success: false, message: 'Please provide email.' });
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ status: 400, success: false, message: 'Invalid email format.' });
            const user = await UserRepository.getUserByEmail(email);
            if (!user) return res.status(404).json({ status: 404, success: false, message: 'User not found.' });
            const otp = Math.floor(100000 + Math.random() * 900000);
            user.otp = otp;
            await user.save();
            await sendEmail(email, 'Password Reset OTP', `Your OTP for password reset is: ${otp}`);
            res.status(200).json({ status: 200, success: true, message: 'OTP sent to your email.' });
        } catch (error) {
            res.status(400).json({ status: 400, success: false, message: error.message });
        }
    }

    static async otp(req, res) {
        try {
            const { email, otp } = req.body;
            if (!email || !otp) return res.status(400).json({ status: 400, success: false, message: 'Please provide OTP.' });
            const user = await UserRepository.getUserByEmail(email);
            if (!user) return res.status(404).json({ status: 404, success: false, message: 'User not found.' });
            if (otp !== user.otp) return res.status(401).json({ status: 401, success: false, message: 'Invalid OTP.' });
            user.otp = null;
            await user.save();
            res.status(200).json({ status: 200, success: true, message: 'OTP verified successfully.' });
        } catch (error) {
            res.status(400).json({ status: 400, success: false, message: error.message });
        }
    }

    static async changePassword(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) return res.status(400).json({ status: 400, success: false, message: 'Please provide the new password.' });
            if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(password)) return res.status(400).json({ status: 400, success: false, message: 'Password must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters.' });
            const user = await UserRepository.getUserByEmail(email);
            if (!user) return res.status(404).json({ status: 404, success: false, message: 'User not found.' });
            user.password = await UserRepository.hashPassword(password);
            await user.save();
            res.status(200).json({ status: 200, success: true, message: 'Password reset successfully.' });
        } catch (error) {
            res.status(400).json({ status: 400, success: false, message: error.message });
        }
    }

    static async getAllUsers(req, res) {
        try {
            const { pageNumber = 1, perpage = 10 } = req.query;
            const options = { page: Number(pageNumber), limit: Number(perpage) };
            const users = await UserRepository.getAllUsers(options, req);
            res.status(200).json({ status: 200, success: true, message: 'Users fetched successfully', ...users });
        } catch (error) {
            res.status(500).json({ status: 500, success: false, message: error.message });
        }
    }

    static async getUserByUserId(req, res) {
        try {
            const { userId } = req.params;
            const user = await UserController.validateAndFetchUserByUserId(userId);
            res.status(200).json({ status: 200, success: true, message: `Data fetched successfully for userId ${userId}`, user });
        } catch (error) {
            UserController.catchError(error, res);
        }
    }

    static async getWalletByUserId(req, res) {
        try {
            const { userId } = req.params;
            const user = await UserController.validateAndFetchUserByUserId(userId);
            const { wallet, depositAmount, bonusAmount, commissionAmount, winningsAmount } = user;
            res.status(200).json({ status: 200, success: true, message: `Wallet data fetched successfully for userId ${userId}`, wallet, depositAmount, bonusAmount, commissionAmount, winningsAmount });
        } catch (error) {
            UserController.catchError(error, res);
        }
    }

    static async updateUserByUserId(req, res) {
        try {
            const { userId } = req.params;
            await UserController.validateAndFetchUserByUserId(userId);
            if (req.body.password) {
                if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(req.body.password)) { throw new ValidationError('Password must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters.'); }
                req.body.password = await UserRepository.hashPassword(req.body.password);
            }
            const updatedUser = await UserRepository.updateUserByUserId(userId, req.body);
            res.status(200).json({ status: 200, success: true, message: `Data updated successfully for userId ${userId}`, updatedUser });
        } catch (error) {
            UserController.catchError(error, res);
        }
    }

    static async deleteUserByUserId(req, res) {
        try {
            const { userId } = req.params;
            await UserController.validateAndFetchUserByUserId(userId);
            const deleteUser = await UserRepository.deleteUserByUserId(userId);
            res.status(200).json({ status: 200, success: true, message: `Data deleted successfully for userId ${userId}`, deleteUser });
        } catch (error) {
            UserController.catchError(error, res);
        }
    }

    static async deductAmount(req, res) {
        try {
            const { userId, depositAmount = 0, winningsAmount = 0, bonusAmount = 0, commissionAmount = 0 } = req.body;
            const user = await UserController.validateAndFetchUserByUserId(userId);
            if (user.status == 'active') { throw new ValidationError('User satatus in active, amount can not be deducted if the user status is active') }
            const amounts = [
                { name: 'depositAmount', value: depositAmount, userValue: user.depositAmount },
                { name: 'winningsAmount', value: winningsAmount, userValue: user.winningsAmount },
                { name: 'bonusAmount', value: bonusAmount, userValue: user.bonusAmount },
                { name: 'commissionAmount', value: commissionAmount, userValue: user.commissionAmount }
            ];
            
            const insufficientFunds = amounts.filter(fund => fund.value > 0 && fund.userValue < fund.value);
            if (insufficientFunds.length > 0) {
                const errorMessage = insufficientFunds.map(fund => `Insufficient ${fund.name}. Requested: ${fund.value}, Available: ${fund.userValue}`).join('; ');
                const availableFunds = amounts.reduce((acc, fund) => ({ ...acc, [fund.name]: fund.userValue }), {});
                return res.status(400).json({ status: 400, success: false, message: errorMessage, userId, availableFunds });
            }

            amounts.forEach(fund => { user[fund.name] -= fund.value; });
            await user.save();
            const admin = await UserRepository.getUserByUserId(709841);
            if (!admin) { return res.status(404).json({ status: 400, success: false, message: 'Admin not found.' }); }
            amounts.forEach(fund => { admin[fund.name] += fund.value; });
            await admin.save();

            const availableFunds = amounts.reduce((acc, fund) => ({ ...acc, [fund.name]: user[fund.name] }), {});
            res.status(200).json({ status: 200, success: true, message: `Deducted depositAmount: ${depositAmount}, winningsAmount: ${winningsAmount}, bonusAmount: ${bonusAmount}, commissionAmount: ${commissionAmount} from userId ${userId} and transferred to admin.`, availableFunds });
        } catch (error) {
            UserController.catchError(error, res);
        }
    }

    static async filterUsers(req, res) {
        try {
            const { search, startDate, endDate, pageNumber = 1, perpage = 20 } = req.query;
            if (!search && !startDate && !endDate) {
                return res.status(400).json({ status: 400, success: false, message: 'Please provide at least one of the following fields: search, startDate, or endDate.' });
            }
            const filterParams = {
                search,
                ...(startDate && { startDate }),
                ...(endDate && { endDate })
            };
            const options = { page: Number(pageNumber), limit: Number(perpage) };
            const users = await UserRepository.filterUsers(filterParams, options, req);
            if (!users.data.length) {
                return res.status(404).json({ status: 404, success: false, message: 'No data found for the provided details.' });
            }
            res.status(200).json({ status: 200, success: true, message: 'Users filtered successfully', users });
        } catch (error) {
            res.status(500).json({ status: 500, success: false, message: error.message });
        }
    }

    //Static Methods Only For This Class (Not To Be Used In Routes)
    static async catchError(error, res) {
        try {
            if (error instanceof ValidationError) { res.status(400).json({ status: 400, success: false, message: error.message }); }
            else if (error instanceof NotFoundError) { res.status(404).json({ status: 404, success: false, message: error.message }); }
            else { res.status(500).json({ status: 500, success: false, message: 'Internal server error.' }); }
        } catch (error) {
            res.status(500).json({ status: 500, success: false, message: 'Something unexpected has happened' });
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
        if (!user) { throw new NotFoundError('User not found.'); }
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