// src/repository/DepositBonusRepository.mjs
import AmountSetup from '../models/AmountSetupModel.mjs';
import { paginate } from '../project_setup/Utils.mjs';

class AmountSetupRepository {
    static async createAmountSetup(amountSetupData) { return await AmountSetup.create(amountSetupData); }

    static async getAllAmountSetup(options, req) { return await paginate(AmountSetup, {}, options.page, options.limit, req); }

    static async getAmountSetupByOfferId(offerId) { return await AmountSetup.findOne({ offerId }); }

    static async updateAmountSetupByOfferId(offerId, amountSetupData) { return await AmountSetup.findOneAndUpdate({ offerId }, amountSetupData, { new: true }); }

    static async deleteAmountSetupByOfferId(offerId) { return await AmountSetup.findOneAndDelete({ offerId }); }

    static async checkDuplicateSettingName(settingName) { return await AmountSetup.findOne({ settingName }); }

    static async filterAmountSetup(filterParams, options, req) {
        const query = {};

        if (filterParams.search) {
            const searchRegex = new RegExp(`^${filterParams.search}`, 'i');
            query.$or = [ { settingName: searchRegex }, { value: searchRegex} ];
        }
        return await paginate(AmountSetup, query, options.page, options.limit, req);
    }
}

export default AmountSetupRepository;
