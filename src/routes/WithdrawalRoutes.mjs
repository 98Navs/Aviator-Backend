// src/routes/WithdrawalRoutes.mjs
import express from 'express';
import WithdrawalController from '../controllers/WithdrawalController.mjs';

const router = express.Router();

// POST /Route to create a new withdrawal request by userId and saveAs
router.post('/createWithdrawalByUserIdAndSaveAs/:userId/:saveAs', WithdrawalController.createWithdrawalByUserIdAndSaveAs);

// GET /Route to get all the withdrawals
router.get('/getAllWithdrawals', WithdrawalController.getAllWithdrawals);

// GET /Route to get a withdrawal by Id
router.get('/getWithdrawalById/:id', WithdrawalController.getWithdrawalById);

// PUT /Route to update a withdrawal by Id
router.put('/updateWithdrawalById/:id', WithdrawalController.updateWithdrawalById);

// DELET /Route to delete a withdrawal by Id
router.delete('/deleteWithdrawalById/:id', WithdrawalController.deleteWithdrawalById);

export default router;
