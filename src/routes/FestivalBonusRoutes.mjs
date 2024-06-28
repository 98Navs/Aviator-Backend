//src/routes/FestivalBonusRoutes.mjs
import express from 'express';
import FestivalBonusController from '../controllers/FestivalBonusController.mjs';

const router = express.Router();

// POST /Route to create a new festival bonus
router.post('/createFestivalBonus', FestivalBonusController.createFestivalBonus);

// POST /Route to claim active festival bonus by using userId and offerId
router.post('/claimActiveFestivalBonusByUserIdAndOfferId/:userId/:offerId', FestivalBonusController.claimActiveFestivalBonusByUserIdAndOfferId)

// GET /Route to get all festival bonuses with pagination
router.get('/getAllFestivalBonuses', FestivalBonusController.getAllFestivalBonuses);

// GET /Route to get a specific festival bonus by its offerId
router.get('/getFestivalBonusByOfferId/:offerId', FestivalBonusController.getFestivalBonusByOfferId);

// GET /Route to get all allowed bonus and status types
router.get('/getAllowedBonusAndStatusTypes', FestivalBonusController.getAllowedBonusAndStatusTypes);

// Route to get active festival bonuses for today's date
router.get('/getActiveFestivalBonusesForToday', FestivalBonusController.getActiveFestivalBonusesForToday);

// PUT /Route to update a specific festival bonus by its offerId
router.put('/updateFestivalBonusByOfferId/:offerId', FestivalBonusController.updateFestivalBonusByOfferId);

// DELETE /Route to delete a specific festival bonus by its offerId
router.delete('/deleteFestivalBonusByOfferId/:offerId', FestivalBonusController.deleteFestivalBonusByOfferId);

export default router;
