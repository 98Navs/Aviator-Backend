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
}

export default FestivalBonusRepository;
