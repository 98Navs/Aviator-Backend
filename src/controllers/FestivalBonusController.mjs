// src/controllers/FestivalBonusController.mjs
import FestivalBonusRepository from '../repositories/FestivalBonusRepository.mjs';
import { ErrorHandler, ValidationError, NotFoundError } from '../controllers/ErrorHandler.mjs'

class FestivalBonusController {
    static async createFestivalBonus(req, res) {
        try {
            const festivalBonusData = await FestivalBonusController.festivalBonusValidation(req.body);
            const festivalBonus = await FestivalBonusRepository.createFestivalBonus(festivalBonusData);
            res.status(201).json({ status: 201, success: true, message: 'Festival bonus created successfully', festivalBonus });
        } catch (error) {
            ErrorHandler.catchError(error, res);
        }
    }

    static async getAllFestivalBonuses(req, res) {
        try {
            const { search, startDate, endDate, pageNumber = 1, perpage = 10 } = req.query;
            const options = { page: Number(pageNumber), limit: Number(perpage) };
            const filterParams = { search, startDate, endDate };
            const festivalBonuses = Object.keys(filterParams).length > 0 ?
                await FestivalBonusRepository.filterFestivalBonuses(filterParams, options, req) :
                await FestivalBonusRepository.getAllFestivalBonuses(options, req);
            return res.status(200).json({ status: 200, success: true, message: 'All festival bonuses fetched successfully', ...festivalBonuses });
        } catch (error) {
            ErrorHandler.catchError(error, res);
        }
    }

    static async getFestivalBonusByOfferId(req, res) {
        try {
            const { offerId } = req.params;
            const festivalBonus = await FestivalBonusController.validateAndFetchFestivalBonusByOfferId(offerId);
            res.status(200).json({ status: 200, success: true, message: 'Festival bonus fetched successfully', festivalBonus });
        } catch (error) {
            ErrorHandler.catchError(error, res);
        }
    }

    static async getAllowedBonusAndStatusTypes(req, res) {
        try {
            const allowedBonusTypes = FestivalBonusController.validBonusTypes;
            const allowedStatusTypes = FestivalBonusController.validStatuses;
            const data = { allowedBonusTypes, allowedStatusTypes };
            res.status(200).json({ status: 200, success: true, message: 'Allowed bonus types and statuses fetched successfully', data });
        } catch (error) {
            ErrorHandler.catchError(error, res);
        }
    }

    static async updateFestivalBonusByOfferId(req, res) {
        try {
            const { offerId } = req.params;
            await FestivalBonusController.validateAndFetchFestivalBonusByOfferId(offerId)
            const festivalBonusData = await FestivalBonusController.festivalBonusValidation(req.body, true);
            const updateFestivalBonus = await FestivalBonusRepository.updateFestivalBonusByOfferId(offerId, festivalBonusData);
            res.status(200).json({ status: 200, success: true, message: 'Festival bonus updated successfully', updateFestivalBonus });
        } catch (error) {
            ErrorHandler.catchError(error, res);
        }
    }

    static async deleteFestivalBonusByOfferId(req, res) {
        try {
            const { offerId } = req.params;
            await FestivalBonusController.validateAndFetchFestivalBonusByOfferId(offerId)
            const festivalBonus = await FestivalBonusRepository.deleteFestivalBonusByOfferId(offerId);
            res.status(200).json({ status: 200, success: true, message: 'Festival bonus deleted successfully', festivalBonus });
        } catch (error) {
            ErrorHandler.catchError(error, res);
        }
    }

    //Static Methods Only For This Class (Not To Be Used In Routes)
    static validBonusTypes = ['New User Bonus', 'Festival Bonus'];
    static validStatuses = ['Active', 'Deactive'];

    static async validateAndFetchFestivalBonusByOfferId(offerId) {
        if (!/^[0-9]{6}$/.test(offerId)) { throw new ValidationError('Invalid offerId format.'); }
        const festivalBonus = await FestivalBonusRepository.getFestivalBonusByOfferId(offerId);
        if (!festivalBonus) { throw new NotFoundError('FestivalBonus not found.'); }
        return festivalBonus;
    }

    static async festivalBonusValidation(data, isUpdate = false) {
        const { name, bonusType, startDate, endDate, deal, status } = data;
        const requiredFields = { name, bonusType, startDate, endDate, deal, status };
        const missingFields = Object.entries(requiredFields)
            .filter(([_, value]) => value === undefined || value === '')
            .map(([field]) => field.charAt(0).toUpperCase() + field.slice(1));
        if (missingFields.length > 0) { throw new NotFoundError(`Missing required fields: ${missingFields.join(', ')}`); }
        console.log(data);

        if (typeof name !== 'string') { throw new ValidationError('Name must be a string'); }
        if (typeof bonusType !== 'string') { throw new ValidationError('BonusType must be a string'); }
        if (typeof startDate !== 'string') { throw new ValidationError('StartDate must be a string'); }
        if (typeof endDate !== 'string') { throw new ValidationError('EndDate must be a string'); }
        if (typeof deal !== 'number') { throw new ValidationError('Deal must be a number'); }
        if (typeof status !== 'string') { throw new ValidationError('Status must be a string'); }

        const validBonusTypes = FestivalBonusController.validBonusTypes;
        if (!validBonusTypes.includes(bonusType)) { throw new ValidationError(`BonusType must be one of: ${validBonusTypes.join(', ')} without any space`); }

        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) { throw new ValidationError('StartDate and EndDate must be valid dates in ISO format'); }
        if (end < start) { throw new ValidationError('EndDate must be after StartDate'); }

        const validStatuses = FestivalBonusController.validStatuses;
        if (!validStatuses.includes(status)) { throw new ValidationError(`Status must be one of: ${validStatuses.join(', ')} without any space`); }
        
        data.name = name.trim();
        if (!isUpdate) {
            const existingBonus = await FestivalBonusRepository.checkDuplicateName(data.name);
            if (existingBonus && existingBonus.status === 'Active') {
                throw new ValidationError('A festival bonus with the same name already exists with Active status.');
            }
        }
        return data;
    }
}

export default FestivalBonusController;