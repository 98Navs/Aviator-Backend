// src/repository/BettingRepository.mjs
import Betting from '../models/BettingModel.mjs';
import { paginate } from '../project_setup/Utils.mjs';

class BettingRepository {
    static async createBetting(bettingData) { return await Betting.create(bettingData); }

    static async getAllBetting(options, req) { return await paginate(Betting, {}, options.page, options.limit, req); }

    static async getBettingById(id) { return await Betting.findById(id); }
    
    static async getCountAndBetsByBettingId(gameId, bettingId) {
        const [count, bettings] = await Promise.all([ Betting.countDocuments({ gameId, bettingId }), Betting.find({ gameId, bettingId }) ]);
        return { count, bettings };
    }

    static async getLatestBettingId() { return await Betting.findOne().sort({ createdAt: -1 }).exec(); }

    static async getBetsAfterCreatedAt(createdAt) { return await Betting.find({ createdAt: { $gt: new Date(createdAt) } }); }

    static async getBettingsStats(gameId = null) {
        const matchTodayStage = gameId ? { createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }, gameId } : { createdAt: { $gte: new Date().setHours(0, 0, 0, 0) } };
        const matchAllStage = gameId ? { gameId } : {};
        const aggregateSum = async (matchStage, field) => {
            const result = await Betting.aggregate([ { $match: matchStage }, { $group: { _id: null, total: { $sum: field } } } ]);
            return result.length > 0 ? result[0].total : 0;
        };
        const [todayAmount, totalAmount, todayWinAmount, totalWinAmount] = await Promise.all([aggregateSum(matchTodayStage, '$amount'), aggregateSum(matchAllStage, '$amount'), aggregateSum(matchTodayStage, '$winAmount'), aggregateSum(matchAllStage, '$winAmount')]);
        const data = { todayAmount, totalAmount, todayWinAmount, totalWinAmount };
        return data;
    }

    static async getDashboardStats() {
        const aggregateStats = async (matchStage) => {
            const [result] = await Betting.aggregate([ { $match: matchStage }, { $group: { _id: null, totalAmount: { $sum: '$amount' }, totalWinAmount: { $sum: '$winAmount' } } } ]);
            return result ? { totalAmount: result.totalAmount, totalWinAmount: result.totalWinAmount, profit: result.totalAmount - result.totalWinAmount } : { totalAmount: 0, totalWinAmount: 0, profit: 0 };
        };
        const [todayStats, totalStats] = await Promise.all([aggregateStats({ createdAt: { $gte: new Date().setHours(0, 0, 0, 0) } }), aggregateStats({})]);
        const data = { todayAmount: todayStats.totalAmount, totalAmount: totalStats.totalAmount, todayWinAmount: todayStats.totalWinAmount, totalWinAmount: totalStats.totalWinAmount, todayProfit: todayStats.profit, totalProfit: totalStats.profit };
        return data;
    }

    static async updateBettingById(id, bettingData) {
        const betting = await Betting.findById(id);
        Object.assign(betting, bettingData);
        return await betting.save();
    }

    static async deleteBettingById(id) { return await Betting.findByIdAndDelete( id ); }

    static async filterBetting(filterParams, options, req) {
        const query = {};
        if (filterParams.gameId) { query.gameId = filterParams.gameId; }
        if (filterParams.search) {
            const searchRegex = new RegExp(`^${filterParams.search}`, 'i');
            const isNumeric = !isNaN(filterParams.search);
            query.$or = [
                ...(isNumeric ? [{ bettingId: Number(filterParams.search) }, { userId: Number(filterParams.search) }] : []),
                { userName: searchRegex },
                { status: searchRegex }
            ];
        }
        if (filterParams.startDate || filterParams.endDate) {
            query.createdAt = {};
            if (filterParams.startDate) query.createdAt.$gte = new Date(filterParams.startDate);
            if (filterParams.endDate) {
                const endDate = new Date(filterParams.endDate);
                endDate.setHours(23, 59, 59, 999);
                query.createdAt.$lte = endDate;
            }
        }
        return await paginate(Betting, query, options.page, options.limit, req);
    }
}

export default BettingRepository;  