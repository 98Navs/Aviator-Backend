// src/routes/BankDetailsRoutes.mjs
import express from 'express';
import BankDetailsController from '../controllers/BankDetailsController.mjs';
import { uploadImages } from '../project_setup/Utils.mjs';

const router = express.Router();

// POST /Route to create a new user bank details
router.post('/createBankDetails', uploadImages.single('barCode'), BankDetailsController.createBankDetails);

// GET /Route to get all admin bank details
router.get('/getAdminBankDetails', BankDetailsController.getAdminBankDetails);

// GET /Route to get bank details by bankId
router.get('/getBankDetailsByBankId/:bankId', BankDetailsController.getBankDetailsByBankId)

// GET /Route to get all user bank details by userId
router.get('/getUserBankDetailsByUserId/:userId', BankDetailsController.getUserBankDetailsByUserId);

// GET /Route to get all user banks saveAs by userId
router.get('/getSaveAsByUserId/:userId', BankDetailsController.getSaveAsByUserId);

// GET /Route to get all user banks details by userId and saveAs
router.get('/getBankDetailsByUserIdAndSaveAs/:userId/:saveAs', BankDetailsController.getBankDetailsByUserIdAndSaveAs);

// PUT /Route to update a primary account by bankId
router.put('/updatePrimaryAccountByBankId/:bankId', BankDetailsController.updatePrimaryAccountByBankId);

// PUT /Route to update a bank details by userId and saveAs
router.put('/updateBankDetailsByUserIdAndSaveAs/:userId/:saveAs', uploadImages.single('barCode'), BankDetailsController.updateBankDetailsByUserIdAndSaveAs);

// DELETE /Route to delete a specific bank details by bankId
router.delete('/deleteBankDetailsByBankId/:bankId', BankDetailsController.deleteBankDetailsByBankId);

export default router;