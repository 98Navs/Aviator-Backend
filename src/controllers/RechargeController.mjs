// src/controllers/RechargeController.mjs
import RechargeRepository from '../repositories/RechargeRepository.mjs';
import UserRepository from "../repositories/UserRepository.mjs";
import AmountSetupRepository from '../repositories/AmountSetupRepository.mjs';
import DepositBonusRepository from '../repositories/DepositBonusRepository.mjs';
import StatementRepository from '../repositories/StatementRepository.mjs';
import { CommonHandler, ValidationError, NotFoundError } from './CommonHandler.mjs';

class RechargeController {
    static async createRechargeByUserId(req, res) {
        try {
            const rechargeData = await RechargeController.rechargeCreateValidation(req);
            const recharge = await RechargeRepository.createRecharge(rechargeData);
            const createRechargeStatement = { userId: recharge.userId, message: `Hi,${recharge.userName} your recharge request for rechargeId: ${recharge.rechargeId} has been registered`, amount: recharge.amount, category: 'Recharge', type: 'Credit', status: recharge.status };
            await StatementRepository.createStatement(createRechargeStatement);
            res.status(201).json({ status: 201, success: true, message: 'Recharge created successfully', data: recharge });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async getAllRecharges(req, res) {
        try {
            const { status, search, startDate, endDate, pageNumber = 1, perpage = 10 } = req.query;
            const options = { page: Number(pageNumber), limit: Number(perpage) };
            const filterParams = { status, search, startDate, endDate };
            const recharges = Object.keys(filterParams).length > 0 ?
                await RechargeRepository.filterRecharges(filterParams, options, req) :
                await RechargeRepository.getAllRecharges(options, req);
            res.status(200).json({ status: 200, success: true, message: 'All recharges fetched successfully', data: recharges });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async getRechargeByRechargeId(req, res) {
        try {
            const { rechargeId } = req.params;
            const recharge = await RechargeController.validateAndFetchRechargeByRechargeId(rechargeId);
            res.status(200).json({ status: 200, success: true, message: 'Recharge fetched successfully', data: recharge });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async updateRechargeByRechargeId(req, res) {
        try {
            const updateRecharge = await RechargeController.rechargeUpdateValidation(req);
            res.status(200).json({ status: 200, success: true, message: 'Recharge status updated successfully', data: updateRecharge });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async deleteRechargeByRechargeId(req, res) {
        try {
            const { rechargeId } = req.params;
            await RechargeController.validateAndFetchRechargeByRechargeId(rechargeId);
            const deletedRecharge = await RechargeRepository.deleteRechargeByRechargeId(id);
            res.status(200).json({ status: 200, success: true, message: 'Recharge deleted successfully', data: deletedRecharge });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    // Static Methods Only For This Class (Not To Be Used In Routes)
    static async validateAndFetchRechargeByRechargeId(rechargeId) {
        await CommonHandler.validateSixDigitIdFormat(rechargeId);
        const recharge = await RechargeRepository.getRechargeByRechargeId(rechargeId);
        if (!recharge) { throw new NotFoundError(`Recharge with rechargeId: ${rechargeId} not found`); }
        return recharge;
    }

    static async rechargeCreateValidation(data) {
        const { transactionNo, amount } = data.body;
        const { userId } = data.params;

        await CommonHandler.validateRequiredFields({ transactionNo, amount });
        await CommonHandler.validateSixDigitIdFormat(userId);
        await CommonHandler.validateTransactionFormat(transactionNo);

        const existingUser = await UserRepository.getUserByUserId(userId);
        if (!existingUser) { throw new NotFoundError(`User with userId: ${userId} does not exist`); }
        data.body.userId = existingUser.userId;
        data.body.userName = existingUser.userName;
        if (data.file) data.body.paymentProof = `${data.protocol}://${data.get('host')}/paymentProof/${data.file.filename}`;

        const minRecharge = await AmountSetupRepository.getAmountSetupBySettingName('Minimum Recharge');
        if (!minRecharge) throw new ValidationError('Recharge amount settings not found for Minimum Recharge');
        if (amount < parseInt(minRecharge.value)) throw new ValidationError(`Recharge amount must be greater than or equal to Minimum Recharge Amount: ${minRecharge.value}`);

        return data.body;
    }

    static async rechargeUpdateValidation(data) {
        const { rechargeId } = data.params;
        const { status } = data.body;

        await CommonHandler.validateRequiredFields({ status });
        await CommonHandler.validateRechargeAndWithdrawalStatus(status);

        const recharge = await RechargeController.validateAndFetchRechargeByRechargeId(rechargeId);
        const user = await UserRepository.getUserByUserId(recharge.userId);
        if (!user) { throw new NotFoundError(`User with userId: ${recharge.userId} does not exist`); }

        let bonusAmount = 0;
        if (status === 'Approved') {
            const depositBonus = await DepositBonusRepository.getDepositBonusesByDate(recharge.createdAt, recharge.amount);
            bonusAmount = depositBonus ? recharge.amount * depositBonus.deal / 100 : 0;
            
            user.depositAmount += recharge.amount;
            user.bonusAmount += bonusAmount;
            user.lifetimeBonusAmount += bonusAmount;
            await user.save();

            const createRechargeStatement = { userId: user.userId, message: `Hi,${user.userName} your recharge request for rechargeId: ${rechargeId} is successfull`, amount: recharge.amount, category: 'Recharge', type: 'Credit', status: status };
            await StatementRepository.createStatement(createRechargeStatement);
            if (bonusAmount) {
                const bonusStatement = { userId: user.userId, message: `Hi,${user.userName} your bonus for rechargeId: ${rechargeId} has been creadit`, amount: bonusAmount, category: 'Deposit Bonus', type: 'Credit', status: status };
                await StatementRepository.createStatement(bonusStatement);
            }
        } else {
            const createRechargeStatement = { userId: user.userId, message: `Hi,${user.userName} your recharge request for rechargeId: ${rechargeId} has been rejected`, amount: recharge.amount, category: 'Recharge', status: status };
            await StatementRepository.createStatement(createRechargeStatement);
        }
        const updateRecharge = await RechargeRepository.updateRechargeByRechargeId(rechargeId, { status, bonusAmount });

        return updateRecharge;
    }
}

export default RechargeController;