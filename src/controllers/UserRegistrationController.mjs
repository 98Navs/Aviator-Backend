// src/controllers/UserRegistrationController.mjs
import bcrypt from 'bcrypt';
import UserRepository from '../repositories/UserRepository.mjs';
import AmountSetupRepository from '../repositories/AmountSetupRepository.mjs';
import { GenerateSignature, sendEmail } from '../project_setup/Utils.mjs';
import { ErrorHandler, ValidationError, NotFoundError } from './ErrorHandler.mjs';

class UserRegistrationController {
    static async createUser(req, res) {
        try {
            const userData = await UserRegistrationController.validateUserData(req.body);
            const user = await UserRepository.createUser(userData);
            res.status(201).json({ status: 201, success: true, message: 'User created successfully', user });
        } catch (error) {
            ErrorHandler.catchError(error, res);
        }
    }

    static async signIn(req, res) {
        try {
            const { user, password } = req.body;
            UserRegistrationController.validatePresence({ user, password });
            const existingUser = await UserRegistrationController.getUser(user);
            if (existingUser.status != 'Active') { throw new ValidationError('User account has been suspended'); }
            if (!bcrypt.compare(password, existingUser.password)) { throw new ValidationError('Invalid credentials.'); }
            const token = await GenerateSignature({ userId: existingUser.userId, email: existingUser.email, objectId: existingUser._id, role: existingUser.role, accessiableGames: existingUser.accessiableGames }, res);
            res.status(200).json({ status: 200, success: true, message: 'Sign in successful!', user: { userId: existingUser.userId, email: existingUser.email, token } });
        } catch (error) {
            ErrorHandler.catchError(error, res);
        }
    }

    static async forgetPassword(req, res) {
        try {
            const { email } = req.body;
            UserRegistrationController.validatePresence({ email });
            UserRegistrationController.validateEmailFormat(email);
            const user = await UserRepository.getUserByEmail(email);
            if (!user) throw new NotFoundError('User not found.');
            const otp = Math.floor(100000 + Math.random() * 900000);
            user.otp = otp;
            await user.save();
            await sendEmail(email, 'Password Reset OTP', `Your OTP for password reset is: ${otp}`);
            res.status(200).json({ status: 200, success: true, message: 'OTP sent to your email.' });
        } catch (error) {
            ErrorHandler.catchError(error, res);
        }
    }

    static async otp(req, res) {
        try {
            const { email, otp } = req.body;
            UserRegistrationController.validatePresence({ email, otp });
            const user = await UserRepository.getUserByEmail(email);
            if (otp !== user.otp) throw new ValidationError('Invalid OTP.');
            user.otp = null;
            await user.save();
            res.status(200).json({ status: 200, success: true, message: 'OTP verified successfully.' });
        } catch (error) {
            ErrorHandler.catchError(error, res);
        }
    }

    static async changePassword(req, res) {
        try {
            const { email, password } = req.body;
            UserRegistrationController.validatePresence({ email, password });
            UserRegistrationController.validatePasswordFormat(password);
            const user = await UserRepository.getUserByEmail(email);
            if (!user) throw new NotFoundError('User not found.');
            user.password = await UserRepository.hashPassword(password);
            await user.save();
            res.status(200).json({ status: 200, success: true, message: 'Password reset successfully.' });
        } catch (error) {
            ErrorHandler.catchError(error, res);
        }
    }

    //Static Methods Only For This Class (Not To Be Used In Routes)
    static async getUser(user) {
        if (typeof user !== 'string') throw new ValidationError('Invalid email, userId, or mobile provided in string format.');
        if (user.includes('@')) return UserRepository.getUserByEmail(user);
        if (/^\d{10}$/.test(user)) return UserRepository.getUserByMobile(parseInt(user, 10));
        if (!isNaN(user)) return UserRepository.getUserByUserId(user);
        throw new ValidationError('Invalid email, userId, or mobile provided.');
    }

    static async validateUserData(data, isUpdate = false) {
        const { userName, email, mobile, password, referenceCode, role, status } = data;
        if (!isUpdate) { UserRegistrationController.validatePresence({ userName, email, mobile, password }); }
        if (isUpdate) { UserRegistrationController.validatePresence({ userName, email, mobile, role, status }); }
        UserRegistrationController.validateUserNameFormat(userName);
        UserRegistrationController.validateEmailFormat(email);
        UserRegistrationController.validateMobileFormat(mobile);
        UserRegistrationController.validatePasswordFormat(password);

        if (role) UserRegistrationController.validateRole(role);
        if (status) UserRegistrationController.validateStatus(status);

        data.userName = userName.trim();
        data.email = email.trim();

        if (!isUpdate) {
            await UserRegistrationController.checkExistingUser(data.email, mobile);
            data.password = await UserRepository.hashPassword(password);
            data.bonusAmount = await UserRegistrationController.getInitialBonus();
            data = await UserRegistrationController.handleReferral(data, referenceCode);
        }
        return data;
    }

    static validatePresence(fields) { for (const [key, value] of Object.entries(fields)) { if (!value) throw new ValidationError(`Please provide ${key}.`); } }

    static validateEmailFormat(email) { if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { throw new ValidationError('Invalid email format.'); } }

    static validatePasswordFormat(password) { if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(password)) { throw new ValidationError('Password must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters.'); } }

    static validateUserNameFormat(userName) { if (!/^[a-zA-Z ]{4,}$/.test(userName)) { throw new ValidationError('Invalid userName. Must be at least 4 characters and only letters.'); } }

    static validateMobileFormat(mobile) { if (!/^\d{10}$/.test(mobile)) { throw new ValidationError('Invalid mobile number. Must be 10 digits.'); } }

    static validateRole(role) {
        const validRoles = ['admin', 'user', 'affiliate'];
        if (!validRoles.includes(role)) { throw new ValidationError(`Role must be one of: ${validRoles.join(', ')} without any space.`); }
    }

    static validateStatus(status) {
        const validStatus = ['Active', 'Deactive', 'Suspended'];
        if (!validStatus.includes(status)) { throw new ValidationError(`Status must be one of: ${validStatus.join(', ')} without any space.`); }
    }

    static async checkExistingUser(email, mobile) {
        if (await UserRepository.getUserByEmail(email)) { throw new ValidationError('Email already registered.'); }
        if (await UserRepository.getUserByMobile(mobile)) { throw new ValidationError('Mobile number already registered.'); }
    }

    static async getInitialBonus() {
        const joiningBonus = await AmountSetupRepository.getAmountSetupBySettingName('Initial Bonus');
        if (!joiningBonus) { throw new NotFoundError('Amount Setting with name "Initial Bonus" not found'); }
        return parseInt(joiningBonus.value);
    }

    static async handleReferral(data, referenceCode) {
        if (referenceCode) {
            data.referenceCode = referenceCode.toUpperCase();
            const referedByUser = await UserRepository.getUserByReferenceCode(data.referenceCode);
            if (!referedByUser) { data = await UserRegistrationController.assignAdminReferral(data); }
            else { await UserRegistrationController.updateReferralUser(referedByUser, data); }
        } else { data = await UserRegistrationController.assignAdminReferral(data);}
        return data;
    }

    static async assignAdminReferral(data) {
        const admin = await UserRepository.getUserByEmail('admin@scriza.in');
        data.referenceCode = admin.promoCode;
        admin.numberOfReferals += 1;
        await admin.save();
        return data;
    }

    static async updateReferralUser(referedByUser, data) {
        referedByUser.numberOfReferals += 1;
        const perReferalBonus = await AmountSetupRepository.getAmountSetupBySettingName('Per Referal Bonus');
        if (!perReferalBonus) { throw new NotFoundError(`Amount Setting with name "Per Referal Bonus" not found`); }
        referedByUser.bonusAmount += parseInt(perReferalBonus.value); 
        if (referedByUser.role === "user") { await UserRegistrationController.updateUserReferralCommission(referedByUser); }
        else if (referedByUser.role === "affiliate") { data.accessiableGames = referedByUser.accessiableGames; }
        await referedByUser.save();
    }

    static async updateUserReferralCommission(user) {
        const levels = [ { name: 'Level 1 Commission', threshold: 10 }, { name: 'Level 2 Commission', threshold: 5 }, { name: 'Level 3 Commission', threshold: 0 } ];
        for (const level of levels) {
            if (user.numberOfReferals >= level.threshold) {
                const commission = await AmountSetupRepository.getAmountSetupBySettingName(level.name);
                if (!commission) { throw new NotFoundError(`Amount Setting with name "${level.name}" not found`); }
                user.commissionPercentage = parseInt(commission.value);
                break;
            }
        }
    }
}

export default UserRegistrationController;