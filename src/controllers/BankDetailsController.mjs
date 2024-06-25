// src/controllers/BankDetailsController.mjs
import BankDetailsRepository from "../repositories/BankDetailsRepository.mjs";
import UserRepository from "../repositories/UserRepository.mjs";
import { CommonHandler, ValidationError, NotFoundError } from './CommonHandler.mjs';

class BankDetailsController {
    static async createBankDetails(req, res) {
        try {
            const bankDetailsData = await BankDetailsController.bankDetailsValidation(req);
            const bankDetails = await BankDetailsRepository.createBankDetails(bankDetailsData);
            res.status(201).json({ status: 201, success: true, message: 'Bank details created successfully', data: bankDetails });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async getAdminBankDetails(req, res) {
        try {
            const admin = await UserRepository.getUserByEmail('admin@scriza.in');
            if (!admin) { throw new NotFoundError('Admin not found in the database with email: admin@scriza.in'); }
            const bankDetails = await BankDetailsRepository.getBankDetailsByUserId(admin.userId);
            res.status(200).json({ status: 200, success: true, message: 'Admin bank details fetched successfully', data: bankDetails });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async getUserBankDetailsByUserId(req, res) {
        try {
            const { userId } = req.params;
            const bankDetails = await BankDetailsController.validateAndFetchUserByUserId(userId);
            res.status(200).json({ status: 200, success: true, message: 'User bank details fetched successfully', data: bankDetails });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async getSaveAsByUserId(req, res) {
        try {
            const { userId } = req.params;
            await BankDetailsController.validateAndFetchUserByUserId(userId);
            const saveAs = await BankDetailsRepository.getSaveAsByUserId(userId);
            res.status(200).json({ status: 200, success: true, message: 'SaveAs fetched successfully', data: saveAs });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async getBankDetailsByUserIdAndSaveAs(req, res) {
        try {
            const { userId, saveAs } = req.params;
            await BankDetailsController.validateAndFetchUserByUserId(userId);
            const bankDetails = await BankDetailsRepository.getBankDetailsByUserIdAndSaveAs(userId, saveAs);
            res.status(200).json({ status: 200, success: true, message: 'Bank deatils fetched succeessfully by userId and saveAs', data: bankDetails });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async updatePrimaryAccountByBankId(req, res) {
        try {
            const { bankId } = req.params;
            const bankDetails = await BankDetailsController.validateAndFetchBankByBankId(bankId);
            const [currentPrimary, newPrimary] = await Promise.all([BankDetailsRepository.getCurrentPrimaryAccount(bankDetails.userId), BankDetailsRepository.getBankDetailsByBankId(bankId)]);
            if (currentPrimary) { await BankDetailsRepository.updateBankDetailsByBankId(currentPrimary.bankId, { primary: 'No' }); }
            newPrimary.primary = 'Yes';
            await newPrimary.save();
            res.status(200).json({ status: 200, success: true, message: 'Primary bank changed successfully', data: newPrimary });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async updateBankDetailsByUserIdAndSaveAs(req, res) {
        try {
            const { userId, saveAs } = req.params;
            await BankDetailsController.validateAndFetchUserByUserId(userId);
            const updatedData = await BankDetailsController.bankDetailsValidation(req, true);
            const updatedBankDetails = await BankDetailsRepository.updateBankDetailsByUserIdAndSaveAs(userId, saveAs, updatedData);
            res.status(200).json({ status: 200, success: true, message: 'Bank details updated successfully', data: updatedBankDetails });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async deleteBankDetailsByBankId(req, res) {
        try {
            const { bankId } = req.params;
            await BankDetailsController.validateAndFetchBankByBankId(bankId);
            const bankDetails = await BankDetailsRepository.deleteBankDetailsByBankId(bankId);
            if (bankDetails?.primary === 'Yes') {
                const newPrimaryArray = await BankDetailsRepository.getBankDetailsByUserId(bankDetails.userId);
                const newPrimary = newPrimaryArray.length > 0 ? newPrimaryArray[0] : null;
                if (newPrimary) { await BankDetailsRepository.updateBankDetailsByBankId(newPrimary.bankId, { primary: 'Yes' }); }
            }
            res.status(200).json({ status: 200, success: true, message: 'Bank details deleted successfully', data: bankDetails });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    // Static Methods Only For This Class (Not To Be Used In Routes)
    static async validateAndFetchBankByBankId(bankId) {
        await CommonHandler.validateSixDigitIdFormat(bankId);
        const bankDetails = await BankDetailsRepository.getBankDetailsByBankId(bankId);
        if (!bankDetails) throw new NotFoundError(`Bank details not found for bankId ${bankId}.`);
        return bankDetails;
    }

    static async validateAndFetchUserByUserId(userId) {
        await CommonHandler.validateSixDigitIdFormat(userId);
        const bankDetails = await BankDetailsRepository.getBankDetailsByUserId(userId);
        if (!bankDetails || bankDetails.length === 0) throw new NotFoundError(`Bank details not found for userId ${userId}.`);
        return bankDetails;
    }

    static async bankDetailsValidation(data, isUpdate = false) {
        const { userId, bankName, accountNumber, ifscCode, upiId, mobile, saveAs, status } = data.body;
        if (!isUpdate) await CommonHandler.validateRequiredFields({ userId, bankName, accountNumber, ifscCode, upiId, mobile, saveAs });
        if (userId) await CommonHandler.validateSixDigitIdFormat(userId);
        if (bankName) await CommonHandler.validateNameFormat(bankName);
        if (accountNumber) await CommonHandler.validateAccountNumberFormat(accountNumber);
        if (ifscCode) await CommonHandler.validateIfscCodeFormat(ifscCode);
        if (upiId) await CommonHandler.validateUpiIdFormat(upiId);
        if (mobile) await CommonHandler.validateMobileFormat(mobile);
        if (saveAs) await CommonHandler.validateSaveAsFormat(saveAs);
        if (status) if(!CommonHandler.validStatuses.includes(status)) throw new ValidationError(`Status must be one of: ${CommonHandler.validStatuses.join(', ')}`);
        
        const user = await UserRepository.getUserByUserId(userId);
        if (!user) { throw new NotFoundError(`User with this userId ${userId} does not found`); }

        if (!isUpdate) {
            const bankDetails = await BankDetailsRepository.getBankDetailsByUserId(userId);
            data.body.primary = bankDetails.length > 0 ? 'No' : 'Yes';
            const existingSaveAs = await BankDetailsRepository.getSaveAsByUserId(userId);
            if (existingSaveAs.includes(saveAs.toUpperCase())) throw new ValidationError('SaveAs already exists for the user');
        }
        if (data.file) data.body.barCode = `${data.protocol}://${data.get('host')}/bankQRCode/${data.file.filename}`;
        return data.body;
    }
}

export default BankDetailsController;