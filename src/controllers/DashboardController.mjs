import UserRepository from "../repositories/UserRepository.mjs";
import BettingRepository from "../repositories/BettingRepository.mjs";
import { CommonHandler } from './CommonHandler.mjs'

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
}
export default DashboardController;