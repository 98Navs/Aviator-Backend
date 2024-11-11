// src/routes/AvailableGamesRoutes.mjs
import express from 'express';
import AvailableGamesController from '../controllers/AvailableGamesController.mjs';

const router = express.Router();

// POST /Route to create a new Available Game
router.post('/createAvailableGame', AvailableGamesController.createAvailableGame);

// GET /Route to get all Available Games
router.get('/getAllAvailableGames', AvailableGamesController.getAllAvailableGames);

// GET /Route to get a specific Available Game by its ID
router.get('/getAvailableGameByGameId/:gameId', AvailableGamesController.getAvailableGameByGameId);

// GET /Route to get all allowed game status types
router.get('/getGameAllowedStatusTypes', AvailableGamesController.getGameAllowedStatusTypes);

// GET /Route to fetch all game names
router.get('/getAllGameNames', AvailableGamesController.getAllGameNames);

// PUT /Route to update a specific Available Game by its ID
router.put('/updateAvailableGameByGameId/:gameId', AvailableGamesController.updateAvailableGameByGameId);

// DELETE /Route to delete a specific Available Game by its ID
router.delete('/deleteAvailableGameByGameId/:gameId', AvailableGamesController.deleteAvailableGameByGameId);

export default router;
