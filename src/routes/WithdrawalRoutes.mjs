import express from 'express';
import WithdrawalController from '../controllers/WithdrawalController.mjs';
import Middleware from '../project_setup/Middleware.mjs';
const router = express.Router();

// POST /Create - Create a new Withdrawal Mangement
router.post('/createWithdrawal', Middleware.user, WithdrawalController.createWithdrawal);

// GET /all - Get all Withdrawal
router.get('/withdrawalList', Middleware.admin, WithdrawalController.getAllWithdrawal);

// - Post a Withdrawal by ID
router.post('/withdrawalStatus/:id', Middleware.admin, WithdrawalController.changeStatus);

// get  -- downloads the file into excel file.
router.get('/withdrawal/downloadData', WithdrawalController.downloadData);



export default router;