// src/routes/WithdrawalRoutes.mjs
import express from 'express';
import WithdrawalController from '../controllers/WithdrawalController.mjs';

const router = express.Router();

// POST /Route to create a new withdrawal request by userId and saveAs
router.post('/createWithdrawalByUserIdAndSaveAs/:userId/:saveAs', WithdrawalController.createWithdrawalByUserIdAndSaveAs);

// GET /Route to get all the withdrawals
router.get('/getAllWithdrawals', WithdrawalController.getAllWithdrawals);

// GET /Route to get a withdrawal by withdrawalId
router.get('/getWithdrawalByWithdrawalId/:withdrawalId', WithdrawalController.getWithdrawalByWithdrawalId);

// PUT /Route to update a withdrawal by withdrawalId
router.put('/updateWithdrawalByWithdrawalId/:withdrawalId', WithdrawalController.updateWithdrawalByWithdrawalId);

// DELET /Route to delete a withdrawal by withdrawalId
router.delete('/deleteWithdrawalByWithdrawalId/:withdrawalId', WithdrawalController.deleteWithdrawalByWithdrawalId);

export default router;
