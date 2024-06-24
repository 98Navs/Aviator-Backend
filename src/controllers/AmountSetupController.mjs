// src/controllers/AmountSetupController.mjs
import AmountSetupRepository from '../repositories/AmountSetupRepository.mjs';
import { CommonHandler, ValidationError, NotFoundError } from './CommonHandler.mjs'

class AmountSetupController {
    static async createAmountSetup(req, res) {
        try {
            const amountSetupData = await AmountSetupController.amountSetupValidation(req.body);
            const amountSetup = await AmountSetupRepository.createAmountSetup(amountSetupData);
            res.status(201).json({ status: 201, success: true, message: 'Amount Setup created successfully', amountSetup });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async getAllAmountSetup(req, res) {
        try {
            const { search, pageNumber = 1, perpage = 10 } = req.query;
            const options = { page: Number(pageNumber), limit: Number(perpage) };
            const filterParams = { search };
            const amountSetup = Object.keys(filterParams).length > 0 ?
                await AmountSetupRepository.filterAmountSetup(filterParams, options, req) :
                await AmountSetupRepository.getAllAmountSetup(options, req);
            return res.status(200).json({ status: 200, success: true, message: 'All amount setup fetched successfully', ...amountSetup });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

     static async getAmountSetupById(req, res) {
        try {
            const { id } = req.params;
            const amountSetup = await AmountSetupController.validateAndFetchAmountSetupById(id);
            res.status(200).json({ status: 200, success: true, message: 'Amount setup fetched successfully', amountSetup });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async updateAmountSetupById(req, res) {
        try {
            const { id } = req.params;
            await AmountSetupController.validateAndFetchAmountSetupById(id);
            const amountSetupData = await AmountSetupController.amountSetupValidation(req.body, true);
            const amountSetup = await AmountSetupRepository.updateAmountSetupById(id, amountSetupData);
            res.status(200).json({ status: 200, success: true, message: 'Amount setup updated successfully', amountSetup });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async deleteAmountSetupById(req, res) {
        try {
            const { id } = req.params;
            await AmountSetupController.validateAndFetchAmountSetupById(id);
            const amountSetup = await AmountSetupRepository.deleteAmountSetupById(id);
            res.status(200).json({ status: 200, success: true, message: 'Amount setup deleted successfully', amountSetup });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    // Static Methods Only For This Class (Not To Be Used In Routes)
    static async validateAndFetchAmountSetupById(id) {
        await CommonHandler.validateObjectIdFormat(id);
        const amountSetup = await AmountSetupRepository.getAmountSetupById(id);
        if (!amountSetup) { throw new NotFoundError('Amount setup not found.'); }
        return amountSetup;
    }

    static async amountSetupValidation(data, isUpdate = false) {
        const { settingName, value } = data;
        await CommonHandler.validateRequiredFields({ settingName, value });
        
        if (typeof settingName !== 'string') { throw new ValidationError('SettingName must be a string'); }
        if (typeof value !== 'string') { throw new ValidationError('Value must be a string'); }

        data.settingName = settingName.trim();
        data.value = value.trim();        
        if (!isUpdate) {
            const existingName = await AmountSetupRepository.checkDuplicateSettingName(data.settingName);
            if (existingName) { throw new ValidationError('A setting with same name already exists.'); }
        }
        
        return data;
    }
}

export default AmountSetupController;