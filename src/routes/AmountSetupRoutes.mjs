//src/routes/AmountSetupRoutes.mjs
import express from 'express';
import AmountSetupController from '../controllers/AmountSetupController.mjs';

const router = express.Router();

// POST /Route to create a new Amount Setup
router.post('/createAmountSetup', AmountSetupController.createAmountSetup);

// GET /Route to get all Amount Setup with pagination
router.get('/getAllAmountSetup', AmountSetupController.getAllAmountSetup);

// GET /Route to get a specific Amount Setup by its id
router.get('/getAmountSetupById/:id', AmountSetupController.getAmountSetupById);

// PUT /Route to update a specific Amount Setup by its id
router.put('/updateAmountSetupById/:id', AmountSetupController.updateAmountSetupById);

// DELETE /Route to delete a specific Amount Setup by its id
router.delete('/deleteAmountSetupById/:id', AmountSetupController.deleteAmountSetupById);

export default router;