// src/repository/RechargeRepository.mjs
import Recharge from "../models/RechargeModel.mjs";
import { paginate } from "../project_setup/Utils.mjs";

class RechargeRepository {

    static async createRecharge(data) { return await Recharge.create(data); }

    static async getAllRecharges(options, req) { return await paginate(Recharge, {}, options.page, options.limit, req); }

    static async getRechargeById(id) { return await Recharge.findById(id); }

    static async getRechargeDashboardStats() {
        const aggregateStats = async (matchStage) => {
        const [result] = await Recharge.aggregate([ { $match: { ...matchStage, status: 'Approved' } }, { $group: { _id: null, totalRechargeAmount: { $sum: '$amount' }, totalBonusAmount: { $sum: '$bonusAmount' } } } ]);
            return result ? { totalRechargeAmount: result.totalRechargeAmount, totalBonusAmount: result.totalBonusAmount } : { totalRechargeAmount: 0, totalBonusAmount: 0 };
        };
        const todayStart = new Date();
        todayStart.setUTCHours(0, 0, 0, 0);
        const [todayStats, totalStats] = await Promise.all([ aggregateStats({ updatedAt: { $gte: todayStart, $lt: new Date(todayStart.getTime() + 86400000) } }), aggregateStats({}) ]);
        const data = { todayRechargeAmount: todayStats.totalRechargeAmount, totalRechargeAmount: totalStats.totalRechargeAmount, todayBonusAmount: todayStats.totalBonusAmount, totalBonusAmount: totalStats.totalBonusAmount };
        return data;
    }

    static async updateRechargeById(id, status) { return await Recharge.findByIdAndUpdate(id, status, { new: true }); }

    static async deleteRechargeById(id) { return await Recharge.findByIdAndDelete(id); }

    static async filterRecharges(filterParams, options, req) {
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
        return await paginate(Recharge, query, options.page, options.limit, req);
    }
}

export default RechargeRepository;