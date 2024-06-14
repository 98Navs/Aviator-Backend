//src/routes/BettingRoutes.mjs
import express from 'express';
import DashboardController from '../controllers/DashboardController.mjs';
const router = express.Router();

// GET /Route to fetch dashboard stats 
router.get('/getDashboardStats', DashboardController.getDashboardStats);

// GET /Route to fetch dashboard betting graph 
router.get('/getGraphStats', DashboardController.getGraphStats);


export default router;   