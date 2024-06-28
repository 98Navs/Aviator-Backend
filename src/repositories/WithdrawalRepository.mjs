// src/repository/WithdrawalRepository.mjs
import Withdrawal from "../models/WithdrawalModel.mjs";
import { paginate } from "../project_setup/Utils.mjs";

class WithdrawalRepository {
    
    static async createWithdrawal(data) { return await Withdrawal.create(data); } 

    static async getAllWithdrawals(options, req) { return await paginate(Withdrawal, {}, options.page, options.limit, req); }
    
    static async getWithdrawalByWithdrawalId(withdrawalId) { return await Withdrawal.findOne({ withdrawalId }); }

    static async updateWithdrawalByWithdrawalId(withdrawalId, updateData) { return await Withdrawal.findOneAndUpdate({ withdrawalId }, updateData, { new: true }); }

    static async deleteWithdrawalByWithdrawalId(withdrawalId) { return await Withdrawal.findOneAndDelete({ withdrawalId }); }

    static async filterWithdrawals(filterParams, options, req) {
        const query = {};

        if (filterParams.status) { query.status = new RegExp(`^${filterParams.status}`, 'i'); }
        if (filterParams.search) {
            const searchRegex = new RegExp(`^${filterParams.search}`, 'i');
            query.$or = [
                { $expr: { $regexMatch: { input: { $toString: "$userId" }, regex: searchRegex } } },
                { userName: searchRegex }
            ];
        }
        if (filterParams.startDate || filterParams.endDate) {
            query.createdAt = {};
            if (filterParams.startDate) query.createdAt.$gte = new Date(filterParams.startDate);
            if (filterParams.endDate) { query.createdAt.$lte = new Date(new Date(filterParams.endDate).setHours(23, 59, 59, 999)); }
        }
        return await paginate(Withdrawal, query, options.page, options.limit, req);
    }

}

export default WithdrawalRepository;
