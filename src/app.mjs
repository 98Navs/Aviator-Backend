//src/app.mjs
import express from 'express';
import connectToDatabase from './project_setup/Database.mjs';
import expressApp from './project_setup/Express.mjs';
import aviator from './game/Aviator.mjs'

const StartServer = async () => {
    const app = express();
    await connectToDatabase();
    await expressApp(app);
    //aviator(app); vinay

};

StartServer();
