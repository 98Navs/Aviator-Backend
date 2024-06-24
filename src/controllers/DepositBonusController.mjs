// src/controllers/DepositBonusController.mjs
import DepositBonusRepository from '../repositories/DepositBonusRepository.mjs';
import { CommonHandler, ValidationError, NotFoundError } from './CommonHandler.mjs';
//import { redis } from '../project_setup/Utils.mjs';

class DepositBonusController {
    static async createDepositBonus(req, res) {
        try {
            const depositBonusData = await DepositBonusController.depositBonusValidation(req.body);
            const depositBonus = await DepositBonusRepository.createDepositBonus(depositBonusData);
            //await DepositBonusController.invalidateAllDepositBonusesCache();
            return res.status(201).json({ status: 201, success: true, message: 'Deposit bonus created successfully', depositBonus });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async getAllDepositBonuses(req, res) {
        try {
            const { search, startDate, endDate, pageNumber = 1, perpage = 10 } = req.query;
            
            // const cacheKey = `depositBonuses:${search || ''}:${startDate || ''}:${endDate || ''}:${pageNumber}:${perpage}`;
            // const cachedData = await redis.get(cacheKey);
            // if (cachedData) {
            //     const depositBonuses = JSON.parse(cachedData);
            //     return res.status(200).json({ status: 200, success: true, message: 'Deposit bonuses retrieved from cache.', ...depositBonuses });
            // }
            
            const options = { page: Number(pageNumber), limit: Number(perpage) };
            const filterParams = { search, startDate, endDate };
            const depositBonuses = Object.values(filterParams).some(Boolean) ?
                await DepositBonusRepository.filterDepositBonuses(filterParams, options, req) : 
                await DepositBonusRepository.getAllDepositBonuses(options, req);
           // await redis.setex(cacheKey, 2592000, JSON.stringify(depositBonuses));
            return res.status(200).json({ status: 200, success: true, message: 'Deposit bonuses retrieved from database', ...depositBonuses });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

 
    static async getDepositBonusByOfferId(req, res) {
        try {
            const { offerId } = req.params;
            
            // const cacheKey = `depositBonus:${offerId}`;
            // const cachedData = await redis.get(cacheKey);
            // if (cachedData) {
            //     const depositBonus = JSON.parse(cachedData);
            //     return res.status(200).json({ status: 200, success: true, message: 'Deposit bonus retrieved from cache.', depositBonus });
            // }

            const depositBonus = await DepositBonusController.validateAndFetchDepositBonusByOfferId(offerId);
            //await redis.setex(cacheKey, 2592000, JSON.stringify(depositBonus));
            return res.status(200).json({ status: 200, success: true, message: 'Deposit bonuses retrieved from database', depositBonus });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async getDepositAllowedStatusTypes(req, res) {
        try {
            const allowedStatusTypes = CommonHandler.validStatuses;
            res.status(200).json({ status: 200, success: true, message: 'Allowed bonus types and statuses fetched successfully', data: {  allowedStatusTypes } });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async updateDepositBonusByOfferId(req, res) {
        try {
            const { offerId } = req.params;
            await DepositBonusController.validateAndFetchDepositBonusByOfferId(offerId);
            const depositBonusData = await DepositBonusController.depositBonusValidation(req.body, true);
            const depositBonus = await DepositBonusRepository.updateDepositBonusByOfferId(offerId, depositBonusData);
            //await redis.del(`depositBonus:${offerId}`);
            //await DepositBonusController.invalidateAllDepositBonusesCache();
            return res.status(200).json({ status: 200, success: true, message: 'Deposit bonus updated successfully', depositBonus });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async deleteDepositBonusByOfferId(req, res) {
        try {
            const { offerId } = req.params;
            await DepositBonusController.validateAndFetchDepositBonusByOfferId(offerId);
            const depositBonus = await DepositBonusRepository.deleteDepositBonusByOfferId(offerId);
            //await redis.del(`depositBonus:${offerId}`);
            //await DepositBonusController.invalidateAllDepositBonusesCache();
            return res.status(200).json({ status: 200, success: true, message: 'Deposit bonus deleted successfully', depositBonus });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    // Static Methods Only For This Class (Not To Be Used In Routes)
    static async validateAndFetchDepositBonusByOfferId(offerId) {
        await CommonHandler.validateSixDigitIdFormat(offerId);
        const depositBonus = await DepositBonusRepository.getDepositBonusByOfferId(offerId);
        if (!depositBonus) throw new NotFoundError('DepositBonus not found.');
        return depositBonus;
    }

    // static async invalidateAllDepositBonusesCache() {
    //     const keys = await redis.keys('depositBonuses:*');
    //     if (keys.length > 0) { await redis.del(keys); }
    // }

    static async depositBonusValidation(data, isUpdate = false) {
        const { amount, startDate, endDate, deal, status } = data;
        await CommonHandler.validateRequiredFields({ amount, startDate, endDate, deal, status });

        if (typeof amount !== 'number') throw new ValidationError('Amount must be a number');
        if (typeof startDate !== 'string') throw new ValidationError('StartDate must be a string');
        if (typeof endDate !== 'string') throw new ValidationError('EndDate must be a string');
        if (typeof deal !== 'number') throw new ValidationError('Deal must be a number');
        if (typeof status !== 'string') throw new ValidationError('Status must be a string');

        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) throw new ValidationError('StartDate and EndDate must be valid dates in ISO format');
        if (end < start) throw new ValidationError('EndDate must be after StartDate');
        if (!CommonHandler.validStatuses.includes(status)) throw new ValidationError(`Status must be one of: ${CommonHandler.validStatuses.join(', ')}`);

        if (!isUpdate) {
            const existingBonus = await DepositBonusRepository.checkDuplicateAmount(amount);
            if (existingBonus && existingBonus.status === 'Active') throw new ValidationError('A deposit bonus with Active status for this amount already exists.');
        }

        return data;
    }
}
export default DepositBonusController;