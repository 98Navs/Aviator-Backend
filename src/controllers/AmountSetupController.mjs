// src/controllers/DepositBonusController.mjs
import AmountSetupRepository from '../repositories/AmountSetupRepository.mjs';

class AmountSetupController {
    static async createAmountSetup(req, res) {
        try {
            req.body.settingName = req.body.settingName.replace(/^\s+|\s+$/g, ''); 
            req.body.value = req.body.value.replace(/^\s+|\s+$/g, ''); 
            const amountSetupData = await AmountSetupController.amountSetupValidation(req.body);
            const amountSetup = await AmountSetupRepository.createAmountSetup(amountSetupData);
            res.status(201).json({ status: 201, success: true, message: 'Amount Setup created successfully', amountSetup });
        } catch (error) {
            AmountSetupController.catchError(error, res);
        }
    }

    static async getAllAmountSetup(req, res) {
        try {
            const { search, pageNumber = 1, perpage = 10 } = req.query;
            const options = { page: Number(pageNumber), limit: Number(perpage) };
            if (search) {
                const amountSetup = await AmountSetupRepository.filterAmountSetup( options, req);
                if (!amountSetup.data.length) { return res.status(404).json({ status: 404, success: false, message: 'No data found for the provided details.' }); }
                return res.status(200).json({ status: 200, success: true, message: 'Amount Setup filtered successfully', ...amountSetup });
            } else {
                const amountSetup = await AmountSetupRepository.getAllAmountSetup(options, req);
                return res.status(200).json({ status: 200, success: true, message: 'All amount setup fetched successfully', ...amountSetup });
            }
        } catch (error) {
            AmountSetupController.catchError(error, res);
        }
    }

    static async getAmountSetupByOfferId(req, res) {
        try {
            const { offerId } = req.params;
            const amountSetup = await AmountSetupController.validateAndFetchAmountSetupByOfferId(offerId);
            res.status(200).json({ status: 200, success: true, message: 'Amount setup fetched successfully', amountSetup });
        } catch (error) {
            AmountSetupController.catchError(error, res);
        }
    }

    static async updateAmountSetupByOfferId(req, res) {
        try {
            const { offerId } = req.params;
            await AmountSetupController.validateAndFetchAmountSetupByOfferId(offerId)
            const amountSetupData = await AmountSetupController.amountSetupValidation(req.body, true);
            const amountSetup = await AmountSetupRepository.updateAmountSetupByOfferId(offerId, amountSetupData);
            res.status(200).json({ status: 200, success: true, message: 'Amount setup updated successfully', amountSetup });
        } catch (error) {
            AmountSetupController.catchError(error, res);
        }
    }

    static async deleteAmountSetupByOfferId(req, res) {
        try {
            const { offerId } = req.params;
            await AmountSetupController.validateAndFetchAmountSetupByOfferId(offerId)
            const amountSetup = await AmountSetupRepository.deleteAmountSetupByOfferId(offerId);
            res.status(200).json({ status: 200, success: true, message: 'Amount setup deleted successfully', amountSetup });
        } catch (error) {
            AmountSetupController.catchError(error, res);
        }
    }

    //Static Methods Only For This Class (Not To Be Used In Routes)
    static async validateAndFetchAmountSetupByOfferId(offerId) {
        if (!/^[0-9]{6}$/.test(offerId)) { throw new ValidationError('Invalid offerId format.'); }
        const amountSetup = await AmountSetupRepository.getAmountSetupByOfferId(offerId);
        if (!amountSetup) { throw new NotFoundError('Amount setup not found.'); }
        return amountSetup;
    }

    static async amountSetupValidation(data, isUpdate = false) {
        const { settingName, value } = data;
        const requiredFields = { settingName, value };
        const missingFields = Object.entries(requiredFields)
            .filter(([_, value]) => value === undefined || value === '')
            .map(([field]) => field.charAt(0).toUpperCase() + field.slice(1));

        if (missingFields.length > 0) { throw new ValidationError(`Missing required fields: ${missingFields.join(', ')}`); }
        if (typeof settingName !== 'string') { throw new ValidationError('SettingName must be a string'); }
        if (typeof value !== 'string') { throw new ValidationError('Value must be a string'); }

        if (!isUpdate) {
            const existingName = await AmountSetupRepository.checkDuplicateSettingName(settingName);
            if (existingName) { throw new ValidationError('A setting name with this value already exists.'); }
        }
        return requiredFields;
    }

    static async catchError(error, res) {
        try {
            if (error instanceof ValidationError) { res.status(400).json({ status: 400, success: false, message: error.message }); }
            else if (error instanceof NotFoundError) { res.status(404).json({ status: 404, success: false, message: error.message }); }
            else { res.status(500).json({ status: 500, success: false, message: 'Internal server error.' }); }
        } catch (error) {
            res.status(500).json({ status: 500, success: false, message: 'Something unexpected has happened' });
        }
    }
}

class ValidationError extends Error { constructor(message) { super(message); this.name = 'ValidationError'; } }
class NotFoundError extends Error { constructor(message) { super(message); this.name = 'NotFoundError'; } }

export default AmountSetupController;
