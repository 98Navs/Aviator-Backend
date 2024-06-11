// src/repository/FestivalBonusRepository.mjs
import FestivalBonus from '../models/FestivalBonusModel.mjs';
import { paginate } from '../project_setup/Utils.mjs';

class FestivalBonusRepository {
    static async createFestivalBonus(festivalBonusData) { return await FestivalBonus.create(festivalBonusData); }

    static async getAllFestivalBonuses(options, req) { return await paginate(FestivalBonus, {}, options.page, options.limit, req); }

    static async getFestivalBonusByOfferId(offerId) { return await FestivalBonus.findOne({ offerId }); }

    static async updateFestivalBonusByOfferId(offerId, festivalBonusData) { return await FestivalBonus.findOneAndUpdate({ offerId }, festivalBonusData, { new: true }); }

    static async deleteFestivalBonusByOfferId(offerId) { return await FestivalBonus.findOneAndDelete({ offerId }); }

    static async checkDuplicateName(name) { return await FestivalBonus.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } }); }

    static async filterFestivalBonuses(filterParams, options, req) {
        const query = {};

        if (filterParams.search) {
            const searchRegex = new RegExp(`^${filterParams.search}`, 'i');
            query.$or = [
                { $expr: { $regexMatch: { input: { $toString: "$offerId" }, regex: searchRegex } } },
                { $expr: { $regexMatch: { input: { $toString: "$deal" }, regex: searchRegex } } },
                { name: searchRegex },
                { bonusType: searchRegex },
                { status: searchRegex }
            ];
        }
        if (filterParams.startDate || filterParams.endDate) {
            query.createdAt = {};
            if (filterParams.startDate) query.startDate.$gte = new Date(filterParams.startDate);
            if (filterParams.endDate) {
                const endDate = new Date(filterParams.endDate);
                endDate.setHours(23, 59, 59, 999);
                query.createdAt.$lte = endDate;
            }
        }
        return await paginate(FestivalBonus, query, options.page, options.limit, req);
    }
}

export default FestivalBonusRepository;
