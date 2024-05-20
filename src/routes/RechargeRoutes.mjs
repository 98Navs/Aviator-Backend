//src/routes/RechargeRoutes.mjs
import express from 'express';
import RechargeController from '../controllers/RechargeController.mjs';
import Middleware  from '../project_setup/Middleware.mjs'
const router = express.Router();

// POST /signUp - Create a new Rechage Mangement
router.post('/createRecharge/:id', Middleware.user, RechargeController.createRecharge);

// GET /users - Get all Recharge
router.get('/getRechargeList', Middleware.admin, RechargeController.getAllRecharge);

// GET /users/:id - Get a Recharge by ID
router.post('/rechargeStatus/:id', Middleware.admin, RechargeController.changeStatus);

// get  -- downloads the file into excel file.
router.get('/downloadData', RechargeController.downloadData);

// Add BankAccount Details in the User's Model
router.post('/addBankAccount', Middleware.user, RechargeController.createBankAccount);

// deleted the BnakAccount details in the user's Model

router.get('/deleteBankDetails/:id', Middleware.user, RechargeController.deleteBankDetails)

export default router;