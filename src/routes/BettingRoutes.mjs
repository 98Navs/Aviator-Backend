//src/routes/BettingRoutes.mjs
import express from 'express';
import BettingController from '../controllers/BettingController.mjs';

const router = express.Router();

// POST /Route to create a new Betting
router.post('/createBetting', BettingController.createBetting);

// GET /Route to get all Betting with pagination
router.get('/getAllBetting', BettingController.getAllBetting);

// GET /Route to get a latest Betting by its betting ID
router.get('/getDetailsForLatestBettingId', BettingController.getDetailsForLatestBettingId);

// GET /Route to get a latest Betting by its betting ID
router.post('/getDistributionWalletDetails', BettingController.getDistributionWalletDetails);

// PUT /Route to update a specific Betting by its ID
router.put('/updateBettingById/:id', BettingController.updateBettingById);

// DELETE /Route to delete a specific Betting by its ID
router.delete('/deleteBettingById/:id', BettingController.deleteBettingById);

export default router;   
