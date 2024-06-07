// src/controllers/AvailableGamesController.mjs
import AvailableGamesRepository from "../repositories/AvailableGamesRepository.mjs";
import { ErrorHandler, ValidationError, NotFoundError } from '../controllers/ErrorHandler.mjs'

class AvailableGamesController {
    static async createAvailableGame(req, res) {
        try {
            const availableGamesData = await AvailableGamesController.availableGamesValidation(req);
            const availableGames = await AvailableGamesRepository.createAvailableGames(availableGamesData);
            res.status(201).json({ status: 201, success: true, message: 'Available games created successfully', availableGames });
        } catch (error) {
            ErrorHandler.catchError(error, res);
        }
    }

    static async getAllAvailableGames(req, res) {
        try {
            const { pageNumber = 1, perpage = 10 } = req.query;
            const options = { page: Number(pageNumber), limit: Number(perpage) };
            const availableGames = await AvailableGamesRepository.getAllAvailableGames(options, req);
            res.status(200).json({ status: 200, success: true, message: 'Available games fetched successfully', ...availableGames });
        } catch (error) {
            ErrorHandler.catchError(error, res);
        }
    }

    static async getAvailableGamesById(req, res) {
        try {
            const { id } = req.params;
            const availableGames = await AvailableGamesController.validateAndFetchAvailableGameById(id);
            res.status(200).json({ status: 200, success: true, message: 'Available game fetched successfully', availableGames });
        } catch (error) {
            ErrorHandler.catchError(error, res);
        }
    }

    static async updateAvailableGameById(req, res) {
        try {
            const { id } = req.params;
            await AvailableGamesController.validateAndFetchAvailableGameById(id);
            const availableGamesData = await AvailableGamesController.availableGamesValidation(req, true);
            const updatedAvailableGames = await AvailableGamesRepository.updateAvailableGamesById(id, availableGamesData);
            res.status(200).json({ status: 200, success: true, message: 'Available game updated successfully', updatedAvailableGames });
        } catch (error) {
            ErrorHandler.catchError(error, res);
        }
    }

    static async deleteAvailableGameById(req, res) {
        try {
            const { id } = req.params;
            const availableGames = await AvailableGamesController.validateAndFetchAvailableGameById(id);
            const deletedAvailableGames = await AvailableGamesRepository.deleteAvailableGamesById(id, availableGames);
            res.status(200).json({ status: 200, success: true, message: 'Available game deleted successfully', deletedAvailableGames });
        } catch (error) {
            ErrorHandler.catchError(error, res);
        }
    }

    //Static Methods Only For This Class (Not To Be Used In Routes)
    static async validateAndFetchAvailableGameById(id) {
        if (!/^[0-9a-fA-F]{24}$/.test(id)) { throw new ValidationError('Invalid Id format.'); }
        const availableGames = await AvailableGamesRepository.getAvailableGamesById(id);
        if (!availableGames) { throw new NotFoundError('Available game not found.'); }
        return availableGames;
    }

    static async availableGamesValidation(data, isUpdate = false) {
        const { name, status } = data.body;
        const images = data.files;

        const requiredFields = { name, status };
        const missingFields = Object.entries(requiredFields)
            .filter(([_, value]) => value === undefined || value === '')
            .map(([field]) => field.charAt(0).toUpperCase() + field.slice(1));
        if (missingFields.length > 0) { throw new NotFoundError(`Missing required fields: ${missingFields.join(', ')}`); }

        if (typeof name !== 'string') { throw new ValidationError('Name must be a string'); }
        if (typeof status !== 'string') { throw new ValidationError('Status must be a string'); }
        
        const validStatuses = ['Active', 'Deactive'];
        if (!validStatuses.includes(status)) { throw new ValidationError(`Status must be one of: ${validStatuses.join(', ')} without any space`); } 
        if (images.length === 0 || images.length > 5) { throw new ValidationError('Atleast one image is required and maximum 5 images, key is images.'); }

        const imageFilenames = images.map(image => image.filename);
        const availableGamesData = { name: name.trim(), status, images: imageFilenames };

        if (!isUpdate) {
            const existingName = await AvailableGamesRepository.checkDuplicateGameName(availableGamesData.name);
            if (existingName && existingName.status === 'Active') { throw new ValidationError('A game with Active status for this name already exists.'); }
        }
        
        return availableGamesData;
    }
}

export default AvailableGamesController;