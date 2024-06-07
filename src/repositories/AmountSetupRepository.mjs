// src/repository/AmountSetupRepository.mjs
import AmountSetup from '../models/AmountSetupModel.mjs';
import { paginate } from '../project_setup/Utils.mjs';

class AmountSetupRepository {
    static async createAmountSetup(amountSetupData) { return await AmountSetup.create(amountSetupData); }

    static async getAllAmountSetup(options, req) { return await paginate(AmountSetup, {}, options.page, options.limit, req); }

    static async getAmountSetupById(id) { return await AmountSetup.findById(id); }

    static async getAmountSetupBySettingName(settingName) { return await AmountSetup.findOne({ settingName: new RegExp(`^${settingName}$`, 'i') }); }

    static async updateAmountSetupById(id, amountSetupData) { return await AmountSetup.findByIdAndUpdate(id, amountSetupData, { new: true }); }

    static async deleteAmountSetupById(id) { return await AmountSetup.findByIdAndDelete(id); }

    static async checkDuplicateSettingName(settingName) { return await AmountSetup.findOne({ settingName: new RegExp(`^${settingName}$`, 'i') }); }

    static async filterAmountSetup(filterParams, options, req) {
        const query = {};

        if (filterParams.search) {
            const searchRegex = new RegExp(`^${filterParams.search}`, 'i');
            query.$or = [ { settingName: searchRegex }, { value: searchRegex } ];
        }
        return await paginate(AmountSetup, query, options.page, options.limit, req);
    }
}

export default AmountSetupRepository;