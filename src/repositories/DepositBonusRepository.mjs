// src/repository/DepositBonusRepository.mjs
import DepositBonus from '../models/DepositBonusModel.mjs';
import { paginate } from '../project_setup/Utils.mjs';

class DepositBonusRepository {
    static async createDepositBonus(depositBonusData) { return await DepositBonus.create(depositBonusData); }

    static async getAllDepositBonuses(options, req) { return await paginate(DepositBonus, {}, options.page, options.limit, req); }

    static async getDepositBonusByOfferId(offerId) { return await DepositBonus.findOne({ offerId }); }

    static async updateDepositBonusByOfferId(offerId, depositBonusData) { return await DepositBonus.findOneAndUpdate({ offerId }, depositBonusData, { new: true }); }

    static async deleteDepositBonusByOfferId(offerId) { return await DepositBonus.findOneAndDelete({ offerId }); }

    static async checkDuplicateAmount(amount) { return await DepositBonus.findOne({ amount }); }

    static async filterDepositBonuses(filterParams, options, req) {
        const query = {};

        if (filterParams.search) {
            const searchRegex = new RegExp(`^${filterParams.search}`, 'i');
            query.$or = [
                { $expr: { $regexMatch: { input: { $toString: "$offerId" }, regex: searchRegex } } },
                { $expr: { $regexMatch: { input: { $toString: "$amount" }, regex: searchRegex } } },
                { $expr: { $regexMatch: { input: { $toString: "$deal" }, regex: searchRegex } } },
                { status: searchRegex }
            ];
        }
        if (filterParams.startDate || filterParams.endDate) {
            query.createdAt = {};
            if (filterParams.startDate) query.createdAt.$gte = new Date(filterParams.startDate);
            if (filterParams.endDate) { query.createdAt.$lte = new Date(new Date(filterParams.endDate).setHours(23, 59, 59, 999)); }
        }
        return await paginate(DepositBonus, query, options.page, options.limit, req);
    } 
}

export default DepositBonusRepository;
