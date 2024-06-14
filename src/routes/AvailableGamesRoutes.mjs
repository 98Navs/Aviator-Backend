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
router.get('/getAvailableGamesByGameId/:gameId', AvailableGamesController.getAvailableGamesByGameId);

// GET /Route to get all allowed status types
router.get('/getAllowedStatusTypes', AvailableGamesController.getAllowedStatusTypes);

// GET /Route to fetch all game names
router.get('/getAllGameNames', AvailableGamesController.getAllGameNames);

// PUT /Route to update a specific Available Game by its ID
router.put('/updateAvailableGameByGameId/:gameId', uploadImages.array('images', 9999999999), AvailableGamesController.updateAvailableGameByGameId);

// DELETE /Route to delete a specific Available Game by its ID
router.delete('/deleteAvailableGameByGameId/:gameId', AvailableGamesController.deleteAvailableGameByGameId);

export default router;
