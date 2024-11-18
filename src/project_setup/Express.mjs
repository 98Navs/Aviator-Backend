//src/project_setup/Express.mjs
import express from "express";
import cors from "cors";
import cookieParser from 'cookie-parser';
//import SystemMonitoring from './SystemMonitoring.mjs';
import * as Routes from "../routes/AllRoutes.mjs";


export default async function setupExpressApp() {
    const app = express();
 //   const monitor = new SystemMonitoring(); 
    app.use(cookieParser());
    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: true, limit: '1mb' }));
    app.use(cors({ credentials: true, origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:5173', 'https://gamingadmin.vercel.app', 'http://localhost:1111', 'https://mobile-admin-live.vercel.app' ] }));
    app.use(express.static('src/public'));

  //  monitor.exposeMetrics(app);


    // Mount routes
    Object.values(Routes).forEach(route => app.use(route));

    // Start the server
    app.listen(process.env.PORT, () => { console.log('Server is running on port 8002'); });

    return app;
}
