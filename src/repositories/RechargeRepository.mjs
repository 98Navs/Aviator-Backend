// src/repository/RechargeRepository.mjs
import Recharge from "../models/RechargeModel.mjs";
import { paginate } from "../project_setup/Utils.mjs";

class RechargeRepository {

    static async createRecharge(data) { return await Recharge.create(data); }

    static async getAllRecharges(options, req) { return await paginate(Recharge, {}, options.page, options.limit, req); }

    static async getRechargeByRechargeId(rechargeId) { return await Recharge.findOne({ rechargeId }); }

    static async updateRechargeByRechargeId(rechargeId, status) { return await Recharge.findOneAndUpdate({rechargeId}, status, { new: true }); }

    static async deleteRechargeByRechargeId(rechargeId) { return await Recharge.findOneAndDelete({rechargeId}); }

    static async filterRecharges(filterParams, options, req) {
        const query = {};

        if (filterParams.status) { query.status = new RegExp(`^${filterParams.status}`, 'i'); }
        if (filterParams.search) {
            const searchRegex = new RegExp(`^${filterParams.search}`, 'i');
            query.$or = [
                { $expr: { $regexMatch: { input: { $toString: "$userId" }, regex: searchRegex } } },
                { $expr: { $regexMatch: { input: { $toString: "$rechargeId" }, regex: searchRegex } } },
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