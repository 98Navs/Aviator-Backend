// src/routes/WithdrawalRoutes.mjs
import express from 'express';
import WithdrawalController from '../controllers/WithdrawalController.mjs';

const router = express.Router();

router.post('/createWithdrawalByUserIdAndSaveAs/:userId/:saveAs', WithdrawalController.createWithdrawalByUserIdAndSaveAs);

router.get('/getAllWithdrawals', WithdrawalController.getAllWithdrawals);

router.get('/getWithdrawalById/:id', WithdrawalController.getWithdrawalById);

router.put('/updateWithdrawalByIdAndStatus/', WithdrawalController.updateWithdrawalByIdAndStatus);

router.delete('/deleteWithdrawalById/:id', WithdrawalController.deleteWithdrawalById);

export default router;
