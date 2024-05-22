// src/controllers/FestivalBonusController.mjs
import FestivalBonusRepository from '../repositories/FestivalBonusRepository.mjs';

class FestivalBonusController {
    static async createFestivalBonus(req, res) {
        try {
            const festivalBonusData = await FestivalBonusController.festivalBonusValidation(req.body);
            const festivalBonus = await FestivalBonusRepository.createFestivalBonus(festivalBonusData);
            res.status(201).json({ status: 201, success: true, message: 'Festival bonus created successfully', festivalBonus });
        } catch (error) {
            FestivalBonusController.catchError(error, res);
        }
    }

    static async getAllFestivalBonuses(req, res) {
        try {
            const { pageNumber = 1, perpage = 10 } = req.query;
            const options = { page: Number(pageNumber), limit: Number(perpage) };
            const festivalBonuses = await FestivalBonusRepository.getAllFestivalBonuses(options, req);
            res.status(200).json({ status: 200, success: true, message: 'All festival bonuses fetched successfully', ...festivalBonuses });
        } catch (error) {
            FestivalBonusController.catchError(error, res);
        }
    }

    static async getFestivalBonusByOfferId(req, res) {
        try {
            const { offerId } = req.params;
            const festivalBonus = await FestivalBonusController.validateAndFetchFestivalBonusByOfferId(offerId);
            res.status(200).json({ status: 200, success: true, message: 'Festival bonus fetched successfully', festivalBonus });
        } catch (error) {
            FestivalBonusController.catchError(error, res);
        }
    }

    static async updateFestivalBonusByOfferId(req, res) {
        try {
            const { offerId } = req.params;
            await FestivalBonusController.validateAndFetchFestivalBonusByOfferId(offerId)
            const festivalBonusData = await FestivalBonusController.festivalBonusValidation(req.body, true);
            const festivalBonus = await FestivalBonusRepository.updateFestivalBonusByOfferId(offerId, festivalBonusData);
            res.status(200).json({ status: 200, success: true, message: 'Festival bonus updated successfully', festivalBonus });
        } catch (error) {
            FestivalBonusController.catchError(error, res);
        }
    }

    static async deleteFestivalBonusByOfferId(req, res) {
        try {
            const { offerId } = req.params;
            await FestivalBonusController.validateAndFetchFestivalBonusByOfferId(offerId)
            const festivalBonus = await FestivalBonusRepository.deleteFestivalBonusByOfferId(offerId);
            res.status(200).json({ status: 200, success: true, message: 'Festival bonus deleted successfully', festivalBonus });
        } catch (error) {
            FestivalBonusController.catchError(error, res);
        }
    }

    //Static Methods Only For This Class (Not To Be Used In Routes)
    static async catchError(error, res) {
        try {
            if (error instanceof ValidationError) { res.status(400).json({ status: 400, success: false, message: error.message }); }
            else if (error instanceof NotFoundError) { res.status(404).json({ status: 404, success: false, message: error.message }); }
            else { res.status(500).json({ status: 500, success: false, message: 'Internal server error.' }); }
        } catch (error) {
            res.status(500).json({ status: 500, success: false, message: 'Something unexpected has happened' });
        }
    }

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

    if (missingFields.length > 0) { throw new ValidationError(`Missing required fields: ${missingFields.join(', ')}`); }

    const validBonusTypes = ['New User Bonus', 'Festival Bonus'];
        if (!validBonusTypes.includes(bonusType)) { throw new ValidationError('BonusType must be one of: New User Bonus or Festival Bonus'); }

    const start = new Date(startDate);
    const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) { throw new ValidationError('StartDate and EndDate must be valid dates'); }
        if (end <= start) { throw new ValidationError('EndDate must be after StartDate'); }
        if (typeof deal !== 'number') { throw new ValidationError('Deal must be a number'); }

    const validStatuses = ['Active', 'Deactive'];
        if (!validStatuses.includes(status)) { throw new ValidationError('OfferStatus must be one of: Active or Deactive'); }

        if (!isUpdate) {
            const existingBonus = await FestivalBonusRepository.checkDuplicateName(name);
            if (existingBonus && existingBonus.status === 'Active') {
                throw new ValidationError('A festival bonus with this name already exists with Active status.');
            }
        }
    return requiredFields;
    }
    
}

class ValidationError extends Error { constructor(message) { super(message); this.name = 'ValidationError'; } }
class NotFoundError extends Error { constructor(message) { super(message); this.name = 'NotFoundError'; } }

export default FestivalBonusController;
