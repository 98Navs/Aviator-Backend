// src/repository/BettingRepository.mjs
import Betting from '../models/BettingModel.mjs';
import { paginate } from '../project_setup/Utils.mjs';

class BettingRepository {
    static async createBetting(bettingData) { return await Betting.create(bettingData); }

    static async getAllBetting(options, req) { return await paginate(Betting, {}, options.page, options.limit, req); }

    static async getBettingById(id) { return await Betting.findById( id ); }

    static async getBettingByBettingId(bettingId) {
        const betting = await Betting.find({ bettingId });
        return betting.length > 0 ? betting : null;
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
