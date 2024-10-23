// src/repository/StatementRepository.mjs
import Statement from "../models/StatementModel.mjs";
import { paginate } from "../project_setup/Utils.mjs";

class StatementRepository{

    static async createStatement(data) { return await Statement.create(data); }

    static async getAllStatement(options, req) { return await paginate(Statement, {}, options.page, options.limit, req); }

    static async getStatementByTransactionId(transactionId) { return await Statement.findOne({ transactionId }); }
    
    static async getStatementById(id) { return await Statement.findById(id); }

    static async getStatementsByUserId(userId, options, req) {
        const query = { userId };
        return await paginate(Statement, query, options.page, options.limit, req);
    }

    static async getDashboardStats() {
        const todayStart = new Date();
        todayStart.setUTCHours(0, 0, 0, 0);
        const todayEnd = new Date(todayStart.getTime() + 86400000);

        const matchToday = { createdAt: { $gte: todayStart, $lt: todayEnd } };
        const matchBonuses = { category: { $in: ['Deposit Bonus', 'Festival Bonus'] } };
        const matchWithdrawals = { category: 'Withdrawal', status: 'Approved' };
        const matchRecharges = { category: 'Recharge', status: 'Approved' };

        const aggregateStats = (matchStage) => Statement.aggregate([ { $match: matchStage }, { $group: { _id: null, totalAmount: { $sum: '$amount' } } } ]).then(result => result[0]?.totalAmount || 0);

        const [todayBonusAmount, totalBonusAmount, todayWithdrawalAmount, totalWithdrawalAmount, todayRechargeAmount, totalRechargeAmount] = await Promise.all([
            aggregateStats({ ...matchToday, ...matchBonuses }),
            aggregateStats(matchBonuses),
            aggregateStats({ ...matchToday, ...matchWithdrawals }),
            aggregateStats(matchWithdrawals),
            aggregateStats({ ...matchToday, ...matchRecharges }),
            aggregateStats(matchRecharges)
        ]);
        const data = { todayBonusAmount, totalBonusAmount, todayWithdrawalAmount, totalWithdrawalAmount, todayRechargeAmount, totalRechargeAmount };
        return data;
    }

    static async updateStatementById(id, updateData) { return await Statement.findByIdAndUpdate(id, updateData, { new: true }); }

    static async updateStatementByTransactionId(transactionId, updateStatementData) { return await Statement.findOneAndUpdate({ transactionId }, updateStatementData, { new: true }); }

    static async deleteStatementById(id) { return await Statement.findByIdAndDelete(id); }

    static async filterStatements(filterParams, options, req) {
        const query = {};

        if (filterParams.status) { query.status = new RegExp(`^${filterParams.status}`, 'i'); }
        if (filterParams.category) { query.category = new RegExp(`^${filterParams.category}`, 'i'); }
        if (filterParams.search) {
            const searchRegex = new RegExp(`^${filterParams.search}`, 'i');
            query.$or = [
                { $expr: { $regexMatch: { input: { $toString: "$userId" }, regex: searchRegex } } },
                { type: searchRegex }
            ];
        }
        if (filterParams.startDate || filterParams.endDate) {
            query.createdAt = {};
            if (filterParams.startDate) query.createdAt.$gte = new Date(filterParams.startDate);
            if (filterParams.endDate) { query.createdAt.$lte = new Date(new Date(filterParams.endDate).setHours(23, 59, 59, 999)); }
        }
        return await paginate(Statement, query, options.page, options.limit, req);
    }
}
export default StatementRepository;