// src/controllers/BettingController.mjs
import AmountSetupRepository from '../repositories/AmountSetupRepository.mjs';
import BettingRepository from '../repositories/BettingRepository.mjs';
import UserRepository from '../repositories/UserRepository.mjs'

class BettingController {
    static async createBetting(req, res) {
        try {
            const bettingData = await BettingController.bettingValidation(req.body);
            const betting = await BettingRepository.createBetting(bettingData);
            res.status(201).json({ status: 201, success: true, message: 'Betting created successfully', betting });
        } catch (error) {
            BettingController.catchError(error, res);
        }
    }

    static async getAllBetting(req, res) {
        try {
            const { gameId, search, startDate, endDate, pageNumber = 1, perpage = 10 } = req.query;
            const options = { page: Number(pageNumber), limit: Number(perpage) };
            const filterParams = { gameId, search, startDate, endDate };
            const betting = Object.keys(filterParams).length > 0 ?
                await BettingRepository.filterBetting(filterParams, options, req) :
                await BettingRepository.getAllBetting(options, req);
            if (betting.data.length === 0) { return res.status(404).json({ status: 404, success: false, message: 'No data found for the provided details.' }); }
            return res.status(200).json({ status: 200, success: true, message: 'Betting data fetched successfully', ...betting });
        } catch (error) {
            BettingController.catchError(error, res);
        }
    }
    
    static async getBettingByBettingId(req, res) {
        try {
            const { bettingId } = req.params;
            if (!/^[0-9]{6}$/.test(bettingId)) { throw new ValidationError('Invalid bettingId format.'); }
            const betting = await BettingRepository.getBettingByBettingId(bettingId);
            if (!betting) { throw new NotFoundError('Betting not found.'); }
            res.status(200).json({ status: 200, success: true, message: 'Bettings fetched successfully', betting });
        } catch (error) {
            BettingController.catchError(error, res);
        }
    }

    static async updateBettingById(req, res) {
        try {
            const { id } = req.params;
            await BettingController.validateAndFetchBettingById(id);
            const bettingData = await BettingController.bettingValidation(req.body);
            const betting = await BettingRepository.updateBettingById(id, bettingData);
            res.status(200).json({ status: 200, success: true, message: 'Betting updated successfully', betting });
        } catch (error) {
            BettingController.catchError(error, res);
        }
    }

    static async deleteBettingById(req, res) {
        try {
            const { id } = req.params;
            await BettingController.validateAndFetchBettingById(id);
            const betting = await BettingRepository.deleteBettingById(id);
            res.status(200).json({ status: 200, success: true, message: 'Betting deleted successfully', betting });
        } catch (error) {
            BettingController.catchError(error, res);
        }
    }

    // Static Methods Only For This Class (Not To Be Used In Routes)
    static async validateAndFetchBettingById(id) {
        if (!/^[0-9a-fA-F]{24}$/.test(id)) { throw new ValidationError('Invalid Id format.'); }
        const betting = await BettingRepository.getBettingById(id);
        if (!betting) { throw new NotFoundError('Betting not found.'); }
        return betting;
    }

    static async bettingValidation(data) {
        const { gameId, bettingId, userId, userName, amount, winAmount, status } = data;
        const requiredFields = { gameId, bettingId, userId, amount, status };
        const missingFields = Object.entries(requiredFields)
            .filter(([_, value]) => value === undefined || value === '')
            .map(([field]) => field.charAt(0).toUpperCase() + field.slice(1));
        if (missingFields.length > 0) { throw new ValidationError(`Missing required fields: ${missingFields.join(', ')}`); }

        if (typeof gameId !== 'string') { throw new ValidationError('GameId must be a string'); }
        if (typeof bettingId !== 'number' || !/^[0-9]{6}$/.test(bettingId)) { throw new ValidationError('BettingId must be a number of 6 digits'); }
        if (typeof userId !== 'number' || !/^[0-9]{6}$/.test(userId)) { throw new ValidationError('UserId must be a number of 6 digits'); }
        //if (typeof userName !== 'string') { throw new ValidationError('UserName must be a string'); }
        if (typeof amount !== 'number') { throw new ValidationError('Amount must be a number'); }
        if (typeof status !== 'string' ) { throw new ValidationError('Status must be a string'); }
        
        const validStatuses = ['BetApplied', 'BetCancelled', 'BetWon'];
        if (!validStatuses.includes(status)) { throw new ValidationError(`Bet Status must be one of: ${validStatuses.join(', ')}`); }
        
        const validMinimumAmount = await AmountSetupRepository.getAmountSetupBySettingName('Minimum Bet Amount');
        const validMaximumAmount = await AmountSetupRepository.getAmountSetupBySettingName('Maximum Bet Amount');
        if (!validMinimumAmount) { throw NotFoundError('Amount Setting with name :- "Minimum Bet Amount" not found'); }
        if (!validMaximumAmount) { throw NotFoundError('Amount Setting with name :- "Maximum Bet Amount" not found'); }
        if (amount <= parseInt(validMinimumAmount.value)) { throw new ValidationError(`Betting amount must be greater then Minimum Bet Amount: ${validMinimumAmount.value}`); }
        if (amount >= parseInt(validMaximumAmount.value)) { throw new ValidationError(`Betting amount must be greater then Minimum Bet Amount: ${validMaximumAmount.value}`); }

        const user = await UserRepository.getUserByUserId(userId);
        if (!user) { throw new NotFoundError(`User with this userId: ${userId} not found`); }
        data.userName = user.userName;
        if (status === 'BetApplied') { user.playedAmount += amount; }
        else if (status === 'BetCancelled') { user.playedAmount -= amount; }
        await user.save();

        return data ;
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

export default BettingController;
