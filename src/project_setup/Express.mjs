//src/project_setup/Express.mjs
import express from "express";
import cors from "cors";
import cookieParser from 'cookie-parser';
import { UserRoutes, FestivalBonusRoutes, DepositBonusRoutes, BankFileRoutes, RechargeRoutes, WithdrawalRoutes, AmountSetupRoutes, BettingRoutes, BannerRoutes, AvailableGamesRoutes } from "../routes/AllRoutes.mjs";

export default async function setupExpressApp() {
    const app = express();
    app.use(cookieParser());
    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: true, limit: '1mb' }));
    app.use(cors({
        credentials: true,
        origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:5173']
    }));

    app.use(express.static('src/public'));

    // Mount user routes
    app.use(UserRoutes);
    app.use(BankFileRoutes);
    app.use(RechargeRoutes);
    app.use(FestivalBonusRoutes);
    app.use(DepositBonusRoutes);
    app.use(AmountSetupRoutes);
    app.use(WithdrawalRoutes);
    app.use(BettingRoutes);
    app.use(BannerRoutes);
    app.use(AvailableGamesRoutes);

    // Start the server
    app.listen(process.env.PORT, () => {
        console.log('Server is running on port 8002');
    });

    return app;
}
