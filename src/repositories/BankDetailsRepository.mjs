// src/repository/BankDetailsRepository.mjs
import BankDetails from "../models/BankDetailsModel.mjs";

class BankDetailsRepository {
    static async createBankDetails(data) { return await BankDetails.create(data); }

    static async getBankDetailsByUserId(userId) { return await BankDetails.find({ userId }); }

    static async getSaveAsByUserId(userId) { return await BankDetails.find({ userId }, 'saveAs').then(results => results.map(({ saveAs }) => saveAs)); }

    static async getBankDetailsByUserIdAndSaveAs(userId, saveAs) { return await BankDetails.findOne({ userId, saveAs: new RegExp(`^${saveAs}`, 'i')}); }

    static async getBankDetailsByBankId(bankId) { return await BankDetails.findOne({ bankId }); }

    static async getCurrentPrimaryAccount(userId) { return await BankDetails.findOne({ userId, primary: 'Yes' }); }

    static async updateBankDetailsByUserIdAndSaveAs(userId, saveAs, updateData) { return await BankDetails.findOneAndUpdate({ userId, saveAs: new RegExp(`^${saveAs}`, 'i') }, updateData, { new: true }); }

    static async updateBankDetailsByBankId(bankId, updateData) { return await BankDetails.findOneAndUpdate({ bankId }, updateData, { new: true }); }

    static async deleteBankDetailsByBankId(bankId) { return await BankDetails.findOneAndDelete({ bankId }); }

    static async deleteAllBankDetailsByUserId(userId) { return await BankDetails.deleteMany({ userId }); }
}

export default BankDetailsRepository;