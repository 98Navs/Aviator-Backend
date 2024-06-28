// src/controllers/FestivalBonusController.mjs
import FestivalBonusRepository from '../repositories/FestivalBonusRepository.mjs';
import UserRepository from '../repositories/UserRepository.mjs';
import StatementRepository from '../repositories/StatementRepository.mjs';
import { CommonHandler, ValidationError, NotFoundError } from './CommonHandler.mjs';

class FestivalBonusController {
    static async createFestivalBonus(req, res) {
        try {
            const festivalBonusData = await FestivalBonusController.festivalBonusValidation(req.body);
            const festivalBonus = await FestivalBonusRepository.createFestivalBonus(festivalBonusData);
            res.status(201).json({ status: 201, success: true, message: 'Festival bonus created successfully', festivalBonus });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async claimActiveFestivalBonusByUserIdAndOfferId(req, res) {
        try {
            const { userId, offerId } = req.params;
            const festivalBonus = await FestivalBonusRepository.getFestivalBonusByOfferId(offerId);
            if (!festivalBonus) { throw new NotFoundError(`Festival Bonus with offerId: ${offerId} does not exist`); }
            const user = await UserRepository.getUserByUserId(userId);
            if (!user) { throw new NotFoundError(`User with userId: ${userId} does not exist`); }
            user.bonusAmount += festivalBonus.deal;
            user.lifetimeBonusAmount += festivalBonus.deal;
            await user.save();

            const createFestivalBonusStatement = { userId: user.userId, message: `Hi,${user.userName} your claimed the festival bonus offerId: ${festivalBonus.offerId}`, amount: festivalBonus.deal, category: 'Festival Bonus', type: 'credit', status: festivalBonus.bonusType };
            await StatementRepository.createStatement(createFestivalBonusStatement);
            res.status(200).json({ status: 200, success: true, message: `Festival bonus of offerId:${offerId} claimed by ${user.userName} successfully`, data: createFestivalBonusStatement });
        } catch (error) {
            CommonHandler.catchError(error, res);
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
            res.status(200).json({ status: 200, success: true, message: 'All festival bonuses fetched successfully', ...festivalBonuses });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async getFestivalBonusByOfferId(req, res) {
        try {
            const { offerId } = req.params;
            const festivalBonus = await FestivalBonusController.validateAndFetchFestivalBonusByOfferId(offerId);
            res.status(200).json({ status: 200, success: true, message: 'Festival bonus fetched successfully', festivalBonus });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async getAllowedBonusAndStatusTypes(req, res) {
        try {
            const allowedBonusTypes = CommonHandler.validBonusTypes;
            const allowedStatusTypes = CommonHandler.validStatuses;
            res.status(200).json({ status: 200, success: true, message: 'Allowed bonus types and statuses fetched successfully', data: { allowedBonusTypes, allowedStatusTypes } });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async getActiveFestivalBonusesForToday(req, res) {
        try {
            const festivalBonuses = await FestivalBonusRepository.getActiveFestivalBonusesForToday();
            res.status(200).json({ status: 200, success: true, message: 'Active festival bonuses fetched successfully', festivalBonuses });
        } catch (error) {
            CommonHandler.catchError(error, res);
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
            CommonHandler.catchError(error, res);
        }
    }

    static async deleteFestivalBonusByOfferId(req, res) {
        try {
            const { offerId } = req.params;
            await FestivalBonusController.validateAndFetchFestivalBonusByOfferId(offerId)
            const festivalBonus = await FestivalBonusRepository.deleteFestivalBonusByOfferId(offerId);
            res.status(200).json({ status: 200, success: true, message: 'Festival bonus deleted successfully', festivalBonus });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    //Static Methods Only For This Class (Not To Be Used In Routes)
    static async validateAndFetchFestivalBonusByOfferId(offerId) {
        await CommonHandler.validateSixDigitIdFormat(offerId);
        const festivalBonus = await FestivalBonusRepository.getFestivalBonusByOfferId(offerId);
        if (!festivalBonus) { throw new NotFoundError('FestivalBonus not found.'); }
        return festivalBonus;
    }

    static async festivalBonusValidation(data, isUpdate = false) {
        const { name, bonusType, startDate, endDate, deal, status } = data;
        await CommonHandler.validateRequiredFields({ name, bonusType, startDate, endDate, deal, status });

        if (typeof name !== 'string') { throw new ValidationError('Name must be a string'); }
        if (typeof bonusType !== 'string') { throw new ValidationError('BonusType must be a string'); }
        if (typeof startDate !== 'string') { throw new ValidationError('StartDate must be a string'); }
        if (typeof endDate !== 'string') { throw new ValidationError('EndDate must be a string'); }
        if (typeof deal !== 'number') { throw new ValidationError('Deal must be a number'); }
        if (typeof status !== 'string') { throw new ValidationError('Status must be a string'); }

        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) { throw new ValidationError('StartDate and EndDate must be valid dates in ISO format'); }
        if (end < start) { throw new ValidationError('EndDate must be after StartDate'); }
        if (!CommonHandler.validBonusTypes.includes(bonusType)) { throw new ValidationError(`BonusType must be one of: ${CommonHandler.validBonusTypes.join(', ')} without any space`); }
        if (!CommonHandler.validStatuses.includes(status)) { throw new ValidationError(`Status must be one of: ${CommonHandler.validStatuses.join(', ')} without any space`); }

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