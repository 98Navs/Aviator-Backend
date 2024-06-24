// src/routes/BankDetailsRoutes.mjs
import express from 'express';
import BankDetailsController from '../controllers/BankDetailsController.mjs';
import { uploadImages } from '../project_setup/Utils.mjs';

const router = express.Router();

// POST /Route to create new Bank details
router.post('/createBankdeatils', uploadImages.single('barCode'), BankDetailsController.createBankdeatils);

router.get('/getAdminBankDetails', BankDetailsController.getAdminBankDetails);

router.get('/getUserBankDetailsByUserId/:userId', BankDetailsController.getUserBankDetailsByUserId);

router.get('/getSaveAsByUserId/:userId', BankDetailsController.getSaveAsByUserId);

router.put('/updateBankDetailsByUserIdAndSaveAs/:userId/:saveAs', uploadImages.single('barCode'), BankDetailsController.updateBankDetailsByUserIdAndSaveAs);

router.put('/updatePrimaryAccount')


export default router;