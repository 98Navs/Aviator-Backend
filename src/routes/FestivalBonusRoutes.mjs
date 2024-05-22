//src/routes/FestivalBonusRoutes.mjs
import express from 'express';
import FestivalBonusController from '../controllers/FestivalBonusController.mjs';

const router = express.Router();

// POST /Route to create a new festival bonus
router.post('/createFestivalBonus', FestivalBonusController.createFestivalBonus);

// GET /Route to get all festival bonuses with pagination
router.get('/getAllFestivalBonus', FestivalBonusController.getAllFestivalBonuses);

// GET /Route to get a specific festival bonus by its offer ID
router.get('/getFestivalBonusByOfferId/:offerId', FestivalBonusController.getFestivalBonusByOfferId);

// PUT /Route to update a specific festival bonus by its offer ID
router.put('/updateFestivalBonusByOfferId/:offerId', FestivalBonusController.updateFestivalBonusByOfferId);

// DELETE /Route to delete a specific festival bonus by its offer ID
router.delete('/deleteFestivalBonusByOfferId/:offerId', FestivalBonusController.deleteFestivalBonusByOfferId);

export default router;
