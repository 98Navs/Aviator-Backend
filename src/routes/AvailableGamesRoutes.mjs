// src/routes/AvailableGamesRoutes.mjs
import express from 'express';
import AvailableGamesController from '../controllers/AvailableGamesController.mjs';
import { uploadImages } from '../project_setup/Utils.mjs';

const router = express.Router();

// POST /Route to create a new Available Game
router.post('/createAvailableGame', uploadImages.array('images', 9999999999), AvailableGamesController.createAvailableGame);

// GET /Route to get all Available Games
router.get('/getAllAvailableGames', AvailableGamesController.getAllAvailableGames);

// GET /Route to get a specific Available Game by its ID
router.get('/getAvailableGamesById/:id', AvailableGamesController.getAvailableGamesById);

// PUT /Route to update a specific Available Game by its ID
router.put('/updateAvailableGameById/:id', uploadImages.array('images', 9999999999), AvailableGamesController.updateAvailableGameById);

// DELETE /Route to delete a specific Available Game by its ID
router.delete('/deleteAvailableGameById/:id', AvailableGamesController.deleteAvailableGameById);

export default router;
