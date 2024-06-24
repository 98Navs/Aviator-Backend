// src/controllers/BankDetailsController.mjs
import BankDetailsRepository from "../repositories/BankDetailsRepository.mjs";
import UserRepository from "../repositories/UserRepository.mjs"
import { CommonHandler, ValidationError, NotFoundError } from './CommonHandler.mjs';

class BankDetailsController {
    static async createBankdeatils(req, res) {
        try {
            const bankDetailsData = await BankDetailsController.bankDetailsValidation(req);
            const bankDetails = await BankDetailsRepository.createBankdeatils(bankDetailsData);
            return res.status(201).json({ status: 201, success: true, message: 'Bank details created successfully', bankDetails });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async getAdminBankDetails(req, res) {
        try {
            const admin = await UserRepository.getUserByEmail('admin@scriza.in');
            const bankDetails = await BankDetailsRepository.getBankDeatilsByUserId(admin.userId);
            return res.status(200).json({ status: 200, success: true, message: 'Admin bank details fetched successfully', bankDetails });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async getUserBankDetailsByUserId(req, res) {
        try {
            const { userId } = req.params;
            const bankDetails = await BankDetailsRepository.getBankDeatilsByUserId(userId);
            return res.status(200).json({ status: 200, success: true, message: 'User bank details fetched successfully', bankDetails });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async getSaveAsByUserId(req, res) {
        try {
            const { userId } = req.params;
            const bankDetails = await BankDetailsRepository.getBankDeatilsByUserId(userId);
            const data = bankDetails.map(bank => ({ saveAs: bank.saveAs }));
            return res.status(200).json({ status: 200, success: true, message: 'User bank details fetched successfully', data });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async updateBankDetailsByUserIdAndSaveAs(req, res) {
        try {
            const { userId, saveAs } = req.params;
            const updatedData = await BankDetailsController.bankDetailsValidation(req, true);
            const updatedBankDetails = await BankDetailsRepository.updateBankDeatilsByUserIdAndSaveAs(userId, saveAs, updatedData);
            return res.status(200).json({ status: 200, success: true, message: 'User bank details updated successfully', updatedBankDetails });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async updatePrimaryAccount(req, res) {
        try {
            
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    //Static Methods Only For This Class (Not To Be Used In Routes)
    static async validateAndFetchUserByUserId(userId) {
        await CommonHandler.validateSixDigitIdFormat(userId);
        const user = await UserRepository.getUserByUserId(userId);
        if (!user) { throw new NotFoundError('User not found.'); }
        return user;
    }

    static async bankDetailsValidation(data, isUpdate = false) {
        const { userId, bankName, accountNumber, ifscCode, upiId, mobile, saveAs, primary, status } = data.body;

        if (!isUpdate) { await CommonHandler.validateRequiredFields({ userId, bankName, accountNumber, ifscCode, upiId, mobile, saveAs }); }
        if (userId) { await CommonHandler.validateSixDigitIdFormat(userId); }
        if (bankName) { await CommonHandler.validateNameFormat(bankName); }
        if (bankName) { data.body.bankName = bankName.trim().toUpperCase(); }
        if (accountNumber) { await CommonHandler.validateAccountNumberFormat(accountNumber); }
        if (ifscCode) { await CommonHandler.validateIfscCodeFormat(ifscCode); }
        if (ifscCode) { data.body.ifscCode = ifscCode.trim().toUpperCase(); }
        if (upiId) { await CommonHandler.validateUpiIdFormat(upiId); }
        if (upiId) { data.body.upiId = upiId.trim(); }
        if (mobile) { await CommonHandler.validateMobileFormat(mobile); }
        if (saveAs) { await CommonHandler.validateSaveAsFormat(saveAs); }
        if (saveAs) { data.body.saveAs = saveAs.trim().toUpperCase(); }
        if (status) { await CommonHandler.validStatuses(status); }

        const user = await UserRepository.getUserByUserId(userId);
        if (!user) { throw new NotFoundError(`User with this ${userId} does not found`); }

        if (data.file) { data.body.barCode = `${data.protocol}://${data.get('host')}/bankQRCode/${data.file.filename}`; }
    
        if (!isUpdate) {
            const bank = await BankDetailsRepository.getBankDeatilsByUserId(userId);
            if (bank.length > 0) { data.body.primary = 'No'; }
            const saveAs = await BankDetailsRepository.saveAsAlreadyExistForUser(userId);
            if (saveAs.includes(data.body.saveAs)) { throw new ValidationError('SaveAs already exists for the user'); }
        }

        return data.body;
    }
}

export default BankDetailsController;
