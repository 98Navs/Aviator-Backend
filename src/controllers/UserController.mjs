//src/controllers/UserController.mjs
import UserRepository from '../repositories/UserRepository.mjs';
import { ErrorHandler, ValidationError, NotFoundError } from '../controllers/ErrorHandler.mjs'
import UserRegistrationController from './UserRegistrationController.mjs';

class UserController {
    static async getAllUsers(req, res) {
        try {
            const { search, startDate, endDate, pageNumber = 1, perpage = 10 } = req.query;
            const options = { page: Number(pageNumber), limit: Number(perpage) };
            const filterParams = { search, startDate, endDate };
            const users = Object.keys(filterParams).length > 0 ?
                await UserRepository.filterUsers(filterParams, options, req) :
                await UserRepository.getAllUsers(options, req);
            return res.status(200).json({ status: 200, success: true, message: 'Users fetched successfully', ...users });
        } catch (error) {
            ErrorHandler.catchError(error, res);
        }
    }

    static async getUserByUserId(req, res) {
        try {
            const { userId } = req.params;
            const user = await this.validateAndFetchUserByUserId(userId);
            res.status(200).json({ status: 200, success: true, message: `Data fetched successfully for userId ${userId}`, user });
        } catch (error) {
            ErrorHandler.catchError(error, res);
        }
    }

    static async getWalletByUserId(req, res) {
        try {
            const { userId } = req.params;
            const user = await this.validateAndFetchUserByUserId(userId);
            const data = { wallet: user.wallet, depositAmount: user.depositAmount, bonusAmount: user.bonusAmount, commissionAmount: user.commissionAmount, winningsAmount: user.winningsAmount };
            res.status(200).json({ status: 200, success: true, message: `Wallet data fetched successfully for userId ${userId}`, data });
        } catch (error) {
            ErrorHandler.catchError(error, res);
        }
    }

    static async updateUserByUserId(req, res) {
        try {
            const { userId } = req.params;
            await this.validateAndFetchUserByUserId(userId);
            const userData = await UserRegistrationController.validateUserData(req.body, true)
            const updatedUser = await UserRepository.updateUserByUserId(userId, userData);
            res.status(200).json({ status: 200, success: true, message: `Data updated successfully for userId ${userId}`, updatedUser });
        } catch (error) {
            ErrorHandler.catchError(error, res);
        }
    }

    static async deleteUserByUserId(req, res) {
        try {
            const { userId } = req.params;
            await this.validateAndFetchUserByUserId(userId);
            const deleteUser = await UserRepository.deleteUserByUserId(userId);
            res.status(200).json({ status: 200, success: true, message: `Data deleted successfully for userId ${userId}`, deleteUser });
        } catch (error) {
            ErrorHandler.catchError(error, res);
        }
    }

    static async deductAmountByUserId(req, res) {
        try {
            const { userId } = req.params;
            const { depositAmount = 0, winningsAmount = 0, bonusAmount = 0, commissionAmount = 0 } = req.body;
            const user = await this.validateAndFetchUserByUserId(userId);
            if (user.status === 'active') { throw new ValidationError('User satatus in active, amount can not be deducted if the user status is active'); }
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
            const admin = await UserRepository.getUserByEmail('admin@scriza.in');
            if (!admin) { throw new NotFoundError('Admin not found in the database with email: admin@scriza.in'); }
            amounts.forEach(fund => { admin[fund.name] += fund.value; });
            await admin.save();
            const availableFunds = amounts.reduce((acc, fund) => ({ ...acc, [fund.name]: user[fund.name] }), {});
            res.status(200).json({ status: 200, success: true, message: `Deducted depositAmount: ${depositAmount}, winningsAmount: ${winningsAmount}, bonusAmount: ${bonusAmount}, commissionAmount: ${commissionAmount} from userId ${userId} and transferred to admin.`, availableFunds });
        } catch (error) {
            ErrorHandler.catchError(error, res);
        }
    }

    //Static Methods Only For This Class (Not To Be Used In Routes)
    static async validateAndFetchUserByUserId(userId) {
        if (!/^[0-9]{6}$/.test(userId)) { throw new ValidationError('Invalid userId format.'); }
        const user = await UserRepository.getUserByUserId(userId);
        if (!user) { throw new NotFoundError('User not found.'); }
        return user;
    }
}

export default UserController;