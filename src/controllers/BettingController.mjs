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

    static async getDetailsForLatestBettingId(req, res) {
        try {
            const { gameId, bettingId } = req.query;
            if (!gameId || !bettingId) throw new ValidationError('Provide both gameId and bettingId');
            if (!/^[0-9]{6}$/.test(bettingId)) { throw new ValidationError('Invalid bettingId format.'); }
            const { count, bettings } = await BettingRepository.getCountAndBetsByBettingId(gameId, bettingId);
            const totalAmount = bettings.reduce((total, bet) => total + bet.amount, 0);
            const data = { gameId, bettingId, count, totalAmount };
            res.status(200).json({ status: 200, success: true, message: 'Latest BettingId details fetched successfully', data });
        } catch (error) {
            BettingController.catchError(error, res);
        }
    }

    static startTime = 0;
    static async getDistributionWalletDetails(req, res) {
        try {
            if (req.body.reset === true) {
                const reset = await BettingRepository.getLatestBettingId();
                BettingController.startTime = reset.createdAt;
            }
            const bettings = await BettingRepository.getBetsAfterCreatedAt(BettingController.startTime);
            const totalAmount = bettings.reduce((total, bet) => total + bet.amount, 0);
            const totalWinAmount = bettings.reduce((total, bet) => total + bet.winAmount, 0);
            const profit = totalAmount - totalWinAmount;
            res.status(200).json({ status: 200, success: true, message: 'Distribution wallet details fetched successfully', profit });
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
        if (!betting) { throw new NotFoundError('Betting ID not found.'); }
        return betting;
    }

    static async bettingValidation(data) {
        const { gameId, bettingId, userId, amount, winAmount, status } = data;
        const requiredFields = ['gameId', 'bettingId', 'userId', 'amount', 'status'];
        const missingFields = requiredFields.filter(field => !data[field]);

        if (missingFields.length > 0) { throw new ValidationError(`Missing required fields: ${missingFields.map(field => field.charAt(0).toUpperCase() + field.slice(1)).join(', ')}`); }
        if (typeof gameId !== 'string') { throw new ValidationError('GameId must be a string'); }
        if (!/^\d{6}$/.test(bettingId)) { throw new ValidationError('BettingId must be a number of 6 digits'); }
        if (!/^\d{6}$/.test(userId)) { throw new ValidationError('UserId must be a number of 6 digits'); }
        if (typeof amount !== 'number') { throw new ValidationError('Amount must be a number'); }
        if (typeof status !== 'string') { throw new ValidationError('Status must be a string'); }

        const validStatuses = ['BetApplied', 'BetCancelled', 'BetWon'];
        if (!validStatuses.includes(status)) { throw new ValidationError(`Bet Status must be one of: ${validStatuses.join(', ')}`); }

        const [validMinimumAmount, validMaximumAmount] = await Promise.all([
            AmountSetupRepository.getAmountSetupBySettingName('Minimum Bet Amount'),
            AmountSetupRepository.getAmountSetupBySettingName('Maximum Bet Amount')
        ]);

        if (!validMinimumAmount || !validMaximumAmount) { throw new NotFoundError('One or both of the amount settings not found'); }

        const minAmount = parseInt(validMinimumAmount.value);
        const maxAmount = parseInt(validMaximumAmount.value);

        if (amount <= minAmount) { throw new ValidationError(`Betting amount must be greater than Minimum Bet Amount: ${minAmount}`); }
        if (amount >= maxAmount) { throw new ValidationError(`Betting amount must be less than Maximum Bet Amount: ${maxAmount}`); }

        const user = await UserRepository.getUserByUserId(userId);
        if (!user) { throw new NotFoundError(`User with userId: ${userId} not found`); }
        data.userName = user.userName;

        switch (status) {
            case 'BetApplied':
                BettingController.deductUserAmount(user, amount);
                break;
            case 'BetCancelled':
                user.depositAmount += amount;
                data.amount = 0;
                break;
            case 'BetWon':
                user.winningsAmount += winAmount;
                break;
            default:
                throw new ValidationError('Bet Status must be one of: BetApplied, BetCancelled, BetWon');
        }

        await user.save();
        return data;
    }

    static deductUserAmount(user, amount) {
        const deductionDetails = ['depositAmount', 'winningsAmount', 'bonusAmount', 'commissionAmount'];
        let remainingAmount = amount;
        const totalAvailable = deductionDetails.reduce((sum, source) => sum + user[source], 0);

        for (const source of deductionDetails) {
            if (user[source] >= remainingAmount) {
                user[source] -= remainingAmount;
                return;
            } else {
                remainingAmount -= user[source];
                user[source] = 0;
            }
        }
        if (remainingAmount > 0) { throw new ValidationError(`User with userId ${user.userId} does not have the available amount: ${totalAvailable} (required: ${amount}).`); }
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
