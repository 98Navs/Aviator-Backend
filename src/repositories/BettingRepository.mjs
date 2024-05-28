// src/repository/BettingRepository.mjs
import Betting from '../models/BettingModel.mjs';
import { paginate } from '../project_setup/Utils.mjs';

class BettingRepository {
    static async createBetting(bettingData) { return await Betting.create(bettingData); }

    static async getAllBetting(options, req) { return await paginate(Betting, {}, options.page, options.limit, req); }

    static async getBettingById(id) { return await Betting.findById( id ); }

    static async getBettingByBettingId(bettingId) { return await Betting.find({ bettingId }); }

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
            query.$or = [
                { bettingId: Number(filterParams.search) },
                { userId: Number(filterParams.search) },
                { userName: searchRegex },
                { status: searchRegex }
            ];
        }
        if (filterParams.startDate && filterParams.endDate) {
            query.createdAt = {};
            if (filterParams.startDate) query.createdAt.$gte = new Date(filterParams.startDate);
            if (filterParams.endDate) query.createdAt.$lte = new Date(filterParams.endDate);
        }
        return await paginate(Betting, query, options.page, options.limit, req);
    }
}

export default BettingRepository;
