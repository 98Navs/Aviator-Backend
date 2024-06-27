// src/repository/WithdrawalRepository.mjs
import Withdrawal from "../models/WithdrawalModel.mjs";
import { paginate } from "../project_setup/Utils.mjs";

class WithdrawalRepository {
    
    static async createWithdrawal(data) { return await Withdrawal.create(data); } 

    static async getAllWithdrawals(options, req) { return await paginate(Withdrawal, {}, options.page, options.limit, req); }
    
    static async getWithdrawalById(id) { return await Withdrawal.findById(id); }

    static async getWithdrawalDashboardStats() {
        const aggregateStats = async (matchStage) => {
            const [result] = await Withdrawal.aggregate([{ $match: { ...matchStage, status: 'Approved' } }, { $group: { _id: null, totalWithdrawalAmount: { $sum: '$amount' } } }]);
            return result ? { totalWithdrawalAmount: result.totalWithdrawalAmount } : { totalWithdrawalAmount: 0 };
        };
        const todayStart = new Date();
        todayStart.setUTCHours(0, 0, 0, 0);
        const [todayStats, totalStats] = await Promise.all([aggregateStats({ updatedAt: { $gte: todayStart, $lt: new Date(todayStart.getTime() + 86400000) } }), aggregateStats({})]);
        const data = { todayWithdrawalAmount: todayStats.totalWithdrawalAmount, totalWithdrawalAmount: totalStats.totalWithdrawalAmount };
        return data;
    }

    static async updateWithdrawalById(id, updateData) { return await Withdrawal.findByIdAndUpdate(id, updateData, { new: true }); }

    static async deleteWithdrawalById(id) { return await Withdrawal.findByIdAndDelete(id); }

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
