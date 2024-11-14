// src/routes/AvailableGamesRoutes.mjs
import express from 'express';
import UploadCharactersController from '../controllers/UploadCharactersController.mjs';
import Middleware from '../project_setup/Middleware.mjs'

const router = express.Router();

// POST /Route to create a new Available Game
router.post('/createUploadCharacters', Middleware.admin, UploadCharactersController.createUploadCharacters);

// GET /Route to get all Available Games
router.get('/getAllUploadCharacters', Middleware.admin, UploadCharactersController.getAllUploadCharacters);

// GET /Route to get a specific Available Game by its ID
router.get('/getUploadCharactersByCharacterId/:characterId', Middleware.admin, UploadCharactersController.getUploadCharactersByCharacterId);

// GET /Route to fetch all game names
router.get('/getAllCharactersName', Middleware.admin, UploadCharactersController.getAllCharactersName);

// PUT /Route to update a specific Available Game by its ID
router.put('/updateUploadCharactersByCharacterId/:characterId', Middleware.admin, UploadCharactersController.updateUploadCharactersByCharacterId);

// DELETE /Route to delete a specific Available Game by its ID
router.delete('/deleteUploadCharactersByCharacterId/:characterId', Middleware.admin, UploadCharactersController.deleteUploadCharactersByCharacterId);

export default router;