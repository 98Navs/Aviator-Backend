// src/controllers/AvailableGamesController.mjs
import AvailableGamesRepository from "../repositories/AvailableGamesRepository.mjs";
import { CommonHandler, ValidationError, NotFoundError } from './CommonHandler.mjs'

class AvailableGamesController {
    static async createAvailableGame(req, res) {
        try {
            const availableGamesData = await AvailableGamesController.availableGamesValidation(req);
            const availableGames = await AvailableGamesRepository.createAvailableGames(availableGamesData);
            res.status(201).json({ status: 201, success: true, message: 'Available games created successfully', availableGames });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async getAllAvailableGames(req, res) {
        try {
            const { search, pageNumber = 1, perpage = 10 } = req.query;
            const options = { page: Number(pageNumber), limit: Number(perpage) };
            const filterParams = { search };
            const availableGames = Object.keys(filterParams).length > 0 ?
                await AvailableGamesRepository.filterAvailableGames(filterParams, options, req) :
                await AvailableGamesRepository.getAllAvailableGames(options, req);
            res.status(200).json({ status: 200, success: true, message: 'Available games fetched successfully', ...availableGames });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async getAvailableGameByGameId(req, res) {
        try {
            const { gameId } = req.params;
            const availableGames = await AvailableGamesController.validateAndFetchAvailableGameByGameId(gameId);
            res.status(200).json({ status: 200, success: true, message: 'Available game fetched successfully', availableGames });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async getAllGameNames(req, res) {
        try {
            const gameNames = await AvailableGamesRepository.getAllGameNames();
            res.status(200).json({ status: 200, success: true, message: 'Game names fetched successfully', gameNames });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async getGameAllowedStatusTypes(req, res) {
        try {
            const allowedStatusTypes = CommonHandler.validStatusForGames;
            res.status(200).json({ status: 200, success: true, message: 'Allowed statuses fetched successfully', data: allowedStatusTypes });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async updateAvailableGameByGameId(req, res) {
        try {
            const { gameId } = req.params;
            await AvailableGamesController.validateAndFetchAvailableGameByGameId(gameId);
            const availableGamesData = await AvailableGamesController.availableGamesValidation(req, true);
            const updatedAvailableGames = await AvailableGamesRepository.updateAvailableGamesByGameId(gameId, availableGamesData);
            res.status(200).json({ status: 200, success: true, message: 'Available game updated successfully', updatedAvailableGames });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async deleteAvailableGameByGameId(req, res) {
        try {
            const { gameId } = req.params;
            const availableGames = await AvailableGamesController.validateAndFetchAvailableGameByGameId(gameId);
            const deletedAvailableGames = await AvailableGamesRepository.deleteAvailableGamesByGameId(gameId, availableGames);
            res.status(200).json({ status: 200, success: true, message: 'Available game deleted successfully', deletedAvailableGames });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    //Static Methods Only For This Class (Not To Be Used In Routes)
    static async validateAndFetchAvailableGameByGameId(gameId) {
        if (!/^[0-9]{6}$/.test(gameId)) { throw new ValidationError('Invalid GameId format.'); }
        const availableGames = await AvailableGamesRepository.getAvailableGamesByGameId(gameId);
        if (!availableGames) { throw new NotFoundError('Available game not found.'); }
        return availableGames;
    }

    static async availableGamesValidation(data, isUpdate = false) {
        const { name, status } = data.body;
        const images = data.files;

        await CommonHandler.validateRequiredFields({ name, status });

        if (typeof name !== 'string') { throw new ValidationError('Name must be a string'); }
        if (typeof status !== 'string') { throw new ValidationError('Status must be a string'); }
        if (!CommonHandler.validStatusForGames.includes(status)) { throw new ValidationError(`Status must be one of: ${CommonHandler.validStatusForGames.join(', ')} without any space`); }
        if (images.length === 0 || images.length > 5) { throw new ValidationError('Atleast one image is required and maximum 5 images, key is images.'); }

        data.body.name = name.trim();
        data.body.images = images.map(image => `${data.protocol}://${data.get('host')}/gameImages/${image.filename}`);

        if (!isUpdate) {
            const existingName = await AvailableGamesRepository.checkDuplicateGameName(data.body.name);
            if (existingName) { throw new ValidationError('A game with the same name already exists.'); }
        }
        return data.body;
    }
}

export default AvailableGamesController;