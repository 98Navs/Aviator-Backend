// src/repository/DepositBonusRepository.mjs
import DepositBonus from '../models/DepositBonusModel.mjs';
import { paginate } from '../project_setup/Utils.mjs';

class DepositBonusRepository {
    static async createDepositBonus(depositBonusData) { return await DepositBonus.create(depositBonusData); }

    static async getAllDepositBonuses(options, req) { return await paginate(DepositBonus, {}, options.page, options.limit, req); }

    static async getDepositBonusByOfferId(offerId) { return await DepositBonus.findOne({ offerId }); }

    static async updateDepositBonusByOfferId(offerId, depositBonusData) { return await DepositBonus.findOneAndUpdate({ offerId }, depositBonusData, { new: true }); }

    static async deleteDepositBonusByOfferId(offerId) { return await DepositBonus.findOneAndDelete({ offerId }); }

    static async checkDuplicateAmount(amount) { return await DepositBonus.findOne({ amount }); }
}

export default DepositBonusRepository;
