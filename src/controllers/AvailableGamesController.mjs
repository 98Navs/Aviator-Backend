// src/controllers/AvailableGamesController.mjs
import AvailableGamesRepository from "../repositories/AvailableGamesRepository.mjs";
import { CommonHandler, ValidationError, NotFoundError } from './CommonHandler.mjs'

class AvailableGamesController {
    static async createAvailableGame(req, res) {
        try {
            const availableGamesData = await AvailableGamesController.availableGamesValidation(req.body);
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
            const gameNames = await AvailableGamesRepository.getAllAvailableGames(req);
            const data = gameNames.data.map(game => ({ name: game.name }));
            res.status(200).json({ status: 200, success: true, message: 'Game names fetched successfully', data });
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
            const availableGamesData = await AvailableGamesController.availableGamesValidation(req.body, true);
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
        await CommonHandler.validateSixDigitIdFormat(gameId);
        const availableGames = await AvailableGamesRepository.getAvailableGamesByGameId(gameId);
        if (!availableGames) { throw new NotFoundError('Available game not found.'); }
        return availableGames;
    }

    static async availableGamesValidation(data, isUpdate = false) {
        const { name, description, images, status } = data;

        await CommonHandler.validateRequiredFields({ name, description, images, status });

        if (typeof name !== 'string') { throw new ValidationError('Name must be a string'); }
        if (!isUpdate && await AvailableGamesRepository.checkDuplicateGameName(name)) { throw new ValidationError('A game with the same name already exists.'); }
        if (typeof description !== 'string') { throw new ValidationError('Description must be a string'); }
        if (typeof status !== 'string') { throw new ValidationError('Status must be a string'); }
        if (!CommonHandler.validStatusForGames.includes(status)) { throw new ValidationError(`Status must be one of: ${CommonHandler.validStatusForGames.join(', ')} without any space`); }

        if (!Array.isArray(images)) { throw new ValidationError('Images must be provided as an array'); }
        if (images.length === 0 || images.length > 5) { throw new ValidationError('At least one image is required, with a maximum of 5 images.'); }

        images.forEach((image, index) => { if (typeof image !== 'string' || !image.trim()) { throw new ValidationError(`Image at index ${index} must be a non-empty string`); } });

        Object.assign(data, {
            name: name.trim(),
            description: description.trim(),
            images: images.map(img => img.trim())
        });

        return data;
    }
}

export default AvailableGamesController;