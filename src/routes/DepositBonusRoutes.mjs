//src/routes/DepositBonusRoutes.mjs
import express from 'express';
import DepositBonusController from '../controllers/DepositBonusController.mjs';

const router = express.Router();

// POST /Route to create a new Deposit bonus
router.post('/createDepositBonus', DepositBonusController.createDepositBonus);

// GET /Route to get all Deposit bonuses with pagination
router.get('/getAllDepositBonus', DepositBonusController.getAllDepositBonuses);

// GET /Route to get a specific Deposit bonus by its offer ID
router.get('/getDepositBonusByOfferId/:offerId', DepositBonusController.getDepositBonusByOfferId);

// PUT /Route to update a specific Deposit bonus by its offer ID
router.put('/updateDepositBonusByOfferId/:offerId', DepositBonusController.updateDepositBonusByOfferId);

// DELETE /Route to delete a specific Deposit bonus by its offer ID
router.delete('/deleteDepositBonusByOfferId/:offerId', DepositBonusController.deleteDepositBonusByOfferId);

export default router;
