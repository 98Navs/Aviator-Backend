import UserRepository from "../repositories/UserRepository.mjs";
import BettingRepository from "../repositories/BettingRepository.mjs";
import { CommonHandler, ValidationError } from './CommonHandler.mjs'

class DashboardController{
    static async getDashboardStats(req, res) {
        try {
            //user stats
            const [usersCreatedToday, totalUsers] = await Promise.all([UserRepository.countUsers({ createdAt: { $gte: new Date().setHours(0, 0, 0, 0) } }), UserRepository.countUsers({})]);
            const [todayAffiliates, totalAffiliates] = await Promise.all([UserRepository.countUsers({ role: 'affiliate', createdAt: { $gte: new Date().setHours(0, 0, 0, 0) } }), UserRepository.countUsers({ role: 'affiliate' })]);
            const userStats = { usersCreatedToday, totalUsers, todayAffiliates, totalAffiliates };
            //betting stats
            const bettingStats = await BettingRepository.getDashboardStats();
            res.status(200).json({ status: 200, success: true, message: 'Dashboard stats fetched successfully', data: { userStats, bettingStats } });
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