//src/routes/DepositBonusRoutes.mjs
import express from 'express';
import AmountSetupController from '../controllers/AmountSetupController.mjs';

const router = express.Router();

// POST /Route to create a new Amount Setup
router.post('/createAmountSetup', AmountSetupController.createAmountSetup);

// GET /Route to get all Amount Setup with pagination
router.get('/getAllAmountSetup', AmountSetupController.getAllAmountSetup);

// GET /Route to get a specific Amount Setup by its offer ID
router.get('/getAmountSetupByOfferId/:offerId', AmountSetupController.getAmountSetupByOfferId);

// PUT /Route to update a specific Amount Setup by its offer ID
router.put('/updateAmountSetupByOfferId/:offerId', AmountSetupController.updateAmountSetupByOfferId);

// DELETE /Route to delete a specific Amount Setup by its offer ID
router.delete('/deleteAmountSetupByOfferId/:offerId', AmountSetupController.deleteAmountSetupByOfferId);

export default router;
