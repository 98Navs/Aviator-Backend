//src/routes/BettingRoutes.mjs
import express from 'express';
import DashboardController from '../controllers/DashboardController.mjs';
const router = express.Router();

// GET /Route to fetch dashboard stats 
router.get('/getDashboardStats', DashboardController.getDashboardStats);

export default router;   