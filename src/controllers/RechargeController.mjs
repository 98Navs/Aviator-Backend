// src/controllers/RechargeController.mjs
import RechargeRepository from '../repositories/RechargeRepository.mjs'
import UserRepository from "../repositories/UserRepository.mjs";
import AmountSetupRepository from '../repositories/AmountSetupRepository.mjs';
import DepositBonusRepository from '../repositories/DepositBonusRepository.mjs'
import { CommonHandler, ValidationError, NotFoundError } from './CommonHandler.mjs';

class RechargeController {
    static async createRechargeByUserId(req, res) {
        try {
            const rechargeData = await RechargeController.rechargeCreateValidation(req);
            const recharge = await RechargeRepository.createRecharge(rechargeData);
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

    static async getRechargeById(req, res) {
        try {
            const { id } = req.params;
            const recharge = await RechargeController.validateAndFetchRechargeById(id);
            res.status(200).json({ status: 200, success: true, message: 'Recharge fetched successfully', data: recharge });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async updateRechargeById(req, res) {
        try {
            const updateRecharge = await RechargeController.rechargeUpdateValidation(req);
            res.status(200).json({ status: 200, success: true, message: 'Recharge status updated successfully', data: updateRecharge });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async deleteRechargeById(req, res) {
        try {
            const { id } = req.params;
            await RechargeController.validateAndFetchRechargeById(id);
            const deletedRecharge = await RechargeRepository.deleteRechargeById(id);
            res.status(200).json({ status: 200, success: true, message: 'Recharge deleted successfully', data: deletedRecharge });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    // Static Methods Only For This Class (Not To Be Used In Routes)
    static async validateAndFetchRechargeById(id) {
        await CommonHandler.validateObjectIdFormat(id);
        const recharge = await RechargeRepository.getRechargeById(id);
        if (!recharge) { throw new NotFoundError(`Recharge with ID ${id} not found`); }
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
        const { id } = data.params;
        const { status } = data.body;

        await CommonHandler.validateRequiredFields({ status });
        await CommonHandler.validateRechargeAndWithdrawalStatus(status);

        let bonusAmount = 0;
        if (status === 'Approved') {
            const recharge = await RechargeController.validateAndFetchRechargeById(id);
            const depositBonus = await DepositBonusRepository.getDepositBonusesByDate(recharge.createdAt, recharge.amount);
            bonusAmount = depositBonus ? recharge.amount * depositBonus.deal / 100 : 0;
            
            const user = await UserRepository.getUserByUserId(recharge.userId);
            if (!user) { throw new NotFoundError(`User with userId: ${recharge.userId} does not exist`); }
            user.depositAmount += recharge.amount;
            user.bonusAmount += bonusAmount;
            user.lifetimeBonusAmount += bonusAmount;
            await user.save();
        }
        const updateRecharge = await RechargeRepository.updateRechargeById(id, { status, bonusAmount });

        return updateRecharge;
    }
}

export default RechargeController;