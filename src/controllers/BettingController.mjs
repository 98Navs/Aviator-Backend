// src/controllers/BettingController.mjs
import AmountSetupRepository from '../repositories/AmountSetupRepository.mjs';
import AvailableGamesRepository from '../repositories/AvailableGamesRepository.mjs';
import BettingRepository from '../repositories/BettingRepository.mjs';
import UserRepository from '../repositories/UserRepository.mjs'
import StatementRepository from '../repositories/StatementRepository.mjs';
import { CommonHandler, ValidationError, NotFoundError } from './CommonHandler.mjs'

class BettingController {
    static async createBetting(req, res) {
        try {
            const bettingData = await BettingController.bettingValidation(req.body);
            const betting = await BettingRepository.createBetting(bettingData);
            res.status(201).json({ status: 201, success: true, message: 'Betting created successfully', betting });
        } catch (error) {
            CommonHandler.catchError(error, res);
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
            return res.status(200).json({ status: 200, success: true, message: 'Betting data fetched successfully', ...betting });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async getDetailsForLatestBettingId(req, res) {
        try {
            const { gameId, bettingId } = req.query;
            if (!gameId || !bettingId) throw new NotFoundError('Provide both gameId and bettingId');
            if (!/^[0-9]{6}$/.test(bettingId)) { throw new ValidationError('Invalid bettingId format.'); }
            const { count, bettings } = await BettingRepository.getCountAndBetsByBettingId(gameId, bettingId);
            const totalAmount = bettings.reduce((total, bet) => total + bet.amount, 0);
            const data = { gameId, bettingId, count, totalAmount };
            res.status(200).json({ status: 200, success: true, message: 'Latest BettingId details fetched successfully', data });
        } catch (error) {
            CommonHandler.catchError(error, res);
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
            CommonHandler.catchError(error, res);
        }
    }

    static async getBettingsStats(req, res) {
        try {
            const { gameName } = req.query;
            const gameData = await AvailableGamesRepository.getAvailableGamesByGameName(gameName);
            const gameId = gameData ? Number(gameData.gameId) : null;
            const data = await BettingRepository.getBettingsStats(gameId);
            res.status(200).json({ status: 200, success: true, message: 'Total stats fetched successfully', data });
        } catch (error) {
            CommonHandler.catchError(error, res);
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
            CommonHandler.catchError(error, res);
        }
    }

    static async deleteBettingById(req, res) {
        try {
            const { id } = req.params;
            await BettingController.validateAndFetchBettingById(id);
            const betting = await BettingRepository.deleteBettingById(id);
            res.status(200).json({ status: 200, success: true, message: 'Betting deleted successfully', betting });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    // Static Methods Only For This Class (Not To Be Used In Routes)
    static async validateAndFetchBettingById(id) {
        await CommonHandler.validateObjectIdFormat(id);
        const betting = await BettingRepository.getBettingById(id);
        if (!betting) { throw new NotFoundError('Betting ID not found.'); }
        return betting;
    }

    static async bettingValidation(data) {

        const { gameId, bettingId, userId, amount, winAmount, status } = data;
        await CommonHandler.validateRequiredFields({ gameId, bettingId, userId, amount, winAmount, status });
        await BettingController.validateFieldTypes({ gameId, bettingId, userId, amount, winAmount, status });

        const [minAmount, maxAmount] = await BettingController.getBettingLimits();
        await BettingController.validateBettingAmount(amount, minAmount, maxAmount);

        const user = await UserRepository.getUserByUserId(userId);
        if (!user) { throw new NotFoundError(`User with userId: ${userId} not found`); }
        data.userName = user.userName;

        const referenceUser = await UserRepository.getUserByPromoCode(user.referenceCode);

        const gameDetails = await AvailableGamesRepository.getAvailableGamesByGameId(gameId)

        if (!gameDetails) { throw new NotFoundError(`Game with this gameId: ${gameId} not found`); }
        data.gameName = gameDetails.name;
        console.log(data);

        if (!user.playedGame.includes(gameDetails.name)) { user.playedGame.push(gameDetails.name); }
        await BettingController.processBettingStatus(user, referenceUser, amount, winAmount, status, data);

        
        await user.save();

        return data;
    }

    static async processBettingStatus(user, referenceUser, amount, winAmount, status, data) {
        switch (status) {
            case 'BetApplied':
                await BettingController.deductUserAmount(user, amount);
                await BettingController.updateReferenceUser(referenceUser, amount, 'add');
                user.playedAmount += amount; 
                user.lifetimeLoss += amount;

                const createBetAppliedStatement = { userId: user.userId, message: `Hi,${user.userName} you have placed a bet in ${data.gameName} with bettingId: ${data.bettingId}`, amount: amount, category: 'Game', type: 'Debit', status: status };
                await StatementRepository.createStatement(createBetAppliedStatement);

                break;
            case 'BetCancelled':
                user.depositAmount += amount;
                user.playedAmount -= amount;
                user.lifetimeLoss -= amount
                await BettingController.updateReferenceUser(referenceUser, amount, 'subtract');
                data.amount = 0;

                const createBetCancelledStatement = { userId: user.userId, message: `Hi,${user.userName} you have cancelled a bet in ${data.gameName} with bettingId: ${data.bettingId}`, amount: amount, category: 'Game', type: 'Credit', status: status };
                await StatementRepository.createStatement(createBetCancelledStatement);
                break;
            case 'BetWon':
                user.winningsAmount += winAmount;
                user.lifetimeProfit += winAmount;
                await BettingController.updateReferenceUser(referenceUser, amount, 'subtract');

                const createBetWonStatement = { userId: user.userId, message: `Hi,${user.userName} you have won a bet while playing ${data.gameName} with bettingId: ${data.bettingId}`, amount: winAmount, category: 'Game', type: 'Credit', status: status };
                await StatementRepository.createStatement(createBetWonStatement);

                break;
            default:
                throw new ValidationError('Bet Status must be one of: BetApplied, BetCancelled, BetWon');
        }
    }

    static async updateReferenceUser(referenceUser, amount, operation) {
        if (referenceUser) {
            const updateCommission = (referenceUser.commissionPercentage * amount) / 100;
            referenceUser.commissionAmount += (operation === 'add' ? updateCommission : -updateCommission);
            await referenceUser.save();
        }
    }

    static async deductUserAmount(user, amount) {
        const deductionDetails = ['depositAmount', 'winningsAmount', 'bonusAmount', 'commissionAmount', 'referralAmount'];
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

    static async validateFieldTypes({ gameId, bettingId, userId, amount, winAmount, status }) {
        if (!/^\d{6}$/.test(gameId)) { throw new ValidationError('GameId must be a number of 6 digits'); }
        if (!/^\d{6}$/.test(bettingId)) { throw new ValidationError('BettingId must be a number of 6 digits'); }
        if (!/^\d{6}$/.test(userId)) { throw new ValidationError('UserId must be a number of 6 digits'); }
        if (typeof amount !== 'number') { throw new ValidationError('Amount must be a number'); }
        if (typeof winAmount !== 'number') { throw new ValidationError('WinAmount must be a number'); }
        if (typeof status !== 'string') { throw new ValidationError('Status must be a string'); }
    }

    static async getBettingLimits() {
        const [minAmountSetting, maxAmountSetting] = await Promise.all([
            AmountSetupRepository.getAmountSetupBySettingName('Minimum Bet Amount'),
            AmountSetupRepository.getAmountSetupBySettingName('Maximum Bet Amount')
        ]);
        if (!minAmountSetting || !maxAmountSetting) throw new NotFoundError('One or both of the amount settings not found for Minimum Bet Amount or Maximum Bet Amount ');
        return [parseInt(minAmountSetting.value), parseInt(maxAmountSetting.value)];
    }

    static async validateBettingAmount(amount, minAmount, maxAmount) {
        if (amount <= minAmount) throw new ValidationError(`Betting amount must be greater than Minimum Bet Amount: ${minAmount}`);
        if (amount >= maxAmount) throw new ValidationError(`Betting amount must be less than Maximum Bet Amount: ${maxAmount}`);
    }
}

export default BettingController;