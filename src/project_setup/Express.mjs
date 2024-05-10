//src/express/Express.js
import express from "express";
import cors from "cors";
import cookieParser from 'cookie-parser';


export default async function setupExpressApp(app) {
    app.use(cookieParser());
    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: true, limit: '1mb' }));
    app.use(cors({
        credentials: true,
        origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002']
    }));

    app.use(express.static('src/public'));
}
