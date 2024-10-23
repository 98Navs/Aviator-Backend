// src/routes/WithdrawalRoutes.mjs
import express from 'express';
import Middleware from '../project_setup/Middleware.mjs'
import WithdrawalController from '../controllers/WithdrawalController.mjs';

const router = express.Router();

// POST /Route to create a new withdrawal request by userId and saveAs
router.post('/createWithdrawal', Middleware.user, WithdrawalController.createWithdrawal);

// GET /Route to get all the withdrawals
router.get('/getAllWithdrawals', Middleware.admin, WithdrawalController.getAllWithdrawals);

// GET /Route to get a withdrawal by withdrawalId
router.get('/getWithdrawalByWithdrawalId/:withdrawalId', Middleware.admin, WithdrawalController.getWithdrawalByWithdrawalId);

// PUT /Route to update a withdrawal by withdrawalId
router.put('/updateWithdrawalByWithdrawalId/:withdrawalId', Middleware.admin, WithdrawalController.updateWithdrawalByWithdrawalId);

// DELET /Route to delete a withdrawal by withdrawalId
router.delete('/deleteWithdrawalByWithdrawalId/:withdrawalId', Middleware.admin, WithdrawalController.deleteWithdrawalByWithdrawalId);

export default router;
