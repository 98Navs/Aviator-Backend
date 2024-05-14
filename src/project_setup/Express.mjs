//src/project_setup/Express.js
import express from "express";
import cors from "cors";
import cookieParser from 'cookie-parser';
import UserRoutes from '../routes/UserRoutes.mjs';
import BankRoutes from '../routes/BankFileRoutes.mjs';

export default async function setupExpressApp() {
    const app = express();
    app.use(cookieParser());
    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: true, limit: '1mb' }));
    app.use(cors({
        credentials: true,
        origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002']
    }));

    app.use(express.static('src/public'));

    // Mount user routes
    app.use(UserRoutes);
    app.use(BankRoutes);

    // Start the server
    app.listen(process.env.PORT, () => {
        console.log('Server is running on port 8002');
    });

    return app;
}
