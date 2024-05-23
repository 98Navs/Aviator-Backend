// src/controllers/DepositBonusController.mjs
import DepositBonusRepository from '../repositories/DepositBonusRepository.mjs';

class DepositBonusController {
    static async createDepositBonus(req, res) {
        try {
            const depositBonusData = await DepositBonusController.depositBonusValidation(req.body);
            const depositBonus = await DepositBonusRepository.createDepositBonus(depositBonusData);
            res.status(201).json({ status: 201, success: true, message: 'Deposit bonus created successfully', depositBonus });
        } catch (error) {
            DepositBonusController.catchError(error, res);
        }
    }

    static async getAllDepositBonuses(req, res) {
        try {
            const { search, startDate, endDate, pageNumber = 1, perpage = 10 } = req.query;
            const options = { page: Number(pageNumber), limit: Number(perpage) };
            if (search || startDate || endDate) {
                const filterParams = { search, ...(startDate && { startDate }), ...(endDate && { endDate }) };
                const depositBonuses = await DepositBonusRepository.filterDepositBonuses(filterParams, options, req);
                if (!depositBonuses.data.length) { return res.status(404).json({ status: 404, success: false, message: 'No data found for the provided details.' }); }
                return res.status(200).json({ status: 200, success: true, message: 'Deposit bonuses filtered successfully', ...depositBonuses });
            } else {
                const depositBonuses = await DepositBonusRepository.getAllDepositBonuses(options, req);
                return res.status(200).json({ status: 200, success: true, message: 'All deposit bonuses fetched successfully', ...depositBonuses });
            }
        } catch (error) {
            DepositBonusController.catchError(error, res);
        }
    }

    static async getDepositBonusByOfferId(req, res) {
        try {
            const { offerId } = req.params;
            const depositBonus = await DepositBonusController.validateAndFetchDepositBonusByOfferId(offerId);
            res.status(200).json({ status: 200, success: true, message: 'Deposit bonus fetched successfully', depositBonus });
        } catch (error) {
            DepositBonusController.catchError(error, res);
        }
    }

    static async updateDepositBonusByOfferId(req, res) {
        try {
            const { offerId } = req.params;
            await DepositBonusController.validateAndFetchDepositBonusByOfferId(offerId)
            const depositBonusData = await DepositBonusController.depositBonusValidation(req.body, true);
            const depositBonus = await DepositBonusRepository.updateDepositBonusByOfferId(offerId, depositBonusData);
            res.status(200).json({ status: 200, success: true, message: 'Deposit bonus updated successfully', depositBonus });
        } catch (error) {
            DepositBonusController.catchError(error, res);
        }
    }

    static async deleteDepositBonusByOfferId(req, res) {
        try {
            const { offerId } = req.params;
            await DepositBonusController.validateAndFetchDepositBonusByOfferId(offerId)
            const festivalBonus = await DepositBonusRepository.deleteDepositBonusByOfferId(offerId);
            res.status(200).json({ status: 200, success: true, message: 'Deposit bonus deleted successfully', festivalBonus });
        } catch (error) {
            DepositBonusController.catchError(error, res);
        }
    }

    //Static Methods Only For This Class (Not To Be Used In Routes)
    static async validateAndFetchDepositBonusByOfferId(offerId) {
        if (!/^[0-9]{6}$/.test(offerId)) { throw new ValidationError('Invalid offerId format.'); }
        const depositBonus = await DepositBonusRepository.getDepositBonusByOfferId(offerId);
        if (!depositBonus) { throw new NotFoundError('DepositBonus not found.'); }
        return depositBonus;
    }

    static async depositBonusValidation(data, isUpdate = false) {
        const { amount, startDate, endDate, deal, status } = data;
        const requiredFields = { amount, startDate, endDate, deal, status };
        const missingFields = Object.entries(requiredFields)
            .filter(([_, value]) => value === undefined || value === '')
            .map(([field]) => field.charAt(0).toUpperCase() + field.slice(1));

        if (missingFields.length > 0) { throw new ValidationError(`Missing required fields: ${missingFields.join(', ')}`); }

        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) { throw new ValidationError('StartDate and EndDate must be valid dates'); }
        if (end < start) { throw new ValidationError('EndDate must be after StartDate'); }
        if (typeof amount !== 'number') { throw new ValidationError('Amount must be a number'); }
        if (typeof deal !== 'number') { throw new ValidationError('Deal must be a number'); }

        const validStatuses = ['Active', 'Deactive'];
        if (!validStatuses.includes(status)) { throw new ValidationError('OfferStatus must be one of: Active or Deactive'); }

        if (!isUpdate) {
            const existingBonus = await DepositBonusRepository.checkDuplicateAmount(amount);
            if (existingBonus) { throw new ValidationError('A deposit bonus with this amount already exists.'); }
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

export default DepositBonusController;
