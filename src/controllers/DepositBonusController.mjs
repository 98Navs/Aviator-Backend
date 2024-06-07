// src/controllers/DepositBonusController.mjs
import DepositBonusRepository from '../repositories/DepositBonusRepository.mjs';
import { ErrorHandler, ValidationError, NotFoundError } from '../controllers/ErrorHandler.mjs'

class DepositBonusController {
    static async createDepositBonus(req, res) {
        try {
            const depositBonusData = await DepositBonusController.depositBonusValidation(req.body);
            const depositBonus = await DepositBonusRepository.createDepositBonus(depositBonusData);
            res.status(201).json({ status: 201, success: true, message: 'Deposit bonus created successfully', depositBonus });
        } catch (error) {
            ErrorHandler.catchError(error, res);
        }
    }

    static async getAllDepositBonuses(req, res) {
        try {
            const { search, startDate, endDate, pageNumber = 1, perpage = 10 } = req.query;
            const options = { page: Number(pageNumber), limit: Number(perpage) };
            const filterParams = { search, startDate, endDate };
            const depositBonuses = Object.keys(filterParams).length > 0 ?
                await DepositBonusRepository.filterDepositBonuses(filterParams, options, req) :
                await DepositBonusRepository.getAllDepositBonuses(options, req);
            return res.status(200).json({ status: 200, success: true, message: 'Deposit bonuses filtered successfully', ...depositBonuses });
        } catch (error) {
            ErrorHandler.catchError(error, res);
        }
    }

    static async getDepositBonusByOfferId(req, res) {
        try {
            const { offerId } = req.params;
            const depositBonus = await DepositBonusController.validateAndFetchDepositBonusByOfferId(offerId);
            res.status(200).json({ status: 200, success: true, message: 'Deposit bonus fetched successfully', depositBonus });
        } catch (error) {
            ErrorHandler.catchError(error, res);
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
            ErrorHandler.catchError(error, res);
        }
    }

    static async deleteDepositBonusByOfferId(req, res) {
        try {
            const { offerId } = req.params;
            await DepositBonusController.validateAndFetchDepositBonusByOfferId(offerId)
            const festivalBonus = await DepositBonusRepository.deleteDepositBonusByOfferId(offerId);
            res.status(200).json({ status: 200, success: true, message: 'Deposit bonus deleted successfully', festivalBonus });
        } catch (error) {
            ErrorHandler.catchError(error, res);
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
        if (missingFields.length > 0) { throw new NotFoundError(`Missing required fields: ${missingFields.join(', ')}`); }

        if (typeof amount !== 'number') { throw new ValidationError('Amount must be a number'); }
        if (typeof startDate !== 'string') { throw new ValidationError('StartDate must be a string'); }
        if (typeof endDate !== 'string') { throw new ValidationError('EndDate must be a string'); }
        if (typeof deal !== 'number') { throw new ValidationError('Deal must be a number'); }
        if (typeof status !== 'string') { throw new ValidationError('Status must be a string'); }

        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) { throw new ValidationError('StartDate and EndDate must be valid dates in ISO format'); }
        if (end < start) { throw new ValidationError('EndDate must be after StartDate'); }

        const validStatuses = ['Active', 'Deactive'];
        if (!validStatuses.includes(status)) { throw new ValidationError(`Status must be one of: ${validStatuses.join(', ')} without any space`); } 

        if (!isUpdate) {
            const existingBonus = await DepositBonusRepository.checkDuplicateAmount(amount);
            if (existingBonus && existingBonus.status === 'Active') { throw new ValidationError('A deposit bonus with Active status for this amount already exists.'); }
        }
        return data;
    }
}

export default DepositBonusController;