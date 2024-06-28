import UserRepository from "../repositories/UserRepository.mjs";
import BettingRepository from "../repositories/BettingRepository.mjs";
import StatementRepository from "../repositories/StatementRepository.mjs";
import { CommonHandler, ValidationError } from './CommonHandler.mjs'

class DashboardController {
    static async getDashboardStats(req, res) {
        try {
            const userStats = await UserRepository.getUserDashboardStats();
            const bettingStats = await BettingRepository.getBettingDashboardStats();
            const BonusWithdrawalRechargeStats = await StatementRepository.getDashboardStats();
            res.status(200).json({ status: 200, success: true, message: 'Dashboard stats fetched successfully', data: { userStats, bettingStats, BonusWithdrawalRechargeStats } });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async getGraphStats(req, res) {
        try {
            const { startDate, endDate } = req.query;
            if (!startDate || !endDate) { throw new ValidationError('Both startDate and endDate are required.'); }
            const [dailyStats, weeklyStats, monthlyStats, yearlyStats] = await BettingRepository.getGraphStats(startDate, endDate);
            const data = { dailyStats, weeklyStats, monthlyStats, yearlyStats };
            res.status(200).json({ status: 200, success: true, message: 'Graph stats fetched successfully', data });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

}
export default DashboardController;