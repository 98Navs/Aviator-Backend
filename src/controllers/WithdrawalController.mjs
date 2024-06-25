// src/controllers/WithdrawalController.mjs
import BankDetailsRepository from "../repositories/BankDetailsRepository.mjs";
import UserRepository from "../repositories/UserRepository.mjs";
import WithdrawalRepository from "../repositories/WithdrawalRepository.mjs";
import AmountSetupRepository from '../repositories/AmountSetupRepository.mjs';
import { CommonHandler, ValidationError, NotFoundError } from './CommonHandler.mjs';

class WithdrawalController {
    static async createWithdrawalByUserIdAndSaveAs(req, res) {
        try {
            const withdrawalData = await WithdrawalController.withdrawalValidation(req);
            const withdrawal = await WithdrawalRepository.createWithdrawal(withdrawalData);
            res.status(201).json({ status: 201, success: true, message: 'Withdrawal created successfully', data: withdrawal });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async getAllWithdrawals(req, res) {
        try {
            const { search, startDate, status, endDate, pageNumber = 1, perpage = 10 } = req.query;
            const options = { page: Number(pageNumber), limit: Number(perpage) };
            const filterParams = { search, status, startDate, endDate };
            const withdrawals = Object.keys(filterParams).length > 0 ?
                await WithdrawalRepository.filterWithdrawals(filterParams, options, req) :
                await WithdrawalRepository.getAllWithdrawals(options, req);
            res.status(200).json({ status: 200, success: true, message: 'All withdrawals fetched successfully', data: withdrawals });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async getWithdrawalById(req, res) {
        try {
            const { id } = req.params;
            const withdrawal = await WithdrawalController.validateAndFetchWithdrawalById(id);
            res.status(200).json({ status: 200, success: true, message: 'Withdrawal fetched successfully', data: withdrawal });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async updateWithdrawalByIdAndStatus(req, res) {
        try {
            const { id, status } = req.query;
            await Promise.all ([CommonHandler.validateWithdrawalStatus(status), WithdrawalController.validateAndFetchWithdrawalById(id)]);
            const updatedWithdrawal = await WithdrawalRepository.updateWithdrawalById(id, { status });
            const user = await UserRepository.getUserByUserId(updatedWithdrawal.userId);
            if (!user) { throw new NotFoundError(`User with userId: ${updatedWithdrawal.userId} does not exist`); }
            if ( status === 'Rejected') { user.winningsAmount += updatedWithdrawal.amount; }
            else { user.lifetimeWithdrawalAmount += updatedWithdrawal.amount; }
            await user.save();
            res.status(200).json({ status: 200, success: true, message: 'Withdrawal status updated successfully', data: updatedWithdrawal });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async deleteWithdrawalById(req, res) {
        try {
            const { id } = req.params;
            await WithdrawalController.validateAndFetchWithdrawalById(id);
            const deletedWithdrawal = await WithdrawalRepository.deleteWithdrawalById(id);
            res.status(200).json({ status: 200, success: true, message: 'Withdrawal deleted successfully', data: deletedWithdrawal });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    // Static Methods Only For This Class (Not To Be Used In Routes)
    static async validateAndFetchWithdrawalById(id) {
        await CommonHandler.validateObjectIdFormat(id);
        const withdrawal = await WithdrawalRepository.getWithdrawalById(id);
        if (!withdrawal) { throw new NotFoundError(`Withdrawal with ID ${id} not found`); }
        return withdrawal;
    }

    static async withdrawalValidation(data) {
        const { transactionNo, amount } = data.body;
        const { userId, saveAs } = data.params;

        await CommonHandler.validateRequiredFields({ transactionNo, amount });
        await CommonHandler.validateSixDigitIdFormat(userId);
        await CommonHandler.validateTransactionFormat(transactionNo);

        const existingUser = await UserRepository.getUserByUserId(userId);
        if (!existingUser) { throw new NotFoundError(`User with userId: ${userId} does not exist`); }
        if (amount > existingUser.winningsAmount) { throw new ValidationError(`Insufficient balance in your winnings, current available balance is ${existingUser.winningsAmount}`); }
        existingUser.winningsAmount -= amount;
        existingUser.save();

        const bankDetails = await BankDetailsRepository.getBankDetailsByUserIdAndSaveAs(userId, saveAs);
        if (!bankDetails) { throw new NotFoundError(`Bank details not found for userId ${userId} and saveAs ${saveAs}`); }
        
        data.body.userId = existingUser.userId;
        data.body.userName = existingUser.userName;
        data.body.bankDetails = { bankName: bankDetails.bankName, accountNumber: bankDetails.accountNumber, ifscCode: bankDetails.ifscCode, upiId: bankDetails.upiId, mobile: bankDetails.mobile };

        const [minWithdrawal, maxWithdrawal] = await WithdrawalController.getWithdrawalLimits();
        await WithdrawalController.validateWithdrawalAmount(amount, minWithdrawal, maxWithdrawal);

        return data.body;
    }

    static async getWithdrawalLimits() {
        const [minWithdrawal, maxWithdrawal] = await Promise.all([AmountSetupRepository.getAmountSetupBySettingName('Minimum Withdrawal'), AmountSetupRepository.getAmountSetupBySettingName('Maximum Withdrawl') ]);
        if (!minWithdrawal || !maxWithdrawal) { throw new NotFoundError('One or both of the withdrawal amount settings not  found for Minimum Withdrawal or Maximum Withdrawal'); }
        return [parseInt(minWithdrawal.value), parseInt(maxWithdrawal.value)];
    }

    static async validateWithdrawalAmount(amount, minAmount, maxAmount) {
        if (amount < minAmount) { throw new ValidationError(`Withdrawal amount must be greater than or equal to Minimum Withdrawal Amount: ${minAmount}`); }
        if (amount > maxAmount) { throw new ValidationError(`Withdrawal amount must be less than or equal to Maximum Withdrawal Amount: ${maxAmount}`); }
    }
}

export default WithdrawalController;
