import express from 'express';
import RechargeController from '../controllers/RechargeController.mjs';
import {authMiddleware} from '../middleware/Authantication.mjs'
import { authAdminMiddleware } from '../middleware/Authorization.mjs'
const router = express.Router();

// POST /signUp - Create a new Rechage Mangement
router.post('/createRecharge/:id', authMiddleware, RechargeController.createRecharge);

// GET /users - Get all Recharge
router.get('/getRechargeList', authAdminMiddleware, RechargeController.getAllRecharge);

// GET /users/:id - Get a Recharge by ID
router.post('/rechargeStatus/:id', authAdminMiddleware, RechargeController.changeStatus);

// get  -- downloads the file into excel file.
router.get('/downloadData', RechargeController.downloadData);

// Add BankAccount Details in the User's Model
router.post('/addBankAccount', authMiddleware, RechargeController.createBankAccount);

// deleted the BnakAccount details in the user's Model

router.get('/deleteBankDetails/:id', authMiddleware, RechargeController.deleteBankDetails)

export default router;