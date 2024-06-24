// src/repository/BankDetailsRepository.mjs
import BankDetails from "../models/BankDetailsModel.mjs";

class BankDetailsRepository{

    static async createBankdeatils(bankDetailsData) { return await BankDetails.create(bankDetailsData); }

    static async getBankDeatilsByUserId(userId) { return await BankDetails.find({ userId }); }

    static async saveAsAlreadyExistForUser(userId) { return (await BankDetails.find({ userId }, 'saveAs')).map(({ saveAs }) => saveAs); }

    static async getBankDeatilsByUserIdAndSaveAs(userId, saveAs) { return await BankDetails.findOne({ userId, saveAs }); }

    static async updateBankDeatilsByUserIdAndSaveAs(userId, saveAs, bankDetails) { return await BankDetails.findOneAndUpdate({ userId, saveAs }, bankDetails, { new: true }); }
    
}
export default BankDetailsRepository;