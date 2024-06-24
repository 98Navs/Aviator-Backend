// src/routes/BankDetailsRoutes.mjs
import express from 'express';
import BankDetailsController from '../controllers/BankDetailsController.mjs';
import { uploadImages } from '../project_setup/Utils.mjs';

const router = express.Router();

router.post('/createBankDetails', uploadImages.single('barCode'), BankDetailsController.createBankDetails);

router.get('/getAdminBankDetails', BankDetailsController.getAdminBankDetails);

router.get('/getUserBankDetailsByUserId/:userId', BankDetailsController.getUserBankDetailsByUserId);

router.get('/getSaveAsByUserId/:userId', BankDetailsController.getSaveAsByUserId);

router.get('/getBankDetailsByUserIdAndSaveAs/:userId/:saveAs', BankDetailsController.getBankDetailsByUserIdAndSaveAs);

router.put('/updatePrimaryAccountByBankId/:bankId', BankDetailsController.updatePrimaryAccountByBankId);

router.put('/updateBankDetailsByUserIdAndSaveAs/:userId/:saveAs', uploadImages.single('barCode'), BankDetailsController.updateBankDetailsByUserIdAndSaveAs);

router.delete('/deleteBankDetailsByBankId/:bankId', BankDetailsController.deleteBankDetailsByBankId);

export default router;